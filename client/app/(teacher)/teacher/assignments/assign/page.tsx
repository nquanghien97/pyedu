'use client';

import { useState } from "react";
import {
  BookOpen, Calendar, Clock, CheckCircle2, Plus, History,
  ChevronDown, TrendingUp, Eye, Pencil, RotateCcw
} from "lucide-react";

type Tab = "new" | "schedule" | "history";
type AssignMode = "manual" | "auto";

interface Assignment {
  id: number;
  name: string;
  questions: number;
  duration: number;
  icon: string;
}

interface ScheduleItem {
  date: string;
  isToday: boolean;
  title: string;
  class: string;
  time: string;
}

interface HistoryItem {
  id: number;
  name: string;
  class: string;
  dateAssigned: string;
  completion: number;
}

const libraryAssignments: Assignment[] = [
  { id: 1, name: "Ôn tập Đạo hàm ...", questions: 20, duration: 45, icon: "📋" },
  { id: 2, name: "Lượng giác nâng cao", questions: 15, duration: 60, icon: "Σ" },
];

const scheduleItems: ScheduleItem[] = [
  { date: "Ngày mai, 14 Th10", isToday: true, title: "Giải tích cơ bản", class: "Lớp 12A1", time: "08:00 AM" },
  { date: "Thứ 2, 16 Th10", isToday: false, title: "Đề thi thử học kì 1", class: "Toán khối 10", time: "07:30 AM" },
  { date: "Thứ 3, 17 Th10", isToday: false, title: "Luyện tập số phức", class: "Lớp 12A2", time: "14:00 PM" },
];

const historyItems: HistoryItem[] = [
  { id: 1, name: "Đạo hàm và ứng dụng (Phần 1)", class: "Lớp 12A1", dateAssigned: "10 Th10", completion: 88 },
  { id: 2, name: "Chuyển động thẳng biến đổi đều", class: "Lớp 11B2", dateAssigned: "08 Th10", completion: 72 },
  { id: 3, name: "Phản ứng Oxi hóa – Khử", class: "Lớp 10C5", dateAssigned: "05 Th10", completion: 64 },
];

