import { Request, Response } from 'express';
import { z } from 'zod';
import { geminiService } from '../../../execution/ai/gemini.service';
import { exerciseRepository } from '../../database/exercise.repo';
import { DIFFICULTY_LEVELS, QUESTION_TYPES, DifficultyLevel, QuestionType } from '../../../entities/exercise';

const generateByTopicSchema = z.object({
  gradeName: z.string().optional(),
  subjectName: z.string().optional(),
  subjectId: z.string().optional(),
  topicId: z.string().optional(),
  topicName: z.string().min(1, 'Vui lòng nhập chủ đề'),
  difficultyLevel: z.string(),
  numberOfQuestions: z.number().min(1).max(20),
  questionType: z.string(),
  additionalInstructions: z.string().optional(),
});

/**
 * Parse AI-generated JSON into a structure suitable for exerciseRepository.create()
 */
function parseAiResult(aiData: Record<string, unknown>, meta: {
  subjectId?: string;
  topicId?: string;
  difficultyLevel?: string;
  grade?: number;
  prompt?: string;
}) {
  const questions = (aiData.questions as Array<Record<string, unknown>>) || [];

  const rawDifficulty = meta.difficultyLevel || (aiData.difficultyLevel as string) || undefined;
  const validDifficulty = DIFFICULTY_LEVELS.includes(rawDifficulty as DifficultyLevel)
    ? (rawDifficulty as DifficultyLevel)
    : undefined;

  return {
    title: (aiData.title as string) || 'Bài tập AI',
    subjectId: meta.subjectId,
    topicId: meta.topicId,
    difficultyLevel: validDifficulty,
    grade: meta.grade,
    totalPoints: questions.reduce((sum, q) => sum + (Number(q.points) || 1), 0),
    questions: questions.map((q, index) => {
      const rawType = (q.questionType as string) || 'multiple_choice';
      const validType = QUESTION_TYPES.includes(rawType as QuestionType)
        ? (rawType as QuestionType)
        : ('multiple_choice' as QuestionType);

      return {
        questionText: (q.questionText as string) || '',
        questionType: validType,
        orderIndex: index + 1,
        points: Number(q.points) || 1,
        content: q.content || null,
        explanation: (q.explanation as string) || undefined,
        hints: (q.hints as string[]) || [],
        aiGradingEnabled: (rawType === 'essay'),
      };
    }),
  };
}

export async function generateExerciseByAI(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const parsedParams = generateByTopicSchema.parse(req.body);
    const aiData = await geminiService.generateByTopic(parsedParams) as Record<string, unknown>;

    // Parse AI result into exercise structure
    const exerciseInput = parseAiResult(aiData, {
      subjectId: parsedParams.subjectId,
      topicId: parsedParams.topicId,
      difficultyLevel: parsedParams.difficultyLevel,
      grade: parsedParams.gradeName ? parseInt(parsedParams.gradeName, 10) || undefined : undefined,
      prompt: JSON.stringify(parsedParams),
    });

    // Save to DB as draft with isAiGenerated flag
    const savedExercise = await exerciseRepository.createAiExercise(
      exerciseInput,
      userId,
      { model: 'gemini-2.5-flash', params: parsedParams, generatedAt: new Date().toISOString() }
    );

    return res.status(201).json({
      success: true,
      data: {
        exercise: savedExercise,
        rawAiData: aiData,
      },
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: error.issues[0].message,
        details: error.issues,
      });
    }

    console.error('[AI Handler] Error generating exercise:', error);
    const status = (error as { status?: number })?.status;
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
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, error: 'Vui lòng chọn file mẫu' });
    }

    const { gradeName, subjectName, subjectId, topicId, additionalInstructions } = req.body;

    const aiData = await geminiService.generateByBuffer({
      gradeName,
      subjectName,
      fileBuffer: file.buffer,
      mimeType: file.mimetype,
      additionalInstructions,
    }) as Record<string, unknown>;

    // Parse AI result into exercise structure
    const exerciseInput = parseAiResult(aiData, {
      subjectId,
      topicId,
      grade: gradeName ? parseInt(gradeName, 10) || undefined : undefined,
    });

    // Save to DB as draft with isAiGenerated flag
    const savedExercise = await exerciseRepository.createAiExercise(
      exerciseInput,
      userId,
      { model: 'gemini-2.5-flash', source: 'file', fileName: file.originalname, generatedAt: new Date().toISOString() }
    );

    return res.status(201).json({
      success: true,
      data: {
        exercise: savedExercise,
        rawAiData: aiData,
      },
    });
  } catch (error: unknown) {
    console.error('[AI Handler] Error generating exercise from file:', error);
    const status = (error as { status?: number })?.status;
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

/**
 * GET /api/v1/teacher/ai-exercises/history
 * Lấy danh sách bài tập do AI tạo (isAiGenerated=true) của teacher đang đăng nhập
 */
export async function getAiExerciseHistory(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string | undefined;

    const result = await exerciseRepository.findAll(
      { isAiGenerated: true, createdBy: userId, status },
      { page, limit }
    );

    return res.json({
      success: true,
      data: result.exercises,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    console.error('[AI Handler] Error fetching AI exercise history:', error);
    return res.status(500).json({ success: false, error: 'Lỗi khi tải lịch sử' });
  }
}

export async function generateSolution(req: Request, res: Response) {
  try {
    const { questionId } = req.body;
    if (!questionId) {
      return res.status(400).json({ success: false, error: 'Thiếu questionId' });
    }

    const { prisma } = await import('../../database/prisma');
    const question = await prisma.exerciseQuestion.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy câu hỏi' });
    }

    const aiSolution = await geminiService.generateSolution({
      questionText: question.questionText || '',
      questionType: question.questionType || 'multiple_choice',
    });

    const updated = await prisma.exerciseQuestion.update({
      where: { id: questionId },
      data: {
        content: question.content
          ? { ...(question.content as Record<string, unknown>), sampleAnswer: aiSolution.sampleAnswer }
          : { sampleAnswer: aiSolution.sampleAnswer },
        explanation: aiSolution.explanation,
      },
    });

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error('[AI Handler] Error generating solution:', error);
    return res.status(500).json({ success: false, error: 'Lỗi khi sinh lời giải' });
  }
}

export async function regenerateQuestion(req: Request, res: Response) {
  try {
    const questionId = req.params.id as string;
    if (!questionId) {
      return res.status(400).json({ success: false, error: 'Thiếu questionId' });
    }

    const { prisma } = await import('../../database/prisma');
    const question = await prisma.exerciseQuestion.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy câu hỏi' });
    }

    const exercise = await prisma.exercise.findUnique({
      where: { id: question.exerciseId },
    });

    const regenerated = await geminiService.regenerateQuestion({
      exerciseTitle: exercise?.title || 'Bài tập',
      questionText: question.questionText || '',
      questionType: question.questionType || 'multiple_choice',
    });

    const updated = await prisma.exerciseQuestion.update({
      where: { id: questionId },
      data: {
        questionText: regenerated.questionText,
        questionType: regenerated.questionType,
        content: regenerated.content as any,
        explanation: regenerated.explanation,
        hints: regenerated.hints as any,
      },
    });

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error('[AI Handler] Error regenerating question:', error);
    return res.status(500).json({ success: false, error: 'Lỗi khi tạo lại câu hỏi' });
  }
}
