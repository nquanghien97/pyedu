import { AlertTriangle, Info, Star, TrendingDown, TrendingUp } from "lucide-react";

export function AlertCard({ type, title, tag, tagColor, desc } : { type: "warning" | "success" | "info", title: string, tag: string, tagColor: "red" | "green" | "blue", desc: string }) {
  const styles = {
    warning: { bg: "#FFFBEB", border: "#FDE68A", icon: <AlertTriangle size={18} color="#F59E0B" />, iconBg: "#FEF3C7" },
    success: { bg: "#F0FDF4", border: "#BBF7D0", icon: <Star size={18} color="#22C55E" />, iconBg: "#DCFCE7" },
    info:    { bg: "#EFF6FF", border: "#BFDBFE", icon: <Info size={18} color="#3B82F6" />, iconBg: "#DBEAFE" },
  };
  const s = styles[type];
  const tagStyles = {
    red:   { bg: "#FEF2F2", color: "#DC2626" },
    green: { bg: "#F0FDF4", color: "#16A34A" },
    blue:  { bg: "#EFF6FF", color: "#2563EB" },
  };
  const ts = tagStyles[tagColor];

  return (
    <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 12, padding: "14px 16px", display: "flex", gap: 12, alignItems: "flex-start" }}>
      <div style={{ width: 34, height: 34, borderRadius: 10, background: s.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
        {s.icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", margin: 0 }}>{title}</p>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", padding: "2px 8px", borderRadius: 999, background: ts.bg, color: ts.color, whiteSpace: "nowrap", marginLeft: 8 }}>{tag}</span>
        </div>
        <p style={{ fontSize: 12, color: "#6B7280", margin: 0, lineHeight: 1.5 }}>{desc}</p>
      </div>
    </div>
  );
}

// ── Stat Card ────────────────────────────────────────────────────
export function StatCard({ label, value, delta, up } : { label: string, value: string, delta: string, up: boolean }) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", padding: "20px 22px", flex: 1 }}>
      <p style={{ fontSize: 12, color: "#9CA3AF", margin: "0 0 8px" }}>{label}</p>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontSize: 26, fontWeight: 800, color: "#111827" }}>{value}</span>
        <span style={{ fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 3, color: up ? "#16A34A" : "#DC2626" }}>
          {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {delta}
        </span>
      </div>
    </div>
  );
}