import { withAsyncErrorHandling } from "../../withAsyncErrorHandling"
import { logger } from "../../../lib/logger";
import { geminiService } from "../../../execution/ai/gemini.service";

export const chatbotHandler = withAsyncErrorHandling(async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, error: { message: 'Thiếu nội dung câu hỏi' } });
    }

    const reply = await geminiService.generateChatResponse(prompt);

    res.json({
      success: true,
      data: reply
    });
  } catch (err) {
    logger.error('Chatbot handler error:', err);
    res.status(500).json({
      success: false,
      error: { message: 'Đã có lỗi hệ thống xảy ra. Vui lòng thử lại sau.' }
    });
  }
});
