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
import { AndroidBackHandler } from "@/components/shared/AndroidBackHandler";
import { NetworkStatusBanner } from "@/components/shared/NetworkStatusBanner";
import { GoogleOAuthProvider } from "@react-oauth/google";

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "601685324051-gufv579qupa2ujknullbk1lpc7dvtgr9.apps.googleusercontent.com";

export function AppProviders({ children }) {
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <ThemeProvider>
        <AuthProvider>
          <LanguageProvider>
            <LocationProvider>
              <NavigationProvider>
                <NetworkStatusBanner />
                <AndroidBackHandler />
                {children}
                <LiveVoiceGlobalTrigger />
                <MobileBottomBar />
                <AllFeaturesDrawer />
              </NavigationProvider>
            </LocationProvider>
          </LanguageProvider>
        </AuthProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default AppProviders;

