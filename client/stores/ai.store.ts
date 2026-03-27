import { create } from 'zustand';

interface AiStoreType {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  aiDraft: any | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setAiDraft: (draft: any | null) => void;
  clearAiDraft: () => void;
}

export const useAiStore = create<AiStoreType>((set) => ({
  aiDraft: null,
  setAiDraft: (draft) => set({ aiDraft: draft }),
  clearAiDraft: () => set({ aiDraft: null }),
}));
