import { prisma } from './prisma';
import { CreateTopicInput, UpdateTopicInput } from '../../entities/topic';
import { nanoid } from 'nanoid';

export const topicRepository = {
  async findBySubjectId(subjectId: string) {
    return prisma.topic.findMany({
      where: { subjectId, parentTopicId: null },
      include: {
        children: {
          orderBy: { orderIndex: 'asc' },
        },
      },
      orderBy: { orderIndex: 'asc' },
    });
  },

  async findById(id: string) {
    return prisma.topic.findUnique({
      where: { id },
      include: {
        children: {
          orderBy: { orderIndex: 'asc' },
        },
        subject: true,
      },
    });
  },

  async create(data: CreateTopicInput) {
    return prisma.topic.create({
      data: {
        id: nanoid(36),
        subjectId: data.subjectId,
        name: data.name,
        orderIndex: data.orderIndex ?? null,
        parentTopicId: data.parentTopicId ?? null,
      },
    });
  },

  async update(id: string, data: UpdateTopicInput) {
    return prisma.topic.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.orderIndex !== undefined && { orderIndex: data.orderIndex }),
        ...(data.parentTopicId !== undefined && { parentTopicId: data.parentTopicId }),
      },
    });
  },

  async delete(id: string) {
    return prisma.topic.delete({ where: { id } });
  },
};
