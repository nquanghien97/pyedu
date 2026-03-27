'use client'

import { useState } from "react";
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

const assignments = [
  {
    id: 1,
    name: "Luyện tập Python Cơ bản – Biến và Kiểu dữ liệu",
    class: "Lớp Công nghệ 1",
    deadline: "12:00, 25 Th10",
    status: "Đang diễn ra",
    statusColor: "blue",
  },
  {
    id: 2,
    name: "Bài kiểm tra Toán – Chương 3",
    class: "Lớp 12A1",
    deadline: "08:00, 28 Th10",
    status: "Chưa bắt đầu",
    statusColor: "gray",
  },
  {
    id: 3,
    name: "Viết đoạn văn Tiếng Anh – Topic: Environment",
    class: "Lớp 11B2",
    deadline: "17:00, 26 Th10",
    status: "Đã kết thúc",
    statusColor: "green",
  },
];

const avatarColors = [
  "bg-blue-100 text-blue-600",
  "bg-purple-100 text-purple-600",
  "bg-green-100 text-green-600",
  "bg-orange-100 text-orange-600",
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-100 shadow-lg rounded-xl px-3 py-2 text-sm">
        <p className="font-semibold text-gray-700">{label}</p>
        <p className="text-blue-500">{payload[0].value} học sinh</p>
      </div>
    );
  }
  return null;
};

export default function TeacherPage() {
  const [activeTab, setActiveTab] = useState("Tháng này");
  const [openPopover, setOpenPopover] = useState(false);

  return (
    <main className="flex-1 p-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Chào buổi sáng, Thầy cô!
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Dưới đây là tiến độ học tập trong tuần này của học sinh.
          </p>
        </div>
        <button className="cursor-pointer flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md active:scale-95">
          <Plus size={16} />
          Giao bài tập mới
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={Users}
          iconBg="bg-blue-50 text-blue-500"
          label="Tổng học sinh"
          value="1,250"
          badge="+5.2%"
          badgeType="up"
        />
        <StatCard
          icon={ClipboardList}
          iconBg="bg-purple-50 text-purple-500"
          label="Bài tập đã giao"
          value="48"
          badge="+12%"
          badgeType="up"
        />
        <StatCard
          icon={CheckCircle}
          iconBg="bg-green-50 text-green-500"
          label="Tỉ lệ hoàn thành"
          value="85%"
          badge="-1.5%"
          badgeType="down"
        />
        <StatCard
          icon={BookOpen}
          iconBg="bg-orange-50 text-orange-500"
          label="Bài tập cần chấm"
          value="12"
          badge="+4 mới"
          badgeType="new"
        />
      </div>

      {/* Chart + Top Students */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Chart */}
        <div className="md:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-gray-800">
              Tiến độ học tập hàng tuần
            </h2>
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
            <h2 className="font-semibold text-gray-800">Học sinh tiêu biểu</h2>
            <button className="text-xs text-blue-500 font-medium hover:text-blue-600 transition-colors">
              Xem tất cả
            </button>
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
                  <p className="text-sm font-medium text-gray-800 truncate">{s.name}</p>
                  <p className="text-xs text-gray-400">
                    {s.class} • {s.score} điểm
                  </p>
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
          <h2 className="font-semibold text-gray-800">Bài tập mới nhất</h2>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors">
              <SlidersHorizontal size={15} />
            </button>
            <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors">
              <MoreHorizontal size={15} />
            </button>
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-50">
              {["TÊN BÀI TẬP", "LỚP", "THỜI HẠN", "TRẠNG THÁI", "HÀNH ĐỘNG"].map((h) => (
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
            {assignments.map((a, i) => (
              <tr
                key={a.id}
                className={`border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors ${i % 2 === 0 ? "" : ""
                  }`}
              >
                <td className="px-5 py-4 text-sm text-gray-700 font-medium max-w-xs">
                  {a.name}
                </td>
                <td className="px-5 py-4 text-sm text-gray-500">{a.class}</td>
                <td className="px-5 py-4 text-sm text-gray-500">{a.deadline}</td>
                <td className="px-5 py-4">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${a.statusColor === "blue"
                      ? "bg-blue-50 text-blue-600"
                      : a.statusColor === "green"
                        ? "bg-green-50 text-green-600"
                        : "bg-gray-100 text-gray-500"
                      }`}
                  >
                    {a.status}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <button className="text-sm font-medium text-blue-500 hover:text-blue-700 transition-colors">
                    Chi tiết
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}