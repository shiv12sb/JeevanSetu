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
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        required={required}
        className={cn(
          "w-full px-3.5 py-2 text-sm rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:bg-slate-50 dark:disabled:bg-slate-900 disabled:text-slate-400 dark:disabled:text-slate-500 disabled:cursor-not-allowed",
          error
            ? "border-rose-300 dark:border-rose-700 focus:border-rose-500 focus:ring-rose-200 dark:focus:ring-rose-950"
            : "border-slate-300 dark:border-slate-700 focus:border-teal-600 focus:ring-teal-100 dark:focus:ring-teal-950",
          className
        )}
        {...props}
      />
      {error ? (
        <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{error}</p>
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
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <select
        id={selectId}
        required={required}
        className={cn(
          "w-full px-3.5 py-2 text-sm rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:bg-slate-50 dark:disabled:bg-slate-900 disabled:cursor-not-allowed",
          error
            ? "border-rose-300 dark:border-rose-700 focus:border-rose-500 focus:ring-rose-200 dark:focus:ring-rose-950"
            : "border-slate-300 dark:border-slate-700 focus:border-teal-600 focus:ring-teal-100 dark:focus:ring-teal-950",
          className
        )}
        {...props}
      >
        {children ||
          options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
              {opt.label}
            </option>
          ))}
      </select>
      {error ? (
        <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{error}</p>
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
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        required={required}
        className={cn(
          "w-full px-3.5 py-2 text-sm rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:bg-slate-50 dark:disabled:bg-slate-900 disabled:cursor-not-allowed",
          error
            ? "border-rose-300 dark:border-rose-700 focus:border-rose-500 focus:ring-rose-200 dark:focus:ring-rose-950"
            : "border-slate-300 dark:border-slate-700 focus:border-teal-600 focus:ring-teal-100 dark:focus:ring-teal-950",
          className
        )}
        {...props}
      />
      {error ? (
        <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
}
