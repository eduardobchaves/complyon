"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface TrendLineChartProps {
  data: Array<{
    date: string;
    score: number;
    label?: string;
  }>;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1A1030] border border-purple-500/20 rounded-lg px-4 py-3 shadow-xl">
        <p className="text-xs text-[#9CA3AF] mb-1">{label}</p>
        <p className="text-lg font-bold text-purple-300">{payload[0].value.toFixed(1)}</p>
      </div>
    );
  }
  return null;
};

export function TrendLineChart({ data }: TrendLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,58,237,0.1)" />
        <XAxis
          dataKey="label"
          tick={{ fill: "#6B7280", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 10]}
          tick={{ fill: "#6B7280", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="score"
          stroke="url(#lineGradient)"
          strokeWidth={2.5}
          dot={{ fill: "#7C3AED", strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, fill: "#A78BFA" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
