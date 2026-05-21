'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  BellIcon, CheckCheck, Trash2, Loader2, BookOpen,
  CheckCircle, Clock, AlertTriangle, MessageCircle, Filter,
} from 'lucide-react';
import { notificationService, NotificationEntity } from '@/services/notification';
import { Button } from '@/components/ui/button';
import { useNotificationStore } from '@/stores/notification.store';
import { H1, P } from "@/components/ui/typography";

const TYPE_LABELS: Record<string, string> = {
  assignment_new: 'Bài tập mới',
  submission_graded: 'Đã chấm bài',
  assignment_due_soon: 'Sắp hết hạn',
  assignment_overdue: 'Quá hạn',
  daily_reminder: 'Nhắc nhở',
  level_change: 'Thay đổi học lực',
  system: 'Hệ thống',
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  assignment_new: <BookOpen size={16} className="text-blue-500" />,
  submission_graded: <CheckCircle size={16} className="text-green-500" />,
  assignment_due_soon: <Clock size={16} className="text-orange-500" />,
  assignment_overdue: <AlertTriangle size={16} className="text-red-500" />,
  daily_reminder: <BookOpen size={16} className="text-purple-500" />,
  level_change: <MessageCircle size={16} className="text-indigo-500" />,
  system: <BellIcon size={16} className="text-gray-500" />,
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [readFilter, setReadFilter] = useState<string>('');

  const { fetchUnreadCount } = useNotificationStore();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (typeFilter) params.type = typeFilter;
      if (readFilter === 'unread') params.isRead = false;
      if (readFilter === 'read') params.isRead = true;

      const res = await notificationService.getAll(params as {
        page?: number; limit?: number; isRead?: boolean; type?: string;
      });
      setNotifications(res.data);
      if (res.pagination) {
        setPagination(prev => ({ ...prev, ...res.pagination }));
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, typeFilter, readFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleMarkAsRead = async (id: string) => {
    await notificationService.markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    fetchUnreadCount();
  };

  const handleMarkAllAsRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    fetchUnreadCount();
  };

  const handleDelete = async (id: string) => {
    await notificationService.delete(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    fetchUnreadCount();
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <H1>
            <BellIcon size={22} className="text-blue-500" />
            Thông báo
          </H1>
          <P className="text-sm text-gray-400 mt-1">Quản lý tất cả thông báo của bạn</P>
        </div>
        <Button
          variant="outline"
          className="gap-1.5 text-sm"
          onClick={handleMarkAllAsRead}
        >
          <CheckCheck size={16} />
          Đọc tất cả
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {/* Read/Unread Filter */}
        {[
          { value: '', label: 'Tất cả' },
          { value: 'unread', label: 'Chưa đọc' },
          { value: 'read', label: 'Đã đọc' },
        ].map(f => (
          <Button
            key={f.value}
            onClick={() => { setReadFilter(f.value); setPagination(p => ({ ...p, page: 1 })); }}
            className={`${
              readFilter === f.value
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </Button>
        ))}
        <span className="w-px bg-gray-200 mx-1" />
        {/* Type filter */}
        <select
          value={typeFilter}
          onChange={e => { setTypeFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 bg-white text-gray-600 cursor-pointer"
        >
          <option value="">Tất cả loại</option>
          {Object.entries(TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={28} className="animate-spin text-blue-500" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16">
            <BellIcon size={40} className="text-gray-200 mx-auto mb-3" />
            <P className="text-gray-400 font-medium">Không có thông báo nào</P>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map(n => (
              <div
                key={n.id}
                className={`flex items-start gap-4 px-5 py-4 transition-colors ${
                  !n.isRead ? 'bg-blue-50/30 hover:bg-blue-50/50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {TYPE_ICONS[n.notificationType || ''] || <BellIcon size={16} className="text-gray-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <P className={`text-sm ${!n.isRead ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
                      {n.title}
                    </P>
                    {n.notificationType && (
                      <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                        {TYPE_LABELS[n.notificationType] || n.notificationType}
                      </span>
                    )}
                  </div>
                  <P className="text-xs text-gray-500 mt-1">{n.message}</P>
                  <P className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                    <Clock size={10} />
                    {formatDate(n.createdAt)}
                  </P>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {!n.isRead && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-blue-500 hover:text-blue-700 h-8 w-8 p-0"
                      onClick={() => handleMarkAsRead(n.id)}
                      title="Đánh dấu đã đọc"
                    >
                      <CheckCheck size={14} />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-gray-400 hover:text-red-600 h-8 w-8 p-0"
                    onClick={() => handleDelete(n.id)}
                    title="Xóa thông báo"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/50">
            <P className="text-sm text-gray-500">
              Trang {pagination.page} / {pagination.totalPages} ({pagination.total} thông báo)
            </P>
            <div className="flex items-center gap-2">
              <Button
                size="sm" variant="outline"
                disabled={pagination.page <= 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              >Trước</Button>
              <Button
                size="sm" variant="outline"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              >Sau</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
