import { api } from '@/lib/api';
import { AssignmentEntity, AssignmentStats } from '@/entity/assignment';

export interface StudentAssignmentFilters {
  page?: number;
  limit?: number;
  subjectId?: string;
  search?: string;
}

export interface TeacherAssignmentFilters {
  page?: number;
  limit?: number;
  assignedToType?: string;
  status?: string;
  exerciseId?: string;
  search?: string;
}

interface StudentAssignmentsResponse {
  data: AssignmentEntity[];
  stats: AssignmentStats;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface TeacherAssignmentsResponse {
  data: AssignmentEntity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateAssignmentParam {
  exerciseId: string;
  assignedToType: 'student' | 'class';
  assignedToId: string;
  dueDate?: string;
  maxAttempts?: number;
}

function buildQueryString(filters: Record<string, any>): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.set(key, String(value));
    }
  });
  return params.toString();
}

export async function getStudentAssignments(
  filters: StudentAssignmentFilters = {}
): Promise<StudentAssignmentsResponse> {
  const query = buildQueryString({ page: 1, limit: 20, ...filters });
  const response = await api<AssignmentEntity[]>({
    url: `/api/v1/student/assignments?${query}`,
  });

  return {
    data: response.data,
    stats: (response as unknown as StudentAssignmentsResponse).stats ?? {
      total: 0,
      completed: 0,
      pending: 0,
      overdue: 0,
      averageScore: null,
    },
    pagination: response.pagination ?? {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    },
  };
}

export async function getTeacherAssignments(
  filters: TeacherAssignmentFilters = {}
): Promise<TeacherAssignmentsResponse> {
  const query = buildQueryString({ page: 1, limit: 20, ...filters });
  const response = await api<AssignmentEntity[]>({
    url: `/api/v1/teacher/assignments?${query}`,
  });

  return {
    data: response.data,
    pagination: response.pagination ?? {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    },
  };
}

export async function createTeacherAssignment(
  data: CreateAssignmentParam
): Promise<AssignmentEntity> {
  const response = await api<AssignmentEntity>({
    url: '/api/v1/teacher/assignments',
    options: {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    },
  });
  return response.data;
}
