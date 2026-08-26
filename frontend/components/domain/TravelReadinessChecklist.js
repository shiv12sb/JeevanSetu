"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { useLanguage } from "@/context/LanguageContext";
import {
  CheckCircle2,
  FileText,
  Luggage,
  AlertTriangle,
} from "lucide-react";

export function TravelReadinessChecklist({
  caseId = "JVS-MH-7A82K1",
  facilityName = "District Civil Hospital Gadchiroli",
}) {
  const { t } = useLanguage();

  const defaultItems = [
    {
      id: "doc-1",
      name: `JeevanSetu Referral Printout / Case ID (${caseId})`,
      category: "required",
      checked: true,
      note: "Present at Ayushman Mitra or Referral Counter upon arrival.",
    },
    {
      id: "doc-2",
      name: "Patient Aadhaar Card (Original or Copy)",
      category: "required",
      checked: true,
      note: "Mandatory for government portal entry and cashless empanelment.",
    },
    {
      id: "doc-3",
      name: "Ration Card (Yellow / BPL / AAY Card)",
      category: "required",
      checked: true,
      note: "Required to verify PM-JAY / MJPJAY scheme eligibility.",
    },
    {
      id: "doc-4",
      name: "Previous PHC Prescription & Vitals Slip",
      category: "recommended",
      checked: true,
      note: "Helps the specialist understand previous treatment history.",
    },
    {
      id: "doc-5",
      name: "All Current Medicine Strips / Bottles",
      category: "recommended",
      checked: false,
      note: "Bring existing tablets so the hospital doctor knows active dosages.",
    },
    {
      id: "doc-6",
      name: "Previous X-Ray / ECG / Lab Reports",
      category: "recommended",
      checked: false,
      note: "Prevents unnecessary duplicate tests at the district hospital.",
    },
  ];

  const [items, setItems] = useState(defaultItems);

  const toggleItem = (id) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const checkedCount = items.filter((i) => i.checked).length;
  const totalCount = items.length;
  const progressPercent = Math.round((checkedCount / totalCount) * 100);

  return (
    <Card className="border-teal-200 dark:border-teal-800 shadow-xs overflow-hidden bg-white dark:bg-slate-900">
      {/* Header */}
      <CardHeader className="bg-linear-to-r from-teal-900 to-slate-900 text-white p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Luggage className="w-5 h-5 text-teal-400" />
              <CardTitle className="text-base font-bold text-white">
                {t("travelChecklistHeading", "Don't Make Me Travel Twice — Travel Checklist")}
              </CardTitle>
            </div>
            <p className="text-xs text-teal-200">
              Target Facility: <strong className="text-white">{facilityName}</strong> • Case Ref: <span className="font-mono">{caseId}</span>
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-teal-200 block">{t("readinessProgress", "Readiness Progress")}</span>
            <span className="text-lg font-black text-white">{checkedCount} / {totalCount} Ready ({progressPercent}%)</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 space-y-6">
        {/* Pathway sequence overview */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
          <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px] block">
            Referral Journey Confirmation:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 rounded-lg border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Referral Created</span>
            </div>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 rounded-lg border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Facility Confirmed</span>
            </div>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 rounded-lg border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Service Active</span>
            </div>
            <div className={`p-2 rounded-lg border font-semibold flex items-center gap-1.5 ${progressPercent === 100 ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200" : "bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200"}`}>
              {progressPercent === 100 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />}
              <span>Documents Ready</span>
            </div>
          </div>
        </div>

        {/* What Do I Need To Carry? Interactive Checklist */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>{t("whatToCarry", "What Do I Need To Carry? (Document Checklist)")}</span>
            </h4>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">{t("tapToMark", "Tap items to mark as packed")}</span>
          </div>

          <div className="space-y-2.5">
            {items.map((item) => (
              <label
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                  item.checked
                    ? "bg-teal-50/60 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800 text-slate-900 dark:text-white"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => {}}
                  className="mt-0.5 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                />
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className={`text-xs font-bold ${item.checked ? "text-teal-950 dark:text-teal-200" : "text-slate-800 dark:text-slate-200"}`}>
                      {item.name}
                    </span>
                    <Badge
                      variant={item.category === "required" ? "danger" : "info"}
                      size="sm"
                    >
                      {item.category === "required" ? t("requiredByFacility", "Required by Facility") : t("recommendedIfAvailable", "Recommended if Available")}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.note}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Safety Note */}
        <Alert variant="info" className="text-xs py-3">
          <strong>Avoid Unnecessary Trips:</strong> Always ensure the patient carries primary identification (Aadhaar/Ration card) and existing doctor notes. For government cashless scheme processing, original ration cards are verified at the hospital desk.
        </Alert>
      </CardContent>
    </Card>
  );
}

export default TravelReadinessChecklist;
