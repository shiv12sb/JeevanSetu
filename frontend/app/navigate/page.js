"use client";

import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { NeedsNavigator } from "@/components/domain/NeedsNavigator";
import { Badge } from "@/components/ui/Badge";
import { Compass } from "lucide-react";

export function NavigatePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded border border-teal-200 dark:border-teal-800 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              Citizen Guided Healthcare Navigator
            </span>
            <Badge variant="teal" size="sm">Last-Mile Access</Badge>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            What Should I Do Now? / मुझे अभी क्या करना चाहिए?
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
            Move from confusion to clear next steps. Select your immediate situation below to discover verified health centers, check facility availability before you travel, match government assistance schemes, or track your referral.
          </p>
        </div>

        {/* Needs Navigator Interactive Component */}
        <NeedsNavigator />
      </main>

      <Footer />
    </div>
  );
}

export default NavigatePage;
