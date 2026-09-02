"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { FileText, ArrowRight, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

const CASE_CARD_TEXTS = {
  en: {
    symptoms: "Symptoms:",
    clinicalAssessment: "Clinical Assessment:",
    bp: "Blood Pressure",
    pulse: "Pulse Rate",
    spo2: "SpO2 Oxygen",
    temp: "Temperature",
    records: "Attached Records",
    reviewCase: "Review Case",
    years: "yrs",
  },
  hi: {
    symptoms: "प्राथमिक लक्षण:",
    clinicalAssessment: "चिकित्सीय मूल्यांकन:",
    bp: "रक्तचाप (BP)",
    pulse: "नाड़ी दर (Pulse)",
    spo2: "ऑक्सीजन (SpO2)",
    temp: "शरीर तापमान",
    records: "संलग्न मेडिकल रिकॉर्ड्स",
    reviewCase: "केस समीक्षा करें",
    years: "वर्ष",
  },
  mr: {
    symptoms: "प्राथमिक लक्षणे:",
    clinicalAssessment: "वैद्यकीय मूल्यांकन:",
    bp: "रक्तदाब (BP)",
    pulse: "नाडी दर (Pulse)",
    spo2: "ऑक्सिजन (SpO2)",
    temp: "शरीर तापमान",
    records: "जोडलेले वैद्यकीय अहवाल",
    reviewCase: "केस पुनरावलोकन करा",
    years: "वर्षे",
  },
};

export function CaseSummaryCard({ patientCase, onViewDetail, className = "" }) {
  const { language } = useLanguage();
  const txt = CASE_CARD_TEXTS[language] || CASE_CARD_TEXTS.en;

  if (!patientCase) return null;

  return (
    <Card className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-600 transition-all shadow-xs ${className}`}>
      <CardContent className="p-5 space-y-3.5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                {patientCase.id}
              </span>
              <StatusBadge status={patientCase.status} />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1.5 flex items-center gap-2">
              <span>{patientCase.patientName}</span>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                ({patientCase.age} {txt.years}, {patientCase.gender})
              </span>
            </h4>
          </div>

          <div className="flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
            <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>{formatDate(patientCase.updatedAt)}</span>
          </div>
        </div>

        {/* Symptoms / Clinical Impression */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1 text-xs">
          <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
            <strong className="text-slate-950 dark:text-white font-bold">{txt.symptoms}</strong> {patientCase.primarySymptoms}
          </p>
          {patientCase.initialDiagnosisImpression && (
            <p className="text-teal-800 dark:text-teal-300 font-semibold pt-0.5">
              <strong>{txt.clinicalAssessment}</strong> {patientCase.initialDiagnosisImpression}
            </p>
          )}
        </div>

        {/* Vitals summary */}
        {patientCase.vitals && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 bg-slate-50/80 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-600 dark:text-slate-400 uppercase font-semibold block">{txt.bp}</span>
              <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">{patientCase.vitals.bp}</span>
            </div>
            <div className="p-2.5 bg-slate-50/80 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-600 dark:text-slate-400 uppercase font-semibold block">{txt.pulse}</span>
              <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">{patientCase.vitals.pulse}</span>
            </div>
            <div className="p-2.5 bg-slate-50/80 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-600 dark:text-slate-400 uppercase font-semibold block">{txt.spo2}</span>
              <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">{patientCase.vitals.spo2}</span>
            </div>
            <div className="p-2.5 bg-slate-50/80 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-600 dark:text-slate-400 uppercase font-semibold block">{txt.temp}</span>
              <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">{patientCase.vitals.temp}</span>
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-400">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>{patientCase.documentsCount || 0} {txt.records}</span>
          </div>

          {onViewDetail && (
            <Button
              size="sm"
              variant="subtle"
              className="text-xs h-7 gap-1"
              onClick={() => onViewDetail(patientCase)}
            >
              <span>{txt.reviewCase}</span>
              <ArrowRight className="w-3 h-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default CaseSummaryCard;
