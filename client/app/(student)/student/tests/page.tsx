'use client';

import { useState } from "react";
import { CheckCircle2, Clock, Star, SlidersHorizontal, ChevronLeft, ChevronRight, Info, HelpCircle } from "lucide-react";

type Tab = "chapter" | "schedule" | "results";

const tabs: { key: Tab; label: string; icon: string }[] = [
  { key: "chapter",  label: "Bài kiểm tra chương", icon: "📋" },
  { key: "schedule", label: "Lịch kiểm tra",       icon: "📅" },
  { key: "results",  label: "Kết quả kiểm tra",    icon: "📊" },
];

const exams = [
  {
    id: 1,
    subject: "Toán học",
    subjectBg: "#EEF2FF",
    subjectColor: "#6366F1",
    subjectIcon: "Σ",
    chapter: "Chương 1: Đạo hàm",
    duration: "45 phút",
    status: "done",
    action: "review",
  },
  {
    id: 2,
    subject: "Vật lý",
    subjectBg: "#FFFBEB",
    subjectColor: "#F59E0B",
    subjectIcon: "⚡",
    chapter: "Chương 2: Sóng cơ",
    duration: "60 phút",
    status: "notstarted",
    action: "start",
  },
  {
    id: 3,
    subject: "Hóa học",
    subjectBg: "#F0FDF4",
    subjectColor: "#22C55E",
    subjectIcon: "🧪",
    chapter: "Chương 3: Amin",
    duration: "45 phút",
    status: "ongoing",
    action: "continue",
  },
  {
    id: 4,
    subject: "Ngữ văn",
    subjectBg: "#F5F3FF",
    subjectColor: "#8B5CF6",
    subjectIcon: "📝",
    chapter: "Chương 1: Văn học hiện đại",
    duration: "90 phút",
    status: "done",
    action: "review",
  },
];

const statusConfig: Record<string, { label: string; bg: string; color: string; dot: string }> = {
  done:       { label: "Đã hoàn thành", bg: "#F0FDF4", color: "#16A34A", dot: "#22C55E" },
  notstarted: { label: "Chưa bắt đầu",  bg: "#F3F4F6", color: "#6B7280", dot: "#D1D5DB" },
  ongoing:    { label: "Đang diễn ra",  bg: "#ECFDF5", color: "#059669", dot: "#10B981" },
};

const actionConfig: Record<string, { label: string; variant: "link" | "button" }> = {
  review:   { label: "Xem lại",  variant: "link"   },
  start:    { label: "Làm bài",  variant: "button" },
  continue: { label: "Tiếp tục", variant: "link"   },
};

function StatusBadge({ type }: { type: string }) {
  const s = statusConfig[type];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: s.bg, color: s.color,
      fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 999,
    }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.dot }} />
      {s.label}
    </span>
  );
}

function ActionButton({ type }: { type: string }) {
  const a = actionConfig[type];
  if (a.variant === "button") {
    return (
      <button style={{
        background: "linear-gradient(135deg, #3B82F6, #2563EB)",
        border: "none", borderRadius: 9, padding: "7px 20px",
        fontSize: 13, fontWeight: 700, color: "#fff", cursor: "pointer",
        boxShadow: "0 2px 8px rgba(59,130,246,0.3)", transition: "opacity 0.2s",
      }}
        onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
        onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
      >{a.label}</button>
    );
  }
  return (
    <button style={{
      background: "none", border: "none", fontSize: 13,
      fontWeight: 600, color: "#3B82F6", cursor: "pointer", padding: 0,
      transition: "color 0.15s",
    }}
      onMouseEnter={e => (e.currentTarget.style.color = "#1D4ED8")}
      onMouseLeave={e => (e.currentTarget.style.color = "#3B82F6")}
    >{a.label}</button>
  );
}

