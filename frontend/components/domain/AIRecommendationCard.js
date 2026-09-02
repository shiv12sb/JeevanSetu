"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Sparkles, Building2, Shield, HeartHandshake, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/context/LanguageContext";

const AI_CARD_TEXTS = {
  en: {
    title: "AI Resource Recommendation",
    sub: "Grounded in verified healthcare registry data",
    verifiedMatch: "Verified Match",
    context: "Identified Healthcare Need Context:",
    supportOptions: "Verified Support Options:",
    nextActions: "Recommended Next Actions:",
    inspect: "Inspect",
  },
  hi: {
    title: "एआई संसाधन सिफारिश",
    sub: "सत्यापित सार्वजनिक स्वास्थ्य रजिस्ट्री डेटा पर आधारित",
    verifiedMatch: "सत्यापित मिलान",
    context: "पहचाना गया स्वास्थ्य संदर्भ:",
    supportOptions: "सत्यापित सहायता विकल्प:",
    nextActions: "अनुशंसित अगले कदम:",
    inspect: "देखें",
  },
  mr: {
    title: "एआय संसाधन शिफारस",
    sub: "प्रमाणित सार्वजनिक आरोग्य नोंदणी डेटावर आधारित",
    verifiedMatch: "प्रमाणित जुळणी",
    context: "ओळखलेली आरोग्य गरज:",
    supportOptions: "सत्यापित मदत पर्याय:",
    nextActions: "पुढील शिफारस केलेल्या कृती:",
    inspect: "पहा",
  },
};

export function AIRecommendationCard({ recommendation, onExploreResource, className = "" }) {
  const { language } = useLanguage();
  const txt = AI_CARD_TEXTS[language] || AI_CARD_TEXTS.en;

  if (!recommendation) return null;

  const iconMap = {
    facility: Building2,
    scheme: Shield,
    assistance: HeartHandshake,
  };

  return (
    <Card className={`border-teal-200 dark:border-teal-800 bg-white dark:bg-slate-900 shadow-xs ${className}`}>
      <CardHeader className="pb-3 border-b border-teal-100 dark:border-teal-800 bg-teal-50/60 dark:bg-teal-950/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 rounded-xl border border-teal-200 dark:border-teal-800 shadow-xs">
              <Sparkles className="w-4 h-4 text-teal-700 dark:text-teal-300" />
            </div>
            <div>
              <CardTitle className="text-sm text-teal-950 dark:text-teal-100 font-bold">
                {txt.title}
              </CardTitle>
              <p className="text-[11px] text-teal-800/90 dark:text-teal-400 font-medium">
                {txt.sub}
              </p>
            </div>
          </div>
          <Badge variant="teal" size="sm" dot className="font-bold">
            {txt.verifiedMatch}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-4">
        {/* Patient Need Grounding */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
          <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">{txt.context}</span>
          <p className="text-slate-700 dark:text-slate-300 font-medium italic">"{recommendation.patientNeedSummary}"</p>
        </div>

        {/* Recommended Matches List */}
        <div className="space-y-3">
          <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            {txt.supportOptions}
          </h5>

          {recommendation.recommendations?.map((item, idx) => {
            const Icon = iconMap[item.type] || Building2;
            return (
              <div
                key={idx}
                className="p-3.5 bg-slate-50/70 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-teal-400 dark:hover:border-teal-600 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-3 shadow-2xs"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0 mt-0.5 border border-teal-200 dark:border-teal-800">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h6 className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</h6>
                      <span className="text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-md">
                        {item.matchScore}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{item.reason}</p>
                  </div>
                </div>

                {item.resourceId && onExploreResource && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs h-7 text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 self-end sm:self-center shrink-0 gap-1"
                    onClick={() => onExploreResource(item.resourceId)}
                  >
                    <span>{txt.inspect}</span>
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
              {txt.nextActions}
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
      </CardContent>
    </Card>
  );
}

export default AIRecommendationCard;
