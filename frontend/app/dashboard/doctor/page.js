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

  const [currentToken, setCurrentToken] = useState(14);
  const [queueWaiting, setQueueWaiting] = useState(6);
  const [completedToday, setCompletedToday] = useState(18);

  const handleNextToken = () => {
    if (queueWaiting > 0) {
      setCurrentToken((prev) => prev + 1);
      setQueueWaiting((prev) => prev - 1);
      setCompletedToday((prev) => prev + 1);
      setStatusMessage(`Calling Token #${currentToken + 1} into Consultation Room.`);
    } else {
      setStatusMessage("All queued OPD patients have been seen for this session.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 sm:p-7 bg-gradient-to-r from-teal-950/90 via-slate-900/90 to-sky-950/90 backdrop-blur-2xl rounded-3xl text-white shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-teal-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="space-y-1.5 text-left relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-300 bg-teal-950/80 px-3 py-1 rounded-full font-mono border border-teal-500/30 shadow-xs shadow-teal-500/20">
              Clinician Portal • Registration #MCI-2014-98124
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Dr. Vivek Kulkarni
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-medium">
            Senior Consultant (General Medicine & Cardiology) • District Civil Hospital Gadchiroli
          </p>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          <Button
            size="sm"
            variant={isOnDuty ? "outline" : "primary"}
            className={isOnDuty ? "bg-slate-900/80 text-teal-300 border-teal-500/30 hover:bg-slate-800 backdrop-blur-md rounded-2xl font-bold px-4 py-2" : "bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black rounded-2xl px-4 py-2 shadow-lg shadow-teal-500/20"}
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

      {/* Live OPD Queue & Token Control Bar */}
      <div className="p-6 bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 shadow-lg flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 text-slate-950 flex flex-col items-center justify-center font-bold shadow-lg shadow-teal-500/20 shrink-0">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-900/80">Token</span>
            <span className="text-2xl leading-tight font-black">#{currentToken}</span>
          </div>
          <div className="space-y-0.5 text-left">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                Live OPD Triage Queue
              </span>
              <Badge variant="teal" size="sm" className="font-bold">Session Active</Badge>
            </div>
            <p className="text-xs text-slate-400">
              <strong className="text-white font-bold">{queueWaiting} Patients Waiting</strong> in OPD Corridor • Est. Wait Time: <strong className="text-teal-300">~{queueWaiting * 3} mins</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Button
            size="sm"
            className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-xs gap-1.5 shadow-lg shadow-teal-500/20 rounded-2xl px-4 py-2.5"
            onClick={handleNextToken}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Call Next Token (#{currentToken + 1})</span>
          </Button>

          <Link href="/cases">
            <Button
              size="sm"
              variant="outline"
              className="text-xs gap-1.5 border-white/15 text-slate-300 hover:text-white bg-slate-900/60 backdrop-blur-md rounded-2xl font-bold px-4 py-2.5"
            >
              <FileText className="w-3.5 h-3.5 text-teal-400" />
              <span>Full Case Registry</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Doctor Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <DashboardMetricCard
          title="Incoming Referral Queue"
          value={`${queueWaiting} Patients`}
          subtitle="From Ashti & Chamorshi PHCs"
          icon={Users}
          status="warning"
        />
        <DashboardMetricCard
          title="Today's Consultations"
          value={`${completedToday} Seen`}
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
