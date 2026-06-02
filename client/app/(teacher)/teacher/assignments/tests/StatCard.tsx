import { P } from "@/components/ui/typography";
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
    <div className="bg-white rounded-4xl border border-gray-200 shadow-sm p-5 flex-1">
      <div className="flx justify-between items-start mb-4">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: iconBg }}
        >
          <Icon size={20} color={iconColor} />
        </div>
        <span
          className={`text-xs font-bol px-1 py-2 rounded-full ${badgeUp ? "bg-[#F0FDF4] text-[#16A34A]" : "bg-[#FEF2F2] text-[#DC2626]"}`}
        >
          {badge}
        </span>
      </div>
      <P className="text-xs text-[#9CA3AF]">{label}</P>
      <P className="text-2xl font-bold text-[#111827]">{value}</P>
    </div>
  );
}
