import React from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { FileText, ArrowRight, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

export function CaseSummaryCard({ patientCase, onViewDetail, className = "" }) {
  if (!patientCase) return null;

  return (
    <Card className={`hover:border-slate-300 dark:hover:border-slate-700 transition-all ${className}`}>
      <CardContent className="p-5 space-y-3.5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                {patientCase.id}
              </span>
              <StatusBadge status={patientCase.status} />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
              <span>{patientCase.patientName}</span>
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                ({patientCase.age} yrs, {patientCase.gender})
              </span>
            </h4>
          </div>

          <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatDate(patientCase.updatedAt)}</span>
          </div>
        </div>

        {/* Symptoms / Clinical Impression */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-1 text-xs">
          <p className="text-slate-800 dark:text-slate-200">
            <strong className="text-slate-900 dark:text-white">Symptoms:</strong> {patientCase.primarySymptoms}
          </p>
          {patientCase.initialDiagnosisImpression && (
            <p className="text-teal-900 dark:text-teal-300 font-medium pt-0.5">
              <strong>Clinical Assessment:</strong> {patientCase.initialDiagnosisImpression}
            </p>
          )}
        </div>

        {/* Vitals summary */}
        {patientCase.vitals && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Blood Pressure</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{patientCase.vitals.bp}</span>
            </div>
            <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Pulse</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{patientCase.vitals.pulse}</span>
            </div>
            <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block">SpO2</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{patientCase.vitals.spo2}</span>
            </div>
            <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Temp</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{patientCase.vitals.temp}</span>
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <FileText className="w-3.5 h-3.5" />
            <span>{patientCase.documentsCount || 0} Attached Records</span>
          </div>

          {onViewDetail && (
            <Button
              size="sm"
              variant="subtle"
              className="text-xs h-7 gap-1"
              onClick={() => onViewDetail(patientCase)}
            >
              <span>Review Case</span>
              <ArrowRight className="w-3 h-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default CaseSummaryCard;
