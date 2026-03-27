export interface UserEntity {
  id: number;
  email: string;
  name: string;
  role: USER_ROLE;
  username: string;
}

export enum USER_ROLE {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
}