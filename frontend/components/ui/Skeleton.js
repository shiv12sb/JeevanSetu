import React from "react";
import { cn } from "@/lib/utils";

/**
 * Base animated shimmer skeleton primitive with glassmorphism
 */
export function Skeleton({ className = "", ...props }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-2xl bg-white/5 border border-white/5",
        className
      )}
      {...props}
    />
  );
}

/**
 * Skeleton text line
 */
export function SkeletonText({ lines = 3, className = "", gap = "gap-2" }) {
  return (
    <div className={cn("flex flex-col", gap, className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-3.5 rounded-xl",
            i === lines - 1 && lines > 1 ? "w-3/4" : "w-full"
          )}
        />
      ))}
    </div>
  );
}

/**
 * Generic card skeleton
 */
export function SkeletonCard({ className = "" }) {
  return (
    <div
      className={cn(
        "p-6 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 space-y-4 shadow-lg shadow-black/30",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28 rounded-xl" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-5 w-3/4 rounded-xl" />
      <SkeletonText lines={2} />
      <div className="pt-3 border-t border-white/5 flex items-center justify-between">
        <Skeleton className="h-9 w-28 rounded-2xl" />
        <Skeleton className="h-9 w-20 rounded-2xl" />
      </div>
    </div>
  );
}

/**
 * Doctor card skeleton
 */
export function SkeletonDoctorCard() {
  return (
    <div className="p-6 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 space-y-4 shadow-lg shadow-black/30">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-48 rounded-xl" />
          <Skeleton className="h-3.5 w-32 rounded-xl" />
        </div>
        <Skeleton className="h-6 w-24 rounded-full shrink-0" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-4 w-20 rounded-xl" />
        <Skeleton className="h-4 w-24 rounded-xl" />
      </div>
      <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-2">
        <Skeleton className="h-4 w-40 rounded-xl" />
        <Skeleton className="h-3 w-56 rounded-xl" />
      </div>
      <div className="pt-3 border-t border-white/5 flex items-center justify-between">
        <Skeleton className="h-9 w-28 rounded-2xl" />
        <Skeleton className="h-9 w-24 rounded-2xl" />
      </div>
    </div>
  );
}

/**
 * Dashboard metric card skeleton
 */
export function SkeletonMetricCard() {
  return (
    <div className="p-6 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/10 space-y-2 shadow-lg shadow-black/30">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3.5 w-24 rounded-xl" />
        <Skeleton className="h-9 w-9 rounded-2xl" />
      </div>
      <Skeleton className="h-7 w-24 rounded-xl" />
      <Skeleton className="h-3 w-32 rounded-xl" />
    </div>
  );
}

/**
 * Table rows skeleton loader
 */
export function SkeletonTableRows({ rows = 4, cols = 4 }) {
  return (
    <div className="w-full space-y-3">
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-white/5"
        >
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton
              key={c}
              className={cn("h-4 rounded-xl", c === 0 ? "w-1/4" : "w-1/6")}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
