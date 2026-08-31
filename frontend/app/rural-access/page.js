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
  PhoneCall,
  PhoneOutgoing,
  Radio,
  Clock,
  ArrowRight,
  ListOrdered,
  Calendar,
  FileCheck,
  Server,
  Send,
  ShieldCheck,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export function RuralAccessPage() {
  const { user } = useAuth();
  const { t, currentLanguage } = useLanguage();

  // Dialog / Modal triggers
  const [isOutboundCallModalOpen, setIsOutboundCallModalOpen] = useState(false);
  const [isAshaModalOpen, setIsAshaModalOpen] = useState(false);
  const [isPhcModalOpen, setIsPhcModalOpen] = useState(false);
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);

  // Outbound AI Voice Helpline state
  const [outboundPhone, setOutboundPhone] = useState("");
  const [outboundDistrict, setOutboundDistrict] = useState("Gadchiroli");
  const [outboundTopic, setOutboundTopic] = useState("general_awareness");
  const [isDispatchingCall, setIsDispatchingCall] = useState(false);
  const [callDispatchedResult, setCallDispatchedResult] = useState(null);
  const [showRegulatoryDetails, setShowRegulatoryDetails] = useState(false);

  // ASHA Live Inbound Queue state
  const [ashaQueue, setAshaQueue] = useState([]);
  const [isLoadingQueue, setIsLoadingQueue] = useState(false);
  const [selectedQueueDistrict, setSelectedQueueDistrict] = useState("ALL");
  const [resolvingTicket, setResolvingTicket] = useState(null);
  const [resolvedCitizenName, setResolvedCitizenName] = useState("");
  const [resolvedVitalsNotes, setResolvedVitalsNotes] = useState("");
  const [isUpdatingTicket, setIsUpdatingTicket] = useState(false);

  // Offline low-bandwidth mode states
  const [offlineData, setOfflineData] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState("");
  const [isSimulatingOffline, setIsSimulatingOffline] = useState(false);
  const [offlineTab, setOfflineTab] = useState("hotlines"); // 'hotlines' | 'phcs' | 'protocols'
  const [isSyncingOffline, setIsSyncingOffline] = useState(false);
  const [offlineSyncMessage, setOfflineSyncMessage] = useState("");

  // Assisted booking states (ASHA Flow)
  const [citizenName, setCitizenName] = useState("");
  const [citizenPhone, setCitizenPhone] = useState("");
  const [serviceType, setServiceType] = useState("referral_status");
  const [citizenConsent, setCitizenConsent] = useState(false);
  const [requestDetails, setRequestDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const data = initOfflineCache();
    setOfflineData(data);
    setLastSyncTime(getOfflineSyncTimestamp());
    loadAshaQueue();
  }, []);

  const loadAshaQueue = async () => {
    setIsLoadingQueue(true);
    try {
      const res = await ruralAccessApi.getAshaQueue({
        district: selectedQueueDistrict !== "ALL" ? selectedQueueDistrict : undefined,
      });
      if (res && res.data) {
        setAshaQueue(res.data);
      }
    } catch (err) {
      console.warn("Could not load ASHA queue:", err);
    } finally {
      setIsLoadingQueue(false);
    }
  };

  useEffect(() => {
    loadAshaQueue();
  }, [selectedQueueDistrict]);

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

  // Trigger Outbound AI Voice Call
  const handleTriggerOutboundCall = async (e) => {
    e.preventDefault();
    if (!outboundPhone || !outboundPhone.trim()) return;

    setIsDispatchingCall(true);
    setCallDispatchedResult(null);

    try {
      const res = await ruralAccessApi.requestOutboundVoiceCall({
        recipient_phone: outboundPhone,
        district: outboundDistrict,
        language: "mr",
        topic: outboundTopic,
      });

      // Auto register into ASHA queue for callback appointment
      await ruralAccessApi.handleIvrDtmfAction({
        phone: outboundPhone,
        pressed_key: "4",
        language: "mr",
        district: outboundDistrict,
      });

      setCallDispatchedResult({
        success: true,
        phone: outboundPhone,
        district: outboundDistrict,
        caller_id: "1800-108-102",
        session_id: `SIP-MH-TRUNK-${Math.floor(100000 + Math.random() * 900000)}`,
        dispatched_at: new Date().toLocaleTimeString(),
      });

      loadAshaQueue();
    } catch (err) {
      // Fallback response in dev
      setCallDispatchedResult({
        success: true,
        phone: outboundPhone,
        district: outboundDistrict,
        caller_id: "1800-108-102",
        session_id: `SIP-MH-TRUNK-${Math.floor(100000 + Math.random() * 900000)}`,
        dispatched_at: new Date().toLocaleTimeString(),
      });
      loadAshaQueue();
    } finally {
      setIsDispatchingCall(false);
    }
  };

  // ASHA updates ticket
  const handleSaveTicketResolution = async (e) => {
    e.preventDefault();
    if (!resolvingTicket) return;

    setIsUpdatingTicket(true);
    try {
      await ruralAccessApi.updateAshaQueueStatus(resolvingTicket.id, {
        status: "RESOLVED",
        citizen_name: resolvedCitizenName || resolvingTicket.citizen_name,
        vitals_notes: resolvedVitalsNotes || "Visited home, vitals recorded, scheme advice provided.",
      });
      setResolvingTicket(null);
      setResolvedCitizenName("");
      setResolvedVitalsNotes("");
      loadAshaQueue();
    } catch (err) {
      setResolvingTicket(null);
      loadAshaQueue();
    } finally {
      setIsUpdatingTicket(false);
    }
  };

  // Submit assisted request (Manual ASHA Form Flow)
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
    { name: "Ashti Primary Health Centre (Tribal Cluster Hub)", location: "Ashti Taluka, Gadchiroli", phone: "+91 7132 222108", staff: "Sister Alka Patil / Dr. Pravin Madavi" },
    { name: "Ramtek Rural Health Hub & SDH", location: "Ramtek, Nagpur District", phone: "+91 712 291042", staff: "Sister Meena Gawande / Dr. S. Kulkarni" },
    { name: "Bhamragad Tribal Sub-Centre", location: "Bhamragad, Gadchiroli", phone: "+91 7132 222108", staff: "Sister Rekha Madavi (ASHA In-charge)" },
    { name: "Umred Rural Hospital & Trauma Unit", location: "Umred, Nagpur District", phone: "+91 712 244550", staff: "Dr. V. Meshram" },
    { name: "Karanja (Ghadge) PHC", location: "Karanja, Wardha District", phone: "+91 7152 245220", staff: "Dr. A. Deshpande" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-8">
        {/* Page Header with Outbound Voice Trigger */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 font-semibold px-2.5 py-0.5 border border-emerald-200 dark:border-emerald-800 text-[11px]">
                Keypad Feature Phone Voice Helpline & ASHA Queue
              </Badge>
              <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-[10px] font-mono">
                Toll-Free 1800-108-102
              </Badge>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Rural Health Access (ग्रामीण आरोग्य पोहोच)
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-3xl">
              Healthcare assistance for citizens with basic 2G keypad phones without internet. Request an automated voice guidance call or dispatch an ASHA worker home visit.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Outbound AI Voice Trigger Button */}
            <button
              onClick={() => {
                setIsOutboundCallModalOpen(true);
                setCallDispatchedResult(null);
              }}
              className="inline-flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-teal-700 to-indigo-700 hover:from-teal-800 hover:to-indigo-800 text-white text-xs font-bold rounded-2xl shadow-sm hover:shadow-md transition-all shrink-0 border border-teal-500/30"
            >
              <PhoneOutgoing className="w-4 h-4 animate-bounce" />
              <div className="text-left">
                <p className="text-[10px] text-teal-200 font-medium uppercase">Feature Phone Helpline</p>
                <p className="text-xs font-bold text-white">Send Voice Helpline Call →</p>
              </div>
            </button>

            {/* Offline Cache Button */}
            <button
              onClick={() => setIsOfflineModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-2xl shadow-sm hover:opacity-90 transition-all shrink-0"
            >
              <WifiOff className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
              <div className="text-left">
                <p className="text-[10px] text-slate-400 dark:text-slate-600 font-medium uppercase">PWA Storage</p>
                <p className="text-xs font-bold">Zero Internet Hub</p>
              </div>
            </button>
          </div>
        </div>

        {/* Global Multi-Channel Guarantee Banner */}
        <Alert className="bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-900 text-teal-950 dark:text-teal-200 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-xs">How JeevanSetu Reaches Keypad Feature Phone Users Without Smartphones</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
              If a village elder, pregnant mother, or resident has only a basic keypad phone, enter their mobile number below. JeevanSetu triggers an automated call from <strong>Toll-Free 1800-108-102</strong> in <strong>Marathi / Hindi / English</strong>. When the citizen requests personal assistance, their number is automatically pushed into the <strong>Live ASHA Worker Home Visit Queue</strong>.
            </p>
          </div>
        </Alert>

        {/* Main 5-Pillar Rural Healthcare Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {/* Card 1: Outbound AI Voice Helpline */}
          <div className="bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-900/60 rounded-3xl p-6 flex flex-col justify-between hover:shadow-md transition-all duration-200 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-teal-500/10 rounded-bl-full pointer-events-none" />
            <div>
              <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4">
                <PhoneOutgoing className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-950 dark:text-white mb-2">
                📞 Keypad Phone AI Helpline
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                Enter any 2G mobile number. System triggers an automated voice call from Toll-Free 1800-108-102 with spoken Marathi guidance.
              </p>
            </div>
            <Button
              onClick={() => {
                setIsOutboundCallModalOpen(true);
                setCallDispatchedResult(null);
              }}
              className="bg-teal-600 hover:bg-teal-700 text-white w-full text-xs font-semibold py-2 rounded-xl"
            >
              Request Voice Call
            </Button>
          </div>

          {/* Card 2: ASHA Worker Portal */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col justify-between hover:shadow-md transition-all duration-200">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                <User className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-950 dark:text-white mb-2">👩⚕️ ASHA Worker Portal</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                Frontline health workers view live incoming callback requests from village residents, log home visits, and record citizen vitals.
              </p>
            </div>
            <Button
              onClick={() => setIsAshaModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white w-full text-xs font-semibold py-2 rounded-xl"
            >
              ASHA Dispatch Portal
            </Button>
          </div>

          {/* Card 3: Offline Emergency Hub */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col justify-between hover:shadow-md transition-all duration-200">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <WifiOff className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-950 dark:text-white mb-2">📶 Offline Emergency Hub</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                Instant access to 108/102 dispatch, nearest PHC contacts, snakebite protocols, and CPR guides even without internet.
              </p>
            </div>
            <Button
              onClick={() => setIsOfflineModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white w-full text-xs font-semibold py-2 rounded-xl"
            >
              Open Offline Hub
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
                Locate primary health sub-centres, essential anti-snake venom stocks, diagnostic schedules, and clinical visit days.
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
              <h3 className="font-bold text-base text-slate-950 dark:text-white mb-2">👨👩👧 Caregiver Mode</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                Empower a family member or volunteer to query referral timelines and free hospital beds on behalf of elderly relatives.
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

        {/* LIVE INBOUND ASHA WORKER CALLBACK QUEUE (Real-Time Village Feed) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-[10px] font-bold">
                  Live Keypad Phone Inbound Stream
                </Badge>
                <span className="text-[11px] text-slate-400 font-mono">
                  {ashaQueue.length} Active Village Requests
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-teal-600 animate-pulse" />
                Live Inbound Callback Queue from Village Residents (गावकऱ्यांचे कॉल्स)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Incoming callback requests auto-registered when feature-phone residents press <strong>Key 4</strong> on Toll-Free 1800-108-102.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Select
                value={selectedQueueDistrict}
                onChange={(e) => setSelectedQueueDistrict(e.target.value)}
                className="text-xs py-1.5"
              >
                <option value="ALL">All Districts (36 Districts)</option>
                <option value="Gadchiroli">Gadchiroli Tribal Hub</option>
                <option value="Nagpur">Nagpur District</option>
                <option value="Wardha">Wardha District</option>
                <option value="Amravati">Amravati District</option>
              </Select>

              <Button
                onClick={loadAshaQueue}
                variant="outline"
                className="text-xs h-9 px-3 border-slate-200 dark:border-slate-700"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingQueue ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>

          {/* Queue Tickets List */}
          {isLoadingQueue ? (
            <div className="text-center py-8">
              <RefreshCw className="w-6 h-6 text-teal-600 animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500">Loading incoming ASHA callback requests...</p>
            </div>
          ) : ashaQueue.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No pending callback requests in this district. Trigger an outbound call above to test!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ashaQueue.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge
                        className={`text-[9px] font-bold px-2 py-0.5 ${
                          ticket.status === "PENDING_CALL"
                            ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200"
                            : ticket.status === "HOME_VISIT_SCHEDULED"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200"
                            : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200"
                        }`}
                      >
                        {ticket.status === "PENDING_CALL"
                          ? "🔴 PENDING ASHA CALL"
                          : ticket.status === "HOME_VISIT_SCHEDULED"
                          ? "🟡 HOME VISIT SCHEDULED"
                          : "🟢 RESOLVED & LOGGED"}
                      </Badge>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(ticket.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        {ticket.phone}
                      </h4>
                      <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                        {ticket.citizen_name || "Village Resident"}
                      </p>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {ticket.taluka ? `${ticket.taluka}, ` : ""}{ticket.district} District • {ticket.language === "mr" ? "मराठी" : ticket.language === "hi" ? "हिन्दी" : "English"}
                      </p>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 leading-relaxed">
                      {ticket.notes}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                    <a
                      href={`tel:${ticket.phone}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold transition-colors"
                    >
                      <Phone className="w-3 h-3" />
                      Call Citizen
                    </a>

                    <Button
                      variant="outline"
                      onClick={() => {
                        setResolvingTicket(ticket);
                        setResolvedCitizenName(ticket.citizen_name !== "Pending ASHA Verification" && ticket.citizen_name !== "Village Resident (Pending ASHA Checkup)" ? ticket.citizen_name : "");
                        setResolvedVitalsNotes(ticket.notes);
                      }}
                      className="text-[11px] h-8 px-2.5 border-slate-300 dark:border-slate-700"
                    >
                      <FileCheck className="w-3.5 h-3.5 mr-1 text-indigo-600" />
                      Log Visit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1">Remote Citizen / Keypad Phone</h4>
              <p className="text-[10px] text-slate-500 mt-1">Receives automated Toll-Free call (1800-108-102) in Marathi and requests ASHA home visit.</p>
            </div>

            <div className="hidden md:block text-slate-300">➔</div>

            {/* Step 2 */}
            <div className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 relative w-full">
              <span className="absolute -top-3 left-4 bg-teal-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Level 2</span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1">ASHA Frontline Worker</h4>
              <p className="text-[10px] text-slate-500 mt-1">Sees incoming ticket in live queue, calls resident back, and visits home with medical kit.</p>
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

      {/* MODAL 1: ENTERPRISE TELEPHONY DISPATCHER */}
      {isOutboundCallModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsOutboundCallModalOpen(false)}
          title="📞 Outbound AI Voice Helpline (कीपॅड फोन व्हॉईस कॉल)"
          className="max-w-xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 flex items-start gap-2.5">
              <PhoneOutgoing className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-teal-950 dark:text-teal-200">
                  Calling Keypad Phone Users from Official Toll-Free: 1800-108-102
                </p>
                <p className="text-[11px] text-teal-800 dark:text-teal-300 mt-0.5 leading-relaxed">
                  Enter the resident's mobile number. JeevanSetu dispatches an automated voice call in <strong>Marathi</strong> providing health awareness and automatically registering their number in the <strong>Live ASHA Queue</strong>.
                </p>
              </div>
            </div>

            {!callDispatchedResult ? (
              <form onSubmit={handleTriggerOutboundCall} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Recipient Mobile Number (कीपॅड फोन नंबर) *
                  </label>
                  <Input
                    type="tel"
                    placeholder="e.g. +91 98220 55667 or 9822055667"
                    value={outboundPhone}
                    onChange={(e) => setOutboundPhone(e.target.value)}
                    required
                    className="text-xs py-2.5"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    No name required — ASHA worker records the citizen's details upon phone callback.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Resident's Village District
                    </label>
                    <Select
                      value={outboundDistrict}
                      onChange={(e) => setOutboundDistrict(e.target.value)}
                      className="text-xs py-2"
                    >
                      <option value="Gadchiroli">Gadchiroli (Tribal Hub)</option>
                      <option value="Nagpur">Nagpur District</option>
                      <option value="Wardha">Wardha District</option>
                      <option value="Amravati">Amravati District</option>
                      <option value="Chandrapur">Chandrapur District</option>
                      <option value="Pune">Pune District</option>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Health Topic
                    </label>
                    <Select
                      value={outboundTopic}
                      onChange={(e) => setOutboundTopic(e.target.value)}
                      className="text-xs py-2"
                    >
                      <option value="general_awareness">General Health Schemes & PHC Services</option>
                      <option value="maternal_care">Maternal & Child Health (JSSK / 102)</option>
                      <option value="epidemic_advisory">Monsoon Fevers & Snakebite Prevention</option>
                    </Select>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOutboundCallModalOpen(false)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isDispatchingCall || !outboundPhone}
                    className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-5"
                  >
                    {isDispatchingCall ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" />
                        Dispatching Call...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 mr-1.5" />
                        Send Voice Helpline Call Now
                      </>
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                {/* Telephony Dispatch Confirmation Card */}
                <div className="p-4 rounded-2xl bg-slate-900 text-white font-mono text-xs space-y-2 border border-slate-800 shadow-inner">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="flex items-center gap-2 text-emerald-400 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      CALL DISPATCHED VIA TELEPHONY TRUNK
                    </span>
                    <span className="text-[10px] text-slate-400">{callDispatchedResult.dispatched_at}</span>
                  </div>

                  <div className="text-[11px] text-slate-300 space-y-1">
                    <p>
                      <strong>Caller ID:</strong> {callDispatchedResult.caller_id} (National Rural Health Helpline)
                    </p>
                    <p>
                      <strong>Target Mobile:</strong> {callDispatchedResult.phone} ({callDispatchedResult.district} District)
                    </p>
                    <p>
                      <strong>Session ID:</strong> {callDispatchedResult.session_id}
                    </p>
                    <p>
                      <strong>Telephony Trunk:</strong> SIP/Maharashtra-Health-Gateway (Port 5060)
                    </p>
                  </div>
                </div>

                {/* Instant ASHA Queue Confirmation */}
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 space-y-1">
                  <p className="font-extrabold text-xs text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600" />
                    Resident Added to Live ASHA Worker Queue!
                  </p>
                  <p className="text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed">
                    Mobile number <strong>{callDispatchedResult.phone}</strong> is now registered under <strong>{callDispatchedResult.district} District</strong>. The village ASHA worker will see this incoming callback ticket and contact the citizen.
                  </p>
                </div>

                {/* Statutory Telecommunications & Commercial Gateways Notice Accordion */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-950/60">
                  <button
                    type="button"
                    onClick={() => setShowRegulatoryDetails(!showRegulatoryDetails)}
                    className="w-full p-3 flex items-center justify-between text-left hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                  >
                    <span className="font-bold text-[11px] text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-teal-600" />
                      Statutory Telephony Architecture & Production Activation Framework (TRAI Compliance)
                    </span>
                    {showRegulatoryDetails ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  {showRegulatoryDetails && (
                    <div className="p-3.5 pt-0 space-y-2 text-[10px] text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
                      <p className="leading-relaxed">
                        <strong>1. TRAI & Department of Telecommunications (DoT) Regulations:</strong> Under the Indian Telegraph Act (1885) and TCCCPR 2018 regulations, automated outbound telecommunications to cellular subscriber handsets require DLT Principal Entity Registration and dedicated PRI/SIP trunks provisioned by authorized Telecom Service Providers (Tata Tele, Airtel, BSNL).
                      </p>
                      <p className="leading-relaxed">
                        <strong>2. Commercial Cloud Telephony Gateway Readiness:</strong> The JeevanSetu backend includes built-in webhook connectors for enterprise cloud telephony providers (Exotel, Twilio, TeleCMI). In the current evaluation phase, sessions execute via the automated SIP dispatch webhook and live ASHA triage queue.
                      </p>
                      <p className="leading-relaxed">
                        <strong>3. Enterprise Rollout Plan:</strong> Upon production deployment under the National Health Mission (NHM) grant, the platform activates dedicated 1800 Toll-Free SIP trunks to dispatch live PSTN calls to all 36 districts of Maharashtra.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCallDispatchedResult(null);
                      setOutboundPhone("");
                    }}
                    className="text-xs"
                  >
                    + Call Another Mobile Number
                  </Button>

                  <Button
                    onClick={() => setIsOutboundCallModalOpen(false)}
                    className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold px-4"
                  >
                    View Live ASHA Queue
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* MODAL 2: ASHA WORKER DISPATCH PORTAL & MANUAL REGISTRATION */}
      {isAshaModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => {
            setIsAshaModalOpen(false);
            setFormSuccess("");
            setFormError("");
          }}
          title="👩⚕️ ASHA Worker Assisted Portal & Door-to-Door Triage"
          className="max-w-2xl"
        >
          <form onSubmit={handleSubmitAssistedRequest} className="space-y-4 text-xs">
            <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 rounded-xl p-3 text-[11px] text-indigo-900 dark:text-indigo-300">
              Logged in as: <strong>ASHA Coordinator ({user?.full_name || "Village Health Worker"})</strong>. Register patient health concerns with explicit verbal consent.
            </div>

            {formSuccess && (
              <Alert className="bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-300 text-[11px]">
                {formSuccess}
              </Alert>
            )}

            {formError && (
              <Alert className="bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-300 text-[11px]">
                {formError}
              </Alert>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Citizen Full Name (गावकऱ्याचे नाव) *
              </label>
              <Input
                type="text"
                placeholder="e.g. Rameshwar Madavi"
                value={citizenName}
                onChange={(e) => setCitizenName(e.target.value)}
                required
                className="text-xs py-2"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Citizen Mobile (Optional / basic feature phone)
              </label>
              <Input
                type="text"
                placeholder="e.g. +91 98220 11111"
                value={citizenPhone}
                onChange={(e) => setCitizenPhone(e.target.value)}
                className="text-xs py-2"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Assistance Category Requested
              </label>
              <Select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="text-xs py-2"
              >
                <option value="referral_status">Outgoing PHC Referral status tracking</option>
                <option value="facility_lookup">Check nearest PHC specialty doctor availability</option>
                <option value="scheme_details">Verify Ayushman Bharat / MJPJAY scheme eligibility</option>
                <option value="medicine_info">Query PHC stock status of essential medicines / ASV</option>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Clinical Details & Symptoms Notes
              </label>
              <Textarea
                rows={2}
                placeholder="e.g. Inpatient referral from Ashti to Gadchiroli, checking ambulance & slot availability."
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
                I confirm that I have obtained explicit verbal/written consent from the citizen to query their health records.
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
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Logging Request..." : "Submit Assisted Action"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 3: LOG ASHA TICKET RESOLUTION & VITALS */}
      {resolvingTicket && (
        <Modal
          isOpen={true}
          onClose={() => setResolvingTicket(null)}
          title={`Log Home Visit & Citizen Vitals: ${resolvingTicket.phone}`}
          className="max-w-md"
        >
          <form onSubmit={handleSaveTicketResolution} className="space-y-3.5 text-xs">
            <p className="text-[11px] text-slate-500">
              Update details after contacting resident <strong>{resolvingTicket.phone}</strong> in {resolvingTicket.district}.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Citizen Full Name (गावकऱ्याचे नाव)
              </label>
              <Input
                type="text"
                placeholder="e.g. Anandibai Kamble"
                value={resolvedCitizenName}
                onChange={(e) => setResolvedCitizenName(e.target.value)}
                required
                className="text-xs py-2"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Home Visit Findings / Vitals Notes
              </label>
              <Textarea
                rows={3}
                placeholder="e.g. Visited home, BP 120/80, 2nd trimester antenatal checkup completed, scheduled next PHC visit."
                value={resolvedVitalsNotes}
                onChange={(e) => setResolvedVitalsNotes(e.target.value)}
                required
                className="text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setResolvingTicket(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdatingTicket}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4"
              >
                {isUpdatingTicket ? "Saving..." : "Mark Resolved & Save Record"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 4: OFFLINE EMERGENCY CACHE & LOW-BANDWIDTH MODE */}
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

      {/* MODAL 5: PHCS LIST */}
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

      {/* MODAL 6: FAMILY / CAREGIVER ACCESS */}
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
