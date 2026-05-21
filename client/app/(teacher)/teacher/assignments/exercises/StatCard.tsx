import { P } from "@/components/ui/typography";
interface StatCardProps {
  icon: React.ComponentType<{ size?: number, color?: string }>; // the SVG/component you render
  iconBg: string;
  iconColor: string;
  value: string;
  label: string;
}

export default function StatCard({ icon: Icon, iconBg, iconColor, value, label }: StatCardProps) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 16,
      border: "1px solid #F1F5F9",
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      padding: "20px 24px",
      display: "flex",
      alignItems: "center",
      gap: 16,
      flex: 1,
    }}>
      <div style={{ width: 48, height: 48, borderRadius: 14, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={22} color={iconColor} />
      </div>
      <div>
        <P style={{ fontSize: 26, fontWeight: 800, color: "#111827", margin: 0, lineHeight: 1.1 }}>{value}</P>
        <P style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", margin: 0, letterSpacing: "0.06em", marginTop: 2 }}>{label}</P>
      </div>
    </div>
  );
}