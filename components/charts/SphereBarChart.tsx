"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { getScoreColor } from "@/lib/scoring";
import { SPHERES } from "@/lib/questions";

interface SphereBarChartProps {
  data: Array<{
    sphereId: string;
    score: number;
  }>;
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number; payload: { name: string; score: number } }> }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    const color = getScoreColor(d.score);
    return (
      <div className="bg-[#1e2438] border border-green-600/20 rounded-lg px-4 py-3 shadow-xl">
        <p className="text-xs text-[#9CA3AF] mb-1">{d.name}</p>
        <p className="text-lg font-bold" style={{ color }}>
          {d.score.toFixed(1)}
        </p>
      </div>
    );
  }
  return null;
};

export function SphereBarChart({ data }: SphereBarChartProps) {
  const chartData = data.map((d) => {
    const sphere = SPHERES.find((s) => s.id === d.sphereId);
    return {
      name: sphere?.name || d.sphereId,
      shortName: (sphere?.name || d.sphereId).slice(0, 8),
      score: d.score,
      color: getScoreColor(d.score),
    };
  });

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 0, right: 20, left: 100, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,58,237,0.1)" horizontal={false} />
        <XAxis
          type="number"
          domain={[0, 10]}
          tickCount={6}
          tick={{ fill: "#6B7280", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fill: "#9CA3AF", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={100}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(124,58,237,0.05)" }} />
        <Bar dataKey="score" radius={[0, 6, 6, 0]} maxBarSize={20}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
