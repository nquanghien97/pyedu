'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Loader2,
  FileQuestion,
  Sparkles,
  Timer,
  BarChart3,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  AssignmentEntity,
  AssignmentStats,
} from '@/entity/assignment';
import {
  getStudentAssignments,
  StudentAssignmentFilters,
} from '@/services/assignment';
import { SubjectEntity } from '@/entity/subject';
import { getSubjects } from '@/services/subject';
import { Button } from "@/components/ui/button";
import { H1, P } from "@/components/ui/typography";
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';

type TabKey = 'all' | 'easy' | 'medium' | 'hard' | 'expert';

interface TabItem {
  key: TabKey;
  label: string;
  difficultyValue?: string;
}

const tabs: TabItem[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'easy', label: 'Dễ', difficultyValue: 'easy' },
  { key: 'medium', label: 'Trung bình', difficultyValue: 'medium' },
  { key: 'hard', label: 'Khó', difficultyValue: 'hard' },
  { key: 'expert', label: 'Rất khó', difficultyValue: 'expert' },
];

function StatCard({
  icon,
  iconBg,
  label,
  value,
  suffix,
  badge,
  badgeBg,
  badgeColor,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string | number;
  suffix?: string;
  badge?: string;
  badgeBg?: string;
  badgeColor?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-3.5">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: iconBg }}
        >
          {icon}
        </div>
        {badge && (
          <span
            className="text-xs font-bold px-2.5 py-0.5 rounded-full"
            style={{ background: badgeBg, color: badgeColor }}
          >
            {badge}
          </span>
        )}
      </div>
      <P className="text-xs text-gray-400 mb-1">{label}</P>
      <P className="text-2xl font-extrabold text-gray-900">
        {value}{' '}
        {suffix && (
          <span className="text-sm font-normal text-gray-400">{suffix}</span>
        )}
      </P>
    </div>
  );
}

function SubjectTag({
  name,
  colors,
}: {
  name: string;
  colors: { bg: string; text: string };
}) {
  return (
    <span
      className="text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap"
      style={{ background: colors.bg, color: colors.text }}
    >
      {name}
    </span>
  );
}

// function DifficultyBadge({ level }: { level: DifficultyLevel }) {
//   const label = DIFFICULTY_LABELS[level] || level;
//   const colorClass = DIFFICULTY_COLORS[level] || 'bg-gray-100 text-gray-700';
//   return (
//     <span
//       className={`text-xs font-semibold px-2.5 py-1 rounded-full ${colorClass}`}
//     >
//       {label}
//     </span>
//   );
// }

const subjectColorMap: Record<
  string,
  { bg: string; text: string }
> = {};
const subjectColorPalette = [
  { bg: '#EEF2FF', text: '#6366F1' },
  { bg: '#F5F3FF', text: '#8B5CF6' },
  { bg: '#F0FDF4', text: '#16A34A' },
  { bg: '#FFF7ED', text: '#EA580C' },
  { bg: '#FEF2F2', text: '#DC2626' },
  { bg: '#ECFDF5', text: '#059669' },
  { bg: '#EFF6FF', text: '#2563EB' },
  { bg: '#FDF4FF', text: '#C026D3' },
  { bg: '#FFFBEB', text: '#D97706' },
  { bg: '#F0F9FF', text: '#0284C7' },
];

function getSubjectColors(subjectName: string): { bg: string; text: string } {
  if (!subjectColorMap[subjectName]) {
    const index =
      Object.keys(subjectColorMap).length % subjectColorPalette.length;
    subjectColorMap[subjectName] = subjectColorPalette[index];
  }
  return subjectColorMap[subjectName];
}

