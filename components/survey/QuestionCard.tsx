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
    <div className={cn("bg-[#1e2438] border border-green-600/10 rounded-xl p-6", className)}>
      <div className="flex items-start gap-4 mb-6">
        <div className="w-8 h-8 rounded-lg bg-[#16a34a]/20 border border-green-600/30 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-green-300">{number}</span>
        </div>
        <p className="text-base text-[#dcfce7] leading-relaxed">{text}</p>
      </div>
      {children}
    </div>
  );
}
