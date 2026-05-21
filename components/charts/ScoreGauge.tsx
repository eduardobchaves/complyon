"use client";

import { getScoreColor, getRiskLabelFromScore } from "@/lib/scoring";

interface ScoreGaugeProps {
  score: number;
  size?: number;
  showLabel?: boolean;
}

export function ScoreGauge({ score, size = 120, showLabel = true }: ScoreGaugeProps) {
  const color = getScoreColor(score);
  const label = getRiskLabelFromScore(score);
  const pct = (score / 10) * 100;
  const r = 45;
  const circumference = 2 * Math.PI * r;
  const dashArray = `${(pct / 100) * circumference} ${circumference}`;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 100 100">
          <circle
            cx="50" cy="50" r={r}
            fill="none"
            stroke="#252d45"
            strokeWidth="8"
          />
          <circle
            cx="50" cy="50" r={r}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={dashArray}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold font-mono" style={{ color }}>
            {score.toFixed(1)}
          </span>
          <span className="text-xs text-[#9CA3AF]">/10</span>
        </div>
      </div>
      {showLabel && (
        <span className="text-sm font-medium" style={{ color }}>
          {label}
        </span>
      )}
    </div>
  );
}
