'use client';

import { BookOpen, CheckCircle, ChevronDown, ChevronLeft, ChevronRight, FileText, Pencil, Search, SlidersHorizontal, Sparkles, Trash2, Upload } from "lucide-react";
import StatCard from "./StatCard";
import { useState } from "react";

const assignments = [
  { id: 1, name: "Đạo hàm và ứng dụng (Phần 1)", updated: "Cập nhật 2 giờ trước", subject: "Toán học", subjectColor: "#3B82F6", topic: "Giải tích 12", level: "Trung bình", levelColor: "#F59E0B", status: "Đã xuất bản", statusColor: "green" },
  { id: 2, name: "Chuyển động thẳng biến đổi đều", updated: "Cập nhật hôm qua", subject: "Vật lý", subjectColor: "#8B5CF6", topic: "Cơ học 10", level: "Dễ", levelColor: "#22C55E", status: "Đã xuất bản", statusColor: "green" },
  { id: 3, name: "Bài tập Phản ứng Oxi hóa – Khử", updated: "Cập nhật 3 ngày trước", subject: "Hóa học", subjectColor: "#EC4899", topic: "Hóa vô cơ", level: "Khó", levelColor: "#EF4444", status: "Bản nháp", statusColor: "yellow" },
  { id: 4, name: "Thì hiện tại hoàn thành nâng cao", updated: "Cập nhật 1 tuần trước", subject: "Tiếng Anh", subjectColor: "#F97316", topic: "Ngữ pháp", level: "Trung bình", levelColor: "#F59E0B", status: "Đã xuất bản", statusColor: "green" },
];

const subjectBg: Record<string, string> = {
  "Toán học": "#EFF6FF",
  "Vật lý": "#F5F3FF",
  "Hóa học": "#FDF2F8",
  "Tiếng Anh": "#FFF7ED",
};

function StatusBadge({ status, color } : { status: string, color: string }) {
  const styles = {
    green: { background: "#F0FDF4", color: "#16A34A" },
    yellow: { background: "#FFFBEB", color: "#D97706" },
  };
  const s = styles[color as keyof typeof styles] || styles.green;
  return (
    <span style={{ ...s, fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 999 }}>
      {status}
    </span>
  );
}

function LevelDot({ level, color } : { level: string, color: string }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "#374151", fontWeight: 500 }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block" }} />
      {level}
    </span>
  );
}

function SubjectTag({ subject, color, bg } : { subject: string, color: string, bg: string }) {
  return (
    <span style={{ background: bg, color, fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 999 }}>
      {subject}
    </span>
  );
}

function AssignmentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("Tất cả môn học");
  const [level, setLevel] = useState("Mọi cấp độ");
  const totalPages = 3;

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif", padding: "32px 28px" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827", margin: 0 }}>Quản lý Bài tập</h1>
            <p style={{ fontSize: 13, color: "#9CA3AF", marginTop: 5, marginBottom: 0 }}>
              Tạo, tải lên và tổ chức nội dung học tập của bạn.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {/* AI button */}
            <button style={{
              display: "flex", alignItems: "center", gap: 7,
              background: "#fff", border: "1.5px solid #E2E8F0",
              borderRadius: 10, padding: "9px 18px",
              fontSize: 13, fontWeight: 600, color: "#374151",
              cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              transition: "all 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#3B82F6"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#E2E8F0"}
            >
              <Sparkles size={15} color="#6366F1" />
              AI Tạo bài tập
            </button>
            {/* Upload button */}
            <button style={{
              display: "flex", alignItems: "center", gap: 7,
              background: "linear-gradient(135deg, #3B82F6, #2563EB)",
              border: "none", borderRadius: 10, padding: "9px 18px",
              fontSize: 13, fontWeight: 600, color: "#fff",
              cursor: "pointer", boxShadow: "0 2px 8px rgba(59,130,246,0.35)",
              transition: "opacity 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >
              <Upload size={15} />
              Upload Bài tập &amp; Lời giải
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div style={{
          background: "#fff",
          borderRadius: 14,
          border: "1px solid #F1F5F9",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 20,
          flexWrap: "wrap",
        }}>
          {/* Search */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 200, background: "#F8FAFC", borderRadius: 9, padding: "8px 14px", border: "1px solid #F1F5F9" }}>
            <Search size={15} color="#9CA3AF" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm kiếm theo tên bài tập..."
              style={{ border: "none", background: "transparent", outline: "none", fontSize: 13, color: "#374151", width: "100%" }}
            />
          </div>

          {/* Môn học dropdown */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 13, color: "#6B7280", whiteSpace: "nowrap" }}>Môn học:</span>
            <button style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "#F8FAFC", border: "1px solid #E5E7EB",
              borderRadius: 8, padding: "7px 12px",
              fontSize: 13, color: "#374151", fontWeight: 500, cursor: "pointer",
            }}>
              {subject} <ChevronDown size={13} color="#9CA3AF" />
            </button>
          </div>

          {/* Cấp độ dropdown */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 13, color: "#6B7280", whiteSpace: "nowrap" }}>Cấp độ:</span>
            <button style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "#F8FAFC", border: "1px solid #E5E7EB",
              borderRadius: 8, padding: "7px 12px",
              fontSize: 13, color: "#374151", fontWeight: 500, cursor: "pointer",
            }}>
              {level} <ChevronDown size={13} color="#9CA3AF" />
            </button>
          </div>

          {/* Advanced filter */}
          <button style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "none", border: "none", cursor: "pointer",
            fontSize: 13, color: "#6B7280", fontWeight: 500, whiteSpace: "nowrap",
          }}>
            <SlidersHorizontal size={14} color="#6B7280" />
            Bộ lọc nâng cao
          </button>
        </div>

        {/* Table */}
        <div style={{
          background: "#fff",
          borderRadius: 16,
          border: "1px solid #F1F5F9",
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          overflow: "hidden",
          marginBottom: 24,
        }}>
          {/* Table Head */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "2.5fr 1fr 1.2fr 1fr 1.1fr 0.7fr",
            padding: "11px 20px",
            borderBottom: "1px solid #F3F4F6",
          }}>
            {["TÊN BÀI TẬP", "MÔN HỌC", "CHỦ ĐỀ", "CẤP ĐỘ", "TRẠNG THÁI", "THAO TÁC"].map(h => (
              <span key={h} style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.07em" }}>{h}</span>
            ))}
          </div>

          {/* Rows */}
          {assignments.map((a, i) => (
            <div key={a.id} style={{
              display: "grid",
              gridTemplateColumns: "2.5fr 1fr 1.2fr 1fr 1.1fr 0.7fr",
              padding: "16px 20px",
              borderBottom: i < assignments.length - 1 ? "1px solid #F9FAFB" : "none",
              alignItems: "center",
              transition: "background 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "#FAFAFA"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#111827", margin: 0 }}>{a.name}</p>
                <p style={{ fontSize: 12, color: "#9CA3AF", margin: "2px 0 0" }}>{a.updated}</p>
              </div>
              <div>
                <SubjectTag subject={a.subject} color={a.subjectColor} bg={subjectBg[a.subject] || "#F9FAFB"} />
              </div>
              <span style={{ fontSize: 13, color: "#6B7280" }}>{a.topic}</span>
              <LevelDot level={a.level} color={a.levelColor} />
              <StatusBadge status={a.status} color={a.statusColor} />
              <div style={{ display: "flex", gap: 6 }}>
                <button style={{ background: "#F8FAFC", border: "1px solid #E5E7EB", borderRadius: 7, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#EFF6FF"; e.currentTarget.style.borderColor = "#3B82F6"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#F8FAFC"; e.currentTarget.style.borderColor = "#E5E7EB"; }}
                >
                  <Pencil size={13} color="#6B7280" />
                </button>
                <button style={{ background: "#F8FAFC", border: "1px solid #E5E7EB", borderRadius: 7, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#FEF2F2"; e.currentTarget.style.borderColor = "#EF4444"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#F8FAFC"; e.currentTarget.style.borderColor = "#E5E7EB"; }}
                >
                  <Trash2 size={13} color="#6B7280" />
                </button>
              </div>
            </div>
          ))}

          {/* Pagination */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "14px 20px", borderTop: "1px solid #F3F4F6",
          }}>
            <span style={{ fontSize: 13, color: "#6B7280" }}>
              Hiển thị <b style={{ color: "#111827" }}>1 – 4</b> trên <b style={{ color: "#111827" }}>24</b> bài tập
            </span>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #E5E7EB", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <ChevronLeft size={14} color="#6B7280" />
              </button>
              {[1, 2, 3].map(n => (
                <button key={n} onClick={() => setPage(n)} style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: page === n ? "#3B82F6" : "#fff",
                  color: page === n ? "#fff" : "#374151",
                  fontWeight: page === n ? 700 : 400,
                  fontSize: 13,
                  cursor: "pointer",
                  border: page === n ? "none" : "1px solid #E5E7EB",
                  transition: "all 0.15s",
                }}>{n}</button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #E5E7EB", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <ChevronRight size={14} color="#6B7280" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Stats */}
        <div style={{ display: "flex", gap: 16 }}>
          <StatCard icon={BookOpen}    iconBg="#EFF6FF" iconColor="#3B82F6" value="128" label="TỔNG SỐ BÀI TẬP" />
          <StatCard icon={CheckCircle} iconBg="#F0FDF4" iconColor="#22C55E" value="94"  label="ĐÃ XUẤT BẢN" />
          <StatCard icon={FileText}    iconBg="#FFFBEB" iconColor="#F59E0B" value="34"  label="ĐANG SOẠN THẢO" />
        </div>

      </div>
    </div>
  );
}

export default AssignmentsPage