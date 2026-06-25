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

function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

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

    const userRole = req.user?.role;
    const isStudent = userRole === 'STUDENT';

    let hasSubmitted = false;
    if (isStudent && assignment) {
      const student = await prisma.student.findUnique({
        where: { userId: req.user?.id },
      });
      if (student) {
        const submission = await prisma.exerciseSubmission.findFirst({
          where: {
            assignmentId: assignment.id,
            studentId: student.id,
            status: { in: ['submitted', 'graded'] },
          },
        });
        if (submission) {
          hasSubmitted = true;
        }
      }
    }

    let questions = test.exercise?.questions || [];

    if (isStudent && !hasSubmitted) {
      questions = questions.map((q) => {
        const scrubbedContent = q.content ? { ...(q.content as Record<string, any>) } : null;
        if (scrubbedContent) {
          delete scrubbedContent.correctAnswer;
          delete scrubbedContent.correctAnswers;
          delete scrubbedContent.sampleAnswer;
          delete scrubbedContent.rubric;

          if (Array.isArray(scrubbedContent.options)) {
            scrubbedContent.options = scrubbedContent.options.map((opt: any) => {
              if (typeof opt === 'object' && opt !== null) {
                const { isCorrect, ...rest } = opt;
                return rest;
              }
              return opt;
            });
          }
        }
        return {
          ...q,
          content: scrubbedContent,
          explanation: null,
        } as any;
      });

      if (test.shuffleQuestions) {
        questions = shuffleArray(questions);
      }

      if (test.shuffleOptions) {
        questions = questions.map((q) => {
          if (q.content && Array.isArray((q.content as any).options)) {
            return {
              ...q,
              content: {
                ...(q.content as any),
                options: shuffleArray((q.content as any).options),
              },
            };
          }
          return q;
        });
      }
    }

    const scrubbedTest = {
      ...test,
      exercise: test.exercise ? { ...test.exercise, questions } : null,
      assignmentId: assignment?.id,
    };

    res.json({ success: true, data: scrubbedTest });
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

export const publishTest = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const test = await testRepository.findById(id);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài kiểm tra' });
    }

    if (test.exercise?.createdBy !== req.user?.id && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xuất bản bài thi này' });
    }

    const updated = await testRepository.update(id, { isPublished: true });
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

export const startTest = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const test = await testRepository.findById(id);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài kiểm tra' });
    }

    if (!test.isPublished) {
      return res.status(400).json({ success: false, message: 'Bài kiểm tra chưa được xuất bản' });
    }

    const now = new Date();
    if (test.startTime && test.startTime > now) {
      return res.status(400).json({ success: false, message: 'Bài kiểm tra chưa mở' });
    }
    if (test.endTime && test.endTime < now) {
      return res.status(400).json({ success: false, message: 'Bài kiểm tra đã đóng' });
    }

    // Get student profile
    const student = await prisma.student.findUnique({
      where: { userId: req.user?.id },
    });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy profile học sinh' });
    }

    // Get assignment for this test
    const assignment = await prisma.assignment.findFirst({
      where: { exerciseId: test.exerciseId },
    });
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy Assignment của bài thi này' });
    }

    // Check max attempts
    const attemptsCount = await prisma.exerciseSubmission.count({
      where: { assignmentId: assignment.id, studentId: student.id },
    });

    if (attemptsCount >= test.maxAttempts) {
      return res.status(400).json({ success: false, message: 'Bạn đã đạt giới hạn số lần làm bài' });
    }

    // Create a new started submission
    const submission = await prisma.exerciseSubmission.create({
      data: {
        id: require('nanoid').nanoid(36),
        assignmentId: assignment.id,
        studentId: student.id,
        startedAt: new Date(),
        attemptNumber: attemptsCount + 1,
        status: 'started',
      },
    });

    res.json({ success: true, data: submission });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

