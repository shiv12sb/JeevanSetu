import React from "react";
import { cn } from "@/lib/utils";
import { FolderSearch, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function EmptyState({
  title = "No records found",
  description = "There are currently no items matching your criteria.",
  icon: Icon = FolderSearch,
  actionLabel,
  onAction,
  className = "",
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300/90",
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
      <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
        {description}
      </p>
      {actionLabel && (
        <Button
          variant="outline"
          size="sm"
          className="mt-4 gap-1.5"
          onClick={onAction}
        >
          <Plus className="w-3.5 h-3.5" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
