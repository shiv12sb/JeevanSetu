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
      <div className={cn("border-b border-slate-200 dark:border-slate-800 overflow-x-auto", className)}>
        <nav className="flex space-x-4 sm:space-x-6 min-w-max pb-px" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChange(tab.id)}
                className={cn(
                  "py-2.5 px-1 border-b-2 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap flex items-center gap-1.5 shrink-0",
                  isActive
                    ? "border-teal-600 text-teal-700 dark:text-teal-400"
                    : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700"
                )}
              >
                {tab.icon && <tab.icon className="w-4 h-4 shrink-0" />}
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={cn(
                      "px-2 py-0.5 text-[11px] rounded-full font-normal",
                      isActive
                        ? "bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
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
        "flex p-1 bg-slate-100/90 dark:bg-slate-800/90 rounded-xl space-x-1 overflow-x-auto scrollbar-none",
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
              "flex-1 shrink-0 min-w-fit px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 whitespace-nowrap",
              isActive
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
            )}
          >
            {tab.icon && <tab.icon className="w-3.5 h-3.5 shrink-0" />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  "px-1.5 py-0.2 text-[10px] rounded-full font-normal",
                  isActive
                    ? "bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
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
