import React from "react";
import { cn } from "@/lib/utils";

export function Card({ className = "", children, hover = false, glow = false, ...props }) {
  return (
    <div
      className={cn(
        "rounded-3xl bg-white/75 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-lg shadow-slate-200/40 dark:shadow-black/30 transition-all duration-300",
        hover && "hover:bg-white/90 dark:hover:bg-slate-900/80 hover:-translate-y-1 hover:border-teal-400/50 dark:hover:border-teal-500/40 hover:shadow-teal-500/10 hover:shadow-xl",
        glow && "border-teal-500/30 shadow-teal-500/10 shadow-xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = "", children, ...props }) {
  return (
    <div
      className={cn(
        "p-5 sm:p-6 border-b border-slate-200/60 dark:border-white/5 flex flex-col gap-1.5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ className = "", children, ...props }) {
  return (
    <h3
      className={cn(
        "text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center justify-between",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ className = "", children, ...props }) {
  return (
    <p
      className={cn(
        "text-xs text-slate-600 dark:text-slate-400 leading-relaxed",
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({ className = "", children, ...props }) {
  return (
    <div className={cn("p-5 sm:p-6", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className = "", children, ...props }) {
  return (
    <div
      className={cn(
        "p-4 sm:p-5 bg-slate-50/70 dark:bg-white/5 border-t border-slate-200/60 dark:border-white/5 rounded-b-3xl flex items-center justify-between text-xs backdrop-blur-md",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
