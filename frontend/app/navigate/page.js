"use client";

import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { NeedsNavigator } from "@/components/domain/NeedsNavigator";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { Badge } from "@/components/ui/Badge";
import { Compass } from "lucide-react";

export function NavigatePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070a13] text-slate-900 dark:text-slate-100 transition-colors duration-300 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[400px] bg-teal-500/10 dark:bg-teal-500/5 blur-[140px] rounded-full pointer-events-none -z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[400px] bg-emerald-500/10 dark:bg-emerald-500/5 blur-[140px] rounded-full pointer-events-none -z-0" />

      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8 space-y-8 relative z-10">
        <AuthGuard featureName="मार्गदर्शक (What Should I Do Now?)">
          {/* Banner */}
          <div className="bg-white/85 dark:bg-slate-900/60 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl border border-slate-200/90 dark:border-white/10 shadow-xl space-y-2 text-left">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 bg-teal-500/10 dark:bg-teal-950/80 px-3 py-1 rounded-full border border-teal-500/30 flex items-center gap-1.5 backdrop-blur-md">
                <Compass className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                Citizen Guided Healthcare Navigator
              </span>
              <Badge variant="teal" size="sm" className="font-bold">Last-Mile Access</Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              What Should I Do Now? / मला आता काय करावे लागेल?
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
              Move from confusion to clear next steps. Select your immediate situation below to discover verified health centers, check facility availability before you travel, match government assistance schemes, or track your referral.
            </p>
          </div>

          {/* Needs Navigator Interactive Component */}
          <NeedsNavigator />
        </AuthGuard>
      </main>

      <Footer />
    </div>
  );
}

export default NavigatePage;
