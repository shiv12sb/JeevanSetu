import React from "react";
import { cn } from "@/lib/utils";
import { Check, Clock } from "lucide-react";
import { REFERRAL_STAGES } from "@/lib/constants";

export function StatusTimeline({
  currentStage = "created",
  steps = [],
  className = "",
  orientation = "horizontal",
}) {
  const activeIndex = REFERRAL_STAGES.findIndex((s) => s.key === currentStage);

  const timelineSteps = REFERRAL_STAGES.map((stage, idx) => {
    const customStep = steps.find((s) => s.key === stage.key);
    const isCompleted = customStep ? customStep.completed : idx < activeIndex;
    const isCurrent = customStep ? stage.key === currentStage : idx === activeIndex;

    return {
      ...stage,
      date: customStep?.date || (isCompleted ? "Completed" : isCurrent ? "Active" : "Pending"),
      notes: customStep?.notes || stage.description,
      isCompleted,
      isCurrent,
    };
  });

  if (orientation === "vertical") {
    return (
      <div className={cn("relative pl-6 space-y-6", className)}>
        {/* Continuous track line */}
        <div className="absolute left-2.5 top-3 bottom-3 w-0.5 bg-slate-200 dark:bg-slate-700" />

        {timelineSteps.map((step, idx) => (
          <div key={step.key} className="relative flex items-start gap-4">
            {/* Step Marker */}
            <div
              className={cn(
                "relative z-10 w-5 h-5 rounded-full flex items-center justify-center -ml-6 text-white text-[10px] font-bold ring-4 ring-white dark:ring-slate-900 transition-colors",
                step.isCompleted
                  ? "bg-emerald-500"
                  : step.isCurrent
                  ? "bg-sky-600 animate-pulse"
                  : "bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
              )}
            >
              {step.isCompleted ? (
                <Check className="w-3 h-3 stroke-[3]" />
              ) : step.isCurrent ? (
                <Clock className="w-3 h-3 text-white" />
              ) : (
                <span className="text-[9px] text-slate-600 dark:text-slate-300">{idx + 1}</span>
              )}
            </div>

            {/* Step Info */}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h5
                  className={cn(
                    "text-xs font-semibold",
                    step.isCurrent
                      ? "text-sky-900 dark:text-sky-300 font-bold"
                      : step.isCompleted
                      ? "text-slate-800 dark:text-slate-200"
                      : "text-slate-400 dark:text-slate-500"
                  )}
                >
                  {step.label}
                </h5>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">{step.date}</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                {step.notes}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("w-full py-4", className)}>
      <div className="flex items-center justify-between relative">
        {/* Background track line */}
        <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-0.5 bg-slate-200 dark:bg-slate-700 z-0" />

        {timelineSteps.map((step, idx) => (
          <div
            key={step.key}
            className="relative z-10 flex flex-col items-center group text-center"
            style={{ width: `${100 / timelineSteps.length}%` }}
          >
            <div
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-slate-900 transition-all text-xs font-bold shadow-xs",
                step.isCompleted
                  ? "bg-emerald-500 text-white"
                  : step.isCurrent
                  ? "bg-sky-600 text-white ring-sky-100 dark:ring-sky-950"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
              )}
            >
              {step.isCompleted ? (
                <Check className="w-4 h-4 stroke-[2.5]" />
              ) : (
                <span>{idx + 1}</span>
              )}
            </div>
            <div className="mt-2 px-1">
              <p
                className={cn(
                  "text-[11px] font-semibold leading-tight line-clamp-1",
                  step.isCurrent
                    ? "text-sky-700 dark:text-sky-300 font-bold"
                    : step.isCompleted
                    ? "text-slate-800 dark:text-slate-200"
                    : "text-slate-400 dark:text-slate-500"
                )}
              >
                {step.label}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 hidden sm:block">
                {step.date !== "Pending" ? step.date : ""}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StatusTimeline;
