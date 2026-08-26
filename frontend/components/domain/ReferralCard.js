import React from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { StatusTimeline } from "@/components/shared/StatusTimeline";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Building2, ArrowRight, Shield, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

export function ReferralCard({ referral, onViewDetail, className = "" }) {
  if (!referral) return null;

  return (
    <Card className={`hover:border-slate-300 dark:hover:border-slate-700 transition-all ${className}`}>
      <CardContent className="p-5 space-y-4">
        {/* Referral Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                {referral.id}
              </span>
              <StatusBadge status={referral.currentStage} />
              {referral.priority === "urgent" && (
                <span className="text-[11px] bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 font-semibold px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800">
                  Urgent Priority
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
                  className="text-[10px] uppercase font-mono"
                >
                  {referral.followUpStatus.replace(/_/g, " ")}
                </Badge>
              )}
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
              <span>{referral.patientName}</span>
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                ({referral.patientAge}y, {referral.patientGender})
              </span>
            </h4>
          </div>

          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            Initiated {formatDate(referral.createdAt)}
          </span>
        </div>

        {/* Next Expected Milestone Info */}
        {referral.nextMilestone && (
          <div className="p-2.5 bg-sky-50/70 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-800 rounded-lg flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-sky-900 dark:text-sky-200 font-medium">
              <Clock className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>Next Expected Milestone: <strong>{referral.nextMilestone}</strong></span>
            </div>
            {referral.dueAt && (
              <span className="text-[11px] text-sky-700 dark:text-sky-300 font-semibold">
                Due: {formatDate(referral.dueAt)}
              </span>
            )}
          </div>
        )}

        {/* Transfer Facilities Node */}
        <div className="p-3.5 bg-slate-50/90 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              From (Referring Facility)
            </span>
            <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
              {referral.fromFacility}
            </p>
          </div>

          <div className="hidden sm:flex items-center justify-center text-slate-400 dark:text-slate-500">
            <ArrowRight className="w-4 h-4" />
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              To (Destination Facility)
            </span>
            <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
              {referral.toFacility}
            </p>
          </div>
        </div>

        {/* 6-Stage Timeline Tracker */}
        <div className="pt-2">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Referral Progress:
          </p>
          <StatusTimeline
            currentStage={referral.currentStage}
            steps={referral.steps}
          />
        </div>

        {/* Bottom Bar with Scheme details and Action */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
            <Shield className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Scheme: <strong className="text-slate-800 dark:text-slate-200">{referral.schemeAssistanceApplied || "Not Applied"}</strong></span>
          </div>

          {onViewDetail && (
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-8 gap-1"
              onClick={() => onViewDetail(referral)}
            >
              <span>View Case & Follow-Up</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default ReferralCard;
