"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { StatusTimeline } from "@/components/shared/StatusTimeline";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Building2, ArrowRight, Shield, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

const REFERRAL_CARD_TEXTS = {
  en: {
    urgentPriority: "Urgent Priority",
    initiated: "Initiated",
    nextMilestone: "Next Expected Milestone:",
    due: "Due:",
    fromFacility: "From (Referring Facility)",
    toFacility: "To (Destination Facility)",
    referralProgress: "Referral Progress:",
    scheme: "Scheme:",
    notApplied: "Not Applied",
    viewCase: "View Case & Follow-Up",
    years: "y",
  },
  hi: {
    urgentPriority: "अति-आवश्यक प्राथमिकता",
    initiated: "शुरू हुआ",
    nextMilestone: "अगला अपेक्षित चरण:",
    due: "देय:",
    fromFacility: "मूल स्वास्थ्य केंद्र (रेफरल स्रोत)",
    toFacility: "गंतव्य अस्पताल (उपचार केंद्र)",
    referralProgress: "रेफरल प्रगति:",
    scheme: "शासकीय योजना:",
    notApplied: "लागू नहीं",
    viewCase: "केस विवरण एवं फॉलो-अप",
    years: "वर्ष",
  },
  mr: {
    urgentPriority: "अति-तात्काळ प्राधान्य",
    initiated: "नोंदणी तारीख",
    nextMilestone: "पुढील अपेक्षित टप्पा:",
    due: "देय:",
    fromFacility: "मूळ आरोग्य केंद्र (संदर्भ देणारे)",
    toFacility: "गंतव्य रुग्णालय (उपचार घेणारे)",
    referralProgress: "रेफरल प्रगती:",
    scheme: "शासकीय योजना:",
    notApplied: "लागू नाही",
    viewCase: "केस तपशील व पाठपुरावा",
    years: "वर्षे",
  },
};

export function ReferralCard({ referral, onViewDetail, className = "" }) {
  const { language } = useLanguage();
  const txt = REFERRAL_CARD_TEXTS[language] || REFERRAL_CARD_TEXTS.en;

  if (!referral) return null;

  return (
    <Card className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-600 transition-all shadow-xs ${className}`}>
      <CardContent className="p-5 space-y-4">
        {/* Referral Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                {referral.id}
              </span>
              <StatusBadge status={referral.currentStage} />
              {referral.priority === "urgent" && (
                <span className="text-[11px] bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-800">
                  {txt.urgentPriority}
                </span>
              )}
              {referral.followUpStatus && referral.followUpStatus !== "NOT_REQUIRED" && (
                <Badge
                  variant={
                    referral.followUpStatus === "ESCALATED"
                      ? "danger"
                      : referral.followUpStatus === "OVERDUE"
                      ? "danger"
                      : referral.followUpStatus === "FOLLOW_UP_DUE"
                      ? "warning"
                      : "teal"
                  }
                  size="sm"
                  className="text-[10px] uppercase font-mono font-bold"
                >
                  {referral.followUpStatus.replace(/_/g, " ")}
                </Badge>
              )}
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1.5 flex items-center gap-2">
              <span>{referral.patientName}</span>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                ({referral.patientAge} {txt.years}, {referral.patientGender})
              </span>
            </h4>
          </div>

          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
            {txt.initiated} {formatDate(referral.createdAt)}
          </span>
        </div>

        {/* Next Expected Milestone Info */}
        {referral.nextMilestone && (
          <div className="p-2.5 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-sky-950 dark:text-sky-200 font-medium">
              <Clock className="w-3.5 h-3.5 text-sky-700 dark:text-sky-400" />
              <span>{txt.nextMilestone} <strong className="font-bold">{referral.nextMilestone}</strong></span>
            </div>
            {referral.dueAt && (
              <span className="text-[11px] text-sky-800 dark:text-sky-300 font-bold">
                {txt.due} {formatDate(referral.dueAt)}
              </span>
            )}
          </div>
        )}

        {/* Transfer Facilities Node */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              {txt.fromFacility}
            </span>
            <p className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
              {referral.fromFacility}
            </p>
          </div>

          <div className="hidden sm:flex items-center justify-center text-slate-400 dark:text-slate-500">
            <ArrowRight className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              {txt.toFacility}
            </span>
            <p className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
              {referral.toFacility}
            </p>
          </div>
        </div>

        {/* 6-Stage Timeline Tracker */}
        <div className="pt-2">
          <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
            {txt.referralProgress}
          </p>
          <StatusTimeline
            currentStage={referral.currentStage}
            steps={referral.steps}
          />
        </div>

        {/* Bottom Bar with Scheme details and Action */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <Shield className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>{txt.scheme} <strong className="text-slate-950 dark:text-slate-100 font-bold">{referral.schemeAssistanceApplied || txt.notApplied}</strong></span>
          </div>

          {onViewDetail && (
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-8 gap-1"
              onClick={() => onViewDetail(referral)}
            >
              <span>{txt.viewCase}</span>
              <ArrowRight className="w-3 h-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default ReferralCard;
