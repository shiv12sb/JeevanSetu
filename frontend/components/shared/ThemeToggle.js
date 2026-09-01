"use client";

import React from "react";
import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle({ className = "", isDarkVariant = false }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`p-2 rounded-xl transition-all duration-300 flex items-center justify-center cursor-pointer ${
        isDarkVariant
          ? "bg-slate-900/80 hover:bg-slate-800 text-teal-300 border border-teal-500/30 shadow-xs"
          : "bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/80 dark:border-white/10 hover:bg-white/90 dark:hover:bg-slate-800/80 shadow-xs hover:border-teal-400/40 dark:hover:border-teal-500/30"
      } ${className}`}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle Dark / Light Theme"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-180 duration-300" />
      ) : (
        <Moon className="w-4 h-4 text-slate-700 dark:text-slate-200 animate-in spin-in-180 duration-300" />
      )}
    </button>
  );
}

export default ThemeToggle;
