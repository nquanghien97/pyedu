import { RequestHandler } from 'express';
import { notificationEmitter } from '../../../execution/notification/notificationEmitter';

/**
 * GET /api/v1/notifications/stream
 * Server-Sent Events (SSE) endpoint cho real-time notification.
 * Client dùng EventSource API để kết nối.
 */
export const sseStreamHandler: RequestHandler = (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
  res.flushHeaders();

  // Send initial heartbeat
  res.write(`data: ${JSON.stringify({ type: 'connected', userId })}\n\n`);

  // Listener cho notification events
  const eventName = `notification:${userId}`;
  const onNotification = (notification: unknown) => {
    try {
      res.write(`data: ${JSON.stringify(notification)}\n\n`);
    } catch {
      // Client disconnected
    }
  };

  notificationEmitter.on(eventName, onNotification);

  // Heartbeat mỗi 30s để giữ kết nối sống
  const heartbeatInterval = setInterval(() => {
    try {
      res.write(`: heartbeat\n\n`);
    } catch {
      clearInterval(heartbeatInterval);
    }
  }, 30_000);

  // Cleanup khi client ngắt kết nối
  req.on('close', () => {
    clearInterval(heartbeatInterval);
    notificationEmitter.off(eventName, onNotification);
  });
};
