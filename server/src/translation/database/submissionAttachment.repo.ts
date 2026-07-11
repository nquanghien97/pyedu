import { prisma } from './prisma';
import { nanoid } from 'nanoid';

export interface CreateSubmissionAttachmentInput {
  submissionId: string;
  fileName: string;
  fileUrl: string;
  publicId?: string;
  fileType: string;
  fileSize?: number;
}

export const submissionAttachmentRepository = {
  async create(data: CreateSubmissionAttachmentInput) {
    return prisma.submissionAttachment.create({
      data: {
        id: nanoid(36),
        submissionId: data.submissionId,
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        publicId: data.publicId ?? null,
        fileType: data.fileType,
        fileSize: data.fileSize ?? null,
        ocrStatus: 'pending',
      },
    });
  },

  async findBySubmissionId(submissionId: string) {
    return prisma.submissionAttachment.findMany({
      where: { submissionId },
      orderBy: { createdAt: 'asc' },
    });
  },

  async findById(id: string) {
    return prisma.submissionAttachment.findUnique({
      where: { id },
    });
  },

  async delete(id: string) {
    return prisma.submissionAttachment.delete({
      where: { id },
    });
  },

  async updateOcrStatus(id: string, ocrStatus: string, ocrResult?: any) {
    return prisma.submissionAttachment.update({
      where: { id },
      data: {
        ocrStatus,
        ocrResult: ocrResult ?? undefined,
      },
    });
  },
};
