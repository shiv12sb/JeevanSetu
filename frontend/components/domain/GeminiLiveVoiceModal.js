"use client";

import React from "react";
import { RealtimeVoiceModal } from "@/components/ai/RealtimeVoiceModal";

/**
 * Backward-compatible wrapper that delegates directly to the new OpenAI Realtime Voice AI Modal.
 */
export function GeminiLiveVoiceModal({ isOpen, onClose, initialLanguage = "mr", onSyncTranscript }) {
  return (
    <RealtimeVoiceModal
      isOpen={isOpen}
      onClose={onClose}
      initialLanguage={initialLanguage}
      onSyncTranscript={onSyncTranscript}
    />
  );
}

export default GeminiLiveVoiceModal;
