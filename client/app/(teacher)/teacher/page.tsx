'use client'

import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";
import {
  Users,
  ClipboardList,
  CheckCircle,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Plus,
  SlidersHorizontal,
  MoreHorizontal,
  ChevronDown,
  Minus,
  Clock,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import StatCard from "./StatCard";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getTeacherDashboardStats } from "@/services/dashboard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { H1, H2, P } from "@/components/ui/typography";
import { useRouter } from "next/navigation";

const weeklyData = [
  { day: "Thứ 2", value: 30 },
  { day: "Thứ 3", value: 45 },
  { day: "Thứ 4", value: 55 },
  { day: "Thứ 5", value: 80 },
  { day: "Thứ 6", value: 65 },
  { day: "Thứ 7", value: 72 },
  { day: "CN", value: 90 },
];

const students: { name: string, class: string, score: number, trend: string }[] = [
  { name: "Nguyễn Văn A", class: "Lớp 12A1", score: 98, trend: "up" },
  { name: "Trần Thị B", class: "Lớp 12A1", score: 95, trend: "up" },
  { name: "Lê Hoàng C", class: "Lớp 11B2", score: 94, trend: "down" },
  { name: "Phạm Minh D", class: "Lớp 10C5", score: 92, trend: "flat" },
];

const avatarColors = [
  "bg-blue-100 text-blue-600",
  "bg-purple-100 text-purple-600",
  "bg-green-100 text-green-600",
  "bg-orange-100 text-orange-600",
];

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  active: { label: "Đang diễn ra", color: "blue" },
  completed: { label: "Đã kết thúc", color: "green" },
  draft: { label: "Chưa bắt đầu", color: "gray" },
};

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-100 shadow-lg rounded-xl px-3 py-2 text-sm">
        <P className="font-semibold text-gray-700">{label}</P>
        <P className="text-blue-500">{payload[0].value} học sinh</P>
      </div>
    );
  }
  return null;
};

function formatDueDate(dateStr: string | null): string {
  if (!dateStr) return "Chưa đặt";
  const date = new Date(dateStr);
  return date.toLocaleDateString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
  });
}

interface DashboardStats {
  totalStudents: number;
  totalAssignments: number;
  completionRate: number;
  pendingGrading: number;
  recentAssignments: {
    id: string;
    name: string;
    assignedToType: string | null;
    dueDate: string | null;
    status: string | null;
  }[];
}

