export interface CreateChatSessionRequest {
  title: string;
}

export interface ChatSessionResponse {
  id: string;
  userId: number;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessageRequest {
  content: string;
}

export interface ChatMessageResponse {
  id: string;
  chatSessionId: string;
  role: string;
  content: string;
  attachments: any | null;
  createdAt: Date;
}
