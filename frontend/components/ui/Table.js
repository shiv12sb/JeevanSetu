import React from "react";
import { cn } from "@/lib/utils";

export function Table({ className = "", children, ...props }) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
      <table
        className={cn("w-full text-left text-sm text-slate-700 dark:text-slate-200 divide-y divide-slate-200 dark:divide-slate-800", className)}
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
      className={cn("bg-slate-50/80 dark:bg-slate-800/80 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider", className)}
      {...props}
    >
      {children}
    </thead>
  );
}

export function TableBody({ className = "", children, ...props }) {
  return (
    <tbody
      className={cn("divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900", className)}
      {...props}
    >
      {children}
    </tbody>
  );
}

export function TableRow({ className = "", children, ...props }) {
  return (
    <tr
      className={cn("hover:bg-slate-50/70 dark:hover:bg-slate-800/60 transition-colors", className)}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHead({ className = "", children, ...props }) {
  return (
    <th className={cn("px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300", className)} {...props}>
      {children}
    </th>
  );
}

export function TableCell({ className = "", children, ...props }) {
  return (
    <td className={cn("px-4 py-3.5 text-sm whitespace-nowrap text-slate-800 dark:text-slate-200", className)} {...props}>
      {children}
    </td>
  );
}
