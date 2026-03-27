'use client';

import { useState } from "react";
import {
  ClipboardList, CheckCircle2, Star, SlidersHorizontal,
  Download, MoreHorizontal, Calendar, Clock, Sparkles, Plus
} from "lucide-react";
import StatCard from "./StatCard";

const exams = [
  {
    id: 1,
    name: "Kiểm tra Giữa kỳ I",
    updated: "Cập nhật: 2 giờ trước",
    chapter: "Chương 1: Động lực học",
    subject: "VẬT LÝ",
    subjectColor: "#6366F1",
    subjectBg: "#EEF2FF",
    done: 45, total: 45,
    status: "Đã kết thúc",
    statusType: "ended",
  },
  {
    id: 2,
    name: "Kiểm tra 15 phút - Hệ tuần hoàn",
    updated: "Cập nhật: Đang diễn ra",
    chapter: "Chủ đề 3: Cơ thể người",
    subject: "SINH HỌC",
    subjectColor: "#16A34A",
    subjectBg: "#F0FDF4",
    done: 28, total: 42,
    status: "Đang diễn ra",
    statusType: "active",
  },
  {
    id: 3,
    name: "Bài khảo sát Năng lực Cuối chương 4",
    updated: "Bắt đầu: 15/11/2024",
    chapter: "Chương 4: Thống kê và Xác suất",
    subject: "TOÁN HỌC",
    subjectColor: "#F59E0B",
    subjectBg: "#FFFBEB",
    done: 0, total: 40,
    status: "Đã lên lịch",
    statusType: "scheduled",
  },
  {
    id: 4,
    name: "Ôn tập trắc nghiệm chương 2",
    updated: "Cập nhật: 3 ngày trước",
    chapter: "Chương 2: Liên kết hóa học",
    subject: "HÓA HỌC",
    subjectColor: "#EF4444",
    subjectBg: "#FEF2F2",
    done: 38, total: 38,
    status: "Đã kết thúc",
    statusType: "ended",
  },
];

const statusStyles: Record<string, { bg: string; color: string; dot: string }> = {
  ended:     { bg: "#F3F4F6", color: "#6B7280", dot: "#9CA3AF" },
  active:    { bg: "#F0FDF4", color: "#16A34A", dot: "#22C55E" },
  scheduled: { bg: "#FFFBEB", color: "#D97706", dot: "#F59E0B" },
};

function ProgressBar({ done, total }: { done: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 90, height: 6, background: "#EFF6FF", borderRadius: 999 }}>
        <div style={{ height: 6, width: `${pct}%`, background: pct === 0 ? "#D1D5DB" : "#3B82F6", borderRadius: 999, transition: "width 0.4s" }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }}>{done}/{total}</span>
    </div>
  );
}

function StatusBadge({ status, type }: { status: string; type: string }) {
  const s = statusStyles[type] || statusStyles.ended;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: s.bg, color: s.color, fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 999 }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
      {status}
    </span>
  );
}

