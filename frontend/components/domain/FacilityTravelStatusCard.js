"use client";

import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/context/LanguageContext";
import {
  Stethoscope,
  Pill,
  Activity,
  GitPullRequest,
  Clock,
  ArrowRight,
  ShieldCheck,
  FileCheck,
} from "lucide-react";

export function FacilityTravelStatusCard({ facility, onOpenChecklist }) {
  const { t } = useLanguage();
  if (!facility || !facility.travelStatus) return null;

  const {
    doctorStatus,
    doctorStatusText,
    medicineStockStatus,
    medicineStatusText,
    diagnosticStatus,
    diagnosticStatusText,
    referralAcceptanceStatus,
    referralAcceptanceText,
    lastVerified,
  } = facility.travelStatus;

  const getStatusBadge = (status) => {
    switch (status) {
      case "available":
      case "sufficient":
        return <Badge variant="success" size="sm">🟢 {t("statusAvailable", "Available")}</Badge>;
      case "limited":
      case "depleting":
      case "needs_verification":
        return <Badge variant="warning" size="sm">🟡 {t("statusLimited", "Needs Verification")}</Badge>;
      case "unavailable":
      case "stockout":
      case "busy":
        return <Badge variant="danger" size="sm">🔴 {t("statusUnavailable", "Unavailable")}</Badge>;
      default:
        return <Badge variant="default" size="sm">⚪ Check with Facility</Badge>;
    }
  };

  return (
    <Card className="border-teal-200 dark:border-teal-800 shadow-xs hover:shadow-sm transition-all overflow-hidden">
      {/* Header */}
      <CardHeader className="bg-linear-to-r from-teal-900 to-slate-900 text-white p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <CardTitle className="text-sm font-bold text-white">
                {t("checkBeforeTravelHeading", "Check Before You Travel")}
              </CardTitle>
            </div>
            <p className="text-xs text-teal-200 mt-0.5 font-medium">{facility.name}</p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-teal-300 bg-teal-800/60 px-2.5 py-1 rounded-full border border-teal-700 w-fit">
            <Clock className="w-3 h-3" />
            <span>{lastVerified}</span>
          </div>
        </div>
      </CardHeader>

      {/* Grid of 4 Key Checks */}
      <CardContent className="p-4 sm:p-5 space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* 1. Doctor Availability */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                {t("doctorOnDuty", "Doctor on Duty")}
              </span>
              {getStatusBadge(doctorStatus)}
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">{doctorStatusText}</p>
          </div>

          {/* 2. Essential Medicines */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Pill className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                {t("emergencyMeds", "Emergency Medicines")}
              </span>
              {getStatusBadge(medicineStockStatus)}
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">{medicineStatusText}</p>
          </div>

          {/* 3. Diagnostic Services */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                {t("diagnosticsLab", "Diagnostics & Pathology Lab")}
              </span>
              {getStatusBadge(diagnosticStatus)}
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">{diagnosticStatusText}</p>
            <div className="pt-1 flex flex-wrap gap-1 text-[10px]">
              <span className="bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 px-1.5 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                ✓ Rapid Malaria/Dengue RDT
              </span>
              <span className="bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 px-1.5 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                ✓ ECG & Blood Sugar
              </span>
              <span className="bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                OPD Lab: 9am-2pm
              </span>
            </div>
          </div>

          {/* 4. Referral Intake */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <GitPullRequest className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                {t("referralDesk", "Referral Intake Desk")}
              </span>
              {getStatusBadge(referralAcceptanceStatus)}
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">{referralAcceptanceText}</p>
            <div className="pt-1 flex flex-wrap gap-1 text-[10px]">
              <span className="bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                ✓ PM-JAY Ayushman Mitra
              </span>
              <span className="bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                ✓ MJPJAY Desk Active
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 italic">
            *Always confirm with facility phone/helpline before emergency transit.
          </span>
          <div className="flex items-center gap-2">
            {onOpenChecklist && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onOpenChecklist(facility)}
                className="text-xs gap-1"
              >
                <FileCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>{t("visitChecklistBtn", "Visit Checklist")}</span>
              </Button>
            )}
            <Link href="/referrals">
              <Button size="sm" className="text-xs bg-teal-600 hover:bg-teal-700 text-white gap-1">
                <span>{t("startReferralBtn", "Start Referral")}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default FacilityTravelStatusCard;
