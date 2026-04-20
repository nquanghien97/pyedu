import { prisma } from './prisma';
import { nanoid } from 'nanoid';
import { SubmitExerciseInput } from '../../entities/submission';

interface Pagination {
  page: number;
  limit: number;
}

export const submissionRepository = {
  /**
   * Create a new submission with all answers
   */
  async create(
    assignmentId: string,
    studentId: string,
    input: SubmitExerciseInput,
    gradingResults: {
      questionId: string;
      isCorrect: boolean | null;
      pointsEarned: number | null;
      feedback: string | null;
    }[]
  ) {
    // Calculate attempt number
    const existingCount = await prisma.exerciseSubmission.count({
      where: { assignmentId, studentId },
    });

    const totalScore = gradingResults.reduce(
      (sum, r) => sum + (r.pointsEarned ?? 0),
      0
    );

    // Get total possible points
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        exercise: {
          include: {
            questions: { select: { id: true, points: true } },
          },
        },
      },
    });

    const totalPossible = assignment?.exercise.questions.reduce(
      (sum, q) => sum + Number(q.points ?? 0),
      0
    ) ?? 0;

    const percentage =
      totalPossible > 0 ? Math.round((totalScore / totalPossible) * 10000) / 100 : 0;

    const submissionId = nanoid(36);

    const submission = await prisma.exerciseSubmission.create({
      data: {
        id: submissionId,
        assignmentId,
        studentId,
        attemptNumber: existingCount + 1,
        submittedAt: new Date(),
        totalScore,
        percentage,
        status: 'graded',
        isLate: assignment?.dueDate ? new Date() > assignment.dueDate : false,
        answers: {
          create: input.answers.map((answer) => {
            const grading = gradingResults.find(
              (g) => g.questionId === answer.questionId
            );
            return {
              id: nanoid(36),
              questionId: answer.questionId,
              answerData: answer.answerData as object,
              isCorrect: grading?.isCorrect ?? null,
              pointsEarned: grading?.pointsEarned ?? null,
              feedback: grading?.feedback ?? null,
            };
          }),
        },
      },
      include: {
        answers: {
          include: {
            question: {
              select: {
                id: true,
                questionText: true,
                questionType: true,
                points: true,
                content: true,
                explanation: true,
              },
            },
          },
        },
      },
    });

    return submission;
  },

  /**
   * Get submission by ID with all details
   */
  async findById(submissionId: string) {
    return prisma.exerciseSubmission.findUnique({
      where: { id: submissionId },
      include: {
        answers: {
          include: {
            question: {
              select: {
                id: true,
                questionText: true,
                questionType: true,
                points: true,
                content: true,
                explanation: true,
                hints: true,
              },
            },
          },
        },
        assignment: {
          include: {
            exercise: {
              select: {
                id: true,
                title: true,
                grade: true,
                subject: { select: { id: true, name: true } },
                topic: { select: { id: true, name: true } },
                totalPoints: true,
                timeLimitMinutes: true,
              },
            },
          },
        },
        student: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
    });
  },

  /**
   * Get all submissions for a specific assignment (teacher view)
   */
  async findByAssignment(assignmentId: string, pagination: Pagination) {
    const skip = (pagination.page - 1) * pagination.limit;

    const [submissions, total] = await Promise.all([
      prisma.exerciseSubmission.findMany({
        where: { assignmentId },
        include: {
          student: {
            include: {
              user: { select: { name: true, email: true } },
            },
          },
          _count: { select: { answers: true } },
        },
        orderBy: { submittedAt: 'desc' },
        skip,
        take: pagination.limit,
      }),
      prisma.exerciseSubmission.count({ where: { assignmentId } }),
    ]);

    return {
      submissions,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  },

  /**
   * Get all submissions by a student for a specific assignment
   */
  async findByStudentAndAssignment(studentId: string, assignmentId: string) {
    return prisma.exerciseSubmission.findMany({
      where: { studentId, assignmentId },
      include: {
        answers: {
          include: {
            question: {
              select: {
                id: true,
                questionText: true,
                questionType: true,
                points: true,
                content: true,
                explanation: true,
              },
            },
          },
        },
      },
      orderBy: { attemptNumber: 'desc' },
    });
  },

  /**
   * Get scores for a student in a specific subject/topic (for progress calculation)
   */
  async getStudentScores(
    studentId: string,
    subjectId?: string,
    topicId?: string
  ) {
    const where: Record<string, unknown> = { studentId, status: 'graded' };

    if (subjectId || topicId) {
      where.assignment = {
        exercise: {
          ...(subjectId ? { subjectId } : {}),
          ...(topicId ? { topicId } : {}),
        },
      };
    }

    return prisma.exerciseSubmission.findMany({
      where,
      select: {
        percentage: true,
        totalScore: true,
        submittedAt: true,
        assignment: {
          select: {
            exercise: {
              select: {
                subjectId: true,
                topicId: true,
              },
            },
          },
        },
      },
    });
  },

  /**
   * Update manual grading (for essay questions)
   */
  async updateGrade(
    submissionId: string,
    updates: {
      totalScore: number;
      percentage: number;
      status: string;
      answerUpdates: { id: string; isCorrect?: boolean; pointsEarned?: number; feedback?: string }[];
    }
  ) {
    const { answerUpdates, ...submissionUpdates } = updates;
    
    return prisma.$transaction(async (tx) => {
      // Update the answers
      for (const ans of answerUpdates) {
        await tx.submissionAnswer.update({
          where: { id: ans.id },
          data: {
            isCorrect: ans.isCorrect,
            pointsEarned: ans.pointsEarned,
            feedback: ans.feedback,
          },
        });
      }

      // Update the submission
      return tx.exerciseSubmission.update({
        where: { id: submissionId },
        data: submissionUpdates,
      });
    });
  },
};
