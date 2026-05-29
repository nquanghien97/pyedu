import { Request, Response } from 'express';
import { geminiService } from '../../../execution/ai/gemini.service';
import { z } from 'zod';

const explainSchema = z.object({
  questionText: z.string(),
  studentAnswer: z.string(),
  correctAnswer: z.string().optional(),
});

export const aiExplainHandler = async (req: Request, res: Response) => {
  try {
    const input = explainSchema.parse(req.body);

    const result = await geminiService.explainQuestion({
      questionText: input.questionText,
      studentAnswer: input.studentAnswer,
      correctAnswer: input.correctAnswer,
    });

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('[AI Explain] Error:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi AI giải thích bài tập', details: String(error) });
  }
};
