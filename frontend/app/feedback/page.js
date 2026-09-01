"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { useLanguage } from "@/context/LanguageContext";
import { feedbackApi } from "@/lib/api";
import {
  MessageSquare,
  Star,
  ShieldCheck,
  Send,
  CheckCircle2,
  Lock,
  RotateCcw,
  Sparkles,
  PhoneCall,
  Radio,
  Search,
  Copy,
  Check,
  AlertTriangle,
  Building2,
  Clock,
  HeartHandshake,
  HelpCircle,
  PhoneForwarded,
} from "lucide-react";

const FEEDBACK_CATEGORIES = [
  { id: "PHC_SERVICE", label: "Primary Health Centre (PHC) Service", icon: Building2, desc: "OPD care, consultation experience" },
  { id: "DOCTOR_AVAILABILITY", label: "Doctor Availability & Timings", icon: HeartHandshake, desc: "Doctor on-duty presence, consultation hours" },
  { id: "STAFF_BEHAVIOUR", label: "Staff Behaviour & Conduct", icon: HeartHandshake, desc: "Nurse, pharmacist, or clerk interaction" },
  { id: "MEDICINE_AVAILABILITY", label: "Medicine Stock & Pharmacy", icon: Sparkles, desc: "Prescription availability at pharmacy window" },
  { id: "WAITING_TIME", label: "Waiting Time & Queue", icon: Clock, desc: "OPD wait duration, token system" },
  { id: "CLEANLINESS_FACILITY", label: "Cleanliness & Sanitation", icon: ShieldCheck, desc: "Wards, washrooms, drinking water, beds" },
  { id: "REFERRAL_EXPERIENCE", label: "Referral & Transport", icon: PhoneForwarded, desc: "Ambulance transit, hospital arrival" },
  { id: "EMERGENCY_SERVICE_ACCESS", label: "Emergency / Casualty Access", icon: AlertTriangle, desc: "24x7 emergency response, 108 triage" },
  { id: "OTHER", label: "Other Inquiries", icon: HelpCircle, desc: "General public health feedback" },
];

