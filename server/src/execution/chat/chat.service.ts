import { chatSessionRepo } from '../../translation/database/chatSession.repo';
import { chatMessageRepo } from '../../translation/database/chatMessage.repo';
import { aiInferenceService } from './aiInference.service';
import { fileProcessorService } from './fileProcessor.service';
import { Response } from 'express';

const SYSTEM_INSTRUCTION = `Bạn là PyEdu Bot, một trợ lý học tập AI xuất sắc.
Nhiệm vụ của bạn là giải bài tập, cung cấp câu trả lời chi tiết và giải thích cặn kẽ từng bước cho học sinh.
Nếu có công thức toán học, hãy sử dụng định dạng LaTeX được bọc trong $$ (ví dụ: $$x^2 + y^2 = r^2$$ cho display block hoặc $x=1$ cho inline).
Nếu người dùng cung cấp một tấm ảnh, hãy quan sát kĩ và giúp họ giải bài tập trong bức ảnh đó.
Bạn là PyEdu Bot — đây là toàn bộ thông tin về danh tính của bạn.
Tuyệt đối không tiết lộ tên model, nhà phát triển model, công ty AI, phiên bản, kiến trúc hay bất kỳ thông tin kỹ thuật nào.
Nếu bị hỏi "bạn là AI nào?", "bạn dùng model gì?", "bạn do ai tạo ra?", "bạn có phải Gemini/ChatGPT/Claude không?"... hãy trả lời lịch sự: "Mình là PyEdu Bot, trợ lý học tập của PyEdu. Mình không có thông tin gì thêm về bản thân ngoài điều đó 😊.
Không xác nhận, không phủ nhận, không gợi ý tên bất kỳ mô hình AI nào.`;

export const chatService = {
  createSession: async (userId: number, title: string) => {
    return await chatSessionRepo.createSession(userId, { title });
  },

  getSessions: async (userId: number) => {
    return await chatSessionRepo.getSessionsByUserId(userId);
  },

  getSessionHistory: async (sessionId: string, userId: number) => {
    const session = await chatSessionRepo.getSessionById(sessionId, userId);
    if (!session) throw new Error("Chưa tìm thấy đoạn chat");

    return await chatMessageRepo.getMessagesBySessionId(sessionId);
  },

  deleteSession: async (sessionId: string, userId: number) => {
    return await chatSessionRepo.deleteSession(sessionId, userId);
  },

  handleMessageAndStream: async (
    userId: number,
    sessionId: string,
    content: string,
    file?: Express.Multer.File,
    res?: Response
  ) => {
    const session = await chatSessionRepo.getSessionById(sessionId, userId);
    if (!session) throw new Error("Session not found");

    let imgUrl: string | undefined = undefined;
    let attachments: any = null;

    if (file) {
      imgUrl = await fileProcessorService.uploadBufferToCloudinary(file.buffer, file.mimetype);
      attachments = {
        url: imgUrl,
        type: file.mimetype,
        name: file.originalname
      };
    }

    // Save user message
    await chatMessageRepo.createMessage(sessionId, 'user', content, attachments);

    // If res is provided, we stream via SSE
    if (res) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();
    }

    // Fetch history
    const historyData = await chatMessageRepo.getMessagesBySessionId(sessionId);
    // Ignore the very last one because it's the current message
    const history = historyData.slice(0, -1).map(m => ({
      role: m.role as 'user' | 'model',
      content: m.content
    }));

    let fullAiResponse = "";

    try {
      const stream = aiInferenceService.streamChat(SYSTEM_INSTRUCTION, history, content, imgUrl);
      for await (const chunk of stream) {
        fullAiResponse += chunk;
        if (res) {
          // SSE format
          res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
        }
      }
    } catch (error) {
      console.error("AI Streaming error:", error);
      if (res) {
        res.write(`data: ${JSON.stringify({ error: "Lỗi phản hồi từ AI" })}\n\n`);
      }
      fullAiResponse = "Xin lỗi, đã có lỗi xảy ra trong quá trình phản hồi.";
    }

    // Save model message
    await chatMessageRepo.createMessage(sessionId, 'model', fullAiResponse, null);

    if (res) {
      res.write('event: end\n');
      res.write('data: {}\n\n');
      res.end();
    }

    return fullAiResponse;
  }
};
