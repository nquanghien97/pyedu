'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  SparklesIcon,
  Clock,
  BookOpen,
  CheckCircle2,
  FileText,
  Loader2,
  Eye,
  Trash2,
} from 'lucide-react';
import { aiGenerateService } from '@/services/aiGenerate';
import { deleteExercise } from '@/services/exercise';
import { ExerciseEntity, DIFFICULTY_LABELS, DIFFICULTY_COLORS, STATUS_LABELS, STATUS_COLORS, DifficultyLevel, ExerciseStatus } from '@/entity/exercise';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AIBadge from '@/components/shared/AIBadge';
import { notification } from '@/components/notification';
import { H1, P } from "@/components/ui/typography";

export default function AIHistoryPage() {
  const router = useRouter();
  const [exercises, setExercises] = useState<ExerciseEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [statusFilter, setStatusFilter] = useState<string>('');

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await aiGenerateService.getHistory({
        page: pagination.page,
        limit: pagination.limit,
        status: statusFilter || undefined,
      });
      setExercises(res.data);
      if (res.pagination) {
        setPagination(prev => ({ ...prev, ...res.pagination }));
      }
    } catch (error) {
      console.error('Failed to fetch AI history:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, statusFilter]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa bài tập này?')) return;
    try {
      await deleteExercise(id);
      notification.success('Đã xóa bài tập');
      fetchHistory();
    } catch {
      notification.error('Lỗi khi xóa bài tập');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} className="text-gray-600" />
          </Button>
          <div>
            <H1 className="flex items-center gap-2">
              <SparklesIcon size={22} className="text-purple-500" />
              Lịch sử tạo đề bằng AI
            </H1>
            <P className="text-sm text-gray-400 mt-1">
              Xem lại và quản lý các bài tập được AI tạo tự động.
            </P>
          </div>
        </div>
        <Link href="/teacher/assignments/exercises/ai-generate">
          <Button className="gap-2">
            <SparklesIcon size={14} />
            Tạo đề mới
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        {[
          { value: '', label: 'Tất cả' },
          { value: 'draft', label: 'Nháp' },
          { value: 'approved', label: 'Đã duyệt' },
          { value: 'archived', label: 'Lưu trữ' },
        ].map(tab => (
          <Button
            key={tab.value}
            onClick={() => {
              setStatusFilter(tab.value);
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer border-none ${
              statusFilter === tab.value
                ? 'bg-blue-500 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-blue-500" />
          </div>
        ) : exercises.length === 0 ? (
          <div className="text-center py-16">
            <SparklesIcon size={40} className="text-gray-300 mx-auto mb-3" />
            <P className="text-gray-500 font-medium">Chưa có bài tập nào được AI tạo.</P>
            <Link href="/teacher/assignments/exercises/ai-generate" className="text-sm text-blue-500 hover:underline mt-2 inline-block">
              Tạo bài tập bằng AI ngay →
            </Link>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-gray-50/80 border-b border-gray-100">
                <tr>
                  {['TIÊU ĐỀ', 'MÔN HỌC', 'ĐỘ KHÓ', 'CÂU HỎI', 'TRẠNG THÁI', 'NGÀY TẠO', 'THAO TÁC'].map(h => (
                    <th key={h} className="text-xs font-bold text-gray-400 uppercase tracking-wider text-left px-5 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {exercises.map(ex => (
                  <tr key={ex.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Link href={`/teacher/assignments/exercises/${ex.id}`} className="text-sm font-bold text-gray-900 hover:text-blue-600 transition-colors">
                          {ex.title || 'Không có tiêu đề'}
                        </Link>
                        <AIBadge />
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">
                      {ex.subject?.name || '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      {ex.difficultyLevel && (
                        <Badge className={DIFFICULTY_COLORS[ex.difficultyLevel as DifficultyLevel]} variant="secondary">
                          {DIFFICULTY_LABELS[ex.difficultyLevel as DifficultyLevel]}
                        </Badge>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-gray-700">
                      {ex._count?.questions ?? 0}
                    </td>
                    <td className="px-5 py-3.5">
                      {ex.status && (
                        <Badge className={STATUS_COLORS[ex.status as ExerciseStatus]} variant="secondary">
                          {STATUS_LABELS[ex.status as ExerciseStatus]}
                        </Badge>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock size={12} />
                        {formatDate(ex.createdAt)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <Link href={`/teacher/assignments/exercises/${ex.id}`}>
                          <Button size="sm" variant="ghost" className="text-gray-500 hover:text-blue-600">
                            <Eye size={15} />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(ex.id)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <Trash2 size={15} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/50">
                <P className="text-sm text-gray-500">
                  Trang {pagination.page} / {pagination.totalPages} ({pagination.total} bài tập)
                </P>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pagination.page <= 1}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  >
                    Trước
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
