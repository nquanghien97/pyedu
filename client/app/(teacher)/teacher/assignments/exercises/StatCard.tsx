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
      <div className="w-12 h-12 rounded-xl bg-blue-200 flex justify-center items-center">
        <Icon size={22} color={iconColor} />
      </div>
      <div>
        <P className="text-2xl font-bold">{value}</P>
        <P className="text-xs font-bold text-gray-500 mt-1">{label}</P>
      </div>
    </div>
  );
}