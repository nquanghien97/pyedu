'use client';

import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { CheckCircle2, Star, ChevronDown, Sparkles, Clock, Trophy } from "lucide-react";
import { WeeklyChart } from "./Chart";
import { getStudentDashboardStats } from "@/services/dashboard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { H1, P } from "@/components/ui/typography";

interface DashboardStats {
  pendingAssignments: number;
  averageScore: number;
  completedAssignments: number;
  totalAssignments: number;
  recentSubmissions: {
    id: string;
    exerciseName: string;
    score: number | null;
    status: string | null;
    submittedAt: string | null;
    attemptNumber: number;
  }[];
}

const activities = [
  { text: "Hoàn thành bài tập Hóa học", meta: "1 giờ trước • Điểm: 9.0", dot: "#22C55E" },
  { text: "Tham gia lớp học AI trực tuyến", meta: "Hôm qua • 45 phút", dot: "#3B82F6" },
  { text: "Đã xem video bài giảng Lịch sử", meta: "2 ngày trước • 15:30", dot: "#F59E0B" },
];

const avatarColors = ["#BFDBFE", "#DDD6FE", "#FDE68A", "#BBF7D0", "#FECACA"];

function formatSubmittedAt(dateStr: string | null): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return "Vừa xong";
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "short" });
}

