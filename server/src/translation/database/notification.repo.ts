import { prisma } from './prisma';
import { nanoid } from 'nanoid';
import { Prisma } from '../../generated/prisma/client';

export interface CreateNotificationInput {
  userId: number;
  title: string;
  message: string;
  notificationType: string;
  metadata?: Record<string, unknown>;
}

export const notificationRepository = {
  async create(data: CreateNotificationInput) {
    return prisma.notification.create({
      data: {
        id: nanoid(36),
        userId: data.userId,
        title: data.title,
        message: data.message,
        notificationType: data.notificationType,
        metadata: data.metadata ? (data.metadata as Prisma.InputJsonValue) : Prisma.JsonNull,
        isRead: false,
      },
    });
  },

  async bulkCreate(items: CreateNotificationInput[]) {
    const data = items.map((item) => ({
      id: nanoid(36),
      userId: item.userId,
      title: item.title,
      message: item.message,
      notificationType: item.notificationType,
      metadata: item.metadata ? (item.metadata as Prisma.InputJsonValue) : Prisma.JsonNull,
      isRead: false,
    }));

    return prisma.notification.createMany({ data });
  },

  async findByUser(
    userId: number,
    options: { page: number; limit: number; isRead?: boolean; type?: string }
  ) {
    const where: Prisma.NotificationWhereInput = { userId };
    if (options.isRead !== undefined) where.isRead = options.isRead;
    if (options.type) where.notificationType = options.type;

    const skip = (options.page - 1) * options.limit;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: options.limit,
      }),
      prisma.notification.count({ where }),
    ]);

    return {
      notifications,
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
    };
  },

  async getUnreadCount(userId: number): Promise<number> {
    return prisma.notification.count({
      where: { userId, isRead: false },
    });
  },

  async markAsRead(id: string, userId: number) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  },

  async markAllAsRead(userId: number) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  },

  async delete(id: string, userId: number) {
    return prisma.notification.deleteMany({
      where: { id, userId },
    });
  },
};
