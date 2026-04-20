import { prisma } from './prisma';
import { nanoid } from 'nanoid';

export interface CreateAutoAssignConfigInput {
  tutorId: string;
  classId?: string;
  subjectId: string;
  topicId?: string;
  difficultyLevel?: string;
  exercisesPerDay?: number;
  isActive?: boolean;
  daysOfWeek?: number[];
}

export interface UpdateAutoAssignConfigInput {
  classId?: string;
  subjectId?: string;
  topicId?: string | null;
  difficultyLevel?: string | null;
  exercisesPerDay?: number;
  isActive?: boolean;
  daysOfWeek?: number[];
}

export const autoAssignRepository = {
  async findByTutorId(tutorId: string) {
    return prisma.autoAssignConfig.findMany({
      where: { tutorId },
      include: {
        class: true,
        subject: true,
        topic: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async findById(id: string) {
    return prisma.autoAssignConfig.findUnique({
      where: { id },
      include: {
        class: true,
        subject: true,
        topic: true,
        tutor: { include: { user: { select: { name: true } } } },
      },
    });
  },

  async findActiveConfigs() {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sun ... 6=Sat

    return prisma.autoAssignConfig.findMany({
      where: { isActive: true },
      include: {
        tutor: { include: { user: { select: { id: true } } } },
        class: { include: { enrollments: { include: { student: true } } } },
        subject: true,
        topic: true,
      },
    });
  },

  async create(data: CreateAutoAssignConfigInput) {
    const id = nanoid();
    return prisma.autoAssignConfig.create({
      data: {
        id,
        tutorId: data.tutorId,
        classId: data.classId ?? null,
        subjectId: data.subjectId,
        topicId: data.topicId ?? null,
        difficultyLevel: data.difficultyLevel ?? null,
        exercisesPerDay: data.exercisesPerDay ?? 1,
        isActive: data.isActive ?? true,
        daysOfWeek: data.daysOfWeek ?? [1, 2, 3, 4, 5],
      },
      include: {
        class: true,
        subject: true,
        topic: true,
      },
    });
  },

  async update(id: string, data: UpdateAutoAssignConfigInput) {
    return prisma.autoAssignConfig.update({
      where: { id },
      data,
      include: {
        class: true,
        subject: true,
        topic: true,
      },
    });
  },

  async delete(id: string) {
    return prisma.autoAssignConfig.delete({ where: { id } });
  },
};
