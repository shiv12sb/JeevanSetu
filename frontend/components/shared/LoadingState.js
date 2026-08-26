import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export function LoadingState({
  text = "Loading data...",
  variant = "card",
  rows = 3,
  className = "",
}) {
  if (variant === "spinner") {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center p-8 gap-2.5 text-slate-500",
          className
        )}
      >
        <Loader2 className="w-7 h-7 animate-spin text-teal-600" />
        <span className="text-xs font-medium">{text}</span>
      </div>
    );
  }

  if (variant === "table") {
    return (
      <div className={cn("w-full space-y-3 p-4 bg-white rounded-xl border border-slate-200", className)}>
        <div className="h-4 bg-slate-200 rounded animate-pulse w-1/4 mb-4" />
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="h-4 bg-slate-100 rounded animate-pulse flex-1" />
            <div className="h-4 bg-slate-100 rounded animate-pulse w-24" />
            <div className="h-4 bg-slate-100 rounded animate-pulse w-16" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "p-6 bg-white rounded-xl border border-slate-200 space-y-4 animate-pulse",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-200 rounded-full shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-slate-200 rounded w-1/3" />
          <div className="h-3 bg-slate-100 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2 pt-2">
        <div className="h-3 bg-slate-100 rounded w-full" />
        <div className="h-3 bg-slate-100 rounded w-5/6" />
        <div className="h-3 bg-slate-100 rounded w-4/6" />
      </div>
    </div>
  );
}
