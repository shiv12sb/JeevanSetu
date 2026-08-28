"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "@/context/LocationContext";
import { LocationSelector } from "@/components/shared/LocationSelector";
import {
  HelpCircle,
  Building2,
  Pill,
  Activity,
  HeartHandshake,
  GitPullRequest,
  Heart,
  FileText,
  PhoneCall,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertOctagon,
  User,
  Users,
  Compass,
  CheckCircle2,
  MapPin,
} from "lucide-react";

export function NeedsNavigator({ isEmbedded = false }) {
  const { language, t } = useLanguage();
  const { selectedDistrict, currentDistrictObj, getFilteredFacilities } = useLocation();
  const [selectedNeed, setSelectedNeed] = useState(null);
  const [caregiverMode, setCaregiverMode] = useState("myself");
  const [isSimpleMode, setIsSimpleMode] = useState(false);

  const localFacilities = getFilteredFacilities();

  const needsList = [
    {
      id: "medical_help",
      titleKey: "need_medical_help",
      descKey: "need_medical_help_desc",
      icon: Activity,
      category: "Care Access",
      badgeVariant: "teal",
      pathway: [
        { label: "Step 1: Open Healthcare Case", route: "/cases" },
        { label: "Step 2: Check Local PHC Status", route: "/resources" },
        { label: "Step 3: Track Follow-up / Referral", route: "/referrals" },
      ],
      primaryAction: { label: "Open Health Case", route: "/cases" },
      secondaryAction: { label: "Find Nearest PHC", route: "/resources" },
    },
    {
      id: "find_hospital",
      titleKey: "need_hospital",
      descKey: "need_hospital_desc",
      icon: Building2,
      category: "Facility Discovery",
      badgeVariant: "info",
      pathway: [
        { label: "Step 1: Check Before You Travel", route: "/resources" },
        { label: "Step 2: Verify Scheme Empanelment", route: "/resources" },
        { label: "Step 3: Prepare Travel Checklist", route: "/referrals" },
      ],
      primaryAction: { label: "Check Before You Travel", route: "/resources" },
      secondaryAction: { label: "View Hospital Directory", route: "/resources" },
    },
    {
      id: "medicine_stock",
      titleKey: "need_medicine",
      descKey: "need_medicine_desc",
      icon: Pill,
      category: "PHC Inventory",
      badgeVariant: "warning",
      pathway: [
        { label: "Step 1: Check PHC Inventory Status", route: "/inventory" },
        { label: "Step 2: Find Alternative District Depot", route: "/resources" },
      ],
      primaryAction: { label: "Check Medicine Stock", route: "/inventory" },
      secondaryAction: { label: "Ask AI Assistant", route: "/assistant" },
    },
    {
      id: "financial_assistance",
      titleKey: "need_financial",
      descKey: "need_financial_desc",
      icon: HeartHandshake,
      category: "Schemes & Grants",
      badgeVariant: "success",
      pathway: [
        { label: "Step 1: Match Government Scheme", route: "/resources" },
        { label: "Step 2: Connect with Verified NGO Aid", route: "/resources" },
        { label: "Step 3: Visit Ayushman Mitra Counter", route: "/cases" },
      ],
      primaryAction: { label: "Explore Schemes & Grants", route: "/resources" },
      secondaryAction: { label: "View Assistance Navigator", route: "/cases" },
    },
    {
      id: "referral_tracking",
      titleKey: "need_referral",
      descKey: "need_referral_desc",
      icon: GitPullRequest,
      category: "Coordination",
      badgeVariant: "teal",
      pathway: [
        { label: "Step 1: Check Referral Status", route: "/referrals" },
        { label: "Step 2: Confirm Hospital Acceptance", route: "/referrals" },
        { label: "Step 3: Check Documents to Carry", route: "/referrals" },
      ],
      primaryAction: { label: "Track Referral Live", route: "/referrals" },
      secondaryAction: { label: "Travel Checklist", route: "/referrals" },
    },
    {
      id: "organ_donation",
      titleKey: "need_organ",
      descKey: "need_organ_desc",
      icon: Heart,
      category: "Public Service",
      badgeVariant: "danger",
      pathway: [
        { label: "Step 1: Learn Donation Process", route: "/organ-donation" },
        { label: "Step 2: Discuss with Family", route: "/organ-donation" },
        { label: "Step 3: Official Pledge Pathway", route: "/organ-donation" },
      ],
      primaryAction: { label: "Organ Donation Guide", route: "/organ-donation" },
      secondaryAction: { label: "Transplant Information", route: "/organ-donation" },
    },
    {
      id: "document_help",
      titleKey: "need_document",
      descKey: "need_document_desc",
      icon: FileText,
      category: "Educational",
      badgeVariant: "info",
      pathway: [
        { label: "Step 1: Learn Medical Terminology", route: "/assistant" },
        { label: "Step 2: Review Case Summary", route: "/cases" },
        { label: "Step 3: Consult PHC Doctor", route: "/resources" },
      ],
      primaryAction: { label: "Explain Medical Terms", route: "/assistant" },
      secondaryAction: { label: "View Health Cases", route: "/cases" },
    },
    {
      id: "call_assistance",
      titleKey: "need_call",
      descKey: "need_call_desc",
      icon: PhoneCall,
      category: "Inclusive Access",
      badgeVariant: "teal",
      pathway: [
        { label: "Emergency Ambulance: Call 108", route: "/call-assistance" },
        { label: "Health Helpline: Call 104", route: "/call-assistance" },
        { label: "Regional Language Support", route: "/call-assistance" },
      ],
      primaryAction: { label: "View Phone Helplines", route: "/call-assistance" },
      secondaryAction: { label: "Give Feedback", route: "/feedback" },
    },
  ];

  const activeNeed = needsList.find((n) => n.id === selectedNeed);

  return (
    <div className="space-y-6 text-left">
      {/* Header & Controls */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-7 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0" />
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                {t("navigatorHeading", "How Can We Help You Today?")}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-normal">
              {t("navigatorSubheading", "Select your immediate healthcare need to receive a step-by-step navigation pathway.")}
            </p>
          </div>

          {/* Simple Mode Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsSimpleMode(!isSimpleMode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                isSimpleMode
                  ? "bg-teal-600 text-white border-teal-600 shadow-xs"
                  : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              {isSimpleMode ? `✓ ${t("simpleViewActive", "Simple View Active")}` : t("enableSimpleView", "Enable Simple View")}
            </button>
          </div>
        </div>

        {/* Caregiver Selector */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-slate-700 dark:text-slate-300">{t("seekingHelpFor", "Seeking help for:")}</span>
          <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setCaregiverMode("myself")}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                caregiverMode === "myself" ? "bg-white dark:bg-slate-700 text-teal-800 dark:text-teal-300 shadow-2xs font-bold" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              {t("forMyself", "For Myself")}
            </button>
            <button
              type="button"
              onClick={() => setCaregiverMode("family")}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                caregiverMode === "family" ? "bg-white dark:bg-slate-700 text-teal-800 dark:text-teal-300 shadow-2xs font-bold" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              {t("forFamily", "For Family Member")}
            </button>
            <button
              type="button"
              onClick={() => setCaregiverMode("dependent")}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                caregiverMode === "dependent" ? "bg-white dark:bg-slate-700 text-teal-800 dark:text-teal-300 shadow-2xs font-bold" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              {t("forDependent", "For Someone I Care For")}
            </button>
          </div>
        </div>

        {/* Dynamic Location Awareness Strip */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs bg-slate-50/60 dark:bg-slate-800/40 p-2.5 rounded-xl">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Active District: <strong className="text-slate-900 dark:text-white">{selectedDistrict} ({currentDistrictObj?.marathiName || ""})</strong>
            </span>
            <span className="text-[11px] text-teal-700 dark:text-teal-400 font-medium hidden sm:inline">
              • Showing {localFacilities.length} local verified health centers
            </span>
          </div>

          <LocationSelector />
        </div>
      </div>

      {/* Grid of Needs - Pure Single Language Display */}
      <div className={`grid gap-4 ${isSimpleMode ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"}`}>
        {needsList.map((item) => {
          const Icon = item.icon;
          const isSelected = selectedNeed === item.id;
          const translatedTitle = t(item.titleKey, item.titleKey);
          const translatedDesc = t(item.descKey, item.descKey);

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedNeed(isSelected ? null : item.id)}
              className={`p-4 sm:p-5 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-3 min-h-[175px] cursor-pointer ${
                isSelected
                  ? "bg-teal-50 dark:bg-teal-950/60 border-teal-600 dark:border-teal-400 shadow-md ring-2 ring-teal-600/20"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs hover:border-teal-300 dark:hover:border-teal-600 hover:shadow-xs"
              } ${isSimpleMode ? "py-6 min-h-[190px]" : ""}`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className={`rounded-xl flex items-center justify-center ${
                    isSimpleMode ? "w-12 h-12 bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300" : "w-9 h-9 bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-100 dark:border-teal-800"
                  }`}>
                    <Icon className={isSimpleMode ? "w-6 h-6" : "w-5 h-5"} />
                  </div>
                  <Badge variant={item.badgeVariant} size="sm">{item.category}</Badge>
                </div>
                <h3 className={`font-bold text-slate-900 dark:text-white leading-snug min-h-[38px] ${isSimpleMode ? "text-base min-h-[48px]" : "text-xs sm:text-sm"}`}>
                  {translatedTitle}
                </h3>
                {!isSimpleMode && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-normal min-h-[32px]">
                    {translatedDesc}
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100/80 dark:border-slate-800 flex items-center justify-between text-xs text-teal-700 dark:text-teal-300 font-semibold">
                <span>{isSelected ? "Pathway Open" : "Get Action Steps"}</span>
                <ArrowRight className={`w-3.5 h-3.5 transition-transform shrink-0 ${isSelected ? "rotate-90 text-teal-800 dark:text-teal-300" : ""}`} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Need Recommended Pathway Action Card */}
      {activeNeed && (
        <Card className="border-teal-300 dark:border-teal-800 bg-linear-to-b from-teal-50/50 dark:from-teal-950/40 via-white dark:via-slate-900 to-white dark:to-slate-900 shadow-md animate-in fade-in zoom-in-95 duration-150 text-left">
          <CardHeader className="border-b border-teal-100 dark:border-teal-800 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <Badge variant="teal" size="sm" className="w-fit">{t("recommendedPathway", "Recommended Healthcare Pathway")}</Badge>
                <CardTitle className="text-base sm:text-lg text-slate-900 dark:text-white font-black leading-snug">
                  {t(activeNeed.titleKey, activeNeed.titleKey)}
                </CardTitle>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedNeed(null)}
                className="text-xs text-slate-500 dark:text-slate-400 self-start sm:self-auto"
              >
                {t("closePathway", "Close Pathway ✕")}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-5 sm:p-6 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
                {t("recommendedActionSteps", "Recommended Action Steps:")}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {activeNeed.pathway.map((step, idx) => (
                  <Link
                    key={idx}
                    href={step.route}
                    className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-teal-200 dark:border-teal-800 shadow-2xs hover:border-teal-400 dark:hover:border-teal-600 hover:bg-teal-50/40 dark:hover:bg-slate-700/50 transition-all flex items-center justify-between group"
                  >
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-teal-900 dark:group-hover:text-teal-300 leading-snug">
                      {step.label}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 group-hover:translate-x-0.5 transition-transform shrink-0 ml-2" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <strong className="text-slate-900 dark:text-white block">{t("directAction", "Direct Healthcare Action")}</strong>
                <span className="text-slate-600 dark:text-slate-400">Access the primary tool matching your selected requirement.</span>
              </div>
              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                <Link href={activeNeed.primaryAction.route} className="w-full sm:w-auto">
                  <Button size="sm" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold gap-1 text-xs justify-center">
                    <span>{activeNeed.primaryAction.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  </Button>
                </Link>
                <Link href={activeNeed.secondaryAction.route} className="w-full sm:w-auto">
                  <Button size="sm" variant="outline" className="w-full text-xs justify-center">
                    {activeNeed.secondaryAction.label}
                  </Button>
                </Link>
              </div>
            </div>

            <Alert variant="safety" className="text-xs py-2.5">
              <strong>{t("navigationNotice", "Navigation Notice: This pathway provides public healthcare guidance. It is not an AI medical diagnosis or prescription. In life-threatening emergencies, call 108 immediately.")}</strong>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default NeedsNavigator;
