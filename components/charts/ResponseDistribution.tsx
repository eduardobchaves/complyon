"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { LIKERT_SCALE } from "@/lib/questions";

interface ResponseDistributionProps {
  answers: number[];
  questionText?: string;
}

export function ResponseDistribution({ answers, questionText }: ResponseDistributionProps) {
  const data = LIKERT_SCALE.map((option) => ({
    label: option.label.split(" ").slice(0, 2).join(" "),
    fullLabel: option.label,
    count: answers.filter((a) => a === option.value).length,
    value: option.value,
  }));

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { fullLabel: string; count: number } }> }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-[#1e2438] border border-green-600/20 rounded-lg px-3 py-2 shadow-xl">
          <p className="text-xs text-[#9CA3AF] mb-0.5">{d.fullLabel}</p>
          <p className="text-sm font-bold text-green-300">{d.count} respostas</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      {questionText && (
        <p className="text-xs text-[#9CA3AF] mb-3 line-clamp-2">{questionText}</p>
      )}
      <ResponsiveContainer width="100%" height={150}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -30, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,58,237,0.1)" />
          <XAxis
            dataKey="label"
            tick={{ fill: "#6B7280", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            angle={-30}
            textAnchor="end"
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: "#6B7280", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(124,58,237,0.05)" }} />
          <Bar dataKey="count" fill="#16a34a" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
