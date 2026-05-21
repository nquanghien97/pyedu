import { RequestHandler } from 'express';
import { withAsyncErrorHandling } from '../../withAsyncErrorHandling';
import { notificationService } from '../../../execution/notification/notification.service';

/**
 * GET /api/v1/notifications
 * Query: ?page=1&limit=20&isRead=true|false&type=assignment_new
 */
export const getNotifications: RequestHandler = withAsyncErrorHandling(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) { res.status(401).json({ success: false, error: 'Unauthorized' }); return; }

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const isReadParam = req.query.isRead as string | undefined;
  const isRead = isReadParam === 'true' ? true : isReadParam === 'false' ? false : undefined;
  const type = req.query.type as string | undefined;

  const result = await notificationService.getByUser(userId, { page, limit, isRead, type });

  res.json({
    success: true,
    data: result.notifications,
    unreadCount: await notificationService.getUnreadCount(userId),
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    },
  });
});

/**
 * GET /api/v1/notifications/unread-count
 */
export const getUnreadCount: RequestHandler = withAsyncErrorHandling(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) { res.status(401).json({ success: false, error: 'Unauthorized' }); return; }

  const count = await notificationService.getUnreadCount(userId);
  res.json({ success: true, data: { count } });
});

/**
 * PATCH /api/v1/notifications/:id/read
 */
export const markAsRead: RequestHandler = withAsyncErrorHandling(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) { res.status(401).json({ success: false, error: 'Unauthorized' }); return; }

  await notificationService.markAsRead(req.params.id, userId);
  res.json({ success: true, data: null });
});

/**
 * PATCH /api/v1/notifications/read-all
 */
export const markAllAsRead: RequestHandler = withAsyncErrorHandling(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) { res.status(401).json({ success: false, error: 'Unauthorized' }); return; }

  await notificationService.markAllAsRead(userId);
  res.json({ success: true, data: null });
});

/**
 * DELETE /api/v1/notifications/:id
 */
export const deleteNotification: RequestHandler = withAsyncErrorHandling(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) { res.status(401).json({ success: false, error: 'Unauthorized' }); return; }

  await notificationService.delete(req.params.id, userId);
  res.json({ success: true, data: null });
});
