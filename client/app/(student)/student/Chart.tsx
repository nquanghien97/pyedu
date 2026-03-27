import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";

const weeklyData = [
  { label: "Thứ 2", value: 60 },
  { label: "Thứ 3", value: 80 },
  { label: "Thứ 4", value: 45 },
  { label: "Thứ 5", value: 90 },
  { label: "Thứ 6", value: 30 },
  { label: "Thứ 7", value: 55 },
  { label: "CN", value: 20 },
];
const TODAY_INDEX = 3;

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: "#1E40AF", borderRadius: 8, padding: "6px 12px" }}>
        <p style={{ color: "#fff", fontSize: 12, fontWeight: 700, margin: 0 }}>{label}</p>
        <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 11, margin: "2px 0 0" }}>{payload[0].value}% mục tiêu</p>
      </div>
    );
  }
  return null;
};

export function WeeklyChart() {
  return (
    <ResponsiveContainer width="100%" height={170}>
      <BarChart data={weeklyData} barSize={28} margin={{ top: 8, right: 8, left: -28, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: "#D1D5DB" }}
          axisLine={false} tickLine={false}
        />
        <YAxis tick={{ fontSize: 10, fill: "#D1D5DB" }} axisLine={false} tickLine={false} domain={[0, 100]} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(59,130,246,0.05)", radius: 8 }} />
        <Bar dataKey="value" radius={[6, 6, 6, 6]}>
          {weeklyData.map((_, i) => (
            <Cell key={i} fill={i === TODAY_INDEX ? "#3B82F6" : "#BFDBFE"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}