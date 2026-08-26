import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { Sparkles, Building2, Shield, HeartHandshake, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function AIRecommendationCard({ recommendation, onExploreResource, className = "" }) {
  if (!recommendation) return null;

  const iconMap = {
    facility: Building2,
    scheme: Shield,
    assistance: HeartHandshake,
  };

  return (
    <Card className={`border-teal-200 dark:border-teal-800 bg-linear-to-b from-teal-50/30 dark:from-teal-950/30 to-white dark:to-slate-900 shadow-xs ${className}`}>
      <CardHeader className="pb-3 border-b border-teal-100 dark:border-teal-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 rounded-lg">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-sm text-teal-950 dark:text-teal-200 font-bold">
                AI Resource Recommendation
              </CardTitle>
              <p className="text-[11px] text-teal-700/80 dark:text-teal-400">
                Grounded in verified healthcare registry data
              </p>
            </div>
          </div>
          <Badge variant="teal" size="sm" dot>
            Verified Match
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-4">
        {/* Patient Need Grounding */}
        <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200/80 dark:border-slate-700 text-xs">
          <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">Identified Healthcare Need Context:</span>
          <p className="text-slate-600 dark:text-slate-400 italic">"{recommendation.patientNeedSummary}"</p>
        </div>

        {/* Recommended Matches List */}
        <div className="space-y-3">
          <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Verified Support Options:
          </h5>

          {recommendation.recommendations?.map((item, idx) => {
            const Icon = iconMap[item.type] || Building2;
            return (
              <div
                key={idx}
                className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-600 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0 mt-0.5 border border-teal-100 dark:border-teal-800">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h6 className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</h6>
                      <span className="text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.2 rounded">
                        {item.matchScore}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{item.reason}</p>
                  </div>
                </div>

                {item.resourceId && onExploreResource && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs h-7 text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 self-end sm:self-center shrink-0 gap-1"
                    onClick={() => onExploreResource(item.resourceId)}
                  >
                    <span>Inspect</span>
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {/* Next Steps Guidance */}
        {recommendation.nextSteps && (
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-1.5">
            <h6 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Recommended Next Actions:
            </h6>
            <ul className="space-y-1">
              {recommendation.nextSteps.map((step, idx) => (
                <li key={idx} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Safety Boundary Banner */}
        <Alert variant="safety" className="text-xs py-2.5">
          {recommendation.safetyCaution ||
            "JeevanSetu AI provides grounded healthcare coordination assistance only. It is not a diagnostic or prescribing authority."}
        </Alert>
      </CardContent>
    </Card>
  );
}
