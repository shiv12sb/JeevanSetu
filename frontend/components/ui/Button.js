import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export function Button({
  children,
  className = "",
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  type = "button",
  onClick,
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center font-bold rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 select-none cursor-pointer";

  const sizeStyles = {
    xs: "px-2.5 py-1 text-xs min-h-[32px]",
    sm: "px-3.5 py-1.5 text-xs min-h-[36px]",
    md: "px-4.5 py-2 text-sm min-h-[40px] sm:min-h-[40px]",
    lg: "px-6 py-3 text-base font-extrabold min-h-[48px]",
    icon: "p-2 min-h-[40px] min-w-[40px]",
  };

  const variantStyles = {
    primary:
      "bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 dark:from-teal-500 dark:to-emerald-500 dark:hover:from-teal-400 dark:hover:to-emerald-400 active:from-teal-700 active:to-emerald-700 text-white dark:text-slate-950 font-black shadow-md shadow-teal-600/20 dark:shadow-teal-500/20 hover:shadow-lg focus:ring-teal-400 border border-teal-500/30",
    secondary:
      "bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 dark:from-sky-500 dark:to-blue-600 text-white font-bold shadow-md shadow-sky-500/20 focus:ring-sky-400 border border-sky-400/30",
    outline:
      "bg-white/70 dark:bg-white/5 hover:bg-white/90 dark:hover:bg-white/10 active:bg-white/95 dark:active:bg-white/15 text-slate-700 dark:text-slate-100 border border-slate-200/90 dark:border-white/15 shadow-xs backdrop-blur-md hover:border-slate-300 dark:hover:border-white/25 focus:ring-teal-400",
    ghost:
      "bg-transparent hover:bg-slate-100/80 dark:hover:bg-white/5 active:bg-slate-200/80 dark:active:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white focus:ring-slate-400 border border-transparent",
    danger:
      "bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 active:from-rose-700 active:to-red-700 text-white font-bold shadow-md shadow-rose-600/30 focus:ring-rose-500 border border-rose-400/30",
    subtle:
      "bg-teal-500/10 hover:bg-teal-500/20 text-teal-800 dark:text-teal-300 border border-teal-500/25 focus:ring-teal-400 backdrop-blur-sm",
  };

  return (
    <button
      type={type}
      className={cn(
        baseStyles,
        sizeStyles[size] || sizeStyles.md,
        variantStyles[variant] || variantStyles.primary,
        className
      )}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading && (
        <Loader2 className="w-4 h-4 mr-2 animate-spin text-current shrink-0" />
      )}
      {children}
    </button>
  );
}
