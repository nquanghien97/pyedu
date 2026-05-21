'use client';

import { useEffect, useRef } from 'react';
import { useNotificationStore } from '@/stores/notification.store';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

/**
 * Hook kết nối SSE để nhận thông báo real-time.
 * Tự động reconnect khi mất kết nối.
 */
export function useSSE() {
  const { addRealTimeNotification, fetchUnreadCount } = useNotificationStore();
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Tạo kết nối SSE
    const url = `${API_BASE_URL}/api/v1/notifications/stream`;
    const eventSource = new EventSource(url, { withCredentials: true });
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Ignore heartbeat / connected events
        if (data.type === 'connected' || data.type === 'bulk') {
          // Bulk: refresh unread count
          if (data.type === 'bulk') {
            fetchUnreadCount();
          }
          return;
        }

        // Single notification with id = real notification object
        if (data.id) {
          addRealTimeNotification(data);
        }
      } catch {
        // Ignore parse errors
      }
    };

    eventSource.onerror = () => {
      // EventSource auto-reconnects, we just need to handle cleanup
      eventSource.close();

      // Retry after 5 seconds
      setTimeout(() => {
        if (eventSourceRef.current === eventSource) {
          const retrySource = new EventSource(url, { withCredentials: true });
          eventSourceRef.current = retrySource;
          retrySource.onmessage = eventSource.onmessage;
          retrySource.onerror = eventSource.onerror;
        }
      }, 5000);
    };

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [addRealTimeNotification, fetchUnreadCount]);
}
