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
    <section className="py-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-3 py-1 rounded-full border border-teal-200 dark:border-teal-800">
            {txt.badge}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {txt.title}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            {txt.subtitle}
          </p>
        </div>

        {/* Highlighted Safety Banner */}
        <div className="mt-10 max-w-4xl mx-auto">
          <Alert variant="safety" className="p-5">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-teal-950 dark:text-teal-200">
                {txt.bannerTitle}
              </h4>
              <p className="text-xs text-teal-900 dark:text-teal-300 leading-relaxed">
                {txt.bannerText}
              </p>
            </div>
          </Alert>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {txt.boundaries.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 hover:border-teal-300 dark:hover:border-teal-600 transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 flex items-center justify-center border border-teal-200 dark:border-teal-800">
                  <Icon className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{b.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
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
