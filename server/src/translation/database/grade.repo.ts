import { prisma } from './prisma';
import type { Grade } from '../../generated/prisma/client';
import { CreateGradeInput, UpdateGradeInput } from '../../entities/grade';
import { nanoid } from 'nanoid';

export const generateId = () => nanoid(36);

export class GradeRepository {
  async findMany(includeSubjects = false): Promise<Grade[]> {
    return prisma.grade.findMany({
      orderBy: { createdAt: 'asc' },
      include: includeSubjects
        ? {
            subjects: {
              orderBy: { createdAt: 'asc' },
              where: { parentSubjectId: null },
              include: {
                children: true,
                topics: {
                  where: { parentTopicId: null },
                  orderBy: { orderIndex: 'asc' },
                  include: {
                    children: true,
                  },
                },
              },
            },
          }
        : undefined,
    });
  }

  async findById(id: string): Promise<Grade | null> {
    return prisma.grade.findUnique({
      where: { id },
    });
  }

  async create(data: CreateGradeInput): Promise<Grade> {
    return prisma.grade.create({
      data: {
        id: generateId(),
        name: data.name,
        description: data.description,
      },
    });
  }

  async update(id: string, data: UpdateGradeInput): Promise<Grade> {
    return prisma.grade.update({
      where: { id },
      data: {
        name: data.name !== undefined ? data.name : undefined,
        description: data.description !== undefined ? data.description : undefined,
      },
    });
  }

  async delete(id: string): Promise<Grade> {
    return prisma.grade.delete({
      where: { id },
    });
  }
}

export const gradeRepository = new GradeRepository();
