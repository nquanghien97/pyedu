import { CheckSquare, MoreHorizontal, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { P } from "@/components/ui/typography";

interface ClassProps {
  cls: {
    name: string;
    code: string;
    subject: string;
    gradient: string;
    students: number;
    completion: number;
  }
}

function SubjectIcon({ cls } : ClassProps) {
  if (cls.subject === "TOÁN HỌC") {
    return (
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
        <text x="26" y="40" textAnchor="middle" fontSize="38" fontWeight="bold" fill="rgba(255,255,255,0.3)" fontFamily="serif">∑</text>
      </svg>
    );
  }
  if (cls.subject === "TIẾNG ANH") {
    return (
      <svg width="52" height="52" viewBox="0 0 52 52" fill="rgba(255,255,255,0.3)" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
        <circle cx="26" cy="26" r="20" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5"/>
        <ellipse cx="26" cy="26" rx="9" ry="20" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
        <line x1="6" y1="26" x2="46" y2="26" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
        <line x1="8" y1="16" x2="44" y2="16" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
        <line x1="8" y1="36" x2="44" y2="36" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
      </svg>
    );
  }
  // Vật lý - flask
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 8 L20 26 L10 42 L42 42 L32 26 L32 8 Z" fill="rgba(255,255,255,0.15)" />
      <line x1="17" y1="8" x2="35" y2="8"/>
      <circle cx="18" cy="35" r="2" fill="rgba(255,255,255,0.4)" stroke="none"/>
      <circle cx="28" cy="38" r="1.5" fill="rgba(255,255,255,0.4)" stroke="none"/>
      <circle cx="34" cy="33" r="1" fill="rgba(255,255,255,0.4)" stroke="none"/>
    </svg>
  );
}

export default function ClassCard({ cls } : ClassProps) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 18,
      border: "1px solid #F1F5F9",
      boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Banner */}
      <div style={{
        background: cls.gradient,
        height: 130,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}>
        <span style={{
          position: "absolute",
          top: 12,
          right: 12,
          background: "rgba(255,255,255,0.25)",
          color: "#fff",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.08em",
          padding: "3px 10px",
          borderRadius: 20,
        }}>
          {cls.subject}
        </span>
        <SubjectIcon cls={cls} />
      </div>

      {/* Body */}
      <div style={{ padding: "16px 18px 18px" }}>
        {/* Title row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <span style={{ fontWeight: 700, fontSize: 16, color: "#111827" }}>{cls.name}</span>
          <Button style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", padding: 2 }}>
            <MoreHorizontal size={18} />
          </Button>
        </div>
        <P style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 14 }}>Mã lớp: {cls.code}</P>

        {/* Stats */}
        <div style={{ display: "flex", gap: 20, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Users size={16} color="#3B82F6" />
            <div>
              <P style={{ fontSize: 11, color: "#9CA3AF", lineHeight: 1.2 }}>Sĩ số</P>
              <P style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{cls.students} Học sinh</P>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <CheckSquare size={16} color="#22C55E" />
            <div>
              <P style={{ fontSize: 11, color: "#9CA3AF", lineHeight: 1.2 }}>Hoàn thành</P>
              <P style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{cls.completion}%</P>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: "#6B7280" }}>Tiến độ bài tập</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#3B82F6" }}>{cls.completion}%</span>
          </div>
          <div style={{ height: 6, background: "#EFF6FF", borderRadius: 99, overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${cls.completion}%`,
              background: "linear-gradient(90deg, #3B82F6, #60A5FA)",
              borderRadius: 99,
              transition: "width 0.6s ease",
            }} />
          </div>
        </div>

        {/* Link */}
        <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: 14, textAlign: "right" }}>
          <Button style={{
            background: "none", border: "none", cursor: "pointer",
            color: "#3B82F6", fontSize: 13, fontWeight: 600,
          }}>
            Chi tiết lớp học
          </Button>
        </div>
      </div>
    </div>
  );
}
