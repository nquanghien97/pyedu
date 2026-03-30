import { Request, Response } from 'express';
import { chatSessionRepo } from '../../database/chatSession.repo';
import { chatMessageRepo } from '../../database/chatMessage.repo';

export const getSessions = async (req: Request, res: Response) => {
  const userId = req.user?.id; // Assuming authMiddleware sets req.user
  if (!userId) return res.status(401).json({ success: false, error: { message: "Unauthorized" } });

  const sessions = await chatSessionRepo.getSessionsByUserId(userId);
  return res.json({ success: true, data: sessions });
};

export const createSession = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ success: false, error: { message: "Unauthorized" } });

  const { title } = req.body;
  const session = await chatSessionRepo.createSession(userId, { title: title || "Cuộc trò chuyện mới" });
  return res.status(201).json({ success: true, data: session });
};

export const deleteSession = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ success: false, error: { message: "Unauthorized" } });

  const { id } = req.params;
  await chatSessionRepo.deleteSession(id as string, userId);
  return res.json({ success: true, data: null });
};

export const getSessionMessages = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ success: false, error: { message: "Unauthorized" } });

  const { id } = req.params;
  const session = await chatSessionRepo.getSessionById(id as string, userId);
  if (!session) return res.status(404).json({ success: false, error: { message: "Không tìm thấy phiên chat" } });

  const messages = await chatMessageRepo.getMessagesBySessionId(id as string);
  return res.json({ success: true, data: messages });
};