export function FeedbackPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("submit"); // 'submit' | 'track' | 'missed-call'

  // Submit Form State
  const [facilityTargetType, setFacilityTargetType] = useState("phc");
  const [category, setCategory] = useState("PHC_SERVICE");
  const [rating, setRating] = useState(5);
  const [hasRating, setHasRating] = useState(true);
  const [message, setMessage] = useState("");
  const [district, setDistrict] = useState("Gadchiroli");
  const [taluka, setTaluka] = useState("Chamorshi");
  const [pincode, setPincode] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [copiedToken, setCopiedToken] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Track Status State
  const [trackingTokenInput, setTrackingTokenInput] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const [trackedRecord, setTrackedRecord] = useState(null);
  const [trackError, setTrackError] = useState("");

  // Missed-call Simulator State
  const [simCaller, setSimCaller] = useState("+91 98234 11204");
  const [simLoading, setSimLoading] = useState(false);
  const [simResponse, setSimResponse] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const payload = {
        rating: hasRating ? rating : null,
        category,
        message: message.trim(),
        facility_target_type: facilityTargetType,
        phc_id: facilityTargetType === "phc" ? "phc-1" : null,
        hospital_id: facilityTargetType === "hospital" ? "hosp-1" : null,
        district,
        taluka,
        pincode: pincode.trim() || undefined,
        is_anonymous: isAnonymous,
        contact_name: isAnonymous ? null : contactName.trim(),
        contact_phone: isAnonymous ? null : contactPhone.trim(),
        feedback_channel: "WEB",
      };

      const res = await feedbackApi.submit(payload);
      if (res?.data) {
        setSubmissionResult(res.data);
      } else {
        // Fallback demo result
        setSubmissionResult({
          tracking_token: `JS-FB-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
          category,
          rating: hasRating ? rating : null,
          status: "SUBMITTED",
          created_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyToken = (token) => {
    if (!token) return;
    navigator.clipboard.writeText(token);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2500);
  };

  const handleTrackSubmit = async (e) => {
    e.preventDefault();
    if (!trackingTokenInput.trim()) return;

    setIsTracking(true);
    setTrackError("");
    setTrackedRecord(null);

    try {
      const res = await feedbackApi.track(trackingTokenInput.trim());
      if (res?.data) {
        setTrackedRecord(res.data);
      } else {
        setTrackError("No feedback record found matching this tracking token.");
      }
    } catch (err) {
      setTrackError(err.message || "Tracking lookup failed. Please check the token format (e.g. JS-FB-7A82-9K1L).");
    } finally {
      setIsTracking(false);
    }
  };

  const handleSimulateMissedCall = async () => {
    setSimLoading(true);
    setSimResponse(null);

    try {
      const res = await feedbackApi.missedCall({
        callerPhone: simCaller,
      });
      setSimResponse(res?.data || { message: "Missed call registered successfully." });
    } catch (err) {
      setSimResponse({ error: err.message });
    } finally {
      setSimLoading(false);
    }
  };

  const handleReset = () => {
    setSubmissionResult(null);
    setMessage("");
    setRating(5);
    setHasRating(true);
    setPincode("");
    setContactName("");
    setContactPhone("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070a13] text-slate-900 dark:text-slate-100 text-left transition-colors duration-300 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[400px] bg-teal-500/10 dark:bg-teal-500/5 blur-[140px] rounded-full pointer-events-none -z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[400px] bg-sky-500/10 dark:bg-sky-500/5 blur-[140px] rounded-full pointer-events-none -z-0" />

      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 relative z-10">
        {/* Banner */}
        <div className="bg-slate-900/60 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-3 text-left">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-300 bg-teal-950/80 px-3 py-1 rounded-full border border-teal-500/30 flex items-center gap-1.5 backdrop-blur-md">
              <MessageSquare className="w-3.5 h-3.5 text-teal-400" />
              {t("feedback", "Citizen Feedback Portal")}
            </span>
            <Badge variant="teal" size="sm" className="font-bold">Phase 26 Privacy Model</Badge>
            <Badge variant="outline" size="sm" className="border-white/15 text-slate-300 font-bold">Anonymous Access</Badge>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {t("feedbackHeading", "Healthcare Service Quality & Facility Feedback")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl">
            {t(
              "feedbackSubheading",
              "Share your experience at Primary Health Centres (PHC), district hospitals, or during referral transit. Feedback helps health administrators optimize medicine supplies, doctor schedules, and care quality."
            )}
          </p>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 pt-3 border-t border-white/10 flex-wrap">
            <button
              onClick={() => setActiveTab("submit")}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "submit"
                  ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 shadow-lg shadow-teal-500/20 font-black"
                  : "bg-slate-900/80 backdrop-blur-md text-slate-300 hover:text-white border border-white/10 hover:bg-slate-800"
              }`}
            >
              Submit Feedback
            </button>
            <button
              onClick={() => setActiveTab("track")}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "track"
                  ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 shadow-lg shadow-teal-500/20 font-black"
                  : "bg-slate-900/80 backdrop-blur-md text-slate-300 hover:text-white border border-white/10 hover:bg-slate-800"
              }`}
            >
              Track by Token
            </button>
            <button
              onClick={() => setActiveTab("missed-call")}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "missed-call"
                  ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 shadow-lg shadow-teal-500/20 font-black"
                  : "bg-slate-900/80 backdrop-blur-md text-slate-300 hover:text-white border border-white/10 hover:bg-slate-800"
              }`}
            >
              Feature Phone / Missed-Call
            </button>
          </div>
        </div>

        {/* TAB 1: SUBMIT FEEDBACK */}
        {activeTab === "submit" && (
          <Card className="shadow-sm border-slate-200 text-left">
            <CardContent className="p-6 sm:p-8">
              {submissionResult ? (
                <div className="py-8 text-center space-y-5">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div className="space-y-1.5 max-w-md mx-auto">
                    <h3 className="text-xl font-bold text-slate-900">
                      Your Feedback Has Been Recorded
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Thank you for helping improve healthcare services. Your input is forwarded to authorized health supervisors for operational review.
                    </p>
                  </div>

                  {/* Secure Tracking Token Display */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 max-w-md mx-auto space-y-2 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        Anonymous Tracking Token
                      </span>
                      <Badge variant="teal" size="sm">Keep This Safe</Badge>
                    </div>

                    <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200">
                      <span className="font-mono text-sm sm:text-base font-bold text-teal-800 tracking-wider">
                        {submissionResult.tracking_token || "JS-FB-7A82-9K1L"}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopyToken(submissionResult.tracking_token)}
                        className="gap-1 text-xs h-8 px-2.5"
                      >
                        {copiedToken ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-600" />
                            <span>Copy</span>
                          </>
                        )}
                      </Button>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Use this token in the <strong>Track by Token</strong> tab anytime to check administrative review status without needing an account or phone number.
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-center gap-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleReset}
                      className="gap-1.5 text-xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Submit Another Feedback</span>
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setTrackingTokenInput(submissionResult.tracking_token);
                        setActiveTab("track");
                      }}
                      className="bg-teal-600 hover:bg-teal-700 text-white gap-1.5 text-xs font-bold"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Track Status Now</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6 text-left">
                  {errorMessage && (
                    <Alert variant="danger" title="Submission Error">
                      {errorMessage}
                    </Alert>
                  )}

                  {/* Non-clinical Privacy Warning */}
                  <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-900 leading-relaxed">
                      <strong>Privacy Notice:</strong> Do not include private medical history, clinical diagnoses, or prescription photos. This portal is for administrative service quality feedback only.
                    </p>
                  </div>

                  {/* Facility Target Selection */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                      1. Target Facility / Service Area
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[
                        { id: "phc", label: "Primary Health Centre" },
                        { id: "hospital", label: "District Hospital" },
                        { id: "referral", label: "Referral / Transit" },
                        { id: "general", label: "General District" },
                      ].map((fac) => (
                        <button
                          key={fac.id}
                          type="button"
                          onClick={() => setFacilityTargetType(fac.id)}
                          className={`p-3 rounded-xl border text-center text-xs font-semibold transition-all ${
                            facilityTargetType === fac.id
                              ? "bg-teal-50 border-teal-600 text-teal-900 font-bold ring-1 ring-teal-600 shadow-2xs"
                              : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-white"
                          }`}
                        >
                          {fac.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Feedback Category Selection (9 Categories) */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                      2. Feedback Category
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {FEEDBACK_CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        const isSelected = category === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setCategory(cat.id)}
                            className={`p-3 rounded-xl border text-left text-xs transition-all ${
                              isSelected
                                ? "bg-teal-50 border-teal-600 text-teal-900 font-bold ring-1 ring-teal-600 shadow-2xs"
                                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-white"
                            }`}
                          >
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-teal-700" : "text-slate-500"}`} />
                              <span className="font-bold">{cat.label}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 line-clamp-1">{cat.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Star Rating (Optional) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                        3. Experience Rating (Optional)
                      </label>
                      <button
                        type="button"
                        onClick={() => setHasRating(!hasRating)}
                        className="text-[11px] font-semibold text-teal-700 hover:underline"
                      >
                        {hasRating ? "Skip Rating" : "Include Rating"}
                      </button>
                    </div>

                    {hasRating ? (
                      <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="p-1 rounded-lg hover:scale-110 transition-transform"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                star <= rating
                                  ? "text-amber-400 fill-amber-400"
                                  : "text-slate-200"
                              }`}
                            />
                          </button>
                        ))}
                        <span className="text-xs font-bold text-slate-700 ml-2">
                          {rating === 1 && "1 — Very Poor"}
                          {rating === 2 && "2 — Poor"}
                          {rating === 3 && "3 — Average"}
                          {rating === 4 && "4 — Good"}
                          {rating === 5 && "5 — Very Good"}
                        </span>
                      </div>
                    ) : (
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 italic">
                        Rating skipped. You may provide only text feedback below.
                      </div>
                    )}
                  </div>

                  {/* Location Scope (District, Taluka, Pincode) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Select
                      label="District"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      options={[
                        { value: "Gadchiroli", label: "Gadchiroli" },
                        { value: "Chandrapur", label: "Chandrapur" },
                        { value: "Nagpur", label: "Nagpur" },
                      ]}
                    />
                    <Select
                      label="Taluka"
                      value={taluka}
                      onChange={(e) => setTaluka(e.target.value)}
                      options={[
                        { value: "Chamorshi", label: "Chamorshi" },
                        { value: "Ashti", label: "Ashti" },
                        { value: "Armori", label: "Armori" },
                        { value: "Aheri", label: "Aheri" },
                      ]}
                    />
                    <Input
                      label="PIN Code (Optional)"
                      placeholder="e.g. 442603"
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                    />
                  </div>

                  {/* Feedback Message */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                        4. Feedback & Observations
                      </label>
                      <span className={`text-[11px] font-mono ${message.length > 450 ? "text-amber-600 font-bold" : "text-slate-400"}`}>
                        {message.length} / 500 characters
                      </span>
                    </div>
                    <Textarea
                      rows={4}
                      required
                      maxLength={500}
                      placeholder="Describe the facility visit, doctor consultation, medicine availability, waiting time, or staff assistance..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>

                  {/* Privacy & Anonymous Settings */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isAnonymous}
                          onChange={(e) => setIsAnonymous(e.target.checked)}
                          className="rounded text-teal-600 focus:ring-teal-500"
                        />
                        <span>Submit anonymously (strips name and phone from staff view)</span>
                      </label>
                      <Badge variant="teal" size="sm">Privacy Preserving</Badge>
                    </div>

                    {!isAnonymous && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <Input
                          label="Your Name (Optional)"
                          placeholder="e.g. Kisan Jadhav"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                        />
                        <Input
                          label="Mobile Number (Optional)"
                          placeholder="+91 98XXX XXXXX"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-slate-400">
                      *Citizen feedback is an operational signal and not a disciplinary finding.
                    </span>

                    <Button
                      type="submit"
                      className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-2.5 rounded-xl gap-2 shadow-xs"
                      isLoading={isSubmitting}
                    >
                      <span>Submit Feedback</span>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        )}

        {/* TAB 2: TRACK STATUS BY TOKEN */}
        {activeTab === "track" && (
          <Card className="shadow-sm border-slate-200 text-left">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900">
                <Search className="w-4 h-4 text-teal-600" />
                Track Anonymous Feedback Status
              </CardTitle>
              <p className="text-xs text-slate-500">
                Enter your secure Tracking Token (e.g. JS-FB-7A82-9K1L) to check the administrative review progress.
              </p>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Input
                    placeholder="Enter Tracking Token (e.g. JS-FB-7A82-9K1L)"
                    value={trackingTokenInput}
                    onChange={(e) => setTrackingTokenInput(e.target.value.toUpperCase())}
                    className="font-mono text-sm tracking-wider"
                  />
                </div>
                <Button
                  type="submit"
                  isLoading={isTracking}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold gap-2 sm:w-auto w-full"
                >
                  <Search className="w-4 h-4" />
                  <span>Check Status</span>
                </Button>
              </form>

              {trackError && (
                <Alert variant="danger" title="Tracking Notice">
                  {trackError}
                </Alert>
              )}

              {trackedRecord && (
                <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tracking Token</span>
                      <p className="font-mono font-bold text-teal-900 text-sm">{trackedRecord.tracking_token}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Review Status:</span>
                      <Badge
                        variant={
                          trackedRecord.status === "RESOLVED"
                            ? "success"
                            : trackedRecord.status === "ACKNOWLEDGED"
                            ? "teal"
                            : trackedRecord.status === "UNDER_REVIEW"
                            ? "warning"
                            : "secondary"
                        }
                        size="sm"
                      >
                        {trackedRecord.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500">Category:</span>
                      <p className="font-bold text-slate-800">{trackedRecord.category || "General"}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Facility:</span>
                      <p className="font-bold text-slate-800">{trackedRecord.facility_name || "PHC"}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Submitted On:</span>
                      <p className="font-bold text-slate-800">
                        {new Date(trackedRecord.created_at || Date.now()).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-600">
                    <p className="font-semibold text-slate-800 mb-1">Administrative Note:</p>
                    <p>{trackedRecord.message_acknowledgement}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* TAB 3: MISSED-CALL & IVR GUIDE & SIMULATOR */}
        {activeTab === "missed-call" && (
          <div className="space-y-6">
            <Card className="shadow-sm border-slate-200 text-left">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900">
                  <PhoneCall className="w-4 h-4 text-teal-600" />
                  Feature-Phone Missed-Call Access Path
                </CardTitle>
                <p className="text-xs text-slate-500">
                  Designed for rural citizens on basic 2G phones without internet or smartphones.
                </p>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-left">
                  {[
                    { step: "1", title: "Give Missed Call", desc: "Citizen dials toll-free JeevanSetu number." },
                    { step: "2", title: "Automated Callback", desc: "System calls back with multilingual voice prompts." },
                    { step: "3", title: "Keypad Rating", desc: "Press 1-5 for star rating & select category." },
                    { step: "4", title: "SMS Confirmation", desc: "Receive tracking token via SMS confirmation." },
                  ].map((s) => (
                    <div key={s.step} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-black text-xs flex items-center justify-center">
                        {s.step}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 pt-1">{s.title}</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed">{s.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Telephony Gateway Simulator */}
                <div className="p-5 bg-teal-900 text-white rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-200 flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
                      Missed-Call Webhook Simulator
                    </span>
                    <Badge variant="outline" size="sm" className="text-teal-200 border-teal-700">
                      Mock Telephony Gateway
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <Input
                        label="Caller Phone Number"
                        value={simCaller}
                        onChange={(e) => setSimCaller(e.target.value)}
                        className="bg-teal-950 border-teal-800 text-white"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        type="button"
                        onClick={handleSimulateMissedCall}
                        isLoading={simLoading}
                        className="w-full bg-teal-500 hover:bg-teal-400 text-teal-950 font-bold gap-1.5 text-xs h-10"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>Simulate Missed Call</span>
                      </Button>
                    </div>
                  </div>

                  {simResponse && (
                    <div className="p-3 bg-teal-950/80 rounded-lg border border-teal-800 font-mono text-xs text-teal-200 space-y-1">
                      <p className="text-teal-400 font-bold">Telephony Gateway Response:</p>
                      <pre className="overflow-x-auto text-[11px]">
                        {JSON.stringify(simResponse, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default FeedbackPage;
