import * as bcrypt from 'bcryptjs';
import { BasicUser, CreateUser } from '../../entities/user';
import { prisma } from './prisma';
import { User, USER_ROLE } from '../../generated/prisma/client';

const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

interface GetAllUsersParams {
  page: number;
  limit: number;
  role?: USER_ROLE;
  search?: string;
}

interface GetAllUsersResult {
  users: BasicUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

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
  },

  async getUserByEmail(email: string): Promise<BasicUser | undefined> {
    const user = await prisma.user.findUnique({ where: { email } });
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
  },

  async getAllUsers(params: GetAllUsersParams): Promise<GetAllUsersResult> {
    const { page, limit, role, search } = params;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (role) {
      where.role = role;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async updateUser(
    id: number,
    data: { name?: string; email?: string; role?: USER_ROLE; password?: string }
  ): Promise<BasicUser | undefined> {
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.password) {
      updateData.password = await hashPassword(data.password);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  },

  async deleteUser(id: number): Promise<boolean> {
    // Xoá các refresh tokens liên quan trước
    await prisma.refreshToken.deleteMany({ where: { userId: id } });
    await prisma.user.delete({ where: { id } });
    return true;
  },

  async countByRole(): Promise<{ total: number; admin: number; teacher: number; student: number }> {
    const [total, admin, teacher, student] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.count({ where: { role: 'TEACHER' } }),
      prisma.user.count({ where: { role: 'STUDENT' } }),
    ]);

    return { total, admin, teacher, student };
  },
}