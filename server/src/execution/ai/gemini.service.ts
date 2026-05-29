import { GoogleGenAI } from '@google/genai';
import { ENV_VARS } from '../../config/env';

// Khởi tạo SDK genai
const ai = new GoogleGenAI({ apiKey: ENV_VARS.geminiApiKey });

const MAX_RETRIES = 3;
const INITIAL_DELAY_MS = 2000;

/**
 * Sanitize + parse JSON từ Gemini: xử lý control characters lỗi
 * (Gemini đôi khi trả về newline/tab thô trong string values)
 */
function safeJsonParse(text: string): unknown {
  // 1. Strip markdown code fences (```json ... ``` or ``` ... ```)
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }
  cleaned = cleaned.trim();

  // 2. Try parsing directly
  try {
    return JSON.parse(cleaned);
  } catch {
    // 3. Replace control characters inside JSON string values
    const sanitized = cleaned.replace(
      /[\x00-\x1F\x7F]/g,
      (ch) => {
        switch (ch) {
          case '\n': return '\\n';
          case '\r': return '\\r';
          case '\t': return '\\t';
          default: return '';
        }
      }
    );
    try {
      return JSON.parse(sanitized);
    } catch {
      // 4. Last resort: try to extract JSON object/array from the text
      const jsonMatch = sanitized.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      throw new Error(`Cannot parse AI response as JSON. Raw text starts with: "${text.slice(0, 100)}"`);
    }
  }
}

/**
 * Retry wrapper: tự động thử lại khi Gemini trả 503 (quá tải)
 */
async function withRetry<T>(fn: () => Promise<T>, label: string): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (error: unknown) {
      lastError = error;
      const status = (error as { status?: number }).status;
      if (status === 503 && attempt < MAX_RETRIES) {
        const delay = INITIAL_DELAY_MS * Math.pow(2, attempt);
        console.warn(
          `[Gemini Service] ${label} - 503 quá tải, thử lại lần ${attempt + 1}/${MAX_RETRIES} sau ${delay}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  throw lastError;
}

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
         // NẾU là essay: { "sampleAnswer": "Câu trả lời mẫu chi tiết", "maxWords": 500, "aiGradingEnabled": true }
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
      const result = await withRetry(async () => {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.7,
          },
        });
        if (!response.text) throw new Error('Empty response from Gemini');
        return safeJsonParse(response.text);
      }, 'Generate by Topic');

      return result;
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

      const result = await withRetry(async () => {
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
        return safeJsonParse(resultText);
      }, 'Generate by File');

      return result;

    } catch (e) {
      console.error('[Gemini Service] Generate by File failed:', e);
      throw e;
    }
  },

  /**
   * AI chấm câu tự luận (essay)
   */
  async gradeEssay(params: {
    questionText: string;
    sampleAnswer?: string;
    studentAnswer: string;
    maxPoints: number;
  }): Promise<GradeEssayResult> {
    const prompt = `Bạn là giáo viên đang chấm bài tự luận.

Câu hỏi: ${params.questionText}
${params.sampleAnswer ? `Đáp án mẫu: ${params.sampleAnswer}` : ''}
Điểm tối đa: ${params.maxPoints}

Bài làm của học sinh:
"""
${params.studentAnswer}
"""

Hãy chấm bài với các tiêu chí:
1. Mức độ đúng đắn của nội dung so với đáp án mẫu (nếu có)
2. Tính logic và mạch lạc trong lập luận
3. Độ đầy đủ của câu trả lời

Trả về JSON đúng schema sau (không bọc markdown):
{
  "pointsEarned": <số điểm từ 0 đến ${params.maxPoints}>,
  "feedback": "<nhận xét chi tiết bằng tiếng Việt, chỉ ra điểm đúng và sai>",
  "isCorrect": <true nếu đạt >= 70% điểm, false nếu không>
}`;

    try {
      const result = await withRetry(async () => {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.3, // Thấp hơn để chấm chính xác
          },
        });
        if (!response.text) throw new Error('Empty response from Gemini');
        return safeJsonParse(response.text) as GradeEssayResult;
      }, 'Grade Essay');

      // Validate bounds
      result.pointsEarned = Math.max(0, Math.min(params.maxPoints, result.pointsEarned));
      return result;
    } catch (e) {
      console.error('[Gemini Service] Grade Essay failed:', e);
      // Fallback: trả về pending review thay vì crash
      return {
        pointsEarned: 0,
        feedback: 'AI không thể chấm bài lúc này. Vui lòng chờ giáo viên chấm.',
        isCorrect: null,
      };
    }
  },

  /**
   * AI giải thích bài tập chi tiết từng bước
   */
  async explainQuestion(params: {
    questionText: string;
    studentAnswer: string;
    correctAnswer?: string;
  }): Promise<AIExplainResult> {
    const prompt = `Bạn là một gia sư AI kiên nhẫn và giỏi chuyên môn.
Hãy giải thích chi tiết cách giải bài tập sau đây từng bước một.

Câu hỏi: ${params.questionText}
Bài làm của học sinh: ${params.studentAnswer}
${params.correctAnswer ? `Đáp án đúng: ${params.correctAnswer}` : ''}

Yêu cầu trả về JSON chuẩn xác (không dùng markdown backticks) với schema sau:
{
  "explanation": {
    "steps": [
      {
        "stepNumber": 1,
        "title": "Tên bước",
        "content": "Nội dung giải thích",
        "formula": "Công thức nếu có (tùy chọn)"
      }
    ],
    "relatedKnowledge": ["Kiến thức 1", "Kiến thức 2"],
    "tips": "Mẹo giải nhanh (tùy chọn)"
  }
}`;

    try {
      const result = await withRetry(async () => {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.5,
          },
        });
        if (!response.text) throw new Error('Empty response from Gemini');
        return safeJsonParse(response.text) as AIExplainResult;
      }, 'Explain Question');
      return result;
    } catch (e) {
      console.error('[Gemini Service] Explain Question failed:', e);
      throw e;
    }
  }
};

export interface GradeEssayResult {
  pointsEarned: number;
  feedback: string;
  isCorrect: boolean | null;
}

export interface AIExplainResult {
  explanation: {
    steps: {
      stepNumber: number;
      title: string;
      content: string;
      formula?: string;
    }[];
    relatedKnowledge: string[];
    tips?: string;
  }
}
