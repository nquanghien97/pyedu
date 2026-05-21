import { api } from '@/lib/api';

export interface NotificationEntity {
  id: string;
  title: string | null;
  message: string | null;
  notificationType: string | null;
  isRead: boolean;
  metadata: Record<string, unknown> | null;
  userId: number;
  createdAt: string;
}

export const notificationService = {
  getAll: async (params?: { page?: number; limit?: number; isRead?: boolean; type?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.isRead !== undefined) searchParams.set('isRead', String(params.isRead));
    if (params?.type) searchParams.set('type', params.type);

    const query = searchParams.toString();
    return api<NotificationEntity[]>({
      url: `/api/v1/notifications${query ? `?${query}` : ''}`,
    });
  },

  getUnreadCount: async () => {
    return api<{ count: number }>({
      url: '/api/v1/notifications/unread-count',
    });
  },

  markAsRead: async (id: string) => {
    return api<null>({
      url: `/api/v1/notifications/${id}/read`,
      options: { method: 'PATCH' },
    });
  },

  markAllAsRead: async () => {
    return api<null>({
      url: '/api/v1/notifications/read-all',
      options: { method: 'PATCH' },
    });
  },

  delete: async (id: string) => {
    return api<null>({
      url: `/api/v1/notifications/${id}`,
      options: { method: 'DELETE' },
    });
  },
};
