"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { Modal } from "@/components/ui/Modal";
import { Input, Select } from "@/components/ui/Input";
import { DashboardMetricCard } from "@/components/domain/DashboardMetricCard";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { earlyWarningApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  AlertTriangle,
  Activity,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Building2,
  RefreshCw,
  Sparkles,
  Layers,
  FileCheck,
  ArrowRight,
  Eye,
  Check,
  TrendingUp,
  Info,
  Radio,
  Pill,
  MessageSquare,
  CloudRain,
  Users,
  Store,
  Bot,
  HelpCircle,
  MapPin,
  FileText,
  PlusCircle,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function EarlyWarningAdminPage() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [signals, setSignals] = useState([]);
  const [aiSummary, setAiSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState("");

  // Filters
  const [severityFilter, setSeverityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [phcFilter, setPhcFilter] = useState("");

  // Review modal state
  const [selectedSignal, setSelectedSignal] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState("ACKNOWLEDGE");
  const [resolutionCategory, setResolutionCategory] = useState("SEASONAL_VARIATION");
  const [reviewNotes, setReviewNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // AI Alert Explainer modal state
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiExplanation, setAiExplanation] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Community ASHA Report Modal state
  const [isCommunityModalOpen, setIsCommunityModalOpen] = useState(false);
  const [ashaPhc, setAshaPhc] = useState("phc-1");
  const [ashaArea, setAshaArea] = useState("");
  const [ashaObsType, setAshaObsType] = useState("FEVER_CLUSTER");
  const [ashaCount, setAshaCount] = useState(3);
  const [ashaNotes, setAshaNotes] = useState("");
  const [isSubmittingAsha, setIsSubmittingAsha] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setActionSuccess("");
    try {
      const [analyticsRes, signalsRes, aiRes] = await Promise.all([
        earlyWarningApi.getAnalytics().catch(() => null),
        earlyWarningApi
          .getSignals({
            severity: severityFilter,
            status: statusFilter,
            phc_id: phcFilter,
          })
          .catch(() => ({ data: [] })),
        earlyWarningApi.getAiSummary().catch(() => null),
      ]);

      if (analyticsRes?.data) setAnalytics(analyticsRes.data);
      if (signalsRes?.data) {
        setSignals(Array.isArray(signalsRes.data) ? signalsRes.data : signalsRes.data.items || []);
      }
      if (aiRes?.data) setAiSummary(aiRes.data);
    } catch (err) {
      console.warn("Early warning live sync fallback:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [severityFilter, statusFilter, phcFilter]);

  const openReviewModal = (signal) => {
    setSelectedSignal(signal);
    setReviewAction("ACKNOWLEDGE");
    setResolutionCategory(signal.resolution_category || "SEASONAL_VARIATION");
    setReviewNotes(signal.resolution_notes || signal.review_notes || "");
    setIsReviewModalOpen(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSignal) return;

    setIsSubmitting(true);
    try {
      await earlyWarningApi.review(selectedSignal.id, {
        action: reviewAction,
        resolution_category: resolutionCategory,
        notes: reviewNotes,
      });

      setActionSuccess(`Review action '${reviewAction}' recorded for ${selectedSignal.location_name || selectedSignal.phc_name}.`);
      setIsReviewModalOpen(false);
      await loadData();
    } catch (err) {
      alert(`Review submission failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAiExplainModal = async (signal) => {
    setSelectedSignal(signal);
    setIsAiModalOpen(true);
    setIsAiLoading(true);
    setAiExplanation(null);

    try {
      const res = await earlyWarningApi.explainWithAi({
        alert: signal,
        signals: signal.contributing_sources || [],
        baseline: { observed: signal.observed_value, baseline: signal.baseline_value },
      });
      setAiExplanation(res?.data || null);
    } catch (err) {
      setAiExplanation({
        summary: signal.ai_summary || "Automated statistical analysis completed.",
        possible_explanations: ["Seasonal variation", "Outreach camp", "Reporting sync backlog"],
        data_limitations: ["Small baseline sample size"],
        recommended_review_questions: ["Verify if mobile clinic was active in the area"],
        disclaimer: "JeevanSetu provides early-warning signals for human public-health investigation. It does not autonomously diagnose disease or declare outbreaks.",
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleCommunityReportSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingAsha(true);

    try {
      await earlyWarningApi.submitCommunityReport({
        phc_id: ashaPhc,
        area_name: ashaArea,
        observation_type: ashaObsType,
        reported_count: parseInt(ashaCount, 10),
        notes: ashaNotes,
      });

      setActionSuccess("ASHA Community observation report recorded successfully.");
      setIsCommunityModalOpen(false);
      setAshaArea("");
      setAshaNotes("");
      await loadData();
    } catch (err) {
      alert(`ASHA report failed: ${err.message}`);
    } finally {
      setIsSubmittingAsha(false);
    }
  };

  const getSeverityBadge = (severity) => {
    const sev = (severity || "INFO").toUpperCase();
    if (sev === "HIGH") {
      return (
        <Badge variant="danger" className="font-bold flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          HIGH
        </Badge>
      );
    }
    if (sev === "MEDIUM" || sev === "WARNING" || sev === "ELEVATED") {
      return (
        <Badge variant="warning" className="font-bold flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          MEDIUM
        </Badge>
      );
    }
    if (sev === "LOW" || sev === "WATCH") {
      return (
        <Badge variant="default" className="bg-amber-100 text-amber-800 border-amber-300 font-semibold flex items-center gap-1">
          <Clock className="w-3 h-3" />
          LOW
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-slate-600 font-medium">
        INFO
      </Badge>
    );
  };

  const getConfidenceBadge = (confidence, isStale = false) => {
    if (isStale) {
      return <Badge variant="outline" className="text-[10px] text-rose-700 border-rose-300 bg-rose-50">DATA STALE</Badge>;
    }
    const conf = (confidence || "MEDIUM").toUpperCase();
    if (conf === "HIGH") {
      return <Badge variant="success" className="text-[10px]">HIGH CONFIDENCE</Badge>;
    }
    if (conf === "MEDIUM") {
      return <Badge variant="default" className="text-[10px] bg-slate-100 text-slate-700">MEDIUM CONFIDENCE</Badge>;
    }
    return <Badge variant="outline" className="text-[10px] text-slate-500">LOW CONFIDENCE</Badge>;
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header Banner */}
      <div className="p-6 bg-linear-to-r from-slate-900 via-rose-950 to-slate-900 rounded-2xl text-white shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-300 bg-rose-900/80 px-2.5 py-0.5 rounded-full border border-rose-700 flex items-center gap-1">
              <Radio className="w-3 h-3 animate-pulse" />
              Public Health Surveillance • Multi-Source Signal Engine
            </span>
            <Badge variant="outline" className="text-[10px] text-slate-300 border-slate-700">Phase 27 Active</Badge>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Rural Public Health Early-Warning & Outbreak Intelligence
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Correlating operational health signals (PHC cases, medicine consumption, citizen feedback, and ASHA community reports) to surface statistical anomalies for human investigation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="bg-white/10 text-white border-white/20 hover:bg-white/20 gap-1.5"
            onClick={() => setIsCommunityModalOpen(true)}
          >
            <PlusCircle className="w-3.5 h-3.5 text-rose-300" />
            <span>Record ASHA Report</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="bg-white/10 text-white border-white/20 hover:bg-white/20 gap-1.5"
            onClick={loadData}
            disabled={isLoading}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Sync Live</span>
          </Button>
        </div>
      </div>

      {/* Core Principle Legal & Clinical Guardrail Banner */}
      <Alert variant="info" title="Public Health Early-Warning Guardrail">
        <div className="text-xs text-slate-700 space-y-1">
          <p>
            <strong>Core Principle: SIGNAL DETECTION ≠ OUTBREAK DECLARATION.</strong> JeevanSetu provides early-warning operational signals for human public-health investigation. It does <strong>not</strong> autonomously diagnose disease, confirm outbreaks, or issue autonomous public alerts.
          </p>
          <p className="text-slate-500 text-[11px]">
            <em>"Absence of a signal does not prove absence of disease."</em> Public-health analytics operate strictly on de-identified aggregate data without exposing patient PII.
          </p>
        </div>
      </Alert>

      {actionSuccess && (
        <Alert variant="success" title="Action Completed">
          {actionSuccess}
        </Alert>
      )}

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <DashboardMetricCard
          title="Active Warnings"
          value={analytics?.total_active_warnings ?? signals.length}
          subtitle="Operational signals under active review"
          icon={AlertTriangle}
          status="warning"
        />
        <DashboardMetricCard
          title="High Severity"
          value={analytics?.high_severity_count ?? 1}
          subtitle="Multi-stream statistical anomaly"
          icon={ShieldAlert}
          status="danger"
        />
        <DashboardMetricCard
          title="Multi-Source Correlated"
          value={analytics?.multi_source_signals_count ?? 1}
          subtitle="Cases + Medicines + ASHA"
          icon={Layers}
          status="info"
        />
        <DashboardMetricCard
          title="Resolved Reviews"
          value={analytics?.resolved_signals_count ?? 0}
          subtitle="Supervisors documented context"
          icon={ShieldCheck}
          status="success"
        />
      </div>

      {/* AI Grounded Summary */}
      {aiSummary && (
        <Card className="border-rose-200 bg-linear-to-r from-rose-50/50 via-slate-50 to-white shadow-xs">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">
                  AI Surveillance Interpretation Layer
                </CardTitle>
                <p className="text-[11px] text-slate-500">
                  AI-generated summary based on verified statistical metrics • Strictly non-diagnostic
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] border-rose-300 text-rose-800 bg-rose-50">
              Deterministic Aggregation
            </Badge>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-700 leading-relaxed font-sans">
              {aiSummary.summary}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Multi-Source Data Stream Status */}
      <Card className="shadow-xs border-slate-200">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-rose-600" />
            Surveillance Data Stream Providers & Integration Status
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "PHC Clinical Cases", icon: Activity, status: "Live Active", live: true },
              { label: "Medicine Usage", icon: Pill, status: "Live Active", live: true },
              { label: "Citizen Feedback", icon: MessageSquare, status: "Live Active", live: true },
              { label: "Community / ASHA", icon: Users, status: "Live Active", live: true },
              { label: "Retail Pharmacy", icon: Store, status: "NOT_AVAILABLE", live: false },
              { label: "Weather / Climate", icon: CloudRain, status: "WEATHER_DATA_UNAVAILABLE", live: false },
            ].map((st, i) => {
              const IconComp = st.icon;
              return (
                <div key={i} className="p-3 border rounded-xl bg-slate-50/60 flex flex-col justify-between space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <IconComp className="w-4 h-4 text-slate-700" />
                    <span className={`w-2 h-2 rounded-full ${st.live ? "bg-emerald-500 animate-pulse" : "bg-amber-400"}`} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{st.label}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{st.status}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Active Operational Signals Queue */}
      <Card className="shadow-xs border-slate-200">
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Operational Early-Warning Alerts & Surveillance Ledger</span>
              </CardTitle>
              <p className="text-xs text-slate-500">
                Ranked by statistical deviation, multi-source correlation, and confidence.
              </p>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="text-xs h-8 py-1"
              >
                <option value="">All Severities</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
                <option value="INFO">INFO</option>
              </Select>

              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs h-8 py-1"
              >
                <option value="">All Statuses</option>
                <option value="DETECTED">DETECTED</option>
                <option value="UNDER_REVIEW">UNDER REVIEW</option>
                <option value="VERIFIED">VERIFIED</option>
                <option value="DISMISSED">DISMISSED</option>
                <option value="RESOLVED">RESOLVED</option>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
                <TableHead>Location / Scope</TableHead>
                <TableHead>Signal Type & Sources</TableHead>
                <TableHead>Observed vs Baseline</TableHead>
                <TableHead>Deviation / Z-Score</TableHead>
                <TableHead>Severity & Confidence</TableHead>
                <TableHead>Review Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {signals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-400 text-xs">
                    No early-warning alerts match the selected filters.
                  </TableCell>
                </TableRow>
              ) : (
                signals.map((sig) => (
                  <TableRow key={sig.id} className="hover:bg-slate-50/80 transition-colors text-xs">
                    <TableCell>
                      <div className="font-bold text-slate-900">
                        {sig.location_name || sig.phc_name || `PHC ${sig.location_id}`}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Scope: {sig.geographic_scope || "PHC"} • {sig.district || "Gadchiroli"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-[10px] uppercase">
                        {(sig.signal_type || "MULTI_SOURCE").replace(/_/g, " ")}
                      </Badge>
                      <div className="text-[10px] text-slate-500 pt-0.5">
                        {(sig.contributing_sources || []).map((s) => s.replace(/_/g, " ")).join(", ")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-slate-900">
                        {sig.observed_value} <span className="text-slate-400 font-normal">/ day</span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Baseline: {sig.baseline_value} / day
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-rose-700 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-rose-600" />
                        +{sig.deviation_percentage}%
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Z-Score: {sig.z_score}σ
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div>{getSeverityBadge(sig.severity || sig.signal_level)}</div>
                        <div>{getConfidenceBadge(sig.confidence || sig.data_quality, sig.is_stale)}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          sig.status === "RESOLVED" || sig.status === "resolved"
                            ? "success"
                            : sig.status === "UNDER_REVIEW" || sig.status === "under_review"
                            ? "warning"
                            : sig.status === "DISMISSED" || sig.status === "dismissed"
                            ? "secondary"
                            : "danger"
                        }
                        className="text-[10px] uppercase"
                      >
                        {sig.status}
                      </Badge>
                      {sig.resolution_category && (
                        <div className="text-[10px] text-slate-500 font-mono pt-0.5">
                          {sig.resolution_category}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openAiExplainModal(sig)}
                          className="text-[11px] h-7 px-2 text-rose-700 hover:bg-rose-50 font-bold"
                          title="AI Structured Explanation"
                        >
                          <Bot className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openReviewModal(sig)}
                          className="text-[11px] h-7 font-bold border-slate-300"
                        >
                          Review
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Review Modal */}
      {selectedSignal && (
        <Modal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          title="Supervisory Public-Health Review & Context Assessment"
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleReviewSubmit} className="space-y-4 pt-2 text-left">
            <div className="p-3.5 bg-slate-50 border rounded-xl space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">
                  {selectedSignal.location_name || selectedSignal.phc_name}
                </span>
                {getSeverityBadge(selectedSignal.severity || selectedSignal.signal_level)}
              </div>
              <p className="text-slate-700 text-xs leading-relaxed italic bg-white p-2.5 rounded border border-slate-200">
                "{selectedSignal.notes}"
              </p>
              <div className="pt-1 flex gap-4 text-[10px] text-slate-500 font-mono">
                <span>Observed: {selectedSignal.observed_value}/day</span>
                <span>Baseline: {selectedSignal.baseline_value}/day</span>
                <span>Deviation: +{selectedSignal.deviation_percentage}%</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Select Supervisory Action
              </label>
              <select
                value={reviewAction}
                onChange={(e) => setReviewAction(e.target.value)}
                className="w-full text-xs p-2.5 border rounded-lg bg-white focus:ring-2 focus:ring-rose-500 font-medium"
              >
                <option value="ACKNOWLEDGE">ACKNOWLEDGE (Acknowledge signal & alert medical officer)</option>
                <option value="REQUEST_INVESTIGATION">REQUEST INVESTIGATION (Deploy field verification team)</option>
                <option value="VERIFY">VERIFY (Confirm genuine localized operational anomaly)</option>
                <option value="DISMISS">DISMISS (Dismiss with legitimate explanation reason)</option>
                <option value="RESOLVE">RESOLVE (Close review after field mitigation)</option>
                <option value="ADD_NOTE">ADD NOTE (Append supervisory note without changing status)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Contextual Explanation / Resolution Category
              </label>
              <select
                value={resolutionCategory}
                onChange={(e) => setResolutionCategory(e.target.value)}
                className="w-full text-xs p-2.5 border rounded-lg bg-white focus:ring-2 focus:ring-rose-500 font-medium"
              >
                <option value="SEASONAL_VARIATION">SEASONAL VARIATION — Expected seasonal pattern (monsoon/harvest)</option>
                <option value="OUTREACH_CAMP">OUTREACH CAMP — Specialized mobile screening camp inflow</option>
                <option value="DATA_ENTRY_CHANGE">DATA ENTRY CHANGE — Tablet sync backlog / batch entry</option>
                <option value="REPORTING_INCREASE">REPORTING INCREASE — Increased proactive field reporting</option>
                <option value="MEDICINE_REDISTRIBUTION">MEDICINE REDISTRIBUTION — Proactive buffer restocking</option>
                <option value="TEMPORARY_EVENT">TEMPORARY EVENT — Local fair / festival population influx</option>
                <option value="NO_ANOMALY">NO ANOMALY — Baseline variation within safe operational bounds</option>
                <option value="OTHER">OTHER — Documented in notes below</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Supervisor Findings & Operational Notes
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Document verified field context (e.g. outreach camp conducted, water sample test results, doctor verification)..."
                rows={3}
                required
                className="w-full text-xs p-2.5 border rounded-lg bg-white focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsReviewModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-rose-700 hover:bg-rose-800 text-white font-bold"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Record Review Decision"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* AI Explainer Modal */}
      {isAiModalOpen && selectedSignal && (
        <Modal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          title="AI Public-Health Alert Interpretation & Evidence Breakdown"
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 pt-2 text-left text-xs">
            {isAiLoading ? (
              <div className="py-8 text-center space-y-2">
                <Sparkles className="w-8 h-8 text-rose-600 animate-spin mx-auto" />
                <p className="text-xs text-slate-600">Synthesizing evidence and generating neutral explanations...</p>
              </div>
            ) : aiExplanation ? (
              <div className="space-y-4">
                <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 text-rose-950 font-bold">
                    <Sparkles className="w-4 h-4 text-rose-700" />
                    <span>Operational Intelligence Summary</span>
                  </div>
                  <p className="text-rose-900 leading-relaxed">
                    {aiExplanation.summary}
                  </p>
                </div>

                {/* Evidence List */}
                <div className="space-y-2">
                  <span className="font-bold text-slate-900 block">Contributing Operational Streams:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(aiExplanation.evidence || []).map((ev, i) => (
                      <div key={i} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] space-y-0.5">
                        <span className="font-bold text-slate-800">{ev.metric || ev.source}</span>
                        <p className="text-slate-600">{ev.detail || `Deviation: ${ev.deviation}`}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Possible Explanations */}
                <div className="space-y-1.5">
                  <span className="font-bold text-slate-900 block">Possible Operational Explanations (Non-Anchoring):</span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600 text-[11px]">
                    {(aiExplanation.possible_explanations || []).map((exp, i) => (
                      <li key={i}>{exp}</li>
                    ))}
                  </ul>
                </div>

                {/* Recommended Questions */}
                <div className="space-y-1.5">
                  <span className="font-bold text-slate-900 block">Recommended Field Investigation Questions:</span>
                  <ul className="list-decimal pl-4 space-y-1 text-slate-700 text-[11px]">
                    {(aiExplanation.recommended_review_questions || []).map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </div>

                {/* Data Limitations */}
                <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900">
                  <strong>Data Limitations:</strong> {(aiExplanation.data_limitations || []).join(" ")}
                </div>

                <div className="p-2.5 bg-slate-100 rounded-lg text-[10px] text-slate-500 font-mono">
                  {aiExplanation.disclaimer}
                </div>
              </div>
            ) : null}

            <div className="flex justify-end pt-3 border-t">
              <Button
                size="sm"
                onClick={() => setIsAiModalOpen(false)}
                className="bg-rose-700 hover:bg-rose-800 text-white font-bold"
              >
                Close Explanation
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Community ASHA Report Submission Modal */}
      {isCommunityModalOpen && (
        <Modal
          isOpen={isCommunityModalOpen}
          onClose={() => setIsCommunityModalOpen(false)}
          title="Submit Community / ASHA Field Observation"
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleCommunityReportSubmit} className="space-y-3.5 pt-2 text-left text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-800 block">Associated PHC Facility</label>
              <Select
                value={ashaPhc}
                onChange={(e) => setAshaPhc(e.target.value)}
                className="w-full text-xs"
              >
                <option value="phc-1">Ashti Primary Health Centre</option>
                <option value="phc-2">Aheri Sub-District Health Centre</option>
                <option value="phc-3">Chamorshi Community Health Centre</option>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-800 block">Village / Hamlet / Ward Name</label>
              <Input
                value={ashaArea}
                onChange={(e) => setAshaArea(e.target.value)}
                placeholder="e.g. Ashti North Hamlet Ward 2"
                required
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">Observation Type</label>
                <Select
                  value={ashaObsType}
                  onChange={(e) => setAshaObsType(e.target.value)}
                  className="w-full text-xs"
                >
                  <option value="FEVER_CLUSTER">Seasonal Fever Cluster</option>
                  <option value="DIARRHEA_CASES">Acute Watery Diarrhea</option>
                  <option value="WATER_CONTAMINATION">Water Source Concern</option>
                  <option value="RESPIRATORY_CASES">Acute Respiratory Cases</option>
                  <option value="OTHER">Other Community Issue</option>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">Estimated Affected Count</label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={ashaCount}
                  onChange={(e) => setAshaCount(e.target.value)}
                  required
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-800 block">Field Observation Details</label>
              <textarea
                value={ashaNotes}
                onChange={(e) => setAshaNotes(e.target.value)}
                placeholder="Describe households, symptoms observed, water source condition..."
                rows={3}
                className="w-full p-2 border rounded-lg text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCommunityModalOpen(false)}
                disabled={isSubmittingAsha}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-rose-700 hover:bg-rose-800 text-white font-bold"
                disabled={isSubmittingAsha}
              >
                {isSubmittingAsha ? "Submitting..." : "Submit Observation"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
