import { Request, Response } from 'express';
import { z } from 'zod';
import { geminiService } from '../../../execution/ai/gemini.service';

const generateByTopicSchema = z.object({
  gradeName: z.string().optional(),
  subjectName: z.string().optional(),
  topicName: z.string().min(1, 'Vui lòng nhập chủ đề'),
  difficultyLevel: z.string(),
  numberOfQuestions: z.number().min(1).max(20),
  questionType: z.string(),
  additionalInstructions: z.string().optional(),
});

export async function generateExerciseByAI(req: Request, res: Response) {
  try {
    const parsedParams = generateByTopicSchema.parse(req.body);

    const generatedExercise = await geminiService.generateByTopic(parsedParams);



    return res.status(200).json({
      success: true,
      data: generatedExercise,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: error.issues[0].message,
        details: error.issues,
      });
    }

    console.error('[AI Handler] Error generating exercise:', error);
    const status = error?.status;
    if (status === 503) {
      return res.status(503).json({
        success: false,
        error: 'AI đang quá tải, vui lòng thử lại sau ít phút.',
      });
    }
    return res.status(500).json({
      success: false,
      error: 'Lỗi khi gọi AI Provider. Vui lòng thử lại sau.',
    });
  }
}

export async function generateExerciseFromFile(req: Request, res: Response) {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, error: 'Vui lòng chọn file mẫu' });
    }

    const { gradeName, subjectName, additionalInstructions } = req.body;

    const generatedExercise = await geminiService.generateByBuffer({
      gradeName,
      subjectName,
      fileBuffer: file.buffer,
      mimeType: file.mimetype,
      additionalInstructions,
    });

    return res.status(200).json({
      success: true,
      data: generatedExercise,
    });
  } catch (error: any) {
    console.error('[AI Handler] Error generating exercise from file:', error);
    const status = error?.status;
    if (status === 503) {
      return res.status(503).json({
        success: false,
        error: 'AI đang quá tải, vui lòng thử lại sau ít phút.',
      });
    }
    return res.status(500).json({
      success: false,
      error: 'Lỗi khi xử lý file mẫu hoặc gọi AI Provider. Vui lòng kiểm tra lại.',
    });
  }
}
