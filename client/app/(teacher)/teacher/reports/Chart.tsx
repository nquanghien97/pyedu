"use client";

import {
  ResponsiveContainer,
  BarChart as RBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  Pie,
  PieChart,
} from "recharts";

export function BarChart() {
  const data = [
    { label: "10A", value: 72 },
    { label: "10B", value: 58 },
    { label: "11A", value: 78 },
    { label: "11C", value: 82 },
    { label: "12A", value: 68 },
  ];

  return (
    <ResponsiveContainer width="100%" height={180}>
      <RBarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />

        <XAxis
          dataKey="label"
          tick={{ fontSize: 12, fill: "#9CA3AF" }}
          axisLine={false}
          tickLine={false}
        />

        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 12, fill: "#9CA3AF" }}
          axisLine={false}
          tickLine={false}
        />

        <Tooltip />

        <Bar
          dataKey="value"
          fill="#3B82F6"
          radius={[6, 6, 0, 0]}
          animationDuration={1200}
        />
      </RBarChart>
    </ResponsiveContainer>
  );
}

export function LineChart() {
  const data = [
    { day: "T2", value: 55 },
    { day: "T3", value: 62 },
    { day: "T4", value: 75 },
    { day: "T5", value: 58 },
    { day: "T6", value: 82 },
    { day: "T7", value: 90 },
    { day: "CN", value: 72 },
  ];

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />

        <XAxis
          dataKey="day"
          tick={{ fontSize: 11, fill: "#9CA3AF" }}
          axisLine={false}
          tickLine={false}
        />

        <YAxis
          domain={[40, 100]}
          tick={{ fontSize: 11, fill: "#9CA3AF" }}
          axisLine={false}
          tickLine={false}
        />

        <Tooltip />

        <Area
          type="monotone"
          dataKey="value"
          stroke="#3B82F6"
          strokeWidth={2.5}
          fill="url(#lineGrad)"
          dot={{ r: 4, fill: "#3B82F6" }}
          activeDot={{ r: 6 }}
          animationDuration={1500}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function DonutChart() {
  const data = [
    { name: "Giỏi", value: 75, fill: "#3B82F6", count: "117 HS" },
    { name: "Khá", value: 20, fill: "#F59E0B", count: "31 HS" },
    { name: "TB", value: 5, fill: "#D1D5DB", count: "8 HS" },
  ];

  return (
    <ResponsiveContainer width={180} height={180}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          innerRadius={55}
          outerRadius={75}
          paddingAngle={2}
          animationDuration={1200}
        />
        <Tooltip />
      </PieChart>s
    </ResponsiveContainer>
  );
}