export default function TestsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("chapter");
  const [page, setPage] = useState(1);
  const totalPages = 3;

  return (
    <div style={{
      minHeight: "100vh", background: "#F8FAFC",
      fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
      padding: "24px 28px",
    }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #E5E7EB", marginBottom: 24 }}>
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                padding: "10px 20px", fontSize: 14,
                fontWeight: activeTab === t.key ? 600 : 400,
                color: activeTab === t.key ? "#3B82F6" : "#6B7280",
                borderBottom: activeTab === t.key ? "2px solid #3B82F6" : "2px solid transparent",
                marginBottom: -1, display: "flex", alignItems: "center", gap: 6,
                transition: "all 0.15s", whiteSpace: "nowrap",
              }}
            >
              <span style={{ fontSize: 14 }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 22 }}>
          {/* Hoàn thành */}
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", padding: "20px 22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: "#6B7280", fontWeight: 500 }}>Hoàn thành</span>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckCircle2 size={17} color="#22C55E" />
              </div>
            </div>
            <p style={{ fontSize: 32, fontWeight: 800, color: "#111827", margin: "0 0 6px" }}>24</p>
            <p style={{ fontSize: 12, color: "#16A34A", margin: 0, fontWeight: 500 }}>↑ Tăng 15% so với tháng trước</p>
          </div>

          {/* Đang đợi */}
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", padding: "20px 22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: "#6B7280", fontWeight: 500 }}>Đang đợi</span>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: "#FFFBEB", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Clock size={17} color="#F59E0B" />
              </div>
            </div>
            <p style={{ fontSize: 32, fontWeight: 800, color: "#111827", margin: "0 0 6px" }}>03</p>
            <p style={{ fontSize: 12, color: "#9CA3AF", margin: 0 }}>Gần nhất: Toán học (Mai)</p>
          </div>

          {/* Điểm TB */}
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", padding: "20px 22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: "#6B7280", fontWeight: 500 }}>Điểm trung bình</span>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Star size={17} color="#6366F1" />
              </div>
            </div>
            <p style={{ fontSize: 32, fontWeight: 800, color: "#111827", margin: "0 0 6px" }}>8.5</p>
            <p style={{ fontSize: 12, color: "#9CA3AF", margin: 0 }}>Xếp loại: <span style={{ color: "#16A34A", fontWeight: 600 }}>Giỏi</span></p>
          </div>
        </div>

        {/* Table card */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", overflow: "hidden", marginBottom: 20 }}>

          {/* Table toolbar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "18px 24px", borderBottom: "1px solid #F3F4F6" }}>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: 0 }}>Danh sách bài kiểm tra theo chương</p>
              <p style={{ fontSize: 12, color: "#9CA3AF", margin: "4px 0 0" }}>Hiển thị các bài kiểm tra được chỉ định trong học kỳ hiện tại</p>
            </div>
            <button style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "#fff", border: "1.5px solid #E5E7EB",
              borderRadius: 9, padding: "7px 14px",
              fontSize: 13, color: "#374151", fontWeight: 500, cursor: "pointer",
              transition: "all 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#3B82F6"; e.currentTarget.style.color = "#3B82F6"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.color = "#374151"; }}
            >
              <SlidersHorizontal size={14} /> Lọc theo môn
            </button>
          </div>

          {/* Column headers */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 1.6fr 100px 140px 110px",
            padding: "10px 24px",
            background: "#FAFAFA",
            borderBottom: "1px solid #F3F4F6",
          }}>
            {["MÔN HỌC", "CHƯƠNG", "THỜI GIAN", "TRẠNG THÁI", "THAO TÁC"].map(h => (
              <span key={h} style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.07em" }}>{h}</span>
            ))}
          </div>

          {/* Rows */}
          {exams.map((e, i) => (
            <div
              key={e.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1.4fr 1.6fr 100px 140px 110px",
                padding: "16px 24px",
                alignItems: "center",
                borderBottom: i < exams.length - 1 ? "1px solid #F9FAFB" : "none",
                transition: "background 0.15s",
                cursor: "pointer",
              }}
              onMouseEnter={ev => (ev.currentTarget.style.background = "#FAFAFA")}
              onMouseLeave={ev => (ev.currentTarget.style.background = "transparent")}
            >
              {/* Subject */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: e.subjectBg, display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 16, flexShrink: 0,
                }}>
                  {e.subjectIcon}
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{e.subject}</span>
              </div>

              {/* Chapter */}
              <span style={{ fontSize: 13, color: "#6B7280" }}>{e.chapter}</span>

              {/* Duration */}
              <span style={{ fontSize: 13, color: "#374151" }}>{e.duration}</span>

              {/* Status */}
              <StatusBadge type={e.status} />

              {/* Action */}
              <ActionButton type={e.action} />
            </div>
          ))}

          {/* Pagination */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "14px 24px", borderTop: "1px solid #F3F4F6",
          }}>
            <span style={{ fontSize: 13, color: "#6B7280" }}>
              Hiển thị <b style={{ color: "#111827" }}>4</b> trong tổng số <b style={{ color: "#111827" }}>12</b> bài kiểm tra
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
                  fontSize: 13, cursor: "pointer",
                  border: page === n ? "none" : "1px solid #E5E7EB",
                  boxShadow: page === n ? "0 2px 6px rgba(59,130,246,0.3)" : "none",
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

        {/* Bottom cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

          {/* Notice card */}
          <div style={{
            background: "#EFF6FF", borderRadius: 14,
            border: "1px solid #BFDBFE", padding: "18px 20px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "#DBEAFE", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Info size={14} color="#3B82F6" />
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#1E40AF" }}>Lưu ý quan trọng</span>
            </div>
            <ul style={{ margin: 0, padding: "0 0 0 16px", display: "flex", flexDirection: "column", gap: 8 }}>
              <li style={{ fontSize: 13, color: "#1E40AF", lineHeight: 1.5 }}>
                Bạn cần hoàn thành tất cả các bài kiểm tra chương trước khi thi học kỳ.
              </li>
              <li style={{ fontSize: 13, color: "#1E40AF", lineHeight: 1.5 }}>
                AI sẽ phân tích kết quả và đề xuất lộ trình ôn tập bổ sung dựa trên những phần bạn còn yếu.
              </li>
            </ul>
          </div>

          {/* Help card */}
          <div style={{
            background: "#fff", borderRadius: 14,
            border: "1px solid #F1F5F9",
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            padding: "18px 20px",
            display: "flex", flexDirection: "column", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: 0 }}>Cần hỗ trợ?</p>
                <p style={{ fontSize: 13, color: "#9CA3AF", margin: "6px 0 18px", lineHeight: 1.5 }}>
                  Gặp sự cố khi làm bài kiểm tra trực tuyến?
                </p>
                <button style={{
                  background: "#111827", border: "none", borderRadius: 10,
                  padding: "9px 20px", fontSize: 13, fontWeight: 700,
                  color: "#fff", cursor: "pointer", transition: "opacity 0.2s",
                }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                >
                  Liên hệ hỗ trợ
                </button>
              </div>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <HelpCircle size={22} color="#9CA3AF" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}