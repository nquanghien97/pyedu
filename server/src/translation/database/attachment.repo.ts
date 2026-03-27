import { prisma } from './prisma';
import { nanoid } from 'nanoid';

export interface CreateAttachmentInput {
  exerciseId: string;
  questionId?: string;
  fileName: string;
  fileUrl: string;
  publicId?: string;
  fileType: string;
  fileSize?: number;
}

export const attachmentRepository = {
  async create(data: CreateAttachmentInput) {
    return prisma.exerciseAttachment.create({
      data: {
        id: nanoid(36),
        exerciseId: data.exerciseId,
        questionId: data.questionId ?? null,
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        publicId: data.publicId ?? null,
        fileType: data.fileType,
        fileSize: data.fileSize ?? null,
      },
    });
  },

  async findByExerciseId(exerciseId: string) {
    return prisma.exerciseAttachment.findMany({
      where: { exerciseId },
      orderBy: { createdAt: 'asc' },
    });
  },

  async findById(id: string) {
    return prisma.exerciseAttachment.findUnique({
      where: { id },
    });
  },

  async delete(id: string) {
    return prisma.exerciseAttachment.delete({
      where: { id },
    });
  },
};
