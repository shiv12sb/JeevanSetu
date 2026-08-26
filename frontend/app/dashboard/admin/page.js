"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { Modal } from "@/components/ui/Modal";
import { DashboardMetricCard } from "@/components/domain/DashboardMetricCard";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { mockAdminAlerts, mockHospitals, mockMedicinesInventory } from "@/lib/mockData";
import { adminApi, inventoryApi, earlyWarningApi } from "@/lib/api";
import {
  ShieldAlert,
  Users,
  GitPullRequest,
  Building2,
  Package,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  UserCheck,
  RefreshCw,
  Clock,
  Activity,
  FileCheck,
  TrendingDown,
  Eye,
  Check,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export function AdminDashboardPage() {
  const [monitoringData, setMonitoringData] = useState(null);
  const [forecasts, setForecasts] = useState([]);
  const [earlyWarningSignals, setEarlyWarningSignals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [auditLogs, setAuditLogs] = useState([]);

  // Review Modal state
  const [selectedSignal, setSelectedSignal] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewStatus, setReviewStatus] = useState("acknowledged");
  const [reviewNotes, setReviewNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState("");

  const loadAdminMonitoring = async () => {
    setIsLoading(true);
    try {
      const [monRes, auditRes, forecastRes, ewRes] = await Promise.all([
        adminApi.getMonitoring().catch(() => null),
        adminApi.getAuditLogs({ limit: 8 }).catch(() => null),
        inventoryApi.getForecasts().catch(() => null),
        earlyWarningApi.getSignals().catch(() => null),
      ]);

      if (monRes?.data) setMonitoringData(monRes.data);
      if (auditRes?.data) setAuditLogs(auditRes.data);
      if (forecastRes?.data) setForecasts(forecastRes.data);
      if (ewRes?.data) setEarlyWarningSignals(ewRes.data);
    } catch (err) {
      console.warn("Admin monitoring live sync fallback:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminMonitoring();
  }, []);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedSignal) return;

    setIsSubmitting(true);
    try {
      await earlyWarningApi.updateStatus(selectedSignal.id, {
        status: reviewStatus,
        notes: reviewNotes,
      });

      setActionSuccess(`Signal review status updated to '${reviewStatus}'.`);
      setIsReviewModalOpen(false);
      setReviewNotes("");
      loadAdminMonitoring();
    } catch (err) {
      console.error("Failed to update signal status:", err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const metrics = monitoringData?.metrics || {
    total_unresolved_cases: 14,
    urgent_cases_count: 5,
    active_referrals_count: 8,
    referral_follow_up_count: 3,
    low_stock_items_count: 2,
    doctors_on_duty: 2,
    doctors_total: 3,
  };

  const highRiskDepletions = forecasts.filter(
    (f) => f.risk_level === "CRITICAL" || f.risk_level === "HIGH"
  );

  const activeEwSignals = earlyWarningSignals.filter((s) => s.status !== "resolved");

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 bg-linear-to-r from-slate-900 via-teal-950 to-slate-900 rounded-2xl text-white shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-300 bg-teal-900/80 px-2.5 py-0.5 rounded-full border border-teal-700">
              District Health Administration Control Center
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Gadchiroli & Chandrapur Public Health Monitoring
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Monitoring 42 PHCs, 4 Sub-District Hospitals, and 1 District Civil Hospital
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="bg-white/10 text-white border-white/20 hover:bg-white/20 gap-1.5"
            onClick={loadAdminMonitoring}
            disabled={isLoading}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Sync Live</span>
          </Button>
          <Badge variant="success" size="lg" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
            System Online
          </Badge>
        </div>
      </div>

      {actionSuccess && (
        <Alert variant="success" title="Action Completed">
          {actionSuccess}
        </Alert>
      )}

      {/* System KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardMetricCard
          title="Unresolved Health Cases"
          value={`${metrics.total_unresolved_cases} Active`}
          subtitle={`${metrics.urgent_cases_count} High Urgency / Emergency`}
          icon={Users}
          status="info"
        />
        <DashboardMetricCard
          title="Early-Warning Anomalies"
          value={`${activeEwSignals.length} Active`}
          subtitle="Requires public health review"
          icon={Activity}
          status={activeEwSignals.length > 0 ? "danger" : "success"}
        />
        <DashboardMetricCard
          title="Depletion Risk Alerts"
          value={`${highRiskDepletions.length} Critical/High`}
          subtitle="Forecasted depletion ≤ 7 days"
          icon={TrendingDown}
          status={highRiskDepletions.length > 0 ? "warning" : "teal"}
        />
        <DashboardMetricCard
          title="Medical Officers On Duty"
          value={`${metrics.doctors_on_duty} / ${metrics.doctors_total} Active`}
          subtitle="Clinical presence verified"
          icon={UserCheck}
          status="teal"
        />
      </div>

      {/* Health Early-Warning Surveillance Section */}
      {earlyWarningSignals.length > 0 && (
        <Card className="border-l-4 border-l-rose-500 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-rose-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Health Early-Warning Surveillance Signals (Operational Anomaly Detection)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Detects statistical variations against 28-day baseline moving averages. Not a medical diagnosis or confirmed outbreak.
                </p>
              </div>
            </div>
            <Badge variant="danger" size="sm">
              {activeEwSignals.length} Under Surveillance
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {earlyWarningSignals.map((signal) => (
              <div
                key={signal.id}
                className={`p-4 rounded-xl border ${
                  signal.signal_level === "HIGH"
                    ? "bg-rose-50/60 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800"
                    : signal.signal_level === "ELEVATED"
                    ? "bg-amber-50/60 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800"
                    : "bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700"
                } text-xs space-y-2`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Badge
                      variant={
                        signal.signal_level === "HIGH"
                          ? "danger"
                          : signal.signal_level === "ELEVATED"
                          ? "warning"
                          : "info"
                      }
                      size="sm"
                    >
                      {signal.signal_level} SIGNAL
                    </Badge>
                    <span className="font-bold text-slate-900 dark:text-white">{signal.phc_name || signal.district}</span>
                  </div>
                  <Badge variant="outline" size="sm" className="text-[10px] uppercase font-mono">
                    Status: {signal.status.replace(/_/g, " ")}
                  </Badge>
                </div>

                <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                  {signal.notes}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-700">
                  <span>
                    Observed: <strong>{signal.observed_value}</strong> vs Base: <strong>{signal.baseline_value}</strong> (+{signal.deviation_percentage}%)
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 text-[11px] border-slate-300 dark:border-slate-700 font-bold"
                    onClick={() => {
                      setSelectedSignal(signal);
                      setReviewStatus(signal.status === "new" ? "acknowledged" : "under_review");
                      setIsReviewModalOpen(true);
                    }}
                  >
                    Review Action
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Admin Monitoring Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Operational Alerts & Follow-up Queue (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              <span>Referral Follow-up Surveillance</span>
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Neutral clinical review</span>
          </div>

          <div className="space-y-3">
            {(monitoringData?.referral_follow_up_queue || []).length > 0 ? (
              monitoringData.referral_follow_up_queue.map((ref) => (
                <Card key={ref.id} className="border-l-4 border-l-amber-500 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="warning" size="sm">Follow-up Required</Badge>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{ref.referral_number || ref.id}</span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                        Patient: {ref.profiles?.full_name || "Healthcare Citizen"} • Specialty: {ref.required_specialty}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        From: {ref.phcs?.name || "Ashti PHC"} → To: {ref.hospitals?.name || "District Hospital"}
                      </p>
                    </div>
                    <Link href="/referrals">
                      <Button size="sm" variant="outline" className="text-xs">
                        Review
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))
            ) : (
              mockAdminAlerts.slice(0, 3).map((alert) => (
                <Card
                  key={alert.id}
                  className={`border-l-4 ${
                    alert.severity === "critical"
                      ? "border-l-rose-500"
                      : alert.severity === "warning"
                      ? "border-l-amber-500"
                      : "border-l-teal-500"
                  } p-4`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            alert.severity === "critical"
                              ? "danger"
                              : alert.severity === "warning"
                              ? "warning"
                              : "teal"
                          }
                          size="sm"
                        >
                          {alert.type}
                        </Badge>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{alert.facility}</span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">{alert.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{alert.description}</p>
                    </div>
                    <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">{alert.timestamp}</span>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Immutable Audit Trail (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-teal-700 dark:text-teal-400" />
              <span>System Audit Trail</span>
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Compliance Log</span>
          </div>

          <Card className="overflow-hidden border-slate-200 dark:border-slate-800">
            <div className="p-3 bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
              Recent Clinical & Administrative Events
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-96 overflow-y-auto">
              {auditLogs.length > 0 ? (
                auditLogs.map((log) => (
                  <div key={log.id} className="p-3 text-xs space-y-1 hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" size="sm" className="font-mono text-slate-700 dark:text-slate-300">
                        {log.action}
                      </Badge>
                      <span className="text-slate-400 dark:text-slate-500">{formatDate(log.created_at)}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 font-medium">
                      Entity: <span className="font-bold text-slate-800 dark:text-slate-200">{log.entity_type}</span>
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
                  Audit logs securely recording clinical transactions.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* HUMAN REVIEW MODAL */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title={`Early-Warning Signal Review: ${selectedSignal?.phc_name || "Facility Signal"}`}
      >
        <form onSubmit={handleStatusUpdate} className="space-y-4 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="font-bold text-slate-900 dark:text-white block">Surveillance Finding:</span>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{selectedSignal?.notes}</p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Update Investigation Status:</label>
            <select
              value={reviewStatus}
              onChange={(e) => setReviewStatus(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              <option value="acknowledged">Acknowledged (Medical Officer Notified)</option>
              <option value="under_review">Under Active Review (Field Investigation)</option>
              <option value="resolved">Resolved (Normal Operations / Mitigated)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Administrative / Clinical Notes:</label>
            <textarea
              rows={3}
              placeholder="e.g. Field medical team dispatched to verify OPD syndromic reports..."
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsReviewModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-teal-600 hover:bg-teal-700 text-white font-bold">
              {isSubmitting ? "Updating..." : "Save Review Decision"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default AdminDashboardPage;
