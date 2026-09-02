"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "@/context/LocationContext";
import { useLanguage } from "@/context/LanguageContext";
import { casesApi, referralsApi } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { SkeletonMetricCard, SkeletonCard } from "@/components/ui/Skeleton";
import { DashboardMetricCard } from "@/components/domain/DashboardMetricCard";
import { CaseSummaryCard } from "@/components/domain/CaseSummaryCard";
import { ReferralCard } from "@/components/domain/ReferralCard";
import { AIRecommendationCard } from "@/components/domain/AIRecommendationCard";
import { FacilityTravelStatusCard } from "@/components/domain/FacilityTravelStatusCard";
import { TravelReadinessChecklist } from "@/components/domain/TravelReadinessChecklist";
import { HighRiskFollowupTracker } from "@/components/domain/HighRiskFollowupTracker";
import {
  mockPatientCases,
  mockReferrals,
  mockAiRecommendations,
  mockHospitals,
} from "@/lib/mockData";
import {
  FileText,
  GitPullRequest,
  Sparkles,
  Building2,
  Plus,
  ArrowRight,
  ShieldCheck,
  Calendar,
  AlertCircle,
  Compass,
  Luggage,
  MapPin,
  Siren,
  Stethoscope,
  Truck,
  Bot,
} from "lucide-react";

