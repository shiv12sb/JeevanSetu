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
      container: "bg-sky-50 dark:bg-sky-950/50 border-sky-200 dark:border-sky-800 text-sky-900 dark:text-sky-200",
      title: "text-sky-950 dark:text-sky-100",
      icon: Info,
      iconColor: "text-sky-600 dark:text-sky-400",
    },
    success: {
      container: "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200",
      title: "text-emerald-950 dark:text-emerald-100",
      icon: CheckCircle2,
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    warning: {
      container: "bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200",
      title: "text-amber-950 dark:text-amber-100",
      icon: AlertTriangle,
      iconColor: "text-amber-600 dark:text-amber-400",
    },
    danger: {
      container: "bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200",
      title: "text-rose-950 dark:text-rose-100",
      icon: AlertCircle,
      iconColor: "text-rose-600 dark:text-rose-400",
    },
    safety: {
      container: "bg-teal-50/90 dark:bg-teal-950/50 border-teal-200 dark:border-teal-800 text-teal-950 dark:text-teal-200",
      title: "text-teal-950 dark:text-teal-100 font-semibold",
      icon: ShieldAlert,
      iconColor: "text-teal-700 dark:text-teal-400",
    },
  };

  const config = variantConfig[variant] || variantConfig.info;
  const IconComponent = CustomIcon || config.icon;

  return (
    <div
      role="alert"
      className={cn(
        "flex gap-3 p-4 rounded-xl border text-sm leading-relaxed",
        config.container,
        className
      )}
      {...props}
    >
      <IconComponent className={cn("w-5 h-5 shrink-0 mt-0.5", config.iconColor)} />
      <div className="flex-1 space-y-1">
        {title && (
          <h5 className={cn("font-semibold leading-tight", config.title)}>
            {title}
          </h5>
        )}
        <div className="text-xs sm:text-sm text-inherit opacity-90">
          {children}
        </div>
      </div>
    </div>
  );
}
