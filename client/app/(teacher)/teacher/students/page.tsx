'use client';

import { useState } from "react";
import { UserPlus, Download, ChevronLeft, ChevronRight } from "lucide-react";

type RankColor = "green" | "blue" | "gray";

const students: Array<{
  id: number;
  initials: string;
  name: string;
  cls: string;
  score: number;
  rank: string;
  rankColor: RankColor;
  taskStatus: string;
  taskDot: string;
  avatarBg: string;
  avatarColor: string;
}> = [
  { id: 1, initials: "LH", name: "Lê Hoàng Nam",    cls: "10A1", score: 9.2, rank: "Giỏi",      rankColor: "green",  taskStatus: "Hoàn thành",    taskDot: "#22C55E", avatarBg: "#EFF6FF", avatarColor: "#3B82F6" },
  { id: 2, initials: "NT", name: "Nguyễn Thu Hà",   cls: "10A1", score: 7.8, rank: "Khá",       rankColor: "blue",   taskStatus: "Đang làm bài",  taskDot: "#F97316", avatarBg: "#FFF7ED", avatarColor: "#F97316" },
  { id: 3, initials: "TV", name: "Trần Văn Tú",     cls: "10A2", score: 6.1, rank: "Trung bình",rankColor: "gray",   taskStatus: "Chưa bắt đầu", taskDot: "#EF4444", avatarBg: "#F5F3FF", avatarColor: "#8B5CF6" },
  { id: 4, initials: "MT", name: "Mai Thị Tuyết",   cls: "10A1", score: 8.5, rank: "Giỏi",      rankColor: "green",  taskStatus: "Hoàn thành",    taskDot: "#22C55E", avatarBg: "#EFF6FF", avatarColor: "#6366F1" },
  { id: 5, initials: "PV", name: "Phạm Văn Lâm",    cls: "11B1", score: 7.2, rank: "Khá",       rankColor: "blue",   taskStatus: "Hoàn thành",    taskDot: "#22C55E", avatarBg: "#FFF7ED", avatarColor: "#F59E0B" },
];

const rankStyle: Record<RankColor, { background: string; color: string }> = {
  green: { background: "#F0FDF4", color: "#16A34A" },
  blue:  { background: "#EFF6FF", color: "#2563EB" },
  gray:  { background: "#F9FAFB", color: "#6B7280" },
};

