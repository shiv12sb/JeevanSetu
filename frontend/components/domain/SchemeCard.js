import React from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FileText, CheckCircle2, ChevronRight } from "lucide-react";

export function SchemeCard({ scheme, onSelect, className = "" }) {
  if (!scheme) return null;

  return (
    <Card className={`hover:border-teal-300 dark:hover:border-teal-600 hover:shadow-xs transition-all ${className}`}>
      <CardContent className="p-5 space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded border border-sky-100 dark:border-sky-800 uppercase tracking-wider">
                {scheme.category}
              </span>
              {scheme.isVerified && (
                <Badge variant="success" size="sm">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Verified Govt Scheme
                </Badge>
              )}
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
              {scheme.name}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">{scheme.fullName}</p>
          </div>
        </div>

        {/* Coverage Highlight */}
        <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800 rounded-lg flex items-center justify-between">
          <span className="text-xs text-emerald-900 dark:text-emerald-300 font-medium">Annual Coverage Benefit:</span>
          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-200">{scheme.maxCoverage}</span>
        </div>

        {/* Eligibility & Summary */}
        <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
          <p className="line-clamp-2">
            <strong className="text-slate-800 dark:text-slate-200">Eligibility:</strong> {scheme.eligibilitySummary}
          </p>
          <p className="line-clamp-1">
            <strong className="text-slate-800 dark:text-slate-200">Covers:</strong> {scheme.coveredTreatments}
          </p>
        </div>

        {/* Documents Required Chips */}
        {scheme.documentsRequired && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <FileText className="w-3 h-3" /> Docs:
            </span>
            {scheme.documentsRequired.map((doc) => (
              <span
                key={doc}
                className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700"
              >
                {doc}
              </span>
            ))}
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">{scheme.howToApply}</span>
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-8 gap-1 shrink-0"
            onClick={() => onSelect && onSelect(scheme)}
          >
            <span>Eligibility Guide</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default SchemeCard;
