'use client';

import { useState, useEffect } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import { Info, Loader2, TrendingUp, BookOpen, Target, Award } from 'lucide-react';
import { getMyProgress } from '@/services/progress';
import {
  StudentProgressResponse,
  MASTERY_LABELS,
  MASTERY_COLORS,
  MASTERY_ICONS,
  MasteryLevel,
} from '@/entity/progress';

const CustomLineTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: '#1E40AF', borderRadius: 8, padding: '6px 12px' }}>
        <p style={{ color: '#fff', fontSize: 12, fontWeight: 700, margin: 0 }}>{label}</p>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11, margin: '2px 0 0' }}>Điểm: {payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

export default function ReportsPage() {
  const [progress, setProgress] = useState<StudentProgressResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getMyProgress();
        setProgress(data);
      } catch {
        // silently handle
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="text-blue-500 animate-spin" />
          <p className="text-sm text-gray-500">Đang tải báo cáo...</p>
        </div>
      </div>
    );
  }

  const overview = progress?.overview ?? {
    totalExercises: 0,
    completedExercises: 0,
    averageScore: 0,
    overallMasteryLevel: 'beginner' as MasteryLevel,
  };

  const bySubject = progress?.bySubject ?? [];
  const recentScores = progress?.recentScores ?? [];

  // Build radar data from subjects
  const radarData = bySubject.map((s) => ({
    subject: `${s.subjectName} (${s.averageScore.toFixed(0)}%)`,
    value: s.averageScore,
    fullMark: 100,
  }));

  // Build line chart data from recent scores
  const lineData = recentScores
    .slice()
    .reverse()
    .map((s, idx) => ({
      label: s.exerciseTitle?.slice(0, 15) || `Bài ${idx + 1}`,
      score: s.score,
    }));

  const masteryLevel = overview.overallMasteryLevel;
  const masteryLabel = MASTERY_LABELS[masteryLevel];
  const masteryIcon = MASTERY_ICONS[masteryLevel];

  return (
    <div className="min-h-screen bg-slate-50 p-7">
      <div className="max-w-7xl mx-auto flex flex-col gap-5">
        {/* Header */}
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Báo cáo tiến bộ</h1>
          <p className="text-sm text-gray-400 mt-1">Theo dõi quá trình học tập và mức độ thành thạo</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <BookOpen size={20} className="text-blue-500" />
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-1">Bài tập đã làm</p>
            <p className="text-2xl font-extrabold text-gray-900">{overview.totalExercises}</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <Target size={20} className="text-green-500" />
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-1">Điểm trung bình</p>
            <p className="text-2xl font-extrabold text-gray-900">
              {overview.averageScore.toFixed(1)}
              <span className="text-sm font-normal text-gray-400">%</span>
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <Award size={20} className="text-purple-500" />
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-1">Xếp loại</p>
            <p className="text-2xl font-extrabold text-gray-900">
              {masteryIcon} {masteryLabel}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                <TrendingUp size={20} className="text-orange-500" />
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-1">Số môn học</p>
            <p className="text-2xl font-extrabold text-gray-900">{bySubject.length}</p>
          </div>
        </div>

        {/* Subject Progress Cards */}
        {bySubject.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-gray-700 mb-3">Tiến bộ theo môn học</h2>
            <div className="grid grid-cols-3 gap-4">
              {bySubject.map((subject) => {
                const level = subject.masteryLevel as MasteryLevel;
                return (
                  <div
                    key={subject.subjectId}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-gray-900">{subject.subjectName}</h3>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${MASTERY_COLORS[level]}`}>
                        {MASTERY_ICONS[level]} {MASTERY_LABELS[level]}
                      </span>
                    </div>

                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{subject.exercisesCompleted} bài hoàn thành</span>
                        <span className="font-bold text-blue-600">{subject.averageScore.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(subject.averageScore, 100)}%`,
                            background: subject.averageScore >= 80
                              ? 'linear-gradient(90deg, #10B981, #059669)'
                              : subject.averageScore >= 60
                                ? 'linear-gradient(90deg, #3B82F6, #2563EB)'
                                : subject.averageScore >= 40
                                  ? 'linear-gradient(90deg, #F59E0B, #D97706)'
                                  : 'linear-gradient(90deg, #EF4444, #DC2626)',
                          }}
                        />
                      </div>
                    </div>

                    {/* Topics breakdown */}
                    {subject.topics && subject.topics.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                        {subject.topics.map((topic) => (
                          <div key={topic.topicId} className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 truncate max-w-[60%]">
                              {topic.topicName}
                            </span>
                            <span className="text-xs font-semibold text-gray-700">
                              {topic.averageScore.toFixed(0)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Radar chart */}
          {radarData.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold text-gray-900">Phân tích học lực</span>
                <button className="bg-transparent border-none cursor-pointer text-gray-400">
                  <Info size={15} />
                </button>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart cx="50%" cy="50%" outerRadius="72%" data={radarData}>
                  <PolarGrid stroke="#E5E7EB" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fontSize: 11, fill: '#6B7280', fontWeight: 500 }}
                  />
                  <Radar
                    name="Điểm"
                    dataKey="value"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.18}
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#3B82F6', strokeWidth: 0 }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Line chart */}
          {lineData.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold text-gray-900">Điểm bài tập gần đây</span>
                <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">
                  {lineData.length} bài gần nhất
                </span>
              </div>
              <ResponsiveContainer width="100%" height={270}>
                <LineChart data={lineData} margin={{ top: 8, right: 10, left: -28, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#D1D5DB' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomLineTooltip />} />
                  <Line
                    type="monotone" dataKey="score"
                    stroke="#3B82F6" strokeWidth={2.5}
                    dot={{ r: 5, fill: '#3B82F6', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 7, fill: '#3B82F6', stroke: '#fff', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Empty state if no data */}
          {radarData.length === 0 && lineData.length === 0 && (
            <div className="col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <TrendingUp size={28} className="text-gray-400" />
              </div>
              <p className="text-sm font-semibold text-gray-500 mb-1">Chưa có dữ liệu</p>
              <p className="text-xs text-gray-400">
                Hãy hoàn thành một vài bài tập để xem báo cáo tiến bộ của bạn.
              </p>
            </div>
          )}
        </div>

        {/* Recent Scores Table */}
        {recentScores.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <span className="text-sm font-bold text-gray-900">Điểm các bài tập gần đây</span>
            </div>

            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  {['BÀI TẬP', 'MÔN HỌC', 'NGÀY NỘP', 'ĐIỂM SỐ'].map((h) => (
                    <th key={h} className="text-[11px] font-bold text-gray-400 tracking-wider text-left px-6 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentScores.map((score, idx) => (
                  <tr
                    key={idx}
                    className="transition-colors hover:bg-slate-50/80"
                    style={{ borderBottom: idx < recentScores.length - 1 ? '1px solid #F9FAFB' : 'none' }}
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-gray-900">
                        {score.exerciseTitle || 'Bài tập'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-600">
                        {score.subjectName || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {score.date ? new Date(score.date).toLocaleDateString('vi-VN') : '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="text-sm font-bold"
                        style={{
                          color: score.score >= 80 ? '#16A34A' : score.score >= 60 ? '#2563EB' : '#DC2626',
                        }}
                      >
                        {score.score.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}