export function PatientDashboardPage() {
  const { user } = useAuth();
  const { selectedDistrict, currentDistrictObj, getFilteredFacilities } = useLocation();
  const { t, language } = useLanguage();
  const [activeCase, setActiveCase] = useState(mockPatientCases[0]);
  const [activeReferral, setActiveReferral] = useState(mockReferrals[0]);
  const [isLoading, setIsLoading] = useState(true);
  const aiRecommendation = mockAiRecommendations[0];
  const destinationHospital = getFilteredFacilities()[0] || mockHospitals[0];

  const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        const casesRes = await casesApi.list({ limit: 1 });
        if (casesRes?.data && casesRes.data.length > 0) {
          const c = casesRes.data[0];
          setActiveCase({
            id: c.case_number || c.id,
            patientId: c.patient_id,
            patientName: user?.full_name || "Healthcare Citizen",
            caregiverRelationship: c.caregiver_mode || "myself",
            age: 45,
            gender: "Male",
            primarySymptoms: c.primary_concern,
            vitals: { bp: "120/80", pulse: "72 bpm", spo2: "98%", temp: "98.4 F" },
            initialDiagnosisImpression: c.category || "Clinical Intake",
            status: c.status || "open",
            phcName: c.phcs?.name || "Ashti Primary Health Centre",
            createdAt: c.created_at,
            updatedAt: c.updated_at,
            documentsCount: 1,
            notes: c.notes || "Case registered.",
            assistancePathways: mockPatientCases[0]?.assistancePathways || [],
          });
        }

        const refsRes = await referralsApi.list({ limit: 1 });
        if (refsRes?.data && refsRes.data.length > 0) {
          const r = refsRes.data[0];
          setActiveReferral({
            id: r.referral_number || r.id,
            caseId: r.case_id,
            patientName: user?.full_name || "Healthcare Citizen",
            patientAge: 45,
            patientGender: "Male",
            fromFacility: r.phcs?.name || "Ashti Primary Health Centre",
            toFacility: r.hospitals?.name || destinationHospital?.name || "District Civil Hospital Gadchiroli",
            department: r.required_specialty,
            priority: r.priority || "urgent",
            currentStage: r.status || "created",
            currentStageLabel: (r.status || "created").replace(/_/g, " ").toUpperCase(),
            createdAt: r.created_at,
            schemeAssistanceApplied: "Ayushman Bharat PM-JAY",
            steps: mockReferrals[0]?.steps || [],
          });
        }
      } catch (err) {
        console.warn("Dashboard live sync fallback:", err.message);
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboardData();
  }, [user, destinationHospital]);

  const userName = user?.full_name || user?.name || "Rameshwar Patil";
  const userLocation =
    language === "en"
      ? `📍 ${selectedDistrict} District • Matched Referral Hospital: ${destinationHospital?.name || "District Hospital"}`
      : language === "hi"
      ? `📍 ${selectedDistrict} जिला • संबद्ध रेफरल अस्पताल: ${destinationHospital?.name || "जिला अस्पताल"}`
      : `📍 ${selectedDistrict} जिल्हा (${currentDistrictObj?.marathiName || "महाराष्ट्र"}) • जोडलेले संदर्भ रुग्णालय: ${destinationHospital?.name || "जिल्हा रुग्णालय"}`;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-7 bg-gradient-to-r from-teal-700 via-teal-800 to-indigo-900 dark:from-slate-950 dark:via-teal-950/90 dark:to-slate-900 backdrop-blur-2xl rounded-3xl text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-teal-600/30 dark:border-teal-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-400/15 dark:bg-teal-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="space-y-1.5 text-left relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-100 dark:text-teal-300 bg-teal-900/90 dark:bg-teal-950/80 px-3 py-1 rounded-full font-mono border border-teal-400/30 dark:border-teal-500/30 shadow-xs">
              JeevanSetu Case ID: {activeCase.id}
            </span>
            <Badge variant="teal" size="sm" className="font-bold bg-teal-100 text-teal-900 dark:bg-teal-950/80 dark:text-teal-300 border-teal-300 dark:border-teal-700">
              {t("activeCare", "Active Care")}
            </Badge>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {language === "mr" ? "नमस्कार, " : language === "hi" ? "नमस्ते, " : "Namaste, "}
            {userName}
          </h2>
          <p className="text-xs sm:text-sm text-teal-50 dark:text-slate-300 font-medium">
            {userLocation}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap relative z-10">
          <Link href="/navigate">
            <Button size="sm" className="bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 text-slate-950 font-black gap-1.5 shadow-lg shadow-teal-900/30 text-xs rounded-2xl min-h-[42px] px-4">
              <Compass className="w-4 h-4 text-slate-950" />
              <span>{t("whatShouldIDo", "What Should I Do Now?")}</span>
            </Button>
          </Link>
          <Link href="/cases">
            <Button variant="outline" size="sm" className="text-white border-white/30 hover:bg-white/15 bg-white/10 backdrop-blur-md text-xs rounded-2xl min-h-[42px] px-4 font-bold">
              <Plus className="w-4 h-4 mr-1 text-teal-200" />
              <span>{t("newCaseBtn", "New Health Concern")}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Action Pills for 11 Healthcare Pillars */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href="/doctors"
          className="p-4 rounded-3xl bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 hover:border-indigo-500/50 hover:shadow-md hover:shadow-indigo-500/10 transition-all duration-300 flex items-center gap-3.5 text-left group shadow-xs"
        >
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">Find Doctor</p>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">MMC Verified</p>
          </div>
        </Link>

        <Link
          href="/ambulance"
          className="p-4 rounded-3xl bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 hover:border-rose-500/50 hover:shadow-md hover:shadow-rose-500/10 transition-all duration-300 flex items-center gap-3.5 text-left group shadow-xs"
        >
          <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-300 transition-colors">108 Ambulance</p>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Live GPS Fleet</p>
          </div>
        </Link>

        <Link
          href="/assistant"
          className="p-4 rounded-3xl bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 hover:border-teal-500/50 hover:shadow-md hover:shadow-teal-500/10 transition-all duration-300 flex items-center gap-3.5 text-left group shadow-xs"
        >
          <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-300 transition-colors">AI Health Help</p>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Voice in Marathi</p>
          </div>
        </Link>

        <Link
          href="/resources"
          className="p-4 rounded-3xl bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 hover:border-sky-500/50 hover:shadow-md hover:shadow-sky-500/10 transition-all duration-300 flex items-center gap-3.5 text-left group shadow-xs"
        >
          <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-300 transition-colors">PHCs & Hospitals</p>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Travel Status</p>
          </div>
        </Link>
      </div>

      {/* Facility Status Card */}
      <FacilityTravelStatusCard
        facility={destinationHospital}
        onOpenChecklist={() => setIsChecklistModalOpen(true)}
      />

      {/* Metric Cards Row */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonMetricCard />
          <SkeletonMetricCard />
          <SkeletonMetricCard />
          <SkeletonMetricCard />
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardMetricCard
            title={t("activeCasesMetric", "Active Cases")}
            value="1"
            subtitle={t("phcSubTitle", "Ashti PHC Intake")}
            icon={FileText}
            variant="teal"
          />
          <DashboardMetricCard
            title={t("referralStageMetric", "Referral Stage")}
            value="Step 3 of 6"
            subtitle={t("acceptedByHospital", "Accepted by Hospital")}
            icon={GitPullRequest}
            variant="sky"
          />
          <DashboardMetricCard
            title={t("schemeCoverageMetric", "Scheme Coverage")}
            value="100% Free"
            subtitle={t("pmjayConfirmed", "PM-JAY Confirmed")}
            icon={ShieldCheck}
            variant="emerald"
          />
          <DashboardMetricCard
            title={t("travelReadinessMetric", "Travel Readiness")}
            value="3/3 Ready"
            subtitle={t("allDocsPrepared", "All docs prepared")}
            icon={Luggage}
            variant="amber"
          />
        </div>
      )}

      {/* Core Grid: Left (Referral & Case Summary), Right (AI Guidance & Resources) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
        {/* Left Column: Referral & Case (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t("activeHospitalReferral", "Active Hospital Referral")}
              </h3>
              <Link href="/referrals" className="text-xs text-teal-700 dark:text-teal-400 font-semibold hover:underline flex items-center gap-1">
                <span>{t("viewFullTimeline", "View Full Timeline")}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {isLoading ? <SkeletonCard /> : <ReferralCard referral={activeReferral} />}
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t("primaryCaseSummary", "Primary Case Summary & Vitals")}
            </h3>
            {isLoading ? <SkeletonCard /> : <CaseSummaryCard patientCase={activeCase} />}
          </div>
        </div>

        {/* Right Column: AI Recommendations & Quick Access (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>{t("groundedAiAssistance", "Grounded AI Assistance")}</span>
              </h3>
              <Link href="/assistant" className="text-xs text-teal-700 dark:text-teal-400 font-semibold hover:underline">
                {t("askAssistant", "Ask Assistant")}
              </Link>
            </div>
            <AIRecommendationCard recommendation={aiRecommendation} />
          </div>

          {/* Quick Support & Helplines Card */}
          <Card>
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-sm text-slate-800 dark:text-slate-200">
                {t("emergencyHelplineCard", "Emergency & Travel Support")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <strong className="block text-slate-900 dark:text-white">Gramin Arogya Sahayog Trust</strong>
                  <span className="text-slate-500 dark:text-slate-400">Patient Van Aid: +91 94228 71923</span>
                </div>
                <Badge variant="teal">{t("verifiedNgo", "Verified NGO")}</Badge>
              </div>

              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-800 flex items-center justify-between">
                <div>
                  <strong className="block text-rose-950 dark:text-rose-200">108 Free Medical Transit</strong>
                  <span className="text-rose-700 dark:text-rose-400">Govt 24x7 Ambulance Dispatch</span>
                </div>
                <Badge variant="danger">{t("emergencyBadge", "Emergency")}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Maternal, Child & Chronic Care Follow-Up Tracker */}
      <HighRiskFollowupTracker
        patientName={userName}
        mcpCardNumber="MCP-MH-2026-89104"
      />

      {/* Travel Checklist Modal */}
      <Modal
        isOpen={isChecklistModalOpen}
        onClose={() => setIsChecklistModalOpen(false)}
        title="Don't Make Me Travel Twice — Travel Checklist"
        description="Verify required and recommended documents before traveling."
        maxWidth="max-w-2xl"
      >
        <TravelReadinessChecklist
          caseId={activeCase.id}
          facilityName={destinationHospital.name}
        />
      </Modal>
    </div>
  );
}

export default PatientDashboardPage;
