"use client";

import React, { useState, useEffect, useRef } from "react";
import { RealtimeVoiceVisualizer } from "./RealtimeVoiceVisualizer";
import { OpenAIRealtimeVoiceClient } from "@/lib/voice/openaiRealtimeClient";
import {
  Mic,
  MicOff,
  PhoneOff,
  Volume2,
  VolumeX,
  Languages,
  Sparkles,
  ShieldAlert,
  PhoneCall,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Square,
  X,
  Stethoscope,
  Building2,
  Siren,
  FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export function RealtimeVoiceModal({
  isOpen,
  onClose,
  initialLanguage = "mr",
  onSyncTranscript,
}) {
  const [voiceClient, setVoiceClient] = useState(null);
  const [state, setState] = useState("IDLE"); // 'IDLE' | 'CONNECTING' | 'LISTENING' | 'THINKING' | 'SPEAKING' | 'ERROR'
  const [language, setLanguage] = useState(initialLanguage);
  const [isMuted, setIsMuted] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [frequencies, setFrequencies] = useState([]);
  const [activeTool, setActiveTool] = useState(null);
  const [emergencyAlert, setEmergencyAlert] = useState(null);
  const [transcripts, setTranscripts] = useState([]);
  const [groundedCards, setGroundedCards] = useState([]);
  const transcriptEndRef = useRef(null);

  const onSyncTranscriptRef = useRef(onSyncTranscript);
  useEffect(() => {
    onSyncTranscriptRef.current = onSyncTranscript;
  }, [onSyncTranscript]);

  // Initialize or start Realtime Voice session when modal opens
  useEffect(() => {
    if (!isOpen) {
      if (voiceClient) {
        voiceClient.stop();
      }
      return;
    }

    const client = new OpenAIRealtimeVoiceClient();
    setVoiceClient(client);
    setEmergencyAlert(null);
    setActiveTool(null);
    setTranscripts([]);

    client.start({
      language,
      onStateChange: (newState) => {
        setState(newState);
      },
      onTranscript: ({ sender, text, textDelta, isFinal }) => {
        if (text) {
          const newEntry = { id: `t-${Date.now()}-${Math.random()}`, sender, text };
          setTranscripts((prev) => [...prev, newEntry]);

          // Safely dispatch transcript sync in next event loop tick
          if (typeof window !== "undefined") {
            setTimeout(() => {
              if (onSyncTranscriptRef.current) {
                onSyncTranscriptRef.current([newEntry]);
              }
            }, 0);
          }
        } else if (textDelta) {
          setTranscripts((prev) => {
            const last = prev[prev.length - 1];
            if (last && last.sender === sender && !last.isFinal) {
              const updated = [...prev];
              updated[updated.length - 1] = {
                ...last,
                text: last.text + textDelta,
              };
              return updated;
            } else {
              return [...prev, { id: `t-${Date.now()}`, sender, text: textDelta, isFinal: false }];
            }
          });
        }
      },
      onAudioLevel: ({ volume, frequencies: freqs }) => {
        setAudioLevel(volume);
        setFrequencies(freqs);
      },
      onToolCall: ({ name, args }) => {
        const toolLabels = {
          mr: {
            search_doctor: "🔍 डॉक्टर डायरेक्टरी शोधत आहे...",
            get_doctor_details: "📋 डॉक्टर नोंदणी व तपशील तपासत आहे...",
            get_doctor_availability: "🟢 ऑन-ड्युटी रोस्टर तपासत आहे...",
            search_hospital: "🏥 प्रमाणित शासकीय रुग्णालये शोधत आहे...",
            get_hospital_details: "🛏️ खाटांची संख्या व योजना तपासत आहे...",
            get_hospital_contact: "📞 रुग्णालय संपर्क क्रमांक शोधत आहे...",
            find_nearby_facilities: "📍 जवळचे २४x७ प्राथमिक आरोग्य केंद्र शोधत आहे...",
            find_nearby_ambulances: "🚑 १०८ रुग्णवाहिका शोधत आहे...",
            get_ambulance_status: "📡 थेट जीपीएस स्थिती तपासत आहे...",
            get_ambulance_eta: "⏱️ पोहोचण्याचा वेळ (ETA) मोजत आहे...",
            contact_ambulance: "🚨 १०८ आपत्कालीन कक्षाशी संपर्क...",
            get_referral_status: "📄 रेफरल ट्रॅकिंग तपासत आहे...",
            get_medicine_availability: "💊 ई-औषधी साठा तपासत आहे...",
            get_patient_health_records: "🔒 आरोग्य नोंदी तपासत आहे...",
            get_government_scheme_information: "🏛️ महात्मा फुले / PM-JAY योजना माहिती...",
            emergency_108: "⚠️ १०८ आपत्कालीन ट्राइएज सक्रिय...",
            navigate_to_page: "🧭 जीवनसेतू पेजवर नेत आहे...",
            get_health_awareness_topic: "📚 आरोग्य माहिती मार्गदर्शक...",
            request_asha_support: "👩‍⚕️ आशा स्वयंसेविका भेट नोंदवत आहे...",
            book_ambulance: "🚑 १०८ रुग्णवाहिका बुक करत आहे...",
          },
          hi: {
            search_doctor: "🔍 डॉक्टर डायरेक्टरी खोजी जा रही है...",
            get_doctor_details: "📋 डॉक्टर विवरण जांचे जा रहे हैं...",
            get_doctor_availability: "🟢 ऑन-ड्यूटी रोस्टर देखा जा रहा है...",
            search_hospital: "🏥 सत्यापित अस्पताल खोजे जा रहे हैं...",
            get_hospital_details: "🛏️ बेड एवं योजना विवरण जांचे जा रहे हैं...",
            get_hospital_contact: "📞 संपर्क नंबर प्राप्त किया जा रहा है...",
            find_nearby_facilities: "📍 नजदीकी 24x7 स्वास्थ्य केंद्र खोजे जा रहे हैं...",
            find_nearby_ambulances: "🚑 108 एम्बुलेंस खोजी जा रही है...",
            get_ambulance_status: "📡 लाइव जीपीएस स्थिति जांची जा रही है...",
            get_ambulance_eta: "⏱️ आगमन समय (ETA) निकाला जा रहा है...",
            contact_ambulance: "🚨 108 नियंत्रण कक्ष से संपर्क...",
            get_referral_status: "📄 रेफरल रिकॉर्ड देखा जा रहा है...",
            get_medicine_availability: "💊 ई-औषधि स्टॉक जांचा जा रहा है...",
            get_patient_health_records: "🔒 स्वास्थ्य रिकॉर्ड प्राप्त किए जा रहे हैं...",
            get_government_scheme_information: "🏛️ आयुष्मान भारत / MJPJAY योजना...",
            emergency_108: "⚠️ 108 आपातकालीन सेवा सक्रिय...",
            navigate_to_page: "🧭 पेज पर जाया जा रहा है...",
            get_health_awareness_topic: "📚 स्वास्थ्य जागरूकता गाइड...",
            request_asha_support: "👩‍⚕️ आशा कार्यकर्ता विजिट दर्ज की जा रही है...",
            book_ambulance: "🚑 108 एम्बुलेंस बुक की जा रही है...",
          },
          en: {
            search_doctor: "🔍 Searching Doctor Directory...",
            get_doctor_details: "📋 Fetching Medical Council Details...",
            get_doctor_availability: "🟢 Verifying Live On-Duty Roster...",
            search_hospital: "🏥 Searching Verified Hospitals...",
            get_hospital_details: "🛏️ Checking Bed Capacity & Schemes...",
            get_hospital_contact: "📞 Retrieving Hospital Contacts...",
            find_nearby_facilities: "📍 Locating Nearest 24x7 PHCs...",
            find_nearby_ambulances: "🚑 Searching 108 Ambulances...",
            get_ambulance_status: "📡 Querying Live Telematics...",
            get_ambulance_eta: "⏱️ Calculating Arrival ETA...",
            contact_ambulance: "🚨 Connecting 108 Control Hub...",
            get_referral_status: "📄 Fetching Referral Record...",
            get_medicine_availability: "💊 Querying e-Aushadhi Stock...",
            get_patient_health_records: "🔒 Fetching Health Summary...",
            get_government_scheme_information: "🏛️ Retrieving Scheme Guidelines...",
            emergency_108: "⚠️ Activating 108 Emergency...",
            navigate_to_page: "🧭 Navigating Page...",
            get_health_awareness_topic: "📚 Loading Health Guide...",
            request_asha_support: "👩‍⚕️ Queueing ASHA Visit...",
            book_ambulance: "🚑 Initiating 108 Booking...",
          },
        };

        const currentDict = toolLabels[language] || toolLabels.mr;
        setActiveTool(currentDict[name] || `Checking ${name}...`);
        setTimeout(() => setActiveTool(null), 3000);
      },
      onEmergency: (alertData) => {
        setEmergencyAlert(alertData);
      },
      onError: (err) => {
        console.warn("Realtime voice error:", err);
      },
    });

    return () => {
      client.stop();
    };
  }, [isOpen, language]);

  // Scroll transcripts to bottom
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcripts]);

  if (!isOpen) return null;

  const handleInterrupt = () => {
    if (voiceClient) {
      voiceClient.interrupt();
    }
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (voiceClient) {
      voiceClient.setMuted(nextMuted);
    }
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    if (voiceClient) {
      voiceClient.stop();
    }
  };

  const handleClose = () => {
    if (voiceClient) {
      voiceClient.stop();
    }
    if (onClose) onClose();
  };

  const stateBadgesByLang = {
    mr: {
      IDLE: { label: "सज्ज", bg: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300" },
      CONNECTING: { label: "जोडणी करत आहे...", bg: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 animate-pulse" },
      LISTENING: { label: "ऐकत आहे (आता बोला)", bg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300" },
      THINKING: { label: "माहिती शोधत आहे...", bg: "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 animate-pulse" },
      SPEAKING: { label: "असिस्टंट बोलत आहे...", bg: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300" },
      ERROR: { label: "जोडणी त्रुटी", bg: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300" },
      DISCONNECTED: { label: "कॉल समाप्त", bg: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400" },
    },
    hi: {
      IDLE: { label: "तैयार", bg: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300" },
      CONNECTING: { label: "कनेक्ट हो रहा है...", bg: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 animate-pulse" },
      LISTENING: { label: "सुन रहा हूँ (बोलिए)", bg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300" },
      THINKING: { label: "जानकारी खोजी जा रही है...", bg: "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 animate-pulse" },
      SPEAKING: { label: "असिस्टेंट बोल रहा है...", bg: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300" },
      ERROR: { label: "कनेक्शन त्रुटि", bg: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300" },
      DISCONNECTED: { label: "कॉल समाप्त", bg: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400" },
    },
    en: {
      IDLE: { label: "Idle", bg: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300" },
      CONNECTING: { label: "Connecting...", bg: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 animate-pulse" },
      LISTENING: { label: "Listening (Speak Now)", bg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300" },
      THINKING: { label: "Thinking & Grounding...", bg: "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 animate-pulse" },
      SPEAKING: { label: "AI Speaking...", bg: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300" },
      ERROR: { label: "Connection Error", bg: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300" },
      DISCONNECTED: { label: "Disconnected", bg: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400" },
    },
  };

  const currentDict = stateBadgesByLang[language] || stateBadgesByLang.mr;
  const currentBadge = currentDict[state] || currentDict.IDLE;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="realtime-voice-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/70 dark:bg-neutral-900/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-teal-600 dark:bg-teal-500 text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 id="realtime-voice-title" className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                JeevanSetu Realtime Voice AI
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 font-semibold uppercase tracking-wider">
                  OpenAI Realtime
                </span>
              </h2>
              <p className="text-xs text-neutral-700 dark:text-neutral-300 font-medium">
                Low-latency spoken health consultation in Marathi, Hindi & English
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-full text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Close voice call"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Emergency Alert Banner */}
        {emergencyAlert && (
          <div className="bg-rose-600 text-white px-4 py-3 flex items-center justify-between shadow-inner animate-pulse">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <ShieldAlert className="w-5 h-5 flex-shrink-0" />
              <span>
                आपातकालीन सूचना / Emergency Alert: लक्षणे गंभीर असू शकतात. त्वरित १०८ डायल करा!
              </span>
            </div>
            <a
              href="tel:108"
              className="px-3 py-1 bg-white text-rose-700 rounded-full font-bold text-xs flex items-center gap-1 shadow hover:bg-rose-50"
            >
              <PhoneCall className="w-3.5 h-3.5" /> Call 108
            </a>
          </div>
        )}

        {/* Main Interactive Stage */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center justify-between gap-4 min-h-[380px]">
          {/* Status & Tool Feedback Pill */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className={`px-3.5 py-1 rounded-full text-xs font-bold shadow-sm transition-all ${currentBadge.bg}`}>
              {currentBadge.label}
            </span>

            {activeTool && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 dark:bg-teal-950/80 dark:text-teal-200 border border-teal-200 dark:border-teal-800 flex items-center gap-1.5 animate-pulse">
                {activeTool}
              </span>
            )}
          </div>

          {/* Central Pulsating Orb & Waveform Visualizer */}
          <div className="relative py-2">
            <RealtimeVoiceVisualizer
              state={state}
              audioLevel={audioLevel}
              frequencies={frequencies}
            />
            {state === "SPEAKING" && (
              <button
                onClick={handleInterrupt}
                className="absolute bottom-1 left-1/2 -translate-x-1/2 px-3 py-1 bg-neutral-900/90 text-white dark:bg-white dark:text-neutral-900 rounded-full text-xs font-semibold shadow-lg hover:scale-105 transition-all flex items-center gap-1"
              >
                <Square className="w-3 h-3 fill-current" /> Tap to Interrupt
              </button>
            )}
          </div>

          {/* Live Live Transcript Stream */}
          <div className="w-full max-h-48 overflow-y-auto bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-3.5 space-y-2 text-sm shadow-inner">
            {transcripts.length === 0 ? (
              <p className="text-center text-xs text-neutral-600 dark:text-neutral-400 py-3 italic">
                {language === "mr"
                  ? "माईक चालू आहे. आपण मराठीत विचारू शकता (उदा. 'डॉ. जस्पाल अरनेजा उपलब्ध आहेत का?', '१०८ रुग्णवाहिका बोलवा')."
                  : language === "hi"
                  ? "माइक चालू है। आप हिंदी में बोल सकते हैं (उदा. 'नागपुर में हृदय रोग विशेषज्ञ खोजें', '108 एम्बुलेंस की स्थिति')."
                  : "Microphone is live. Speak naturally in English, Hindi, or Marathi."}
              </p>
            ) : (
              transcripts.map((t) => (
                <div
                  key={t.id}
                  className={`flex flex-col ${
                    t.sender === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs sm:text-sm font-medium leading-relaxed ${
                      t.sender === "user"
                        ? "bg-teal-600 text-white rounded-br-none shadow-sm"
                        : "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700/60 rounded-bl-none shadow-sm"
                    }`}
                  >
                    {t.text}
                  </div>
                </div>
              ))
            )}
            <div ref={transcriptEndRef} />
          </div>

          {/* Language Quick Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-full border border-neutral-200 dark:border-neutral-700">
            <button
              onClick={() => handleLanguageChange("mr")}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                language === "mr"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-neutral-700 dark:text-neutral-300 hover:text-teal-600"
              }`}
            >
              मराठी (Marathi)
            </button>
            <button
              onClick={() => handleLanguageChange("hi")}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                language === "hi"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-neutral-700 dark:text-neutral-300 hover:text-teal-600"
              }`}
            >
              हिन्दी (Hindi)
            </button>
            <button
              onClick={() => handleLanguageChange("en")}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                language === "en"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-neutral-700 dark:text-neutral-300 hover:text-teal-600"
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Footer Action Bar */}
        <div className="px-5 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleMute}
              className={`p-3 rounded-full border transition-all ${
                isMuted
                  ? "bg-rose-100 border-rose-300 text-rose-700 dark:bg-rose-950 dark:border-rose-800 dark:text-rose-300"
                  : "bg-white border-neutral-300 text-neutral-800 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700"
              }`}
              aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              {isMuted ? "Mic Muted" : "Mic Live"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="tel:108"
              className="px-4 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
            >
              <Siren className="w-4 h-4" /> 108 Emergency
            </a>

            <button
              onClick={handleClose}
              className="px-5 py-2.5 rounded-full bg-neutral-900 hover:bg-black text-white dark:bg-neutral-100 dark:hover:bg-white dark:text-neutral-900 text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
            >
              <PhoneOff className="w-4 h-4" /> End Call
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RealtimeVoiceModal;
