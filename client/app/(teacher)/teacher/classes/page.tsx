'use client';

import { useState } from "react";
import ClassCard from "./ClassCard";
import AddClassCard from "./AddClassCard";

const classes = [
  {
    id: 1,
    name: "Lớp 12A1",
    code: "MATH12A1",
    subject: "TOÁN HỌC",
    students: 42,
    completion: 88,
    gradient: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
    iconColor: "rgba(255,255,255,0.25)",
    icon: "∑",
    iconFont: "2rem",
  },
  {
    id: 2,
    name: "Lớp 11B2",
    code: "ENG11B2",
    subject: "TIẾNG ANH",
    students: 38,
    completion: 72,
    gradient: "linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)",
    iconColor: "rgba(255,255,255,0.25)",
    icon: "🌐",
    iconFont: "2rem",
    iconIsEmoji: true,
  },
  {
    id: 3,
    name: "Lớp 10C5",
    code: "PHYS10C5",
    subject: "VẬT LÝ",
    students: 45,
    completion: 64,
    gradient: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
    iconColor: "rgba(255,255,255,0.25)",
    icon: "⚗",
    iconFont: "2rem",
    iconIsEmoji: true,
  },
];

function ClassesPage() {
  const [tab, setTab] = useState("active");

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "system-ui, -apple-system, sans-serif", padding: "32px 28px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111827", marginBottom: 4 }}>Quản lý Lớp học</h1>
            <p style={{ fontSize: 13, color: "#9CA3AF" }}>Theo dõi và quản lý hoạt động giảng dạy các lớp học của bạn.</p>
          </div>

          {/* Tab toggle */}
          <div style={{
            display: "flex",
            background: "#fff",
            border: "1px solid #E5E7EB",
            borderRadius: 10,
            padding: 3,
            gap: 2,
          }}>
            {[["active", "Đang hoạt động"], ["ended", "Đã kết thúc"]].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                style={{
                  padding: "7px 16px",
                  borderRadius: 8,
                  border: "none",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  background: tab === key ? "#111827" : "transparent",
                  color: tab === key ? "#fff" : "#6B7280",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",
          gap: 20,
        }}>
          {tab === "active" ? (
            <>
              {classes.map(cls => <ClassCard key={cls.id} cls={cls} />)}
              <AddClassCard />
            </>
          ) : (
            <div style={{
              gridColumn: "1 / -1",
              textAlign: "center",
              padding: "60px 0",
              color: "#9CA3AF",
              fontSize: 14,
            }}>
              Không có lớp học nào đã kết thúc.
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default ClassesPage