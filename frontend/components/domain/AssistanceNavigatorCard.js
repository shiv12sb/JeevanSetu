"use client";

import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import {
  HeartHandshake,
  ExternalLink,
  Sparkles,
} from "lucide-react";

export function AssistanceNavigatorCard({
  caseId = "JVS-MH-7A82K1",
  pathways = [
    {
      provider: "Ayushman Bharat PM-JAY",
      type: "Government Health Scheme",
      status: "Eligible & Pre-Authorized",
      coverageSummary: "100% Cashless secondary hospitalization and cardiology workup up to ₹5 Lakhs.",
      whyRelevant: "Patient's rural BPL category qualifies for empanelled district and medical college hospitals.",
      actionUrl: "/resources?tab=schemes",
    },
    {
      provider: "Gramin Arogya Sahayog Trust",
      type: "Verified NGO Grant",
      status: "Transit Grant Available",
      coverageSummary: "Emergency patient van transit subsidy and meal tokens for attendant.",
      whyRelevant: "Local NGO assistance fund covers distance-based rural ambulance travel costs.",
      actionUrl: "/resources?tab=ngos",
    },
  ],
}) {
  return (
    <Card className="border-teal-200 dark:border-teal-800 shadow-xs overflow-hidden bg-white dark:bg-slate-900">
      <CardHeader className="bg-gradient-to-r from-teal-700 via-teal-800 to-indigo-900 dark:from-teal-950 dark:via-slate-900 dark:to-slate-950 text-white p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-teal-300" />
              <CardTitle className="text-base font-bold text-white">
                Treatment Financial Assistance Navigator
              </CardTitle>
            </div>
            <p className="text-xs text-teal-100 dark:text-teal-200">
              Case Ref: <span className="font-mono text-white font-bold">{caseId}</span> • Potential Support Pathways
            </p>
          </div>
          <Badge variant="teal" size="sm" className="w-fit bg-teal-900/90 text-teal-100 border-teal-400/40 dark:bg-teal-800 dark:text-teal-100 font-bold">
            Verified Support
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 space-y-5">
        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
          JeevanSetu matches verified government assurance schemes and accredited non-profit aid to prevent out-of-pocket medical distress for rural families.
        </p>

        {/* Pathways List */}
        <div className="space-y-3.5">
          {pathways.map((path, idx) => (
            <div
              key={idx}
              className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200/90 dark:border-slate-700 space-y-2 hover:border-teal-300 dark:hover:border-teal-600 transition-all"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-teal-600 dark:bg-teal-400"></div>
                  <strong className="text-xs sm:text-sm text-slate-900 dark:text-white font-bold">{path.provider}</strong>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-200/80 dark:bg-slate-700 px-2 py-0.5 rounded font-medium">
                    {path.type}
                  </span>
                </div>
                <Badge variant="success" size="sm">
                  {path.status}
                </Badge>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                {path.coverageSummary}
              </p>

              {/* Transparent "Why this may be relevant" grounding */}
              <div className="p-2.5 bg-teal-50/70 dark:bg-teal-950/60 rounded-lg border border-teal-100 dark:border-teal-800 text-xs text-teal-900 dark:text-teal-200 space-y-0.5">
                <span className="font-bold flex items-center gap-1 text-[11px] text-teal-950 dark:text-teal-200">
                  <Sparkles className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                  Why this is relevant:
                </span>
                <p className="text-[11px] text-teal-800 dark:text-teal-300 leading-relaxed">{path.whyRelevant}</p>
              </div>

              {path.actionUrl && (
                <div className="flex justify-end pt-1">
                  <Link href={path.actionUrl}>
                    <Button size="sm" variant="outline" className="text-xs gap-1 py-1">
                      <span>View Scheme / Aid Details</span>
                      <ExternalLink className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <Alert variant="info" className="text-xs py-3">
          <strong>Official Verification Required:</strong> JeevanSetu provides pathway navigation. Final eligibility and approvals are decided by the hospital Ayushman Mitra desk and respective scheme administrators.
        </Alert>
      </CardContent>
    </Card>
  );
}

export default AssistanceNavigatorCard;
