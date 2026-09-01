"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useLanguage } from "@/context/LanguageContext";
import {
  Heart,
  ShieldCheck,
  Building2,
  Sparkles,
  ArrowRight,
  PhoneCall,
  Activity,
  CheckCircle2,
  Package,
  Compass,
  User,
  Siren,
  Stethoscope,
  Truck,
  GitPullRequest,
  Bot,
  Radio,
} from "lucide-react";

export function HeroSection() {
  const { t, language } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-slate-50 dark:bg-[#070a13] pt-10 pb-14 lg:pt-16 lg:pb-20 border-b border-slate-200/80 dark:border-white/10 transition-colors duration-300">
      {/* Soft ambient gradient mesh accents */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-teal-500/10 dark:bg-teal-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-1/3 left-10 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-sky-500/10 dark:bg-sky-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Top Header & Mission Statement */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-3xl text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 dark:bg-teal-500/15 border border-teal-500/20 dark:border-teal-500/30 text-teal-800 dark:text-teal-300 text-xs font-bold shadow-xs backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-teal-600 dark:bg-teal-400 animate-pulse shrink-0" />
              <span>{t("patientPortalBadge", "100% Free Public Health Access")}</span>
              <span className="text-slate-400 dark:text-slate-500">•</span>
              <span className="font-mono text-[11px] text-teal-700 dark:text-teal-200">Govt of Maharashtra • NHM</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight sm:leading-tight">
              JEEVANSETU —{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-emerald-500 to-cyan-600 dark:from-teal-400 dark:via-emerald-300 dark:to-cyan-400 underline decoration-teal-500/40 decoration-4 underline-offset-8">
                {t("heroTitleHighlight", "Connected Healthcare")}
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl font-normal">
              {t("heroDescription", "JeevanSetu empowers citizens, PHC medical officers, and district healthcare networks with guided navigation, 'Check Before You Travel' status, seamless multi-stage referral tracking, and predictive medicine inventory warnings.")}
            </p>
          </div>

          {/* Quick Emergency 108 Action Button */}
          <div className="shrink-0 flex items-center gap-3">
            <a
              href="tel:108"
              className="inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 active:scale-95 text-white font-black text-xs shadow-lg shadow-rose-600/30 transition-all duration-200 border border-rose-400/40 min-h-[44px]"
            >
              <Siren className="w-4 h-4 animate-bounce shrink-0" />
              <div className="text-left">
                <span className="block text-[9px] uppercase tracking-wider text-rose-200 font-bold">24x7 Ambulance</span>
                <span className="text-xs font-black">EMERGENCY: DIAL 108</span>
              </div>
            </a>
          </div>
        </div>

        {/* =========================================================================
            PROMINENT PATIENT PORTAL HERO CARD (PRIMARY ENTRY POINT)
            ========================================================================= */}
        <div className="relative rounded-3xl bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 lg:p-10 shadow-2xl shadow-teal-950/20 border border-teal-500/30 backdrop-blur-2xl overflow-hidden">
          {/* Subtle background graphic */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Col: Patient Portal Branding & Description */}
            <div className="lg:col-span-8 space-y-4 text-left">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300 shadow-lg shadow-teal-500/10">
                  <User className="w-7 h-7" />
                </div>
                <div>
                  <Badge className="bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 font-black text-[10px] uppercase px-2.5 py-0.5 tracking-wider shadow-sm">
                    Primary Citizen Gateway
                  </Badge>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
                    {t("patientPortalCardTitle", "रुग्ण सेवा केंद्र (PATIENT PORTAL)")}
                  </h2>
                </div>
              </div>

              <p className="text-sm sm:text-base text-teal-100/90 leading-relaxed max-w-2xl font-medium">
                {t(
                  "patientPortalCardSubtitle",
                  "Access healthcare services, verified doctors, live ambulance (108), referrals, and AI health assistant in your language."
                )}
              </p>

              {/* Patient Flow Pathway Pill - Interactive & High Contrast */}
              <div className="pt-2 flex items-center gap-2 text-xs flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 border border-white/20 text-white font-bold text-xs backdrop-blur-md">
                  <User className="w-3 h-3 text-teal-300" />
                  <span>Citizen</span>
                </span>
                
                <span className="text-teal-300 font-black text-sm">➔</span>
                
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-teal-500/20 border border-teal-400/40 text-teal-200 font-extrabold text-xs backdrop-blur-md">
                  <Heart className="w-3 h-3 text-teal-300 fill-teal-300/30" />
                  <span>JeevanSetu</span>
                </span>
                
                <span className="text-teal-300 font-black text-sm">➔</span>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <Link
                    href="/doctors"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/40 text-indigo-100 hover:text-white font-bold text-[11px] transition-all"
                  >
                    <Stethoscope className="w-3 h-3 text-indigo-300" />
                    <span>Doctor</span>
                  </Link>

                  <Link
                    href="/ambulance"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 text-rose-100 hover:text-white font-bold text-[11px] transition-all"
                  >
                    <Siren className="w-3 h-3 text-rose-300" />
                    <span>108 Ambulance</span>
                  </Link>

                  <Link
                    href="/resources"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-sky-100 hover:text-white font-bold text-[11px] transition-all"
                  >
                    <Building2 className="w-3 h-3 text-sky-300" />
                    <span>PHC</span>
                  </Link>

                  <Link
                    href="/referrals"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-100 hover:text-white font-bold text-[11px] transition-all"
                  >
                    <GitPullRequest className="w-3 h-3 text-emerald-300" />
                    <span>Referral</span>
                  </Link>

                  <Link
                    href="/rural-access"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-100 hover:text-white font-bold text-[11px] transition-all"
                  >
                    <Radio className="w-3 h-3 text-amber-300" />
                    <span>ASHA</span>
                  </Link>
                </div>
              </div>

              {/* Primary Call-to-Actions */}
              <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <Link href="/dashboard/patient" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 active:from-teal-500 active:to-emerald-500 text-slate-950 font-black text-sm px-7 py-3.5 rounded-2xl shadow-xl shadow-teal-500/25 gap-2 justify-center transition-all duration-200 min-h-[48px] border border-teal-300/40"
                  >
                    <User className="w-4 h-4 shrink-0" />
                    <span>{t("enterPatientPortalBtn", "ENTER PATIENT PORTAL →")}</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </Button>
                </Link>

                <Link href="/navigate" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full border-white/20 bg-white/10 hover:bg-white/15 text-white font-bold text-sm px-6 py-3.5 rounded-2xl gap-2 justify-center transition-all duration-200 min-h-[48px] backdrop-blur-md"
                  >
                    <Compass className="w-4 h-4 text-teal-300 shrink-0" />
                    <span>{t("exploreServicesBtn", "Explore Services / मार्गदर्शक")}</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Col: 3 Instant Highlights */}
            <div className="lg:col-span-4 grid grid-cols-1 gap-3">
              <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md flex items-center gap-3 shadow-md">
                <div className="w-9 h-9 rounded-xl bg-teal-400/20 text-teal-300 flex items-center justify-center shrink-0 border border-teal-400/30">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <h3 className="text-xs font-bold text-white">AI Health & Voice Assistant</h3>
                  <p className="text-[11px] text-teal-200/80">Multilingual audio guidance in Marathi & Hindi</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md flex items-center gap-3 shadow-md">
                <div className="w-9 h-9 rounded-xl bg-sky-400/20 text-sky-300 flex items-center justify-center shrink-0 border border-sky-400/30">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <h3 className="text-xs font-bold text-white">100% MMC Verified Doctors</h3>
                  <p className="text-[11px] text-sky-200/80">Verified practitioners across Maharashtra</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md flex items-center gap-3 shadow-md">
                <div className="w-9 h-9 rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-400/30">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <h3 className="text-xs font-bold text-white">Free Cashless Treatment (PM-JAY)</h3>
                  <p className="text-[11px] text-emerald-200/80">MJPJAY & Ayushman Bharat coverage</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            QUICK ACTIONS GRID (11-PILLAR HEALTHCARE ACCESS ICONS)
            ========================================================================= */}
        <div className="space-y-3 text-left">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t("howCanWeHelp", "How can we help you today?")}
            </h3>
            <span className="text-[11px] text-teal-600 dark:text-teal-400 font-bold">
              11 Unified Healthcare Services
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {/* Action 1: 108 Emergency */}
            <a
              href="tel:108"
              className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 hover:border-rose-400 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col items-start gap-2 group min-h-[44px] backdrop-blur-md"
            >
              <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-600/30 group-hover:scale-105 transition-transform">
                <Siren className="w-4 h-4 animate-pulse" />
              </div>
              <div className="text-left">
                <p className="text-xs font-black text-rose-900 dark:text-rose-200">108 Emergency</p>
                <p className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">Call Ambulance</p>
              </div>
            </a>

            {/* Action 2: AI Health Assistant */}
            <Link
              href="/assistant"
              className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/90 dark:border-white/10 hover:border-teal-500/50 hover:bg-slate-50 dark:hover:bg-slate-900/90 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col items-start gap-2 group min-h-[44px] backdrop-blur-md"
            >
              <div className="w-8 h-8 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-500/20 group-hover:scale-105 transition-transform">
                <Bot className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-900 dark:text-white">AI Assistant</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Voice & Chat</p>
              </div>
            </Link>

            {/* Action 3: Find Doctor */}
            <Link
              href="/doctors"
              className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/90 dark:border-white/10 hover:border-indigo-500/50 hover:bg-slate-50 dark:hover:bg-slate-900/90 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col items-start gap-2 group min-h-[44px] backdrop-blur-md"
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20 group-hover:scale-105 transition-transform">
                <Stethoscope className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-900 dark:text-white">Find Doctor</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">MMC Verified</p>
              </div>
            </Link>

            {/* Action 4: Ambulance Fleet */}
            <Link
              href="/ambulance"
              className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/90 dark:border-white/10 hover:border-amber-500/50 hover:bg-slate-50 dark:hover:bg-slate-900/90 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col items-start gap-2 group min-h-[44px] backdrop-blur-md"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20 group-hover:scale-105 transition-transform">
                <Truck className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-900 dark:text-white">Ambulance</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Live 108 Dispatch</p>
              </div>
            </Link>

            {/* Action 5: Healthcare Facilities */}
            <Link
              href="/resources"
              className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/90 dark:border-white/10 hover:border-sky-500/50 hover:bg-slate-50 dark:hover:bg-slate-900/90 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col items-start gap-2 group min-h-[44px] backdrop-blur-md"
            >
              <div className="w-8 h-8 rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-500/20 group-hover:scale-105 transition-transform">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-900 dark:text-white">Hospitals & PHCs</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Check Before Travel</p>
              </div>
            </Link>

            {/* Action 6: Referrals */}
            <Link
              href="/referrals"
              className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/90 dark:border-white/10 hover:border-emerald-500/50 hover:bg-slate-50 dark:hover:bg-slate-900/90 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col items-start gap-2 group min-h-[44px] backdrop-blur-md"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-105 transition-transform">
                <GitPullRequest className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-900 dark:text-white">Referrals</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Stage Tracking</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
