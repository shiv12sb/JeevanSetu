"use client";

import React from "react";
import { ShieldCheck, AlertOctagon, UserCheck, Lock } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { useLanguage } from "@/context/LanguageContext";

const SAFETY_CONTENT = {
  en: {
    badge: "Trust & Clinical Safety",
    title: "Our Healthcare Safety Boundaries",
    subtitle: "Healthcare access requires uncompromising ethics. Here are the core safety commitments embedded in JeevanSetu.",
    bannerTitle: "Ethical Healthcare AI Principle",
    bannerText: "JeevanSetu is built to eliminate coordination friction, reduce supply stockouts, and connect underserved patients to verified care. It does not replace medical judgment, nor does it generate speculative medical advice.",
    boundaries: [
      {
        icon: AlertOctagon,
        title: "No Automated Medical Diagnosis",
        detail: "JeevanSetu never tells a patient what disease they have or prescribes medications. All AI recommendations focus exclusively on finding verified healthcare resources, schemes, and doctors.",
      },
      {
        icon: UserCheck,
        title: "Human-in-the-Loop Anomaly Flags",
        detail: "Automated system alerts regarding doctor attendance or referral delays are structured as flags for administrative human review, never automated punitive accusations.",
      },
      {
        icon: Lock,
        title: "Strict Patient Privacy & Security",
        detail: "Medical documents and case notes are protected with row-level security (RLS). Patient records are visible only to the patient and verified clinicians involved in the referral chain.",
      },
    ],
  },
  hi: {
    badge: "विश्वसनीयता एवं सुरक्षा नीतियां",
    title: "हमारी स्वास्थ्य सुरक्षा एवं नैतिक सीमाएं",
    subtitle: "स्वास्थ्य सेवा में नैतिकता सर्वोपरि है। जीवनसेतु में अंतर्निहित मुख्य सुरक्षा प्रतिबद्धताएं निम्नलिखित हैं।",
    bannerTitle: "जिम्मेदार स्वास्थ्य एआई सिद्धांत",
    bannerText: "जीवनसेतु का उद्देश्य रेफरल समन्वय को आसान बनाना, दवा की कमी रोकना और जरूरतमंद मरीजों को सही अस्पताल से जोड़ना है। यह डॉक्टरों का विकल्प नहीं है और न ही कोई नुस्खा लिखता है।",
    boundaries: [
      {
        icon: AlertOctagon,
        title: "कोई स्वचालित चिकित्सीय निदान नहीं",
        detail: "जीवनसेतु मरीज को कभी भी बीमारी का नाम या दवाइयां नहीं बताता। इसका काम केवल सत्यापित अस्पताल, योजनाएं और डॉक्टर खोजना है।",
      },
      {
        icon: UserCheck,
        title: "अधिकारियों द्वारा मानवीय समीक्षा",
        detail: "डॉक्टर उपस्थिति या रेफरल में देरी संबंधी सभी अलर्ट केवल प्रशासनिक समीक्षा के लिए होते हैं, कोई स्वचालित दंडात्मक कार्रवाई नहीं होती।",
      },
      {
        icon: Lock,
        title: "सख्त मरीज गोपनीयता एवं डेटा सुरक्षा",
        detail: "मरीज की मेडिकल पर्चियां और रिपोर्ट पूरी तरह सुरक्षित हैं और केवल मरीज व संबंधित अधिकृत डॉक्टर ही देख सकते हैं।",
      },
    ],
  },
  mr: {
    badge: "विश्वासार्हता व सुरक्षितता",
    title: "आरोग्य सुरक्षिततेच्या नैतिक मर्यादा",
    subtitle: "आरोग्य सेवेत पारदर्शकता आणि नैतिकता अत्यंत महत्त्वाची आहे. जीवनसेतूच्या सुरक्षा नियमावली खालीलप्रमाणे आहे.",
    bannerTitle: "नैतिक आरोग्य एआय मार्गदर्शक तत्त्वे",
    bannerText: "जीवनसेतूचा उद्देश रुग्णालयांमधील समन्वय सुधारणे, औषधांचा तुटवडा टाळणे आणि रुग्णांना वेळेवर मदत मिळवून देणे हा आहे. हा डॉक्टरांचा पर्याय नाही.",
    boundaries: [
      {
        icon: AlertOctagon,
        title: "थेट वैद्यकीय निदान नाही",
        detail: "जीवनसेतू कोणत्याही आजाराचे थेट निदान करत नाही किंवा औषधोपचार सुचवत नाही. केवळ प्रमाणित रुग्णालये, योजना व डॉक्टरांची माहिती देतो.",
      },
      {
        icon: UserCheck,
        title: "आरोग्य अधिकाऱ्यांमार्फत मानवी तपासणी",
        detail: "डॉक्टर उपस्थिती किंवा संदर्भातील विलंबाच्या सर्व सूचना केवळ जिल्हा आरोग्य अधिकाऱ्यांच्या पडताळणीसाठी असतात.",
      },
      {
        icon: Lock,
        title: "रुग्ण गोपनीयतेचे कडक संरक्षण",
        detail: "रुग्णाचे वैद्यकीय अहवाल आणि नोंदी अत्यंत सुरक्षित असून केवळ रुग्ण आणि नियुक्त डॉक्टरांनाच पाहता येतात.",
      },
    ],
  },
};

export function TrustSafetySection() {
  const { language } = useLanguage();
  const txt = SAFETY_CONTENT[language] || SAFETY_CONTENT.en;

  return (
    <section className="py-20 relative bg-slate-50/50 dark:bg-slate-950/40 border-b border-slate-200/80 dark:border-white/10 overflow-hidden transition-colors duration-300">
      {/* Ambient background lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-teal-500/5 blur-[120px] rounded-full pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 bg-teal-500/10 px-3.5 py-1.5 rounded-full border border-teal-500/20 backdrop-blur-md shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-600 dark:bg-teal-400 animate-pulse" />
            {txt.badge}
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            {txt.title}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
            {txt.subtitle}
          </p>
        </div>

        {/* Highlighted Safety Banner */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="p-6 rounded-2xl bg-teal-900/90 dark:bg-gradient-to-r dark:from-teal-950/50 dark:via-slate-900/70 dark:to-teal-950/50 backdrop-blur-2xl border border-teal-500/30 shadow-xl shadow-teal-500/10 flex items-start gap-4 text-white">
            <div className="w-10 h-10 rounded-xl bg-teal-400/20 text-teal-300 flex items-center justify-center shrink-0 border border-teal-400/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm sm:text-base font-bold text-teal-200">
                {txt.bannerTitle}
              </h4>
              <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed">
                {txt.bannerText}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {txt.boundaries.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-lg shadow-slate-200/50 dark:shadow-none space-y-3 hover:border-teal-500/40 hover:shadow-xl hover:shadow-teal-500/5 transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-500/20 group-hover:scale-105 group-hover:bg-teal-500/20 transition-all duration-300">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-300 transition-colors">
                  {b.title}
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {b.detail}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default TrustSafetySection;
