'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Loader2,
  Eye,
  BarChart3,
  Award,
} from 'lucide-react';
import { getAssignmentSubmissions, AssignmentSubmissionsResponse } from '@/services/submission';

export default function AssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AssignmentSubmissionsResponse | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAssignmentSubmissions(
        assignmentId,
        pagination.page,
        pagination.limit
      );
      setData(result.data);
      setPagination((prev) => ({
        ...prev,
        total: result.pagination.total,
        totalPages: result.pagination.totalPages,
      }));
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }, [assignmentId, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const assignment = data?.assignment as {
    id: string;
    exerciseId: string;
    assignedToType: string | null;
    assignedToId: string | null;
    dueDate: string | null;
    maxAttempts: number | null;
    status: string | null;
    exercise: {
      id: string;
      title: string | null;
      subject?: { id: string; name: string } | null;
      _count?: { questions: number };
    };
  } | null;

  const submissions = data?.submissions ?? [];

  // Calculate stats
  const totalSubmissions = submissions.length;
  const avgScore =
    totalSubmissions > 0
      ? Math.round(
          (submissions.reduce((sum, s) => sum + Number(s.percentage ?? 0), 0) /
            totalSubmissions) *
            10
        ) / 10
      : 0;
  const lateCount = submissions.filter((s) => s.isLate).length;
  const highScoreCount = submissions.filter(
    (s) => (s.percentage ?? 0) >= 80
  ).length;

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="text-blue-500 animate-spin" />
          <p className="text-sm text-gray-500">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-7">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-lg font-extrabold text-gray-900">
              {assignment?.exercise?.title ?? 'Chi tiết Assignment'}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              {assignment?.exercise?.subject && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600">
                  {assignment.exercise.subject.name}
                </span>
              )}
              {assignment?.dueDate && (
                <span className="text-xs text-gray-400">
                  Hạn nộp: {new Date(assignment.dueDate).toLocaleDateString('vi-VN')}
                </span>
              )}
              {assignment?.maxAttempts && (
                <span className="text-xs text-gray-400">
                  Tối đa {assignment.maxAttempts} lần
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
              <Users size={20} className="text-blue-500" />
            </div>
            <p className="text-xs text-gray-400 mb-1">Tổng bài nộp</p>
            <p className="text-2xl font-extrabold text-gray-900">{pagination.total}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center mb-3">
              <BarChart3 size={20} className="text-green-500" />
            </div>
            <p className="text-xs text-gray-400 mb-1">Điểm trung bình</p>
            <p className="text-2xl font-extrabold text-gray-900">
              {avgScore}<span className="text-sm font-normal text-gray-400">%</span>
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center mb-3">
              <Award size={20} className="text-purple-500" />
            </div>
            <p className="text-xs text-gray-400 mb-1">Điểm cao (≥80%)</p>
            <p className="text-2xl font-extrabold text-gray-900">{highScoreCount}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center mb-3">
              <AlertTriangle size={20} className="text-orange-500" />
            </div>
            <p className="text-xs text-gray-400 mb-1">Nộp trễ</p>
            <p className="text-2xl font-extrabold text-gray-900">{lateCount}</p>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-900">
              Danh sách bài nộp
            </h2>
          </div>

          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                {['HỌC SINH', 'LẦN NỘP', 'THỜI GIAN NỘP', 'ĐIỂM SỐ', 'PHẦN TRĂM', 'TRẠNG THÁI', ''].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-[11px] font-bold text-gray-400 tracking-wider text-left px-6 py-3"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {submissions.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                        <FileText size={24} className="text-gray-400" />
                      </div>
                      <p className="text-sm font-semibold text-gray-500">
                        Chưa có bài nộp nào
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {submissions.map((sub, idx) => {
                const scoreColor =
                  (sub.percentage ?? 0) >= 80
                    ? '#16A34A'
                    : (sub.percentage ?? 0) >= 60
                      ? '#2563EB'
                      : '#DC2626';

                return (
                  <tr
                    key={sub.id}
                    className="transition-colors hover:bg-slate-50/80"
                    style={{
                      borderBottom:
                        idx < submissions.length - 1
                          ? '1px solid #F9FAFB'
                          : 'none',
                    }}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {sub.student.user.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {sub.student.user.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 font-medium">
                        Lần {sub.attemptNumber ?? 1}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {sub.submittedAt
                          ? new Date(sub.submittedAt).toLocaleString('vi-VN')
                          : '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="text-sm font-bold"
                        style={{ color: scoreColor }}
                      >
                        {sub.totalScore ?? '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${sub.percentage ?? 0}%`,
                              background: scoreColor,
                            }}
                          />
                        </div>
                        <span
                          className="text-xs font-bold"
                          style={{ color: scoreColor }}
                        >
                          {sub.percentage ?? 0}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {sub.status === 'graded' && (
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                            Đã chấm
                          </span>
                        )}
                        {sub.isLate && (
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-100 text-orange-700">
                            Trễ hạn
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => router.push(`/teacher/submissions/${sub.id}`)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer bg-transparent border-none flex items-center gap-1"
                      >
                        <Eye size={13} />
                        Xem
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
