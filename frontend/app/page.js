import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { CapabilitiesSection } from "@/components/landing/CapabilitiesSection";
import { PatientJourneySection } from "@/components/landing/PatientJourneySection";
import { PhcCapabilitiesSection } from "@/components/landing/PhcCapabilitiesSection";
import { AiAutomationSection } from "@/components/landing/AiAutomationSection";
import { TrustSafetySection } from "@/components/landing/TrustSafetySection";
import { CtaSection } from "@/components/landing/CtaSection";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070a13] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />
      <main className="flex-1 bg-slate-50 dark:bg-[#070a13] transition-colors duration-300">
        <HeroSection />
        <ProblemSection />
        <HowItWorksSection />
        <CapabilitiesSection />
        <PatientJourneySection />
        <PhcCapabilitiesSection />
        <AiAutomationSection />
        <TrustSafetySection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
