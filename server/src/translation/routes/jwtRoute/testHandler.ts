import { Request, Response } from 'express';
import { testRepository } from '../../database/test.repo';
import { exerciseRepository } from '../../database/exercise.repo';
import { assignmentRepository } from '../../database/assignment.repo';
import { prisma } from '../../database/prisma';
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
  questions: z.array(z.any()).optional(),
  assignedToType: z.string().default('all'),
  assignedToId: z.string().default('all'),
});

const updateTestSchema = createTestSchema.partial();

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

    // Find the assignment for this test's exercise
    const assignment = await prisma.assignment.findFirst({
      where: { exerciseId: test.exerciseId },
    });

    // Nếu học sinh và shuffleQuestions, cần trộn ở đây
    // Ở đây đơn giản hoá, trả về gốc
    res.json({ success: true, data: { ...test, assignmentId: assignment?.id } });
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

    // Create Assignment for this Test with specified target
    await assignmentRepository.create({
      exerciseId: exercise.id,
      assignedToType: input.assignedToType as 'student' | 'class' | 'all',
      assignedToId: input.assignedToId,
      dueDate: input.endTime ? input.endTime.toISOString() : undefined,
      maxAttempts: input.maxAttempts,
    }, req.user.id);

    res.json({ success: true, data: test });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ' });
  }
};

export const updateTest = async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== 'TEACHER') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const id = req.params.id as string;
    const input = updateTestSchema.parse(req.body);

    const test = await testRepository.findById(id);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài kiểm tra' });
    }
    
    // Ensure the teacher is the author
    if (test.exercise?.createdBy !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền sửa bài này' });
    }

    const assignment = await prisma.assignment.findFirst({
      where: { exerciseId: test.exerciseId },
    });

    await prisma.$transaction(async (tx) => {
      // 1. Delete all existing submissions if they exist
      if (assignment) {
        await tx.exerciseSubmission.deleteMany({
          where: { assignmentId: assignment.id },
        });
      }

      // 2. Update Exercise
      if (input.title || input.subjectId || input.topicId || input.timeLimitMinutes) {
        await tx.exercise.update({
          where: { id: test.exerciseId },
          data: {
            title: input.title,
            subjectId: input.subjectId,
            topicId: input.topicId,
            timeLimitMinutes: input.timeLimitMinutes,
          }
        });
      }

      // 3. Update Questions (Delete all old, insert new)
      if (input.questions) {
        await tx.exerciseQuestion.deleteMany({
          where: { exerciseId: test.exerciseId },
        });

        if (input.questions.length > 0) {
          await tx.exerciseQuestion.createMany({
            data: input.questions.map((q: any, index: number) => ({
              id: require('nanoid').nanoid(36),
              exerciseId: test.exerciseId,
              questionText: q.questionText,
              questionType: q.questionType,
              orderIndex: q.orderIndex ?? (index + 1),
              points: q.points ?? 1,
              content: q.content ?? null,
              explanation: q.explanation ?? null,
              hints: q.hints ?? null,
              autoGrade: q.autoGrade ?? (q.questionType !== 'essay'),
              aiGradingEnabled: q.aiGradingEnabled ?? false,
            })),
          });
        }
      }

      // 4. Update Test
      await tx.test.update({
        where: { id },
        data: {
          testType: input.testType,
          subjectId: input.subjectId,
          topicId: input.topicId,
          timeLimitMinutes: input.timeLimitMinutes,
          passingScore: input.passingScore,
          maxAttempts: input.maxAttempts,
          shuffleQuestions: input.shuffleQuestions,
          shuffleOptions: input.shuffleOptions,
          showResult: input.showResult,
          startTime: input.startTime,
          endTime: input.endTime,
        },
      });

      // 5. Update Assignment
      if (assignment && (input.assignedToType || input.assignedToId || input.endTime || input.maxAttempts)) {
        await tx.assignment.update({
          where: { id: assignment.id },
          data: {
            assignedToType: input.assignedToType as any,
            assignedToId: input.assignedToId,
            dueDate: input.endTime ? new Date(input.endTime).toISOString() : null,
            maxAttempts: input.maxAttempts,
          },
        });
      }
    });

    res.json({ success: true, message: 'Đã cập nhật bài kiểm tra' });
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
