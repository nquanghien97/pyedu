import { prisma } from './prisma';
import { nanoid } from 'nanoid';

export const testRepository = {
  async create(data: {
    exerciseId: string;
    topicId?: string;
    subjectId?: string;
    testType: string;
    timeLimitMinutes: number;
    passingScore: number;
    maxAttempts?: number;
    shuffleQuestions?: boolean;
    shuffleOptions?: boolean;
    showResult: string;
    startTime?: Date;
    endTime?: Date;
    isPublished?: boolean;
  }) {
    return prisma.test.create({
      data: {
        id: nanoid(36),
        ...data,
      },
    });
  },

  async update(id: string, data: any) {
    return prisma.test.update({
      where: { id },
      data,
    });
  },

  async delete(id: string) {
    return prisma.test.delete({
      where: { id },
    });
  },

  async findById(id: string) {
    return prisma.test.findUnique({
      where: { id },
      include: {
        exercise: {
          include: {
            questions: {
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
        subject: true,
        topic: true,
      },
    });
  },

  async findByTeacher(teacherId: number) {
    return prisma.test.findMany({
      where: {
        exercise: {
          createdBy: teacherId,
        },
      },
      include: {
        exercise: {
          select: { title: true, status: true },
        },
        subject: { select: { name: true } },
        topic: { select: { name: true } },
      },
      orderBy: { startTime: 'desc' },
    });
  },

  async findAvailableForStudent() {
    const now = new Date();
    return prisma.test.findMany({
      where: {
        isPublished: true,
        startTime: { lte: now },
        OR: [
          { endTime: { gte: now } },
          { endTime: null },
        ],
      },
      include: {
        exercise: {
          select: { title: true, totalPoints: true },
        },
        subject: { select: { name: true } },
      },
      orderBy: { startTime: 'asc' },
    });
  }
};
