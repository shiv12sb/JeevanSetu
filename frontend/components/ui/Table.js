import React from "react";
import { cn } from "@/lib/utils";

export function Table({ className = "", children, ...props }) {
  return (
    <div className="w-full overflow-x-auto rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900/60 backdrop-blur-xl shadow-lg shadow-slate-200/50 dark:shadow-black/30">
      <table
        className={cn("w-full text-left text-sm text-slate-800 dark:text-slate-200 divide-y divide-slate-200/80 dark:divide-white/5", className)}
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ className = "", children, ...props }) {
  return (
    <thead
      className={cn("bg-slate-100/90 dark:bg-white/5 text-xs font-bold text-slate-900 dark:text-slate-300 uppercase tracking-wider backdrop-blur-md", className)}
      {...props}
    >
      {children}
    </thead>
  );
}

export function TableBody({ className = "", children, ...props }) {
  return (
    <tbody
      className={cn("divide-y divide-slate-200/80 dark:divide-white/5 bg-transparent", className)}
      {...props}
    >
      {children}
    </tbody>
  );
}

export function TableRow({ className = "", children, ...props }) {
  return (
    <tr
      className={cn("hover:bg-slate-50 dark:hover:bg-white/5 transition-colors duration-150", className)}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHead({ className = "", children, ...props }) {
  return (
    <th className={cn("px-5 py-3.5 text-xs font-bold text-slate-900 dark:text-slate-300", className)} {...props}>
      {children}
    </th>
  );
}

export function TableCell({ className = "", children, ...props }) {
  return (
    <td className={cn("px-5 py-4 text-xs sm:text-sm whitespace-nowrap text-slate-800 dark:text-slate-200", className)} {...props}>
      {children}
    </td>
  );
}
