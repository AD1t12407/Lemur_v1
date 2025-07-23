import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Building2, ChevronDown, Sparkles, Plus, Menu, X, FileText, ExternalLink } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../utils/cn';
import { ApiService, ChatResponse } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';
import { BrainContextSwitcher } from './BrainContextSwitcher';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  sources?: Array<{
    document_id: string;
    document_name: string;
    relevance_score: number;
    snippet: string;
  }>;
  isError?: boolean;
}

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messages: Message[];
  clientId?: number;
  clientName?: string;
}

interface ClientInfo {
  client_id: number;
  client_name: string;
}

const BrainChatInterface = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState<'all' | 'client'>('all');
  const [selectedClientId, setSelectedClientId] = useState<number | undefined>(undefined);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuthStore();
  const { error: showError } = useToastStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Load saved conversations from localStorage
    const savedConversations = localStorage.getItem('brain_conversations');
    if (savedConversations) {
      try {
        const parsed = JSON.parse(savedConversations);
        setConversations(parsed);
        if (parsed.length > 0 && !activeConversation) {
          setActiveConversation(parsed[0].id);
          setMessages(parsed[0].messages);
          // Set the mode based on the first conversation
          if (parsed[0].clientId !== undefined) {
            setSelectedMode('client');
            setSelectedClientId(parsed[0].clientId);
          }
        }
      } catch (e) {
        console.error('Failed to load conversations:', e);
      }
    }
  }, []);

  useEffect(() => {
    // Save conversations to localStorage whenever they change
    if (conversations.length > 0) {
      localStorage.setItem('brain_conversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  useEffect(() => {
    // Update messages when active conversation changes
    const conversation = conversations.find(c => c.id === activeConversation);
    if (conversation) {
      setMessages(conversation.messages);
      // Update the selected mode and client based on the conversation
      if (conversation.clientId !== undefined) {
        console.log('🔄 Setting mode to client for conversation:', conversation.clientId);
        setSelectedMode('client');
        setSelectedClientId(conversation.clientId);
      } else {
        console.log('🔄 Setting mode to all for conversation');
        setSelectedMode('all');
        setSelectedClientId(undefined);
      }
    }
  }, [activeConversation, conversations]);

  const handleSubmit = async () => {
    if (!inputValue.trim() || isTyping) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    // Clear input and set typing state immediately
    const currentInput = inputValue;
    setInputValue('');
    setIsTyping(true);

    // Update messages state immediately
    setMessages(prev => [...prev, newMessage]);

    try {
      // Call the appropriate chat endpoint
      const response: ChatResponse = selectedMode === 'client' && selectedClientId
        ? await ApiService.chatWithClientDocuments(currentInput, selectedClientId)
        : await ApiService.chatWithAllDocuments(currentInput);

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: response.response,
        sender: 'assistant',
        timestamp: new Date(),
        sources: response.sources
      };
      
      // Update messages with AI response
      setMessages(prev => [...prev, aiResponse]);
      
      // Update conversation with both messages at once
      setConversations(prev => prev.map(conv => 
        conv.id === activeConversation 
          ? { 
              ...conv, 
              messages: [...conv.messages, newMessage, aiResponse],
              lastMessage: response.response.substring(0, 50) + '...',
              timestamp: new Date()
            }
          : conv
      ));
    } catch (error: any) {
      console.error('Chat error:', error);
      showError('Chat Error', error.message || 'Failed to get response');
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        sender: 'assistant',
        timestamp: new Date(),
        isError: true
      };
      
      // Update messages with error message
      setMessages(prev => [...prev, errorMessage]);
      
      // Update conversation with user message and error message
      setConversations(prev => prev.map(conv => 
        conv.id === activeConversation 
          ? { 
              ...conv, 
              messages: [...conv.messages, newMessage, errorMessage],
              lastMessage: currentInput,
              timestamp: new Date()
            }
          : conv
      ));
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSelectionChange = (mode: 'all' | 'client', clientId?: number) => {
    console.log('🔄 Parent: Selection changed to', mode, clientId);
    
    // Update the state immediately
    setSelectedMode(mode);
    setSelectedClientId(clientId);
    
    // Update the current conversation's client info if there's an active conversation
    if (activeConversation) {
      setConversations(prev => prev.map(conv => 
        conv.id === activeConversation 
          ? { 
              ...conv, 
              clientId: mode === 'client' ? clientId : undefined,
              clientName: mode === 'client' && clientId ? `Client ${clientId}` : undefined
            }
          : conv
      ));
    }
  };

  const handleConversationSelect = (conversationId: string) => {
    setActiveConversation(conversationId);
    setSidebarOpen(false);
  };

  const handleNewChat = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'New Conversation',
      lastMessage: 'Start a new conversation...',
      timestamp: new Date(),
      messages: [{
        id: Date.now().toString(),
        content: 'Hello! I\'m your **Company Assistant**, ready to help you search through all company documents and knowledge. Ask me anything about your projects, meetings, or documents!',
        sender: 'assistant',
        timestamp: new Date()
      }],
      clientId: selectedMode === 'client' ? selectedClientId : undefined,
      clientName: selectedMode === 'client' && selectedClientId ? `Client ${selectedClientId}` : undefined
    };
    
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversation(newConversation.id);
    setSidebarOpen(false);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const deleteConversation = (conversationId: string) => {
    setConversations(prev => prev.filter(c => c.id !== conversationId));
    if (activeConversation === conversationId) {
      const remaining = conversations.filter(c => c.id !== conversationId);
      if (remaining.length > 0) {
        setActiveConversation(remaining[0].id);
      } else {
        setActiveConversation(null);
        setMessages([]);
      }
    }
  };

  const renderMessage = (message: Message) => {
    const parts = message.content.split(/(\*\*[^*]+\*\*)/g);
    
    return (
      <>
        <div className="prose prose-sm md:prose-base max-w-none">
          {parts.map((part, idx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={idx}>{part.slice(2, -2)}</strong>;
            }
            return <span key={idx}>{part}</span>;
          })}
        </div>
        
        {message.sources && message.sources.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Sources:</p>
            <div className="space-y-1">
              {message.sources.map((source, idx) => (
                <div 
                  key={idx} 
                  className="flex items-start gap-2 p-2 rounded-lg text-xs"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}
                >
                  <FileText className="h-3 w-3 mt-0.5 flex-shrink-0" style={{ color: 'var(--text-accent)' }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {source.document_name}
                    </p>
                    <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                      {source.snippet}
                    </p>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {Math.round(source.relevance_score * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </>
    );
  };

  const currentConversation = conversations.find(c => c.id === activeConversation);

  // Debug logging for the parent component state
  console.log('🔍 Parent Component State:', {
    selectedMode,
    selectedClientId,
    activeConversation,
    currentConversationClientId: currentConversation?.clientId
  });

  return (
    <div className="flex overflow-hidden" style={{ background: 'var(--bg-primary)', height: 'calc(100vh - 64px)' }}>
      {/* Mobile Hamburger Menu */}
      <button
        className="fixed top-20 left-4 z-20 md:hidden p-2 rounded-lg border"
        style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-primary)' }}
        onClick={() => setSidebarOpen(true)}
        aria-label="Open conversation list"
      >
        <Menu className="h-6 w-6" style={{ color: 'var(--text-primary)' }} />
      </button>

      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 z-30 bg-black/50" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed md:relative md:flex z-30 w-80 border-r flex-col transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
        style={{ 
          background: 'var(--bg-primary)',
          borderColor: 'var(--border-primary)',
          height: '100%'
        }}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b flex-shrink-0" style={{ borderColor: 'var(--border-primary)' }}>
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              Document Chat
            </h1>
            <button
              className="md:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close conversation list"
            >
              <X className="h-5 w-5" style={{ color: 'var(--text-primary)' }} />
            </button>
          </div>
          <button
            className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold shadow transition-all hover:scale-105 active:scale-95"
            style={{ background: 'var(--gradient-primary)', color: 'white' }}
            onClick={handleNewChat}
          >
            <Plus className="h-5 w-5" />
            New Conversation
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {conversations.length === 0 ? (
              <div className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>
                <p className="text-sm">No conversations yet</p>
                <p className="text-xs mt-2">Start a new conversation to begin</p>
              </div>
            ) : (
              conversations.map(conversation => (
                <div key={conversation.id} className="relative group">
                  <button
                    className={cn(
                      "w-full p-4 rounded-xl text-left transition-all hover:scale-105 border",
                      conversation.id === activeConversation
                        ? "border-blue-500 shadow-lg"
                        : "hover:shadow-md"
                    )}
                    style={{
                      background: conversation.id === activeConversation 
                        ? 'var(--bg-accent)' 
                        : 'var(--bg-secondary)',
                      borderColor: conversation.id === activeConversation 
                        ? 'var(--accent-primary)' 
                        : 'var(--border-primary)'
                    }}
                    onClick={() => handleConversationSelect(conversation.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg" style={{ background: 'var(--bg-accent)' }}>
                          <Building2 className="w-3 h-3" style={{ color: 'var(--text-accent)' }} />
                        </div>
                        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                          {conversation.clientName || 'All Documents'}
                        </span>
                      </div>
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {formatTime(new Date(conversation.timestamp))}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm mb-1 line-clamp-1" style={{ color: 'var(--text-primary)' }}>
                      {conversation.title}
                    </h3>
                    <p className="text-xs line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                      {conversation.lastMessage}
                    </p>
                  </button>
                  
                  {/* Delete button */}
                  <button
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded"
                    style={{ background: 'var(--bg-primary)' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conversation.id);
                    }}
                  >
                    <X className="h-4 w-4" style={{ color: 'var(--text-secondary)' }} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Chat Header with Client Selector */}
        <div className="p-4 md:p-6 border-b flex-shrink-0" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-primary)' }}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl" style={{ background: 'var(--gradient-primary)' }}>
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Company Assistant
                </h1>
                <p className="text-xs md:text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {currentConversation?.title || 'Chat with your documents'}
                </p>
              </div>
            </div>
            
            {/* Client Selector */}
            <div className="w-full md:w-80">
              <BrainContextSwitcher
                selectedMode={selectedMode}
                selectedClientId={selectedClientId}
                onSelectionChange={handleSelectionChange}
              />
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-3 md:space-y-6" style={{ background: 'var(--bg-secondary)' }}>
          {messages.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-secondary)' }} />
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                Start a conversation
              </h3>
              <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
                Ask questions about your documents, meetings, or any information stored in the company knowledge base.
              </p>
              <div className="mt-6 space-y-2 max-w-sm mx-auto">
                <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Example queries:</p>
                {[
                  "What are the key deliverables for Q1?",
                  "Summarize last week's client meeting",
                  "Find all action items assigned to me",
                  "What budget concerns were raised?"
                ].map((example, idx) => (
                  <button
                    key={idx}
                    className="block w-full text-left p-3 rounded-lg text-sm transition-all hover:scale-105"
                    style={{ 
                      background: 'var(--bg-primary)', 
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-primary)'
                    }}
                    onClick={() => setInputValue(example)}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-4 ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.sender === 'assistant' && (
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--gradient-primary)' }}>
                  <Building2 className="w-3 h-3 md:w-4 md:h-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-[85%] md:max-w-[80%] rounded-2xl px-3 md:px-4 py-2 md:py-3 ${
                  message.sender === 'user' ? '' : 'border'
                }`}
                style={{
                  background: message.sender === 'user' ? 'var(--gradient-primary)' : 'var(--bg-primary)',
                  color: message.sender === 'user' ? 'white' : 'var(--text-primary)',
                  borderColor: message.sender === 'user' ? 'transparent' : 'var(--border-primary)'
                }}
              >
                {renderMessage(message)}
                <div className="text-xs mt-1 md:mt-2 opacity-70">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              {message.sender === 'user' && (
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--gradient-primary)' }}>
                  <Building2 className="w-3 h-3 md:w-4 md:h-4 text-white" />
                </div>
              )}
            </div>
          ))}
          
          {isTyping && (
            <div className="flex items-start gap-3 md:gap-4">
              <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
                <Building2 className="w-3 h-3 md:w-4 md:h-4 text-white" />
              </div>
              <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                <div className="w-2 h-2 rounded-full opacity-70" style={{ background: 'var(--text-secondary)' }} />
                <div className="w-2 h-2 rounded-full opacity-50" style={{ background: 'var(--text-secondary)' }} />
                <div className="w-2 h-2 rounded-full opacity-30" style={{ background: 'var(--text-secondary)' }} />
                <span className="ml-2 text-xs md:text-sm">Searching documents...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t flex-shrink-0" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-primary)' }}>
          <div className="flex gap-3 items-end max-w-4xl mx-auto">
            <div className="flex-1">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask about your documents..."
                className="w-full px-4 py-3 rounded-xl border resize-none focus:outline-none focus:ring-2 transition-all"
                style={{
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  borderColor: 'var(--border-primary)',
                  minHeight: '44px',
                  maxHeight: '200px'
                }}
                rows={1}
                disabled={isTyping}
              />
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!inputValue.trim() || isTyping}
              className="mb-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <div className="text-xs text-center mt-1 md:mt-2" style={{ color: 'var(--text-secondary)' }}>
            <span className="hidden md:inline">Press Enter to send • Shift + Enter for new line</span>
            <span className="md:hidden">Press Enter to send</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrainChatInterface;