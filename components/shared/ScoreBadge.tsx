import { getRiskLabelFromScore, getScoreColor } from "@/lib/scoring";
import { cn } from "@/lib/utils";

interface ScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function ScoreBadge({ score, size = "md", showLabel = true, className }: ScoreBadgeProps) {
  const color = getScoreColor(score);
  const label = getRiskLabelFromScore(score);

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-semibold",
        sizeClasses[size],
        className
      )}
      style={{
        color,
        borderColor: `${color}40`,
        backgroundColor: `${color}15`,
      }}
    >
      <span className="font-mono font-bold">{score.toFixed(1)}</span>
      {showLabel && <span className="opacity-80">{label}</span>}
    </span>
  );
}
