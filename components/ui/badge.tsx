import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-purple-500/30 bg-purple-500/20 text-purple-300",
        secondary: "border-[#221540] bg-[#221540] text-[#9CA3AF]",
        destructive: "border-red-500/30 bg-red-500/20 text-red-300",
        outline: "border-purple-500/30 text-[#E9D5FF]",
        success: "border-emerald-500/30 bg-emerald-500/20 text-emerald-300",
        warning: "border-amber-500/30 bg-amber-500/20 text-amber-300",
        info: "border-cyan-500/30 bg-cyan-500/20 text-cyan-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