function FilterPill({ label, value } : { label: string, value: string }) {
  return (
    <button style={{
      background: "#fff",
      border: "1.5px solid #E5E7EB",
      borderRadius: 999,
      padding: "7px 16px",
      fontSize: 13,
      color: "#374151",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 4,
      whiteSpace: "nowrap",
      transition: "border-color 0.2s",
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "#3B82F6"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "#E5E7EB"}
    >
      <span style={{ color: "#6B7280" }}>{label}</span>
      <span style={{ fontWeight: 700, color: "#111827" }}>{value}</span>
    </button>
  );
}

export default function StudentsPage() {
  const [page, setPage] = useState(1);
  const totalPages = 3;

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif", padding: "32px 28px" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827", margin: 0 }}>Danh sách học sinh</h1>
            <p style={{ fontSize: 13, color: "#9CA3AF", marginTop: 5, marginBottom: 0 }}>
              Quản lý và theo dõi tiến độ học tập của các học sinh trong lớp.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "linear-gradient(135deg, #3B82F6, #2563EB)",
              border: "none", borderRadius: 10, padding: "9px 20px",
              fontSize: 13, fontWeight: 600, color: "#fff",
              cursor: "pointer", boxShadow: "0 2px 8px rgba(59,130,246,0.35)",
              transition: "opacity 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >
              <UserPlus size={15} />
              Thêm học sinh
            </button>
            <button style={{
              width: 38, height: 38, borderRadius: 10,
              border: "1.5px solid #E5E7EB", background: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", transition: "all 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#3B82F6"; e.currentTarget.style.background = "#EFF6FF"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.background = "#fff"; }}
            >
              <Download size={15} color="#6B7280" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          <FilterPill label="Lớp:" value="Tất cả các lớp" />
          <FilterPill label="Học lực:" value="Tất cả học lực" />
          <FilterPill label="Trạng thái:" value="Tất cả trạng thái" />
        </div>

        {/* Table */}
        <div style={{
          background: "#fff",
          borderRadius: 16,
          border: "1px solid #F1F5F9",
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          overflow: "hidden",
        }}>
          {/* Head */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "2.4fr 0.8fr 0.9fr 1.1fr 1.4fr 1fr",
            padding: "12px 22px",
            borderBottom: "1px solid #F3F4F6",
          }}>
            {["HỌ TÊN HỌC SINH", "LỚP", "ĐIỂM TB", "PHÂN LOẠI", "TRẠNG THÁI BÀI TẬP", "THAO TÁC"].map(h => (
              <span key={h} style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.07em" }}>{h}</span>
            ))}
          </div>

          {/* Rows */}
          {students.map((s, i) => (
            <div key={s.id}
              style={{
                display: "grid",
                gridTemplateColumns: "2.4fr 0.8fr 0.9fr 1.1fr 1.4fr 1fr",
                padding: "14px 22px",
                borderBottom: i < students.length - 1 ? "1px solid #F9FAFB" : "none",
                alignItems: "center",
                transition: "background 0.15s",
                cursor: "default",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#FAFAFA"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              {/* Name + Avatar */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: "50%",
                  background: s.avatarBg, color: s.avatarColor,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700, flexShrink: 0,
                }}>
                  {s.initials}
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{s.name}</span>
              </div>

              {/* Class */}
              <span style={{ fontSize: 13, color: "#6B7280" }}>{s.cls}</span>

              {/* Score */}
              <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{s.score}</span>

              {/* Rank badge */}
              <span style={{
                ...rankStyle[s.rankColor],
                fontSize: 12, fontWeight: 600,
                padding: "3px 12px", borderRadius: 999,
                display: "inline-block",
              }}>
                {s.rank}
              </span>

              {/* Task status */}
              <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "#374151" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.taskDot, flexShrink: 0 }} />
                {s.taskStatus}
              </span>

              {/* Action */}
              <button style={{
                background: "none", border: "none", cursor: "pointer",
                color: "#3B82F6", fontSize: 13, fontWeight: 600,
                padding: 0,
                transition: "color 0.15s",
              }}
                onMouseEnter={e => e.currentTarget.style.color = "#1D4ED8"}
                onMouseLeave={e => e.currentTarget.style.color = "#3B82F6"}
              >
                Xem chi tiết
              </button>
            </div>
          ))}

          {/* Pagination */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "14px 22px", borderTop: "1px solid #F3F4F6",
          }}>
            <span style={{ fontSize: 13, color: "#6B7280" }}>
              Hiển thị <b style={{ color: "#111827" }}>1-5</b> của <b style={{ color: "#111827" }}>42</b> học sinh
            </span>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                style={{
                  height: 32, padding: "0 12px", borderRadius: 8,
                  border: "1px solid #E5E7EB", background: "#fff",
                  fontSize: 13, color: "#6B7280", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 4,
                }}
              >
                <ChevronLeft size={13} /> Trước
              </button>
              {[1, 2, 3].map(n => (
                <button key={n} onClick={() => setPage(n)} style={{
                  width: 32, height: 32, borderRadius: 8,
                  border: page === n ? "none" : "1px solid #E5E7EB",
                  background: page === n ? "#3B82F6" : "#fff",
                  color: page === n ? "#fff" : "#374151",
                  fontWeight: page === n ? 700 : 400,
                  fontSize: 13, cursor: "pointer",
                  transition: "all 0.15s",
                }}>{n}</button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                style={{
                  height: 32, padding: "0 12px", borderRadius: 8,
                  border: "1px solid #E5E7EB", background: "#fff",
                  fontSize: 13, color: "#6B7280", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 4,
                }}
              >
                Sau <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}