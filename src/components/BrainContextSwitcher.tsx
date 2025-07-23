import React, { useState, useEffect } from 'react';
import { Building, ChevronDown, FileText, Clock, Database, Folder } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';
import { ApiService } from '../services/api';
import { useAuthStore } from '../stores/authStore';

interface DocumentInfo {
  id: string;
  filename: string;
  client_name?: string;
  client_id?: number;
  upload_date?: string;
  file_size?: number;
  file_type?: string;
}

interface BrainContextSwitcherProps {
  selectedMode: 'all' | 'client';
  selectedClientId?: number;
  onSelectionChange: (mode: 'all' | 'client', clientId?: number) => void;
  className?: string;
}

export const BrainContextSwitcher: React.FC<BrainContextSwitcherProps> = ({
  selectedMode,
  selectedClientId,
  onSelectionChange,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load clients with detailed logging
      console.log('🔄 Starting to load clients...');
      const clientsResponse = await ApiService.getMyClients();
      console.log('📥 Full clients response:', clientsResponse);
      console.log('📥 Response type:', typeof clientsResponse);
      console.log('📥 Response keys:', Object.keys(clientsResponse || {}));
      
      // Try different possible response structures
      let clientsArray = [];
      if (clientsResponse?.clients) {
        clientsArray = clientsResponse.clients;
        console.log('✅ Found clients in response.clients:', clientsArray);
      } else if (Array.isArray(clientsResponse)) {
        clientsArray = clientsResponse;
        console.log('✅ Response is direct array:', clientsArray);
      } else if (clientsResponse?.data?.clients) {
        clientsArray = clientsResponse.data.clients;
        console.log('✅ Found clients in response.data.clients:', clientsArray);
      } else if (clientsResponse?.data && Array.isArray(clientsResponse.data)) {
        clientsArray = clientsResponse.data;
        console.log('✅ Found clients in response.data as array:', clientsArray);
      } else {
        console.log('❌ Could not find clients array in response structure');
        console.log('Available properties:', Object.keys(clientsResponse || {}));
      }
      
      setClients(clientsArray);
      console.log('💾 Set clients state:', clientsArray);
      
      // Load documents for each client
      console.log('🔄 Starting to load documents for clients...');
      const allDocs: DocumentInfo[] = [];
      
      for (const client of clientsArray) {
        console.log(`🔄 Loading documents for client:`, client);
        console.log(`🔄 Client ID: ${client.client_id}, Client Name: ${client.client_name}`);
        
        try {
          const docsResponse = await ApiService.getClientDocuments(client.client_id.toString());
          console.log(`📥 Documents response for client ${client.client_id}:`, docsResponse);
          console.log(`📥 Response type:`, typeof docsResponse);
          console.log(`📥 Response keys:`, Object.keys(docsResponse || {}));
          
          // Try different possible document response structures
          let documentsArray = [];
          if (docsResponse?.documents && Array.isArray(docsResponse.documents)) {
            documentsArray = docsResponse.documents;
            console.log(`✅ Found documents in response.documents:`, documentsArray);
          } else if (Array.isArray(docsResponse)) {
            documentsArray = docsResponse;
            console.log(`✅ Response is direct array:`, documentsArray);
          } else if (docsResponse?.data?.documents && Array.isArray(docsResponse.data.documents)) {
            documentsArray = docsResponse.data.documents;
            console.log(`✅ Found documents in response.data.documents:`, documentsArray);
          } else if (docsResponse?.data && Array.isArray(docsResponse.data)) {
            documentsArray = docsResponse.data;
            console.log(`✅ Found documents in response.data as array:`, documentsArray);
          } else {
            console.log(`❌ Could not find documents array for client ${client.client_id}`);
            console.log('Available properties:', Object.keys(docsResponse || {}));
          }
          
          if (documentsArray.length > 0) {
            const clientDocs = documentsArray.map((doc: any) => {
              console.log(`📄 Processing document:`, doc);
              return {
                id: doc.id || doc.document_id || `doc_${Math.random()}`,
                filename: doc.filename || doc.document_name || doc.name || 'Unnamed Document',
                client_name: client.client_name || client.name,
                client_id: client.client_id || client.id,
                upload_date: doc.upload_date || doc.created_at || doc.date,
                file_size: doc.file_size || doc.size,
                file_type: doc.file_type || doc.document_type || doc.type
              };
            });
            
            console.log(`✅ Processed ${clientDocs.length} documents for client ${client.client_id}:`, clientDocs);
            allDocs.push(...clientDocs);
          }
        } catch (error) {
          console.error(`❌ Failed to load documents for client ${client.client_id}:`, error);
          console.error('Error details:', error.response?.data || error.message);
        }
      }
      
      console.log(`💾 Setting documents state with ${allDocs.length} total documents:`, allDocs);
      setDocuments(allDocs);
      
    } catch (error) {
      console.error('❌ Failed to load data:', error);
      console.error('Error details:', error.response?.data || error.message);
    } finally {
      setIsLoading(false);
      console.log('✅ Loading complete');
    }
  };

  // Calculate current selection details
  const getCurrentSelection = () => {
    if (selectedMode === 'all') {
      return {
        name: 'All Company Documents',
        description: 'Search across all company documents and knowledge',
        documentCount: documents.length
      };
    } else {
      const selectedClient = clients.find(c => c.client_id === selectedClientId);
      const clientDocs = documents.filter(d => d.client_id === selectedClientId);
      
      return {
        name: selectedClient?.client_name || selectedClient?.name || 'Select Client',
        description: `Documents specific to ${selectedClient?.client_name || selectedClient?.name || 'selected client'}`,
        documentCount: clientDocs.length
      };
    }
  };

  const currentSelection = getCurrentSelection();
  const totalDocuments = documents.length;

  return (
    <div className={cn("relative", className)}>
      {/* Selected Mode Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-3 rounded-xl p-4 transition-all duration-200 hover:scale-[1.02]"
        style={{
          background: 'var(--glass-bg)',
          border: '1px solid var(--border-primary)',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="flex h-10 w-10 items-center justify-center rounded-lg"
            style={{
              background: selectedMode === 'all' 
                ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
                : 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
              color: 'white'
            }}
          >
            {selectedMode === 'all' ? <Building className="h-5 w-5" /> : <Folder className="h-5 w-5" />}
          </div>
          <div className="text-left">
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              {currentSelection.name}
            </p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {currentSelection.documentCount} documents
            </p>
          </div>
        </div>
        <ChevronDown 
          className={cn("h-5 w-5 transition-transform duration-200", isOpen && "rotate-180")} 
          style={{ color: 'var(--text-secondary)' }}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute left-0 right-0 z-50 mt-2 max-h-96 overflow-y-auto rounded-xl shadow-2xl ring-1 ring-black ring-opacity-5"
              style={{
                background: 'var(--bg-primary)',
                borderColor: 'var(--border-secondary)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)'
              }}
            >
              <div className="p-2">
                {isLoading ? (
                  <div className="p-4 text-center" style={{ color: 'var(--text-secondary)' }}>
                    Loading documents...
                  </div>
                ) : (
                  <>
                    {/* All Documents Option */}
                    <button
                      onClick={() => {
                        onSelectionChange('all');
                        setIsOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-start gap-4 rounded-lg p-4 text-left transition-all duration-200",
                        selectedMode === 'all' && "ring-2"
                      )}
                      style={{
                        background: selectedMode === 'all' ? 'var(--bg-accent)' : 'transparent',
                        ringColor: selectedMode === 'all' ? 'var(--border-accent)' : 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedMode !== 'all') {
                          e.currentTarget.style.background = 'var(--bg-secondary)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedMode !== 'all') {
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      <div 
                        className="flex h-12 w-12 items-center justify-center rounded-lg"
                        style={{
                          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                          color: 'white'
                        }}
                      >
                        <Building className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                            All Company Documents
                          </h3>
                          {selectedMode === 'all' && (
                            <div 
                              className="rounded-full px-2 py-1 text-xs font-medium"
                              style={{
                                background: 'var(--bg-accent)',
                                color: 'var(--text-accent)'
                              }}
                            >
                              Active
                            </div>
                          )}
                        </div>
                        <p className="mt-1 text-sm leading-5" style={{ color: 'var(--text-secondary)' }}>
                          Search across all company documents and knowledge
                        </p>
                        <div className="mt-3 flex items-center gap-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
                          <div className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {totalDocuments} documents
                          </div>
                          <div className="flex items-center gap-1">
                            <Folder className="h-3 w-3" />
                            {clients.length} clients
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Client Options */}
                    {clients.length > 0 && (
                      <>
                        <div className="my-2 px-4">
                          <div className="h-px" style={{ background: 'var(--border-secondary)' }} />
                        </div>
                        <div className="px-4 py-2">
                          <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                            Filter by Client
                          </p>
                        </div>
                      </>
                    )}

                    {clients.map((client) => {
                      const clientDocs = documents.filter(d => d.client_id === client.client_id);
                      const isSelected = selectedMode === 'client' && selectedClientId === client.client_id;
                      
                      return (
                        <button
                          key={client.client_id}
                          onClick={() => {
                            onSelectionChange('client', client.client_id);
                            setIsOpen(false);
                          }}
                          className={cn(
                            "flex w-full items-start gap-4 rounded-lg p-4 text-left transition-all duration-200",
                            isSelected && "ring-2"
                          )}
                          style={{
                            background: isSelected ? 'var(--bg-accent)' : 'transparent',
                            ringColor: isSelected ? 'var(--border-accent)' : 'transparent'
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.background = 'var(--bg-secondary)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.background = 'transparent';
                            }
                          }}
                        >
                          <div 
                            className="flex h-12 w-12 items-center justify-center rounded-lg"
                            style={{
                              background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
                              color: 'white'
                            }}
                          >
                            <Folder className="h-6 w-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                                {client.client_name || client.name || `Client ${client.client_id || client.id}`}
                              </h3>
                              {isSelected && (
                                <div 
                                  className="rounded-full px-2 py-1 text-xs font-medium"
                                  style={{
                                    background: 'var(--bg-accent)',
                                    color: 'var(--text-accent)'
                                  }}
                                >
                                  Active
                                </div>
                              )}
                            </div>
                            <p className="mt-1 text-sm leading-5" style={{ color: 'var(--text-secondary)' }}>
                              Documents specific to this client
                            </p>
                            <div className="mt-3 flex items-center gap-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
                              <div className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                {clientDocs.length} documents
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </>
                )}
              </div>

              {/* Documents List - Show filtered documents based on selection */}
              {documents.length > 0 && !isLoading && (
                <>
                  <div className="px-4 py-2 border-t" style={{ borderColor: 'var(--border-secondary)' }}>
                    <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                      {selectedMode === 'all' ? 'Recent Documents' : 'Client Documents'}
                    </p>
                  </div>
                  <div className="max-h-48 overflow-y-auto px-2 pb-2">
                    {(selectedMode === 'all' 
                      ? documents.slice(0, 10)
                      : documents.filter(d => d.client_id === selectedClientId).slice(0, 10)
                    ).map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center gap-2 px-4 py-2 text-xs"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <FileText className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate flex-1">{doc.filename}</span>
                        <span className="text-xs opacity-60">
                          {doc.client_name || 'Unknown Client'}
                        </span>
                      </div>
                    ))}
                    {selectedMode === 'client' && documents.filter(d => d.client_id === selectedClientId).length === 0 && (
                      <div className="px-4 py-2 text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
                        No documents found for this client
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Footer */}
              <div 
                className="border-t px-4 py-3"
                style={{ borderColor: 'var(--border-secondary)' }}
              >
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Choose to search all documents or filter by specific client.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};