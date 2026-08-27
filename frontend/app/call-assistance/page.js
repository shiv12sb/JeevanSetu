"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { ivrApi } from "@/lib/api";
import {
  PhoneCall,
  Radio,
  Volume2,
  PhoneForwarded,
  ShieldCheck,
  Sparkles,
  PhoneOff,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Pill,
  FileText,
  UserCheck,
  HelpCircle,
  BarChart3,
  ListOrdered,
  Users,
  ExternalLink,
} from "lucide-react";

export function CallAssistancePage() {
  const [phoneNumber, setPhoneNumber] = useState("+91 98234 11204");
  const [selectedLanguage, setSelectedLanguage] = useState("hi");

  // Simulator State
  const [isCallActive, setIsCallActive] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [voicePrompt, setVoicePrompt] = useState("");
  const [currentMenu, setCurrentMenu] = useState("");
  const [callStatus, setCallStatus] = useState("Idle");
  const [isLoading, setIsLoading] = useState(false);
  const [lastDtmf, setLastDtmf] = useState("");
  const [callHistory, setCallHistory] = useState([]);

  // Active Tab: 'simulator' | 'callbacks' | 'schemes' | 'analytics'
  const [activeTab, setActiveTab] = useState("simulator");

  // Callback Queue State
  const [callbacks, setCallbacks] = useState([]);
  const [callbackFilter, setCallbackFilter] = useState("all");
  const [selectedCallback, setSelectedCallback] = useState(null);
  const [staffNote, setStaffNote] = useState("");
  const [isUpdatingCallback, setIsUpdatingCallback] = useState(false);

  // Analytics State
  const [analytics, setAnalytics] = useState({
    total_calls: 38,
    completed_flows_count: 32,
    emergency_guidance_routed_count: 4,
    callback_requests_count: 14,
    resolved_callbacks_count: 11,
    callback_resolution_rate_percentage: 79,
    language_breakdown: { hi: 60, mr: 32, en: 8 },
    average_call_duration_seconds: 48,
    telephony_provider: "MockTelephonyProvider",
    is_live_telephony_configured: false,
  });

  const documentedHelplines = [
    {
      number: "108",
      label: "National Emergency Ambulance",
      description: "24x7 free emergency ambulance dispatch and trauma transit across Maharashtra & India.",
      badge: "Emergency 24x7",
      badgeVariant: "danger",
    },
    {
      number: "104",
      label: "National Health & Medical Helpline",
      description: "General medical advice, government scheme guidance, and blood bank inquiries.",
      badge: "Toll-Free 24x7",
      badgeVariant: "success",
    },
    {
      number: "14416",
      label: "Tele-MANAS (Mental Health Helpline)",
      description: "Free round-the-clock psychological and mental health counseling support.",
      badge: "National",
      badgeVariant: "info",
    },
    {
      number: "1091",
      label: "Women Safety & Health Helpline",
      description: "Dedicated national emergency line for women's healthcare and safety.",
      badge: "Dedicated",
      badgeVariant: "teal",
    },
  ];

  const menuTree = [
    { key: "1", title: "Health Guidance & Triage", desc: "Seasonal fever, hydration/ORS, maternal health, emergency symptom warnings." },
    { key: "2", title: "Healthcare Facilities", desc: "PHC hours, Sub-centres, and District Civil Hospital 24x7 casualty contacts." },
    { key: "3", title: "Referral Status (PIN Protected)", desc: "Check live referral stage (Accepted, In Transit, Arrived, Treatment Started)." },
    { key: "4", title: "Essential Medicines", desc: "Stock status for Paracetamol, ORS, Amlodipine, Metformin at local PHC." },
    { key: "5", title: "Government Schemes", desc: "Ayushman Bharat PM-JAY (₹5L), MJPJAY, and Janani Suraksha Yojana." },
    { key: "6", title: "Health Worker Callback", desc: "Request local ASHA / PHC staff callback for scheduled health support." },
  ];

  // Fetch Callbacks and Analytics
  useEffect(() => {
    fetchCallbacks();
    fetchAnalytics();
  }, []);

  const fetchCallbacks = async () => {
    try {
      const res = await ivrApi.getFollowUps();
      if (res?.data) {
        setCallbacks(res.data);
      }
    } catch (err) {
      // Mock initial items
      setCallbacks([
        {
          id: "ivr-fu-1",
          caller_phone_masked: "+91 98XXX XX04",
          preferred_language: "mr",
          category: "maternal_care",
          reason: "Voice IVR Callback: Patient requested ASHA coordination for maternal checkup.",
          status: "pending",
          created_at: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: "ivr-fu-2",
          caller_phone_masked: "+91 98XXX XX34",
          preferred_language: "hi",
          category: "general_assistance",
          reason: "Voice IVR Callback: Inquiry on seasonal OPD consultation hours.",
          status: "contacted",
          staff_notes: "Informed patient of Mon-Fri 9 AM to 5 PM OPD hours at Ashti PHC.",
          created_at: new Date(Date.now() - 14400000).toISOString(),
        },
      ]);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await ivrApi.getAnalytics();
      if (res?.data) {
        setAnalytics(res.data);
      }
    } catch (err) {
      // Retain baseline
    }
  };

  // Start Call Session in Simulator
  const handleStartCall = async () => {
    setIsLoading(true);
    setCallHistory([]);
    try {
      const res = await ivrApi.createSession({
        callerPhone: phoneNumber,
        language: selectedLanguage,
      });

      if (res?.data) {
        setIsCallActive(true);
        setSessionId(res.data.session.session_id);
        setVoicePrompt(res.data.voiceResponse.promptText);
        setCurrentMenu(res.data.session.current_menu);
        setCallStatus("Connected (Audio Active)");
        setCallHistory([{ role: "system", text: res.data.voiceResponse.promptText }]);
      }
    } catch (err) {
      // Fallback local mock simulation
      setIsCallActive(true);
      setSessionId("ivr-sim-local");
      const fallbackPrompt = "जीवनसेतु ग्रामीण स्वास्थ्य सेवा में आपका स्वागत है। हिंदी के लिए 1 दबाएं। मराठीसाठी 2 दाबा। For English, press 3.";
      setVoicePrompt(fallbackPrompt);
      setCurrentMenu("language_select");
      setCallStatus("Connected (Local Simulator)");
      setCallHistory([{ role: "system", text: fallbackPrompt }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Send DTMF Keypress
  const handleKeypress = async (digit) => {
    if (!isCallActive || !sessionId) return;
    setIsLoading(true);
    setLastDtmf(digit);

    try {
      const res = await ivrApi.interact({
        sessionId,
        dtmfDigit: digit,
      });

      if (res?.data) {
        const vr = res.data.voiceResponse;
        setVoicePrompt(vr.promptText);
        if (res.data.session) {
          setCurrentMenu(res.data.session.current_menu);
        }

        setCallHistory((prev) => [
          ...prev,
          { role: "user", text: `Pressed: [${digit}]` },
          { role: "system", text: vr.promptText },
        ]);

        if (vr.hangup) {
          setCallStatus("Call Ended (Hangup Received)");
          setTimeout(() => {
            setIsCallActive(false);
            fetchCallbacks();
            fetchAnalytics();
          }, 3500);
        }
      }
    } catch (err) {
      console.warn("IVR interact error:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // End Call
  const handleEndCall = () => {
    setIsCallActive(false);
    setCallStatus("Call Disconnected");
    setSessionId(null);
    fetchCallbacks();
  };

  // Update Callback Status
  const handleUpdateCallback = async (id, status) => {
    setIsUpdatingCallback(true);
    try {
      await ivrApi.updateFollowUp(id, {
        status,
        notes: staffNote || "Contacted caller via ASHA outreach desk.",
      });
      setSelectedCallback(null);
      setStaffNote("");
      await fetchCallbacks();
      await fetchAnalytics();
    } catch (err) {
      // Local state update fallback
      setCallbacks((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status, staff_notes: staffNote || "Status updated." } : c))
      );
      setSelectedCallback(null);
      setStaffNote("");
    } finally {
      setIsUpdatingCallback(false);
    }
  };

  const filteredCallbacks = callbacks.filter((c) => {
    if (callbackFilter === "all") return true;
    return c.status === callbackFilter;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded border border-teal-200 dark:border-teal-800 flex items-center gap-1">
                <PhoneCall className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                Inclusive Rural Health Access
              </span>
              <Badge variant="teal" size="sm">Feature Phone & IVR (2G)</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Provider:</span>
              <Badge variant="outline" size="sm">{analytics.telephony_provider}</Badge>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Voice Call & IVR Phone Health Access
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
            Engineered for rural citizens without smartphones or internet access. Accessible from any basic 2G feature phone with deterministic local-language voice prompts (हिंदी, मराठी, English), referral tracking, medicine lookup, government schemes, and ASHA health worker callbacks.
          </p>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setActiveTab("simulator")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "simulator"
                  ? "bg-teal-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Interactive Phone Simulator</span>
            </button>

            <button
              onClick={() => setActiveTab("callbacks")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "callbacks"
                  ? "bg-teal-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>ASHA Callback Queue</span>
              {callbacks.filter((c) => c.status === "pending").length > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px]">
                  {callbacks.filter((c) => c.status === "pending").length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("schemes")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "schemes"
                  ? "bg-teal-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Government Schemes & Help</span>
            </button>

            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "analytics"
                  ? "bg-teal-600 text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Operational Analytics</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Simulator */}
        {activeTab === "simulator" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Interactive Phone Simulator Column */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-teal-200 bg-linear-to-b from-teal-50/40 to-white shadow-xs overflow-hidden">
                <CardHeader className="pb-3 border-b border-teal-100 bg-teal-50/60">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-teal-600 animate-pulse" />
                      <CardTitle className="text-sm text-teal-950 font-bold">
                        Interactive Feature Phone Keypad Simulator
                      </CardTitle>
                    </div>
                    <Badge variant={isCallActive ? "success" : "teal"} size="sm">
                      {isCallActive ? "Call In Progress" : "Dialer Ready"}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                  {!isCallActive ? (
                    <div className="space-y-4 max-w-lg">
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Test incoming voice call interaction from a simulated 2G mobile phone. The system responds with deterministic audio prompts in Hindi, Marathi, and English.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          label="Simulated Caller Phone"
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                        <Select
                          label="Initial Language Greeting"
                          value={selectedLanguage}
                          onChange={(e) => setSelectedLanguage(e.target.value)}
                        >
                          <option value="hi">हिंदी (Hindi)</option>
                          <option value="mr">मराठी (Marathi)</option>
                          <option value="en">English</option>
                        </Select>
                      </div>

                      <Button
                        onClick={handleStartCall}
                        disabled={isLoading}
                        className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold gap-2"
                      >
                        <PhoneCall className="w-4 h-4" />
                        <span>{isLoading ? "Connecting Call..." : "Dial In / Start IVR Session"}</span>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {/* Active Call Header & Voice Prompt Display */}
                      <div className="p-4 bg-slate-900 rounded-xl text-white space-y-3 shadow-inner">
                        <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                          <span className="flex items-center gap-1.5 text-teal-400 font-mono">
                            <Volume2 className="w-4 h-4 animate-bounce" />
                            Status: {callStatus}
                          </span>
                          <span className="font-mono text-[11px] bg-slate-800 px-2 py-0.5 rounded text-teal-300">
                            Menu: {currentMenu}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] text-teal-300 font-bold uppercase tracking-wider">
                            Simulated Voice Prompt Output:
                          </span>
                          <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed bg-slate-800/90 p-3.5 rounded-lg border border-slate-700">
                            "{voicePrompt}"
                          </p>
                        </div>
                      </div>

                      {/* Phone Keypad */}
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-slate-700 block text-center">
                          Feature Phone Keypad (Press Digits to Navigate):
                        </span>
                        <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto">
                          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].map((key) => (
                            <button
                              key={key}
                              type="button"
                              onClick={() => handleKeypress(key)}
                              disabled={isLoading}
                              className="p-3.5 bg-white hover:bg-teal-50 border border-slate-300 hover:border-teal-400 rounded-xl font-mono text-base font-black text-slate-800 shadow-xs active:scale-95 transition-all flex flex-col items-center justify-center cursor-pointer"
                            >
                              <span>{key}</span>
                            </button>
                          ))}
                        </div>

                        <div className="flex justify-center pt-3">
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={handleEndCall}
                            className="text-xs font-bold gap-1.5 bg-rose-600 hover:bg-rose-700 text-white"
                          >
                            <PhoneOff className="w-3.5 h-3.5" />
                            <span>Hang Up / End Call</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Call Transcript History */}
              {callHistory.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold text-slate-800">
                      Live Call Session Log & Navigation History
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs">
                    {callHistory.map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-lg leading-relaxed ${
                          item.role === "user"
                            ? "bg-teal-50 text-teal-900 font-mono font-bold border border-teal-200 max-w-xs ml-auto text-right"
                            : "bg-slate-100 text-slate-800 border border-slate-200"
                        }`}
                      >
                        {item.text}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Menu Tree Reference Column */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <ListOrdered className="w-4 h-4 text-teal-600" />
                    <CardTitle className="text-sm font-bold text-slate-900">
                      IVR DTMF Menu Tree
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-3 text-xs">
                  {menuTree.map((item) => (
                    <div key={item.key} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1">
                      <div className="flex items-center gap-2 font-bold text-slate-800">
                        <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center font-mono text-[11px]">
                          {item.key}
                        </span>
                        <span>{item.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 pl-7">{item.desc}</p>
                    </div>
                  ))}

                  <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 text-[11px] space-y-1">
                    <strong className="block">Global Navigation Keys:</strong>
                    <p>• <strong>*</strong> : Repeat current audio menu prompt</p>
                    <p>• <strong>#</strong> : Return to main menu</p>
                    <p>• <strong>0</strong> : Disconnect / Exit call</p>
                    <p>• <strong>108</strong> : Emergency Ambulance hotline</p>
                  </div>
                </CardContent>
              </Card>

              {/* Safety Boundary Notice */}
              <Card className="border-rose-200 bg-rose-50/40">
                <CardContent className="p-4 space-y-2 text-xs text-rose-950">
                  <div className="flex items-center gap-1.5 font-bold text-rose-800">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Non-Diagnostic Safety Boundary</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-rose-800">
                    JeevanSetu IVR strictly provides informational guidance and facility coordination. It does not diagnose diseases, prescribe medicine doses, or replace clinical consultation. Emergency symptoms route directly to 108.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Tab 2: ASHA Callback Management Queue */}
        {activeTab === "callbacks" && (
          <div className="space-y-6">
            <Card>
              <CardHeader className="border-b border-slate-100 pb-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-sm font-bold text-slate-900">
                      ASHA & PHC Health Worker Callback Queue
                    </CardTitle>
                    <p className="text-xs text-slate-500">
                      Feature phone callers who requested health worker follow-up during IVR navigation.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Select
                      value={callbackFilter}
                      onChange={(e) => setCallbackFilter(e.target.value)}
                      className="text-xs"
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending Only</option>
                      <option value="contacted">Contacted</option>
                      <option value="resolved">Resolved</option>
                    </Select>
                    <Button size="sm" variant="outline" onClick={fetchCallbacks} className="text-xs gap-1">
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Refresh</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4 space-y-3">
                {filteredCallbacks.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    No callback requests matching the filter.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredCallbacks.map((cb) => (
                      <Card key={cb.id} className="hover:border-teal-300 transition-all">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-slate-900 text-sm">
                              {cb.caller_phone_masked}
                            </span>
                            <Badge
                              variant={
                                cb.status === "resolved"
                                  ? "success"
                                  : cb.status === "contacted"
                                  ? "teal"
                                  : "amber"
                              }
                              size="sm"
                            >
                              {cb.status.toUpperCase()}
                            </Badge>
                          </div>

                          <p className="text-xs text-slate-700 leading-relaxed font-medium bg-slate-50 p-2 rounded border border-slate-200/70">
                            {cb.reason}
                          </p>

                          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                            <span>Language: {cb.preferred_language?.toUpperCase() || "HI"}</span>
                            <span>{new Date(cb.created_at).toLocaleString()}</span>
                          </div>

                          {cb.staff_notes && (
                            <div className="p-2 bg-teal-50/70 rounded text-[11px] text-teal-900 border border-teal-100">
                              <strong>Staff Note:</strong> {cb.staff_notes}
                            </div>
                          )}

                          {cb.status !== "resolved" && (
                            <div className="pt-2 flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedCallback(cb)}
                                className="text-xs w-full font-bold"
                              >
                                Update Status / Add Note
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Modal for Callback */}
            {selectedCallback && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                <Card className="max-w-md w-full shadow-xl">
                  <CardHeader className="border-b border-slate-100 pb-3">
                    <CardTitle className="text-sm font-bold text-slate-900">
                      Update Callback: {selectedCallback.caller_phone_masked}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 space-y-4">
                    <p className="text-xs text-slate-600">{selectedCallback.reason}</p>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Health Staff Action Note:</label>
                      <Input
                        placeholder="e.g. Spoke with patient, scheduled ANC visit on Tuesday."
                        value={staffNote}
                        onChange={(e) => setStaffNote(e.target.value)}
                        className="text-xs"
                      />
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedCallback(null)}
                        className="text-xs"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleUpdateCallback(selectedCallback.id, "contacted")}
                        disabled={isUpdatingCallback}
                        className="text-xs font-bold bg-teal-100 text-teal-900 hover:bg-teal-200"
                      >
                        Mark Contacted
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleUpdateCallback(selectedCallback.id, "resolved")}
                        disabled={isUpdatingCallback}
                        className="text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white"
                      >
                        Mark Resolved
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Government Schemes & Help */}
        {activeTab === "schemes" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Card className="border-teal-200 dark:border-teal-800 bg-white dark:bg-slate-900 flex flex-col justify-between">
                <CardContent className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold flex items-center justify-center text-sm border border-teal-200 dark:border-teal-800">
                      PMJAY
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Ayushman Bharat PM-JAY</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Provides cashless health coverage up to ₹5,00,000 per family per year for secondary and tertiary hospitalization across empaneled hospitals.
                    </p>
                    <div className="text-[11px] text-teal-800 dark:text-teal-300 font-medium bg-teal-50 dark:bg-teal-950/60 p-2 rounded border border-teal-200 dark:border-teal-800">
                      <strong>IVR Option:</strong> Press 5 then 1
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <a
                      href="https://beneficiary.nha.gov.in/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 w-full py-2 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900 font-bold text-xs rounded-lg border border-teal-200 dark:border-teal-800 transition-colors"
                    >
                      <span>Official PM-JAY Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-teal-200 dark:border-teal-800 bg-white dark:bg-slate-900 flex flex-col justify-between">
                <CardContent className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold flex items-center justify-center text-sm border border-teal-200 dark:border-teal-800">
                      MJPJAY
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Mahatma Jyotirao Phule (MJPJAY)</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Maharashtra state flagship health insurance providing free specialized surgeries, cardiac care, and critical treatments at government and private hospitals.
                    </p>
                    <div className="text-[11px] text-teal-800 dark:text-teal-300 font-medium bg-teal-50 dark:bg-teal-950/60 p-2 rounded border border-teal-200 dark:border-teal-800">
                      <strong>IVR Option:</strong> Press 5 then 2
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <a
                      href="https://www.jeevandayee.gov.in/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 w-full py-2 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900 font-bold text-xs rounded-lg border border-teal-200 dark:border-teal-800 transition-colors"
                    >
                      <span>Official MJPJAY Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-teal-200 dark:border-teal-800 bg-white dark:bg-slate-900 flex flex-col justify-between">
                <CardContent className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold flex items-center justify-center text-sm border border-teal-200 dark:border-teal-800">
                      JSY
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Janani Suraksha Yojana (JSY/JSSK)</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Offers ₹1,400 direct financial assistance to pregnant rural mothers giving birth in government hospitals with free ambulance and post-natal care.
                    </p>
                    <div className="text-[11px] text-teal-800 dark:text-teal-300 font-medium bg-teal-50 dark:bg-teal-950/60 p-2 rounded border border-teal-200 dark:border-teal-800">
                      <strong>IVR Option:</strong> Press 5 then 3
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <a
                      href="https://nhm.gov.in/index1.php?lang=1&level=2&sublinkid=822&lid=219"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 w-full py-2 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900 font-bold text-xs rounded-lg border border-teal-200 dark:border-teal-800 transition-colors"
                    >
                      <span>Official JSSK Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Official Helplines */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Documented 24x7 National Health Helplines</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {documentedHelplines.map((item) => (
                  <Card key={item.number} className="hover:border-teal-300 dark:hover:border-teal-700 transition-all dark:bg-slate-900">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <a
                          href={`tel:${item.number}`}
                          className="text-2xl font-black text-teal-700 dark:text-teal-400 hover:underline tracking-tight flex items-center gap-2 font-mono"
                        >
                          <PhoneCall className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                          {item.number}
                        </a>
                        <Badge variant={item.badgeVariant} size="sm">{item.badge}</Badge>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.label}</h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">{item.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Operational Analytics */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 space-y-1">
                  <span className="text-[11px] text-slate-500 font-medium">Total Voice Calls</span>
                  <div className="text-2xl font-black text-slate-900 font-mono">{analytics.total_calls}</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 space-y-1">
                  <span className="text-[11px] text-slate-500 font-medium">Completed Flows</span>
                  <div className="text-2xl font-black text-teal-700 font-mono">{analytics.completed_flows_count}</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 space-y-1">
                  <span className="text-[11px] text-slate-500 font-medium">108 Emergency Routed</span>
                  <div className="text-2xl font-black text-rose-600 font-mono">{analytics.emergency_guidance_routed_count}</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 space-y-1">
                  <span className="text-[11px] text-slate-500 font-medium">Callback Resolution</span>
                  <div className="text-2xl font-black text-teal-700 font-mono">{analytics.callback_resolution_rate_percentage}%</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-slate-900">Language Usage Distribution</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>हिंदी (Hindi)</span>
                    <span>{analytics.language_breakdown.hi}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-teal-600 h-2 rounded-full" style={{ width: `${analytics.language_breakdown.hi}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>मराठी (Marathi)</span>
                    <span>{analytics.language_breakdown.mr}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-teal-500 h-2 rounded-full" style={{ width: `${analytics.language_breakdown.mr}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>English</span>
                    <span>{analytics.language_breakdown.en}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-teal-400 h-2 rounded-full" style={{ width: `${analytics.language_breakdown.en}%` }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Disclaimer Strip */}
        <Alert variant="info" className="text-xs py-3">
          <strong>Telephony Note:</strong> JeevanSetu operates with deterministic mock telephony providers for developer simulation and production telephony adapters for live PSTN gateways. All caller metadata is strictly masked to preserve rural patient privacy.
        </Alert>
      </main>

      <Footer />
    </div>
  );
}

export default CallAssistancePage;
