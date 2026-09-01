import React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  children,
  variant = "default",
  size = "md",
  className = "",
  dot = false,
  ...props
}) {
  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px] font-bold",
    md: "px-2.5 py-0.5 text-xs font-bold",
    lg: "px-3.5 py-1 text-xs font-extrabold",
  };

  const variantStyles = {
    default: "bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-white/15 backdrop-blur-xs",
    success: "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30 backdrop-blur-xs shadow-xs",
    warning: "bg-amber-50 dark:bg-amber-500/15 text-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-500/30 backdrop-blur-xs shadow-xs",
    danger: "bg-rose-50 dark:bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-500/30 backdrop-blur-xs shadow-xs",
    info: "bg-sky-50 dark:bg-sky-500/15 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-500/30 backdrop-blur-xs shadow-xs",
    teal: "bg-teal-50 dark:bg-teal-500/15 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-500/30 backdrop-blur-xs shadow-xs",
    purple: "bg-purple-50 dark:bg-purple-500/15 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-500/30 backdrop-blur-xs shadow-xs",
    outline: "bg-transparent text-slate-800 dark:text-slate-300 border-slate-300 dark:border-white/20",
  };

  const dotColors = {
    default: "bg-slate-400",
    success: "bg-emerald-400 animate-pulse",
    warning: "bg-amber-400 animate-pulse",
    danger: "bg-rose-400 animate-pulse",
    info: "bg-sky-400 animate-pulse",
    teal: "bg-teal-400 animate-pulse",
    purple: "bg-purple-400 animate-pulse",
    outline: "bg-slate-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border rounded-full whitespace-nowrap transition-colors",
        sizeStyles[size] || sizeStyles.md,
        variantStyles[variant] || variantStyles.default,
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0 shadow-sm",
            dotColors[variant] || dotColors.default
          )}
        />
      )}
      {children}
    </span>
  );
}
