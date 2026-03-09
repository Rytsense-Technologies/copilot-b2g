export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: number;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface InitSessionResponse {
  message: string;
  status_code: number;
  session_id?: string;
}

interface FaqResponse {
  data: string[];
  status_code: number;
  message: string;
}

interface CreateSessionResponse {
  user_id: string;
  session_id: string;
  status_code: number;
  message: string;
}

interface CopilotRequest {
  user_query: string;
  user_id: string;
  session_id: string;
  is_faq: boolean;
  url: string;
}

interface CopilotResponse {
  user_id: string;
  session_id: string;
  data: string;
  status_code: number;
  message: string;
}

interface HistoryResponse {
  user_id: string;
  session_id: string;
  data: any; // Flexible to handle array or object
  status_code: number;
  message: string;
}

export interface Session {
  user_id: string;
  session_id: string;
  title: string;
  created_at: string;
  last_updated_at: string;
}

interface ListSessionsResponse {
  user_id: string;
  sessions: Session[];
}

const apiCall = async <T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': '69420',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

export const ChatService = {
  getFaqQuestions: async (url: string = "https://example.com"): Promise<string[]> => {
    try {
      const response = await apiCall<FaqResponse>(`/b2g/v1/faq-questions?url=${encodeURIComponent(url)}`, {
        method: 'GET',
      });
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch FAQ questions:', error);
      return [];
    }
  },

  initSession: async (): Promise<InitSessionResponse> => {
    try {
      const response = await apiCall<InitSessionResponse>('/', {
        method: 'GET',
      });
      console.log('Chat session initialized:', response.message);
      return response;
    } catch (error) {
      console.error('Failed to initialize chat session:', error);
      throw error;
    }
  },

  listSessions: async (userId: string = "1"): Promise<Session[]> => {
    try {
      const response = await apiCall<ListSessionsResponse>('/b2g/v1/session/list', {
        method: 'POST',
        body: JSON.stringify({ user_id: userId }),
      });
      return response.sessions || [];
    } catch (error) {
      console.error('Failed to list sessions:', error);
      return [];
    }
  },

  createSession: async (userId: string = "1"): Promise<CreateSessionResponse> => {
    try {
      const response = await apiCall<CreateSessionResponse>('/b2g/v1/session/create', {
        method: 'POST',
        body: JSON.stringify({ user_id: userId }),
      });
      console.log('New session created:', response.session_id);
      return response;
    } catch (error) {
      console.error('Failed to create session:', error);
      throw error;
    }
  },

  askCopilot: async (query: string, sessionId: string, userId: string = "1"): Promise<Message> => {
    try {
      const response = await apiCall<CopilotResponse>('/b2g/v1/copilot', {
        method: 'POST',
        body: JSON.stringify({
          user_query: query,
          user_id: userId,
          session_id: sessionId,
          is_faq: false,
          url: "https://example.com",
        } as CopilotRequest),
      });

      console.log('Copilot API Response:', response);

      return {
        id: Date.now().toString(),
        text: response.data,
        sender: 'bot',
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Failed to get copilot response:', error);
      throw new Error('Failed to get response from Coach. Please try again.');
    }
  },

  streamCopilot: async (
    query: string, 
    sessionId: string, 
    userId: string = "1",
    onChunk: (chunk: string) => void,
    onDone: () => void,
    onError: (error: Error) => void
  ) => {
    try {
      const response = await fetch(`${API_URL}/b2g/v1/copilot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': '69420',
        },
        body: JSON.stringify({
          user_query: query,
          user_id: userId,
          session_id: sessionId,
          is_faq: false,
          url: "https://example.com",
        } as CopilotRequest),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('No response body for streaming');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          onDone();
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        
        // Split by newlines as the backend sends line-delimited JSON
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep the last partial line in the buffer

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue;

          try {
            const json = JSON.parse(trimmedLine);
            if (json.type === 'chunk' && json.content) {
              onChunk(json.content);
            } else if (json.type === 'done') {
              onDone();
              return; // End the loop
            }
          } catch (e) {
            console.warn('Error parsing JSON chunk:', trimmedLine, e);
            // If it's not JSON, it might be raw text content depending on backend config
            // but based on docs it should be JSON
          }
        }
      }
    } catch (error) {
      console.error('Streaming failed:', error);
      onError(error instanceof Error ? error : new Error('Unknown streaming error'));
    }
  },

  getChatHistory: async (sessionId: string, userId: string = "1"): Promise<Message[]> => {
    try {
      const response = await apiCall<HistoryResponse>('/b2g/v1/copilot/history', {
        method: 'POST',
        body: JSON.stringify({
          user_id: userId,
          session_id: sessionId,
        }),
      });

      console.log('Raw History API Response:', response);
      
      const rawData = response.data;
      if (!rawData) {
        console.warn('History API returned no data');
        return [];
      }

      // Find the messages array. It might be response.data or response.data.history/messages/etc.
      let messagesArray: any[] = [];
      if (Array.isArray(rawData)) {
        messagesArray = rawData;
      } else if (typeof rawData === 'object') {
        // Look for the first property that is an array (e.g., 'history', 'messages', or similar)
        const entries = Object.entries(rawData);
        const arrayEntry = entries.find(([_, value]) => Array.isArray(value));
        if (arrayEntry) {
          console.log(`Found history array in property: ${arrayEntry[0]}`);
          messagesArray = arrayEntry[1] as any[];
        } else {
          console.log('No array found in response.data object. Using object values as fallback.');
          messagesArray = Object.values(rawData).filter(val => typeof val === 'object');
        }
      }

      const messages: Message[] = [];
      messagesArray.forEach((item: any, index: number) => {
        if (item.content) {
          messages.push({
            id: `history-${index}`,
            text: item.content,
            sender: item.role === 'human' ? 'user' : 'bot',
            timestamp: item.created_at ? new Date(item.created_at).getTime() : Date.now() + index,
          });
        }
      });

      return messages;
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
      return [];
    }
  },
};
