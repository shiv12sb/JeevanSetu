import React from "react";
import { Button } from "@/components/ui/Button";
import { Search, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Standard dark glass empty state component
 */
export function EmptyState({
  icon: Icon = Search,
  title = "No results found",
  description = "Try adjusting your search criteria or resetting filters to find what you are looking for.",
  actionLabel = "Reset Filters",
  onAction,
  className = "",
  children,
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 space-y-4 my-6 shadow-lg shadow-slate-200/50 dark:shadow-black/30",
        className
      )}
    >
      <div className="w-16 h-16 rounded-3xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 flex items-center justify-center shadow-inner shadow-teal-500/10">
        <Icon className="w-8 h-8" />
      </div>

      <div className="space-y-1.5 max-w-md">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
          {title}
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          {description}
        </p>
      </div>

      {children}

      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          variant="outline"
          size="sm"
          className="text-xs font-bold rounded-2xl border-slate-200 dark:border-white/15 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-white gap-2 shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
