"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { Tabs } from "@/components/ui/Tabs";
import { aiApi } from "@/lib/api";
import { getClientAiFallbackResponse } from "@/lib/services/clientAiFallback";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import speechRecognitionService from "@/lib/voice/speechRecognition";
import textToSpeechService from "@/lib/voice/textToSpeech";
import {
  Sparkles,
  Send,
  Building2,
  Shield,
  HeartHandshake,
  Bot,
  User,
  ShieldAlert,
  ArrowRight,
  Info,
  PhoneCall,
  FileText,
  BookOpen,
  Globe,
  AlertTriangle,
  RefreshCw,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Square,
  RotateCcw,
  Activity,
  CheckCircle2,
  ExternalLink,
  Siren,
} from "lucide-react";
import { OneOnOneVoiceCallScreen } from "@/components/domain/OneOnOneVoiceCallScreen";
import { RealtimeVoiceModal } from "@/components/ai/RealtimeVoiceModal";
import { AuthGuard } from "@/components/shared/AuthGuard";

export function AssistantPage() {
  const { user } = useAuth();
  const { language: globalLang, setLanguage: setGlobalLang, t } = useLanguage();
  const [activeAssistantTab, setActiveAssistantTab] = useState("chat");
  const [isLiveVoiceOpen, setIsLiveVoiceOpen] = useState(false);
  const [language, setLanguage] = useState(globalLang || "mr");

  // Keep local voice language in sync with global language
  useEffect(() => {
    if (globalLang) {
      setLanguage(globalLang);
    }
  }, [globalLang]);

  // Voice Assistant States: 'IDLE' | 'LISTENING' | 'TRANSCRIBING' | 'THINKING' | 'SPEAKING' | 'ERROR'
  const [voiceState, setVoiceState] = useState("IDLE");
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceError, setVoiceError] = useState("");
  const [autoSpeakVoiceReplies, setAutoSpeakVoiceReplies] = useState(true);
  const [isSttSupported, setIsSttSupported] = useState(true);
  const [isTtsSupported, setIsTtsSupported] = useState(true);
  const [currentlySpeakingMsgId, setCurrentlySpeakingMsgId] = useState(null);

  const [messages, setMessages] = useState([
    {
      id: "msg-1",
      sender: "assistant",
      text: "नमस्कार! मी आपला जीवनसेतू शासकीय आरोग्य सहाय्यक आहे. मी आपल्याला महाराष्ट्रातील प्रमाणित सरकारी रुग्णालये, प्राथमिक आरोग्य केंद्र (PHC), महात्मा फुले व आयुष्मान भारत योजना (PM-JAY), औषध साठा आणि रेफरलची माहिती देऊ शकतो. आपण खालील माईक दाबून बोलू शकता.",
      groundedCards: null,
      disclaimer: "जीवनसेतू AI केवळ माहिती व मार्गदर्शन प्रदान करतो, हा डॉक्टरांच्या तपासणीचा पर्याय नाही. गंभीर आपत्कालीन स्थितीत त्वरित १०८ डायल करा.",
    },
  ]);

  const [inputQuery, setInputQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const messagesEndRef = useRef(null);

  // Initialize browser speech support on mount
  useEffect(() => {
    setIsSttSupported(speechRecognitionService.isSupported());
    setIsTtsSupported(textToSpeechService.isSupported());

    return () => {
      speechRecognitionService.stop();
      textToSpeechService.stop();
    };
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, voiceState]);

  const assistantTabs = [
    { id: "chat", label: "AI Healthcare & Voice Assistant" },
    { id: "doc_explain", label: "Medical Terms Helper" },
  ];

  const suggestedQueries = [
    {
      text: "माझ्या जवळचे प्राथमिक आरोग्य केंद्र (PHC) कुठे आहे?",
      lang: "mr",
      label: "जवळचे प्राथमिक आरोग्य केंद्र (मराठी)",
    },
    {
      text: "महात्मा फुले व आयुष्मान भारत योजनेसाठी कोणती कागदपत्रे लागतात?",
      lang: "mr",
      label: "मोफत शासकीय योजना (PM-JAY)",
    },
    {
      text: "नजदीकी सरकारी अस्पताल में डॉक्टर कब उपलब्ध हैं?",
      lang: "hi",
      label: "डॉक्टर उपलब्धता (हिन्दी)",
    },
    {
      text: "Is Anti-Snake Venom (ASV) available at the nearest PHC?",
      lang: "en",
      label: "Check Snakebite ASV Stock",
    },
    {
      text: "How do I track my hospital referral timeline?",
      lang: "en",
      label: "Track Referral Timeline",
    },
  ];

  // Send message flow (Handles both text and voice submissions)
  const handleSendMessage = async (textToSend = inputQuery, isVoiceTriggered = false) => {
    const text = textToSend?.trim();
    if (!text) return;

    // Strictly honor user's chosen language (Default: 'mr' Marathi)
    const detectedLang = language && ["en", "hi", "mr"].includes(language) ? language : "mr";

    const getLocalizedDisclaimer = (safetyLvl, langCode) => {
      if (safetyLvl === "emergency") {
        if (langCode === "mr") return "तातडीची सूचना: वैद्यकीय आणीबाणी! कृपया त्वरित १०८ वर कॉल करा.";
        if (langCode === "hi") return "आपातकालीन सूचना: तुरंत 108 पर कॉल करें या नजदीकी अस्पताल जाएं।";
        return "CRITICAL: Immediate medical emergency detected. Please dial 108 immediately.";
      }
      if (langCode === "mr") return "जीवनसेतू AI केवळ माहिती व मार्गदर्शन प्रदान करतो, हा डॉक्टरांच्या तपासणीचा पर्याय नाही. गंभीर आपत्कालीन स्थितीत त्वरित १०८ डायल करा.";
      if (langCode === "hi") return "जीवनसेतु AI केवल सूचना एवं मार्गदर्शन प्रदान करता है, यह डॉक्टर के परामर्श का विकल्प नहीं है। आपातकाल में तुरंत 108 डायल करें।";
      return "JeevanSetu AI provides verified healthcare navigation only. It is not a substitute for clinical diagnosis. In emergencies, dial 108 immediately.";
    };

    const userMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery("");
    setErrorMessage("");
    setIsTyping(true);

    if (isVoiceTriggered) {
      setVoiceState("THINKING");
    }

    try {
      const response = await aiApi.chat({
        message: text,
        query: text,
        language: detectedLang,
        district: user?.district || "Maharashtra",
        user_role: user?.role || "patient",
        conversationHistory: messages.slice(-4).map((m) => ({
          role: m.sender === "user" ? "user" : "assistant",
          content: m.text,
        })),
      });

      const responseData = response?.data || response;
      const answerText =
        responseData?.answer ||
        responseData?.response ||
        responseData?.message ||
        (detectedLang === "mr" ? "माहिती उपलब्ध आहे. प्राथमिक आरोग्य केंद्राशी संपर्क साधा." : detectedLang === "hi" ? "जानकारी उपलब्ध है। प्राथमिक स्वास्थ्य केंद्र से संपर्क करें।" : "Information retrieved. Please consult your local health centre.");

      const botResponse = {
        id: `bot-${Date.now()}`,
        sender: "assistant",
        text: answerText,
        groundedCards: responseData?.grounded_cards || responseData?.groundedCards || null,
        safetyLevel: responseData?.safety_level || "safe",
        sources: responseData?.sources || [detectedLang === "mr" ? "जीवनसेतू महाराष्ट्र आरोग्य डिरेक्टरी" : detectedLang === "hi" ? "जीवनसेतु स्वास्थ्य डायरेक्टरी" : "JeevanSetu Verified Directory"],
        disclaimer: getLocalizedDisclaimer(responseData?.safety_level, detectedLang),
      };

      setMessages((prev) => [...prev, botResponse]);

      // If triggered by voice and TTS enabled, read aloud
      if (isVoiceTriggered && autoSpeakVoiceReplies && isTtsSupported) {
        setVoiceState("SPEAKING");
        setCurrentlySpeakingMsgId(botResponse.id);

        textToSpeechService.speak(answerText, {
          language: detectedLang,
          onStart: () => {
            setVoiceState("SPEAKING");
            setCurrentlySpeakingMsgId(botResponse.id);
          },
          onEnd: () => {
            setVoiceState("IDLE");
            setCurrentlySpeakingMsgId(null);
          },
          onError: (err) => {
            console.warn("TTS Playback Note:", err);
            setVoiceState("IDLE");
            setCurrentlySpeakingMsgId(null);
          },
        });
      } else {
        setVoiceState("IDLE");
      }
    } catch (err) {
      console.warn("AI Chat network fallback engaged:", err.message);

      // Generate instant grounded healthcare guidance in exact chosen language
      const fallbackData = getClientAiFallbackResponse(text, detectedLang);
      const fallbackAnswer = fallbackData.answer;

      const fallbackBotResponse = {
        id: `bot-fb-${Date.now()}`,
        sender: "assistant",
        text: fallbackAnswer,
        groundedCards: fallbackData.groundedCards || [],
        safetyLevel: fallbackData.safetyLevel || "safe",
        sources: fallbackData.sources || [detectedLang === "mr" ? "जीवनसेतू आरोग्य नियमावली" : detectedLang === "hi" ? "जीवनसेतु स्वास्थ्य नियमावली" : "JeevanSetu Verified Protocols"],
        disclaimer: getLocalizedDisclaimer(fallbackData.safetyLevel, detectedLang),
      };

      setMessages((prev) => [...prev, fallbackBotResponse]);

      if (isVoiceTriggered && autoSpeakVoiceReplies && isTtsSupported) {
        setVoiceState("SPEAKING");
        setCurrentlySpeakingMsgId(fallbackBotResponse.id);

        textToSpeechService.speak(fallbackAnswer, {
          language: detectedLang,
          onStart: () => {
            setVoiceState("SPEAKING");
            setCurrentlySpeakingMsgId(fallbackBotResponse.id);
          },
          onEnd: () => {
            setVoiceState("IDLE");
            setCurrentlySpeakingMsgId(null);
          },
          onError: () => {
            setVoiceState("IDLE");
            setCurrentlySpeakingMsgId(null);
          },
        });
      } else {
        setVoiceState("IDLE");
      }
    } finally {
      setIsTyping(false);
    }
  };

  // Voice Interaction Handlers
  const handleStartListening = () => {
    if (!isSttSupported) {
      setVoiceError("Microphone speech recognition is not supported in this browser. Please type your query.");
      return;
    }

    textToSpeechService.stop();
    setCurrentlySpeakingMsgId(null);

    setVoiceError("");
    setVoiceTranscript("");
    setVoiceState("LISTENING");

    speechRecognitionService.start({
      language,
      onStart: () => {
        setVoiceState("LISTENING");
      },
      onResult: ({ transcript, isFinal }) => {
        setVoiceTranscript(transcript);
        setVoiceState(isFinal ? "TRANSCRIBING" : "LISTENING");

        if (isFinal && transcript.trim()) {
          handleSendMessage(transcript, true);
        }
      },
      onError: (errMsg) => {
        setVoiceError(errMsg);
        setVoiceState("ERROR");
      },
      onEnd: () => {
        setVoiceState((prev) => (prev === "LISTENING" || prev === "TRANSCRIBING" ? "IDLE" : prev));
      },
    });
  };

  const handleStopListening = () => {
    speechRecognitionService.stop();
    setVoiceState("IDLE");
  };

  const handleStopSpeaking = () => {
    textToSpeechService.stop();
    setCurrentlySpeakingMsgId(null);
    setVoiceState("IDLE");
  };

  const handleReadAloud = (msg) => {
    if (!isTtsSupported) return;

    if (currentlySpeakingMsgId === msg.id) {
      handleStopSpeaking();
      return;
    }

    handleStopSpeaking();
    setCurrentlySpeakingMsgId(msg.id);

    textToSpeechService.speak(msg.text, {
      language,
      onStart: () => setCurrentlySpeakingMsgId(msg.id),
      onEnd: () => setCurrentlySpeakingMsgId(null),
      onError: () => setCurrentlySpeakingMsgId(null),
    });
  };

  const handleSelectLanguage = (langCode) => {
    setLanguage(langCode);
    setGlobalLang(langCode);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070a13] text-slate-900 dark:text-slate-100 transition-colors duration-300 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[400px] bg-teal-500/10 dark:bg-teal-500/5 blur-[140px] rounded-full pointer-events-none -z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[400px] bg-indigo-500/10 dark:bg-indigo-500/5 blur-[140px] rounded-full pointer-events-none -z-0" />

      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5 flex flex-col relative z-10">
        <AuthGuard featureName="आरोग्य सहाय्यक (AI & Voice Assistant)">
          {/* Header Banner */}
          <div className="bg-white dark:bg-slate-900/70 backdrop-blur-2xl p-5 sm:p-6 rounded-3xl border border-slate-200/90 dark:border-white/10 shadow-lg shadow-slate-200/50 dark:shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
            <div className="space-y-1.5 text-left">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20 backdrop-blur-md flex items-center gap-1.5 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600 dark:bg-teal-400 animate-pulse" />
                  <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>JeevanSetu Multilingual AI</span>
                </span>
                <Badge variant="success" size="sm">Registry-Grounded</Badge>
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
                <Bot className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                JeevanSetu AI Health & Voice Assistant
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl">
                Type or speak in <strong className="text-slate-900 dark:text-slate-200">मराठी, हिन्दी, or English</strong> for verified hospital matching, PHC medicines, PM-JAY schemes, and referral status.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              {/* Language Switcher */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950/80 backdrop-blur-md p-1 rounded-2xl border border-slate-200 dark:border-white/10 text-xs">
                <Globe className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 ml-1.5" />
                <button
                  type="button"
                  onClick={() => handleSelectLanguage("mr")}
                  className={`px-2.5 py-1 rounded-xl font-bold transition-all ${
                    language === "mr"
                      ? "bg-teal-500/20 text-teal-800 dark:text-teal-300 border border-teal-500/30 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  मराठी
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectLanguage("hi")}
                  className={`px-2.5 py-1 rounded-xl font-bold transition-all ${
                    language === "hi"
                      ? "bg-teal-500/20 text-teal-800 dark:text-teal-300 border border-teal-500/30 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  हिंदी
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectLanguage("en")}
                  className={`px-2.5 py-1 rounded-xl font-bold transition-all ${
                    language === "en"
                      ? "bg-teal-500/20 text-teal-800 dark:text-teal-300 border border-teal-500/30 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  English
                </button>
              </div>

              {/* Direct Toll-Free Call Action */}
              <Button
                onClick={() => setIsLiveVoiceOpen(true)}
                className="bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-500 hover:to-indigo-500 text-white font-black text-xs gap-1.5 rounded-2xl shadow-lg shadow-teal-500/20 border border-teal-400/30 min-h-[40px]"
              >
                <PhoneCall className="w-3.5 h-3.5 animate-bounce" />
                <span>📞 Voice Call (मराठी)</span>
              </Button>

              <a
                href="tel:108"
                className="inline-flex items-center gap-1.5 text-xs font-black text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 px-3.5 py-2 rounded-2xl border border-rose-200 dark:border-rose-500/20 transition-all min-h-[40px] backdrop-blur-md shadow-xs shadow-rose-500/10"
              >
                <Siren className="w-4 h-4 text-rose-500 dark:text-rose-400 animate-pulse" />
                <span>108 Emergency</span>
              </a>
            </div>
          </div>

          {/* Safety Disclaimer Banner */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 backdrop-blur-md border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2.5 text-left">
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px] text-amber-900 dark:text-amber-200/90">
              <strong className="text-amber-800 dark:text-amber-300">{t("aiSafetyBadge", "Verified Health Information Assistant • Non-Diagnostic Public Health Platform")}</strong>:{" "}
              {t("aiSafetyWarning", "JeevanSetu AI provides health information and assistance. It does not replace a doctor. In critical emergencies, dial 108 immediately.")}
            </p>
          </div>

          {errorMessage && (
            <Alert variant="danger" title="Assistant Notice">
              {errorMessage}
            </Alert>
          )}

          {/* =========================================================================
              STATEFUL AUDIO WAVEFORM & VOICE VISUALIZER ORB
              ========================================================================= */}
          {(voiceState !== "IDLE" || voiceError) && (
            <div className="p-5 rounded-3xl border transition-all animate-in fade-in duration-200 bg-teal-900 dark:bg-gradient-to-r dark:from-slate-900/90 dark:via-teal-950/80 dark:to-slate-900/90 backdrop-blur-2xl text-white shadow-2xl border-teal-500/30 text-left">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  {/* Waveform / Orb icon */}
                  {voiceState === "LISTENING" && (
                    <div className="flex items-center gap-1 h-10 px-3 rounded-2xl bg-rose-500/20 border border-rose-500/40">
                      <span className="w-1.5 bg-rose-400 rounded-full animate-audio-wave-1" />
                      <span className="w-1.5 bg-rose-400 rounded-full animate-audio-wave-2" />
                      <span className="w-1.5 bg-rose-400 rounded-full animate-audio-wave-3" />
                      <span className="w-1.5 bg-rose-400 rounded-full animate-audio-wave-4" />
                      <span className="w-1.5 bg-rose-400 rounded-full animate-audio-wave-5" />
                    </div>
                  )}

                  {voiceState === "TRANSCRIBING" && (
                    <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center animate-spin border border-teal-400/30">
                      <RefreshCw className="w-5 h-5" />
                    </div>
                  )}

                  {voiceState === "THINKING" && (
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center animate-pulse border border-amber-400/30">
                      <Bot className="w-5 h-5" />
                    </div>
                  )}

                  {voiceState === "SPEAKING" && (
                    <div className="flex items-center gap-1 h-10 px-3 rounded-2xl bg-teal-500/20 border border-teal-400/40">
                      <span className="w-1.5 bg-teal-400 rounded-full animate-audio-wave-1" />
                      <span className="w-1.5 bg-teal-400 rounded-full animate-audio-wave-2" />
                      <span className="w-1.5 bg-teal-400 rounded-full animate-audio-wave-3" />
                      <span className="w-1.5 bg-teal-400 rounded-full animate-audio-wave-4" />
                      <span className="w-1.5 bg-teal-400 rounded-full animate-audio-wave-5" />
                    </div>
                  )}

                  {voiceState === "ERROR" && (
                    <div className="w-10 h-10 rounded-2xl bg-rose-600/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                  )}

                  <div className="space-y-0.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-teal-300">
                      {voiceState === "LISTENING" && `Listening... (${language === "mr" ? "मराठी" : language === "hi" ? "हिन्दी" : "English"})`}
                      {voiceState === "TRANSCRIBING" && "Transcribing voice input..."}
                      {voiceState === "THINKING" && t("voiceVisualizerThinking", "Analyzing verified healthcare guidelines...")}
                      {voiceState === "SPEAKING" && t("voiceVisualizerSpeaking", "Speaking verified guidance...")}
                      {voiceState === "ERROR" && "Voice Assistance Notice"}
                    </span>
                    <p className="text-xs font-medium text-slate-100 line-clamp-2">
                      {voiceTranscript ? `"${voiceTranscript}"` : voiceError || (language === "mr" ? "तुमचा प्रश्न माईकवर बोला..." : "Speak your question into microphone...")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {voiceState === "LISTENING" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleStopListening}
                      className="text-xs text-white border-white/20 hover:bg-white/10 backdrop-blur-md rounded-xl"
                    >
                      <Square className="w-3.5 h-3.5 mr-1" />
                      <span>Cancel</span>
                    </Button>
                  )}

                  {voiceState === "SPEAKING" && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={handleStopSpeaking}
                      className="text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl"
                    >
                      <Square className="w-3.5 h-3.5 mr-1" />
                      <span>Stop Speaking</span>
                    </Button>
                  )}

                  {voiceState === "ERROR" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setVoiceState("IDLE")}
                      className="text-xs text-white border-white/20 backdrop-blur-md rounded-xl"
                    >
                      <span>Type Instead</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Main Chat Container */}
          <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-2xl rounded-3xl border border-slate-200/90 dark:border-white/10 shadow-xl dark:shadow-2xl flex flex-col h-[560px] overflow-hidden transition-colors">
            {/* Messages Scroll Area */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 text-left">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.sender === "assistant" && (
                    <div className="w-8 h-8 rounded-2xl bg-teal-500/20 border border-teal-500/30 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-4 text-xs leading-relaxed space-y-2.5 ${
                      msg.sender === "user"
                        ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-medium rounded-br-xs shadow-md"
                        : "bg-slate-100 dark:bg-slate-800/80 backdrop-blur-md text-slate-800 dark:text-slate-100 rounded-bl-xs border border-slate-200 dark:border-white/10 shadow-sm"
                    }`}
                  >
                    <p className="whitespace-pre-line text-[13px]">{msg.text}</p>

                    {/* Read Aloud Button for Bot */}
                    {msg.sender === "assistant" && isTtsSupported && (
                      <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleReadAloud(msg)}
                          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-teal-700 dark:text-teal-300 hover:text-teal-600 dark:hover:text-teal-200 cursor-pointer transition-colors"
                        >
                          {currentlySpeakingMsgId === msg.id ? (
                            <>
                              <VolumeX className="w-3.5 h-3.5 text-rose-500" />
                              <span>Stop Audio (थांबवा)</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                              <span>Listen Aloud (आवाज ऐका)</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {msg.sender === "user" && (
                    <div className="w-8 h-8 rounded-2xl bg-slate-200 dark:bg-slate-800 text-teal-700 dark:text-teal-400 border border-slate-300 dark:border-white/10 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2.5 text-xs text-teal-800 dark:text-teal-300 bg-teal-500/10 border border-teal-500/20 p-3.5 rounded-2xl max-w-sm backdrop-blur-md">
                  <Bot className="w-4 h-4 text-teal-600 dark:text-teal-400 animate-spin" />
                  <span>JeevanSetu AI is analyzing verified healthcare guidelines...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Query Chips */}
            <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950/80 backdrop-blur-md border-t border-slate-200 dark:border-white/10 overflow-x-auto flex gap-2 no-scrollbar">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider shrink-0 self-center">
                Quick Questions:
              </span>
              {suggestedQueries.map((sq, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendMessage(sq.text)}
                  className="px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-900/80 text-[11px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-teal-500 hover:text-teal-700 dark:hover:text-teal-300 whitespace-nowrap shrink-0 transition-all shadow-xs backdrop-blur-md"
                >
                  {sq.label}
                </button>
              ))}
            </div>

            {/* Input Bar with Prominent Microphone */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 sm:p-4 bg-white dark:bg-slate-950/90 backdrop-blur-2xl border-t border-slate-200 dark:border-white/10 flex items-center gap-2.5"
            >
              {/* Prominent Voice Microphone Button — Launches OpenAI Realtime Voice AI */}
              <button
                type="button"
                onClick={() => setIsLiveVoiceOpen(true)}
                className="p-3 rounded-2xl flex items-center justify-center transition-all duration-200 shrink-0 min-h-[44px] min-w-[44px] cursor-pointer shadow-md bg-gradient-to-r from-teal-500/15 to-emerald-500/15 hover:from-teal-500/25 hover:to-emerald-500/25 text-teal-700 dark:text-teal-300 border border-teal-500/40 hover:scale-105 active:scale-95"
                title="Open Real-Time Voice AI (मराठी/हिन्दी/English)"
              >
                <Mic className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </button>

              <input
                type="text"
                placeholder={
                  language === "mr"
                    ? "आरोग्य विषयक प्रश्न येथे टाईप करा किंवा माईक दाबा..."
                    : language === "hi"
                    ? "स्वास्थ्य संबंधी प्रश्न यहाँ लिखें या माइक दबाएं..."
                    : "Type health question or tap microphone to speak..."
                }
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/60 min-h-[44px]"
              />

              <Button
                type="submit"
                disabled={!inputQuery.trim() || isTyping}
                className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-xs px-5 rounded-2xl min-h-[44px] shadow-lg shadow-teal-500/20"
              >
                <Send className="w-4 h-4 mr-1.5" />
                <span>Send</span>
              </Button>
            </form>
          </div>
        </AuthGuard>
      </main>

      {isLiveVoiceOpen && (
        <RealtimeVoiceModal
          isOpen={isLiveVoiceOpen}
          onClose={() => setIsLiveVoiceOpen(false)}
          initialLanguage={language}
          onSyncTranscript={(transcriptList) => {
            if (Array.isArray(transcriptList) && transcriptList.length > 0) {
              setMessages((prev) => {
                const existingIds = new Set(prev.map((m) => m.id));
                const newFormatted = transcriptList
                  .filter((t) => !existingIds.has(t.id))
                  .map((t) => ({
                    id: t.id || `sync-${Date.now()}-${Math.random()}`,
                    sender: t.sender,
                    text: t.text,
                    groundedCards: null,
                  }));
                if (newFormatted.length === 0) return prev;
                return [...prev, ...newFormatted];
              });
            }
          }}
        />
      )}

      <Footer />
    </div>
  );
}

export default AssistantPage;
