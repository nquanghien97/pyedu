import { Request, Response } from 'express';
import { chatService } from '../../../execution/chat/chat.service';

export const sendMessage = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ success: false, error: { message: "Unauthorized" } });
    return;
  }

  const sessionId = req.params.sessionId as string;
  const content = req.body.content as string;
  const file = req.file;

  if (!content && !file) {
    res.status(400).json({ success: false, error: { message: "Phải có nội dung hoặc file" } });
    return;
  }

  // Handle stream logic inside service
  try {
    await chatService.handleMessageAndStream(userId, sessionId, content, file, res);
  } catch (error: any) {
    console.error("Lỗi gửi tin nhắn", error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: { message: error.message || "Lỗi server" } });
    } else {
      res.write(`event: error\ndata: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  }
};
