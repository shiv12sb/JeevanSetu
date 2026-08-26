"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { DashboardMetricCard } from "@/components/domain/DashboardMetricCard";
import { CaseSummaryCard } from "@/components/domain/CaseSummaryCard";
import { ReferralCard } from "@/components/domain/ReferralCard";
import { mockPatientCases, mockReferrals } from "@/lib/mockData";
import { casesApi, referralsApi, facilitiesApi, doctorPresenceApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  Stethoscope,
  Users,
  Clock,
  CheckCircle2,
  FileText,
  ArrowRight,
  RefreshCw,
  Power,
  ShieldAlert,
} from "lucide-react";

export default function DoctorDashboardPage() {
  const { user } = useAuth();
  const [isOnDuty, setIsOnDuty] = useState(true);
  const [lastCheckIn, setLastCheckIn] = useState("08:45 AM");
  const [activeSession, setActiveSession] = useState(null);
  const [assignedCase, setAssignedCase] = useState(mockPatientCases[0]);
  const [assignedReferral, setAssignedReferral] = useState(mockReferrals[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const loadDoctorData = async () => {
    setIsLoading(true);
    try {
      const [casesRes, refRes, sessRes] = await Promise.all([
        casesApi.list({ limit: 1 }).catch(() => null),
        referralsApi.list({ limit: 1 }).catch(() => null),
        doctorPresenceApi.getSessions({ limit: 1 }).catch(() => null),
      ]);

      if (sessRes?.data && sessRes.data.length > 0) {
        const s = sessRes.data[0];
        setActiveSession(s);
        setIsOnDuty(s.status === "ON_DUTY" || s.status === "CHECKED_IN");
        if (s.check_in_at) {
          setLastCheckIn(new Date(s.check_in_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
        }
      }

      if (casesRes?.data && casesRes.data.length > 0) {
        const c = casesRes.data[0];
        setAssignedCase({
          id: c.case_number || c.id,
          patientId: c.patient_id,
          patientName: c.profiles?.full_name || "Healthcare Citizen",
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

      if (refRes?.data && refRes.data.length > 0) {
        const r = refRes.data[0];
        setAssignedReferral({
          id: r.referral_number || r.id,
          caseId: r.case_id,
          patientName: r.profiles?.full_name || "Healthcare Citizen",
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
      console.warn("Doctor dashboard sync fallback:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDoctorData();
  }, []);

  const handleToggleDuty = async () => {
    setIsLoading(true);
    setStatusMessage("");
    try {
      if (isOnDuty) {
        const sessId = activeSession?.id || "session-101";
        await doctorPresenceApi.checkOut(sessId, { notes: "Shift completed via web portal" }).catch(() => {});
        setIsOnDuty(false);
        setStatusMessage("You are now marked OFF DUTY.");
      } else {
        const res = await doctorPresenceApi.checkIn({ duty_type: "OPD_GENERAL", notes: "Clinical OPD session started" }).catch(() => null);
        if (res?.data) setActiveSession(res.data);
        setIsOnDuty(true);
        const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        setLastCheckIn(now);
        setStatusMessage(`You are now checked in ON DUTY (${now}).`);
      }
    } catch (err) {
      // Fallback local toggle
      setIsOnDuty(!isOnDuty);
      setStatusMessage(`Duty status updated to ${!isOnDuty ? "ON DUTY" : "OFF DUTY"}.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 bg-linear-to-r from-teal-800 to-sky-900 rounded-2xl text-white shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-200 bg-teal-900/80 px-2.5 py-0.5 rounded-full border border-teal-700">
              Clinician Portal • Registration #MCI-2014-98124
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Dr. Vivek Kulkarni
          </h2>
          <p className="text-xs sm:text-sm text-teal-100/90">
            Senior Consultant (General Medicine & Cardiology) • District Civil Hospital Gadchiroli
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={isOnDuty ? "outline" : "primary"}
            className={isOnDuty ? "bg-white/10 text-white border-white/20 hover:bg-white/20" : "bg-emerald-600 hover:bg-emerald-700 text-white"}
            onClick={handleToggleDuty}
            disabled={isLoading}
          >
            <Power className="w-4 h-4 mr-1.5" />
            {isOnDuty ? `Duty Status: On Duty (${lastCheckIn})` : "Check In for Duty"}
          </Button>
        </div>
      </div>

      {statusMessage && (
        <Alert variant="info" title="Duty Status Notification">
          {statusMessage}
        </Alert>
      )}

      {/* Doctor Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <DashboardMetricCard
          title="Incoming Referral Queue"
          value="6 Patients"
          subtitle="From Ashti & Chamorshi PHCs"
          icon={Users}
          status="warning"
        />
        <DashboardMetricCard
          title="Today's Consultations"
          value="18 Seen"
          subtitle="OPD Session in progress"
          icon={Stethoscope}
          status="success"
        />
        <DashboardMetricCard
          title="Duty Roster Status"
          value={isOnDuty ? "Active On-Duty" : "Off-Duty"}
          subtitle="Shift: 09:00 AM - 05:00 PM"
          icon={Clock}
          status={isOnDuty ? "success" : "info"}
        />
      </div>

      {/* Case Review and Referral Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Assigned Patient Referral Case
            </h3>
            <span className="text-xs text-teal-700 dark:text-teal-400 font-semibold">Priority: High</span>
          </div>
          <ReferralCard referral={assignedReferral} />
        </div>

        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Attached Clinical Assessment
          </h3>
          <CaseSummaryCard patientCase={assignedCase} />
        </div>
      </div>
    </div>
  );
}
