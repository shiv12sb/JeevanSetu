"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { inventoryApi, referralsApi, casesApi, earlyWarningApi, doctorPresenceApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { DashboardMetricCard } from "@/components/domain/DashboardMetricCard";
import { ReferralCard } from "@/components/domain/ReferralCard";
import {
  mockMedicinesInventory,
  mockReferrals,
} from "@/lib/mockData";
import {
  Users,
  Package,
  AlertTriangle,
  GitPullRequest,
  Stethoscope,
  ArrowRight,
  Plus,
  RefreshCw,
  Building2,
  CheckCircle2,
  Activity,
  Clock,
} from "lucide-react";

export default function PhcDashboardPage() {
  const { user } = useAuth();
  const [criticalMeds, setCriticalMeds] = useState([]);
  const [activeReferral, setActiveReferral] = useState(mockReferrals[0]);
  const [totalCasesCount, setTotalCasesCount] = useState(28);
  const [facilitySignal, setFacilitySignal] = useState(null);
  const [doctorSessions, setDoctorSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPhcData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Inventory
      const invRes = await inventoryApi.list({ limit: 20 });
      if (invRes?.data && invRes.data.length > 0) {
        const mapped = invRes.data.map((item) => {
          const qty = item.current_quantity !== undefined ? item.current_quantity : 0;
          const threshold = item.minimum_threshold !== undefined ? item.minimum_threshold : 100;
          const isCritical = qty <= threshold;
          const isLow = qty <= threshold * 1.5;

          return {
            id: item.id,
            name: item.medicines?.name || "Essential Medicine",
            category: item.medicines?.dosage_form || "Tablet",
            currentStock: qty,
            minimumThreshold: threshold,
            unit: item.medicines?.standard_unit || "tablets",
            status: isCritical ? "critical" : isLow ? "low" : "sufficient",
            lastRestocked: item.last_restocked_at ? item.last_restocked_at.split("T")[0] : "2026-02-15",
          };
        });
        const lowStockOnly = mapped.filter((m) => m.status === "critical" || m.status === "low");
        setCriticalMeds(lowStockOnly);
      } else {
        setCriticalMeds([
          {
            id: "inv-2",
            name: "Amlodipine 5mg",
            category: "Tablet",
            currentStock: 80,
            minimumThreshold: 150,
            unit: "tablets",
            status: "critical",
            lastRestocked: "2026-02-10",
          },
        ]);
      }

      // 2. Fetch Referrals
      const refRes = await referralsApi.list({ limit: 1 });
      if (refRes?.data && refRes.data.length > 0) {
        const r = refRes.data[0];
        setActiveReferral({
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

      // 3. Fetch Cases count
      const casesRes = await casesApi.list({ limit: 100 });
      if (casesRes?.total !== undefined) {
        setTotalCasesCount(casesRes.total || 28);
      }

      // 4. Fetch Early-Warning Signals for PHC
      const ewRes = await earlyWarningApi.getSignals({ phc_id: user?.assignedPhcId || "phc-1" }).catch(() => null);
      if (ewRes?.data && ewRes.data.length > 0) {
        setFacilitySignal(ewRes.data[0]);
      }

      // 5. Fetch Doctor Duty Sessions
      const sessRes = await doctorPresenceApi.getSessions({ facility_id: user?.assignedPhcId || "phc-1" }).catch(() => null);
      if (sessRes?.data) {
        setDoctorSessions(sessRes.data);
      }
    } catch (err) {
      console.warn("PHC dashboard live sync fallback:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPhcData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 sm:p-7 bg-gradient-to-r from-teal-950/90 via-slate-900/90 to-emerald-950/90 backdrop-blur-2xl rounded-3xl text-white shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-teal-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="space-y-1.5 text-left relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-300 bg-teal-950/80 px-3 py-1 rounded-full font-mono border border-teal-500/30 shadow-xs shadow-teal-500/20">
              Primary Health Centre • Facility Code: PHC-MH-2041
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Ashti Primary Health Centre Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-medium">
            Gadchiroli District • Serving 14 Gram Panchayats • 24x7 Emergency Active
          </p>
        </div>

        <div className="flex items-center gap-2.5 relative z-10">
          <Button
            size="sm"
            variant="outline"
            className="bg-slate-900/60 text-slate-300 hover:text-white border-white/15 hover:bg-slate-800/80 backdrop-blur-md rounded-2xl gap-1.5 font-bold px-4 py-2"
            onClick={fetchPhcData}
            disabled={isLoading}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Sync Live</span>
          </Button>
          <Link href="/inventory">
            <Button size="sm" className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black gap-1.5 rounded-2xl shadow-lg shadow-teal-500/20 px-4 py-2">
              <Package className="w-4 h-4" />
              <span>Manage Inventory</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Early-Warning Operational Signal Banner if active */}
      {facilitySignal && facilitySignal.status !== "resolved" && (
        <Alert
          variant={facilitySignal.signal_level === "HIGH" ? "danger" : "warning"}
          title={`Health Early-Warning Signal (${facilitySignal.signal_level}): Requires Clinical Review`}
          className="text-xs"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mt-1">
            <p className="leading-relaxed text-slate-300">
              {facilitySignal.notes} (Observed: {facilitySignal.observed_value} vs Baseline: {facilitySignal.baseline_value})
            </p>
            <Badge variant="outline" size="sm" className="shrink-0 font-mono text-[10px]">
              Status: {facilitySignal.status.toUpperCase()}
            </Badge>
          </div>
        </Alert>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardMetricCard
          title="Today's OPD Registrations"
          value={`${totalCasesCount} Patients`}
          subtitle="Triage & Consultations"
          icon={Users}
          status="info"
        />
        <DashboardMetricCard
          title="Low Stock Drug Alerts"
          value={`${criticalMeds.length} Critical`}
          subtitle="Below safety threshold"
          icon={Package}
          status={criticalMeds.length > 0 ? "danger" : "success"}
        />
        <DashboardMetricCard
          title="Active Specialty Referrals"
          value="4 In-Transit"
          subtitle="To District Civil Hospital"
          icon={GitPullRequest}
          status="warning"
        />
        <DashboardMetricCard
          title="Medical Officer On Duty"
          value="Dr. Ananya Deshmukh"
          subtitle="Checked in 08:30 AM"
          icon={Stethoscope}
          status="success"
        />
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
        {/* Left Column: Low Stock Surveillance */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>PHC Medicine Stock Surveillance</span>
            </h3>
            <Link href="/inventory" className="text-xs font-bold text-teal-700 dark:text-teal-300 hover:underline flex items-center gap-1">
              <span>View All Inventory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-hidden rounded-3xl bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 shadow-lg">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200/90 dark:border-white/10">
                  <TableHead className="font-bold text-slate-700 dark:text-slate-300">Medicine</TableHead>
                  <TableHead className="font-bold text-slate-700 dark:text-slate-300">Current Stock</TableHead>
                  <TableHead className="font-bold text-slate-700 dark:text-slate-300">Safety Threshold</TableHead>
                  <TableHead className="font-bold text-slate-700 dark:text-slate-300 text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {criticalMeds.map((med) => (
                  <TableRow key={med.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <TableCell>
                      <span className="font-bold text-slate-900 dark:text-white block">{med.name}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{med.category}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-extrabold text-slate-900 dark:text-white">{med.currentStock} {med.unit}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{med.minimumThreshold} units</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={med.status === "critical" ? "danger" : "warning"} size="sm" className="font-bold">
                        {med.status === "critical" ? "Critical Low" : "Low Stock"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Right Column: Active Referral Queue */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <GitPullRequest className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <span>Active Referral Timeline</span>
            </h3>
            <Link href="/referrals" className="text-xs font-bold text-teal-700 dark:text-teal-300 hover:underline flex items-center gap-1">
              <span>All Referrals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <ReferralCard referral={activeReferral} />
        </div>
      </div>
    </div>
  );
}
