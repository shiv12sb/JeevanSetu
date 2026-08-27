"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { speechRecognitionService } from "@/lib/voice/speechRecognition";
import { textToSpeechService } from "@/lib/voice/textToSpeech";
import { getClientAiFallbackResponse } from "@/lib/services/clientAiFallback";
import { aiApi } from "@/lib/api";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  PhoneCall,
  Sparkles,
  X,
  RotateCcw,
  Languages,
  Activity,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export function GeminiLiveVoiceModal({ isOpen, onClose, initialLanguage = "mr" }) {
  const { language: contextLang } = useLanguage();
  const [selectedLang, setSelectedLang] = useState(initialLanguage || contextLang || "mr");
  
  // Voice State: 'idle' | 'listening' | 'thinking' | 'speaking' | 'emergency'
  const [voiceState, setVoiceState] = useState("idle");
  const [interimText, setInterimText] = useState("");
  const [lastUserSpeech, setLastUserSpeech] = useState("");
  const [lastAiResponse, setLastAiResponse] = useState("");
  const [transcriptHistory, setTranscriptHistory] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isAutoLoopActive, setIsAutoLoopActive] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const stateRef = useRef({ voiceState, isAutoLoopActive, selectedLang });
  stateRef.current = { voiceState, isAutoLoopActive, selectedLang };

  // Stop everything when modal closes
  useEffect(() => {
    if (!isOpen) {
      stopAll();
    } else {
      // Auto-start listening on open
      startListening();
    }
    return () => {
      stopAll();
    };
  }, [isOpen]);

  const stopAll = () => {
    speechRecognitionService.stop();
    textToSpeechService.stop();
    setVoiceState("idle");
    setInterimText("");
  };

  const startListening = () => {
    textToSpeechService.stop();
    setVoiceState("listening");
    setErrorMessage("");
    setInterimText("");

    const lang = stateRef.current.selectedLang;

    speechRecognitionService.start({
      language: lang,
      onStart: () => {
        setVoiceState("listening");
      },
      onResult: ({ transcript, isFinal }) => {
        setInterimText(transcript);
        if (isFinal && transcript.trim().length > 1) {
          handleFinalUserSpeech(transcript.trim());
        }
      },
      onError: (err, errCode) => {
        if (errCode === "no-speech") {
          // If auto-loop is active, restart listening gently
          if (stateRef.current.isAutoLoopActive && stateRef.current.voiceState === "listening") {
            setTimeout(() => {
              if (stateRef.current.voiceState === "listening") {
                startListening();
              }
            }, 800);
          }
          return;
        }
        setVoiceState("idle");
        setErrorMessage(err || "Microphone error. Please speak clearly.");
      },
      onEnd: () => {
        if (stateRef.current.voiceState === "listening" && !stateRef.current.isMuted) {
          // If ended without final utterance, restart if active
          if (stateRef.current.isAutoLoopActive) {
            setTimeout(() => {
              if (stateRef.current.voiceState === "listening") {
                startListening();
              }
            }, 600);
          }
        }
      },
    });
  };

  const handleFinalUserSpeech = async (userText) => {
    speechRecognitionService.stop();
    setLastUserSpeech(userText);
    setInterimText("");
    setVoiceState("thinking");

    // Add to history
    setTranscriptHistory((prev) => [
      ...prev,
      { sender: "user", text: userText, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
    ]);

    const lang = stateRef.current.selectedLang;

    // Check emergency red flags immediately
    const emergencyWords = ["emergency", "chest pain", "heart attack", "unconscious", "stroke", "छातीत", "श्वास", "बेशुद्ध", "सांस", "हार्ट अटॅक"];
    const isEmergency = emergencyWords.some((w) => userText.toLowerCase().includes(w));

    if (isEmergency) {
      setVoiceState("emergency");
      const emergencyMsg = lang === "mr" 
        ? "आपत्कालीन चेतावणी: 108 रुग्णवाहिकेला त्वरित कॉल करा."
        : lang === "hi"
        ? "आपातकालीन चेतावनी: कृपया तुरंत 108 एम्बुलेंस को कॉल करें।"
        : "Emergency alert: Please immediately dial 108 emergency ambulance.";
      
      setLastAiResponse(emergencyMsg);
      speakAiResponse(emergencyMsg, true);
      return;
    }

    try {
      // Call backend AI or instant fallback
      let aiText = "";
      try {
        const res = await aiApi.chat({
          message: userText,
          language: lang,
          conversation_history: transcriptHistory.slice(-4).map((h) => ({
            role: h.sender === "user" ? "user" : "assistant",
            content: h.text,
          })),
        });
        if (res?.data?.response) {
          aiText = res.data.response;
        } else {
          throw new Error("Fallback required");
        }
      } catch (backendErr) {
        const fallback = getClientAiFallbackResponse(userText, lang);
        aiText = fallback.answer;
      }

      setLastAiResponse(aiText);
      setTranscriptHistory((prev) => [
        ...prev,
        { sender: "ai", text: aiText, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
      ]);

      speakAiResponse(aiText);
    } catch (err) {
      const fallback = getClientAiFallbackResponse(userText, lang);
      setLastAiResponse(fallback.answer);
      speakAiResponse(fallback.answer);
    }
  };

  const speakAiResponse = (text, isCritical = false) => {
    setVoiceState(isCritical ? "emergency" : "speaking");
    const lang = stateRef.current.selectedLang;

    // Clean text for speech (strip markdown headers and bullets)
    const cleanSpeech = text
      .replace(/[*_#`~[\]()]/g, "")
      .replace(/https?:\/\/[^\s]+/g, "")
      .replace(/\n+/g, " ")
      .trim();

    textToSpeechService.speak(cleanSpeech, {
      language: lang,
      rate: lang === "mr" || lang === "hi" ? 0.92 : 0.96,
      onStart: () => {
        setVoiceState(isCritical ? "emergency" : "speaking");
      },
      onEnd: () => {
        if (isCritical) {
          setVoiceState("emergency");
        } else if (stateRef.current.isAutoLoopActive && !stateRef.current.isMuted) {
          // Seamless Gemini Live Conversational Loop: Auto resume listening
          setTimeout(() => {
            startListening();
          }, 500);
        } else {
          setVoiceState("idle");
        }
      },
      onError: () => {
        if (stateRef.current.isAutoLoopActive) {
          setTimeout(() => startListening(), 600);
        } else {
          setVoiceState("idle");
        }
      },
    });
  };

  const handleInterrupt = () => {
    textToSpeechService.stop();
    startListening();
  };

  const handleLanguageChange = (newLang) => {
    setSelectedLang(newLang);
    stopAll();
    setTimeout(() => {
      startListening();
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-linear-to-b from-slate-900 via-slate-900 to-teal-950 rounded-3xl border border-teal-500/30 shadow-2xl overflow-hidden flex flex-col items-center text-white p-6 sm:p-8 space-y-6">
        
        {/* Top Header Controls */}
        <div className="w-full flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${voiceState === "emergency" ? "bg-rose-400" : voiceState === "speaking" ? "bg-emerald-400" : voiceState === "listening" ? "bg-cyan-400" : "bg-teal-400"}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${voiceState === "emergency" ? "bg-rose-500" : voiceState === "speaking" ? "bg-emerald-500" : voiceState === "listening" ? "bg-cyan-500" : "bg-teal-500"}`}></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              JeevanSetu Live Voice AI
            </span>
          </div>

          {/* Language Switch Pills */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-full border border-white/10 text-xs">
            <button
              onClick={() => handleLanguageChange("mr")}
              className={`px-2.5 py-1 rounded-full font-bold transition-all ${
                selectedLang === "mr" ? "bg-teal-500 text-slate-950 shadow-xs" : "text-slate-400 hover:text-white"
              }`}
            >
              मराठी
            </button>
            <button
              onClick={() => handleLanguageChange("hi")}
              className={`px-2.5 py-1 rounded-full font-bold transition-all ${
                selectedLang === "hi" ? "bg-teal-500 text-slate-950 shadow-xs" : "text-slate-400 hover:text-white"
              }`}
            >
              हिन्दी
            </button>
            <button
              onClick={() => handleLanguageChange("en")}
              className={`px-2.5 py-1 rounded-full font-bold transition-all ${
                selectedLang === "en" ? "bg-teal-500 text-slate-950 shadow-xs" : "text-slate-400 hover:text-white"
              }`}
            >
              English
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Gemini Visual Audio Orb */}
        <div className="relative flex items-center justify-center my-4">
          {/* Outer Pulsating Rings */}
          <div
            className={`absolute w-56 h-56 rounded-full transition-all duration-700 blur-2xl opacity-40 ${
              voiceState === "emergency"
                ? "bg-rose-500 animate-ping"
                : voiceState === "listening"
                ? "bg-cyan-500 animate-pulse"
                : voiceState === "thinking"
                ? "bg-purple-600 animate-spin"
                : voiceState === "speaking"
                ? "bg-emerald-500 animate-pulse"
                : "bg-teal-500/30"
            }`}
          />

          <div
            className={`absolute w-44 h-44 rounded-full transition-all duration-500 blur-xl opacity-60 ${
              voiceState === "emergency"
                ? "bg-rose-600 animate-pulse"
                : voiceState === "listening"
                ? "bg-cyan-400 animate-ping"
                : voiceState === "speaking"
                ? "bg-teal-400 animate-pulse"
                : "bg-teal-600/40"
            }`}
          />

          {/* Central Glowing Orb Core */}
          <div
            className={`relative z-10 w-36 h-36 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all duration-500 border-2 ${
              voiceState === "emergency"
                ? "bg-linear-to-tr from-rose-700 via-rose-600 to-amber-500 border-rose-300 scale-105"
                : voiceState === "listening"
                ? "bg-linear-to-tr from-cyan-600 via-teal-500 to-emerald-400 border-cyan-200 scale-110 shadow-cyan-500/50"
                : voiceState === "thinking"
                ? "bg-linear-to-tr from-purple-700 via-indigo-600 to-teal-500 border-purple-300 scale-95"
                : voiceState === "speaking"
                ? "bg-linear-to-tr from-emerald-600 via-teal-500 to-sky-400 border-emerald-200 scale-105 shadow-emerald-500/50"
                : "bg-linear-to-tr from-slate-800 to-teal-900 border-teal-500/40 scale-100"
            }`}
          >
            {/* Animated Sound Wave Bars in Center */}
            <div className="flex items-center gap-1.5 h-10">
              {voiceState === "listening" && (
                <>
                  <span className="w-1.5 h-6 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-10 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-7 bg-white rounded-full animate-bounce [animation-delay:-0.45s]"></span>
                  <span className="w-1.5 h-9 bg-white rounded-full animate-bounce [animation-delay:-0.2s]"></span>
                  <span className="w-1.5 h-5 bg-white rounded-full animate-bounce [animation-delay:-0.35s]"></span>
                </>
              )}

              {voiceState === "thinking" && (
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-purple-200 animate-ping"></span>
                  <span className="w-3 h-3 rounded-full bg-teal-200 animate-ping [animation-delay:0.2s]"></span>
                  <span className="w-3 h-3 rounded-full bg-cyan-200 animate-ping [animation-delay:0.4s]"></span>
                </div>
              )}

              {voiceState === "speaking" && (
                <>
                  <span className="w-1.5 h-8 bg-white rounded-full animate-pulse [animation-duration:0.6s]"></span>
                  <span className="w-1.5 h-12 bg-white rounded-full animate-pulse [animation-duration:0.4s]"></span>
                  <span className="w-1.5 h-9 bg-white rounded-full animate-pulse [animation-duration:0.7s]"></span>
                  <span className="w-1.5 h-11 bg-white rounded-full animate-pulse [animation-duration:0.5s]"></span>
                  <span className="w-1.5 h-6 bg-white rounded-full animate-pulse [animation-duration:0.8s]"></span>
                </>
              )}

              {voiceState === "emergency" && (
                <ShieldAlert className="w-12 h-12 text-white animate-bounce" />
              )}

              {voiceState === "idle" && (
                <Mic className="w-10 h-10 text-teal-300 opacity-75" />
              )}
            </div>

            {/* Status Label Under Orb */}
            <span className="text-[10px] font-black uppercase tracking-wider text-white/90 mt-1">
              {voiceState === "listening"
                ? "Listening..."
                : voiceState === "thinking"
                ? "Analyzing..."
                : voiceState === "speaking"
                ? "Speaking..."
                : voiceState === "emergency"
                ? "Emergency 108"
                : "Tap to Speak"}
            </span>
          </div>
        </div>

        {/* Live Subtitle Transcript Banner */}
        <div className="w-full min-h-[70px] bg-black/30 rounded-2xl p-4 border border-white/10 flex flex-col items-center justify-center text-center space-y-1">
          {voiceState === "listening" && (
            <p className="text-sm font-medium text-cyan-200 italic animate-pulse">
              {interimText ? `"${interimText}"` : selectedLang === "mr" ? "बोला, मी ऐकत आहे... (उदा. 'तापासाठी काय करावे?')" : selectedLang === "hi" ? "बोलिए, मैं सुन रहा हूँ... (उदा. 'बुखार के लिए क्या करें?')" : "Speak now, I'm listening... (e.g. 'Nearest PHC doctor')"}
            </p>
          )}

          {voiceState === "thinking" && (
            <p className="text-sm text-purple-200">
              "{lastUserSpeech}" • <span className="text-xs text-slate-400">JeevanSetu Clinical Engine...</span>
            </p>
          )}

          {(voiceState === "speaking" || voiceState === "emergency") && (
            <div className="space-y-1">
              <span className="text-[11px] text-teal-400 font-semibold block">JeevanSetu AI Response:</span>
              <p className="text-xs sm:text-sm text-slate-100 max-h-24 overflow-y-auto leading-relaxed">
                {lastAiResponse}
              </p>
            </div>
          )}

          {voiceState === "idle" && !errorMessage && (
            <p className="text-xs text-slate-400">
              Real-time hands-free conversation active. Tap the microphone to start speaking.
            </p>
          )}

          {errorMessage && (
            <p className="text-xs text-rose-300 font-medium">{errorMessage}</p>
          )}
        </div>

        {/* Emergency Call Quick Action */}
        {voiceState === "emergency" && (
          <a
            href="tel:108"
            className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg animate-pulse text-sm"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Call 108 Emergency Ambulance Immediately</span>
          </a>
        )}

        {/* Bottom Control Actions */}
        <div className="w-full flex items-center justify-center gap-4 pt-2">
          {voiceState === "speaking" ? (
            <button
              onClick={handleInterrupt}
              className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <VolumeX className="w-4 h-4" />
              <span>Interrupt / Speak Now</span>
            </button>
          ) : voiceState === "listening" ? (
            <button
              onClick={stopAll}
              className="px-5 py-2.5 rounded-full bg-rose-500/80 hover:bg-rose-600 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <MicOff className="w-4 h-4" />
              <span>Pause Listening</span>
            </button>
          ) : (
            <button
              onClick={startListening}
              className="px-6 py-3 rounded-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg cursor-pointer"
            >
              <Mic className="w-4 h-4" />
              <span>Start Speaking ({selectedLang === "mr" ? "मराठी" : selectedLang === "hi" ? "हिन्दी" : "English"})</span>
            </button>
          )}

          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Transcript</span>
            {showHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Expandable Transcript Drawer */}
        {showHistory && (
          <div className="w-full max-h-40 overflow-y-auto bg-black/50 rounded-xl p-3 border border-white/10 space-y-2 text-xs text-left">
            <span className="font-bold text-slate-400 uppercase text-[10px] block">Live Conversation History:</span>
            {transcriptHistory.length === 0 ? (
              <p className="text-slate-500 italic">No turns recorded yet. Speak into the microphone to start.</p>
            ) : (
              transcriptHistory.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-lg ${
                    item.sender === "user"
                      ? "bg-cyan-950/60 text-cyan-200 border border-cyan-800/40 ml-4"
                      : "bg-teal-950/60 text-teal-100 border border-teal-800/40 mr-4"
                  }`}
                >
                  <span className="font-bold text-[10px] block opacity-75">
                    {item.sender === "user" ? "You" : "JeevanSetu AI"} ({item.timestamp})
                  </span>
                  <p className="mt-0.5">{item.text}</p>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default GeminiLiveVoiceModal;
