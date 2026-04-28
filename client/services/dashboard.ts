import { api, ApiResponse } from '@/lib/api';

interface TeacherDashboardStats {
  totalStudents: number;
  totalAssignments: number;
  completionRate: number;
  pendingGrading: number;
  recentAssignments: {
    id: string;
    name: string;
    assignedToType: string | null;
    dueDate: string | null;
    status: string | null;
  }[];
}

interface StudentDashboardStats {
  pendingAssignments: number;
  averageScore: number;
  completedAssignments: number;
  totalAssignments: number;
  recentSubmissions: {
    id: string;
    exerciseName: string;
    score: number | null;
    status: string | null;
    submittedAt: string | null;
    attemptCount: number;
  }[];
}

export async function getTeacherDashboardStats(): Promise<ApiResponse<TeacherDashboardStats>> {
  return api<TeacherDashboardStats>({
    url: '/api/v1/teacher/dashboard-stats',
  });
}

export async function getStudentDashboardStats(): Promise<ApiResponse<StudentDashboardStats>> {
  return api<StudentDashboardStats>({
    url: '/api/v1/student/dashboard-stats',
  });
}
