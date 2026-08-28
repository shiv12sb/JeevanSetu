"use client";

import React from "react";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { LocationProvider } from "@/context/LocationContext";
import { FloatingAssistantButton } from "@/components/ai/FloatingAssistantButton";
import { LiveVoiceGlobalTrigger } from "@/components/domain/LiveVoiceGlobalTrigger";

export function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <LocationProvider>
            {children}
            <LiveVoiceGlobalTrigger />
          </LocationProvider>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default AppProviders;

