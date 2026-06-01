import { z } from 'zod';

export const ASSIGN_TO_TYPES = ['student', 'class', 'all'] as const;
export const ASSIGNMENT_STATUSES = ['active', 'closed', 'draft'] as const;

export type AssignToType = (typeof ASSIGN_TO_TYPES)[number];
export type AssignmentStatus = (typeof ASSIGNMENT_STATUSES)[number];

export const createAssignmentSchema = z.object({
  exerciseId: z.string().min(1, 'Mã bài tập không được để trống'),
  assignedToType: z.enum(['class', 'student', 'all']),
  assignedToId: z.string().min(1, 'Mã đối tượng không được để trống'),
  dueDate: z.string().datetime().optional().nullable(),
  maxAttempts: z.number().int().min(1).optional(),
});

export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;

export interface TeacherAssignmentFilters {
  exerciseId?: string;
  assignedToType?: string;
  status?: string;
  search?: string;
}
