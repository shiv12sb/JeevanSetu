import React from "react";
import { cn } from "@/lib/utils";

export function Input({
  label,
  helperText,
  error,
  id,
  className = "",
  type = "text",
  required = false,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-bold text-slate-700 dark:text-slate-300 tracking-wide"
        >
          {label} {required && <span className="text-rose-500 dark:text-rose-400">*</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        required={required}
        className={cn(
          "w-full px-4 py-2.5 text-xs sm:text-sm rounded-2xl border bg-white/80 dark:bg-slate-900/75 backdrop-blur-md text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed",
          error
            ? "border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/20"
            : "border-slate-200/90 dark:border-white/10 focus:border-teal-500 dark:focus:border-teal-400/60 focus:bg-white dark:focus:bg-slate-900/90",
          className
        )}
        {...props}
      />
      {error ? (
        <p className="text-xs text-rose-500 dark:text-rose-400 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
}

export function Select({
  label,
  helperText,
  error,
  id,
  options = [],
  className = "",
  required = false,
  children,
  ...props
}) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-bold text-slate-700 dark:text-slate-300 tracking-wide"
        >
          {label} {required && <span className="text-rose-500 dark:text-rose-400">*</span>}
        </label>
      )}
      <select
        id={selectId}
        required={required}
        className={cn(
          "w-full px-4 py-2.5 text-xs sm:text-sm rounded-2xl border bg-white/85 dark:bg-slate-900/85 backdrop-blur-md text-slate-900 dark:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
          error
            ? "border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/20"
            : "border-slate-200/90 dark:border-white/10 focus:border-teal-500 dark:focus:border-teal-400/60 focus:bg-white dark:focus:bg-slate-900",
          className
        )}
        {...props}
      >
        {children ||
          options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
              {opt.label}
            </option>
          ))}
      </select>
      {error ? (
        <p className="text-xs text-rose-500 dark:text-rose-400 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
}

export function Textarea({
  label,
  helperText,
  error,
  id,
  rows = 3,
  className = "",
  required = false,
  ...props
}) {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-xs font-bold text-slate-700 dark:text-slate-300 tracking-wide"
        >
          {label} {required && <span className="text-rose-500 dark:text-rose-400">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        required={required}
        className={cn(
          "w-full px-4 py-2.5 text-xs sm:text-sm rounded-2xl border bg-white/80 dark:bg-slate-900/75 backdrop-blur-md text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed",
          error
            ? "border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/20"
            : "border-slate-200/90 dark:border-white/10 focus:border-teal-500 dark:focus:border-teal-400/60 focus:bg-white dark:focus:bg-slate-900/90",
          className
        )}
        {...props}
      />
      {error ? (
        <p className="text-xs text-rose-500 dark:text-rose-400 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
}
