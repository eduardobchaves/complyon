import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-4 text-center", className)}>
      <div className="w-16 h-16 rounded-full bg-green-600/10 border border-green-600/20 flex items-center justify-center mb-4">
        <Icon className="h-7 w-7 text-green-400" />
      </div>
      <h3 className="text-lg font-semibold text-[#dcfce7] mb-2 font-[var(--font-sora)]">{title}</h3>
      {description && (
        <p className="text-sm text-[#9CA3AF] max-w-sm mb-6">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
