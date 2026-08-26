import React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ErrorState({
  title = "Failed to load information",
  message = "An error occurred while communicating with the healthcare service. Please check your network and try again.",
  onRetry,
  className = "",
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center bg-rose-50/50 rounded-2xl border border-rose-200/80",
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-semibold text-rose-900">{title}</h4>
      <p className="text-xs text-rose-700/90 max-w-sm mt-1 leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          className="mt-4 border-rose-300 text-rose-800 hover:bg-rose-100/60 gap-1.5"
          onClick={onRetry}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Retry Request
        </Button>
      )}
    </div>
  );
}
