import { api } from '@/lib/api';
import { ExerciseEntity } from '@/entity/exercise';

interface ExerciseListResponse {
  exercises: ExerciseEntity[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface ExerciseFilters {
  page?: number;
  limit?: number;
  grade?: number | string;
  subjectId?: string;
  topicId?: string;
  difficultyLevel?: string;
  exerciseType?: string;
  status?: string;
  search?: string;
}

function buildQueryString(filters: ExerciseFilters): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.set(key, String(value));
    }
  });
  return params.toString();
}

export interface ExerciseStats {
  statistics?: {
    total: number;
    published: number;
    draft: number;
  };
}

export async function getExercises(filters: ExerciseFilters = {}) {
  const query = buildQueryString({ page: 1, limit: 20, ...filters });
  return api<ExerciseEntity[], ExerciseStats>({ url: `/api/v1/exercises?${query}` });
}

export async function getExerciseById(id: string) {
  return api<ExerciseEntity>({ url: `/api/v1/exercises/${id}` });
}

export async function createExercise(data: {
  title: string;
  grade?: number;
  subjectId?: string;
  topicId?: string;
  exerciseType?: string;
  difficultyLevel?: string;
  totalPoints?: number;
  timeLimitMinutes?: number;
  questions?: Array<{
    questionText: string;
    questionType: string;
    orderIndex?: number;
    points?: number;
    content?: unknown;
    explanation?: string;
    hints?: string[];
    autoGrade?: boolean;
    aiGradingEnabled?: boolean;
  }>;
}) {
  return api<ExerciseEntity>({
    url: '/api/v1/exercises',
    options: { method: 'POST', body: JSON.stringify(data) },
  });
}

export async function updateExercise(id: string, data: Record<string, unknown>) {
  return api<ExerciseEntity>({
    url: `/api/v1/exercises/${id}`,
    options: { method: 'PUT', body: JSON.stringify(data) },
  });
}

export async function updateExerciseStatus(id: string, status: string) {
  return api<ExerciseEntity>({
    url: `/api/v1/exercises/${id}/status`,
    options: { method: 'PATCH', body: JSON.stringify({ status }) },
  });
}

export async function deleteExercise(id: string) {
  return api({ url: `/api/v1/exercises/${id}`, options: { method: 'DELETE' } });
}

export async function addQuestion(exerciseId: string, data: Record<string, unknown>) {
  return api({
    url: `/api/v1/exercises/${exerciseId}/questions`,
    options: { method: 'POST', body: JSON.stringify(data) },
  });
}

export async function updateQuestion(exerciseId: string, questionId: string, data: Record<string, unknown>) {
  return api({
    url: `/api/v1/exercises/${exerciseId}/questions/${questionId}`,
    options: { method: 'PUT', body: JSON.stringify(data) },
  });
}

export async function deleteQuestion(exerciseId: string, questionId: string) {
  return api({
    url: `/api/v1/exercises/${exerciseId}/questions/${questionId}`,
    options: { method: 'DELETE' },
  });
}
