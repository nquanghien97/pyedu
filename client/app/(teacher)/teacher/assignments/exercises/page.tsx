'use client';

import { useEffect, useState, useCallback } from 'react';
import { ExerciseEntity, DIFFICULTY_LABELS, DIFFICULTY_COLORS, STATUS_LABELS, STATUS_COLORS, DifficultyLevel, ExerciseStatus } from '@/entity/exercise';
import { getExercises, deleteExercise, ExerciseFilters } from '@/services/exercise';
import { getSubjects } from '@/services/subject';
import { SubjectEntity } from '@/entity/subject';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { PlusIcon, SearchIcon, TrashIcon, EyeIcon, FilterIcon, SparklesIcon, BookOpen, CheckCircle, FileText } from 'lucide-react';
import StatCard from './StatCard';

// Danh sách khối lớp cố định
const GRADES = Array.from({ length: 12 }, (_, i) => ({
  id: (i + 1).toString(),
  name: `Khối ${i + 1}`,
}));

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<ExerciseEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [statistics, setStatistics] = useState({ total: 0, published: 0, draft: 0 });
  const [filters, setFilters] = useState<Partial<ExerciseFilters>>({});
  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [allSubjects, setAllSubjects] = useState<SubjectEntity[]>([]);

  // Danh sách môn học giờ lấy trực tiếp từ tất cả thay vì theo khối
  const subjects = allSubjects;

  const fetchExercises = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getExercises({ ...filters, page: pagination.page, limit: pagination.limit });
      setExercises(res.data);
      if (res.pagination) {
        setPagination(prev => ({ ...prev, ...res.pagination }));
      }
      if (res.statistics) {
        setStatistics(res.statistics);
      }
    } catch (error) {
      console.error('Failed to fetch exercises:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  useEffect(() => {
    getSubjects().then((res) => setAllSubjects(res.data));
  }, []);

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, search: searchInput }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa bài tập này?')) return;
    try {
      await deleteExercise(id);
      await fetchExercises();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Bài tập</h1>
          <p className="text-sm text-gray-500 mt-1">Tạo và quản lý bài tập, câu hỏi cho học sinh</p>
        </div>
        <div className="flex gap-3">
          <Link href="/teacher/assignments/exercises/ai-generate">
            <Button className="gap-2 bg-gradient-to-r from-purple-500 to-[#3b82f6] hover:opacity-90 border-0 text-white shadow-md shadow-[#3b82f6]/20 transition-all">
              <SparklesIcon className="w-4 h-4" />
              AI Tạo đề
            </Button>
          </Link>
          <Link href="/teacher/assignments/exercises/create">
            <Button className="gap-2 shadow-sm bg-[#3b82f6] hover:bg-blue-600">
              <PlusIcon className="w-4 h-4" />
              Thủ công
            </Button>
          </Link>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-lg border shadow-sm p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Tìm kiếm bài tập..."
              className="pl-9"
              onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
            />
          </div>
          <Button variant="outline" onClick={handleSearch}>Tìm</Button>
          <Button variant="ghost" onClick={() => setShowFilters(!showFilters)} className="gap-1">
            <FilterIcon className="w-4 h-4" />
            Lọc
          </Button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-4 gap-3 mt-3 pt-3 border-t">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Lớp học</label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={filters.grade || ''}
                onChange={e => setFilters((prev: Partial<ExerciseFilters>) => ({ ...prev, grade: e.target.value || undefined, subjectId: undefined, page: 1 }))}
              >
                <option value="">Tất cả</option>
                {GRADES.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Môn học</label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={filters.subjectId || ''}
                onChange={e => setFilters((prev: Partial<ExerciseFilters>) => ({ ...prev, subjectId: e.target.value || undefined, page: 1 }))}
              >
                <option value="">Tất cả môn học</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Độ khó</label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={filters.difficultyLevel || ''}
                onChange={e => setFilters((prev: Partial<ExerciseFilters>) => ({ ...prev, difficultyLevel: e.target.value || undefined }))}
              >
                <option value="">Tất cả</option>
                {Object.entries(DIFFICULTY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Trạng thái</label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={filters.status || ''}
                onChange={e => setFilters((prev: Partial<ExerciseFilters>) => ({ ...prev, status: e.target.value || undefined }))}
              >
                <option value="">Tất cả</option>
                {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Exercise Table */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden mb-8">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : exercises.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>Chưa có bài tập nào.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Tiêu đề</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Môn học</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Độ khó</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Câu hỏi</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {exercises.map(exercise => (
                <tr key={exercise.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/teacher/assignments/exercises/${exercise.id}`} className="text-sm font-medium text-gray-900 hover:text-[#3b82f6]">
                      {exercise.title || 'Không có tiêu đề'}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{exercise.subject?.name || '—'}</td>
                  <td className="px-4 py-3">
                    {exercise.difficultyLevel && (
                      <Badge className={DIFFICULTY_COLORS[exercise.difficultyLevel as DifficultyLevel]} variant="secondary">
                        {DIFFICULTY_LABELS[exercise.difficultyLevel as DifficultyLevel]}
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{exercise._count?.questions ?? 0}</td>
                  <td className="px-4 py-3">
                    {exercise.status && (
                      <Badge className={STATUS_COLORS[exercise.status as ExerciseStatus]} variant="secondary">
                        {STATUS_LABELS[exercise.status as ExerciseStatus]}
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/teacher/assignments/exercises/${exercise.id}`}>
                        <Button size="sm" variant="ghost"><EyeIcon className="w-4 h-4" /></Button>
                      </Link>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(exercise.id)} className="text-red-500 hover:text-red-700">
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
            <p className="text-sm text-gray-500">
              Trang {pagination.page} / {pagination.totalPages} ({pagination.total} bài tập)
            </p>
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
      </div>

      <div style={{ display: "flex", gap: 16 }}>
        <StatCard icon={BookOpen} iconBg="#EFF6FF" iconColor="#3B82F6" value={statistics.total.toString()} label="TỔNG SỐ BÀI TẬP" />
        <StatCard icon={CheckCircle} iconBg="#F0FDF4" iconColor="#22C55E" value={statistics.published.toString()} label="ĐÃ DUYỆT" />
        <StatCard icon={FileText} iconBg="#FFFBEB" iconColor="#F59E0B" value={statistics.draft.toString()} label="BẢN NHÁP" />
      </div>
    </div>
  );
}
