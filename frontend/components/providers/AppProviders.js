"use client";

import React from "react";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { LocationProvider } from "@/context/LocationContext";
import { NavigationProvider } from "@/context/NavigationContext";
import { LiveVoiceGlobalTrigger } from "@/components/domain/LiveVoiceGlobalTrigger";
import { MobileBottomBar } from "@/components/layout/MobileBottomBar";
import { AllFeaturesDrawer } from "@/components/layout/AllFeaturesDrawer";

export function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <LocationProvider>
            <NavigationProvider>
              {children}
              <LiveVoiceGlobalTrigger />
              <MobileBottomBar />
              <AllFeaturesDrawer />
            </NavigationProvider>
          </LocationProvider>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default AppProviders;

