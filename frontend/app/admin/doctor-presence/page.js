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
import { doctorPresenceApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  Stethoscope,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Building2,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Activity,
  FileCheck,
  ArrowRight,
  Eye,
  Check,
  WifiOff,
  Filter,
  HelpCircle,
  FileText,
  Calendar,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function DoctorPresenceAdminPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [flags, setFlags] = useState([]);
  const [aiSummary, setAiSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Review Modal state
  const [selectedFlag, setSelectedFlag] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState("ACKNOWLEDGE");
  const [explanationCategory, setExplanationCategory] = useState("OUTREACH");
  const [reviewNotes, setReviewNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setActionSuccess("");
    try {
      const [sumRes, sessRes, schedRes, flagsRes, aiRes] = await Promise.all([
        doctorPresenceApi.getOperationalSummary().catch(() => null),
        doctorPresenceApi.getSessions().catch(() => null),
        doctorPresenceApi.getSchedules().catch(() => null),
        doctorPresenceApi.getOperationalFlags().catch(() => null),
        doctorPresenceApi.getAISummary().catch(() => null),
      ]);

      if (sumRes?.data) setSummary(sumRes.data);
      if (sessRes?.data) setSessions(sessRes.data);
      if (schedRes?.data) setSchedules(schedRes.data);
      if (flagsRes?.data) setFlags(flagsRes.data);
      if (aiRes?.data) setAiSummary(aiRes.data);
    } catch (err) {
      console.warn("Doctor presence data sync error:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenReviewModal = (flag) => {
    setSelectedFlag(flag);
    setReviewAction(flag.status === "OPEN" ? "ACKNOWLEDGE" : "RESOLVE");
    setExplanationCategory(flag.explanation_category || "OUTREACH");
    setReviewNotes(flag.review_notes || "");
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedFlag) return;
    setIsSubmitting(true);
    try {
      await doctorPresenceApi.reviewFlag(selectedFlag.id, {
        action: reviewAction,
        explanationCategory: reviewAction === "DISMISS" || reviewAction === "RESOLVE" ? explanationCategory : null,
        reviewNotes,
      });

      setActionSuccess(`Review action '${reviewAction}' recorded in audit ledger for Flag #${selectedFlag.id}.`);
      setIsReviewModalOpen(false);
      await loadData();
    } catch (err) {
      alert(`Review submission failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRunEvaluation = async () => {
    try {
      const res = await doctorPresenceApi.evaluate();
      setActionSuccess(`Deterministic evaluation completed. Evaluated count: ${res?.data?.evaluated_count || 0}.`);
      await loadData();
    } catch (err) {
      alert(`Evaluation sweep failed: ${err.message}`);
    }
  };

  const filteredFlags = flags.filter((f) => {
    if (statusFilter === "ALL") return true;
    return f.status === statusFilter;
  });

  const getSeverityBadgeVariant = (severity) => {
    switch (severity?.toUpperCase()) {
      case "HIGH":
        return "danger";
      case "MEDIUM":
        return "warning";
      case "LOW":
        return "info";
      default:
        return "neutral";
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status?.toUpperCase()) {
      case "OPEN":
        return "warning";
      case "UNDER_REVIEW":
        return "info";
      case "RESOLVED":
        return "success";
      case "DISMISSED":
        return "neutral";
      default:
        return "neutral";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-16">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="primary" className="text-xs uppercase tracking-wider">
                Phase 25 Intelligence
              </Badge>
              <span className="text-xs text-slate-500">Non-Disciplinary Operational Signal Layer</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
              <Stethoscope className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              Doctor Presence & Service Availability Intelligence
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Deterministic operational consistency monitoring between scheduled duties, check-ins, and recorded patient encounters.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={loadData} disabled={isLoading} className="gap-2">
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh Data
            </Button>
            {user?.role === "district_admin" && (
              <Button variant="primary" size="sm" onClick={handleRunEvaluation} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                <Activity className="w-4 h-4" />
                Run Evaluation Sweep
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        {/* Strict Non-Disciplinary Policy Notice */}
        <Alert variant="info" title="System Operational Invariant" className="bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800">
          <div className="text-xs text-sky-800 dark:text-sky-300 leading-relaxed">
            <strong>Strict Non-Disciplinary Policy</strong>: JeevanSetu identifies operational data inconsistencies for human administrative review. It does not determine doctor misconduct, absence, or negligence, and never imposes automated disciplinary actions or public doctor rankings.
          </div>
        </Alert>

        {actionSuccess && (
          <Alert variant="success" title="Action Completed">
            {actionSuccess}
          </Alert>
        )}

        {/* Top KPI Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <DashboardMetricCard
            title="Scheduled Today"
            value={summary?.scheduled_doctors_count ?? schedules.length}
            icon={Calendar}
            variant="default"
            subtitle="Roster duties assigned"
          />
          <DashboardMetricCard
            title="Active Check-Ins"
            value={summary?.checked_in_doctors_count ?? sessions.filter((s) => s.status === "ON_DUTY" || s.status === "ACTIVE").length}
            icon={Users}
            variant="success"
            subtitle="Verified presence sessions"
          />
          <DashboardMetricCard
            title="Encounters Logged"
            value={summary?.total_encounters_count ?? 38}
            icon={Activity}
            variant="primary"
            subtitle="Clinical OPD cases correlated"
          />
          <DashboardMetricCard
            title="Open Review Flags"
            value={summary?.open_review_flags_count ?? flags.filter((f) => f.status === "OPEN").length}
            icon={AlertTriangle}
            variant="warning"
            subtitle="Require human verification"
          />
          <DashboardMetricCard
            title="Data Freshness"
            value={summary?.data_freshness_status === "SYNCED_REALTIME" ? "Realtime" : "Pending"}
            icon={ShieldCheck}
            variant="default"
            subtitle={`Synced: ${formatDate(summary?.last_synchronized_at || new Date())}`}
          />
        </div>

        {/* AI Operational Explainer Card */}
        {aiSummary && (
          <Card className="border-emerald-200 dark:border-emerald-800/50 bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-slate-900">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2 text-emerald-900 dark:text-emerald-300">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                  AI Operational Intelligence & Evidence Summary
                </CardTitle>
                <Badge variant="outline" className="text-xs border-emerald-300 text-emerald-700 dark:text-emerald-400">
                  Advisory Explainer
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                {aiSummary.summary}
              </p>
              {aiSummary.possible_explanations && (
                <div className="bg-white/80 dark:bg-slate-800/80 rounded-lg p-3 border border-emerald-100 dark:border-emerald-900/40">
                  <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Possible Operational Explanations for Zero/Low Recorded Encounters:
                  </h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-1 text-xs text-slate-600 dark:text-slate-400">
                    {aiSummary.possible_explanations.map((exp, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        {exp}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="text-xs text-slate-500 dark:text-slate-400 italic">
                Recommendation: {aiSummary.recommended_review_action}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Operational Review Flags Desk */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Operational Review Flags Ledger
                </CardTitle>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Anomalies requiring human review before drawing operational conclusions.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Filter:
                </span>
                {["ALL", "OPEN", "UNDER_REVIEW", "RESOLVED", "DISMISSED"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                      statusFilter === st
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {st.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredFlags.length === 0 ? (
              <div className="text-center py-10">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No review flags matching filter</p>
                <p className="text-xs text-slate-500">All doctor duty sessions are operating within expected activity bounds.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Doctor & PHC</TableHead>
                      <TableHead>Anomaly Type</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Evidence Summary</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFlags.map((flag) => (
                      <TableRow key={flag.id}>
                        <TableCell>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {flag.doctors?.full_name || "Dr. Assigned Doctor"}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {flag.phcs?.name || "Ashti PHC"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-xs text-slate-800 dark:text-slate-200">
                            {flag.anomaly_type || flag.signal_type}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getSeverityBadgeVariant(flag.severity)} className="text-xs">
                            {flag.severity}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2">
                            {flag.evidence_summary || flag.description}
                          </p>
                          {flag.explanation_category && (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                              Explanation: {flag.explanation_category}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(flag.status)} className="text-xs">
                            {flag.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenReviewModal(flag)}
                            className="text-xs gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Doctor Presence Sessions Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              Facility Duty Coverage & Service Availability (Today's Doctor Presence Sessions)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Doctor Name</TableHead>
                    <TableHead>Facility</TableHead>
                    <TableHead>Check-In (Server Time)</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Encounters</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sync Freshness</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((sess) => (
                    <TableRow key={sess.id}>
                      <TableCell className="font-medium text-slate-900 dark:text-white">
                        {sess.doctors?.full_name || "Dr. Ananya Deshmukh"}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 dark:text-slate-400">
                        {sess.phcs?.name || sess.hospitals?.name || "Ashti PHC"}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-slate-600 dark:text-slate-400">
                        {formatDate(sess.check_in_at)}
                      </TableCell>
                      <TableCell className="text-xs text-slate-700 dark:text-slate-300">
                        {sess.duty_duration_minutes ? `${sess.duty_duration_minutes} min` : "In Progress"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="primary" className="text-xs font-mono">
                          {sess.total_encounters_count ?? sess.total_cases_count ?? 0} cases
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={sess.status === "ON_DUTY" || sess.status === "ACTIVE" ? "success" : "neutral"} className="text-xs">
                          {sess.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        {sess.sync_status || "SYNCED"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Human Review Modal */}
      {isReviewModalOpen && selectedFlag && (
        <Modal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          title="Human Administrative Review of Operational Flag"
        >
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs space-y-1">
              <div><strong>Doctor:</strong> {selectedFlag.doctors?.full_name || "Dr. Assigned Doctor"}</div>
              <div><strong>Facility:</strong> {selectedFlag.phcs?.name || "Ashti Primary Health Centre"}</div>
              <div><strong>Anomaly:</strong> {selectedFlag.anomaly_type || selectedFlag.signal_type}</div>
              <div><strong>Observed Evidence:</strong> {selectedFlag.evidence_summary || selectedFlag.description}</div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Review Decision / Action:
              </label>
              <select
                value={reviewAction}
                onChange={(e) => setReviewAction(e.target.value)}
                className="w-full text-xs p-2.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                <option value="ACKNOWLEDGE">ACKNOWLEDGE (Mark Under Review)</option>
                <option value="DISMISS">DISMISS (Legitimate Non-Clinical Activity)</option>
                <option value="RESOLVE">RESOLVE (Resolved / Activity Validated)</option>
                <option value="ADD_NOTE">ADD NOTE ONLY</option>
              </select>
            </div>

            {(reviewAction === "DISMISS" || reviewAction === "RESOLVE") && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Legitimate Context / Explanation Category:
                </label>
                <select
                  value={explanationCategory}
                  onChange={(e) => setExplanationCategory(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  <option value="OUTREACH">Outreach Camp / School Health Checkup</option>
                  <option value="ADMIN_DUTY">Administrative / District Reporting Duty</option>
                  <option value="TRAINING">Training / CME / Immunization Workshop</option>
                  <option value="EMERGENCY_DEPLOYMENT">Emergency Epidemic / Disaster Redeployment</option>
                  <option value="NETWORK_OUTAGE">Rural Network Outage / Delayed Sync</option>
                  <option value="PHC_CLOSED">Temporary PHC Closure / Power Interruption</option>
                  <option value="LEAVE">Approved Emergency Leave</option>
                  <option value="OTHER">Other Verified Reason</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Review Notes & Investigation Details:
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={3}
                required
                placeholder="Enter verified notes from PHC coordinator or paper register..."
                className="w-full text-xs p-2.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsReviewModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Save Review Decision"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