const STATUS_LABELS: Record<string, string> = {
  submitted: "Đã nộp",
  graded: "Đã chấm",
  late: "Nộp muộn",
};

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const [weekFilter] = useState("Tuần này");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getStudentDashboardStats();
        if (res.success) {
          setStats(res.data);
        }
      } catch (error) {
        console.log("Lỗi khi tải thống kê dashboard:", error);
        // Silent fail
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Greeting based on time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Chào buổi sáng" : hour < 18 ? "Chào buổi chiều" : "Chào buổi tối";

  return (
    <div className="min-h-screen bg-slate-50 p-7">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <H1>{greeting}, {user?.name || 'bạn'}! 👋</H1>
          <P className="text-sm text-gray-400 mt-1">
            {stats && stats.pendingAssignments > 0
              ? `Hôm nay bạn có ${stats.pendingAssignments} bài tập cần hoàn thành.`
              : "Tuyệt vời! Bạn đã hoàn thành tất cả bài tập."}
          </P>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          {loading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 h-30 animate-pulse">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl mb-3" />
                  <div className="w-20 h-3 bg-gray-100 rounded mb-2" />
                  <div className="w-12 h-6 bg-gray-100 rounded" />
                </div>
              ))}
            </>
          ) : (
            <>
              {/* Bài tập cần làm */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow duration-200">
                <div className="flex justify-between items-start mb-3.5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50">
                    <CheckCircle2 size={20} color="#3B82F6" />
                  </div>
                  {stats && stats.pendingAssignments > 0 && (
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700">
                      {stats.pendingAssignments} cần làm
                    </span>
                  )}
                </div>
                <P className="text-xs text-gray-400 mb-1">Bài tập cần làm</P>
                <P className="text-2xl font-extrabold text-gray-900">
                  {stats?.pendingAssignments ?? 0}{" "}
                  <span className="text-sm font-normal text-gray-400">bài</span>
                </P>
              </div>

              {/* Điểm trung bình */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow duration-200">
                <div className="flex justify-between items-start mb-3.5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-50">
                    <Star size={20} color="#8B5CF6" />
                  </div>
                  {stats && stats.averageScore > 0 && (
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-green-50 text-green-700">
                      {stats.averageScore >= 8 ? "Giỏi" : stats.averageScore >= 6.5 ? "Khá" : "TB"}
                    </span>
                  )}
                </div>
                <P className="text-xs text-gray-400 mb-1">Điểm trung bình</P>
                <P className="text-2xl font-extrabold text-gray-900">
                  {stats?.averageScore ?? 0}{" "}
                  <span className="text-sm font-normal text-gray-400">/10</span>
                </P>
              </div>

              {/* Completed / Total */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow duration-200">
                <div className="flex justify-between items-start mb-3.5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-50">
                    <Trophy size={20} color="#22C55E" />
                  </div>
                  {stats && stats.totalAssignments > 0 && (
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
                      {Math.round((stats.completedAssignments / stats.totalAssignments) * 100)}%
                    </span>
                  )}
                </div>
                <P className="text-xs text-gray-400 mb-1">Đã hoàn thành</P>
                <P className="text-2xl font-extrabold text-gray-900">
                  {stats?.completedAssignments ?? 0}{" "}
                  <span className="text-sm font-normal text-gray-400">/ {stats?.totalAssignments ?? 0} bài</span>
                </P>
              </div>
            </>
          )}
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* LEFT */}
          <div className="flex flex-col gap-4">

            {/* Weekly progress chart */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow duration-200">
              <div className="flex justify-between items-center mb-4">
                <span className="text-base font-bold text-gray-900">Tiến độ mục tiêu tuần</span>
                <Button variant="outline" className="flex items-center gap-2 bg-slate-50 border text-sm text-slate-600 font-medium hover:bg-slate-100">
                  {weekFilter} <ChevronDown size={12} color="#9CA3AF" />
                </Button>
              </div>
              <WeeklyChart />
            </div>

            {/* Recent submissions */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow duration-200">
              <div className="flex justify-between items-center mb-4">
                <span className="text-base font-bold text-gray-900">Bài nộp gần đây</span>
                <Link href="/student/assignments" className="text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors">
                  Xem tất cả
                </Link>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
                </div>
              ) : stats && stats.recentSubmissions.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentSubmissions.map((s) => (
                    <div key={s.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                        <CheckCircle2 size={16} className="text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <P className="text-sm font-medium text-gray-800 truncate">{s.exerciseName}</P>
                        <P className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock size={10} />
                          {formatSubmittedAt(s.submittedAt)}
                          {s.score !== null && ` • Điểm: ${(s.score / 10).toFixed(1)}`}
                          {s.attemptNumber > 1 && (
                            <span className="ml-1 px-1.5 py-0 rounded bg-purple-50 text-purple-600 font-medium">
                              Lần {s.attemptNumber}
                            </span>
                          )}
                        </P>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        s.status === "graded"
                          ? "bg-green-50 text-green-600"
                          : "bg-blue-50 text-blue-600"
                      }`}>
                        {STATUS_LABELS[s.status || ""] || s.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-sm text-gray-400">
                  <P>Chưa có bài nộp nào</P>
                  <Link href="/student/assignments" className="text-blue-500 text-xs mt-1 hover:text-blue-600">
                    Xem bài tập được giao →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col gap-4">

            {/* AI suggestion */}
            <div className="relative overflow-hidden bg-linear-to-br from-blue-500 to-blue-700 rounded-2xl p-5 shadow-md">
              <svg className="absolute top-0 right-0 opacity-10" width="120" height="120" viewBox="0 0 120 120">
                <circle cx="80" cy="20" r="60" fill="#fff" />
              </svg>
              <div className="flex items-center gap-2 mb-3.5">
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                  <Sparkles size={14} color="#fff" />
                </div>
                <span className="text-sm font-bold text-white">Gợi ý từ AI</span>
              </div>
              <P className="text-sm text-white/90 leading-relaxed mb-2">
                {stats && stats.averageScore < 7
                  ? "Hãy tập trung vào các bài tập cơ bản để nâng cao điểm trung bình nhé!"
                  : "Bạn đang học rất tốt! Hãy thử thách bản thân với các bài tập nâng cao."}
              </P>
              <P className="text-xs text-white/70 leading-relaxed mb-4">
                {stats && stats.pendingAssignments > 0
                  ? `Còn ${stats.pendingAssignments} bài tập chưa hoàn thành. Hãy ưu tiên bài sắp hết hạn!`
                  : "Tuyệt vời! Bạn đã hoàn thành tất cả bài tập. Hãy ôn lại kiến thức cũ."}
              </P>
              <Link
                href="/student/chat"
                className="block w-full py-2.5 bg-white rounded-xl text-sm font-bold text-blue-600 text-center hover:opacity-90 transition-opacity"
              >
                Hỏi AI ngay
              </Link>
            </div>

            {/* Recent activity */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow duration-200">
              <P className="text-base font-bold text-gray-900 mb-4">Hoạt động gần đây</P>
              <div className="space-y-3.5">
                {activities.map((a, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 mt-1"
                      style={{ background: a.dot }}
                    />
                    <div>
                      <P className="text-sm font-semibold text-gray-800">{a.text}</P>
                      <P className="text-xs text-gray-400 mt-0.5">{a.meta}</P>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Online friends */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow duration-200">
              <P className="text-base font-bold text-gray-900 mb-3.5">Bạn bè trực tuyến</P>
              <div className="flex items-center mb-2.5">
                {avatarColors.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-center text-xs font-bold text-gray-700 rounded-full border-2 border-white"
                    style={{
                      width: 34,
                      height: 34,
                      background: c,
                      marginLeft: i === 0 ? 0 : -10,
                      zIndex: avatarColors.length - i,
                      position: "relative",
                    }}
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
                <div
                  className="flex items-center justify-center text-xs font-bold text-blue-500 rounded-full border-2 border-white"
                  style={{
                    width: 34,
                    height: 34,
                    background: "#EFF6FF",
                    marginLeft: -10,
                    position: "relative",
                    zIndex: 0,
                  }}
                >
                  +12
                </div>
              </div>
              <P className="text-xs text-gray-400">
                Nhóm 12A1 hiện có 5 bạn đang cùng học môn Toán.
              </P>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}