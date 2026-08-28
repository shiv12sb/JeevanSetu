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
    <section className="py-20 bg-linear-to-br from-teal-900 via-teal-800 to-slate-900 text-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl -z-0 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-600/20 rounded-full blur-3xl -z-0 pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-700/60 border border-teal-500/40 text-teal-200 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{txt.badge}</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight max-w-2xl mx-auto">
          {txt.title}
        </h2>

        <p className="text-sm sm:text-base text-teal-100/90 max-w-xl mx-auto leading-relaxed">
          {txt.subtitle}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link href="/dashboard/patient" className="w-full sm:w-auto">
            <Button size="lg" className="w-full bg-white text-teal-900 hover:bg-teal-50 font-bold shadow-lg gap-2">
              <Heart className="w-4 h-4 text-teal-700 fill-teal-700/20" />
              <span>{txt.patientBtn}</span>
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
              <span>{txt.phcBtn}</span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default CtaSection;
