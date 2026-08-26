"use client";

import React from "react";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { FloatingAssistantButton } from "@/components/ai/FloatingAssistantButton";

export function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          {children}
          <FloatingAssistantButton />
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default AppProviders;
