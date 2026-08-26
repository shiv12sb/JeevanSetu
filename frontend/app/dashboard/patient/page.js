"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { casesApi, referralsApi } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { DashboardMetricCard } from "@/components/domain/DashboardMetricCard";
import { CaseSummaryCard } from "@/components/domain/CaseSummaryCard";
import { ReferralCard } from "@/components/domain/ReferralCard";
import { AIRecommendationCard } from "@/components/domain/AIRecommendationCard";
import { FacilityTravelStatusCard } from "@/components/domain/FacilityTravelStatusCard";
import { TravelReadinessChecklist } from "@/components/domain/TravelReadinessChecklist";
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
} from "lucide-react";

export function PatientDashboardPage() {
  const { user } = useAuth();
  const [activeCase, setActiveCase] = useState(mockPatientCases[0]);
  const [activeReferral, setActiveReferral] = useState(mockReferrals[0]);
  const aiRecommendation = mockAiRecommendations[0];
  const destinationHospital = mockHospitals[0];

  const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
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

        const refRes = await referralsApi.list({ limit: 1 });
        if (refRes?.data && refRes.data.length > 0) {
          const r = refRes.data[0];
          setActiveReferral({
            id: r.referral_number || r.id,
            caseId: r.case_id,
            patientName: user?.full_name || "Healthcare Citizen",
            patientAge: 45,
            patientGender: "Male",
            fromFacility: r.phcs?.name || "Ashti Primary Health Centre",
            toFacility: r.hospitals?.name || "District Civil Hospital Gadchiroli",
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
      }
    };
    loadDashboardData();
  }, [user]);

  const userName = user?.full_name || user?.name || "Rameshwar Patil";
  const userLocation = `${user?.village || "Ashti Village"}, ${user?.district || "Gadchiroli District"} • Registered with ${user?.primaryPhc || "Ashti Primary Health Centre"}`;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 bg-linear-to-r from-teal-700 to-teal-900 rounded-2xl text-white shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-200 bg-teal-800/80 px-2.5 py-0.5 rounded-full font-mono">
              JeevanSetu Case ID: {activeCase.id}
            </span>
            <Badge variant="teal" size="sm">Active Care</Badge>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Namaste, {userName}
          </h2>
          <p className="text-xs sm:text-sm text-teal-100/90">
            {userLocation}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/navigate">
            <Button size="sm" className="bg-teal-500 hover:bg-teal-400 text-teal-950 font-bold gap-1.5 shadow-sm text-xs">
              <Compass className="w-3.5 h-3.5" />
              <span>What Should I Do Now?</span>
            </Button>
          </Link>
          <Link href="/cases">
            <Button size="sm" className="bg-white text-teal-900 hover:bg-teal-50 font-bold gap-1.5 shadow-sm text-xs">
              <Plus className="w-3.5 h-3.5" />
              <span>New Case</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <DashboardMetricCard
          title="Active Health Case"
          value={activeCase.id}
          subtitle="Cardiology Workup Referral"
          icon={FileText}
          status="info"
        />
        <DashboardMetricCard
          title="Referral Progress"
          value="Step 3 of 6"
          subtitle="Accepted by District Civil Hospital"
          icon={GitPullRequest}
          status="success"
        />
        <DashboardMetricCard
          title="Matched Scheme"
          value="PM-JAY"
          subtitle="100% Cashless Inpatient Treatment"
          icon={ShieldCheck}
          status="teal"
        />
      </div>

      {/* Check Before You Travel Feature Widget */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Check Before You Travel — Destination Hospital Status</span>
          </h3>
          <button
            type="button"
            onClick={() => setIsChecklistModalOpen(true)}
            className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Luggage className="w-3.5 h-3.5" />
            <span>Open Travel Checklist</span>
          </button>
        </div>

        <FacilityTravelStatusCard
          facility={destinationHospital}
          onOpenChecklist={() => setIsChecklistModalOpen(true)}
        />
      </div>

      {/* Main Grid: Active Referral & AI Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Active Referral Timeline & Case Snapshot (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Active Hospital Referral
              </h3>
              <Link href="/referrals" className="text-xs text-teal-700 dark:text-teal-400 font-semibold hover:underline flex items-center gap-1">
                <span>View Full Timeline</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <ReferralCard referral={activeReferral} />
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Primary Case Summary & Vitals
            </h3>
            <CaseSummaryCard patientCase={activeCase} />
          </div>
        </div>

        {/* Right Column: AI Recommendations & Quick Access (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Grounded AI Assistance</span>
              </h3>
              <Link href="/assistant" className="text-xs text-teal-700 dark:text-teal-400 font-semibold hover:underline">
                Ask Assistant
              </Link>
            </div>
            <AIRecommendationCard recommendation={aiRecommendation} />
          </div>

          {/* Quick Support & Helplines Card */}
          <Card>
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-sm text-slate-800 dark:text-slate-200">
                Emergency & Travel Support
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <strong className="block text-slate-900 dark:text-white">Gramin Arogya Sahayog Trust</strong>
                  <span className="text-slate-500 dark:text-slate-400">Patient Van Aid: +91 94228 71923</span>
                </div>
                <Badge variant="teal">Verified NGO</Badge>
              </div>

              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-800 flex items-center justify-between">
                <div>
                  <strong className="block text-rose-950 dark:text-rose-200">108 Free Medical Transit</strong>
                  <span className="text-rose-700 dark:text-rose-400">Govt 24x7 Ambulance Dispatch</span>
                </div>
                <Badge variant="danger">Emergency</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

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
