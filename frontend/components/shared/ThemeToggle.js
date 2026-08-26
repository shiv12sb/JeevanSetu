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
      className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${
        isDarkVariant
          ? "text-teal-200 hover:text-white hover:bg-teal-900 border border-teal-800"
          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 dark:border-slate-700"
      } ${className}`}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle Dark / Light Theme"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-180 duration-200" />
      ) : (
        <Moon className="w-4 h-4 text-slate-700 dark:text-slate-200 animate-in spin-in-180 duration-200" />
      )}
    </button>
  );
}

export default ThemeToggle;
