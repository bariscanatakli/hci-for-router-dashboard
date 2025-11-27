import * as React from "react";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type InfoBadgeProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  content: React.ReactNode;
};

export function InfoBadge({ content, className, children, ...buttonProps }: InfoBadgeProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full border border-slate-800 bg-slate-900/80 text-[12px] font-semibold text-indigo-200",
              "transition hover:border-indigo-500 hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
              className
            )}
            aria-label={buttonProps["aria-label"] ?? "More info"}
            {...buttonProps}
          >
            {children ?? <Info className="h-4 w-4" />}
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs bg-slate-900 text-xs text-slate-100">
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
