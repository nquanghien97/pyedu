import { z } from 'zod';

export const createSubjectSchema = z.object({
  name: z.string().min(1, 'Tên môn học không được để trống').max(255),
  gradeId: z.string().length(36).nullable().optional(),
  parentSubjectId: z.string().length(36).nullable().optional(),
});

export const updateSubjectSchema = createSubjectSchema.partial();

export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>;

export interface SubjectDto {
  id: string;
  name: string;
  gradeId: string | null;
  parentSubjectId: string | null;
  createdAt: Date;
  updatedAt: Date;
  children?: SubjectDto[];
  topics?: TopicDto[];
}

export interface TopicDto {
  id: string;
  subjectId: string;
  name: string;
  orderIndex: number | null;
  parentTopicId: string | null;
  createdAt: Date;
  updatedAt: Date;
  children?: TopicDto[];
}
