import { notificationRepository, CreateNotificationInput } from '../../translation/database/notification.repo';
import { notificationEmitter } from './notificationEmitter';

export const notificationService = {
  /**
   * Tạo 1 thông báo và đẩy real-time qua SSE
   */
  async create(data: CreateNotificationInput) {
    const notification = await notificationRepository.create(data);
    // Emit real-time event cho SSE handler
    notificationEmitter.emit(`notification:${data.userId}`, notification);
    return notification;
  },

  /**
   * Tạo nhiều thông báo cùng lúc (bulk) và đẩy real-time
   */
  async bulkCreate(items: CreateNotificationInput[]) {
    const result = await notificationRepository.bulkCreate(items);

    // Emit real-time cho từng user (gộp theo userId)
    const userIds = [...new Set(items.map((i) => i.userId))];
    for (const userId of userIds) {
      const userItems = items.filter((i) => i.userId === userId);
      // Emit 1 event tổng hợp cho mỗi user
      notificationEmitter.emit(`notification:${userId}`, {
        type: 'bulk',
        count: userItems.length,
        title: userItems[0]?.title || 'Thông báo mới',
      });
    }

    return result;
  },

  /**
   * Lấy danh sách thông báo theo user (phân trang)
   */
  async getByUser(
    userId: number,
    options: { page: number; limit: number; isRead?: boolean; type?: string }
  ) {
    return notificationRepository.findByUser(userId, options);
  },

  /**
   * Đếm số thông báo chưa đọc
   */
  async getUnreadCount(userId: number) {
    return notificationRepository.getUnreadCount(userId);
  },

  /**
   * Đánh dấu 1 thông báo đã đọc
   */
  async markAsRead(id: string, userId: number) {
    return notificationRepository.markAsRead(id, userId);
  },

  /**
   * Đánh dấu tất cả thông báo đã đọc
   */
  async markAllAsRead(userId: number) {
    return notificationRepository.markAllAsRead(userId);
  },

  /**
   * Xóa 1 thông báo
   */
  async delete(id: string, userId: number) {
    return notificationRepository.delete(id, userId);
  },
};
