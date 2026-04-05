import { prisma } from './prisma';
import { CreateSubjectInput, UpdateSubjectInput } from '../../entities/subject';
import { nanoid } from 'nanoid';

export const subjectRepository = {
  async findAll() {
    return prisma.subject.findMany({
      where: { parentSubjectId: null },
      include: {
        children: {
          include: {
            children: true,
          },
        },
        topics: {
          where: { parentTopicId: null },
          orderBy: { orderIndex: 'asc' },
          include: {
            children: {
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  },

  async findById(id: string) {
    return prisma.subject.findUnique({
      where: { id },
      include: {
        children: true,
        topics: {
          where: { parentTopicId: null },
          orderBy: { orderIndex: 'asc' },
          include: {
            children: {
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
      },
    });
  },

  async create(data: CreateSubjectInput) {
    return prisma.subject.create({
      data: {
        id: nanoid(36),
        name: data.name,
        grade: data.grade ?? null,
        parentSubjectId: data.parentSubjectId ?? null,
      },
    });
  },

  async update(id: string, data: UpdateSubjectInput) {
    return prisma.subject.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.grade !== undefined && { grade: data.grade }),
        ...(data.parentSubjectId !== undefined && { parentSubjectId: data.parentSubjectId }),
      },
    });
  },

  async delete(id: string) {
    return prisma.subject.delete({ where: { id } });
  },
};
