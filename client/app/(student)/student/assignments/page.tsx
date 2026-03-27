'use client';

import { useState } from "react";
import { Search, Bell, Sparkles, ChevronRight } from "lucide-react";

type Tab = "assigned" | "pending" | "history" | "results";

const tabs: { key: Tab; label: string; badge?: number }[] = [
  { key: "assigned", label: "Bài tập được giao" },
  { key: "pending", label: "Bài tập chưa làm", badge: 3 },
  { key: "history", label: "Lịch sử bài tập" },
  { key: "results", label: "Kết quả chấm bài" },
];

const assignments = [
  {
    id: 1,
    subject: "Toán",
    subjectColor: "#6366F1",
    subjectBg: "#EEF2FF",
    title: "Giải tích 1: Đạo hàm cấp cao",
    desc: "Yêu cầu trình bày chi tiết các bước giải",
    deadline: "Hôm qua",
    deadlineNote: "ĐÃ QUÁ HẠN",
    isOverdue: true,
    level: "Khó",
    status: "urgent",
  },
  {
    id: 2,
    subject: "Lý",
    subjectColor: "#8B5CF6",
    subjectBg: "#F5F3FF",
    title: "Cơ học vật rắn và Moment lực",
    desc: "",
    deadline: "24/10/2023",
    deadlineNote: "",
    isOverdue: false,
    level: "Trung bình",
    status: "notstarted",
  },
  {
    id: 3,
    subject: "Anh văn",
    subjectColor: "#22C55E",
    subjectBg: "#F0FDF4",
    title: "Reading Unit 5: Sustainable Energy",
    desc: "",
    deadline: "26/10/2023",
    deadlineNote: "",
    isOverdue: false,
    level: "Dễ",
    status: "inprogress",
  },
];

const gradeResults = [
  {
    id: 1,
    title: "Hóa hữu cơ cơ bản",
    completed: "15/10/2023",
    score: "9.5/10",
    feedback: "Bạn đã nắm rất vững cấu trúc mạch carbon. Cần lưu ý hơn về cách gọi tên các đồng phân phức tạp ở câu 4...",
  },
  {
    id: 2,
    title: "Triết học Mác-Lênin",
    completed: "12/10/2023",
    score: "8.0/10",
    feedback: "Luận điểm sắc bén nhưng phần ví dụ thực tế còn hơi mỏng. Nên bổ sung các số liệu thống kê để tăng tính thuyết phục...",
  },
];

const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
  urgent: { label: "Làm ngay", bg: "#EF4444", color: "#fff" },
  notstarted: { label: "Chưa bắt đầu", bg: "#EFF6FF", color: "#3B82F6" },
  inprogress: { label: "Đang làm", bg: "#F0FDF4", color: "#16A34A" },
};

function StatusBadge({ type }: { type: string }) {
  const s = statusConfig[type];
  return (
    <span style={{
      fontSize: 12, fontWeight: 700, padding: "5px 14px", borderRadius: 999,
      background: s.bg, color: s.color,
      boxShadow: type === "urgent" ? "0 2px 8px rgba(239,68,68,0.25)" : "none",
      whiteSpace: "nowrap",
    }}>{s.label}</span>
  );
}

function SubjectTag({ subject, color, bg }: { subject: string; color: string; bg: string }) {
  return (
    <span style={{
      fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 999,
      background: bg, color, whiteSpace: "nowrap",
    }}>{subject}</span>
  );
}