export default function ExamManagement() {
  const [page, setPage] = useState(1);
  const totalPages = 2;

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif", padding: "28px 28px", position: "relative" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
          <Calendar size={13} color="#3B82F6" />
          <span style={{ fontSize: 13, color: "#3B82F6", fontWeight: 500 }}>Học kỳ 1 - 2024</span>
        </div>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#111827", margin: 0 }}>Quản lý Bài kiểm tra</h1>
            <p style={{ fontSize: 13, color: "#9CA3AF", marginTop: 6, marginBottom: 0 }}>
              Theo dõi, tạo và phân tích kết quả các bài đánh giá định kỳ.
            </p>
          </div>
          <button style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "linear-gradient(135deg, #3B82F6, #2563EB)",
            border: "none", borderRadius: 12, padding: "11px 22px",
            fontSize: 14, fontWeight: 700, color: "#fff", cursor: "pointer",
            boxShadow: "0 4px 14px rgba(59,130,246,0.35)", transition: "opacity 0.2s",
          }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            <Plus size={16} /> Tạo bài mới
            <Sparkles size={14} style={{ marginLeft: 2 }} />
          </button>
        </div>

        {/* Stat cards */}
        <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
          <StatCard
            icon={ClipboardList} iconBg="#EFF6FF" iconColor="#3B82F6"
            label="Tổng số bài kiểm tra" value="24"
            badge="+2 tháng này" badgeUp={true}
          />
          <StatCard
            icon={CheckCircle2} iconBg="#F5F3FF" iconColor="#8B5CF6"
            label="Tỉ lệ hoàn thành trung bình" value="88.5%"
            badge="+0.5%" badgeUp={true}
          />
          <StatCard
            icon={Star} iconBg="#FFFBEB" iconColor="#F59E0B"
            label="Điểm trung bình khối" value="7.2 / 10"
            badge="-0.1%" badgeUp={false}
          />
        </div>

        {/* Table card */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", overflow: "hidden" }}>

          {/* Table header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: "1px solid #F3F4F6" }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>Danh sách bài kiểm tra</span>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 9,
                padding: "7px 14px", fontSize: 13, fontWeight: 500, color: "#374151", cursor: "pointer",
                transition: "all 0.15s",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#3B82F6"; e.currentTarget.style.color = "#3B82F6"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.color = "#374151"; }}
              >
                <SlidersHorizontal size={14} /> Bộ lọc
              </button>
              <button style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 9,
                padding: "7px 14px", fontSize: 13, fontWeight: 500, color: "#374151", cursor: "pointer",
                transition: "all 0.15s",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#3B82F6"; e.currentTarget.style.color = "#3B82F6"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.color = "#374151"; }}
              >
                <Download size={14} /> Xuất dữ liệu
              </button>
            </div>
          </div>

          {/* Column headers */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "2.2fr 1.8fr 1fr 1.2fr 1.1fr 0.4fr",
            padding: "10px 24px",
            borderBottom: "1px solid #F3F4F6",
            background: "#FAFAFA",
          }}>
            {["TÊN BÀI KIỂM TRA", "CHƯƠNG / CHỦ ĐỀ", "MÔN HỌC", "HOÀN THÀNH", "TRẠNG THÁI", "THAO TÁC"].map(h => (
              <span key={h} style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.07em" }}>{h}</span>
            ))}
          </div>

          {/* Rows */}
          {exams.map((exam, i) => (
            <div
              key={exam.id}
              style={{
                display: "grid",
                gridTemplateColumns: "2.2fr 1.8fr 1fr 1.2fr 1.1fr 0.4fr",
                padding: "16px 24px",
                alignItems: "center",
                borderBottom: i < exams.length - 1 ? "1px solid #F9FAFB" : "none",
                transition: "background 0.15s",
                cursor: "pointer",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#FAFAFA")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              {/* Name */}
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: 0 }}>{exam.name}</p>
                <p style={{ fontSize: 11, color: "#9CA3AF", margin: "3px 0 0", display: "flex", alignItems: "center", gap: 4 }}>
                  <Clock size={10} /> {exam.updated}
                </p>
              </div>
              {/* Chapter */}
              <span style={{ fontSize: 13, color: "#6B7280" }}>{exam.chapter}</span>
              {/* Subject */}
              <span style={{
                fontSize: 11, fontWeight: 800, color: exam.subjectColor,
                background: exam.subjectBg, padding: "3px 10px", borderRadius: 999,
                letterSpacing: "0.04em", display: "inline-block",
              }}>{exam.subject}</span>
              {/* Progress */}
              <ProgressBar done={exam.done} total={exam.total} />
              {/* Status */}
              <StatusBadge status={exam.status} type={exam.statusType} />
              {/* Actions */}
              <button style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", padding: 4, display: "flex", alignItems: "center" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#374151")}
                onMouseLeave={e => (e.currentTarget.style.color = "#9CA3AF")}
              >
                <MoreHorizontal size={18} />
              </button>
            </div>
          ))}

          {/* Pagination */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "14px 24px", borderTop: "1px solid #F3F4F6",
          }}>
            <span style={{ fontSize: 13, color: "#6B7280" }}>
              Hiển thị <b style={{ color: "#111827" }}>1-4</b> trên <b style={{ color: "#111827" }}>24</b> bài kiểm tra
            </span>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid #E5E7EB", background: "#fff", fontSize: 13, color: "#374151", fontWeight: 500, cursor: "pointer" }}
              >Trước</button>
              {[1, 2].map(n => (
                <button key={n} onClick={() => setPage(n)} style={{
                  width: 34, height: 34, borderRadius: 8,
                  border: page === n ? "none" : "1px solid #E5E7EB",
                  background: page === n ? "#3B82F6" : "#fff",
                  color: page === n ? "#fff" : "#374151",
                  fontWeight: page === n ? 700 : 400,
                  fontSize: 13, cursor: "pointer",
                  boxShadow: page === n ? "0 2px 6px rgba(59,130,246,0.3)" : "none",
                  transition: "all 0.15s",
                }}>{n}</button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid #E5E7EB", background: "#fff", fontSize: 13, color: "#374151", fontWeight: 500, cursor: "pointer" }}
              >Sau</button>
            </div>
          </div>
        </div>
      </div>

      {/* FAB */}
      <button style={{
        position: "fixed", bottom: 28, right: 28,
        width: 52, height: 52, borderRadius: "50%",
        background: "linear-gradient(135deg, #3B82F6, #2563EB)",
        border: "none", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 4px 16px rgba(59,130,246,0.45)",
        transition: "transform 0.2s, box-shadow 0.2s",
        zIndex: 50,
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.08)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(59,130,246,0.55)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(59,130,246,0.45)"; }}
      >
        <Sparkles size={22} color="#fff" />
      </button>
    </div>
  );
}