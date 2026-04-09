'use client';

import { useState } from "react";
import { CheckCircle2, Star, Flame, ChevronDown, Sparkles } from "lucide-react";
import { WeeklyChart } from "./Chart";


// ── Difficulty dots ──────────────────────────────────────────────
function DifficultyDots({ level }: { level: number }) {
  const colors = ["#EF4444", "#F59E0B", "#22C55E"];
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: i < level ? colors[Math.min(level - 1, 2)] : "#E5E7EB", display: "inline-block" }} />
      ))}
    </div>
  );
}

const assignments = [
  { id: 1, subject: "Toán học", sub: "Đạo hàm & Tích phân", deadline: "Hôm nay, 20:00", level: 3, status: "urgent", initial: "M", color: "#EF4444", bg: "#FEF2F2" },
  { id: 2, subject: "Vật lý", sub: "Dòng điện xoay chiều", deadline: "Ngày mai", level: 2, status: "normal", initial: "P", color: "#6366F1", bg: "#EEF2FF" },
  { id: 3, subject: "Tiếng Anh", sub: "Reading: IELTS Unit 8", deadline: "15 Thg 10", level: 1, status: "normal", initial: "E", color: "#22C55E", bg: "#F0FDF4" },
];

const activities = [
  { text: "Hoàn thành bài tập Hóa học", meta: "1 giờ trước • Điểm: 9.0", dot: "#22C55E" },
  { text: "Tham gia lớp học AI trực tuyến", meta: "Hôm qua • 45 phút", dot: "#3B82F6" },
  { text: "Đã xem video bài giảng Lịch sử", meta: "2 ngày trước • 15:30", dot: "#F59E0B" },
];

const avatarColors = ["#BFDBFE", "#DDD6FE", "#FDE68A", "#BBF7D0", "#FECACA"];

