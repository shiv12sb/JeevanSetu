"use client";

import React from "react";
import { FileText, Sparkles, GitPullRequest } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const HOW_IT_WORKS_CONTENT = {
  en: {
    badge: "Coordinated Care Workflow",
    title: "How JeevanSetu connects need to verified support",
    subtitle: "A simple, transparent 3-step pathway from primary health center contact to tertiary hospital resolution.",
    steps: [
      {
        stepNumber: "01",
        icon: FileText,
        title: "Create Healthcare Case",
        description: "The patient or PHC healthcare worker enters primary symptoms, vital observations, and attaches clinical test reports.",
      },
      {
        stepNumber: "02",
        icon: Sparkles,
        title: "Grounded AI Recommendation",
        description: "JeevanSetu matches verified district hospitals, applicable government schemes (PM-JAY, MJPJAY), and local NGO transport assistance.",
      },
      {
        stepNumber: "03",
        icon: GitPullRequest,
        title: "Track Multi-Stage Referral",
        description: "The receiving hospital confirms bed availability, and progress is tracked transparently until treatment is completed.",
      },
    ],
  },
  hi: {
    badge: "सरल एवं समन्वित कार्यप्रणाली",
    title: "जीवनसेतु कैसे ग्रामीण मरीजों को सत्यापित स्वास्थ्य सेवाओं से जोड़ता है",
    subtitle: "प्राथमिक स्वास्थ्य केंद्र से लेकर जिला अस्पताल में सफल इलाज तक केवल 3 पारदर्शी चरणों का आसान मार्ग।",
    steps: [
      {
        stepNumber: "01",
        icon: FileText,
        title: "स्वास्थ्य केस दर्ज करें",
        description: "मरीज या आशा कार्यकर्ता प्राथमिक लक्षण, वाइटल्स (बीपी/ऑक्सीजन) और जरूरी पर्चियां 1 मिनट में दर्ज करते हैं।",
      },
      {
        stepNumber: "02",
        icon: Sparkles,
        title: "सत्यापित एआई मिलान",
        description: "जीवनसेतु निकटतम उपलब्ध सरकारी जिला अस्पताल, सरकारी मुफ्त योजनाएं (PM-JAY) और एनजीओ वाहन सहायता का मिलान करता है।",
      },
      {
        stepNumber: "03",
        icon: GitPullRequest,
        title: "6-चरणीय रेफरल ट्रैकिंग",
        description: "जिला अस्पताल द्वारा बेड और डॉक्टर की पुष्टि के साथ मरीज के भर्ती और सफल इलाज तक हर कदम लाइव ट्रैक होता है।",
      },
    ],
  },
  mr: {
    badge: "समन्वित आरोग्य कार्यप्रणाली",
    title: "जीवनसेतू गरजवंत रुग्णांना योग्य आरोग्य सेवेशी कसे जोडतो",
    subtitle: "प्राथमिक आरोग्य केंद्रापासून ते जिल्हा रुग्णालयात प्रत्यक्ष उपचारापर्यंत ३ सोप्या टप्प्यांचा पारदर्शक मार्ग.",
    steps: [
      {
        stepNumber: "01",
        icon: FileText,
        title: "आरोग्य केस नोंदवा",
        description: "रुग्ण किंवा आशा स्वयंसेविका प्राथमिक लक्षणे, तपासणी नोंदी (रक्तदाब/ऑक्सिजन) आणि वैद्यकीय कागदपत्रे नोंदवतात.",
      },
      {
        stepNumber: "02",
        icon: Sparkles,
        title: "प्रमाणित एआय शिफारस",
        description: "जीवनसेतू जवळचे जिल्हा रुग्णालय, शासकीय मोफत योजना (PM-JAY / म.फुले) आणि स्वयंसेवी रुग्णवाहिका मदत जुळवतो.",
      },
      {
        stepNumber: "03",
        icon: GitPullRequest,
        title: "६-टप्प्यांचे रेफरल ट्रॅकिंग",
        description: "जिल्हा रुग्णालयाकडून खाट व डॉक्टरांची खात्री आणि रुग्णाचा उपचार पूर्ण होईपर्यंत प्रत्येक टप्प्याची पारदर्शक माहिती मिळते.",
      },
    ],
  },
};

export function HowItWorksSection() {
  const { language } = useLanguage();
  const txt = HOW_IT_WORKS_CONTENT[language] || HOW_IT_WORKS_CONTENT.en;

  return (
    <section className="py-16 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300 bg-teal-100/70 dark:bg-teal-950/70 px-3 py-1 rounded-full border border-teal-200 dark:border-teal-800">
            {txt.badge}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {txt.title}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            {txt.subtitle}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {txt.steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="relative p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center border border-teal-100 dark:border-teal-800">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-3xl font-black text-slate-200 dark:text-slate-700 font-mono">
                      {step.stepNumber}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;
