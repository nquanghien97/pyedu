interface StatCardProps {
  icon: React.ComponentType<{ size?: number, color?: string }>; // the SVG/component you render
  iconBg: string;
  iconColor: string;
  value: string;
  label: string;
  badge: string;
  badgeUp: boolean;
}

export default function StatCard({ icon: Icon, iconBg, iconColor, label, value, badge, badgeUp }: StatCardProps) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", padding: "22px 24px", flex: 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={20} color={iconColor} />
        </div>
        <span style={{
          fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 999,
          background: badgeUp ? "#F0FDF4" : "#FEF2F2",
          color: badgeUp ? "#16A34A" : "#DC2626",
        }}>{badge}</span>
      </div>
      <p style={{ fontSize: 12, color: "#9CA3AF", margin: "0 0 6px" }}>{label}</p>
      <p style={{ fontSize: 28, fontWeight: 800, color: "#111827", margin: 0 }}>{value}</p>
    </div>
  );
}
