import axios, { AxiosResponse } from 'axios';
import { Meeting } from '../types';

// API Configuration
const API_BASE_URL = 'https://ks52rq6kwk.execute-api.us-east-1.amazonaws.com/dev';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens if needed
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    console.log('🔐 Auth interceptor:', { 
      url: config.url, 
      method: config.method?.toUpperCase(),
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'none'
    });
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Auth interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      url: response.config.url,
      method: response.config.method?.toUpperCase(),
      status: response.status,
      statusText: response.statusText,
      dataPreview: typeof response.data === 'object' ? Object.keys(response.data) : typeof response.data
    });
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.status === 401) {
      // Handle unauthorized - could redirect to login
      console.error('Unauthorized access - token may be expired');
      // localStorage.removeItem('auth_token');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types for API responses

// Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  google_calendar_connected: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Client Management Types
export interface Client {
  id: string;
  name: string;
  description?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  industry?: string;
  contact_email?: string;
  contact_name?: string;
}

export interface SubClient {
  id: string;
  name: string;
  description?: string;
  client_id: string;
  contact_email?: string;
  contact_name?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface ClientCreateRequest {
  name: string;
  description?: string;
}

export interface SubClientCreateRequest {
  name: string;
  description?: string;
  client_id: string;
  contact_email?: string;
  contact_name?: string;
}

// File Management Types
export interface FileUploadResponse {
  id: string;
  filename: string;
  original_filename: string;
  file_type: string;
  file_size: number;
  client_id: string;
  sub_client_id?: string;
  processed: boolean;
  extracted_text?: string;
  chunks_stored: number;
  created_at: string;
}

export interface KnowledgeSearchRequest {
  query: string;
  client_id: string;
  sub_client_id?: string;
  n_results?: number;
}

export interface KnowledgeSearchResponse {
  results: Array<{
    content: string;
    metadata: any;
    score: number;
  }>;
  query: string;
  total_results: number;
}

// AI Generation Types
export interface LLMGenerationRequest {
  prompt: string;
  content_type: string; // email, summary, action_items, custom
  client_id: string;
  sub_client_id?: string;
  recipient_name?: string;
  sender_name?: string;
  additional_instructions?: string;
}

export interface LLMGenerationResponse {
  id: string;
  content: string;
  content_type: string;
  prompt: string;
  client_id: string;
  sub_client_id?: string;
  context_used: string;
  created_at: string;
}

// Bot Management Types
export interface BotResponse {
  bot_id: string;
  status: string;
  meeting_url: string;
  bot_name: string;
  created_at: string;
  message: string;
}

export interface BotStatusResponse {
  bot_id: string;
  status: string;
  meeting_url: string;
  bot_name: string;
  status_changes: Array<any>;
  checked_at: string;
}

export interface DownloadUrlsResponse {
  bot_id: string;
  video_url?: string;
  audio_url?: string;
  transcript_url?: string;
  chat_messages_url?: string;
  status: string;
}

export interface CalendarAuthResponse {
  token: string;
  expires_at: string;
  user_id: string;
}

export interface GoogleCalendarConnectionResponse {
  oauth_url: string;
  state: string;
  message: string;
}

// New Client Relationship Types
export interface ClientRelationshipResponse {
  client_id: number;
  client_name: string;
}

export interface MyClientsResponse {
  clients: Array<{
    client_id: number;
    client_name: string;
  }>;
}

export interface ValidateClientRequest {
  client_name: string;
}

export interface ValidateClientResponse {
  exists: boolean;
  has_access: boolean;
  client_id?: number;
  message: string;
}

export interface CreateClientRelationshipRequest {
  client_name: string;
}

export interface CreateClientRelationshipResponse {
  message: string;
  client_id: number;
  client_name: string;
}

export interface JoinMeetingRequest {
  meeting_url: string;
  meeting_title: string;
  external_meeting: boolean;
  client_id?: number;
}

export interface JoinMeetingResponse {
  message: string;
  bot_id?: string;
  status: string;
}

// Analyze Meeting Types
export interface AnalyzeMeetingRequest {
  meeting_id: string | number;
}

export interface AnalyzeMeetingResponse {
  message: string;
  meeting_id: number | string;
  insights: {
    summary?: string;
    action_items?: string[];
    main_points?: string[];
  };
}

export interface CalendarConnectionStatus {
  user_id: string;
  connected: boolean;
  provider?: string;
  last_sync?: string;
}

export interface CalendarEventRequest {
  title: string;
  description?: string;
  start_time: string; // ISO format datetime
  end_time: string;   // ISO format datetime
  attendees?: string[]; // List of email addresses
  meeting_link?: string;
  location?: string;
}

export interface CalendarEventResponse {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  attendees: string[];
  meeting_link?: string;
  location?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface CalendarEventsListResponse {
  events: CalendarEventResponse[];
  total_count: number;
  start_date: string;
  end_date: string;
}

// Early Access Types
export interface EarlyAccessRequest {
  email: string;
}

export interface EarlyAccessResponse {
  message: string;
  email: string;
  status: string;
}

// Meeting Output Types
// Transcript-specific types for structured response
export interface TranscriptWord {
  text: string;
  start_timestamp: {
    relative: number;
    absolute: string;
  };
  end_timestamp: {
    relative: number;
    absolute: string;
  };
}

export interface TranscriptParticipant {
  id: number;
  name: string;
  is_host: boolean;
  platform: string;
  extra_data: any;
}

export interface TranscriptSegment {
  participant: TranscriptParticipant;
  words: TranscriptWord[];
}

export interface MeetingOutputResponse {
  bot_id: string;
  meeting_title?: string;
  transcript?: string; // Stitched together readable text
  raw_transcript?: TranscriptSegment[]; // Original structured data
  transcript_data?: TranscriptSegment[]; // Raw transcript segments
  summary?: string;
  action_items?: string;
  participants?: string[];
  duration?: number;
  message?: string;
  status: string;
}


export interface VideoUrlResponse {
  bot_id: string;
  video_url: string;
  expires_at?: string;
  status: string;
}

export interface ApiMeeting {
  id: number;
  "Meeting title": string;
  Date: string;
  "Time start": string;
  "Time end": string | null;
  "User id": number;
  "Client id": number;
  "Bot id": string;
  "Meeting status": string;
  "External meeting": boolean;
}

export interface ApiMeetingsResponse {
  client_name: string;
  meetings: ApiMeeting[];
  total_meetings: number;
}
export interface ChatRequest {
  query: string;
  client_id?: number;
}

export interface ChatResponse {
  response: string;
  sources?: Array<{
    document_id: string;
    document_name: string;
    relevance_score: number;
    snippet: string;
  }>;
  query: string;
  client_id?: number;
  timestamp: string;
}


// API Service Class
export class ApiService {
  // Generic HTTP methods
  static async get(url: string, config?: any) {
    return api.get(url, config);
  }

  static async post(url: string, data?: any, config?: any) {
    return api.post(url, data, config);
  }

  static async put(url: string, data?: any, config?: any) {
    return api.put(url, data, config);
  }

  static async delete(url: string, config?: any) {
    return api.delete(url, config);
  }

  // Health check
  static async healthCheck(): Promise<any> {
    const response = await this.get('/health');
    return response.data;
  }

  // Authentication
  static async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.post('/auth/register', data);
    return response.data;
  }

  static async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.post('/login', data);
    return response.data;
  }

  static async getCurrentUser(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data;
  }

  // Client Management
  static async createClient(data: ClientCreateRequest): Promise<Client> {
    const response = await api.post('/clients/', data);
    return response.data;
  }

  static async getClients(): Promise<Client[]> {
    const response = await api.get('/clients/');
    return response.data;
  }
  /*
  * Fetches meetings for a specific client
  * @param clientId - ID of the client to fetch meetings for
  * @returns Promise containing client name, meetings array, and total count
  */
 static async getClientMeetings(clientId: string): Promise<ApiMeetingsResponse> {
   try {
     const response = await api.get(`/client/${clientId}/meetings`);
     return response.data;
   } catch (error) {
     console.error(`Error fetching meetings for client ${clientId}:`, error);
     throw error;
   }
 }




  static async getClient(clientId: string): Promise<Client> {
    const response = await api.get(`/clients/${clientId}`);
    return response.data;
  }

  static async updateClient(clientId: string, data: Partial<ClientCreateRequest>): Promise<Client> {
    const response = await api.put(`/clients/${clientId}`, data);
    return response.data;
  }

  static async deleteClient(clientId: string): Promise<void> {
    await api.delete(`/clients/${clientId}`);
  }

  // Sub-Client Management
  static async createSubClient(clientId: string, data: Omit<SubClientCreateRequest, 'client_id'>): Promise<SubClient> {
    const response = await api.post(`/clients/${clientId}/sub-clients`, data);
    return response.data;
  }

  static async getSubClients(clientId: string): Promise<SubClient[]> {
    const response = await api.get(`/clients/${clientId}/sub-clients`);
    return response.data;
  }

  static async updateSubClient(clientId: string, subClientId: string, data: Partial<SubClientCreateRequest>): Promise<SubClient> {
    const response = await api.put(`/clients/${clientId}/sub-clients/${subClientId}`, data);
    return response.data;
  }

  static async deleteSubClient(clientId: string, subClientId: string): Promise<void> {
    await api.delete(`/clients/${clientId}/sub-clients/${subClientId}`);
  }

  // File Management
  static async uploadFile(file: File, clientId: string, subClientId?: string): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('client_id', clientId);
    if (subClientId) {
      formData.append('sub_client_id', subClientId);
    }

    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  static async searchKnowledge(data: KnowledgeSearchRequest): Promise<KnowledgeSearchResponse> {
    const response = await api.post('/files/search', data);
    return response.data;
  }

  static async getFiles(clientId?: string, subClientId?: string): Promise<FileUploadResponse[]> {
    const params = new URLSearchParams();
    if (clientId) params.append('client_id', clientId);
    if (subClientId) params.append('sub_client_id', subClientId);

    const response = await api.get(`/files/?${params.toString()}`);
    return response.data;
  }

  // AI Content Generation
  static async generateContent(data: LLMGenerationRequest): Promise<LLMGenerationResponse> {
    const response = await api.post('/ai/generate', data);
    return response.data;
  }

  static async generateEmail(data: LLMGenerationRequest): Promise<LLMGenerationResponse> {
    const response = await api.post('/ai/email', data);
    return response.data;
  }

  static async generateSummary(data: LLMGenerationRequest): Promise<LLMGenerationResponse> {
    const response = await api.post('/ai/summary', data);
    return response.data;
  }

  static async generateActionItems(data: LLMGenerationRequest): Promise<LLMGenerationResponse> {
    const response = await api.post('/ai/action-items', data);
    return response.data;
  }

  // Bot Management
  static async createBot(meetingUrl: string, botName: string): Promise<BotResponse> {
    const response = await api.post('/create-bot', {
      meeting_url: meetingUrl,
      bot_name: botName,
    });
    return response.data;
  }

  // Join Meeting - Send bot to join a meeting
  static async joinMeeting(
    meetingUrl: string,
    meetingTitle: string,
    clientId: string = "1",
    externalMeeting: boolean = true
  ): Promise<any> {
    const response = await api.post('/join-meeting', {
      meeting_url: meetingUrl,
      meeting_title: meetingTitle,
      client_id: clientId,
      external_meeting: externalMeeting,
    });
    return response.data;
  }

  // Get Meeting Output - Retrieve meeting transcription/output
  static async getMeetingOutput(botId: string): Promise<MeetingOutputResponse> {
    try {
      const response = await api.post('/get-meeting-output', {
        bot_id: botId,
      });
      
      console.log('API Response for getMeetingOutput:', response.data);
      
      // Check if response is an array (direct transcript segments)
      if (Array.isArray(response.data)) {
        const transcriptSegments = response.data as TranscriptSegment[];
        
        // Extract participants list
        const participantsSet = new Set<string>();
        transcriptSegments.forEach(segment => {
          participantsSet.add(segment.participant.name);
        });
        const participants = Array.from(participantsSet);
        
        // Stitch together the transcript text
        const transcriptText = transcriptSegments
          .map(segment => {
            // Join all words in the segment
            const segmentText = segment.words.map(word => word.text).join(' ');
            return `${segment.participant.name}: ${segmentText}`;
          })
          .join('\n');
        
        // Calculate total duration from first to last timestamp
        let duration = 0;
        if (transcriptSegments.length > 0) {
          const firstSegment = transcriptSegments[0];
          const lastSegment = transcriptSegments[transcriptSegments.length - 1];
          
          if (firstSegment.words.length > 0 && lastSegment.words.length > 0) {
            const startTime = firstSegment.words[0].start_timestamp.relative;
            const endTime = lastSegment.words[lastSegment.words.length - 1].end_timestamp.relative;
            duration = Math.round(endTime - startTime);
          }
        }
        
        // Return structured response with both raw segments and processed text
        return {
          bot_id: botId,
          transcript: transcriptText, // Stitched together text
          raw_transcript: transcriptSegments, // Keep original structured data
          participants: participants,
          duration: duration,
          message: 'Transcription available.',
          status: 'completed'
        };
      }
      
      // If response is already a wrapper object, check if it contains transcript segments
      if (response.data && typeof response.data === 'object') {
        const data = response.data as any;
        
        // Support multiple possible keys containing segment arrays
        const segments: TranscriptSegment[] | undefined =
          Array.isArray(data.transcript) ? data.transcript :
          Array.isArray(data.raw_transcript) ? data.raw_transcript :
          Array.isArray(data.transcript_data) ? data.transcript_data : undefined;
        
        if (segments) {
          const transcriptSegments = segments;
          
          // Extract participants list
          const participantsSet = new Set<string>();
          transcriptSegments.forEach(segment => {
            participantsSet.add(segment.participant.name);
          });
          const participants = Array.from(participantsSet);
          
          // Stitch together the transcript text
          const transcriptText = transcriptSegments
            .map(segment => {
              const segmentText = segment.words.map(word => word.text).join(' ');
              return `${segment.participant.name}: ${segmentText}`;
            })
            .join('\n');
          
          // Calculate duration if not provided
          let duration = data.duration || 0;
          if (duration === 0 && transcriptSegments.length > 0) {
            const firstSegment = transcriptSegments[0];
            const lastSegment = transcriptSegments[transcriptSegments.length - 1];
            
            if (firstSegment.words.length > 0 && lastSegment.words.length > 0) {
              const startTime = firstSegment.words[0].start_timestamp.relative;
              const endTime = lastSegment.words[lastSegment.words.length - 1].end_timestamp.relative;
              duration = Math.round(endTime - startTime);
            }
          }
          
          return {
            ...data,
            transcript: transcriptText,
            raw_transcript: transcriptSegments,
            participants: participants.length > 0 ? participants : data.participants,
            duration: duration,
            message: 'Transcription available.',
            status: 'completed'
          } as MeetingOutputResponse;
        }
        
        // Return as is if no transcript segments to process
        return data;
      }
      
      // Fallback: return response as is
      return response.data;
      
    } catch (error: any) {
      console.error('Error fetching meeting output:', error);
      
      // Provide more detailed error information
      if (error.response) {
        console.error('API Error Response:', error.response.data);
        console.error('API Error Status:', error.response.status);
        throw new Error(`API Error (${error.response.status}): ${error.response.data?.message || error.message}`);
      } else if (error.request) {
        throw new Error('Network error: Unable to reach the server. Please check your connection.');
      } else {
        throw new Error(`Request error: ${error.message}`);
      }
    }
  }
  

  // Get Video URL - Get fresh video link for recorded meeting
  static async getVideoUrl(botId: string): Promise<VideoUrlResponse> {
    const response = await api.get(`/get-video/${botId}`);
    return response.data;
  }

  static async getBotStatus(botId: string): Promise<BotStatusResponse> {
    const response = await api.get(`/bot/${botId}/status`);
    return response.data;
  }

  static async getDownloadUrls(botId: string): Promise<DownloadUrlsResponse> {
    const response = await api.get(`/bot/${botId}/download-urls`);
    return response.data;
  }

  // Fetch all meetings that belong to the current user
  static async getMyMeetings(): Promise<any[]> {
    const response = await api.get('/mymeetings');
    // API returns { message: string, meetings: [...] }
    return Array.isArray(response.data?.meetings) ? response.data.meetings : [];
  }

  // Analyze Meeting - GPT-based analysis of recorded meeting
  static async analyzeMeeting(meetingId: string | number): Promise<AnalyzeMeetingResponse> {
    const response = await api.post('/analyze-meeting', { meeting_id: meetingId });
    return response.data;
  }
  
  static async removeBot(botId: string): Promise<any> {
    const response = await api.delete(`/bot/${botId}`);
    return response.data;
  }

  static async listActiveBots(): Promise<any> {
    const response = await api.get('/bots');
    return response.data;
  }

  static async cleanupOldBots(): Promise<any> {
    const response = await api.post('/bots/cleanup');
    return response.data;
  }

  // Debug endpoints (for development)
  static async getDebugUsers(): Promise<any> {
    const response = await api.get('/debug/users');
    return response.data;
  }

  static async getDebugTest(): Promise<any> {
    const response = await api.get('/debug/test');
    return response.data;
  }

  // Calendar Integration
  static async generateCalendarAuthToken(userId: string): Promise<CalendarAuthResponse> {
    const response = await api.post('/calendar/auth-token', {
      user_id: userId,
    });
    return response.data;
  }

  static async initiateGoogleCalendarConnection(
    userId: string,
    calendarAuthToken: string,
    successUrl?: string,
    errorUrl?: string
  ): Promise<GoogleCalendarConnectionResponse> {
    const response = await api.post('/calendar/connect/google', {
      user_id: userId,
      calendar_auth_token: calendarAuthToken,
      success_url: successUrl,
      error_url: errorUrl,
    });
    return response.data;
  }

  static async getCalendarConnectionStatus(userId: string): Promise<CalendarConnectionStatus> {
    const response = await api.get(`/calendar/status/${userId}`);
    return response.data;
  }

  // Calendar Events
  static async getCalendarEvents(
    userId: string,
    startDate?: string,
    endDate?: string
  ): Promise<CalendarEventsListResponse> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    const response = await api.get(`/calendar/events/${userId}?${params.toString()}`);
    return response.data;
  }

  static async createCalendarEvent(
    userId: string,
    eventData: CalendarEventRequest
  ): Promise<CalendarEventResponse> {
    const response = await api.post(`/calendar/events?user_id=${userId}`, eventData);
    return response.data;
  }

  static async updateCalendarEvent(
    eventId: string,
    userId: string,
    eventData: CalendarEventRequest
  ): Promise<CalendarEventResponse> {
    const response = await api.put(`/calendar/events/${eventId}?user_id=${userId}`, eventData);
    return response.data;
  }

  static async deleteCalendarEvent(eventId: string, userId: string): Promise<any> {
    const response = await api.delete(`/calendar/events/${eventId}?user_id=${userId}`);
    return response.data;
  }

  // New Client Management Endpoints
  
  // Validate Client - Check if client exists and user has access
  static async validateClient(clientName: string): Promise<ValidateClientResponse> {
    const response = await api.post('/validate-client', { client_name: clientName });
    return response.data;
  }

  // Create Client Relationship - Create client and/or relationship
  static async createClientRelationship(clientName: string): Promise<CreateClientRelationshipResponse> {
    const response = await api.post('/create-client-relationship', { client_name: clientName });
    return response.data;
  }

  // Get My Clients - Get dropdown list of all accessible clients
  static async getMyClients(): Promise<MyClientsResponse> {
    const response = await api.get('/my-clients');
    return response.data;
  }

  // Upload Document - Attach files to a specific client
  static async uploadClientDocument(clientId: string, file: File): Promise<any> {
    console.log('🚀 API: uploadClientDocument called:', { clientId, fileName: file.name, fileSize: file.size });
    
    const formData = new FormData();
    formData.append('file', file);
    
    const url = `/client/${clientId}/upload-document`;
    console.log('🚀 API: Making POST request to:', url);
    
    // For file uploads, we need to override the default Content-Type header
    // and let the browser set it automatically for multipart/form-data
    const response = await api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('✅ API: Upload response:', response.data);
    return response.data;
  }

  // Get Client Documents - List all documents and transcripts for a client
  static async getClientDocuments(clientId: string): Promise<any> {
    const url = `/client/${clientId}/documents`;
    console.log('🚀 API: getClientDocuments called:', { clientId, url });
    
    const response = await api.get(url);
    console.log('✅ API: Get documents response:', response.data);
    return response.data;
  }

  // Download Document - Generate a signed download URL (valid for 1 hour)
  static async getDocumentDownloadUrl(documentId: string): Promise<any> {
    const url = `/download-document/${documentId}`;
    console.log('🚀 API: getDocumentDownloadUrl called:', { documentId, url });
    
    const response = await api.get(url);
    console.log('✅ API: Download URL response:', response.data);
    return response.data;
  }

  // Delete Document - Permanently remove a document from storage and database
  static async deleteDocument(documentId: string): Promise<any> {
    const url = `/delete-document/${documentId}`;
    console.log('🚀 API: deleteDocument called:', { documentId, url });
    
    const response = await api.delete(url);
    console.log('✅ API: Delete response:', response.data);
    return response.data;
  }

  // Updated Join Meeting - Create the actual meeting with new parameters
  static async joinMeetingNew(
    meetingUrl: string,
    meetingTitle: string,
    externalMeeting: boolean,
    clientId?: number
  ): Promise<JoinMeetingResponse> {
    const requestData: JoinMeetingRequest = {
      meeting_url: meetingUrl,
      meeting_title: meetingTitle,
      external_meeting: externalMeeting,
    };

    if (clientId !== undefined) {
      requestData.client_id = clientId;
    }

    const response = await api.post('/join-meeting', requestData);
    return response.data;
  }

  // Early Access Method
  static async getAccess(data: EarlyAccessRequest): Promise<EarlyAccessResponse> {
    const response = await this.post('/getacess', data);
    return response.data;
  }

  // Chat API Methods

  static async chatWithAllDocuments(query: string): Promise<ChatResponse> {
    const response = await api.post('/chat', { query });
    return response.data;
  }

  static async chatWithClientDocuments(query: string, clientId: number): Promise<ChatResponse> {
    const response = await api.post('/chat', { query, client_id: clientId });
    return response.data;
  }
}



export default ApiService;
