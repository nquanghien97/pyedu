import { api } from '@/lib/api';
import { GradeEntity, CreateGradeDto, UpdateGradeDto } from '../entity/grade';

export const gradeService = {
  getGrades: async () => {
    return api<GradeEntity[]>({ url: '/api/v1/grades' });
  },

  getGradeById: async (id: string) => {
    return api<GradeEntity>({ url: `/api/v1/grades/${id}` });
  },

  createGrade: async (data: CreateGradeDto) => {
    return api<GradeEntity>({ url: '/api/v1/grades', options: { method: 'POST', body: JSON.stringify(data) } });
  },

  updateGrade: async (id: string, data: UpdateGradeDto) => {
    return api<GradeEntity>({ url: `/api/v1/grades/${id}`, options: { method: 'PUT', body: JSON.stringify(data) } });
  },

  deleteGrade: async (id: string) => {
    return api<{ message: string }>({ url: `/api/v1/grades/${id}`, options: { method: 'DELETE' } });
  },
};
