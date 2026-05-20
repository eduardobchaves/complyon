"use client";

import { cn } from "@/lib/utils";

interface QuestionCardProps {
  number: number;
  text: string;
  children: React.ReactNode;
  className?: string;
}

export function QuestionCard({ number, text, children, className }: QuestionCardProps) {
  return (
    <div className={cn("bg-[#1A1030] border border-purple-500/10 rounded-xl p-6", className)}>
      <div className="flex items-start gap-4 mb-6">
        <div className="w-8 h-8 rounded-lg bg-[#7C3AED]/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-purple-300">{number}</span>
        </div>
        <p className="text-base text-[#E9D5FF] leading-relaxed">{text}</p>
      </div>
      {children}
    </div>
  );
}
