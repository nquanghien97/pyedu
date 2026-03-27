import { z } from 'zod';

export const createTopicSchema = z.object({
  subjectId: z.string().length(36),
  name: z.string().min(1, 'Tên chủ đề không được để trống').max(255),
  orderIndex: z.number().int().optional(),
  parentTopicId: z.string().length(36).nullable().optional(),
});

export const updateTopicSchema = createTopicSchema.partial().omit({ subjectId: true });

export type CreateTopicInput = z.infer<typeof createTopicSchema>;
export type UpdateTopicInput = z.infer<typeof updateTopicSchema>;
