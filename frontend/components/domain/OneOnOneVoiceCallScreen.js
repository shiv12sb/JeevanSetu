"use client";

import React from "react";
import { RealtimeVoiceModal } from "@/components/ai/RealtimeVoiceModal";

/**
 * High-performance Voice Call Screen backed by OpenAI Realtime Voice AI (WebRTC).
 * Fully grounded with 17 verified healthcare tools, barge-in speech interruption,
 * and native spoken Marathi, Hindi, and English.
 */
export function OneOnOneVoiceCallScreen({ isOpen, onClose, defaultLanguage = "mr", onSyncTranscript }) {
  return (
    <RealtimeVoiceModal
      isOpen={isOpen}
      onClose={onClose}
      initialLanguage={defaultLanguage}
      onSyncTranscript={onSyncTranscript}
    />
  );
}

export default OneOnOneVoiceCallScreen;
