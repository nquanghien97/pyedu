import { api } from '@/lib/api';

export interface ClassEntity {
  id: string;
  name: string;
  grade: number;
  tutorId: string;
  _count?: { enrollments: number };
}

export interface ClassEnrollmentEntity {
  id: string;
  classId: string;
  studentId: string;
  student?: {
    user?: {
      name: string;
      email: string;
    };
  };
}

export const classService = {
  getClasses: async () => {
    return api<ClassEntity[]>({ url: '/api/v1/classes' });
  },

  createClass: async (data: { name: string; grade: number }) => {
    return api<ClassEntity>({
      url: '/api/v1/classes',
      options: {
        method: 'POST',
        body: JSON.stringify(data),
      },
    });
  },

  getClassStudents: async (classId: string) => {
    return api<ClassEnrollmentEntity[]>({ url: `/api/v1/classes/${classId}/students` });
  },

  enrollStudent: async (classId: string, studentId: string) => {
    return api<ClassEnrollmentEntity>({
      url: `/api/v1/classes/${classId}/students`,
      options: {
        method: 'POST',
        body: JSON.stringify({ studentId }),
      },
    });
  },

  removeStudent: async (classId: string, studentId: string) => {
    return api({
      url: `/api/v1/classes/${classId}/students/${studentId}`,
      options: { method: 'DELETE' },
    });
  },
};
