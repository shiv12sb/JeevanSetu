"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Heart, Building2, ArrowRight, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const CTA_CONTENT = {
  en: {
    badge: "Transforming Rural Health Coordination",
    title: "Start exploring JeevanSetu's coordinated healthcare network today",
    subtitle: "Experience how seamless patient cases, verified schemes, live referral tracking, and predictive inventory warnings work together.",
    patientBtn: "Launch Patient Portal",
    phcBtn: "Launch PHC & Facility Portal",
  },
  hi: {
    badge: "ग्रामीण स्वास्थ्य समन्वय में बड़ा बदलाव",
    title: "आज ही जीवनसेतु स्वास्थ्य नेटवर्क का उपयोग शुरू करें",
    subtitle: "देखें कि कैसे सुरक्षित मरीज रिकॉर्ड, सत्यापित सरकारी योजनाएं, लाइव रेफरल और दवा अलर्ट मिलकर जीवन बचाते हैं।",
    patientBtn: "मरीज पोर्टल शुरू करें",
    phcBtn: "पीएचसी एवं अस्पताल पोर्टल",
  },
  mr: {
    badge: "ग्रामीण आरोग्य सेवेतील डिजिटल क्रांती",
    title: "आजच जीवनसेतू आरोग्य नेटवर्कचा वापर सुरू करा",
    subtitle: "पहा कसे सुरक्षित रुग्ण व्यवस्थापन, प्रमाणित योजना, थेट रेफरल आणि औषध साठा अलर्ट एकत्र काम करतात.",
    patientBtn: "रुग्ण पोर्टल सुरू करा",
    phcBtn: "आरोग्य केंद्र व रुग्णालय पोर्टल",
  },
};

export function CtaSection() {
  const { language } = useLanguage();
  const txt = CTA_CONTENT[language] || CTA_CONTENT.en;

  return (
    <section className="py-24 relative overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Background ambient decorations */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[140px] pointer-events-none -z-0" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none -z-0" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="p-8 sm:p-12 md:p-16 rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 backdrop-blur-2xl border border-teal-500/30 shadow-2xl text-center space-y-6 text-white">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold backdrop-blur-md shadow-xs shadow-teal-500/10">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            <ShieldCheck className="w-4 h-4" />
            <span>{txt.badge}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight max-w-3xl mx-auto text-white">
            {txt.title}
          </h2>

          <p className="text-sm sm:text-base text-teal-100/90 max-w-2xl mx-auto leading-relaxed">
            {txt.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/dashboard/patient" className="w-full sm:w-auto">
              <Button size="lg" className="w-full bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 font-black shadow-lg shadow-teal-500/25 gap-2 rounded-2xl px-8 h-12">
                <Heart className="w-4 h-4 fill-slate-950/20" />
                <span>{txt.patientBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <Link href="/dashboard/phc" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full border-white/20 text-white bg-white/10 hover:bg-white/20 hover:border-teal-400/60 gap-2 rounded-2xl px-8 h-12 backdrop-blur-md"
              >
                <Building2 className="w-4 h-4 text-teal-300" />
                <span>{txt.phcBtn}</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CtaSection;
