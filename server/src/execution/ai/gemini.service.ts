import { GoogleGenAI } from '@google/genai';
import { ENV_VARS } from '../../config/env';

// Khởi tạo SDK genai
const ai = new GoogleGenAI({ apiKey: ENV_VARS.geminiApiKey });

const EXERCISE_SCHEMA = `
{
  "title": "Tiêu đề bài tập tóm tắt",
  "difficultyLevel": "easy | medium | hard | expert",
  "questions": [
    {
      "questionText": "Nội dung câu hỏi",
      "questionType": "multiple_choice | essay | true_false",
      "points": 1,
      "explanation": "Lời giải chi tiết từng bước",
      "hints": ["Gợi ý 1", "Gợi ý 2"],
      "content": { 
         // NẾU là multiple_choice: { "options": ["đáp án 1", "đáp án 2", "đáp án 3", "đáp án 4"], "correctAnswer": 0_indexed_number }
         // NẾU là essay: { "sampleAnswer": "Câu trả lời mẫu chi tiết", "maxWords": 500 }
         // NẾU là true_false: { "correctAnswer": true }
      }
    }
  ]
}
`;

export interface GenerateByTopicInput {
  gradeName?: string;
  subjectName?: string;
  topicName: string;
  difficultyLevel: string;
  numberOfQuestions: number;
  questionType: string;
  additionalInstructions?: string;
}

export interface GenerateByBufferInput {
  gradeName?: string;
  subjectName?: string;
  topicName?: string;
  fileBuffer: Buffer;
  mimeType: string;
  additionalInstructions?: string;
}

export const geminiService = {
  /**
   * Sinh bài tập dựa trên Chủ đề bằng văn bản
   */
  async generateByTopic(params: GenerateByTopicInput) {
    const prompt = `Bộ cấu hình bài tập:
- Môn học: ${params.subjectName || 'Bất kỳ'}
- Khối lớp: ${params.gradeName || 'Bất kỳ'}
- Chủ đề trọng tâm: ${params.topicName}
- Mức độ: ${params.difficultyLevel}
- Yêu cầu số lượng câu: ${params.numberOfQuestions}
- Loại câu hỏi: ${params.questionType}
${params.additionalInstructions ? `- Yêu cầu thêm: ${params.additionalInstructions}` : ''}

Nhiệm vụ của bạn là đóng vai một giáo viên xuất sắc để tạo ra bài tập đúng với cấu hình trên.
Yêu cầu bắt buộc:
1. Độ khó phải phân bổ đúng mức đã chọn. Lời giải cực kỳ chi tiết.
2. Formatted Output JSON STRICTLY matching this schema (do NOT use Markdown ticks like \`\`\`json):
${EXERCISE_SCHEMA}
`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      if (!response.text) throw new Error('Empty response from Gemini');
      return JSON.parse(response.text);
    } catch (e) {
      console.error('[Gemini Service] Generate by Topic failed:', e);
      throw e;
    }
  },

  /**
   * Phân tích file (Buffer) và sinh các câu hỏi tương tự
   */
  async generateByBuffer(params: GenerateByBufferInput) {
    try {
      const base64Data = params.fileBuffer.toString('base64');
      const contentType = params.mimeType || 'application/pdf';
      
      const promptText = `Dưới đây là một Tài liệu/Đề thi dính kèm.
Hãy phân tích nội dung, xác định định dạng, phong cách ra đề của tài liệu này và sinh ra một ĐỀ TƯƠNG TỰ (nhân bản nội dung) nhưng khác mặt chữ/số liệu. Sinh khoảng 5-10 câu hỏi dựa theo độ dài đề gốc.
Cấu hình môn học áp dụng: Môn: ${params.subjectName || 'Tự nhận diện'} - Khối: ${params.gradeName || 'Tự nhận diện'}.
${params.additionalInstructions ? `Lưu ý thêm: ${params.additionalInstructions}` : ''}

Output Response phải trả ra cục JSON nguyên bản đúng Schema sau (Không bọc Markdown):
${EXERCISE_SCHEMA}
`;

      const aiResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          promptText,
          {
            inlineData: {
              data: base64Data,
              mimeType: contentType,
            },
          },
        ],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.8, // Cao hơn xút để tạo độ sáng tạo từ nguồn mẫu
        },
      });

      if (!aiResponse.text) throw new Error('Empty response from Gemini');
      let resultText = aiResponse.text;
      
      // Khử markdown backticks nếu Gemini ko tuân thủ responseMimeType (đôi khi xảy ra)
      if (resultText.startsWith('\`\`\`')) {
        resultText = resultText.replace(/^\`\`\`json\n/, '').replace(/^\`\`\`\n/, '').replace(/\n\`\`\`$/, '');
      }
      return JSON.parse(resultText);

    } catch (e) {
      console.error('[Gemini Service] Generate by File failed:', e);
      throw e;
    }
  }
};
