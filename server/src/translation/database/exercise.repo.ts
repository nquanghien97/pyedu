import { prisma } from './prisma';
import { CreateExerciseInput, UpdateExerciseInput, ExerciseFilters, Pagination, QuestionInput } from '../../entities/exercise';
import { nanoid } from 'nanoid';
import { Prisma } from '../../generated/prisma/client';

function buildWhereClause(filters: ExerciseFilters): Prisma.ExerciseWhereInput {
  const where: Prisma.ExerciseWhereInput = {};

  if (filters.grade) where.grade = filters.grade;
  if (filters.subjectId) where.subjectId = filters.subjectId;
  if (filters.topicId) where.topicId = filters.topicId;
  if (filters.difficultyLevel) where.difficultyLevel = filters.difficultyLevel;
  if (filters.exerciseType) where.exerciseType = filters.exerciseType;
  if (filters.status) where.status = filters.status;
  if (filters.isAiGenerated !== undefined) where.isAiGenerated = filters.isAiGenerated;
  if (filters.createdBy) where.createdBy = filters.createdBy;
  if (filters.search) {
    where.title = { contains: filters.search, mode: 'insensitive' };
  }

  return where;
}

export const exerciseRepository = {
  async findAll(filters: ExerciseFilters, pagination: Pagination) {
    const where = buildWhereClause(filters);
    const skip = (pagination.page - 1) * pagination.limit;

    const [exercises, total] = await Promise.all([
      prisma.exercise.findMany({
        where,
        include: {
          subject: { select: { id: true, name: true } },
          topic: { select: { id: true, name: true } },
          creator: { select: { id: true, name: true } },
          _count: { select: { questions: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pagination.limit,
      }),
      prisma.exercise.count({ where }),
    ]);

    return {
      exercises,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  },

  async findById(id: string) {
    return prisma.exercise.findUnique({
      where: { id },
      include: {
        subject: { select: { id: true, name: true } },
        topic: { select: { id: true, name: true } },
        creator: { select: { id: true, name: true } },
        questions: {
          orderBy: { orderIndex: 'asc' },
          include: {
            attachments: true,
          },
        },
        attachments: true,
      },
    });
  },

  async create(data: CreateExerciseInput, createdBy: number) {
    const exerciseId = nanoid(36);

    return prisma.exercise.create({
      data: {
        id: exerciseId,
        title: data.title,
        grade: data.grade ?? null,
        subjectId: data.subjectId ?? null,
        topicId: data.topicId ?? null,
        exerciseType: data.exerciseType ?? null,
        difficultyLevel: data.difficultyLevel ?? null,
        totalPoints: data.totalPoints ?? null,
        timeLimitMinutes: data.timeLimitMinutes ?? null,
        status: 'draft',
        createdBy,
        questions: data.questions
          ? {
              create: data.questions.map((q, index) => ({
                id: nanoid(36),
                questionText: q.questionText,
                questionType: q.questionType,
                orderIndex: q.orderIndex ?? index + 1,
                points: q.points ?? null,
                content: (q.content ?? Prisma.JsonNull),
                explanation: q.explanation ?? null,
                hints: (q.hints ?? Prisma.JsonNull),
                autoGrade: q.autoGrade ?? false,
                aiGradingEnabled: q.aiGradingEnabled ?? false,
              })),
            }
          : undefined,
      },
      include: {
        questions: { orderBy: { orderIndex: 'asc' } },
      },
    });
  },

  async update(id: string, data: UpdateExerciseInput) {
    return prisma.exercise.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.subjectId !== undefined && { subjectId: data.subjectId }),
        ...(data.grade !== undefined && { grade: data.grade }),
        ...(data.topicId !== undefined && { topicId: data.topicId }),
        ...(data.exerciseType !== undefined && { exerciseType: data.exerciseType }),
        ...(data.difficultyLevel !== undefined && { difficultyLevel: data.difficultyLevel }),
        ...(data.totalPoints !== undefined && { totalPoints: data.totalPoints }),
        ...(data.timeLimitMinutes !== undefined && { timeLimitMinutes: data.timeLimitMinutes }),
      },
      include: {
        questions: { orderBy: { orderIndex: 'asc' } },
      },
    });
  },

  async updateStatus(id: string, status: string) {
    return prisma.exercise.update({
      where: { id },
      data: { status },
    });
  },

  async delete(id: string) {
    return prisma.exercise.delete({ where: { id } });
  },

  async addQuestion(exerciseId: string, data: QuestionInput) {
    return prisma.exerciseQuestion.create({
      data: {
        id: nanoid(36),
        exerciseId,
        questionText: data.questionText,
        questionType: data.questionType,
        orderIndex: data.orderIndex ?? null,
        points: data.points ?? null,
        content: (data.content ?? Prisma.JsonNull),
        explanation: data.explanation ?? null,
        hints: (data.hints ?? Prisma.JsonNull),
        autoGrade: data.autoGrade ?? false,
        aiGradingEnabled: data.aiGradingEnabled ?? false,
      },
    });
  },

  async updateQuestion(questionId: string, data: Partial<QuestionInput>) {
    return prisma.exerciseQuestion.update({
      where: { id: questionId },
      data: {
        ...(data.questionText !== undefined && { questionText: data.questionText }),
        ...(data.questionType !== undefined && { questionType: data.questionType }),
        ...(data.orderIndex !== undefined && { orderIndex: data.orderIndex }),
        ...(data.points !== undefined && { points: data.points }),
        ...(data.content !== undefined && { content: (data.content ?? Prisma.JsonNull) }),
        ...(data.explanation !== undefined && { explanation: data.explanation }),
        ...(data.hints !== undefined && { hints: (data.hints ?? Prisma.JsonNull) }),
        ...(data.autoGrade !== undefined && { autoGrade: data.autoGrade }),
        ...(data.aiGradingEnabled !== undefined && { aiGradingEnabled: data.aiGradingEnabled }),
      } as Prisma.ExerciseQuestionUpdateInput,
    });
  },

  async deleteQuestion(questionId: string) {
    return prisma.exerciseQuestion.delete({ where: { id: questionId } });
  },
};
