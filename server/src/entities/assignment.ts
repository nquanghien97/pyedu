import { z } from 'zod';

export const ASSIGN_TO_TYPES = ['student', 'class'] as const;
export const ASSIGNMENT_STATUSES = ['active', 'closed', 'draft'] as const;

export type AssignToType = (typeof ASSIGN_TO_TYPES)[number];
export type AssignmentStatus = (typeof ASSIGNMENT_STATUSES)[number];

export const createAssignmentSchema = z.object({
  exerciseId: z.string().length(36, 'exerciseId phải có 36 ký tự'),
  assignedToType: z.enum(ASSIGN_TO_TYPES),
  assignedToId: z.string().length(36, 'assignedToId phải có 36 ký tự'),
  dueDate: z.string().datetime().optional(),
  maxAttempts: z.number().int().min(1).optional(),
});

export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;

export interface TeacherAssignmentFilters {
  exerciseId?: string;
  assignedToType?: string;
  status?: string;
  search?: string;
}
