import { ExerciseEntity } from './exercise';

export interface AssignmentEntity {
  id: string;
  exerciseId: string;
  assignedToType: string | null;
  assignedToId: string | null;
  assignedBy: number | null;
  dueDate: string | null;
  maxAttempts: number | null;
  status: string | null;
  exercise: ExerciseEntity;
  submissions?: AssignmentSubmission[];
  assigner?: { id: number; name: string } | null;
}

export interface AssignmentSubmission {
  id: string;
  totalScore: number | null;
  percentage: number | null;
  status: string | null;
  submittedAt: string | null;
  attemptNumber: number | null;
  isLate: boolean | null;
}

export interface AssignmentStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  averageScore: number | null;
}

export type StudentAssignmentStatus = 'all' | 'active' | 'submitted' | 'overdue';

export const ASSIGNMENT_STATUS_LABELS: Record<string, string> = {
  active: 'Đang mở',
  submitted: 'Đã nộp',
  overdue: 'Quá hạn',
  pending: 'Chưa bắt đầu',
  graded: 'Đã chấm',
};

export const ASSIGNMENT_STATUS_COLORS: Record<string, string> = {
  active: 'bg-blue-100 text-blue-700',
  submitted: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
  pending: 'bg-gray-100 text-gray-700',
  graded: 'bg-purple-100 text-purple-700',
};
