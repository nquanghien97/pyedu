import { SubjectEntity } from './subject';

export interface GradeEntity {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  subjects?: SubjectEntity[];
}

export interface CreateGradeDto {
  name: string;
  description?: string;
}

export interface UpdateGradeDto {
  name?: string;
  description?: string;
}
