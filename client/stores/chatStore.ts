import { create } from 'zustand';
import { ChatSession, ChatMessage, chatService } from '../services/chat';

interface ChatState {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  messages: ChatMessage[];
  isLoading: boolean;
  isStreaming: boolean;
  
  fetchSessions: () => Promise<void>;
  createSession: (title?: string) => Promise<string>;
  deleteSession: (id: string) => Promise<void>;
  setCurrentSession: (session: ChatSession | null) => void;
  fetchMessages: (sessionId: string) => Promise<void>;
  addMessage: (message: ChatMessage) => void;
  updateLastMessageContent: (chunk: string) => void;
  setIsStreaming: (status: boolean) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  sessions: [],
  currentSession: null,
  messages: [],
  isLoading: false,
  isStreaming: false,

  fetchSessions: async () => {
    try {
      set({ isLoading: true });
      const data = await chatService.getSessions();
      set({ sessions: data });
    } finally {
      set({ isLoading: false });
    }
  },

  createSession: async (title) => {
    try {
      set({ isLoading: true });
      const newSession = await chatService.createSession(title);
      set(state => ({ sessions: [newSession, ...state.sessions] }));
      return newSession.id;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteSession: async (id) => {
    await chatService.deleteSession(id);
    set(state => ({
      sessions: state.sessions.filter(s => s.id !== id),
      currentSession: state.currentSession?.id === id ? null : state.currentSession,
      messages: state.currentSession?.id === id ? [] : state.messages,
    }));
  },

  setCurrentSession: (session) => {
    set({ currentSession: session });
  },

  fetchMessages: async (sessionId) => {
    try {
      set({ isLoading: true });
      const msgs = await chatService.getSessionHistory(sessionId);
      set({ messages: msgs });
    } finally {
      set({ isLoading: false });
    }
  },

  addMessage: (message) => {
    set(state => ({ messages: [...state.messages, message] }));
  },

  updateLastMessageContent: (chunk) => {
    set(state => {
      const msgs = [...state.messages];
      if (msgs.length > 0) {
        const last = msgs[msgs.length - 1];
        last.content += chunk;
      }
      return { messages: msgs };
    });
  },

  setIsStreaming: (status) => set({ isStreaming: status }),
}));
