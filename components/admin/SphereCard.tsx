"use client";

import { getRiskLabelFromScore, getScoreColor, getBgColorClass } from "@/lib/scoring";
import { cn } from "@/lib/utils";
import { SPHERES } from "@/lib/questions";

interface SphereCardProps {
  sphereId: string;
  score: number;
  riskLevel: "LOW" | "MODERATE" | "HIGH";
  onClick?: () => void;
}

export function SphereCard({ sphereId, score, riskLevel, onClick }: SphereCardProps) {
  const sphere = SPHERES.find((s) => s.id === sphereId);
  const color = getScoreColor(score);
  const label = getRiskLabelFromScore(score);
  const pct = Math.round((score / 10) * 100);

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-[#1e2438] border border-green-600/10 rounded-xl p-5 hover:border-green-600/30 transition-all duration-200",
        onClick && "cursor-pointer hover:bg-[#252d45]"
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{sphere?.icon}</span>
          <div>
            <h3 className="text-sm font-semibold text-[#dcfce7] font-[var(--font-sora)]">
              {sphere?.name || sphereId}
            </h3>
            <p className="text-xs text-[#9CA3AF] mt-0.5">{sphere?.description}</p>
          </div>
        </div>
      </div>

      {/* Gauge */}
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
            <circle
              cx="18" cy="18" r="15.9"
              fill="none"
              stroke="#252d45"
              strokeWidth="3"
            />
            <circle
              cx="18" cy="18" r="15.9"
              fill="none"
              stroke={color}
              strokeWidth="3"
              strokeDasharray={`${pct} ${100 - pct}`}
              strokeLinecap="round"
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center rotate-0">
            <span className="text-sm font-bold" style={{ color }}>
              {score.toFixed(1)}
            </span>
          </div>
        </div>

        <div className="flex-1">
          <div
            className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
              getBgColorClass(score)
            )}
            style={{ color }}
          >
            {label}
          </div>

          {/* Bar */}
          <div className="mt-2 h-1.5 bg-[#252d45] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, backgroundColor: color }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
