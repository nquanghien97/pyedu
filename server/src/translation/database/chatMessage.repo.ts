import { prisma } from './prisma';
import { ChatMessageResponse } from '../../entities/chat';
import { randomUUID } from 'crypto';

export const chatMessageRepo = {
  createMessage: async (
    chatSessionId: string,
    role: 'user' | 'model',
    content: string,
    attachments: any = null
  ): Promise<ChatMessageResponse> => {
    return await prisma.chatMessage.create({
      data: {
        id: randomUUID(),
        chatSessionId,
        role,
        content,
        attachments,
      },
    });
  },

  getMessagesBySessionId: async (chatSessionId: string): Promise<ChatMessageResponse[]> => {
    return await prisma.chatMessage.findMany({
      where: { chatSessionId: { startsWith: chatSessionId } },
      orderBy: { createdAt: 'asc' },
    });
  },
};