export default function TeacherPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("Tháng này");
  const [openPopover, setOpenPopover] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getTeacherDashboardStats();
        if (res.success) {
          setStats(res.data);
        }
      } catch (error) {
        // Silent fail, keep mock data
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
    <main className="flex-1 p-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <H1>
            {greeting}, {user?.name || 'Thầy cô'}! 👋
          </H1>
          <P className="text-sm text-gray-400 mt-0.5">
            Dưới đây là tiến độ học tập trong tuần này của học sinh.
          </P>
        </div>
        <Button
          onClick={() => { router.push('/teacher/assignments/assign') }}
          className=""
        >
          <Plus size={16} />
          Giao bài tập mới
        </Button>
      </div>

      {/* Stats Row */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 h-[120px] animate-pulse">
              <div className="w-10 h-10 bg-gray-100 rounded-xl mb-3" />
              <div className="w-16 h-3 bg-gray-100 rounded mb-2" />
              <div className="w-12 h-6 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={Users}
            iconBg="bg-blue-50 text-blue-500"
            label="Tổng học sinh"
            value={stats?.totalStudents ?? 0}
            badge={stats?.totalStudents ? `${stats.totalStudents}` : "0"}
            badgeType="up"
          />
          <StatCard
            icon={ClipboardList}
            iconBg="bg-purple-50 text-purple-500"
            label="Bài tập đã giao"
            value={stats?.totalAssignments ?? 0}
            badge={`${stats?.totalAssignments ?? 0} bài`}
            badgeType="up"
          />
          <StatCard
            icon={CheckCircle}
            iconBg="bg-green-50 text-green-500"
            label="Tỉ lệ hoàn thành"
            value={`${stats?.completionRate ?? 0}%`}
            badge={`${stats?.completionRate ?? 0}%`}
            badgeType={stats && stats.completionRate >= 50 ? "up" : "down"}
          />
          <StatCard
            icon={BookOpen}
            iconBg="bg-orange-50 text-orange-500"
            label="Bài tập cần chấm"
            value={stats?.pendingGrading ?? 0}
            badge={stats?.pendingGrading ? `${stats.pendingGrading} bài` : "0"}
            badgeType="new"
          />
        </div>
      )}

      {/* Chart + Top Students */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Chart */}
        <div className="md:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <H2>
              Tiến độ học tập hàng tuần
            </H2>
            <Popover open={openPopover} onOpenChange={setOpenPopover}>
              <PopoverTrigger>
                <div className="cursor-pointer text-sm text-gray-500 flex items-center gap-1 hover:text-gray-700 transition-colors">
                  {activeTab}
                  <ChevronDown size={14} />
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div>
                  {["Hôm nay", "Tuần này", "Tháng này", "Năm nay"].map((option) => (
                    <div
                      key={option}
                      onClick={() => {
                        setActiveTab(option);
                        setOpenPopover(false);
                      }}
                      className={`cursor-pointer w-full text-left px-3 py-2 rounded-md text-sm ${activeTab === option ? "bg-blue-100 text-blue-600" : "text-gray-700 hover:bg-gray-100"}`}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weeklyData} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3B82F6"
                strokeWidth={2.5}
                fill="url(#colorValue)"
                dot={{ fill: "#3B82F6", r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: "#3B82F6", strokeWidth: 2, stroke: "#fff" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top Students */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <H2>Học sinh tiêu biểu</H2>
            <Button className="text-xs text-blue-500 font-medium hover:text-blue-600">
              Xem tất cả
            </Button>
          </div>
          <div className="space-y-3">
            {students.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${avatarColors[i % avatarColors.length]}`}
                >
                  {s.name.split(" ").pop()?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <P className="text-sm font-medium text-gray-800 truncate">{s.name}</P>
                  <P className="text-xs text-gray-400">
                    {s.class} • {s.score} điểm
                  </P>
                </div>
                <div>
                  {s.trend === "up" ? (
                    <TrendingUp size={16} className="text-green-500" />
                  ) : (
                    s.trend === "down" ? (
                      <TrendingDown size={16} className="text-red-500" />
                    ) : (
                      <Minus size={16} className="text-gray-400" />
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <H2>Bài tập mới nhất</H2>
          <div className="flex items-center gap-2">
            <Link
              href="/teacher/assignments/assign"
              className="text-xs text-blue-500 font-medium hover:text-blue-600 transition-colors"
            >
              Xem tất cả
            </Link>
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-50">
              {["TÊN BÀI TẬP", "LOẠI", "THỜI HẠN", "TRẠNG THÁI", "HÀNH ĐỘNG"].map((h) => (
                <th
                  key={h}
                  className="text-left text-xs font-semibold text-gray-400 tracking-wide px-5 py-3"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
                  </div>
                </td>
              </tr>
            ) : stats && stats.recentAssignments.length > 0 ? (
              stats.recentAssignments.map((a) => {
                const statusInfo = STATUS_MAP[a.status || "draft"] || STATUS_MAP.draft;
                return (
                  <tr
                    key={a.id}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-5 py-4 text-sm text-gray-700 font-medium max-w-xs truncate">
                      {a.name}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {a.assignedToType === "class" ? "Cả lớp" : a.assignedToType === "student" ? "Cá nhân" : "—"}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500 flex items-center gap-1">
                      <Clock size={13} className="text-gray-400" />
                      {formatDueDate(a.dueDate)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusInfo.color === "blue"
                          ? "bg-blue-50 text-blue-600"
                          : statusInfo.color === "green"
                            ? "bg-green-50 text-green-600"
                            : "bg-gray-100 text-gray-500"
                          }`}
                      >
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <Button className="text-sm font-medium text-blue-500 hover:text-blue-700">
                        Chi tiết
                      </Button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-400">
                  Chưa có bài tập nào. Hãy bắt đầu giao bài tập cho học sinh!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}