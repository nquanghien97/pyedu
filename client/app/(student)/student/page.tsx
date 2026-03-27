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
  { id: 2, subject: "Vật lý",   sub: "Dòng điện xoay chiều", deadline: "Ngày mai",        level: 2, status: "normal", initial: "P", color: "#6366F1", bg: "#EEF2FF" },
  { id: 3, subject: "Tiếng Anh", sub: "Reading: IELTS Unit 8", deadline: "15 Thg 10",     level: 1, status: "normal", initial: "E", color: "#22C55E", bg: "#F0FDF4" },
];

const activities = [
  { text: "Hoàn thành bài tập Hóa học", meta: "1 giờ trước • Điểm: 9.0", dot: "#22C55E" },
  { text: "Tham gia lớp học AI trực tuyến", meta: "Hôm qua • 45 phút", dot: "#3B82F6" },
  { text: "Đã xem video bài giảng Lịch sử", meta: "2 ngày trước • 15:30", dot: "#F59E0B" },
];

const avatarColors = ["#BFDBFE","#DDD6FE","#FDE68A","#BBF7D0","#FECACA"];

export default function StudentDashboard() {
  const [weekFilter] = useState("Tuần này");

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif", padding: "28px 28px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: 0 }}>
            Chào buổi sáng, Nam! 👋
          </h1>
          <p style={{ fontSize: 13, color: "#9CA3AF", marginTop: 5, marginBottom: 0 }}>
            Hôm nay bạn có 3 bài tập quan trọng cần hoàn thành để duy trì chuỗi học tập.
          </p>
        </div>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
          {/* Bài tập cần làm */}
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", padding: "20px 22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckCircle2 size={20} color="#3B82F6" />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, background: "#F0FDF4", color: "#16A34A", padding: "3px 9px", borderRadius: 999 }}>+2 mới</span>
            </div>
            <p style={{ fontSize: 12, color: "#9CA3AF", margin: "0 0 4px" }}>Bài tập cần làm</p>
            <p style={{ fontSize: 26, fontWeight: 800, color: "#111827", margin: 0 }}>05 <span style={{ fontSize: 13, fontWeight: 400, color: "#9CA3AF" }}>bài</span></p>
          </div>

          {/* Điểm trung bình */}
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", padding: "20px 22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "#F5F3FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Star size={20} color="#8B5CF6" />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, background: "#F0FDF4", color: "#16A34A", padding: "3px 9px", borderRadius: 999 }}>+0.2đ</span>
            </div>
            <p style={{ fontSize: 12, color: "#9CA3AF", margin: "0 0 4px" }}>Điểm trung bình</p>
            <p style={{ fontSize: 26, fontWeight: 800, color: "#111827", margin: 0 }}>8.5 <span style={{ fontSize: 13, fontWeight: 400, color: "#9CA3AF" }}>/10</span></p>
          </div>

          {/* Streak */}
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", padding: "20px 22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "#FFF7ED", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Flame size={20} color="#F97316" />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, background: "#FEF2F2", color: "#DC2626", padding: "3px 9px", borderRadius: 999 }}>Top 5%</span>
            </div>
            <p style={{ fontSize: 12, color: "#9CA3AF", margin: "0 0 4px" }}>Streak học tập</p>
            <p style={{ fontSize: 26, fontWeight: 800, color: "#111827", margin: 0 }}>12 <span style={{ fontSize: 13, fontWeight: 400, color: "#9CA3AF" }}>ngày</span></p>
          </div>
        </div>

        {/* Main content grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16 }}>

          {/* LEFT */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Weekly progress chart */}
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", padding: "20px 22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>Tiến độ mục tiêu tuần</span>
                <button style={{ display: "flex", alignItems: "center", gap: 5, background: "#F8FAFC", border: "1px solid #E5E7EB", borderRadius: 8, padding: "5px 12px", fontSize: 12, color: "#374151", fontWeight: 500, cursor: "pointer" }}>
                  {weekFilter} <ChevronDown size={12} color="#9CA3AF" />
                </button>
              </div>
              <WeeklyChart />
            </div>

            {/* Priority assignments */}
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", overflow: "hidden" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 22px", borderBottom: "1px solid #F3F4F6" }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>Bài tập ưu tiên</span>
                <button style={{ background: "none", border: "none", fontSize: 13, color: "#3B82F6", fontWeight: 500, cursor: "pointer" }}>Xem tất cả</button>
              </div>

              {/* Table head */}
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 0.8fr 1fr", padding: "10px 22px", background: "#FAFAFA", borderBottom: "1px solid #F3F4F6" }}>
                {["MÔN HỌC", "HẠN CHÓT", "ĐỘ KHÓ", "TRẠNG THÁI"].map(h => (
                  <span key={h} style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.06em" }}>{h}</span>
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
                  onMouseEnter={e => (e.currentTarget.style.background = "#FAFAFA")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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