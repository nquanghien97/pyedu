import React from "react";
import { TrendingUp, TrendingDown, Plus } from "lucide-react";
import { P } from "@/components/ui/typography";

interface StatCardProps {
  icon: React.ComponentType<{ size?: number }>; // the SVG/component you render
  iconBg?: string;
  label: string;
  value: string | number;
  badge?: React.ReactNode;
  badgeType?: "up" | "down" | "new";
}

const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  iconBg = "bg-gray-100",
  label,
  value,
  badge,
  badgeType,
}) => {
  const isUp = badgeType === "up";
  const isNew = badgeType === "new";
  const isDown = badgeType === "down";

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon size={18} />
        </div>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 ${isUp
              ? "bg-green-50 text-green-600"
              : isDown
                ? "bg-red-50 text-red-500"
                : "bg-blue-50 text-blue-500"
            }`}
        >
          {isUp && <TrendingUp size={11} />}
          {isDown && <TrendingDown size={11} />}
          {isNew && <Plus size={11} />}
          {badge}
        </span>
      </div>
      <div>
        <P className="text-xs text-gray-400 mb-1">{label}</P>
        <P className="text-2xl font-bold text-gray-800">{value}</P>
      </div>
    </div>
  );
};

export default StatCard;