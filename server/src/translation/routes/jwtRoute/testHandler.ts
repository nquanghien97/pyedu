import { Request, Response } from 'express';
import { testRepository } from '../../database/test.repo';
import { exerciseRepository } from '../../database/exercise.repo';
import { z } from 'zod';

const createTestSchema = z.object({
  title: z.string(),
  subjectId: z.string().optional(),
  topicId: z.string().optional(),
  testType: z.string(),
  timeLimitMinutes: z.number(),
  passingScore: z.number(),
  maxAttempts: z.number().default(1),
  shuffleQuestions: z.boolean().default(false),
  shuffleOptions: z.boolean().default(false),
  showResult: z.string().default('immediately'),
  startTime: z.string().optional().transform(v => v ? new Date(v) : undefined),
  endTime: z.string().optional().transform(v => v ? new Date(v) : undefined),
  questions: z.array(z.any()).optional()
});

export const getTests = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    let tests;
    if (user?.role === 'TEACHER') {
      tests = await testRepository.findByTeacher(user.id);
    } else if (user?.role === 'STUDENT') {
      tests = await testRepository.findAvailableForStudent();
    } else {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    res.json({ success: true, data: tests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

export const getTestById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const test = await testRepository.findById(id);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài kiểm tra' });
    }

    // Nếu học sinh và shuffleQuestions, cần trộn ở đây
    // Ở đây đơn giản hoá, trả về gốc
    res.json({ success: true, data: test });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

export const createTest = async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== 'TEACHER') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const input = createTestSchema.parse(req.body);
    
    // Tạo 1 Exercise loại Test trước
    const exercise = await exerciseRepository.create({
      title: input.title,
      exerciseType: 'test',
      difficultyLevel: 'medium',
      timeLimitMinutes: input.timeLimitMinutes,
      subjectId: input.subjectId,
      topicId: input.topicId,
      questions: input.questions || []
    }, req.user.id);

    // Force approve the exercise immediately
    await exerciseRepository.updateStatus(exercise.id, 'approved');

    // Tạo Test
    const test = await testRepository.create({
      exerciseId: exercise.id,
      topicId: input.topicId,
      subjectId: input.subjectId,
      testType: input.testType,
      timeLimitMinutes: input.timeLimitMinutes,
      passingScore: input.passingScore,
      maxAttempts: input.maxAttempts,
      shuffleQuestions: input.shuffleQuestions,
      shuffleOptions: input.shuffleOptions,
      showResult: input.showResult,
      startTime: input.startTime,
      endTime: input.endTime,
      isPublished: true,
    });

    res.json({ success: true, data: test });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ' });
  }
};

export const deleteTest = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await testRepository.delete(id);
    res.json({ success: true, message: 'Đã xóa' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
