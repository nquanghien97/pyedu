import { create } from 'zustand';
import { NotificationEntity, notificationService } from '@/services/notification';

interface NotificationStoreState {
  notifications: NotificationEntity[];
  unreadCount: number;
  loading: boolean;

  fetchNotifications: (params?: { page?: number; limit?: number }) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addRealTimeNotification: (notification: NotificationEntity) => void;
}

export const useNotificationStore = create<NotificationStoreState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async (params) => {
    set({ loading: true });
    try {
      const res = await notificationService.getAll(params);
      if (res.success) {
        set({ notifications: res.data });
      }
    } catch {
      // Silently fail
    } finally {
      set({ loading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const res = await notificationService.getUnreadCount();
      if (res.success) {
        set({ unreadCount: res.data.count });
      }
    } catch {
      // Silently fail
    }
  },

  markAsRead: async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch {
      // Silently fail
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationService.markAllAsRead();
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch {
      // Silently fail
    }
  },

  addRealTimeNotification: (notification: NotificationEntity) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },
}));
