'use client';

import { useState } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import { MapPin, Settings, Info, Sparkles } from "lucide-react";

// ── Data ────────────────────────────────────────────────────────
const radarData = [
  { subject: "Toán (9.0)", value: 9.0, fullMark: 10 },
  { subject: "Vật lý (8.5)", value: 8.5, fullMark: 10 },
  { subject: "Hóa học (7.5)", value: 7.5, fullMark: 10 },
  { subject: "Anh văn (8.5)", value: 8.5, fullMark: 10 },
  { subject: "Ngữ văn (8.0)", value: 8.0, fullMark: 10 },
];

const progressData = [
  { month: "Th1", score: 7.2 },
  { month: "Th2", score: 7.8 },
  { month: "Th3", score: 7.5 },
  { month: "Th4", score: 8.3 },
  { month: "Th5", score: 8.5 },
];

const recentGrades = [
  { id: 1, icon: "📘", iconBg: "#EFF6FF", name: "Đạo hàm và ứng dụng", subject: "Toán học", date: "20/05/2024", status: "done", score: "8.5/10" },
  { id: 2, icon: "💬", iconBg: "#FEF2F2", name: "Past Continuous Tense", subject: "Anh văn", date: "18/05/2024", status: "done", score: "9.0/10" },
  { id: 3, icon: "⚗️", iconBg: "#F0FDF4", name: "Cấu tạo nguyên tử", subject: "Hóa học", date: "15/05/2024", status: "done", score: "7.5/10" },
  { id: 4, icon: "📖", iconBg: "#FFFBEB", name: "Tác phẩm Vợ Nhặt", subject: "Ngữ văn", date: "12/05/2024", status: "grading", score: "—/10" },
];

const CustomLineTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: "#1E40AF", borderRadius: 8, padding: "6px 12px" }}>
        <p style={{ color: "#fff", fontSize: 12, fontWeight: 700, margin: 0 }}>{label}</p>
        <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 11, margin: "2px 0 0" }}>Điểm TB: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export default function ReportsPage() {
  return (
    <div style={{
      minHeight: "100vh", background: "#F8FAFC",
      fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
      padding: "24px 28px",
    }}>
      <div className="max-w-7xl mx-auto flex flex-col gap-5">

        {/* ── Top Section ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>

          {/* Level card */}
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", padding: "22px 28px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 18 }}>
              {/* Level badge */}
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: "50%",
                  border: "3px solid #BFDBFE",
                  background: "linear-gradient(135deg, #EFF6FF, #DBEAFE)",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: "#2563EB", lineHeight: 1 }}>L7</span>
                  <span style={{ fontSize: 9, color: "#93C5FD", fontWeight: 600, letterSpacing: "0.05em" }}>LEVEL</span>
                </div>
                {/* Gold badge */}
                <div style={{
                  position: "absolute", bottom: -4, left: "50%", transform: "translateX(-50%)",
                  width: 20, height: 20, borderRadius: "50%",
                  background: "linear-gradient(135deg, #F59E0B, #D97706)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, border: "2px solid #fff",
                }}>🏅</div>
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: "#111827", margin: 0 }}>Level 7 – Khá Giỏi</h2>
                    <p style={{ fontSize: 12, color: "#9CA3AF", margin: "4px 0 0" }}>
                      AI Badge: Top 10% học sinh xuất sắc nhất hệ thống
                    </p>
                  </div>
                  <button style={{
                    background: "linear-gradient(135deg, #3B82F6, #2563EB)",
                    border: "none", borderRadius: 9, padding: "7px 16px",
                    fontSize: 12, fontWeight: 700, color: "#fff", cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(59,130,246,0.3)", whiteSpace: "nowrap",
                  }}>Xem lộ trình</button>
                </div>

                {/* Progress to Level 8 */}
                <div style={{ marginTop: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: "#6B7280" }}>Tiến độ đến Level 8</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#3B82F6" }}>75%</span>
                  </div>
                  <div style={{ height: 7, background: "#EFF6FF", borderRadius: 999 }}>
                    <div style={{ height: 7, width: "75%", background: "linear-gradient(90deg, #3B82F6, #60A5FA)", borderRadius: 999 }} />
                  </div>
                  <p style={{ fontSize: 11, color: "#9CA3AF", margin: "6px 0 0" }}>
                    Bạn cần thêm 250 điểm kinh nghiệm (XP) nữa để lên hạng.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Insights card */}
          <div style={{
            background: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
            borderRadius: 16, padding: "18px 20px",
            boxShadow: "0 4px 16px rgba(59,130,246,0.35)",
            position: "relative", overflow: "hidden",
          }}>
            {/* Decorative circle */}
            <div style={{
              position: "absolute", top: -30, right: -30,
              width: 110, height: 110, borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
            }} />
            <div style={{
              position: "absolute", top: 10, right: 10,
              width: 32, height: 32, borderRadius: 9,
              background: "rgba(255,255,255,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Settings size={15} color="#fff" />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
              <MapPin size={14} color="rgba(255,255,255,0.9)" />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>AI Insights</span>
            </div>

            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.88)", lineHeight: 1.6, margin: "0 0 10px" }}>
              Bạn đang học rất tốt phần <b>Đại số</b>, nhưng cần tập trung hơn vào <b>Hình học không gian</b> để nâng điểm trung bình môn Toán.
            </p>

            <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 8, padding: "8px 12px", marginBottom: 14 }}>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.9)", margin: 0, fontStyle: "italic" }}>
                Môn Anh văn có sự tiến bộ vượt bậc (tăng 1.5 điểm so với tuần trước).
              </p>
            </div>

            <button style={{
              width: "100%", padding: "9px",
              background: "#fff", border: "none", borderRadius: 9,
              fontSize: 13, fontWeight: 700, color: "#2563EB",
              cursor: "pointer", transition: "opacity 0.2s",
            }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.9")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >Gợi ý bài học</button>
          </div>
        </div>

        {/* ── Charts Row ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

          {/* Radar chart */}
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", padding: "20px 22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>Phân tích học lực</span>
              <button style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF" }}>
                <Info size={15} />
              </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart cx="50%" cy="50%" outerRadius="72%" data={radarData}>
                <PolarGrid stroke="#E5E7EB" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fontSize: 11, fill: "#6B7280", fontWeight: 500 }}
                />
                <Radar
                  name="Điểm"
                  dataKey="value"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.18}
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#3B82F6", strokeWidth: 0 }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Line chart */}
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", padding: "20px 22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>Tiến bộ theo tháng</span>
              <span style={{ fontSize: 12, color: "#9CA3AF", background: "#F3F4F6", padding: "3px 10px", borderRadius: 999 }}>6 tháng gần nhất</span>
            </div>
            <ResponsiveContainer width="100%" height={270}>
              <LineChart data={progressData} margin={{ top: 8, right: 10, left: -28, bottom: 0 }}>
                <defs>
                  <linearGradient id="lineAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis domain={[6, 10]} tick={{ fontSize: 10, fill: "#D1D5DB" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomLineTooltip />} />
                <Line
                  type="monotone" dataKey="score"
                  stroke="#3B82F6" strokeWidth={2.5}
                  dot={{ r: 5, fill: "#3B82F6", strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 7, fill: "#3B82F6", stroke: "#fff", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Recent Grades Table ── */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid #F3F4F6" }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>Điểm các bài tập gần đây</span>
            <button style={{ background: "none", border: "none", fontSize: 13, color: "#3B82F6", fontWeight: 600, cursor: "pointer" }}>Xem tất cả</button>
          </div>

          {/* Head */}
          <div style={{
            display: "grid", gridTemplateColumns: "2.5fr 1.2fr 1.2fr 1.1fr 0.8fr",
            padding: "10px 24px", background: "#FAFAFA", borderBottom: "1px solid #F3F4F6",
          }}>
            {["TÊN BÀI TẬP", "MÔN HỌC", "NGÀY NỘP", "TRẠNG THÁI", "ĐIỂM SỐ"].map(h => (
              <span key={h} style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.07em" }}>{h}</span>
            ))}
          </div>

          {/* Rows */}
          {recentGrades.map((g, i) => (
            <div
              key={g.id}
              style={{
                display: "grid", gridTemplateColumns: "2.5fr 1.2fr 1.2fr 1.1fr 0.8fr",
                padding: "15px 24px", alignItems: "center",
                borderBottom: i < recentGrades.length - 1 ? "1px solid #F9FAFB" : "none",
                transition: "background 0.15s", cursor: "pointer",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#FAFAFA")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              {/* Name */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: g.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>
                  {g.icon}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{g.name}</span>
              </div>

              <span style={{ fontSize: 13, color: "#6B7280" }}>{g.subject}</span>
              <span style={{ fontSize: 13, color: "#6B7280" }}>{g.date}</span>

              {/* Status */}
              {g.status === "done" ? (
                <span style={{ fontSize: 12, fontWeight: 600, background: "#F0FDF4", color: "#16A34A", padding: "3px 12px", borderRadius: 999, display: "inline-block" }}>
                  Hoàn thành
                </span>
              ) : (
                <span style={{ fontSize: 12, fontWeight: 600, background: "#FFFBEB", color: "#D97706", padding: "3px 12px", borderRadius: 999, display: "inline-block" }}>
                  Đang chấm
                </span>
              )}

              {/* Score */}
              <span style={{ fontSize: 13, fontWeight: 700, color: g.status === "done" ? "#2563EB" : "#9CA3AF" }}>
                {g.score}
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}