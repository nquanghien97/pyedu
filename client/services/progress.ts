import { api } from '@/lib/api';
import { StudentProgressResponse, TeacherStudentProgress } from '@/entity/progress';

export async function getMyProgress(): Promise<StudentProgressResponse> {
  const response = await api<StudentProgressResponse>({
    url: '/api/v1/progress/me',
  });
  return response.data;
}

export async function getStudentsProgress(
  classId?: string
): Promise<TeacherStudentProgress[]> {
  const query = classId ? `?classId=${classId}` : '';
  const response = await api<TeacherStudentProgress[]>({
    url: `/api/v1/progress/students${query}`,
  });
  return response.data;
}

export async function getStudentProgressDetail(
  studentId: string
): Promise<unknown> {
  const response = await api({
    url: `/api/v1/progress/students/${studentId}`,
  });
  return response.data;
}