export default function AssignmentPage() {
  const [activeTab, setActiveTab] = useState<Tab>("assigned");

  return (
    <div style={{
      minHeight: "100vh", background: "#F8FAFC",
      fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
      padding: "28px 32px",
    }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>

        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "#111827", margin: 0 }}>Quản lý bài tập</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "#fff", border: "1px solid #E5E7EB",
              borderRadius: 10, padding: "7px 14px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}>
              <Search size={14} color="#9CA3AF" />
              <input
                placeholder="Tìm kiếm bài tập..."
                style={{ border: "none", outline: "none", fontSize: 13, color: "#374151", background: "transparent", width: 160 }}
              />
            </div>
            <button style={{
              width: 36, height: 36, borderRadius: 10, border: "1px solid #E5E7EB",
              background: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", position: "relative",
            }}>
              <Bell size={16} color="#6B7280" />
              <span style={{
                position: "absolute", top: 7, right: 7,
                width: 7, height: 7, borderRadius: "50%",
                background: "#EF4444", border: "1.5px solid #fff",
              }} />
            </button>
          </div>
        </div>

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
              {t.label}
              {t.badge && (
                <span style={{
                  fontSize: 11, fontWeight: 700, background: "#EF4444",
                  color: "#fff", borderRadius: 999, padding: "1px 6px",
                }}>{t.badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* Assignment table */}
        <div style={{
          background: "#fff", borderRadius: 16,
          border: "1px solid #F1F5F9",
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          overflow: "hidden", marginBottom: 28,
        }}>
          {/* Column headers */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "110px 1fr 140px 110px 130px",
            padding: "12px 24px",
            background: "#FAFAFA",
            borderBottom: "1px solid #F3F4F6",
          }}>
            {["MÔN HỌC", "TIÊU ĐỀ BÀI TẬP", "HẠN CHÓT", "MỨC ĐỘ", "TRẠNG THÁI"].map(h => (
              <span key={h} style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.07em" }}>{h}</span>
            ))}
          </div>

          {/* Rows */}
          {assignments.map((a, i) => (
            <div
              key={a.id}
              style={{
                display: "grid",
                gridTemplateColumns: "110px 1fr 140px 110px 130px",
                padding: "18px 24px",
                alignItems: "center",
                borderBottom: i < assignments.length - 1 ? "1px solid #F9FAFB" : "none",
                transition: "background 0.15s",
                cursor: "pointer",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#FAFAFA")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <SubjectTag subject={a.subject} color={a.subjectColor} bg={a.subjectBg} />

              <div style={{ paddingRight: 16 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#111827", margin: 0 }}>{a.title}</p>
                {a.desc && <p style={{ fontSize: 12, color: "#9CA3AF", margin: "3px 0 0" }}>{a.desc}</p>}
              </div>

              <div>
                <p style={{ fontSize: 13, fontWeight: a.isOverdue ? 600 : 400, color: a.isOverdue ? "#EF4444" : "#374151", margin: 0 }}>
                  {a.deadline}
                </p>
                {a.deadlineNote && (
                  <p style={{ fontSize: 10, fontWeight: 700, color: "#EF4444", margin: "2px 0 0", letterSpacing: "0.05em" }}>
                    {a.deadlineNote}
                  </p>
                )}
              </div>

              <span style={{ fontSize: 13, color: "#6B7280" }}>{a.level}</span>

              <StatusBadge type={a.status} />
            </div>
          ))}
        </div>

        {/* Grade results */}
        <div style={{ marginBottom: 8 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: "0 0 16px" }}>Kết quả chấm bài gần đây</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {gradeResults.map(r => (
              <div key={r.id} style={{
                background: "#fff", borderRadius: 16,
                border: "1px solid #F1F5F9",
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                padding: "18px 20px",
                transition: "box-shadow 0.2s",
              }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)")}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)")}
              >
                {/* Card header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: 0 }}>{r.title}</p>
                    <p style={{ fontSize: 12, color: "#9CA3AF", margin: "3px 0 0" }}>Hoàn thành: {r.completed}</p>
                  </div>
                  <span style={{
                    fontSize: 14, fontWeight: 800,
                    background: "#EFF6FF", color: "#2563EB",
                    padding: "4px 12px", borderRadius: 999,
                  }}>{r.score}</span>
                </div>

                {/* AI feedback */}
                <div style={{
                  background: "#F8FAFF", border: "1px solid #DBEAFE",
                  borderRadius: 10, padding: "10px 12px", marginTop: 14, marginBottom: 14,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                    <Sparkles size={12} color="#3B82F6" />
                    <span style={{ fontSize: 11, fontWeight: 800, color: "#3B82F6", letterSpacing: "0.05em" }}>PHẢN HỒI AI</span>
                  </div>
                  <p style={{ fontSize: 12, color: "#6B7280", margin: 0, lineHeight: 1.6 }}>{r.feedback}</p>
                </div>

                {/* Link */}
                <button style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 13, fontWeight: 600, color: "#3B82F6",
                  display: "flex", alignItems: "center", gap: 4, padding: 0,
                }}>
                  Xem chi tiết kết quả <ChevronRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}