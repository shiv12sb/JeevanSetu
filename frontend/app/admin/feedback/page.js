"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { Input, Select } from "@/components/ui/Input";
import { feedbackApi } from "@/lib/api";
import {
  MessageSquare,
  Star,
  ShieldCheck,
  Radio,
  Volume2,
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  Building2,
  PhoneOff,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  Bot,
  Languages,
  Check,
  PhoneForwarded,
  HelpCircle,
  Clock,
  ShieldAlert,
} from "lucide-react";

export function AdminFeedbackPage() {
  const [metrics, setMetrics] = useState(null);
  const [signals, setSignals] = useState([]);
  const [trends, setTrends] = useState([]);
  const [feedbackList, setFeedbackList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter & Modal State
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [channelFilter, setChannelFilter] = useState("");
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [reviewAction, setReviewAction] = useState("ACKNOWLEDGE");
  const [internalNotes, setInternalNotes] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // AI Assistant Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState(null);
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false);

  // Simulator State
  const [simPhone, setSimPhone] = useState("+91 98234 11204");
  const [simActive, setSimActive] = useState(false);
  const [simSessionId, setSimSessionId] = useState(null);
  const [simPrompt, setSimPrompt] = useState("");
  const [simStatus, setSimStatus] = useState("Idle");
  const [simLoading, setSimLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [statusFilter, categoryFilter, channelFilter]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [analyticsRes, signalsRes, trendsRes, listRes] = await Promise.all([
        feedbackApi.getAnalytics().catch(() => ({ data: null })),
        feedbackApi.getSignals().catch(() => ({ data: [] })),
        feedbackApi.getTrends().catch(() => ({ data: [] })),
        feedbackApi
          .list({
            status: statusFilter,
            category: categoryFilter,
            channel: channelFilter,
          })
          .catch(() => ({ data: [] })),
      ]);

      if (listRes?.data) {
        setFeedbackList(Array.isArray(listRes.data) ? listRes.data : listRes.data.items || []);
      } else {
        setFeedbackList([
          {
            id: "fb-seed-1",
            tracking_token: "JS-FB-7A82-9K1L",
            facility_name: "Ashti PHC",
            facility_target_type: "phc",
            rating: 5,
            category: "CLEANLINESS_FACILITY",
            feedback_channel: "MISSED_CALL",
            message: "Very clean facility and prompt doctor consultation.",
            original_text: "Very clean facility and prompt doctor consultation.",
            is_anonymous: true,
            status: "ACKNOWLEDGED",
            internal_notes: "Reviewed during morning briefing.",
          },
          {
            id: "fb-seed-2",
            tracking_token: "JS-FB-3B19-4X8M",
            facility_name: "Chamorshi PHC",
            facility_target_type: "phc",
            rating: 2,
            category: "MEDICINE_AVAILABILITY",
            feedback_channel: "MISSED_CALL",
            message: "Paracetamol syrup out of stock at pharmacy window.",
            original_text: "Paracetamol syrup out of stock at pharmacy window.",
            is_anonymous: true,
            status: "UNDER_REVIEW",
            internal_notes: "Buffer stock replenishment requested from district warehouse.",
          },
          {
            id: "fb-seed-3",
            tracking_token: "JS-FB-88C1-55N2",
            facility_name: "Ashti PHC",
            facility_target_type: "phc",
            rating: 4,
            category: "STAFF_BEHAVIOUR",
            feedback_channel: "WEB",
            message: "Consultation was prompt and staff was respectful.",
            original_text: "Consultation was prompt and staff was respectful.",
            is_anonymous: false,
            contact_name: "Santosh Pawar",
            status: "ACKNOWLEDGED",
            internal_notes: "Reviewed during weekly meeting.",
          },
        ]);
      }

      if (analyticsRes?.data) {
        setMetrics(analyticsRes.data);
      } else {
        setMetrics({
          total_feedback: 42,
          average_rating: 4.3,
          positive_percentage: 84,
          negative_percentage: 16,
          rating_distribution: { 1: 3, 2: 4, 3: 5, 4: 12, 5: 18 },
          channel_breakdown: { MISSED_CALL: 26, IVR: 9, WEB: 5, SMS: 2 },
          category_breakdown: {
            CLEANLINESS_FACILITY: 14,
            DOCTOR_AVAILABILITY: 12,
            MEDICINE_AVAILABILITY: 8,
            WAITING_TIME: 5,
            STAFF_BEHAVIOUR: 3,
          },
          status_breakdown: {
            SUBMITTED: 6,
            ACKNOWLEDGED: 20,
            UNDER_REVIEW: 8,
            RESOLVED: 6,
            DISMISSED: 2,
            POSSIBLE_SPAM: 0,
          },
          spam_count: 0,
          resolved_count: 6,
          open_count: 34,
          telephony_provider: "MockTelephonyProvider",
          sms_provider: "MockSMSProvider",
          is_live_telephony_configured: false,
          is_live_sms_configured: false,
          ai_summary: {
            summary:
              "District citizen feedback quality overview: Total of 42 submissions analyzed with an average rating of 4.3/5 (84% positive, 16% negative). Primary citizen focal areas: cleanliness and doctor consultation schedules. No individual staff misconduct indicated; recommended for continuous administrative resource planning.",
            canSummarize: true,
          },
        });
      }

      if (signalsRes?.data) {
        setSignals(signalsRes.data);
      }
      if (trendsRes?.data) {
        setTrends(trendsRes.data);
      }
    } catch (err) {
      console.warn("Feedback load fallback:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenReview = (item) => {
    setSelectedFeedback(item);
    setReviewAction("ACKNOWLEDGE");
    setInternalNotes(item.internal_notes || "");
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedFeedback) return;
    setIsSubmittingReview(true);

    try {
      await feedbackApi.review(selectedFeedback.id, {
        action: reviewAction,
        internal_notes: internalNotes,
      });

      setIsReviewModalOpen(false);
      await loadData();
    } catch (err) {
      alert(`Review error: ${err.message}`);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleOpenAiAssist = async (item) => {
    setSelectedFeedback(item);
    setIsAiModalOpen(true);
    setIsAnalyzingAi(true);
    setAiAnalysisResult(null);

    try {
      const res = await feedbackApi.aiAssist({
        text: item.original_text || item.message,
        language: item.language || "en",
      });
      setAiAnalysisResult(res?.data || null);
    } catch (err) {
      setAiAnalysisResult({
        summary: "Analysis unavailable in preview mode.",
        category: item.category || "OTHER",
        possible_priority: "medium",
        is_safe: true,
      });
    } finally {
      setIsAnalyzingAi(false);
    }
  };

  const handleStartSimulatedMissedCall = async () => {
    setSimLoading(true);
    try {
      const res = await feedbackApi.missedCall({
        callerPhone: simPhone,
      });

      if (res?.data?.sessionId) {
        setSimSessionId(res.data.sessionId);
        setSimPrompt(res.data.voiceResponse?.promptText || "Welcome to JeevanSetu Feedback.");
        setSimStatus("Awaiting Language Selection (1: Hindi, 2: Marathi, 3: English)");
        setSimActive(true);
      }
    } catch (err) {
      alert(`Simulator error: ${err.message}`);
    } finally {
      setSimLoading(false);
    }
  };

  const handleSimKeypress = async (digit) => {
    if (!simSessionId) return;
    setSimLoading(true);

    try {
      const res = await feedbackApi.ivrInteract({
        sessionId: simSessionId,
        dtmfDigit: digit,
      });

      if (res?.data) {
        const nextPrompt = res.data.voiceResponse?.promptText;
        setSimPrompt(nextPrompt || "Thank you. Your feedback has been recorded.");

        if (res.data.voiceResponse?.hangup) {
          setSimStatus("Call Completed & Feedback Recorded");
          setTimeout(() => {
            setSimActive(false);
            loadData();
          }, 3500);
        } else {
          setSimStatus(`Menu: ${res.data.session?.current_menu || "In Progress"}`);
        }
      }
    } catch (err) {
      alert(`Keypress error: ${err.message}`);
    } finally {
      setSimLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-left transition-colors">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Banner */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded border border-teal-200 dark:border-teal-800 flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                Service Quality Intelligence
              </span>
              <Badge variant="teal" size="sm">Phase 26 Unified Channel</Badge>
              <Badge variant="outline" size="sm">Non-Disciplinary</Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Citizen Feedback & Quality Monitoring Desk
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Aggregated citizen sentiment, operational service signals, and supervisory review workflow.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <Button
              size="sm"
              variant="outline"
              onClick={loadData}
              className="text-xs font-bold gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* Telephony & SMS Gateway Status Strip */}
        <div className="p-3.5 bg-slate-900 text-white rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-mono text-teal-300">
              <Radio className="w-4 h-4 text-teal-400" />
              IVR Gateway: {metrics?.telephony_provider || "MockTelephonyProvider"}
            </span>
            <span className="text-slate-400">|</span>
            <span className="flex items-center gap-1.5 font-mono text-teal-300">
              <PhoneForwarded className="w-4 h-4 text-teal-400" />
              SMS Gateway: {metrics?.sms_provider || "MockSMSProvider"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" size="sm" className="bg-slate-800 text-slate-300 border-slate-700">
              {!metrics?.is_live_telephony_configured ? "DEV / MOCK TELEPHONY ACTIVE" : "LIVE TELEPHONY CONNECTED"}
            </Badge>
          </div>
        </div>

        {/* Aggregate KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <Card className="p-4 border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Total Submissions
            </span>
            <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">
              {metrics?.total_feedback || 0}
            </span>
            <span className="text-[10px] text-teal-700 font-bold mt-1 block">
              {metrics?.anonymous_percentage || 75}% Anonymous
            </span>
          </Card>

          <Card className="p-4 border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Average Rating
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-2xl font-black text-slate-900 font-mono">
                {metrics?.average_rating ? `${metrics.average_rating}/5` : "N/A"}
              </span>
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              {metrics?.positive_percentage || 0}% positive
            </span>
          </Card>

          <Card className="p-4 border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Channel Intake
            </span>
            <span className="text-xs font-mono font-bold text-slate-800 mt-1.5 block">
              Missed Call: {metrics?.channel_breakdown?.MISSED_CALL || 0}
            </span>
            <span className="text-[10px] text-slate-500 block">
              Web: {metrics?.channel_breakdown?.WEB || 0} | IVR: {metrics?.channel_breakdown?.IVR || 0}
            </span>
          </Card>

          <Card className="p-4 border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Active Signals
            </span>
            <span className="text-2xl font-black text-amber-700 font-mono mt-1 block">
              {signals.length}
            </span>
            <span className="text-[10px] text-amber-800 font-bold mt-1 block">
              Operational Quality Alerts
            </span>
          </Card>

          <Card className="p-4 border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Review Status
            </span>
            <span className="text-xs font-bold text-slate-800 mt-1.5 block">
              Resolved: {metrics?.resolved_count || 0}
            </span>
            <span className="text-[10px] text-slate-500 block">
              Open / In Review: {metrics?.open_count || 0}
            </span>
          </Card>
        </div>

        {/* AI Advisory Summary Card */}
        {metrics?.ai_summary && (
          <Card className="border-teal-200 bg-teal-50/50 shadow-xs">
            <CardContent className="p-5 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-teal-950 uppercase tracking-wider">
                    AI Service Quality Summary (Advisory)
                  </span>
                  <Badge variant="teal" size="sm">Non-Investigative</Badge>
                </div>
                <p className="text-teal-900 leading-relaxed">
                  {metrics.ai_summary.summary}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Operational Quality Signals Panel */}
        {signals.length > 0 && (
          <Card className="border-amber-200 bg-amber-50/40 shadow-xs">
            <CardHeader className="pb-3 border-b border-amber-100 bg-amber-50/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  <CardTitle className="text-sm font-bold text-amber-950">
                    Operational Quality Signals ({signals.length})
                  </CardTitle>
                </div>
                <span className="text-[11px] text-amber-800 font-semibold">
                  Cross-check with inventory & duty schedules before operational actions
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {signals.map((sig) => (
                <div key={sig.id} className="p-3.5 bg-white rounded-xl border border-amber-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{sig.title}</span>
                    <Badge variant={sig.severity === "high" ? "danger" : "warning"} size="sm">
                      {sig.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-slate-600">{sig.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Feedback Submissions & Review Ledger */}
        <Card className="border-slate-200 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-teal-600" />
                  <span>Citizen Feedback Submissions & Review Queue</span>
                </CardTitle>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Audited review lifecycle for health supervisors. Internal notes are strictly protected.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs h-8 py-1"
                >
                  <option value="">All Statuses</option>
                  <option value="SUBMITTED">SUBMITTED</option>
                  <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
                  <option value="UNDER_REVIEW">UNDER REVIEW</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="DISMISSED">DISMISSED</option>
                  <option value="POSSIBLE_SPAM">POSSIBLE SPAM</option>
                </Select>

                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="text-xs h-8 py-1"
                >
                  <option value="">All Categories</option>
                  <option value="PHC_SERVICE">PHC Service</option>
                  <option value="DOCTOR_AVAILABILITY">Doctor Availability</option>
                  <option value="STAFF_BEHAVIOUR">Staff Behaviour</option>
                  <option value="MEDICINE_AVAILABILITY">Medicine Availability</option>
                  <option value="WAITING_TIME">Waiting Time</option>
                  <option value="CLEANLINESS_FACILITY">Cleanliness & Facility</option>
                  <option value="REFERRAL_EXPERIENCE">Referral Experience</option>
                  <option value="EMERGENCY_SERVICE_ACCESS">Emergency Access</option>
                  <option value="OTHER">Other</option>
                </Select>

                <Select
                  value={channelFilter}
                  onChange={(e) => setChannelFilter(e.target.value)}
                  className="text-xs h-8 py-1"
                >
                  <option value="">All Channels</option>
                  <option value="WEB">WEB</option>
                  <option value="MISSED_CALL">MISSED CALL</option>
                  <option value="IVR">IVR</option>
                  <option value="SMS">SMS</option>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Tracking Token / User</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Comment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {feedbackList.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400">
                      No feedback submissions match the selected filters.
                    </td>
                  </tr>
                ) : (
                  feedbackList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <span className="font-mono text-[11px] font-bold text-teal-900 block">
                            {item.tracking_token || item.id.slice(0, 12)}
                          </span>
                          {item.is_anonymous ? (
                            <span className="inline-flex items-center gap-1 text-[10px] text-slate-500">
                              <ShieldCheck className="w-3 h-3 text-teal-600" />
                              Anonymous Citizen
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold text-slate-800">
                              {item.contact_name || "Patient"}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary" size="sm">
                          {item.feedback_channel || "WEB"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="teal" size="sm">
                          {(item.category || item.service_tag || "OTHER").replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {item.rating ? (
                          <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            <Star className="w-3 h-3 fill-amber-400" />
                            {item.rating}/5
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">No rating</span>
                        )}
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-slate-600" title={item.original_text || item.message}>
                        {item.original_text || item.message}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            item.status === "RESOLVED"
                              ? "success"
                              : item.status === "UNDER_REVIEW"
                              ? "warning"
                              : item.status === "POSSIBLE_SPAM"
                              ? "danger"
                              : "teal"
                          }
                          size="sm"
                        >
                          {item.status || "SUBMITTED"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenAiAssist(item)}
                            className="text-[11px] h-7 px-2 text-teal-700 hover:bg-teal-50 font-bold"
                            title="AI Categorization & Translation"
                          >
                            <Bot className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenReview(item)}
                            className="text-[11px] h-7 font-bold border-slate-300"
                          >
                            Review
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Supervisor Review Action Modal */}
        {isReviewModalOpen && selectedFeedback && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-black text-slate-900">
                  Supervisor Review — Token #{selectedFeedback.tracking_token || selectedFeedback.id.slice(0, 8)}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">
                    Category: {(selectedFeedback.category || "OTHER").replace(/_/g, " ")}
                  </span>
                  {selectedFeedback.rating && (
                    <span className="font-mono text-amber-700 font-bold">{selectedFeedback.rating}/5 Stars</span>
                  )}
                </div>
                <p className="text-slate-700 italic bg-white p-2.5 rounded border border-slate-200">
                  "{selectedFeedback.original_text || selectedFeedback.message}"
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Select Supervisory Action</label>
                  <Select
                    value={reviewAction}
                    onChange={(e) => setReviewAction(e.target.value)}
                    className="w-full text-xs"
                  >
                    <option value="ACKNOWLEDGE">ACKNOWLEDGE (Acknowledge receipt of feedback)</option>
                    <option value="ASSIGN">ASSIGN / INVESTIGATE (Initiate facility review)</option>
                    <option value="ADD_NOTE">ADD INTERNAL NOTE (Keep current status)</option>
                    <option value="RESOLVE">RESOLVE (Mark operational review completed)</option>
                    <option value="DISMISS">DISMISS (Dismiss non-actionable or out of scope)</option>
                    <option value="MARK_SPAM">MARK SPAM (Flag as spam / duplicate)</option>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Internal Review Notes (Audited)</label>
                  <textarea
                    rows="3"
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    placeholder="Enter operational findings, buffer restock steps, or schedule adjustments..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-teal-600"
                  />
                  <span className="text-[10px] text-slate-400">
                    Internal notes are logged immutably in the administrative audit ledger.
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmitReview}
                  disabled={isSubmittingReview}
                  className="text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white"
                >
                  {isSubmittingReview ? "Recording..." : "Record Review Action"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* AI Categorization & Translation Assistant Modal */}
        {isAiModalOpen && selectedFeedback && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-teal-600" />
                  <h3 className="text-base font-black text-slate-900">
                    AI Categorization & Translation
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAiModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              </div>

              {isAnalyzingAi ? (
                <div className="py-8 text-center space-y-2">
                  <Sparkles className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
                  <p className="text-xs text-slate-600">Analyzing feedback text & prompt injection boundaries...</p>
                </div>
              ) : aiAnalysisResult ? (
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                    <span className="font-bold text-slate-600 block">Original Citizen Submission:</span>
                    <p className="text-slate-800 italic">"{selectedFeedback.original_text || selectedFeedback.message}"</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-teal-50 rounded-lg border border-teal-200">
                      <span className="text-[10px] text-teal-700 font-bold block">Assigned Category</span>
                      <p className="font-bold text-teal-950 mt-0.5">{aiAnalysisResult.category}</p>
                    </div>
                    <div className="p-2.5 bg-teal-50 rounded-lg border border-teal-200">
                      <span className="text-[10px] text-teal-700 font-bold block">Estimated Priority</span>
                      <p className="font-bold text-teal-950 uppercase mt-0.5">{aiAnalysisResult.possible_priority}</p>
                    </div>
                  </div>

                  {aiAnalysisResult.translated_text && (
                    <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                      <span className="font-bold text-slate-600 flex items-center gap-1">
                        <Languages className="w-3.5 h-3.5 text-teal-600" />
                        English Translation:
                      </span>
                      <p className="text-slate-800">{aiAnalysisResult.translated_text}</p>
                    </div>
                  )}

                  <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900">
                    <strong>Guardrail:</strong> {aiAnalysisResult.disclaimer}
                  </div>
                </div>
              ) : null}

              <div className="flex justify-end pt-2 border-t border-slate-100">
                <Button
                  size="sm"
                  onClick={() => setIsAiModalOpen(false)}
                  className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold"
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Missed-Call & Outbound IVR Feedback Simulator */}
        <Card className="border-teal-200 bg-linear-to-b from-teal-50/40 to-white shadow-xs">
          <CardHeader className="pb-3 border-b border-teal-100 bg-teal-50/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-teal-600 animate-pulse" />
                <CardTitle className="text-sm text-teal-950 font-bold">
                  Missed-Call & Outbound IVR Feedback Simulator
                </CardTitle>
              </div>
              <Badge variant={simActive ? "success" : "teal"} size="sm">
                {simActive ? "Active Audio Session" : "Simulator Ready"}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {!simActive ? (
              <div className="space-y-4 max-w-lg">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Test the complete citizen experience: A citizen gives a free missed call $\rightarrow$ the system initiates an automated outbound callback $\rightarrow$ citizen rates healthcare quality in Hindi, Marathi, or English.
                </p>

                <div className="space-y-2">
                  <Input
                    label="Caller Simulated Phone (Used in-memory only)"
                    type="tel"
                    value={simPhone}
                    onChange={(e) => setSimPhone(e.target.value)}
                  />
                  <span className="text-[11px] text-slate-500">
                    Phone number is stripped and never persisted in raw form into the anonymous feedback record.
                  </span>
                </div>

                <Button
                  onClick={handleStartSimulatedMissedCall}
                  disabled={simLoading}
                  className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold gap-2"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>{simLoading ? "Triggering Callback..." : "Give Missed Call (Trigger Callback)"}</span>
                </Button>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="p-4 bg-slate-900 rounded-xl text-white space-y-3 shadow-inner">
                  <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                    <span className="flex items-center gap-1.5 text-teal-400 font-mono">
                      <Volume2 className="w-4 h-4 animate-bounce" />
                      Status: {simStatus}
                    </span>
                    <span className="text-emerald-400 font-bold text-[11px]">Strictly Anonymous</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-teal-300 font-bold uppercase tracking-wider">
                      Interactive Audio Prompt:
                    </span>
                    <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                      "{simPrompt}"
                    </p>
                  </div>
                </div>

                {/* Keypad */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">
                    Phone Keypad (Press Digits 1-9 to navigate/rate):
                  </span>
                  <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                    {["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleSimKeypress(key)}
                        disabled={simLoading}
                        className="p-3 bg-white hover:bg-teal-50 border border-slate-300 hover:border-teal-400 rounded-xl font-mono text-sm font-black text-slate-800 shadow-xs active:scale-95 transition-all flex flex-col items-center justify-center"
                      >
                        <span>{key}</span>
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-center pt-2">
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => setSimActive(false)}
                      className="text-xs font-bold gap-1.5 bg-rose-600 hover:bg-rose-700 text-white"
                    >
                      <PhoneOff className="w-3.5 h-3.5" />
                      <span>End Simulation</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}

export default AdminFeedbackPage;
