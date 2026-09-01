"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CaseSummaryCard } from "@/components/domain/CaseSummaryCard";
import { AssistanceNavigatorCard } from "@/components/domain/AssistanceNavigatorCard";
import { TravelReadinessChecklist } from "@/components/domain/TravelReadinessChecklist";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { Alert } from "@/components/ui/Alert";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { mockPatientCases } from "@/lib/mockData";
import { casesApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { AuthGuard } from "@/components/shared/AuthGuard";
import {
  FileText,
  Plus,
  Activity,
  HeartHandshake,
  BookOpen,
  User,
  Users,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  Stethoscope,
} from "lucide-react";

export function CasesPage() {
  const { user } = useAuth();
  const [cases, setCases] = useState(mockPatientCases);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
  const [selectedCaseForVitals, setSelectedCaseForVitals] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCaseForDetail, setSelectedCaseForDetail] = useState(null);
  const [activeDetailTab, setActiveDetailTab] = useState("overview");

  // New Case Form
  const [patientName, setPatientName] = useState("");
  const [caregiverMode, setCaregiverMode] = useState("myself");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [category, setCategory] = useState("Cardiology");
  const [urgency, setUrgency] = useState("routine");
  const [primarySymptoms, setPrimarySymptoms] = useState("");

  // Vitals Form
  const [systolicBp, setSystolicBp] = useState("120");
  const [diastolicBp, setDiastolicBp] = useState("80");
  const [pulseRate, setPulseRate] = useState("72");
  const [bloodSugar, setBloodSugar] = useState("110");
  const [temperature, setTemperature] = useState("98.4");
  const [hemoglobin, setHemoglobin] = useState("13.5");
  const [vitalsNotes, setVitalsNotes] = useState("");

  const loadCases = async () => {
    setIsLoading(true);
    setApiError("");
    try {
      const res = await casesApi.list();
      if (res && res.data && res.data.length > 0) {
        const mapped = res.data.map((c) => ({
          id: c.case_number || c.id,
          rawId: c.id,
          patientId: c.patient_id,
          patientName: c.profiles?.full_name || user?.full_name || "Healthcare Citizen",
          caregiverRelationship: c.caregiver_mode || "myself",
          age: 45,
          gender: "Male",
          primarySymptoms: c.primary_concern,
          category: c.category || "General Medicine",
          urgency: c.urgency || "routine",
          vitals: { bp: "120/80", pulse: "72 bpm", spo2: "98%", temp: "98.4 F" },
          initialDiagnosisImpression: c.category || "Clinical Intake",
          status: c.status || "open",
          phcName: c.phcs?.name || "Ashti Primary Health Centre",
          createdAt: c.created_at,
          updatedAt: c.updated_at,
          documentsCount: 1,
          notes: c.notes || "Case registered.",
          assistancePathways: mockPatientCases[0]?.assistancePathways || [],
        }));
        setCases(mapped);
      }
    } catch (err) {
      console.warn("Could not fetch cases from backend, showing fallback:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, []);

  const handleCreateCase = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setApiError("");
    setApiSuccess("");

    const newCasePayload = {
      primary_concern: primarySymptoms || "Routine healthcare consultation",
      category,
      urgency,
      caregiver_mode: caregiverMode,
      notes: `Patient: ${patientName || user?.full_name || "Self"}. Age: ${age || 45}`,
    };

    try {
      const res = await casesApi.create(newCasePayload);
      setApiSuccess("Health case created and assigned for primary PHC review.");
      setIsCreateModalOpen(false);
      setPatientName("");
      setAge("");
      setPrimarySymptoms("");
      loadCases();
    } catch (err) {
      setApiError(err.message || "Failed to create health case.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddVitals = async (e) => {
    e.preventDefault();
    if (!selectedCaseForVitals) return;
    setIsSubmitting(true);
    setApiError("");
    setApiSuccess("");

    const payload = {
      systolic_bp: parseInt(systolicBp, 10),
      diastolic_bp: parseInt(diastolicBp, 10),
      pulse_rate: parseInt(pulseRate, 10),
      blood_sugar: parseFloat(bloodSugar),
      temperature: parseFloat(temperature),
      hemoglobin: parseFloat(hemoglobin),
      notes: vitalsNotes,
    };

    try {
      await casesApi.addVitals(selectedCaseForVitals.rawId || selectedCaseForVitals.id, payload);
      setApiSuccess(`Clinical vitals recorded for case ${selectedCaseForVitals.id}.`);
      setIsVitalsModalOpen(false);
      setVitalsNotes("");
      loadCases();
    } catch (err) {
      setApiError(err.message || "Failed to record clinical vitals.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070a13] text-slate-900 dark:text-slate-100 transition-colors duration-300 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[400px] bg-teal-500/10 dark:bg-teal-500/5 blur-[140px] rounded-full pointer-events-none -z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[400px] bg-indigo-500/10 dark:bg-indigo-500/5 blur-[140px] rounded-full pointer-events-none -z-0" />

      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 relative z-10">
        <AuthGuard featureName="आरोग्य केसेस (Patient Health Cases & Records)">
          {/* Banner */}
        <div className="bg-white dark:bg-slate-900/60 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl border border-slate-200/90 dark:border-white/10 shadow-lg shadow-slate-200/50 dark:shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
          <div className="space-y-2 text-left">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 bg-teal-500/10 dark:bg-teal-950/80 px-3 py-1 rounded-full border border-teal-500/20 dark:border-teal-500/30 backdrop-blur-md">
                Patient Case Management
              </span>
              <Badge variant="teal" size="sm" className="font-bold">Unique Case ID</Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Registered Healthcare Cases
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              Longitudinal patient healthcare records tracking triage, vitals observation, financial schemes, and verified specialist referral progression.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <Button
              size="md"
              variant="outline"
              className="border-slate-200 dark:border-white/15 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900/60 backdrop-blur-md font-bold gap-2 rounded-2xl"
              onClick={loadCases}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>
            <Button
              size="md"
              className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black gap-2 shadow-lg shadow-teal-500/20 rounded-2xl px-5"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="w-4 h-4" />
              <span>Create New Case</span>
            </Button>
          </div>
        </div>

        {apiError && (
          <Alert variant="danger" title="Operation Failed">
            {apiError}
          </Alert>
        )}

        {apiSuccess && (
          <Alert variant="success" title="Success">
            {apiSuccess}
          </Alert>
        )}

        {/* Case Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : cases.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No healthcare cases registered"
            description="Create a new healthcare case to begin structured consultation tracking and scheme matching."
            actionLabel="Create New Case"
            onAction={() => setIsCreateModalOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {cases.map((patientCase) => (
              <div key={patientCase.id} className="space-y-3">
                <CaseSummaryCard
                  patientCase={patientCase}
                  onViewDetail={(c) => {
                    setSelectedCaseForDetail(c);
                    setActiveDetailTab("overview");
                  }}
                />
              <div className="flex items-center justify-end gap-2 px-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-8 border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/60"
                  onClick={() => {
                    setSelectedCaseForVitals(patientCase);
                    setIsVitalsModalOpen(true);
                  }}
                >
                  <Stethoscope className="w-3.5 h-3.5 mr-1" />
                  Record Clinical Vitals
                </Button>
              </div>
            </div>
            ))}
          </div>
        )}
        </AuthGuard>
      </main>

      {/* Create Case Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Open New Healthcare Case"
        description="Register patient symptoms and consultation details under a unique JeevanSetu Case ID."
      >
        <form onSubmit={handleCreateCase} className="space-y-4 text-left">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Who is this case for? (मरीज का संबंध)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setCaregiverMode("myself")}
                className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                  caregiverMode === "myself"
                    ? "bg-teal-600 text-white border-teal-600 shadow-xs"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                For Myself
              </button>
              <button
                type="button"
                onClick={() => setCaregiverMode("family")}
                className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                  caregiverMode === "family"
                    ? "bg-teal-600 text-white border-teal-600 shadow-xs"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                Family Member
              </button>
              <button
                type="button"
                onClick={() => setCaregiverMode("dependent")}
                className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                  caregiverMode === "dependent"
                    ? "bg-teal-600 text-white border-teal-600 shadow-xs"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                Care Dependent
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Clinical Category</label>
              <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Cardiology">Cardiology / Cardiac</option>
                <option value="Maternal & Child">Maternal & Child Health</option>
                <option value="Respiratory">Respiratory / Pulmonary</option>
                <option value="Orthopedic">Orthopedic / Bone & Joint</option>
                <option value="General Medicine">General Medicine</option>
                <option value="Pediatrics">Pediatrics</option>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Urgency Level</label>
              <Select value={urgency} onChange={(e) => setUrgency(e.target.value)}>
                <option value="routine">Routine</option>
                <option value="urgent">Urgent</option>
                <option value="emergency">Emergency</option>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Primary Symptoms / Medical Concern
            </label>
            <Textarea
              rows={3}
              required
              placeholder="Describe symptoms, duration, and patient discomfort..."
              value={primarySymptoms}
              onChange={(e) => setPrimarySymptoms(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black shadow-lg shadow-teal-500/20" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Case"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Record Clinical Vitals Modal */}
      <Modal
        isOpen={isVitalsModalOpen}
        onClose={() => setIsVitalsModalOpen(false)}
        title={`Record Clinical Vitals: ${selectedCaseForVitals?.id || ""}`}
        description="Clinical measurements recorded during PHC / Doctor triage."
      >
        <form onSubmit={handleAddVitals} className="space-y-4 text-left">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Systolic BP (mmHg)</label>
              <Input
                type="number"
                min="50"
                max="300"
                required
                value={systolicBp}
                onChange={(e) => setSystolicBp(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Diastolic BP (mmHg)</label>
              <Input
                type="number"
                min="30"
                max="200"
                required
                value={diastolicBp}
                onChange={(e) => setDiastolicBp(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Pulse Rate (bpm)</label>
              <Input
                type="number"
                min="30"
                max="250"
                required
                value={pulseRate}
                onChange={(e) => setPulseRate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Blood Sugar (mg/dL)</label>
              <Input
                type="number"
                step="0.1"
                value={bloodSugar}
                onChange={(e) => setBloodSugar(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Temperature (°F)</label>
              <Input
                type="number"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Hemoglobin (g/dL)</label>
              <Input
                type="number"
                step="0.1"
                value={hemoglobin}
                onChange={(e) => setHemoglobin(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Clinical Observation Notes</label>
            <Textarea
              rows={2}
              placeholder="e.g. Regular pulse rhythm, patient alert, resting comfortably."
              value={vitalsNotes}
              onChange={(e) => setVitalsNotes(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsVitalsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black shadow-lg shadow-teal-500/20" disabled={isSubmitting}>
              {isSubmitting ? "Recording..." : "Save Vitals"}
            </Button>
          </div>
        </form>
      </Modal>

      <Footer />
    </div>
  );
}

export default CasesPage;
