import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind class names conditionally without collision.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format date string into friendly readable format (e.g. 22 Aug 2026)
 */
export function formatDate(dateString) {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Format relative time or time of day (e.g. 10:30 AM)
 */
export function formatTime(dateString) {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  } catch {
    return "";
  }
}

/**
 * Get human-readable status badge color config
 */
export function getStatusTheme(status) {
  switch (status?.toLowerCase()) {
    case "completed":
    case "active":
    case "verified":
    case "sufficient":
    case "available":
    case "normal":
      return {
        bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
        dot: "bg-emerald-500",
      };
    case "pending":
    case "created":
    case "notified":
    case "in_review":
    case "depleting":
    case "low":
    case "warning":
      return {
        bg: "bg-amber-50 text-amber-700 border-amber-200",
        dot: "bg-amber-500",
      };
    case "critical":
    case "out_of_stock":
    case "urgent":
    case "rejected":
    case "high_risk":
      return {
        bg: "bg-rose-50 text-rose-700 border-rose-200",
        dot: "bg-rose-500",
      };
    case "accepted":
    case "hospital_reached":
    case "treatment_started":
    case "in_progress":
      return {
        bg: "bg-sky-50 text-sky-700 border-sky-200",
        dot: "bg-sky-500",
      };
    default:
      return {
        bg: "bg-slate-100 text-slate-700 border-slate-200",
        dot: "bg-slate-400",
      };
  }
}
