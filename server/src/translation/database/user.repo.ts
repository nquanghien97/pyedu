import * as bcrypt from 'bcryptjs';
import { BasicUser, CreateUser } from '../../entities/user';
import { prisma } from './prisma';
import { User } from '../../generated/prisma/client';

const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

export const userRepository = {
  async createUser(user: CreateUser): Promise<User & { createdAt: Date }> {
    const hashedPassword = await hashPassword(user.password);
    const newUser = await prisma.user.create({
      data: {
        ...user,
        password: hashedPassword,
      },
    });
    return {
      ...newUser,
      createdAt: new Date(),
    };
  },

  async loginUser(email: string, password: string): Promise<BasicUser | undefined> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return undefined;
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return undefined;
    }
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  },

  async getUserById(id: number): Promise<BasicUser | undefined> {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return undefined;
    }
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}