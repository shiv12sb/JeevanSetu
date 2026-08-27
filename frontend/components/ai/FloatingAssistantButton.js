"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { aiApi } from "@/lib/api";
import { getClientAiFallbackResponse } from "@/lib/services/clientAiFallback";
import speechRecognitionService from "@/lib/voice/speechRecognition";
import textToSpeechService from "@/lib/voice/textToSpeech";
import {
  Sparkles,
  MessageSquare,
  Mic,
  MicOff,
  Send,
  X,
  Volume2,
  VolumeX,
  Bot,
  User,
  PhoneCall,
  Maximize2,
  RotateCcw,
  Square,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { GeminiLiveVoiceModal } from "@/components/domain/GeminiLiveVoiceModal";

export function FloatingAssistantButton() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isLiveVoiceOpen, setIsLiveVoiceOpen] = useState(false);
  const [language, setLanguage] = useState("hi");
  const [inputQuery, setInputQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [voiceState, setVoiceState] = useState("IDLE"); // IDLE, LISTENING, TRANSCRIBING, THINKING, SPEAKING, ERROR
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [speakingMsgId, setSpeakingMsgId] = useState(null);

  const [messages, setMessages] = useState([
    {
      id: "quick-1",
      sender: "assistant",
      text: "नमस्ते! मैं आपका जीवनसेतु AI सहायक हूँ। अस्पताल, योजना या दवाओं की जानकारी के लिए पूछें या बोलें।",
    },
  ]);

  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, isOpen]);

  // Clean up speech synthesis when component unmounts or closes
  useEffect(() => {
    if (!isOpen) {
      speechRecognitionService.stop();
      textToSpeechService.stop();
      setVoiceState("IDLE");
      setSpeakingMsgId(null);
    }
  }, [isOpen]);

  // If already on the dedicated /assistant page, hide the floating button to prevent redundancy
  if (pathname === "/assistant") {
    return null;
  }

  const handleSendMessage = async (textToSend, isVoiceTriggered = false) => {
    const text = (textToSend || inputQuery || "").trim();
    if (!text || isTyping) return;

    textToSpeechService.stop();
    setSpeakingMsgId(null);

    let detectedLang = language;
    if (/[\u0900-\u097F]/.test(text)) {
      detectedLang = /(आहे|नाही|झाले|औषध|रुग्ण|रुग्णालय|करावे|कुठे|कधी|सांगा)/.test(text) ? "mr" : "hi";
      setLanguage(detectedLang);
    }

    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text,
      isVoice: isVoiceTriggered,
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputQuery("");
    setIsTyping(true);
    if (isVoiceTriggered) {
      setVoiceState("THINKING");
    }

    try {
      const turns = newHistory.slice(-3).map((m) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text,
      }));

      const res = await aiApi.chat({
        message: text,
        language: detectedLang,
        conversationHistory: turns,
      });

      const aiData = res?.data || res || {};
      const answer = aiData.answer || "I have retrieved your verified healthcare information.";

      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: "assistant",
        text: answer,
        safetyLevel: aiData.safetyLevel || "safe",
      };

      setMessages((prev) => [...prev, botMsg]);

      if (isVoiceTriggered && textToSpeechService.isSupported()) {
        setVoiceState("SPEAKING");
        setSpeakingMsgId(botMsg.id);

        textToSpeechService.speak(answer, {
          language: detectedLang,
          onStart: () => {
            setVoiceState("SPEAKING");
            setSpeakingMsgId(botMsg.id);
          },
          onEnd: () => {
            setVoiceState("IDLE");
            setSpeakingMsgId(null);
          },
          onError: () => {
            setVoiceState("IDLE");
            setSpeakingMsgId(null);
          },
        });
      } else {
        setVoiceState("IDLE");
      }
    } catch (err) {
      console.warn("Floating AI network fallback engaged:", err.message);
      const fallbackData = getClientAiFallbackResponse(text);
      const fallbackAnswer = fallbackData.answer;

      const fallbackBotMsg = {
        id: `bot-fb-${Date.now()}`,
        sender: "assistant",
        text: fallbackAnswer,
        groundedCards: fallbackData.groundedCards || [],
        safetyLevel: fallbackData.safetyLevel || "safe",
      };

      setMessages((prev) => [...prev, fallbackBotMsg]);

      if (isVoice && autoSpeak && textToSpeechService.isSupported()) {
        setVoiceState("SPEAKING");
        setSpeakingMsgId(fallbackBotMsg.id);

        textToSpeechService.speak(fallbackAnswer, {
          onStart: () => {
            setVoiceState("SPEAKING");
            setSpeakingMsgId(fallbackBotMsg.id);
          },
          onEnd: () => {
            setVoiceState("IDLE");
            setSpeakingMsgId(null);
          },
          onError: () => {
            setVoiceState("IDLE");
            setSpeakingMsgId(null);
          },
        });
      } else {
        setVoiceState("IDLE");
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleStartListening = () => {
    if (!speechRecognitionService.isSupported()) return;

    textToSpeechService.stop();
    setSpeakingMsgId(null);
    setVoiceTranscript("");
    setVoiceState("LISTENING");

    speechRecognitionService.start({
      language,
      onStart: () => setVoiceState("LISTENING"),
      onResult: ({ transcript, isFinal }) => {
        setVoiceTranscript(transcript);
        if (isFinal && transcript.trim()) {
          handleSendMessage(transcript, true);
        }
      },
      onError: () => setVoiceState("ERROR"),
      onEnd: () => setVoiceState((prev) => (prev === "LISTENING" ? "IDLE" : prev)),
    });
  };

  const handleStopListening = () => {
    speechRecognitionService.stop();
    setVoiceState("IDLE");
  };

  const handleSpeakMessage = (msg) => {
    if (speakingMsgId === msg.id) {
      textToSpeechService.stop();
      setSpeakingMsgId(null);
      setVoiceState("IDLE");
      return;
    }

    textToSpeechService.stop();
    setSpeakingMsgId(msg.id);
    textToSpeechService.speak(msg.text, {
      language,
      onStart: () => setSpeakingMsgId(msg.id),
      onEnd: () => setSpeakingMsgId(null),
      onError: () => setSpeakingMsgId(null),
    });
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open JeevanSetu AI Assistant"
          className="flex items-center gap-2 px-4 py-3 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-full shadow-lg hover:shadow-xl border border-teal-500/80 transition-all cursor-pointer group"
        >
          <div className="w-6 h-6 rounded-full bg-teal-500/40 flex items-center justify-center group-hover:rotate-12 transition-transform">
            <Sparkles className="w-3.5 h-3.5 text-teal-200" />
          </div>
          <span>AI Assistant</span>
          <div className="p-1 rounded-full bg-teal-700 text-teal-100 ml-0.5">
            <Mic className="w-3 h-3" />
          </div>
        </button>
      )}

      {/* Floating Quick Assistant Drawer/Card */}
      {isOpen && (
        <div className="w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[540px] h-[480px] overflow-hidden animate-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-3.5 bg-linear-to-r from-teal-700 to-teal-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-black tracking-tight leading-tight">
                  JeevanSetu Assistant
                </h3>
                <span className="text-[10px] text-teal-200 leading-none">
                  Voice & Public Health Guidance
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setIsLiveVoiceOpen(true);
                }}
                className="px-2 py-1 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-[10px] font-black flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                title="Start Real-Time Gemini Voice Conversation"
              >
                <Sparkles className="w-3 h-3" />
                <span>Live Voice</span>
              </button>

              <Link
                href="/assistant"
                onClick={() => setIsOpen(false)}
                title="Open Full Assistant Page"
                className="p-1.5 rounded-lg text-teal-200 hover:text-white hover:bg-teal-800 transition-colors"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-teal-200 hover:text-white hover:bg-teal-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Language Selector & Emergency Bar */}
          <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1 font-bold">
              <button
                onClick={() => setLanguage("hi")}
                className={`px-1.5 py-0.5 rounded ${language === "hi" ? "bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-2xs" : "text-slate-500"}`}
              >
                हिंदी
              </button>
              <button
                onClick={() => setLanguage("mr")}
                className={`px-1.5 py-0.5 rounded ${language === "mr" ? "bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-2xs" : "text-slate-500"}`}
              >
                मराठी
              </button>
              <button
                onClick={() => setLanguage("en")}
                className={`px-1.5 py-0.5 rounded ${language === "en" ? "bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-2xs" : "text-slate-500"}`}
              >
                EN
              </button>
            </div>

            <a
              href="tel:108"
              className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1 hover:underline text-[10px]"
            >
              <PhoneCall className="w-3 h-3" />
              <span>108 Emergency</span>
            </a>
          </div>

          {/* Voice State Banner */}
          {voiceState === "LISTENING" && (
            <div className="p-2 bg-rose-600 text-white text-xs flex items-center justify-between animate-pulse">
              <span className="flex items-center gap-1.5 font-bold">
                <Mic className="w-3.5 h-3.5" />
                <span>Listening... ({language.toUpperCase()})</span>
              </span>
              <button
                onClick={handleStopListening}
                className="text-[10px] bg-rose-700 px-2 py-0.5 rounded font-bold"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2.5 bg-slate-50 dark:bg-slate-950 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.sender === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`p-2.5 rounded-xl max-w-[80%] leading-relaxed ${
                    m.sender === "user"
                      ? "bg-teal-600 text-white rounded-tr-xs"
                      : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs shadow-2xs"
                  }`}
                >
                  <p>{m.text}</p>
                  {m.sender === "assistant" && textToSpeechService.isSupported() && (
                    <button
                      type="button"
                      onClick={() => handleSpeakMessage(m)}
                      className="mt-1 text-[10px] text-teal-600 dark:text-teal-400 font-bold flex items-center gap-1 hover:underline"
                    >
                      {speakingMsgId === m.id ? (
                        <>
                          <VolumeX className="w-3 h-3 text-rose-500" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3" />
                          <span>Listen</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 items-center text-slate-400 text-xs p-1">
                <Bot className="w-4 h-4 animate-spin text-teal-600" />
                <span>Thinking...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-2.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5">
            {speechRecognitionService.isSupported() && (
              <button
                type="button"
                onClick={voiceState === "LISTENING" ? handleStopListening : handleStartListening}
                className={`p-2 rounded-xl border transition-colors cursor-pointer shrink-0 ${
                  voiceState === "LISTENING"
                    ? "bg-rose-600 text-white border-rose-700 animate-pulse"
                    : "bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800 hover:bg-teal-100"
                }`}
                title="Speak question"
              >
                <Mic className="w-4 h-4" />
              </button>
            )}

            <input
              type="text"
              placeholder={language === "hi" ? "पूछें या बोलें..." : language === "mr" ? "विचारा किंवा बोला..." : "Ask a question..."}
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              disabled={isTyping || voiceState === "LISTENING"}
              className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-900 dark:text-white"
            />

            <Button
              size="sm"
              onClick={() => handleSendMessage()}
              disabled={!inputQuery.trim() || isTyping}
              className="p-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Real-time Gemini Voice Conversation Modal */}
      <GeminiLiveVoiceModal
        isOpen={isLiveVoiceOpen}
        onClose={() => setIsLiveVoiceOpen(false)}
        initialLanguage={language || "mr"}
      />
    </div>
  );
}

export default FloatingAssistantButton;
