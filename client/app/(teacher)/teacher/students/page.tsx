'use client';

import { useState, useEffect } from 'react';
import { Loader2, Users, TrendingUp, Award, Search } from 'lucide-react';
import { getStudentsProgress } from '@/services/progress';
import { TeacherStudentProgress, MASTERY_LABELS, MASTERY_COLORS, MASTERY_ICONS, MasteryLevel } from '@/entity/progress';
import { Input } from "@/components/ui/input";
import { H1, P } from "@/components/ui/typography";
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';

function classifyOverallMastery(score: number): MasteryLevel {
  if (score >= 80) return 'mastered';
  if (score >= 60) return 'proficient';
  if (score >= 40) return 'developing';
  return 'beginner';
}

export default function StudentsPage() {
  const [students, setStudents] = useState<TeacherStudentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getStudentsProgress();
        setStudents(data);
      } catch {
        // silently handle
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredStudents = students.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.studentName.toLowerCase().includes(q) ||
      s.studentEmail.toLowerCase().includes(q)
    );
  });

  // Stats
  const totalStudents = students.length;
  const avgScore =
    totalStudents > 0
      ? Math.round(
        (students.reduce((sum, s) => sum + s.overallAverageScore, 0) /
          totalStudents) *
        10
      ) / 10
      : 0;
  const excellentCount = students.filter(
    (s) => s.overallAverageScore >= 80
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="text-blue-500 animate-spin" />
          <P className="text-sm text-gray-500">Đang tải dữ liệu...</P>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-7">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <H1>
            Danh sách học sinh
          </H1>
          <P className="text-sm text-gray-400 mt-1">
            Quản lý và theo dõi tiến bộ học tập của các học sinh
          </P>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
              <Users size={20} className="text-blue-500" />
            </div>
            <P className="text-xs text-gray-400 mb-1">Tổng học sinh</P>
            <P className="text-2xl font-bold">{totalStudents}</P>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center mb-3">
              <TrendingUp size={20} className="text-green-500" />
            </div>
            <P className="text-xs text-gray-400 mb-1">Điểm TB chung</P>
            <P className="text-2xl font-bold">
              {avgScore}<span className="text-sm font-normal text-gray-400">%</span>
            </P>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center mb-3">
              <Award size={20} className="text-purple-500" />
            </div>
            <P className="text-xs text-gray-400 mb-1">Xuất sắc (≥80%)</P>
            <P className="text-2xl font-bold">{excellentCount}</P>
          </div>
        </div>

        {/* Search */}
        <div className="mb-5">
          <InputGroup className="max-w-xs">
            <InputGroupInput
              type="text"
              placeholder="Tìm kiếm học sinh..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
          </InputGroup>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                {['HỌC SINH', 'BÀI ĐÃ LÀM', 'ĐIỂM TB', 'XẾP LOẠI', 'MÔN HỌC'].map(
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
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                      <Users size={28} className="text-gray-400" />
                      <P className="text-sm font-semibold text-gray-500">
                        {searchQuery ? 'Không tìm thấy học sinh phù hợp' : 'Chưa có học sinh nào'}
                      </P>
                    </div>
                  </td>
                </tr>
              )}

              {filteredStudents.map((student, idx) => {
                const mastery = classifyOverallMastery(student.overallAverageScore);
                const scoreColor =
                  student.overallAverageScore >= 80
                    ? '#16A34A'
                    : student.overallAverageScore >= 60
                      ? '#2563EB'
                      : student.overallAverageScore >= 40
                        ? '#D97706'
                        : '#DC2626';

                const initials = student.studentName
                  .split(' ')
                  .map((w) => w[0])
                  .slice(-2)
                  .join('')
                  .toUpperCase();

                return (
                  <tr
                    key={student.studentId}
                    className="transition-colors hover:bg-slate-50/80"
                    style={{
                      borderBottom:
                        idx < filteredStudents.length - 1
                          ? '1px solid #F9FAFB'
                          : 'none',
                    }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{
                            background: '#EFF6FF',
                            color: '#3B82F6',
                          }}
                        >
                          {initials}
                        </div>
                        <div>
                          <P className="text-sm font-semibold text-gray-900">
                            {student.studentName}
                          </P>
                          <P className="text-xs text-gray-400">
                            {student.studentEmail}
                          </P>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-700">
                        {student.totalExercises}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="text-sm font-bold"
                        style={{ color: scoreColor }}
                      >
                        {student.overallAverageScore.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${MASTERY_COLORS[mastery]}`}
                      >
                        {MASTERY_ICONS[mastery]} {MASTERY_LABELS[mastery]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {student.bySubject.slice(0, 3).map((subj) => (
                          <span
                            key={subj.subjectId}
                            className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600"
                          >
                            {subj.subjectName}: {subj.averageScore.toFixed(0)}%
                          </span>
                        ))}
                        {student.bySubject.length > 3 && (
                          <span className="text-xs text-gray-400">
                            +{student.bySubject.length - 3}
                          </span>
                        )}
                      </div>
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