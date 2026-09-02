"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { RealtimeVoiceModal } from "@/components/ai/RealtimeVoiceModal";
import { PhoneCall } from "lucide-react";

export function LiveVoiceGlobalTrigger() {
  const pathname = usePathname();
  const [isCallOpen, setIsCallOpen] = useState(false);

  // Strictly hide floating voice / AI widget on Login, Register, and dedicated Assistant pages
  if (
    !pathname ||
    pathname === "/login" ||
    pathname.startsWith("/login") ||
    pathname === "/register" ||
    pathname.startsWith("/register") ||
    pathname === "/assistant" ||
    pathname.startsWith("/assistant")
  ) {
    return null;
  }

  return (
    <>
      {/* Steady, Non-Jumping Fixed Floating 1-on-1 Voice Call Button (Above Mobile Nav on Phones) */}
      <div className="fixed bottom-20 right-3.5 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2 group">
        <button
          type="button"
          onClick={() => setIsCallOpen(true)}
          className="flex items-center gap-2 sm:gap-2.5 p-3 sm:px-5 sm:py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-black text-xs sm:text-sm rounded-full shadow-2xl hover:shadow-emerald-500/50 hover:scale-105 active:scale-95 transition-all border-2 border-white/30 cursor-pointer"
          title="Direct 1-on-1 Marathi Voice Call (वाचता येत नसलेल्यांसाठी)"
          aria-label="Direct 1-on-1 Marathi Voice Call"
        >
          <span className="relative flex h-3 w-3 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
          </span>
          <PhoneCall className="w-4 h-4 text-white shrink-0" />
          <span className="hidden sm:inline font-black tracking-wide">📞 थेट व्हॉइस कॉल (मराठी)</span>
          <span className="text-[10px] bg-white/25 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono shrink-0">
            मराठी AI
          </span>
        </button>
      </div>

      {/* 1-on-1 Real-time OpenAI GPT-Realtime Voice Call Modal */}
      <RealtimeVoiceModal
        isOpen={isCallOpen}
        onClose={() => setIsCallOpen(false)}
        initialLanguage="mr"
      />
    </>
  );
}

export default LiveVoiceGlobalTrigger;
