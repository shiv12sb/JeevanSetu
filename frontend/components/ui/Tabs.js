import React from "react";
import { cn } from "@/lib/utils";

export function Tabs({
  tabs = [],
  activeTab,
  onChange,
  className = "",
  variant = "pills",
}) {
  if (variant === "underline") {
    return (
      <div className={cn("border-b border-slate-200 dark:border-white/10 overflow-x-auto", className)}>
        <nav className="flex space-x-4 sm:space-x-6 min-w-max pb-px" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChange(tab.id)}
                className={cn(
                  "py-3 px-1 border-b-2 text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 shrink-0 cursor-pointer",
                  isActive
                    ? "border-teal-600 dark:border-teal-400 text-teal-800 dark:text-teal-300 drop-shadow-[0_0_12px_rgba(20,184,166,0.5)]"
                    : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-white/20"
                )}
              >
                {tab.icon && <tab.icon className="w-4 h-4 shrink-0" />}
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={cn(
                      "px-2 py-0.5 text-[11px] rounded-full font-semibold",
                      isActive
                        ? "bg-teal-500/20 text-teal-800 dark:text-teal-300 border border-teal-500/30"
                        : "bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300"
                    )}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex p-1.5 bg-slate-100 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl space-x-1.5 overflow-x-auto no-scrollbar shadow-inner",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex-1 shrink-0 min-w-fit px-3.5 py-2 text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer",
              isActive
                ? "bg-teal-500/20 text-teal-800 dark:text-teal-300 border border-teal-500/40 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/5 border border-transparent"
            )}
          >
            {tab.icon && <tab.icon className="w-3.5 h-3.5 shrink-0" />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  "px-2 py-0.5 text-[10px] rounded-full font-bold",
                  isActive
                    ? "bg-teal-500/30 text-teal-800 dark:text-teal-200"
                    : "bg-slate-200/80 dark:bg-white/10 text-slate-700 dark:text-slate-400"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
