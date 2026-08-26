import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Heart, Building2, ArrowRight, ShieldCheck } from "lucide-react";

export function CtaSection() {
  return (
    <section className="py-20 bg-linear-to-br from-teal-900 via-teal-800 to-slate-900 text-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl -z-0 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-600/20 rounded-full blur-3xl -z-0 pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-700/60 border border-teal-500/40 text-teal-200 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Transforming Rural Health Coordination</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight max-w-2xl mx-auto">
          Start exploring JeevanSetu's coordinated healthcare network today
        </h2>

        <p className="text-sm sm:text-base text-teal-100/90 max-w-xl mx-auto leading-relaxed">
          Experience how seamless patient cases, verified schemes, live referral tracking, and predictive inventory warnings work together.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link href="/dashboard/patient" className="w-full sm:w-auto">
            <Button size="lg" className="w-full bg-white text-teal-900 hover:bg-teal-50 font-bold shadow-lg gap-2">
              <Heart className="w-4 h-4 text-teal-700 fill-teal-700/20" />
              <span>Launch Patient Portal</span>
              <ArrowRight className="w-4 h-4 text-teal-700" />
            </Button>
          </Link>

          <Link href="/dashboard/phc" className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="outline"
              className="w-full border-teal-300/40 text-white bg-teal-800/40 hover:bg-teal-700/50 gap-2"
            >
              <Building2 className="w-4 h-4 text-teal-300" />
              <span>Launch PHC & Facility Portal</span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
