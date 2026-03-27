import { z } from 'zod';

export const createGradeSchema = z.object({
  name: z.string().min(1, 'Tên khối lớp không được để trống').max(255),
  description: z.string().nullable().optional(),
});

export const updateGradeSchema = createGradeSchema.partial();

export type CreateGradeInput = z.infer<typeof createGradeSchema>;
export type UpdateGradeInput = z.infer<typeof updateGradeSchema>;

export interface GradeDto {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  subjects?: Array<{
    id: string;
    name: string;
    parentSubjectId: string | null;
    topics?: Array<{
      id: string;
      name: string;
      orderIndex: number | null;
      parentTopicId: string | null;
    }>;
  }>;
}
