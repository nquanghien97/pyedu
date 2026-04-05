import { api } from '@/lib/api';

export interface DropdownClass {
  id: string;
  name: string;
}

export interface DropdownStudent {
  id: string;
  name: string;
  email: string;
}

export async function getTeacherClasses(): Promise<DropdownClass[]> {
  const res = await api<DropdownClass[]>({ url: '/api/v1/teacher/classes' });
  return res.data;
}

export async function getTeacherStudents(): Promise<DropdownStudent[]> {
  const res = await api<DropdownStudent[]>({ url: '/api/v1/teacher/students' });
  return res.data;
}
