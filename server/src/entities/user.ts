import { User, USER_ROLE } from "../generated/prisma/client";

export interface BasicUser {
  name: string | null;
  id: number;
  email: string;
  role: USER_ROLE;
  createdAt: Date;
}

export type CreateUser = Omit<User, 'id' | 'createdAt'>;