export const submitTest = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { answers } = req.body; // array of { questionId, answerData }

    const test = await testRepository.findById(id);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài kiểm tra' });
    }

    // Get student profile
    const student = await prisma.student.findUnique({
      where: { userId: req.user?.id },
    });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy profile học sinh' });
    }

    // Get assignment
    const assignment = await prisma.assignment.findFirst({
      where: { exerciseId: test.exerciseId },
      include: { exercise: { include: { questions: true } } },
    });
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy Assignment của bài thi này' });
    }

    // Find the current started submission
    const submission = await prisma.exerciseSubmission.findFirst({
      where: { assignmentId: assignment.id, studentId: student.id, status: 'started' },
      orderBy: { startedAt: 'desc' },
    });

    if (!submission) {
      return res.status(400).json({ success: false, message: 'Không tìm thấy lượt làm bài thi đang diễn ra' });
    }

    const now = new Date();
    const elapsedSeconds = Math.floor((now.getTime() - submission.startedAt!.getTime()) / 1000);
    const limitSeconds = test.timeLimitMinutes * 60;
    const graceBuffer = 60; // 60s buffer

    // Auto-grade
    const { gradeSubmission } = await import('../../../execution/grading/grading.service');
    const gradingResults = await gradeSubmission(
      assignment.exercise.questions.map((q) => ({
        id: q.id,
        questionText: q.questionText,
        questionType: q.questionType,
        points: q.points ? Number(q.points) : null,
        content: q.content,
        autoGrade: q.autoGrade,
        aiGradingEnabled: q.aiGradingEnabled,
      })),
      answers.map((a: any) => ({
        questionId: a.questionId,
        answerData: a.answerData,
      }))
    );

    const totalPointsEarned = gradingResults.reduce((sum, r) => sum + (r.pointsEarned ?? 0), 0);
    const maxPoints = Number(assignment.exercise.totalPoints || 0);
    const percentage = maxPoints > 0 ? (totalPointsEarned / maxPoints) * 100 : 0;

    // Update submission inside transaction
    const updatedSubmission = await prisma.$transaction(async (tx) => {
      // Create answers first
      if (gradingResults.length > 0) {
        await tx.submissionAnswer.createMany({
          data: gradingResults.map((r) => ({
            id: require('nanoid').nanoid(36),
            submissionId: submission.id,
            questionId: r.questionId,
            answerData: (answers.find((a: any) => a.questionId === r.questionId)?.answerData) as any,
            isCorrect: r.isCorrect,
            pointsEarned: r.pointsEarned,
            feedback: r.feedback,
          })),
        });
      }

      return tx.exerciseSubmission.update({
        where: { id: submission.id },
        data: {
          submittedAt: now,
          status: 'graded',
          totalScore: totalPointsEarned,
          percentage,
          isLate: elapsedSeconds > limitSeconds + graceBuffer,
        },
      });
    });

    // Update student progress in background
    const { updateStudentProgress } = await import('../../../execution/progress/progress.service');
    updateStudentProgress(
      student.id,
      assignment.exercise.subjectId,
      assignment.exercise.topicId
    ).catch(() => {});

    res.json({ success: true, data: updatedSubmission });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Lỗi server khi nộp bài' });
  }
};

export const getTestLeaderboard = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const test = await testRepository.findById(id);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài kiểm tra' });
    }

    const assignment = await prisma.assignment.findFirst({
      where: { exerciseId: test.exerciseId },
    });
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy Assignment của bài thi này' });
    }

    // Get all graded submissions for this assignment
    const submissions = await prisma.exerciseSubmission.findMany({
      where: { assignmentId: assignment.id, status: 'graded' },
      include: {
        student: {
          include: { user: { select: { name: true } } },
        },
      },
      orderBy: [
        { totalScore: 'desc' },
        { submittedAt: 'asc' }, // faster submission takes precedence if scores are tied
      ],
    });

    // Map to leaderboard format
    const leaderboard = submissions.map((sub, index) => {
      const timeSpentSeconds = sub.startedAt && sub.submittedAt
        ? Math.floor((sub.submittedAt.getTime() - sub.startedAt.getTime()) / 1000)
        : 0;

      const formatDuration = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
      };

      return {
        rank: index + 1,
        studentName: sub.student.user.name || 'Học sinh',
        score: sub.totalScore ? Number(sub.totalScore) : 0,
        percentage: sub.percentage ? Number(sub.percentage) : 0,
        completionTime: formatDuration(timeSpentSeconds),
        submittedAt: sub.submittedAt,
      };
    });

    res.json({
      success: true,
      data: {
        testTitle: test.exercise?.title || 'Bài kiểm tra',
        totalStudents: leaderboard.length,
        leaderboard,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

export const getTestStatistics = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const test = await testRepository.findById(id);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài kiểm tra' });
    }

    const assignment = await prisma.assignment.findFirst({
      where: { exerciseId: test.exerciseId },
    });
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy Assignment của bài thi này' });
    }

    const submissions = await prisma.exerciseSubmission.findMany({
      where: { assignmentId: assignment.id, status: 'graded' },
    });

    if (submissions.length === 0) {
      return res.json({
        success: true,
        data: {
          totalSubmissions: 0,
          averageScore: 0,
          highestScore: 0,
          lowestScore: 0,
          passRate: 0,
        },
      });
    }

    const scores = submissions.map((sub) => sub.totalScore ? Number(sub.totalScore) : 0);
    const percentages = submissions.map((sub) => sub.percentage ? Number(sub.percentage) : 0);

    const totalSubmissions = submissions.length;
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);
    const averageScore = Math.round((scores.reduce((sum, val) => sum + val, 0) / totalSubmissions) * 100) / 100;

    const passingScorePercent = Number(test.passingScore || 50);
    const passedCount = percentages.filter((p) => p >= passingScorePercent).length;
    const passRate = Math.round((passedCount / totalSubmissions) * 10000) / 100;

    res.json({
      success: true,
      data: {
        totalSubmissions,
        averageScore,
        highestScore,
        lowestScore,
        passRate,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

export const getTestResult = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const test = await testRepository.findById(id);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài kiểm tra' });
    }

    const student = await prisma.student.findUnique({
      where: { userId: req.user?.id },
    });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy profile học sinh' });
    }

    const assignment = await prisma.assignment.findFirst({
      where: { exerciseId: test.exerciseId },
    });
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy Assignment của bài thi này' });
    }

    const submission = await prisma.exerciseSubmission.findFirst({
      where: { assignmentId: assignment.id, studentId: student.id, status: 'graded' },
      include: {
        answers: {
          include: { question: true },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy kết quả làm bài của bạn' });
    }

    res.json({ success: true, data: submission });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
