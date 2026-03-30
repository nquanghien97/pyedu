import { api } from '@/lib/api';

export interface ChatSession {
  id: string;
  userId: number;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  chatSessionId: string;
  role: 'user' | 'model';
  content: string;
  attachments: {
    url: string;
    type: string;
    name: string;
  } | null;
  createdAt: string;
}

export const chatService = {
  getSessions: async (): Promise<ChatSession[]> => {
    const res = await api<ChatSession[]>({
      url: '/api/v1/chat-sessions',
      options: { method: 'GET' },
    });
    return res.data;
  },

  createSession: async (title?: string): Promise<ChatSession> => {
    const res = await api<ChatSession>({
      url: '/api/v1/chat-sessions',
      options: { method: 'POST', body: JSON.stringify({ title }) },
    });
    return res.data;
  },

  deleteSession: async (id: string): Promise<void> => {
    await api({
      url: `/api/v1/chat-sessions/${id}`,
      options: { method: 'DELETE' },
    });
  },

  getSessionHistory: async (id: string): Promise<ChatMessage[]> => {
    const res = await api<ChatMessage[]>({
      url: `/api/v1/chat-sessions/${id}/messages`,
      options: { method: 'GET' },
    });
    return res.data;
  },
};
