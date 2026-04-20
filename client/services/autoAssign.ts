import { api } from '@/lib/api';

export interface AutoAssignConfig {
  id: string;
  tutorId: string;
  classId?: string;
  subjectId: string;
  topicId?: string;
  difficultyLevel?: string;
  exercisesPerDay: number;
  isActive: boolean;
  daysOfWeek?: number[];
  createdAt: string;
  class?: { id: string; name: string };
  subject?: { id: string; name: string };
  topic?: { id: string; name: string };
}

export const getAutoAssignConfigs = async () => {
  return api<AutoAssignConfig[]>({ url: '/api/v1/auto-assign' });
};

export const createAutoAssignConfig = async (payload: Partial<AutoAssignConfig>) => {
  return api<AutoAssignConfig>({
    url: '/api/v1/auto-assign',
    options: {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  });
};

export const updateAutoAssignConfig = async (id: string, payload: Partial<AutoAssignConfig>) => {
  return api<AutoAssignConfig>({
    url: `/api/v1/auto-assign/${id}`,
    options: {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
  });
};

export const deleteAutoAssignConfig = async (id: string) => {
  return api<{ success: boolean }>({
    url: `/api/v1/auto-assign/${id}`,
    options: { method: 'DELETE' },
  });
};

export const triggerAutoAssign = async () => {
  return api<{ assignmentsCreated: number }>({
    url: '/api/v1/auto-assign/run',
    options: { method: 'POST' },
  });
};
