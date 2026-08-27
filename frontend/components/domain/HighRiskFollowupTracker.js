"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/context/LanguageContext";
import {
  Baby,
  HeartPulse,
  Activity,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  Pill,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

export function HighRiskFollowupTracker({
  patientName = "Smt. Sunita Patil",
  mcpCardNumber = "MCP-MH-2026-89104",
  className = "",
}) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("maternal");

  // 1. Maternal ANC Milestones (JSSK / PMMVY)
  const maternalMilestones = [
    {
      id: "anc-1",
      title: "1st Trimester ANC (Registration & Td-1)",
      timing: "Within 12 Weeks",
      status: "completed",
      date: "14 Jan 2026",
      details: "Blood grouping, Hemoglobin (11.2 g/dL), Urine routine, and Folic Acid tablets issued.",
      scheme: "PMMVY 1st Installment (₹3,000) Processed",
    },
    {
      id: "anc-2",
      title: "2nd Trimester ANC (Ultrasound & IFA)",
      timing: "14 - 26 Weeks",
      status: "completed",
      date: "18 Feb 2026",
      details: "Anomaly scan verified, Td-2 given, Iron Folic Acid (100 tablets) dispensed.",
      scheme: "Free JSSK Diagnostics at District Civil Hospital",
    },
    {
      id: "anc-3",
      title: "3rd Trimester ANC (High-Risk Screening)",
      timing: "28 - 34 Weeks",
      status: "due",
      date: "Due in 5 Days (04 Mar 2026)",
      details: "BP monitoring (Pre-eclampsia check), Blood Sugar, Fetal Heart Rate check.",
      scheme: "ASHA Home Visit Scheduled",
    },
    {
      id: "anc-4",
      title: "Institutional Delivery & Transit Plan",
      timing: "36 - 40 Weeks",
      status: "upcoming",
      date: "Expected Delivery: 22 Apr 2026",
      details: "Designated Delivery Facility: District Civil Hospital Gadchiroli.",
      scheme: "100% Free Delivery, Food, & 102 Ambulance under JSSK",
    },
  ];

  // 2. Child Immunization & Nutrition Tracker (National Immunization Schedule)
  const childMilestones = [
    {
      id: "imm-1",
      title: "Birth Dose (BCG, OPV-0, Hepatitis B-0)",
      timing: "At Birth (0-24 hrs)",
      status: "completed",
      date: "Recorded at PHC Delivery",
      details: "Zero-dose polio drops, BCG intradermal injection, and Birth dose Hep-B.",
    },
    {
      id: "imm-2",
      title: "Primary 6-Week Dose (Pentavalent-1, Rota-1, fIPV-1)",
      timing: "6 Weeks",
      status: "completed",
      date: "Administered by ANM Worker",
      details: "Protection against Diphtheria, Pertussis, Tetanus, Hep-B, Hib & Rotavirus diarrhea.",
    },
    {
      id: "imm-3",
      title: "10 & 14-Week Boosters (Pentavalent 2 & 3, PCV)",
      timing: "10 to 14 Weeks",
      status: "due",
      date: "Due Next Routine Immunization Day",
      details: "Pneumococcal Conjugate Vaccine (PCV) booster & oral polio drops.",
    },
    {
      id: "imm-4",
      title: "9-Month Measles-Rubella (MR-1) & Vitamin A",
      timing: "9 Completed Months",
      status: "upcoming",
      date: "Scheduled Oct 2026",
      details: "First dose of MR vaccine with 1 mL Vitamin A oral solution to prevent blindness.",
    },
  ];

  // 3. Chronic Condition Care (Hypertension, Diabetes, TB)
  const chronicCareItems = [
    {
      id: "chr-1",
      condition: "Hypertension (High BP) Management",
      regimen: "Amlodipine 5mg (1 tab daily after breakfast)",
      lastRefill: "10 Feb 2026 at Ashti PHC",
      nextRefillDue: "10 Mar 2026 (12 Days remaining)",
      compliance: "Good (BP stable at 128/82 mmHg)",
      status: "active",
    },
    {
      id: "chr-2",
      condition: "Type 2 Diabetes Blood Sugar Monitoring",
      regimen: "Metformin 500mg (1 tab twice daily with meals)",
      lastRefill: "10 Feb 2026 at Ashti PHC",
      nextRefillDue: "10 Mar 2026 (12 Days remaining)",
      compliance: "Fasting Blood Sugar: 118 mg/dL",
      status: "active",
    },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return <Badge variant="success" size="sm" className="gap-1"><CheckCircle2 className="w-3 h-3" /> Completed</Badge>;
      case "due":
        return <Badge variant="warning" size="sm" className="gap-1"><Clock className="w-3 h-3" /> Due Soon</Badge>;
      case "upcoming":
        return <Badge variant="default" size="sm" className="gap-1"><Calendar className="w-3 h-3" /> Scheduled</Badge>;
      default:
        return <Badge variant="default" size="sm">{status}</Badge>;
    }
  };

  return (
    <Card className={`border-teal-200 dark:border-teal-800 shadow-xs bg-white dark:bg-slate-900 ${className}`}>
      {/* Header */}
      <CardHeader className="bg-linear-to-r from-teal-900 via-teal-850 to-slate-900 text-white p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <CardTitle className="text-base font-bold text-white">
                High-Risk Follow-Up & Maternal/Child Health Tracker
              </CardTitle>
            </div>
            <p className="text-xs text-teal-200">
              Beneficiary: <strong className="text-white">{patientName}</strong> • RCH/MCP Card: <span className="font-mono">{mcpCardNumber}</span>
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-1 bg-teal-950/80 p-1 rounded-xl border border-teal-700/80 text-xs w-fit">
            <button
              type="button"
              onClick={() => setActiveTab("maternal")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === "maternal"
                  ? "bg-teal-500 text-slate-950 shadow-2xs"
                  : "text-teal-200 hover:text-white"
              }`}
            >
              <Baby className="w-3.5 h-3.5" />
              <span>Maternal (ANC/JSSK)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("child")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === "child"
                  ? "bg-teal-500 text-slate-950 shadow-2xs"
                  : "text-teal-200 hover:text-white"
              }`}
            >
              <HeartPulse className="w-3.5 h-3.5" />
              <span>Child (Immunization)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("chronic")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === "chronic"
                  ? "bg-teal-500 text-slate-950 shadow-2xs"
                  : "text-teal-200 hover:text-white"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Chronic (NCD)</span>
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 space-y-4 text-xs">
        {/* Tab 1: Maternal Care (ANC & JSSK) */}
        {activeTab === "maternal" && (
          <div className="space-y-4">
            <div className="p-3.5 bg-sky-50 dark:bg-sky-950/50 rounded-xl border border-sky-200 dark:border-sky-800 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="font-bold text-sky-900 dark:text-sky-200 block text-xs">
                  Janani Shishu Suraksha Karyakram (JSSK) & PMMVY Active Enrollment
                </span>
                <p className="text-[11px] text-sky-700 dark:text-sky-300">
                  Guarantees 100% cashless delivery, free medicines, blood transfusion, and free 102 emergency ambulance transit.
                </p>
              </div>
              <a
                href="https://nhm.gov.in/index1.php?lang=1&level=2&sublinkid=822&lid=219"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-900 text-sky-800 dark:text-sky-300 font-bold rounded-lg border border-sky-300 dark:border-sky-700 text-[11px] hover:bg-sky-100 dark:hover:bg-slate-800 shrink-0"
              >
                <span>Govt Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Milestones Stepper */}
            <div className="space-y-3">
              {maternalMilestones.map((step, idx) => (
                <div
                  key={step.id}
                  className={`p-4 rounded-xl border transition-all ${
                    step.status === "completed"
                      ? "bg-slate-50/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                      : step.status === "due"
                      ? "bg-amber-50/70 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-slate-900 dark:text-white ring-1 ring-amber-300 dark:ring-amber-700"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-300 font-bold flex items-center justify-center text-xs">
                        {idx + 1}
                      </span>
                      <strong className="text-xs sm:text-sm text-slate-900 dark:text-white">{step.title}</strong>
                    </div>
                    {getStatusBadge(step.status)}
                  </div>

                  <div className="mt-2 pl-8 space-y-1">
                    <div className="flex items-center gap-3 text-[11px] text-slate-600 dark:text-slate-400">
                      <span><strong>Window:</strong> {step.timing}</span>
                      <span>•</span>
                      <span><strong>Date:</strong> {step.date}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      {step.details}
                    </p>
                    {step.scheme && (
                      <span className="inline-block text-[10px] font-semibold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/80 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800 mt-1">
                        ✓ {step.scheme}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Child Immunization */}
        {activeTab === "child" && (
          <div className="space-y-4">
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="font-bold text-emerald-900 dark:text-emerald-200 block text-xs">
                  National Universal Immunization Programme (UIP)
                </span>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                  Protects infants from 12 life-threatening diseases free of charge at all Anganwadis and PHCs.
                </p>
              </div>
              <Badge variant="success" size="sm">100% Free</Badge>
            </div>

            <div className="space-y-3">
              {childMilestones.map((imm, idx) => (
                <div
                  key={imm.id}
                  className={`p-4 rounded-xl border transition-all ${
                    imm.status === "completed"
                      ? "bg-slate-50/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                      : imm.status === "due"
                      ? "bg-amber-50/70 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-slate-900 dark:text-white ring-1 ring-amber-300 dark:ring-amber-700"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center text-xs">
                        {idx + 1}
                      </span>
                      <strong className="text-xs sm:text-sm text-slate-900 dark:text-white">{imm.title}</strong>
                    </div>
                    {getStatusBadge(imm.status)}
                  </div>

                  <div className="mt-2 pl-8 space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                      <span><strong>Schedule:</strong> {imm.timing}</span>
                      <span>•</span>
                      <span><strong>Status:</strong> {imm.date}</span>
                    </div>
                    <p className="leading-relaxed">{imm.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Chronic Condition Refill Tracking */}
        {activeTab === "chronic" && (
          <div className="space-y-4">
            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/50 rounded-xl border border-amber-200 dark:border-amber-800 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="font-bold text-amber-900 dark:text-amber-200 block text-xs">
                  Chronic NCD Medication Adherence (National Health Mission)
                </span>
                <p className="text-[11px] text-amber-700 dark:text-amber-300">
                  Continuous generic medication dispensing at rural PHCs to prevent hypertensive crisis and stroke.
                </p>
              </div>
              <Badge variant="warning" size="sm">Active Care</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {chronicCareItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white text-xs">{item.condition}</span>
                    <Badge variant="teal" size="sm">Refill Active</Badge>
                  </div>
                  <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                    <p><strong className="text-slate-800 dark:text-slate-200">Prescribed:</strong> {item.regimen}</p>
                    <p><strong className="text-slate-800 dark:text-slate-200">Last Dispensed:</strong> {item.lastRefill}</p>
                    <p><strong className="text-amber-700 dark:text-amber-300">Next Refill Due:</strong> {item.nextRefillDue}</p>
                    <p className="text-emerald-700 dark:text-emerald-400 font-semibold pt-1">✓ {item.compliance}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default HighRiskFollowupTracker;
