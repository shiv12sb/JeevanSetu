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
} from "lucide-react";

export function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-linear-to-b from-teal-50/60 via-slate-50 to-white dark:from-teal-950/40 dark:via-slate-950 dark:to-slate-950 pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-slate-200 dark:border-slate-800">
      {/* Background soft ambient accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-100/50 dark:bg-teal-950/30 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-1/3 left-10 w-72 h-72 bg-sky-100/50 dark:bg-sky-950/30 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Mission, Pitch, Actions */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-100/80 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-200 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-teal-600 dark:teal-400 animate-pulse shrink-0" />
              <span>{t("heroBadge", "Rural & Underserved Healthcare Coordination")}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-snug sm:leading-snug lg:leading-tight text-left">
              {t("heroTitlePrefix", "Bridging the gap between ")}
              <span className="text-teal-700 dark:text-teal-400 underline decoration-teal-300 dark:decoration-teal-600 decoration-4 underline-offset-8">
                {t("heroTitleHighlight", "rural patients")}
              </span>
              {t("heroTitleSuffix", " and verified life-saving care.")}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl text-left">
              {t("heroDescription", "JeevanSetu empowers citizens, PHC medical officers, and district healthcare networks with guided navigation, 'Check Before You Travel' status, seamless multi-stage referral tracking, and predictive medicine inventory warnings.")}
            </p>

            {/* Main Primary CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-start gap-3 pt-2">
              <Link href="/navigate" className="w-full sm:w-auto">
                <Button size="lg" className="w-full bg-teal-600 hover:bg-teal-700 text-white shadow-md gap-2 font-bold justify-center">
                  <Compass className="w-4 h-4 shrink-0" />
                  <span>{t("whatShouldIDoHeroBtn", "What Should I Do Now?")}</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </Button>
              </Link>

              <Link href="/resources" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full gap-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold justify-center">
                  <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span>{t("checkBeforeTravelHeroBtn", "Check Before You Travel")}</span>
                </Button>
              </Link>
            </div>

            {/* Grounding and Safety reassurance badge */}
            <div className="pt-4 flex flex-wrap items-center justify-start gap-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{t("verifiedResourcesBadge", "100% Verified Govt & NGO Resources")}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sky-800 dark:text-sky-300">
                <ShieldCheck className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
                <span>{t("nonDiagnosticBadge", "Non-Diagnostic Public Health Focus")}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <PhoneCall className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                <span>{t("emergencyIntegratedBadge", "Emergency 108 Hotline Integrated")}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Live Snapshot Preview */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/90 dark:border-slate-800 overflow-hidden text-left">
              {/* Snapshot header */}
              <div className="bg-teal-900 dark:bg-teal-950 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-800 dark:bg-teal-900 flex items-center justify-center">
                    <Activity className="w-4 h-4 text-teal-300" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold leading-normal">Live Referral & Stock Monitor</h2>
                    <span className="text-[10px] text-teal-200">Gadchiroli & Chandrapur Cluster</span>
                  </div>
                </div>
                <Badge variant="teal" size="sm">Active Sync</Badge>
              </div>

              {/* Snapshot body */}
              <div className="p-4 space-y-3.5 bg-slate-50/50 dark:bg-slate-900/50">
                {/* Active referral card preview */}
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Active Case JVS-MH-7A82K1</span>
                    <span className="text-[10px] bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold px-2 py-0.5 rounded border border-sky-200 dark:border-sky-800">
                      Step 3: Accepted
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal">
                    Ashti PHC → <strong className="text-slate-900 dark:text-slate-100">District Civil Hospital Gadchiroli</strong> (Cardiology OPD)
                  </p>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-sky-600 h-full w-1/2 rounded-full" />
                  </div>
                </div>

                {/* AI recommendation preview */}
                <div className="p-3 bg-linear-to-r from-teal-50 to-white dark:from-teal-950/60 dark:to-slate-800 rounded-xl border border-teal-200 dark:border-teal-800 shadow-2xs space-y-1.5">
                  <div className="flex items-center gap-1.5 text-teal-900 dark:text-teal-200 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                    <span>Grounded Resource Suggestion</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
                    PM-JAY Cashless Coverage & Gramin Arogya Sahayog transport grant matching patient profile.
                  </p>
                </div>

                {/* Critical medicine stock badge */}
                <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
                    <span className="font-semibold text-rose-900 dark:text-rose-200">Amlodipine (3.4d stock)</span>
                  </div>
                  <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400">Depletion Alert</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
