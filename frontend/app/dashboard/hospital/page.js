"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DashboardMetricCard } from "@/components/domain/DashboardMetricCard";
import { ReferralCard } from "@/components/domain/ReferralCard";
import { mockReferrals, mockHospitals } from "@/lib/mockData";
import { referralsApi } from "@/lib/api";
import {
  Building2,
  Bed,
  GitPullRequest,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
} from "lucide-react";

export default function HospitalDashboardPage() {
  const hospital = mockHospitals[0];
  const [referrals, setReferrals] = useState(mockReferrals);
  const [isLoading, setIsLoading] = useState(false);

  const loadHospitalReferrals = async () => {
    setIsLoading(true);
    try {
      const res = await referralsApi.list({ limit: 4 });
      if (res?.data && res.data.length > 0) {
        const mapped = res.data.map((r) => ({
          id: r.referral_number || r.id,
          rawId: r.id,
          caseId: r.case_id,
          patientName: r.profiles?.full_name || "Healthcare Citizen",
          patientAge: 45,
          patientGender: "Male",
          fromFacility: r.phcs?.name || "Ashti Primary Health Centre",
          toFacility: r.hospitals?.name || hospital.name,
          department: r.required_specialty,
          priority: r.priority || "urgent",
          currentStage: r.status || "created",
          currentStageLabel: (r.status || "created").replace(/_/g, " ").toUpperCase(),
          createdAt: r.created_at,
          schemeAssistanceApplied: "Ayushman Bharat PM-JAY",
          steps: mockReferrals[0]?.steps || [],
        }));
        setReferrals(mapped);
      }
    } catch (err) {
      console.warn("Hospital referrals sync fallback:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHospitalReferrals();
  }, []);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 bg-linear-to-r from-sky-900 to-teal-900 rounded-2xl text-white shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-200 bg-sky-800/80 px-2.5 py-0.5 rounded-full border border-sky-700">
              Hospital Admission & Specialty Triage
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            {hospital.name}
          </h2>
          <p className="text-xs sm:text-sm text-sky-100/90">
            {hospital.address} • 24x7 Emergency Desk: {hospital.phone}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="bg-white/10 text-white border-white/20 hover:bg-white/20 gap-1.5"
            onClick={loadHospitalReferrals}
            disabled={isLoading}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh Queue</span>
          </Button>
          <Badge variant="success" size="lg" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
            Ayushman Mitra Counter Active
          </Badge>
        </div>
      </div>

      {/* Hospital Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <DashboardMetricCard
          title="General Bed Availability"
          value={`${hospital.bedAvailability.available} / ${hospital.bedAvailability.total}`}
          subtitle="Real-time admission capacity"
          icon={Bed}
          status="success"
        />
        <DashboardMetricCard
          title="ICU Bed Availability"
          value={`${hospital.bedAvailability.icuAvailable} Beds`}
          subtitle="Specialty critical care units"
          icon={Bed}
          status="info"
        />
        <DashboardMetricCard
          title="Incoming Referral Queue"
          value={`${referrals.length} Patients`}
          subtitle="From district PHC network"
          icon={GitPullRequest}
          status="warning"
        />
      </div>

      {/* Incoming Referrals Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Incoming Referral Intake Requests
          </h3>
          <Link href="/referrals" className="text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1">
            <span>Manage All Referrals</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {referrals.map((ref) => (
            <ReferralCard key={ref.id} referral={ref} />
          ))}
        </div>
      </div>
    </div>
  );
}
