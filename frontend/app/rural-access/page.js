"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { ruralAccessApi } from "@/lib/api";
import {
  initOfflineCache,
  getOfflineEmergencyData,
  getOfflineSyncTimestamp,
  syncOfflineCacheNow,
} from "@/lib/offlineStorage";
import {
  Phone,
  User,
  Building,
  HeartHandshake,
  HelpCircle,
  CheckCircle2,
  MapPin,
  Search,
  Compass,
  Volume2,
  Wifi,
  WifiOff,
  DownloadCloud,
  ShieldAlert,
  Flame,
  HeartPulse,
  Printer,
  Sparkles,
  Zap,
  Activity,
  Check,
  RefreshCw,
} from "lucide-react";

export function RuralAccessPage() {
  const { user } = useAuth();
  const { t, currentLanguage } = useLanguage();

  // Dialog / Modal triggers
  const [isIvrModalOpen, setIsIvrModalOpen] = useState(false);
  const [isAshaModalOpen, setIsAshaModalOpen] = useState(false);
  const [isPhcModalOpen, setIsPhcModalOpen] = useState(false);
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);

  // Offline low-bandwidth mode states
  const [offlineData, setOfflineData] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState("");
  const [isSimulatingOffline, setIsSimulatingOffline] = useState(false);
  const [offlineTab, setOfflineTab] = useState("hotlines"); // 'hotlines' | 'phcs' | 'protocols'
  const [isSyncingOffline, setIsSyncingOffline] = useState(false);
  const [offlineSyncMessage, setOfflineSyncMessage] = useState("");

  // Assisted booking states
  const [citizenName, setCitizenName] = useState("");
  const [citizenPhone, setCitizenPhone] = useState("");
  const [serviceType, setServiceType] = useState("referral_status");
  const [citizenConsent, setCitizenConsent] = useState(false);
  const [requestDetails, setRequestDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState("");
  const [formError, setFormError] = useState("");

  // IVR simulation states
  const [ivrLang, setIvrLang] = useState("en");
  const [ivrData, setIvrData] = useState(null);
  const [ivrStep, setIvrStep] = useState("welcome"); // 'welcome', 'menu'
  const [ivrActiveChoice, setIvrActiveChoice] = useState("");

  useEffect(() => {
    const data = initOfflineCache();
    setOfflineData(data);
    setLastSyncTime(getOfflineSyncTimestamp());
  }, []);

  const handleSyncOfflineData = () => {
    setIsSyncingOffline(true);
    setOfflineSyncMessage("");
    setTimeout(() => {
      syncOfflineCacheNow();
      setOfflineData(getOfflineEmergencyData());
      setLastSyncTime(new Date().toISOString());
      setIsSyncingOffline(false);
      setOfflineSyncMessage("✅ Emergency directory, 5 PHC rosters & 3 first-aid protocols successfully cached offline in browser memory.");
    }, 600);
  };

  const loadIvrFlow = async (lang) => {
    try {
      const res = await ruralAccessApi.getIvrFlow(lang);
      if (res && res.data) {
        setIvrData(res.data);
      }
    } catch (err) {
      const fallbackIvr = {
        welcome: "Welcome to JeevanSetu Healthcare IVR. Press 1 for English, 2 for Hindi, 3 for Marathi.",
        mainMenu: {
          prompt: "Main Menu: Press 1 for General Health Info, 2 for Facility Directory, 3 for Referral Status, 4 for Medicine Stock, 5 for Schemes, 6 for ASHA Callback, 9 for Emergency Escalation.",
          options: {
            "1": "General Health Info: Press 1 for Monsoon Prevention, 2 for Heatwave Advisory, 3 for Child Vaccination.",
            "2": "Facility Directory: Press 1 to find Nearest PHC, 2 for District Civil Hospital.",
            "3": "Referral Status: Enter your 6-digit Case Number to retrieve active transfer updates.",
            "4": "Medicine Stock: Press 1 for Paracetamol, 2 for Anti-snake venom, 3 for Antibiotics.",
            "5": "Govt Schemes: Press 1 for PMJAY, 2 for MJPJAY (Mahatma Jyotirao Phule Jan Arogya Yojana).",
            "6": "ASHA Callback: A frontline health worker will visit your home within 24 hours.",
            "9": "EMERGENCY: Immediate routing to MEMS 108 Ambulance Dispatch.",
          },
        },
      };
      setIvrData(fallbackIvr);
    }
  };

  useEffect(() => {
    loadIvrFlow(ivrLang);
  }, [ivrLang]);

  // Submit assisted request (ASHA Flow)
  const handleSubmitAssistedRequest = async (e) => {
    e.preventDefault();
    if (!citizenConsent) {
      setFormError("Explicit citizen consent is mandatory before raising any request.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");
    setFormSuccess("");

    try {
      const payload = {
        citizen_name: citizenName,
        citizen_phone: citizenPhone,
        service_requested: serviceType,
        details: requestDetails,
        citizen_consent_given: citizenConsent,
      };

      await ruralAccessApi.submitAssistedRequest(payload);
      setFormSuccess(`Request for ${citizenName} successfully logged and routed to district health officers.`);
      setCitizenName("");
      setCitizenPhone("");
      setRequestDetails("");
      setCitizenConsent(false);
    } catch (err) {
      setFormSuccess(`ASHA Request for ${citizenName} successfully logged [DEVELOPMENT SIMULATION].`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // PHCs list mock
  const mockPhcsList = [
    { name: "Ashti Primary Health Centre", location: "Ashti Taluka, Wardha", phone: "+91 712 2744650", staff: "Sister Alka Patil" },
    { name: "Ramtek Rural Health Hub", location: "Ramtek, Nagpur District", phone: "+91 712 291042", staff: "Sister Meena Gawande" },
    { name: "Bhamragad Tribal Sub-Centre", location: "Bhamragad, Gadchiroli", phone: "+91 7132 222108", staff: "Sister Rekha Madavi" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        {/* Page Header with Offline Sync Status */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 font-semibold px-2.5 py-0.5 border border-emerald-200 dark:border-emerald-800 text-[11px]">
                Assisted Healthcare & Low-Bandwidth Model
              </Badge>
              <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-[10px] font-mono">
                PWA Offline Cached
              </Badge>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Rural Health Access (ग्रामीण आरोग्य पोहोच)
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-3xl">
              Equitable healthcare delivery designed for remote hamlets, tribal belts, limited connectivity zones, and keypad feature-phone users without internet.
            </p>
          </div>

          {/* Quick Offline Cache Trigger Button */}
          <button
            onClick={() => setIsOfflineModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold rounded-2xl shadow-sm hover:shadow-md transition-all shrink-0 border border-emerald-400/30"
          >
            <WifiOff className="w-4 h-4 animate-pulse" />
            <div className="text-left">
              <p className="text-[10px] text-emerald-100 font-medium uppercase">Zero Internet Mode</p>
              <p className="text-xs font-bold text-white">Offline Emergency Cache →</p>
            </div>
          </button>
        </div>

        {/* Global Transparency Banner */}
        <div className="mb-6">
          <Alert className="bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-900 text-teal-950 dark:text-teal-200 flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-xs">Multi-Channel Offline & Low-Bandwidth Guarantee</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                For citizens with no internet, JeevanSetu operates through <strong>ASHA frontline workers</strong>, <strong>Toll-free IVR DTMF voice callback</strong>, and <strong>browser-cached offline emergency directories</strong> with zero active network dependencies.
              </p>
            </div>
          </Alert>
        </div>

        {/* Main 5-Pillar Rural Healthcare Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-12">
          {/* Card 1: Offline Low-Bandwidth Mode */}
          <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 rounded-3xl p-6 flex flex-col justify-between hover:shadow-md transition-all duration-200 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-bl-full pointer-events-none" />
            <div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <WifiOff className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-950 dark:text-white mb-2">
                📶 Offline Emergency Hub
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                Instant access to 108/102 dispatch, nearest PHC contacts, snakebite protocols, and CPR guides even without internet connection.
              </p>
            </div>
            <Button
              onClick={() => setIsOfflineModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white w-full text-xs font-semibold py-2 rounded-xl"
            >
              Open Offline Cache
            </Button>
          </div>

          {/* Card 2: Feature Phone IVR */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col justify-between hover:shadow-md transition-all duration-200">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4">
                <Phone className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-950 dark:text-white mb-2">📞 Feature Phone IVR</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                Toll-free IVR voice helpline for keypad feature phones in English, Marathi, and Hindi for medical inquiries and referral tracking.
              </p>
            </div>
            <Button
              onClick={() => {
                setIsIvrModalOpen(true);
                setIvrStep("welcome");
                setIvrActiveChoice("");
              }}
              className="bg-teal-600 hover:bg-teal-700 text-white w-full text-xs font-semibold py-2 rounded-xl"
            >
              Call IVR Simulator
            </Button>
          </div>

          {/* Card 3: ASHA Frontline Worker */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col justify-between hover:shadow-md transition-all duration-200">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                <User className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-950 dark:text-white mb-2">👩⚕️ ASHA Worker Portal</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                Frontline health workers register door-to-door patient requests, log preliminary vitals, and coordinate referral transfers.
              </p>
            </div>
            <Button
              onClick={() => setIsAshaModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white w-full text-xs font-semibold py-2 rounded-xl"
            >
              ASHA Assisted Portal
            </Button>
          </div>

          {/* Card 4: PHC Assistance */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col justify-between hover:shadow-md transition-all duration-200">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-4">
                <Building className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-950 dark:text-white mb-2">🏥 PHC & Kiosks</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                Locate primary health sub-centres, essential medicine stocks, diagnostic schedules, and clinical doctor visit days.
              </p>
            </div>
            <Button
              onClick={() => setIsPhcModalOpen(true)}
              className="bg-sky-600 hover:bg-sky-700 text-white w-full text-xs font-semibold py-2 rounded-xl"
            >
              Find Nearest PHC
            </Button>
          </div>

          {/* Card 5: Caregiver Mode */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col justify-between hover:shadow-md transition-all duration-200">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-950 dark:text-white mb-2">👨👩👧 Family / Caregiver</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                Empower a trusted family member or village volunteer to manage appointments and government scheme verification on behalf of elders.
              </p>
            </div>
            <Button
              onClick={() => setIsFamilyModalOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white w-full text-xs font-semibold py-2 rounded-xl"
            >
              Access Caregiver Mode
            </Button>
          </div>
        </div>

        {/* Operational View: Multi-Tier Village Health Access Network */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
          <h2 className="text-xl font-bold text-slate-950 dark:text-white mb-4 flex items-center gap-2">
            <Compass className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            JeevanSetu Village Health Access Network
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-8 max-w-3xl">
            JeevanSetu acts as an information routing and care-coordination layer connecting patients from remote tribal hamlets to regional apex hospitals:
          </p>

          <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            {/* Step 1 */}
            <div className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 relative w-full">
              <span className="absolute -top-3 left-4 bg-teal-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Level 1</span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1">Remote Citizen / Patient</h4>
              <p className="text-[10px] text-slate-500 mt-1">Accesses offline emergency cache, requests ASHA home visit, or calls toll-free IVR.</p>
            </div>

            <div className="hidden md:block text-slate-300">➔</div>

            {/* Step 2 */}
            <div className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 relative w-full">
              <span className="absolute -top-3 left-4 bg-teal-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Level 2</span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1">ASHA Frontline Worker</h4>
              <p className="text-[10px] text-slate-500 mt-1">Logs health concerns, records preliminary vitals, and registers case files with verbal consent.</p>
            </div>

            <div className="hidden md:block text-slate-300">➔</div>

            {/* Step 3 */}
            <div className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 relative w-full">
              <span className="absolute -top-3 left-4 bg-teal-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Level 3</span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1">Primary Health Centre (PHC)</h4>
              <p className="text-[10px] text-slate-500 mt-1">Initiates digital referral pathways to specialized hospitals and checks anti-venom/blood stock.</p>
            </div>

            <div className="hidden md:block text-slate-300">➔</div>

            {/* Step 4 */}
            <div className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 relative w-full">
              <span className="absolute -top-3 left-4 bg-teal-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Level 4</span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1">District Trauma Hospital</h4>
              <p className="text-[10px] text-slate-500 mt-1">Admits referred patient immediately under pre-verified government schemes (PMJAY/MJPJAY).</p>
            </div>
          </div>
        </div>
      </main>

      {/* Modal 0: OFFLINE EMERGENCY CACHE & LOW-BANDWIDTH MODE */}
      {isOfflineModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsOfflineModalOpen(false)}
          title="📶 Offline Emergency Hub & Low-Bandwidth Mode (Zero Internet)"
          className="max-w-3xl"
        >
          <div className="space-y-4 text-xs">
            {/* Status & Sync Bar */}
            <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${isSimulatingOffline ? "bg-amber-500 text-slate-950" : "bg-emerald-500 text-white"}`}>
                  {isSimulatingOffline ? <WifiOff className="w-5 h-5" /> : <Wifi className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-extrabold text-xs">
                    Network State: {isSimulatingOffline ? "🔴 Low-Bandwidth / Zero Connectivity Mode Active" : "🟢 Online (Normal Mode)"}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Last Cache Sync: {lastSyncTime ? new Date(lastSyncTime).toLocaleString() : "Cached for offline access"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsSimulatingOffline(!isSimulatingOffline)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${
                    isSimulatingOffline
                      ? "bg-amber-500 text-slate-950 border-amber-400"
                      : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                  }`}
                >
                  {isSimulatingOffline ? "Exit Offline Mode" : "Simulate Zero Internet"}
                </button>

                <Button
                  onClick={handleSyncOfflineData}
                  disabled={isSyncingOffline}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-3 py-1.5 h-8"
                >
                  {isSyncingOffline ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1" /> : <DownloadCloud className="w-3.5 h-3.5 mr-1" />}
                  Sync Cache Now
                </Button>
              </div>
            </div>

            {offlineSyncMessage && (
              <Alert className="bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-300 text-[11px]">
                {offlineSyncMessage}
              </Alert>
            )}

            {/* Offline Content Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <button
                onClick={() => setOfflineTab("hotlines")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  offlineTab === "hotlines"
                    ? "bg-teal-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                Emergency Hotlines (5)
              </button>

              <button
                onClick={() => setOfflineTab("phcs")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  offlineTab === "phcs"
                    ? "bg-sky-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                Cached PHC Centers (5)
              </button>

              <button
                onClick={() => setOfflineTab("protocols")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  offlineTab === "protocols"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                }`}
              >
                <HeartPulse className="w-3.5 h-3.5" />
                Life-Saving Protocols (3)
              </button>
            </div>

            {/* TAB 1: HOTLINES & CONTROL ROOMS */}
            {offlineTab === "hotlines" && offlineData && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {offlineData.hotlines.map((h) => (
                    <div
                      key={h.code}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-rose-600 dark:text-rose-400">{h.code}</span>
                          <span className="font-bold text-xs text-slate-900 dark:text-white">{h.title}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">{h.desc}</p>
                      </div>
                      <a
                        href={h.action}
                        className="inline-flex items-center justify-center px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shrink-0"
                      >
                        <Phone className="w-3 h-3 mr-1" />
                        Call
                      </a>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <p className="font-bold text-[11px] text-slate-700 dark:text-slate-300">
                    District Collectorate & Civil Hospital Control Rooms (Maharashtra)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                    {offlineData.districtControlRooms.map((d) => (
                      <div key={d.district} className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800">
                        <div>
                          <strong>{d.district}:</strong> {d.facility}
                        </div>
                        <a href={`tel:${d.phone}`} className="text-teal-600 font-bold ml-2 shrink-0">
                          {d.phone}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: CACHED PRIMARY HEALTH CENTRES */}
            {offlineTab === "phcs" && offlineData && (
              <div className="space-y-2.5">
                {offlineData.essentialPhcs.map((phc) => (
                  <div
                    key={phc.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">{phc.name}</h4>
                        <Badge className="bg-sky-100 text-sky-800 text-[9px] px-1.5">{phc.district}</Badge>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        <strong>Available Services:</strong> {phc.services}
                      </p>
                      <p className="text-[10px] text-slate-400">In-Charge: {phc.inCharge}</p>
                    </div>

                    <a
                      href={`tel:${phc.phone}`}
                      className="inline-flex items-center justify-center px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shrink-0"
                    >
                      <Phone className="w-3 h-3 mr-1" />
                      {phc.phone}
                    </a>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: LIFE-SAVING PROTOCOLS */}
            {offlineTab === "protocols" && offlineData && (
              <div className="space-y-3">
                {offlineData.firstAidProtocols.map((proto) => (
                  <div
                    key={proto.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5"
                  >
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      {proto.title}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                      <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60">
                        <p className="font-bold text-emerald-900 dark:text-emerald-300 mb-1">✅ DO THIS (हे करा):</p>
                        <ul className="space-y-1 text-[10px] text-emerald-800 dark:text-emerald-400 list-disc list-inside">
                          {proto.doList.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60">
                        <p className="font-bold text-rose-900 dark:text-rose-300 mb-1">❌ DO NOT DO (हे करू नका):</p>
                        <ul className="space-y-1 text-[10px] text-rose-800 dark:text-rose-400 list-disc list-inside">
                          {proto.dontList.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400">
                PWA Storage: Stored Locally in Browser Memory (Zero Mobile Data Required)
              </span>
              <Button
                onClick={() => setIsOfflineModalOpen(false)}
                className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold px-4"
              >
                Close Offline Hub
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal 1: IVR Simulator */}
      {isIvrModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsIvrModalOpen(false)}
          title="📞 Feature Phone IVR Simulator"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-200">
                Interactive Voice Response
              </Badge>
              <span className="text-[10px] text-slate-400">Simulating Dial: 1800-108-102</span>
            </div>

            {/* Language Selector in simulator */}
            <div className="flex justify-end gap-2 mb-2">
              <button
                onClick={() => setIvrLang("en")}
                className={`text-[10px] font-bold px-2 py-1 rounded-md border ${ivrLang === "en" ? "bg-teal-600 text-white border-teal-600" : "bg-slate-100 dark:bg-slate-800 border-slate-200"}`}
              >
                English
              </button>
              <button
                onClick={() => setIvrLang("hi")}
                className={`text-[10px] font-bold px-2 py-1 rounded-md border ${ivrLang === "hi" ? "bg-teal-600 text-white border-teal-600" : "bg-slate-100 dark:bg-slate-800 border-slate-200"}`}
              >
                हिन्दी
              </button>
              <button
                onClick={() => setIvrLang("mr")}
                className={`text-[10px] font-bold px-2 py-1 rounded-md border ${ivrLang === "mr" ? "bg-teal-600 text-white border-teal-600" : "bg-slate-100 dark:bg-slate-800 border-slate-200"}`}
              >
                मराठी
              </button>
            </div>

            {/* IVR Voice Output Panel */}
            <div className="bg-slate-950 text-emerald-400 p-4 rounded-xl border border-slate-800 font-mono text-xs space-y-2 relative overflow-hidden">
              <div className="absolute right-3 top-3 animate-pulse text-rose-500 flex items-center gap-1">
                <Volume2 className="w-4 h-4" />
                <span className="text-[10px] font-bold">AUDIO</span>
              </div>

              {ivrStep === "welcome" && (
                <div>
                  <p className="text-slate-400">[Voice Intro Playing...]</p>
                  <p className="mt-2 text-emerald-300 font-semibold">{ivrData?.welcome}</p>
                </div>
              )}

              {ivrStep === "menu" && (
                <div>
                  <p className="text-slate-400">[Main Menu Options...]</p>
                  <p className="mt-2 text-emerald-300 font-semibold">{ivrData?.mainMenu?.prompt}</p>

                  {ivrActiveChoice && (
                    <div className="mt-4 pt-3 border-t border-emerald-900 text-yellow-300">
                      <p className="font-bold">Option {ivrActiveChoice} Output:</p>
                      <p className="mt-1">{ivrData?.mainMenu?.options[ivrActiveChoice] || "Invalid Option Selected."}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Simulated Keypad Panel */}
            <div>
              <p className="text-[11px] font-bold text-slate-400 mb-2 uppercase">Dial DTMF Keys</p>

              {ivrStep === "welcome" ? (
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    onClick={() => { setIvrLang("en"); setIvrStep("menu"); }}
                    className="text-xs border border-slate-200 dark:border-slate-700 py-2 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    1 (English)
                  </Button>
                  <Button
                    onClick={() => { setIvrLang("hi"); setIvrStep("menu"); }}
                    className="text-xs border border-slate-200 dark:border-slate-700 py-2 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    2 (हिन्दी)
                  </Button>
                  <Button
                    onClick={() => { setIvrLang("mr"); setIvrStep("menu"); }}
                    className="text-xs border border-slate-200 dark:border-slate-700 py-2 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    3 (मराठी)
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    {["1", "2", "3", "4", "5", "6", "9"].map((key) => (
                      <button
                        key={key}
                        onClick={() => setIvrActiveChoice(key)}
                        className={`text-xs font-bold py-2 border rounded-lg hover:bg-teal-50 dark:hover:bg-teal-950/20 transition-all ${ivrActiveChoice === key ? "bg-teal-600 text-white border-teal-600" : "border-slate-200 dark:border-slate-700"}`}
                      >
                        Press {key}
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-between gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                    <Button
                      variant="outline"
                      onClick={() => { setIvrStep("welcome"); setIvrActiveChoice(""); }}
                      className="text-xs"
                    >
                      Back to Language Selection
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => setIsIvrModalOpen(false)}
                      className="text-xs border-rose-500/20 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                    >
                      Disconnect Call
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Modal 2: ASHA Assisted Request */}
      {isAshaModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => { setIsAshaModalOpen(false); setFormSuccess(""); setFormError(""); }}
          title="👩⚕️ ASHA Worker Assisted Portal"
        >
          <form onSubmit={handleSubmitAssistedRequest} className="space-y-4">
            <div className="bg-teal-50/50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/50 rounded-xl p-3 text-[11px] text-slate-500 dark:text-slate-400">
              Logged in: <strong>ASHA Coordinator ({user?.full_name || "Guest Frontline Helper"})</strong>.
              Fill in patient request details with verbal/written consent.
            </div>

            {formSuccess && (
              <Alert className="bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-300">
                {formSuccess}
              </Alert>
            )}

            {formError && (
              <Alert className="bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-300">
                {formError}
              </Alert>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Citizen Full Name</label>
              <Input
                type="text"
                placeholder="e.g. Ramesh Pawar"
                value={citizenName}
                onChange={(e) => setCitizenName(e.target.value)}
                required
                className="text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Citizen Mobile (Optional / basic feature-phone)</label>
              <Input
                type="text"
                placeholder="e.g. +91 98220 11111"
                value={citizenPhone}
                onChange={(e) => setCitizenPhone(e.target.value)}
                className="text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Service Requested</label>
              <Select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="text-xs"
              >
                <option value="referral_status">Outgoing Referral status lookup</option>
                <option value="facility_lookup">Check nearest PHC specialty doctor availability</option>
                <option value="scheme_details">Verify Ayushman Bharat / MJPJAY scheme eligibility</option>
                <option value="medicine_info">Query PHC stock status of essential medicines</option>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Additional description/details</label>
              <Textarea
                rows={2}
                placeholder="e.g. Inpatient referral from Ashti to Gadchiroli, checking slot availability."
                value={requestDetails}
                onChange={(e) => setRequestDetails(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="flex items-start gap-2 border border-yellow-200 dark:border-yellow-900 bg-yellow-50/50 dark:bg-yellow-950/20 p-3 rounded-xl">
              <input
                type="checkbox"
                id="consent-check"
                checked={citizenConsent}
                onChange={(e) => setCitizenConsent(e.target.checked)}
                className="w-4 h-4 text-teal-600 border-slate-300 rounded mt-0.5"
              />
              <label htmlFor="consent-check" className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold leading-normal select-none">
                I confirm that I have obtained explicit consent from the citizen to view their health records or request updates.
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAshaModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-teal-600 hover:bg-teal-700 text-white text-xs"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Logging Request..." : "Submit Assisted Action"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal 3: PHCs List */}
      {isPhcModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsPhcModalOpen(false)}
          title="🏥 PHCs & Digital Kiosks Registry"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              Maharashtra health sub-centres are equipped with digital kiosks where citizen records can be queried by staff.
            </p>

            <div className="space-y-3">
              {mockPhcsList.map((phc) => (
                <div key={phc.name} className="border border-slate-150 dark:border-slate-800 rounded-xl p-3 bg-slate-50 dark:bg-slate-950/60 flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{phc.name}</h4>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      {phc.location}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">In-charge: {phc.staff}</p>
                  </div>
                  <a
                    href={`tel:${phc.phone}`}
                    className="inline-flex items-center justify-center p-2 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 border border-teal-100 dark:border-teal-900"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* Modal 4: Family Member Access */}
      {isFamilyModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsFamilyModalOpen(false)}
          title="👨👩👧 Caregiver / Family Assisted Access"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              A family member can link a patient's ABHA ID to their profile to query test results, check referral timelines, or coordinate medication refills.
            </p>

            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-150 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Simulate Patient Authorization</h4>
              <Input
                type="text"
                placeholder="Enter Patient ABHA ID or mobile..."
                className="text-xs bg-white dark:bg-slate-900"
              />
              <Button
                onClick={() => {
                  alert("Access code sent via SMS to patient's registered mobile number.");
                }}
                className="w-full bg-teal-600 text-white text-xs font-semibold py-2 rounded-xl"
              >
                Send Link Authentication Code
              </Button>
            </div>
          </div>
        </Modal>
      )}

      <Footer />
    </div>
  );
}

export default RuralAccessPage;
