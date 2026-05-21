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
                ? "bg-[#16a34a] border-[#16a34a] text-white shadow-lg shadow-green-900/40"
                : "bg-[#252d45] border-green-600/10 text-[#9CA3AF] hover:border-green-600/40 hover:bg-green-600/10 hover:text-[#dcfce7]"
            )}
          >
            <span className={cn(
              "text-lg font-bold font-mono",
              isSelected ? "text-white" : "text-green-400"
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
