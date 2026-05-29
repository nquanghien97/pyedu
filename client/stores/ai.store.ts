import { create } from 'zustand';

export interface AiDraftData {
  grade?: string;
  subjectId?: string;
  [key: string]: unknown; 
}

interface AiStoreType {
  aiDraft: AiDraftData | null;
  setAiDraft: (draft: AiDraftData | null) => void;
  clearAiDraft: () => void;
}

export const useAiStore = create<AiStoreType>((set) => ({
  aiDraft: null,
  setAiDraft: (draft) => set({ aiDraft: draft }),
  clearAiDraft: () => set({ aiDraft: null }),
}));
