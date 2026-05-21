'use client';

import { useEffect, useRef, useState } from 'react';
import { BellIcon, CheckCheck, Loader2, BookOpen, CheckCircle, Clock, AlertTriangle, MessageCircle } from 'lucide-react';
import { useNotificationStore } from '@/stores/notification.store';
import { useSSE } from '@/hooks/useSSE';
import { NotificationEntity } from '@/services/notification';
import { useAuthStore } from '@/stores/auth.store';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { H3, P } from "@/components/ui/typography";

const NOTIFICATION_ICONS: Record<string, React.ReactNode> = {
  assignment_new: <BookOpen size={14} className="text-blue-500" />,
  submission_graded: <CheckCircle size={14} className="text-green-500" />,
  assignment_due_soon: <Clock size={14} className="text-orange-500" />,
  assignment_overdue: <AlertTriangle size={14} className="text-red-500" />,
  daily_reminder: <BookOpen size={14} className="text-purple-500" />,
  level_change: <MessageCircle size={14} className="text-indigo-500" />,
  system: <BellIcon size={14} className="text-gray-500" />,
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  const notifPageUrl = user?.role === 'STUDENT' ? '/student/notifications' : '/teacher/notifications';

  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();

  // Connect SSE for real-time
  useSSE();

  // Fetch initial data
  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (open) {
      fetchNotifications({ limit: 10 });
    }
  }, [open, fetchNotifications]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleNotificationClick = async (notification: NotificationEntity) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    setOpen(false);
  };

  const getLink = (n: NotificationEntity): string => {
    const meta = n.metadata as Record<string, unknown> | null;
    return (meta?.link as string) || '#';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <Button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-gray-100 hover:text-black transition-colors cursor-pointer"
        aria-label="Thông báo"
      >
        <BellIcon size={22} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center px-1 animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
            <H3 className="text-sm">Thông báo</H3>
            {unreadCount > 0 && (
              <Button
                onClick={() => markAllAsRead()}
                className="text-xs font-semibold text-blue-500 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck size={14} />
                Đọc tất cả
              </Button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 size={20} className="animate-spin text-gray-400" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <BellIcon size={32} className="text-gray-200 mx-auto mb-2" />
                <P className="text-sm text-gray-400">Chưa có thông báo nào</P>
              </div>
            ) : (
              notifications.slice(0, 10).map((n) => (
                <Link
                  key={n.id}
                  href={getLink(n)}
                  onClick={() => handleNotificationClick(n)}
                  className={`flex items-start gap-3 px-4 py-3 hover:bg-blue-50/50 transition-colors border-b border-gray-50 last:border-0 ${
                    !n.isRead ? 'bg-blue-50/30' : ''
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {NOTIFICATION_ICONS[n.notificationType || ''] || <BellIcon size={14} className="text-gray-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <P className={`text-sm ${!n.isRead ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
                      {n.title}
                    </P>
                    <P className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</P>
                    <P className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</P>
                  </div>
                  {!n.isRead && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
                  )}
                </Link>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 bg-gray-50/50">
            <Link
              href={notifPageUrl}
              onClick={() => setOpen(false)}
              className="block text-center py-2.5 text-xs font-semibold text-blue-500 hover:text-blue-700 transition-colors"
            >
              Xem tất cả thông báo →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
