"use client";

import { LIKERT_SCALE } from "@/lib/questions";
import { cn } from "@/lib/utils";

interface LikertScaleProps {
  questionId: number;
  value: number | null;
  onChange: (value: number) => void;
}

export function LikertScale({ questionId, value, onChange }: LikertScaleProps) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {LIKERT_SCALE.map((option) => {
        const isSelected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200 text-center",
              isSelected
                ? "bg-[#7C3AED] border-[#7C3AED] text-white shadow-lg shadow-purple-900/40"
                : "bg-[#221540] border-purple-500/10 text-[#9CA3AF] hover:border-purple-500/40 hover:bg-purple-500/10 hover:text-[#E9D5FF]"
            )}
          >
            <span className={cn(
              "text-lg font-bold font-mono",
              isSelected ? "text-white" : "text-purple-400"
            )}>
              {option.value}
            </span>
            <span className="text-xs leading-tight">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
