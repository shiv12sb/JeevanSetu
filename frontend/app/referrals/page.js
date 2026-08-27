"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ReferralCard } from "@/components/domain/ReferralCard";
import { Tabs } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { StatusTimeline } from "@/components/shared/StatusTimeline";
import { mockReferrals, mockHospitals } from "@/lib/mockData";
import { referralsApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { AuthGuard } from "@/components/shared/AuthGuard";
import {
  GitPullRequest,
  Plus,
  Search,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Clock,
  Building2,
  ArrowRight,
  ShieldAlert,
  Activity,
  Check,
  Truck,
  Calendar,
  CheckCheck,
  TrendingUp,
} from "lucide-react";

const CLOSED_LOOP_STAGES = [
  { id: "created", label: "Referral Created", step: 1 },
  { id: "patient_notified", label: "Patient Notified", step: 2 },
  { id: "destination_accepted", label: "Hospital Accepted", step: 3 },
  { id: "transport_arranged", label: "Transport Arranged", step: 4 },
  { id: "patient_departed", label: "Patient Departed PHC", step: 5 },
  { id: "patient_reached", label: "Arrived at Hospital", step: 6 },
  { id: "hospital_registered", label: "Hospital Registered", step: 7 },
  { id: "treatment_started", label: "Treatment Started", step: 8 },
  { id: "follow_up_required", label: "Follow-Up Required", step: 9 },
  { id: "closed", label: "Closed Loop Care", step: 10 },
];

export function ReferralsPage() {
  const { user } = useAuth();
  const [activeMainTab, setActiveMainTab] = useState("referrals");
  const [referrals, setReferrals] = useState(mockReferrals);
  const [followUps, setFollowUps] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");
  const [filterStage, setFilterStage] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTransportModalOpen, setIsTransportModalOpen] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [isUpdateStageModalOpen, setIsUpdateStageModalOpen] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form States
  const [department, setDepartment] = useState("Interventional Cardiology");
  const [priority, setPriority] = useState("urgent");
  const [clinicalSummary, setClinicalSummary] = useState("");

  // Transport Form
  const [ngoId, setNgoId] = useState("ngo-1");
  const [transportNotes, setTransportNotes] = useState("");

  // Follow-Up Form
  const [followUpDate, setFollowUpDate] = useState(new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]);
  const [followUpNotes, setFollowUpNotes] = useState("Post-discharge recovery checkup at originating PHC.");

  // Stage Update Form
  const [nextStage, setNextStage] = useState("patient_notified");
  const [stageNote, setStageNote] = useState("");

  const loadReferrals = async () => {
    setIsLoading(true);
    setApiError("");
    try {
      const [refRes, fuRes, anaRes] = await Promise.all([
        referralsApi.list().catch(() => null),
        referralsApi.getFollowUps().catch(() => null),
        referralsApi.getClosedLoopAnalytics().catch(() => null),
      ]);

      if (fuRes?.data) setFollowUps(fuRes.data);
      if (anaRes?.data) setAnalytics(anaRes.data);

      if (refRes && refRes.data && refRes.data.length > 0) {
        const mapped = refRes.data.map((r) => {
          const matchingFu = (fuRes?.data || []).find((f) => f.referral_id === r.id);
          return {
            id: r.referral_number || r.id,
            rawId: r.id,
            caseId: r.case_id,
            patientName: r.profiles?.full_name || "Healthcare Citizen",
            patientPhone: r.profiles?.phone || "+91 98234 11204",
            patientAge: 45,
            patientGender: "Male",
            fromFacility: r.phcs?.name || "Ashti Primary Health Centre",
            toFacility: r.hospitals?.name || "District Civil Hospital Gadchiroli",
            department: r.required_specialty,
            priority: r.priority || "urgent",
            currentStage: r.status || "created",
            currentStageLabel: (r.status || "created").replace(/_/g, " ").toUpperCase(),
            transportStatus: r.transport_status || "not_required",
            requiresFollowUp: r.requires_follow_up || false,
            followUpDate: r.follow_up_date,
            followUpStatus: matchingFu?.follow_up_status || (r.status === "closed" ? "RESOLVED" : "MONITORING"),
            delayStatus: r.delay_status || "NORMAL",
            nextMilestone: matchingFu?.expected_milestone_label || null,
            dueAt: matchingFu?.due_at || null,
            createdAt: r.created_at,
            steps: mockReferrals[0]?.steps || [],
          };
        });
        setReferrals(mapped);
      }
    } catch (err) {
      console.warn("Could not fetch referrals from backend, showing fallback:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReferrals();
  }, []);

  const handleCreateReferral = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setApiError("");
    setApiSuccess("");

    const newRefPayload = {
      case_id: "c1a2b3c4-5d6e-7f8a-9b0c-1d2e3f4a5b6c",
      originating_phc_id: "phc-1",
      destination_hospital_id: "hosp-1",
      required_specialty: department,
      priority,
      clinical_summary: clinicalSummary || "Patient requires tertiary specialty care.",
    };

    try {
      await referralsApi.create(newRefPayload);
      setApiSuccess("Referral initiated and transmitted to destination hospital.");
      setIsCreateModalOpen(false);
      setClinicalSummary("");
      loadReferrals();
    } catch (err) {
      setApiError(err.message || "Failed to create referral.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStage = async (e) => {
    e.preventDefault();
    if (!selectedReferral) return;
    setIsSubmitting(true);
    setApiError("");
    setApiSuccess("");

    try {
      await referralsApi.update(selectedReferral.rawId || selectedReferral.id, {
        status: nextStage,
        note: stageNote || `Stage advanced to ${nextStage.replace(/_/g, " ").toUpperCase()}`,
      });
      setApiSuccess(`Referral stage advanced to ${nextStage.replace(/_/g, " ").toUpperCase()}.`);
      setIsUpdateStageModalOpen(false);
      setStageNote("");
      loadReferrals();
    } catch (err) {
      setApiError(err.message || "Failed to advance referral stage.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignTransport = async (e) => {
    e.preventDefault();
    if (!selectedReferral) return;
    setIsSubmitting(true);
    setApiError("");
    setApiSuccess("");

    try {
      await referralsApi.assignTransport(selectedReferral.rawId || selectedReferral.id, {
        ngo_id: ngoId,
        notes: transportNotes || "Ambulance transport assigned for patient transfer.",
      });
      setApiSuccess("NGO transport assigned successfully.");
      setIsTransportModalOpen(false);
      setTransportNotes("");
      loadReferrals();
    } catch (err) {
      setApiError(err.message || "Failed to assign transport.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScheduleFollowUp = async (e) => {
    e.preventDefault();
    if (!selectedReferral) return;
    setIsSubmitting(true);
    setApiError("");
    setApiSuccess("");

    try {
      await referralsApi.scheduleFollowUp(selectedReferral.rawId || selectedReferral.id, {
        follow_up_date: followUpDate,
        follow_up_notes: followUpNotes,
      });
      setApiSuccess("Post-discharge follow-up scheduled successfully.");
      setIsFollowUpModalOpen(false);
      loadReferrals();
    } catch (err) {
      setApiError(err.message || "Failed to schedule follow-up.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteFollowUp = async (refId) => {
    try {
      await referralsApi.completeFollowUp(refId, {
        notes: "Follow-up verification completed at Primary Health Centre. Patient recovered.",
      });
      setApiSuccess("Follow-up completed and referral closed loop achieved.");
      loadReferrals();
    } catch (err) {
      setApiError(err.message || "Failed to complete follow-up.");
    }
  };

  const filteredReferrals = referrals.filter((r) => {
    const matchesSearch =
      r.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.department.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterStage === "active") return matchesSearch && r.currentStage !== "completed" && r.currentStage !== "closed";
    if (filterStage === "completed") return matchesSearch && (r.currentStage === "completed" || r.currentStage === "closed");
    if (filterStage === "followup") return matchesSearch && r.requiresFollowUp;
    return matchesSearch;
  });

  const categoryTabs = [
    { id: "all", label: `All Referrals (${referrals.length})` },
    { id: "active", label: `Active In-Transit (${referrals.filter(r => r.currentStage !== 'completed' && r.currentStage !== 'closed').length})` },
    { id: "followup", label: `Follow-Up Due (${referrals.filter(r => r.requiresFollowUp).length})` },
    { id: "completed", label: `Closed Loop (${referrals.filter(r => r.currentStage === 'completed' || r.currentStage === 'closed').length})` },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <AuthGuard featureName="रेफरल ट्रॅकिंग (Referral Intelligence & Care Tracking)">
          {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="teal" size="sm" className="font-bold">
                Closed-Loop Care Coordination
              </Badge>
              <Badge variant="default" size="sm">
                10-Step Lifecycle Tracking
              </Badge>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Patient Referral Intelligence & Closed-Loop Care
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              Track referrals seamlessly from PHC creation through transport, hospital triage, specialist treatment, and post-discharge follow-up.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="md"
              variant="outline"
              className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold gap-2"
              onClick={loadReferrals}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>
            <Button
              size="md"
              variant="primary"
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold gap-2"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="w-4 h-4" />
              <span>Create Referral</span>
            </Button>
          </div>
        </div>

        {/* Clinical Safety Notice */}
        <Alert variant="info" className="text-xs py-2">
          <strong>Care-Coordination Boundary:</strong> JeevanSetu referral intelligence manages operational logistics and care continuity. It does not replace medical practitioners or make autonomous clinical diagnoses.
        </Alert>

        {apiError && (
          <Alert variant="danger" title="Action Failed">
            {apiError}
          </Alert>
        )}

        {apiSuccess && (
          <Alert variant="success" title="Success">
            {apiSuccess}
          </Alert>
        )}

        {/* Closed Loop Analytics KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="p-4 border-slate-200 dark:border-slate-800">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Tracked</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1 font-mono">{referrals.length} Referrals</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Across district health network</div>
          </Card>
          <Card className="p-4 border-slate-200 dark:border-slate-800">
            <div className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">Hospital Arrival Rate</div>
            <div className="text-2xl font-bold text-teal-700 dark:text-teal-300 mt-1 font-mono">{analytics?.hospital_arrival_rate_percentage || 100}%</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Avg. transit: {analytics?.average_transit_to_hospital_hours || 3.5}h</div>
          </Card>
          <Card className="p-4 border-slate-200 dark:border-slate-800">
            <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Treatment Start Rate</div>
            <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 mt-1 font-mono">{analytics?.treatment_initiation_rate_percentage || 100}%</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Triage to care: {analytics?.average_arrival_to_treatment_hours || 1.2}h</div>
          </Card>
          <Card className="p-4 border-slate-200 dark:border-slate-800">
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Closed-Loop Completion</div>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-1 font-mono">{analytics?.completion_rate_percentage || 100}%</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Follow-up verified & closed</div>
          </Card>
        </div>

        {/* Search & Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Tabs tabs={categoryTabs} activeTab={filterStage} onChange={setFilterStage} />
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search referral ID or patient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Referral Cards List */}
        <div className="space-y-4">
          {filteredReferrals.length === 0 ? (
            <Card className="p-8 text-center border-slate-200 dark:border-slate-800">
              <p className="text-slate-500 dark:text-slate-400 text-sm">No referrals match the selected criteria.</p>
            </Card>
          ) : (
            filteredReferrals.map((referral) => {
              const currentStageObj = CLOSED_LOOP_STAGES.find((s) => s.id === referral.currentStage) || CLOSED_LOOP_STAGES[0];
              const isClosed = referral.currentStage === "completed" || referral.currentStage === "closed";

              return (
                <Card key={referral.id} className="p-5 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-4">
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-sm text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                        {referral.id}
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{referral.patientName}</span>
                      <Badge
                        variant={referral.priority === "emergency" ? "rose" : referral.priority === "urgent" ? "amber" : "slate"}
                        size="sm"
                        className="font-bold uppercase text-[10px]"
                      >
                        {referral.priority}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant={isClosed ? "teal" : "blue"}
                        size="sm"
                        className="font-bold"
                      >
                        Step {currentStageObj.step}/10: {currentStageObj.label}
                      </Badge>
                    </div>
                  </div>

                  {/* Route & Department Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <div className="text-slate-400 font-medium">Originating PHC</div>
                      <div className="font-semibold text-slate-800 mt-0.5">{referral.fromFacility}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 font-medium">Destination Hospital</div>
                      <div className="font-semibold text-slate-800 mt-0.5">{referral.toFacility}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 font-medium">Specialty / Department</div>
                      <div className="font-semibold text-slate-800 mt-0.5">{referral.department}</div>
                    </div>
                  </div>

                  {/* 10-Step Milestone Visualizer */}
                  <div className="pt-2">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Care Continuity Milestone Progress
                    </div>
                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-1 text-center">
                      {CLOSED_LOOP_STAGES.map((st) => {
                        const isCompleted = currentStageObj.step >= st.step;
                        const isCurrent = currentStageObj.id === st.id;

                        return (
                          <div
                            key={st.id}
                            className={`p-1 rounded text-[10px] font-semibold border transition-all ${
                              isCurrent
                                ? "bg-teal-600 text-white border-teal-700 font-bold shadow-sm"
                                : isCompleted
                                ? "bg-teal-50 text-teal-800 border-teal-200"
                                : "bg-slate-50 text-slate-400 border-slate-200"
                            }`}
                            title={st.label}
                          >
                            <div className="font-mono">{st.step}</div>
                            <div className="truncate text-[9px]">{st.label.split(" ")[0]}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <div className="text-xs text-slate-500">
                      {referral.requiresFollowUp && (
                        <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          Follow-up Scheduled: {referral.followUpDate || "Pending"}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {!isClosed && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs border-slate-300 text-slate-700 font-bold"
                            onClick={() => {
                              setSelectedReferral(referral);
                              setIsTransportModalOpen(true);
                            }}
                          >
                            <Truck className="w-3.5 h-3.5 mr-1" />
                            Assign Transport
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs border-indigo-300 text-indigo-700 hover:bg-indigo-50 font-bold"
                            onClick={() => {
                              setSelectedReferral(referral);
                              setIsFollowUpModalOpen(true);
                            }}
                          >
                            <Calendar className="w-3.5 h-3.5 mr-1" />
                            Schedule Follow-Up
                          </Button>

                          <Button
                            size="sm"
                            variant="primary"
                            className="h-7 text-xs bg-teal-600 hover:bg-teal-700 text-white font-bold"
                            onClick={() => {
                              setSelectedReferral(referral);
                              setIsUpdateStageModalOpen(true);
                            }}
                          >
                            Advance Stage
                          </Button>
                        </>
                      )}

                      {referral.requiresFollowUp && !isClosed && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs border-emerald-400 text-emerald-700 hover:bg-emerald-50 font-bold"
                          onClick={() => handleCompleteFollowUp(referral.rawId || referral.id)}
                        >
                          <CheckCheck className="w-3.5 h-3.5 mr-1" />
                          Complete & Close
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Modal: Create Referral */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Initiate Primary Health Centre Referral"
        >
          <form onSubmit={handleCreateReferral} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Destination Hospital *</label>
              <Select value="hosp-1" onChange={() => {}}>
                <option value="hosp-1">District Civil Hospital Gadchiroli</option>
                <option value="hosp-2">Sub-District Hospital Aheri</option>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Specialty Department *</label>
              <Input
                type="text"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Interventional Cardiology"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Priority *</label>
              <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="routine">Routine Care Transfer</option>
                <option value="urgent">Urgent Secondary Referral</option>
                <option value="emergency">Emergency Transfer (108 Ambulance)</option>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Summary *</label>
              <Textarea
                rows={3}
                required
                value={clinicalSummary}
                onChange={(e) => setClinicalSummary(e.target.value)}
                placeholder="Summarize diagnosis context and rationale for referral transfer."
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? "Initiating..." : "Initiate Referral"}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal: Assign Transport */}
        <Modal
          isOpen={isTransportModalOpen}
          onClose={() => setIsTransportModalOpen(false)}
          title={`Assign Transport — ${selectedReferral?.id}`}
        >
          <form onSubmit={handleAssignTransport} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Transport Provider *</label>
              <Select value={ngoId} onChange={(e) => setNgoId(e.target.value)}>
                <option value="ngo-1">Arogya Vahini Rural Ambulance Network</option>
                <option value="ngo-2">Jan Swasthya Emergency Transit</option>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Transport Notes</label>
              <Textarea
                rows={2}
                value={transportNotes}
                onChange={(e) => setTransportNotes(e.target.value)}
                placeholder="Vehicle number, driver contact, or oxygen support notes..."
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsTransportModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? "Assigning..." : "Assign Transport"}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal: Schedule Follow-Up */}
        <Modal
          isOpen={isFollowUpModalOpen}
          onClose={() => setIsFollowUpModalOpen(false)}
          title={`Schedule Post-Discharge Follow-Up — ${selectedReferral?.id}`}
        >
          <form onSubmit={handleScheduleFollowUp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Follow-Up Date *</label>
              <Input
                type="date"
                required
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Follow-Up Instructions / Notes</label>
              <Textarea
                rows={2}
                value={followUpNotes}
                onChange={(e) => setFollowUpNotes(e.target.value)}
                placeholder="Follow-up rehabilitation, medication review, or suture removal notes..."
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsFollowUpModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? "Scheduling..." : "Confirm Follow-Up"}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal: Advance Stage */}
        <Modal
          isOpen={isUpdateStageModalOpen}
          onClose={() => setIsUpdateStageModalOpen(false)}
          title={`Advance Milestone — ${selectedReferral?.id}`}
        >
          <form onSubmit={handleUpdateStage} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Milestone Stage *</label>
              <Select value={nextStage} onChange={(e) => setNextStage(e.target.value)}>
                <option value="patient_notified">2. Patient Notified & Briefed</option>
                <option value="destination_accepted">3. Destination Hospital Accepted</option>
                <option value="transport_arranged">4. Transport Arranged</option>
                <option value="patient_departed">5. Patient Departed PHC</option>
                <option value="patient_reached">6. Arrived at Hospital</option>
                <option value="hospital_registered">7. Hospital Registered & Triaged</option>
                <option value="treatment_started">8. Treatment Started</option>
                <option value="follow_up_required">9. Follow-Up Required</option>
                <option value="completed">10. Completed & Closed</option>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Milestone Log Note</label>
              <Textarea
                rows={2}
                value={stageNote}
                onChange={(e) => setStageNote(e.target.value)}
                placeholder="Log event details for chronological audit trail..."
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsUpdateStageModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? "Advancing..." : "Advance Milestone"}
              </Button>
            </div>
          </form>
        </Modal>
        </AuthGuard>
      </main>

      <Footer />
    </div>
  );
}

export default ReferralsPage;
