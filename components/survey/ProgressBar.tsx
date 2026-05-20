"use client";

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
}

export function ProgressBar({ current, total, label }: ProgressBarProps) {
  const pct = Math.round((current / total) * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-[#9CA3AF]">{label || `Questão ${current} de ${total}`}</span>
        <span className="text-purple-400 font-medium">{pct}%</span>
      </div>
      <div className="h-2 bg-[#221540] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