export default function AssignmentPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [assignments, setAssignments] = useState<AssignmentEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [stats, setStats] = useState<AssignmentStats>({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
    averageScore: null,
  });
  const [allSubjects, setAllSubjects] = useState<SubjectEntity[]>([]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load subjects
  useEffect(() => {
    const loadMeta = async () => {
      try {
        const res = await getSubjects();
        if (res?.data) {
          setAllSubjects(res.data);
        }
      } catch {
        // silent
      }
    };
    loadMeta();
  }, []);

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const filters: StudentAssignmentFilters = {
        page: pagination.page,
        limit: pagination.limit,
      };
      // Note: difficultyLevel filter was removed from StudentAssignmentFilters 
      // as assignments are tracked by status/subject instead, 
      // but we keep text search and subject filtering.

      if (searchDebounced.trim()) {
        filters.search = searchDebounced.trim();
      }
      if (selectedSubjectId) {
        filters.subjectId = selectedSubjectId;
      }

      const result = await getStudentAssignments(filters);
      setAssignments(result.data);
      setStats(result.stats);
      setPagination((prev) => ({
        ...prev,
        total: result.pagination.total,
        totalPages: result.pagination.totalPages,
      }));
    } catch {
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchDebounced, selectedSubjectId]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  // Reset page on filter change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [activeTab, searchDebounced, selectedSubjectId]);

  const chartData = {
    easy: assignments.filter((a) => a.exercise.difficultyLevel === 'easy').length,
    medium: assignments.filter((a) => a.exercise.difficultyLevel === 'medium').length,
    hard: assignments.filter((a) => a.exercise.difficultyLevel === 'hard').length,
    expert: assignments.filter((a) => a.exercise.difficultyLevel === 'expert').length,
  };

  return (
    <div className="min-h-screen bg-slate-50 p-7">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <H1>
              Bài tập của tôi
            </H1>
            <P className="text-sm text-gray-400 mt-1">
              Danh sách bài tập được giao và ngân hàng bài tập sẵn có
            </P>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<BookOpen size={20} color="#3B82F6" />}
            iconBg="#EFF6FF"
            iconColor="#3B82F6"
            label="Tổng số"
            value={stats.total}
            suffix="bài"
            badge={pagination.total > 0 ? `${pagination.total} đang xem` : undefined}
            badgeBg="#EFF6FF"
            badgeColor="#3B82F6"
          />
          <StatCard
            icon={<CheckCircle2 size={20} color="#16A34A" />}
            iconBg="#F0FDF4"
            iconColor="#16A34A"
            label="Đã hoàn thành"
            value={stats.completed}
            suffix="bài"
          />
          <StatCard
            icon={<AlertTriangle size={20} color="#EA580C" />}
            iconBg="#FFF7ED"
            iconColor="#EA580C"
            label="Quá hạn"
            value={stats.overdue}
            suffix="bài"
            badge={stats.overdue > 0 ? "Cần chú ý" : undefined}
            badgeBg="#FEF2F2"
            badgeColor="#DC2626"
          />
          <StatCard
            icon={<TrendingUp size={20} color="#8B5CF6" />}
            iconBg="#F5F3FF"
            iconColor="#8B5CF6"
            label="Điểm trung bình"
            value={stats.averageScore ?? '-'}
            suffix="/10"
          />
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center gap-3 mb-5">
          <InputGroup className="max-w-xs">
            <InputGroupInput
              type="text"
              placeholder="Tìm kiếm bài tập..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
          </InputGroup>

          {/* Subject Filter */}
          <div className="relative">
            <Button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm text-sm text-gray-600 hover:border-blue-300 transition-colors cursor-pointer"
            >
              <Filter size={14} className="text-gray-400" />
              {selectedSubjectId
                ? allSubjects.find((s) => s.id === selectedSubjectId)?.name ||
                'Môn học'
                : 'Tất cả môn học'}
              <ChevronDown size={14} className="text-gray-400" />
            </Button>

            {showFilterDropdown && (
              <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 min-w-50 py-1 overflow-hidden">
                <Button className="w-full py-2.5 text-left text-sm hover:bg-blue-50" style={{ color: !selectedSubjectId ? '#3B82F6' : '#374151', fontWeight: !selectedSubjectId ? 600 : 400, }} onClick={() => {
                  setSelectedSubjectId('');
                  setShowFilterDropdown(false);
                }}
                >
                  Tất cả môn học
                </Button>
                {allSubjects.map((subject) => (
                  <Button key={subject.id} className="w-full py-2.5 text-left text-sm hover:bg-blue-50" style={{ color: selectedSubjectId === subject.id ? '#3B82F6' : '#374151', fontWeight: selectedSubjectId === subject.id ? 600 : 400, }} onClick={() => {
                    setSelectedSubjectId(subject.id);
                    setShowFilterDropdown(false);
                  }}
                  >
                    {subject.name}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-gray-200 mb-6">
          {tabs.map((t) => (
            <Button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className="px-5 py-2.5 text-sm transition-all whitespace-nowrap cursor-pointer border-none bg-transparent"
              style={{
                fontWeight: activeTab === t.key ? 600 : 400,
                color: activeTab === t.key ? '#3B82F6' : '#6B7280',
                borderBottom:
                  activeTab === t.key
                    ? '2px solid #3B82F6'
                    : '2px solid transparent',
                marginBottom: -1,
              }}
            >
              {t.label}
            </Button>
          ))}
        </div>

        {/* Exercise Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-6">
          <table className="w-full border-collapse">
            <colgroup>
              <col className="w-[30%]" />
              <col className="w-[12%]" />
              <col className="w-[12%]" />
              <col className="w-[12%]" />
              <col className="w-[10%]" />
              <col className="w-[12%]" />
              <col className="w-[12%]" />
            </colgroup>
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                {['BÀI TẬP', 'MÔN HỌC', 'HẠN NỘP', 'SỐ CÂU', 'THỜI GIAN', 'TRẠNG THÁI', 'HÀNH ĐỘNG'].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-xs font-bold text-gray-400 tracking-wider text-left px-6 py-3"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {/* Loading */}
              {loading && (
                <tr>
                  <td colSpan={6}>
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                      <Loader2 size={28} className="text-blue-500 animate-spin" />
                      <P className="text-sm text-gray-400">Đang tải bài tập...</P>
                    </div>
                  </td>
                </tr>
              )}

              {/* Empty */}
              {!loading && assignments.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                        <FileQuestion size={24} className="text-gray-400" />
                      </div>
                      <P className="text-sm font-semibold text-gray-500">
                        Không tìm thấy bài tập nào
                      </P>
                      <P className="text-xs text-gray-400">
                        Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                      </P>
                    </div>
                  </td>
                </tr>
              )}

              {/* Rows */}
              {!loading &&
                assignments.map((assignment, i) => {
                  const exercise = assignment.exercise;
                  const subjectName = exercise.subject?.name || 'Chưa xác định';
                  const subjectColors = getSubjectColors(subjectName);

                  const isCompleted = assignment.submissions && assignment.submissions.length > 0;
                  const submission = isCompleted ? assignment.submissions![0] : null;

                  const now = new Date();
                  const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;
                  const isOverdue = !isCompleted && dueDate && dueDate < now;

                  let statusText = 'Chưa làm';
                  let statusColor = 'bg-gray-100 text-gray-600';

                  if (isCompleted) {
                    statusText = 'Đã nộp';
                    statusColor = 'bg-green-100 text-green-700';
                  } else if (isOverdue) {
                    statusText = 'Quá hạn';
                    statusColor = 'bg-red-100 text-red-700';
                  } else if (dueDate && dueDate.getTime() - now.getTime() < 86400000) {
                    statusText = 'Sắp hết hạn';
                    statusColor = 'bg-orange-100 text-orange-700';
                  }

                  return (
                    <tr
                      key={assignment.id}
                      className="transition-colors hover:bg-slate-50/80 cursor-pointer"
                      style={{
                        borderBottom:
                          i < assignments.length - 1
                            ? '1px solid #F9FAFB'
                            : 'none',
                      }}
                    >
                      {/* Title */}
                      <td className="px-6 py-4 align-middle">
                        <div className="flex items-center gap-2">
                          <P className="text-sm font-semibold text-gray-900 truncate">
                            {exercise.title || 'Chưa đặt tên'}
                          </P>
                          {exercise.isAiGenerated && (
                            <span className="flex items-center gap-1 text-xs font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-500 shrink-0">
                              <Sparkles size={10} />
                              AI
                            </span>
                          )}
                        </div>
                        {assignment.assigner && (
                          <P className="text-xs text-gray-400 mt-0.5">
                            Giao bởi: {assignment.assigner.name}
                          </P>
                        )}
                      </td>

                      {/* Subject */}
                      <td className="px-6 py-4 align-middle">
                        <SubjectTag name={subjectName} colors={subjectColors} />
                      </td>

                      {/* Due Date */}
                      <td className="px-6 py-4 align-middle">
                        {dueDate ? (
                          <span className="text-sm text-gray-600 font-medium">
                            {dueDate.toLocaleDateString('vi-VN')}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>

                      {/* Questions count */}
                      <td className="px-6 py-4 align-middle">
                        <div className="flex items-center gap-1.5">
                          <BarChart3 size={13} className="text-gray-400" />
                          <span className="text-sm text-gray-600 font-medium">
                            {exercise._count?.questions || 0}
                          </span>
                        </div>
                      </td>

                      {/* Time */}
                      <td className="px-6 py-4 align-middle">
                        <div className="flex items-center gap-1.5">
                          <Timer size={13} className="text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {exercise.timeLimitMinutes
                              ? `${exercise.timeLimitMinutes}p`
                              : '—'}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 align-middle">
                        <span className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg ${statusColor}`}>
                          {statusText}
                        </span>
                        {isCompleted && submission?.percentage && (
                          <div className="text-xs font-bold text-green-600 mt-1">
                            {submission.percentage}%
                          </div>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 align-middle">
                        {isCompleted ? (
                          <Button
                            onClick={() => router.push(`/student/assignments/${assignment.id}`)}
                            className="bg-white border border-gray-200 text-gray-700 text-xs font-semibold px-4 py-2 rounded-lg hover:border-blue-300 transition-all cursor-pointer"
                          >
                            Xem lại
                          </Button>
                        ) : (
                          <Button
                            onClick={() => router.push(`/student/assignments/${assignment.id}`)}
                            className="bg-linear-to-r from-blue-500 to-blue-600 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/30 transition-all cursor-pointer border-none"
                          >
                            Làm bài
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-3.5">
            <P className="text-xs text-gray-400">
              Hiển thị{' '}
              <span className="font-semibold text-gray-600">
                {(pagination.page - 1) * pagination.limit + 1}–
                {Math.min(
                  pagination.page * pagination.limit,
                  pagination.total
                )}
              </span>{' '}
              trong tổng{' '}
              <span className="font-semibold text-gray-600">
                {pagination.total}
              </span>{' '}
              bài tập
            </P>
            <div className="flex items-center gap-1.5">
              <Button
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    page: Math.max(1, prev.page - 1),
                  }))
                }
                disabled={pagination.page <= 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer bg-white"
              >
                <ChevronLeft size={14} className="text-gray-500" />
              </Button>

              {Array.from(
                { length: Math.min(pagination.totalPages, 5) },
                (_, idx) => {
                  let pageNum: number;
                  if (pagination.totalPages <= 5) {
                    pageNum = idx + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = idx + 1;
                  } else if (
                    pagination.page >=
                    pagination.totalPages - 2
                  ) {
                    pageNum = pagination.totalPages - 4 + idx;
                  } else {
                    pageNum = pagination.page - 2 + idx;
                  }
                  return (
                    <Button
                      key={pageNum}
                      onClick={() =>
                        setPagination((prev) => ({ ...prev, page: pageNum }))
                      }
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold transition-all cursor-pointer border-none"
                      style={{
                        background:
                          pagination.page === pageNum ? '#3B82F6' : 'white',
                        color:
                          pagination.page === pageNum ? 'white' : '#6B7280',
                        border:
                          pagination.page === pageNum
                            ? 'none'
                            : '1px solid #E5E7EB',
                      }}
                    >
                      {pageNum}
                    </Button>
                  );
                }
              )}

              <Button
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    page: Math.min(prev.totalPages, prev.page + 1),
                  }))
                }
                disabled={pagination.page >= pagination.totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer bg-white"
              >
                <ChevronRight size={14} className="text-gray-500" />
              </Button>
            </div>
          </div>
        )}

        {/* Overview Section */}
        {!loading && assignments.length > 0 && (
          <div className="mt-6 bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-lg shadow-blue-500/20 relative overflow-hidden">
            {/* Decorative circles */}
            <svg
              className="absolute top-0 right-0 opacity-10"
              width="160"
              height="160"
              viewBox="0 0 160 160"
            >
              <circle cx="120" cy="20" r="80" fill="#fff" />
            </svg>
            <svg
              className="absolute bottom-0 left-0 opacity-5"
              width="100"
              height="100"
              viewBox="0 0 100 100"
            >
              <circle cx="10" cy="90" r="60" fill="#fff" />
            </svg>

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Sparkles size={16} className="text-white" />
                </div>
                <span className="text-sm font-bold text-white">
                  Đánh giá tổng quan
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4">
                  <P className="text-xs text-white/70 mb-1">
                    Tổng bài tập sẵn có
                  </P>
                  <P className="text-2xl font-extrabold text-white">
                    {stats.total}
                  </P>
                </div>
                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4">
                  <P className="text-xs text-white/70 mb-1">
                    Phân bố độ khó
                  </P>
                  <div className="flex items-end gap-1.5 mt-1">
                    {(['easy', 'medium', 'hard', 'expert'] as const).map(
                      (level) => {
                        const count = chartData[level];
                        const maxCount = Math.max(
                          ...Object.values(chartData),
                          1
                        );
                        return (
                          <div
                            key={level}
                            className="flex flex-col items-center gap-0.5"
                          >
                            <div
                              className="w-5 rounded-sm bg-white"
                              style={{
                                height: `${Math.max(
                                  (count / maxCount) * 32,
                                  4
                                )}px`,
                              }}
                            />
                            <span className="text-xs text-white/60">
                              {count}
                            </span>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4">
                  <P className="text-xs text-white/70 mb-1">
                    Lời khuyên
                  </P>
                  <P className="text-xs text-white/90 leading-relaxed">
                    {chartData.easy > chartData.hard
                      ? 'Hãy thử thách bản thân với những bài tập khó hơn!'
                      : 'Tuyệt vời! Bạn đang làm rất tốt các bài tập hóc búa.'}
                  </P>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close filter dropdown */}
      {showFilterDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowFilterDropdown(false)}
        />
      )}
    </div>
  );
}