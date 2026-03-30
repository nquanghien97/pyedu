import { prisma } from './prisma';
import { CreateChatSessionRequest, ChatSessionResponse } from '../../entities/chat';
import { randomUUID } from 'crypto';

export const chatSessionRepo = {
  createSession: async (userId: number, data: CreateChatSessionRequest): Promise<ChatSessionResponse> => {
    return await prisma.chatSession.create({
      data: {
        id: randomUUID(),
        userId,
        title: data.title,
      },
    });
  },

  getSessionsByUserId: async (userId: number): Promise<ChatSessionResponse[]> => {
    const sessions = await prisma.chatSession.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
    return sessions.map((s: any) => ({ ...s, id: s.id.trim() }));
  },

  getSessionById: async (sessionId: string, userId: number): Promise<ChatSessionResponse | null> => {
    return await prisma.chatSession.findFirst({
      where: {
        id: { startsWith: sessionId }, // Allows matching CHAR(36) padded with spaces
        userId,
      },
    });
  },

  updateSessionTitle: async (sessionId: string, title: string): Promise<ChatSessionResponse> => {
    return await prisma.chatSession.update({
      where: { id: sessionId },
      data: { title },
    });
  },

  deleteSession: async (sessionId: string, userId: number): Promise<void> => {
    await prisma.chatSession.deleteMany({
      where: {
        id: sessionId,
        userId,
      },
    });
  },
};
