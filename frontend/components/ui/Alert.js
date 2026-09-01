import React from "react";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  ShieldAlert,
} from "lucide-react";

export function Alert({
  children,
  title,
  variant = "info",
  className = "",
  icon: CustomIcon,
  ...props
}) {
  const variantConfig = {
    info: {
      container: "bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-500/30 text-sky-900 dark:text-sky-200 backdrop-blur-md shadow-xs",
      title: "text-sky-950 dark:text-sky-100 font-extrabold",
      icon: Info,
      iconColor: "text-sky-600 dark:text-sky-400",
    },
    success: {
      container: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-200 backdrop-blur-md shadow-xs",
      title: "text-emerald-950 dark:text-emerald-100 font-extrabold",
      icon: CheckCircle2,
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    warning: {
      container: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-500/30 text-amber-900 dark:text-amber-200 backdrop-blur-md shadow-xs",
      title: "text-amber-950 dark:text-amber-100 font-extrabold",
      icon: AlertTriangle,
      iconColor: "text-amber-600 dark:text-amber-400",
    },
    danger: {
      container: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-500/30 text-rose-900 dark:text-rose-200 backdrop-blur-md shadow-xs",
      title: "text-rose-950 dark:text-rose-100 font-extrabold",
      icon: AlertCircle,
      iconColor: "text-rose-600 dark:text-rose-400",
    },
    safety: {
      container: "bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-500/30 text-teal-900 dark:text-teal-200 backdrop-blur-md shadow-xs",
      title: "text-teal-950 dark:text-teal-100 font-extrabold",
      icon: ShieldAlert,
      iconColor: "text-teal-600 dark:text-teal-400",
    },
  };

  const config = variantConfig[variant] || variantConfig.info;
  const IconComponent = CustomIcon || config.icon;

  return (
    <div
      role="alert"
      className={cn(
        "flex gap-3 p-4 rounded-2xl border text-sm leading-relaxed text-left",
        config.container,
        className
      )}
      {...props}
    >
      <IconComponent className={cn("w-5 h-5 shrink-0 mt-0.5", config.iconColor)} />
      <div className="flex-1 space-y-1">
        {title && (
          <h5 className={cn("font-bold leading-tight tracking-tight", config.title)}>
            {title}
          </h5>
        )}
        <div className="text-xs sm:text-sm text-inherit opacity-95">
          {children}
        </div>
      </div>
    </div>
  );
}