export default function StudentDashboard() {
  const [weekFilter] = useState("Tuần này");

  return (
    <div className="min-h-screen bg-slate-50 p-7">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Chào buổi sáng, Nam! 👋</h1>
          <p className="text-sm text-gray-400 mt-1">
            Hôm nay bạn có 3 bài tập quan trọng cần hoàn thành để duy trì chuỗi học tập.
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          {/* Bài tập cần làm */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow duration-200">
            <div className="flex justify-between items-start mb-3.5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50">
                <CheckCircle2 size={20} color="#3B82F6" />
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-green-50 text-green-700">+2 mới</span>
            </div>
            <p className="text-xs text-gray-400 mb-1">Bài tập cần làm</p>
            <p className="text-2xl font-extrabold text-gray-900">
              05 <span className="text-sm font-normal text-gray-400">bài</span>
            </p>
          </div>

          {/* Điểm trung bình */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow duration-200">
            <div className="flex justify-between items-start mb-3.5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-50">
                <Star size={20} color="#8B5CF6" />
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-green-50 text-green-700">+0.2đ</span>
            </div>
            <p className="text-xs text-gray-400 mb-1">Điểm trung bình</p>
            <p className="text-2xl font-extrabold text-gray-900">
              8.5 <span className="text-sm font-normal text-gray-400">/10</span>
            </p>
          </div>

          {/* Streak */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow duration-200">
            <div className="flex justify-between items-start mb-3.5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-orange-50">
                <Flame size={20} color="#F97316" />
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-50 text-red-700">Top 5%</span>
            </div>
            <p className="text-xs text-gray-400 mb-1">Streak học tập</p>
            <p className="text-2xl font-extrabold text-gray-900">
              12 <span className="text-sm font-normal text-gray-400">ngày</span>
            </p>
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* LEFT */}
          <div className="flex flex-col gap-4">

            {/* Weekly progress chart */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow duration-200">
              <div className="flex justify-between items-center mb-4">
                <span className="text-base font-bold text-gray-900">Tiến độ mục tiêu tuần</span>
                <button className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-600 font-medium cursor-pointer hover:bg-slate-100 transition-colors">
                  {weekFilter} <ChevronDown size={12} color="#9CA3AF" />
                </button>
              </div>
              <WeeklyChart />
            </div>

            {/* Priority assignments */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow duration-200">
              <div className="flex justify-between items-center mb-4">
                <span className="text-base font-bold text-gray-900">Bài tập ưu tiên</span>
                <button className="text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors">Xem tất cả</button>
              </div>

              {/* Table head */}
              <div className="grid grid-cols-4 gap-4 px-5 py-2.5 bg-slate-50 border-b border-slate-200">
                {["MÔN HỌC", "HẠN CHÓT", "ĐỘ KHÓ", "TRẠNG THÁI"].map(h => (
                  <span key={h} className="text-xs font-bold text-slate-500 tracking-wide">{h}</span>
                ))}
              </div>

              {assignments.map((a, i) => (
                <div key={a.id}
                  style={{
                    display: "grid", gridTemplateColumns: "2fr 1fr 0.8fr 1fr",
                    padding: "14px 22px", alignItems: "center",
                    borderBottom: i < assignments.length - 1 ? "1px solid #F9FAFB" : "none",
                    transition: "background 0.15s",
                  }}
                  className={`grid grid-cols-4 gap-4 px-5 py-2.5 bg-slate-50  ${i < assignments.length - 1 && 'border-b border-[#F9FAFB]'} duration-300`}
                  onMouseEnter={e => (e.currentTarget.style.background = "#FAFAFA")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <div className="flex items-center gap-2">
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: a.bg, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, color: a.color, flexShrink: 0 }}>
                      {a.initial}
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", margin: 0 }}>{a.subject}</p>
                      <p style={{ fontSize: 11, color: "#9CA3AF", margin: "2px 0 0" }}>{a.sub}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: 13, color: a.status === "urgent" ? "#EF4444" : "#6B7280", fontWeight: a.status === "urgent" ? 600 : 400 }}>{a.deadline}</span>
                  <DifficultyDots level={a.level} />
                  <div>
                    {a.status === "urgent" ? (
                      <button style={{
                        background: "linear-gradient(135deg, #3B82F6, #2563EB)",
                        border: "none", borderRadius: 8, padding: "6px 16px",
                        fontSize: 12, fontWeight: 700, color: "#fff", cursor: "pointer",
                        boxShadow: "0 2px 8px rgba(59,130,246,0.3)",
                      }}>Làm ngay</button>
                    ) : (
                      <button style={{ background: "none", border: "none", fontSize: 13, color: "#3B82F6", fontWeight: 500, cursor: "pointer" }}>Chi tiết</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* AI suggestion */}
            <div style={{
              background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
              borderRadius: 16, padding: "20px 20px",
              boxShadow: "0 4px 16px rgba(59,130,246,0.35)",
              position: "relative", overflow: "hidden",
            }}>
              <svg style={{ position: "absolute", top: 0, right: 0, opacity: 0.1 }} width="120" height="120" viewBox="0 0 120 120">
                <circle cx="80" cy="20" r="60" fill="#fff" />
              </svg>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Sparkles size={14} color="#fff" />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Gợi ý từ AI</span>
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.9)", lineHeight: 1.6, margin: "0 0 10px" }}>
                Dựa trên kết quả tuần này, bạn đang gặp khó khăn ở phần <b>Số phức (Toán)</b>.
              </p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", lineHeight: 1.6, margin: "0 0 16px" }}>
                Bạn nên dành 30 phút luyện tập thêm các bài toán cơ bản để củng cố nền tảng.
              </p>
              <button style={{
                width: "100%", padding: "10px",
                background: "#fff", border: "none", borderRadius: 10,
                fontSize: 13, fontWeight: 700, color: "#2563EB",
                cursor: "pointer", transition: "opacity 0.2s",
              }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.9")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
              >
                Luyện tập ngay
              </button>
            </div>

            {/* Recent activity */}
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", padding: "18px 20px" }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: "0 0 16px" }}>Hoạt động gần đây</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {activities.map((a, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <span style={{ width: 9, height: 9, borderRadius: "50%", background: a.dot, flexShrink: 0, marginTop: 4 }} />
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", margin: 0 }}>{a.text}</p>
                      <p style={{ fontSize: 11, color: "#9CA3AF", margin: "2px 0 0" }}>{a.meta}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Online friends */}
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", padding: "18px 20px" }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: "0 0 14px" }}>Bạn bè trực tuyến</p>
              <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 10 }}>
                {avatarColors.map((c, i) => (
                  <div key={i} style={{
                    width: 34, height: 34, borderRadius: "50%",
                    background: c, border: "2px solid #fff",
                    marginLeft: i === 0 ? 0 : -10,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700, color: "#374151",
                    zIndex: avatarColors.length - i,
                    position: "relative",
                  }}>
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
                <div style={{
                  width: 34, height: 34, borderRadius: "50%",
                  background: "#EFF6FF", border: "2px solid #fff",
                  marginLeft: -10, display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 11, fontWeight: 700,
                  color: "#3B82F6", position: "relative", zIndex: 0,
                }}>+12</div>
              </div>
              <p style={{ fontSize: 12, color: "#9CA3AF", margin: 0 }}>
                Nhóm 12A1 hiện có 5 bạn đang cùng học môn Toán.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}