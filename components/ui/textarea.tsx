import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-lg border border-green-600/20 bg-[#1e2438] px-3 py-2 text-sm text-[#dcfce7] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-green-600/50 focus:border-green-600/50 disabled:cursor-not-allowed disabled:opacity-50 resize-y transition-all duration-200",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