export default function AssignPage() {
  const [activeTab, setActiveTab] = useState<Tab>("new");
  const [selectedClass, setSelectedClass] = useState("Lớp 10A1 - Toán học");
  const [selectedAssignment, setSelectedAssignment] = useState<number>(1);
  const [assignMode, setAssignMode] = useState<AssignMode>("manual");

  const tabs = [
    { key: "new" as Tab, label: "Giao bài mới" },
    { key: "schedule" as Tab, label: "Lịch giao bài" },
    { key: "history" as Tab, label: "Lịch sử giao bài" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif", padding: "28px 28px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827", margin: 0 }}>Quản lý Giao bài tập</h1>
          <p style={{ fontSize: 13, color: "#9CA3AF", marginTop: 5, marginBottom: 0 }}>
            Lên kế hoạch và theo dõi tiến độ bài tập về nhà của học sinh.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #E5E7EB", marginBottom: 24 }}>
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                padding: "10px 20px", fontSize: 14, fontWeight: activeTab === t.key ? 600 : 400,
                color: activeTab === t.key ? "#3B82F6" : "#6B7280",
                borderBottom: activeTab === t.key ? "2px solid #3B82F6" : "2px solid transparent",
                marginBottom: -1, transition: "all 0.15s",
              }}
            >{t.label}</button>
          ))}
        </div>

        {/* Content */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>

          {/* LEFT COLUMN */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Form card */}
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", padding: "22px 24px" }}>
              {/* Title */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 22 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <BookOpen size={15} color="#3B82F6" />
                </div>
                <span style={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>Thông tin giao bài mới</span>
              </div>

              {/* Row 1: Class + Deadline */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Chọn lớp học</label>
                  <div style={{ position: "relative" }}>
                    <select
                      value={selectedClass}
                      onChange={e => setSelectedClass(e.target.value)}
                      style={{
                        width: "100%", padding: "9px 36px 9px 12px",
                        border: "1.5px solid #E5E7EB", borderRadius: 9,
                        fontSize: 13, color: "#374151", background: "#fff",
                        appearance: "none", cursor: "pointer", outline: "none",
                      }}
                    >
                      <option>Lớp 10A1 - Toán học</option>
                      <option>Lớp 11B2 - Vật lý</option>
                      <option>Lớp 12A1 - Toán học</option>
                    </select>
                    <ChevronDown size={14} color="#9CA3AF" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Thời hạn nộp bài</label>
                  <input
                    type="datetime-local"
                    style={{
                      width: "100%", padding: "9px 12px",
                      border: "1.5px solid #E5E7EB", borderRadius: 9,
                      fontSize: 13, color: "#374151", background: "#fff",
                      outline: "none", boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              {/* Assignment library */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 10 }}>Chọn bài tập từ thư viện</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {libraryAssignments.map(a => (
                    <div
                      key={a.id}
                      onClick={() => setSelectedAssignment(a.id)}
                      style={{
                        border: selectedAssignment === a.id ? "2px solid #3B82F6" : "1.5px solid #E5E7EB",
                        borderRadius: 12, padding: "12px 14px",
                        cursor: "pointer", display: "flex", alignItems: "center", gap: 12,
                        background: selectedAssignment === a.id ? "#EFF6FF" : "#fff",
                        position: "relative", transition: "all 0.15s",
                      }}
                    >
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: selectedAssignment === a.id ? "#3B82F6" : "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: selectedAssignment === a.id ? "#fff" : "#6B7280", flexShrink: 0 }}>
                        {a.icon}
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", margin: 0 }}>{a.name}</p>
                        <p style={{ fontSize: 11, color: "#9CA3AF", margin: "2px 0 0" }}>{a.questions} câu hỏi • {a.duration} phút</p>
                      </div>
                      {selectedAssignment === a.id && (
                        <div style={{ position: "absolute", top: 8, right: 8, width: 18, height: 18, borderRadius: "50%", background: "#3B82F6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <CheckCircle2 size={12} color="#fff" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <button style={{ background: "none", border: "none", cursor: "pointer", color: "#3B82F6", fontSize: 13, fontWeight: 500, marginTop: 10, padding: 0, display: "flex", alignItems: "center", gap: 5 }}>
                  <Plus size={14} /> Thêm bài tập khác từ thư viện
                </button>
              </div>

              {/* Mode */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 10 }}>Hình thức giao bài</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {([
                    { key: "manual" as AssignMode, title: "Giao thủ công", desc: "Giao ngay lập tức cho các lớp đã chọn" },
                    { key: "auto" as AssignMode, title: "Giao tự động hàng ngày", desc: "Hệ thống tự động giao bài theo lịch cố định" },
                  ]).map(m => (
                    <div
                      key={m.key}
                      onClick={() => setAssignMode(m.key)}
                      style={{
                        border: assignMode === m.key ? "2px solid #3B82F6" : "1.5px solid #E5E7EB",
                        borderRadius: 12, padding: "12px 14px",
                        cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 10,
                        background: assignMode === m.key ? "#EFF6FF" : "#fff",
                        transition: "all 0.15s",
                      }}
                    >
                      <div style={{
                        width: 16, height: 16, borderRadius: "50%", flexShrink: 0, marginTop: 2,
                        border: assignMode === m.key ? "5px solid #3B82F6" : "2px solid #D1D5DB",
                        background: "#fff", transition: "all 0.15s",
                      }} />
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", margin: 0 }}>{m.title}</p>
                        <p style={{ fontSize: 11, color: "#9CA3AF", margin: "3px 0 0", lineHeight: 1.4 }}>{m.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 12 }}>
                <button style={{
                  flex: 1, padding: "12px", borderRadius: 12, border: "none",
                  background: "linear-gradient(135deg, #3B82F6, #2563EB)",
                  color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(59,130,246,0.35)", transition: "opacity 0.2s",
                }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "0.9")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                >
                  Hoàn tất giao bài
                </button>
                <button style={{
                  padding: "12px 24px", borderRadius: 12,
                  border: "1.5px solid #E5E7EB", background: "#fff",
                  color: "#374151", fontSize: 14, fontWeight: 600, cursor: "pointer",
                  transition: "all 0.15s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#3B82F6"; e.currentTarget.style.color = "#3B82F6"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.color = "#374151"; }}
                >
                  Lưu nháp
                </button>
              </div>
            </div>

            {/* History table */}
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", overflow: "hidden" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 22px", borderBottom: "1px solid #F3F4F6" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <History size={15} color="#6B7280" />
                  <span style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>Lịch sử bài đã giao gần đây</span>
                </div>
                <button style={{ background: "none", border: "none", fontSize: 13, color: "#3B82F6", fontWeight: 500, cursor: "pointer" }}>Xem tất cả</button>
              </div>
              <div style={{ padding: "0 22px" }}>
                {/* Head */}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 0.8fr", padding: "10px 0", borderBottom: "1px solid #F3F4F6" }}>
                  {["TÊN BÀI TẬP", "LỚP", "NGÀY GIAO", "HOÀN THÀNH", "HÀNH ĐỘNG"].map(h => (
                    <span key={h} style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.06em" }}>{h}</span>
                  ))}
                </div>
                {historyItems.map((item, i) => (
                  <div key={item.id}
                    style={{
                      display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 0.8fr",
                      padding: "14px 0", alignItems: "center",
                      borderBottom: i < historyItems.length - 1 ? "1px solid #F9FAFB" : "none",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#FAFAFA")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{item.name}</span>
                    <span style={{ fontSize: 13, color: "#6B7280" }}>{item.class}</span>
                    <span style={{ fontSize: 13, color: "#6B7280" }}>{item.dateAssigned}</span>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <div style={{ flex: 1, height: 5, background: "#EFF6FF", borderRadius: 999, maxWidth: 70 }}>
                          <div style={{ height: 5, width: `${item.completion}%`, background: "#3B82F6", borderRadius: 999 }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#3B82F6" }}>{item.completion}%</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 5 }}>
                      {[Eye, Pencil, RotateCcw].map((Icon, j) => (
                        <button key={j} style={{ width: 28, height: 28, border: "1px solid #E5E7EB", borderRadius: 7, background: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                          onMouseEnter={e => { e.currentTarget.style.background = "#EFF6FF"; e.currentTarget.style.borderColor = "#3B82F6"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "#F8FAFC"; e.currentTarget.style.borderColor = "#E5E7EB"; }}
                        >
                          <Icon size={12} color="#6B7280" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Schedule card */}
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", padding: "20px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Calendar size={14} color="#3B82F6" />
                </div>
                <span style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>Lịch giao sắp tới</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {scheduleItems.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 14, paddingBottom: i < scheduleItems.length - 1 ? 18 : 0 }}>
                    {/* Timeline dot */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: item.isToday ? "#3B82F6" : "#D1D5DB", marginTop: 4, flexShrink: 0 }} />
                      {i < scheduleItems.length - 1 && (
                        <div style={{ width: 1.5, flex: 1, background: "#E5E7EB", marginTop: 4 }} />
                      )}
                    </div>
                    <div style={{ flex: 1, paddingBottom: i < scheduleItems.length - 1 ? 0 : 0 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: item.isToday ? "#3B82F6" : "#9CA3AF", margin: "0 0 6px", letterSpacing: "0.03em" }}>{item.date}</p>
                      <div style={{ background: "#F8FAFC", borderRadius: 10, padding: "10px 12px" }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", margin: "0 0 6px" }}>{item.title}</p>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 11, color: "#9CA3AF" }}>{item.class}</span>
                          <span style={{ fontSize: 11, color: "#6B7280", display: "flex", alignItems: "center", gap: 3 }}>
                            <Clock size={10} />{item.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button style={{
                width: "100%", marginTop: 16, padding: "10px",
                border: "1.5px solid #E5E7EB", borderRadius: 10,
                background: "#fff", color: "#374151",
                fontSize: 13, fontWeight: 600, cursor: "pointer",
                transition: "all 0.15s",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#3B82F6"; e.currentTarget.style.color = "#3B82F6"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.color = "#374151"; }}
              >
                Xem toàn bộ lịch
              </button>
            </div>

            {/* Stats card */}
            <div style={{
              background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
              borderRadius: 16, padding: "20px 22px",
              boxShadow: "0 4px 16px rgba(59,130,246,0.35)",
              position: "relative", overflow: "hidden",
            }}>
              {/* Decorative wave */}
              <svg style={{ position: "absolute", bottom: 0, right: 0, opacity: 0.15 }} width="140" height="80" viewBox="0 0 140 80">
                <path d="M0,40 C30,10 60,70 90,40 C120,10 130,60 140,40 L140,80 L0,80 Z" fill="#fff" />
              </svg>

              <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", color: "rgba(255,255,255,0.7)", margin: "0 0 6px" }}>THỐNG KÊ TUẦN NÀY</p>
              <p style={{ fontSize: 26, fontWeight: 800, color: "#fff", margin: "0 0 16px" }}>12 Bài tập đã giao</p>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.85)" }}>Hoàn thành trung bình</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>78%</span>
                </div>
                <div style={{ height: 6, background: "rgba(255,255,255,0.2)", borderRadius: 999 }}>
                  <div style={{ height: 6, width: "78%", background: "#fff", borderRadius: 999 }} />
                </div>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", margin: "10px 0 0", display: "flex", alignItems: "center", gap: 4 }}>
                  <TrendingUp size={11} /> * Tăng 12% so với tuần trước
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}