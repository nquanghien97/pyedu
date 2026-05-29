'use client'

import { useState, useEffect } from "react";
import {
  Users,
  UserCheck,
  GraduationCap,
  Shield,
  TrendingUp,
  Clock,
  UserPlus,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { getDashboardStats, getUsers } from "@/services/admin";
import { useAuthStore } from "@/stores/auth.store";
import Link from "next/link";
import { H1, H2, P } from "@/components/ui/typography";

interface DashboardStats {
  total: number;
  admin: number;
  teacher: number;
  student: number;
}

interface RecentUser {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "#EF4444",
  TEACHER: "#3B82F6",
  STUDENT: "#22C55E",
};

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Quản trị viên",
  TEACHER: "Giáo viên",
  STUDENT: "Học sinh",
};

const ROLE_BADGE_STYLES: Record<string, string> = {
  ADMIN: "bg-red-50 text-red-600",
  TEACHER: "bg-blue-50 text-blue-600",
  STUDENT: "bg-green-50 text-green-600",
};

interface StatCardProps {
  icon: React.ComponentType<{ size?: number }>;
  iconBg: string;
  label: string;
  value: number;
  description: string;
}

function StatCard({ icon: Icon, iconBg, label, value, description }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon size={18} />
        </div>
      </div>
      <div>
        <P className="text-xs text-gray-400 mb-1">{label}</P>
        <P className="text-2xl font-bold text-gray-800">{value}</P>
        <P className="text-xs text-gray-400 mt-1">{description}</P>
      </div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { fill: string } }> }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-100 shadow-lg rounded-xl px-3 py-2 text-sm">
        <P className="font-semibold text-gray-700">{payload[0].name}</P>
        <P style={{ color: payload[0].payload.fill }}>{payload[0].value} người dùng</P>
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({ total: 0, admin: 0, teacher: 0, student: 0 });
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([
          getDashboardStats(),
          getUsers({ page: 1, limit: 5 }),
        ]);
        if (statsRes.success) {
          setStats(statsRes.data);
        }
        if (usersRes.success) {
          setRecentUsers(usersRes.data as unknown as RecentUser[]);
        }
      } catch (error) {
        console.log(error)
        // Silent fail
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const pieData = [
    { name: ROLE_LABELS.ADMIN, value: stats.admin, fill: ROLE_COLORS.ADMIN },
    { name: ROLE_LABELS.TEACHER, value: stats.teacher, fill: ROLE_COLORS.TEACHER },
    { name: ROLE_LABELS.STUDENT, value: stats.student, fill: ROLE_COLORS.STUDENT },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <main className="flex-1 p-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <H1>
            Xin chào, {user?.name || "Admin"}! 👋
          </H1>
          <P className="text-sm text-gray-400 mt-0.5">
            Tổng quan hệ thống quản trị PyEdu.
          </P>
        </div>
        <Link
          href="/admin/users"
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md active:scale-95"
        >
          <UserPlus size={16} />
          Quản lý người dùng
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={Users}
          iconBg="bg-blue-50 text-blue-500"
          label="Tổng người dùng"
          value={stats.total}
          description="Tất cả tài khoản"
        />
        <StatCard
          icon={Shield}
          iconBg="bg-red-50 text-red-500"
          label="Quản trị viên"
          value={stats.admin}
          description="Admin accounts"
        />
        <StatCard
          icon={UserCheck}
          iconBg="bg-indigo-50 text-indigo-500"
          label="Giáo viên"
          value={stats.teacher}
          description="Teacher accounts"
        />
        <StatCard
          icon={GraduationCap}
          iconBg="bg-green-50 text-green-500"
          label="Học sinh"
          value={stats.student}
          description="Student accounts"
        />
      </div>

      {/* Chart + Recent Users */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Pie Chart */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <H2 className="mb-4">Phân bổ vai trò</H2>
          {stats.total > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value: string) => (
                    <span className="text-xs text-gray-600">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-55 text-gray-400 text-sm">
              Chưa có dữ liệu
            </div>
          )}
        </div>

        {/* Recent Users */}
        <div className="md:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <H2>Người dùng mới nhất</H2>
            <Link
              href="/admin/users"
              className="text-xs text-blue-500 font-medium hover:text-blue-600 transition-colors"
            >
              Xem tất cả
            </Link>
          </div>
          <div className="space-y-3">
            {recentUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
                  u.role === "ADMIN"
                    ? "bg-red-100 text-red-600"
                    : u.role === "TEACHER"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-green-100 text-green-600"
                }`}>
                  {u.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <P className="text-sm font-medium text-gray-800 truncate">{u.name}</P>
                  <P className="text-xs text-gray-400">{u.email}</P>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${ROLE_BADGE_STYLES[u.role] || "bg-gray-100 text-gray-500"}`}>
                  {ROLE_LABELS[u.role] || u.role}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock size={12} />
                  {formatDate(u.createdAt)}
                </span>
              </div>
            ))}
            {recentUsers.length === 0 && (
              <P className="text-sm text-gray-400 text-center py-4">Chưa có người dùng nào</P>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <H2 className="mb-4">Thao tác nhanh</H2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Link
            href="/admin/users"
            className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all duration-200 group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <Users size={18} className="text-blue-500" />
            </div>
            <div>
              <P className="text-sm font-medium text-gray-800">Quản lý người dùng</P>
              <P className="text-xs text-gray-400">Xem, tạo, sửa, xoá tài khoản</P>
            </div>
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-green-200 hover:bg-green-50/50 transition-all duration-200 group"
          >
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
              <UserPlus size={18} className="text-green-500" />
            </div>
            <div>
              <P className="text-sm font-medium text-gray-800">Tạo tài khoản mới</P>
              <P className="text-xs text-gray-400">Thêm giáo viên, học sinh</P>
            </div>
          </Link>
          <Link
            href="/admin"
            className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50/50 transition-all duration-200 group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
              <TrendingUp size={18} className="text-purple-500" />
            </div>
            <div>
              <P className="text-sm font-medium text-gray-800">Thống kê hệ thống</P>
              <P className="text-xs text-gray-400">Xem báo cáo tổng quan</P>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
