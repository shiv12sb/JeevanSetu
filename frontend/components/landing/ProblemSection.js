"use client";

import React from "react";
import { AlertTriangle, Clock, MapPinOff, Layers, PackageX } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const PROBLEM_CONTENT = {
  en: {
    badge: "The Rural Healthcare Challenge",
    title: "Why healthcare delivery breaks down in underserved communities",
    subtitle: "Rural healthcare challenges are rarely about lack of medical intent—they stem from gaps in coordination, verified resource awareness, and proactive supply logistics.",
    problems: [
      {
        icon: MapPinOff,
        title: "Geographic Isolation & Referral Drop-offs",
        description: "Patients traveling long distances to tertiary centers frequently arrive unannounced, facing unavailable specialist beds or missing preliminary documents.",
      },
      {
        icon: PackageX,
        title: "Unexpected Medicine Stockouts",
        description: "PHCs often experience sudden stockouts of essential maternal, cardiovascular, and emergency drugs due to static monthly quotas and lack of depletion forecasting.",
      },
      {
        icon: Layers,
        title: "Unclaimed Government Schemes",
        description: "Eligible BPL and tribal families continue to pay out-of-pocket costs because complex empanelment criteria and required certificates are difficult to navigate.",
      },
      {
        icon: Clock,
        title: "Fragmented Offline Records",
        description: "Paper referral slips get damaged or lost during transit, forcing clinicians to repeat basic diagnostics and delaying critical medical care.",
      },
    ],
  },
  hi: {
    badge: "ग्रामीण स्वास्थ्य क्षेत्र की मुख्य चुनौतियां",
    title: "दूरदराज के इलाकों में स्वास्थ्य सेवाएं क्यों बाधित होती हैं?",
    subtitle: "ग्रामीण क्षेत्रों में समस्या डॉक्टरों की नीयत की नहीं, बल्कि समन्वय की कमी, अस्पतालों की सटीक स्थिति न पता होना और दवाओं की कमी से उत्पन्न होती है।",
    problems: [
      {
        icon: MapPinOff,
        title: "लंबी दूरी और रेफरल में भटकाव",
        description: "गांव से जिला अस्पताल पहुंचने पर मरीजों को खाली बेड या उपस्थित डॉक्टर न मिलने से गंभीर परेशानी और समय की बर्बादी होती है।",
      },
      {
        icon: PackageX,
        title: "दवाइयों का अचानक खत्म होना",
        description: "मासिक कोटा और स्टॉक खपत का पूर्व अनुमान न होने से प्राथमिक स्वास्थ्य केंद्रों पर आवश्यक दवाइयां अचानक खत्म हो जाती हैं।",
      },
      {
        icon: Layers,
        title: "सरकारी योजनाओं का लाभ न मिल पाना",
        description: "कागजी प्रक्रियाओं और जानकारी के अभाव में गरीब परिवार आयुष्मान भारत (PM-JAY) व महात्मा फुले जैसी मुफ्त योजनाओं से वंचित रह जाते हैं।",
      },
      {
        icon: Clock,
        title: "कागजी पर्चों का खोना व देर होना",
        description: "सफर के दौरान कागजी पर्चियां खोने या खराब होने से डॉक्टरों को दोबारा जांचें करानी पड़ती हैं, जिससे इलाज में देरी होती है।",
      },
    ],
  },
  mr: {
    badge: "ग्रामीण आरोग्य समस्येचे मूळ कारण",
    title: "दुर्गम व ग्रामीण भागात आरोग्य यंत्रणा का अपुरी पडते?",
    subtitle: "ग्रामीण आरोग्य सेवेतील अडचणी उपचारांच्या अभावामुळे नव्हे, तर रुग्णालयांच्या समन्वयातील अंतर, उपलब्धतेची माहिती नसणे आणि औषध तुटवड्यामुळे येतात.",
    problems: [
      {
        icon: MapPinOff,
        title: "लांबचा प्रवास व रुग्णालयात गैरसोय",
        description: "गावातून जिल्हा रुग्णालयात गेल्यावर खाटा किंवा तज्ज्ञ डॉक्टर उपलब्ध नसल्यास रुग्णांचा वेळ व पैशांचा मोठा अपव्यय होतो.",
      },
      {
        icon: PackageX,
        title: "आरोग्य केंद्रांत अचानक औषध तुटवडा",
        description: "साठ्याचा वापर आणि खपाचा आधीच अंदाज न आल्याने प्राथमिक आरोग्य केंद्रांमध्ये अत्यावश्यक औषधांचा अचानक तुटवडा जाणवतो.",
      },
      {
        icon: Layers,
        title: "शासकीय योजनांचा लाभ न मिळणे",
        description: "माहितीच्या अभावामुळे गरजू नागरिक आयुष्यमान भारत (PM-JAY) आणि म.फुले जन आरोग्य योजनेच्या मोफत उपचारांपासून वंचित राहतात.",
      },
      {
        icon: Clock,
        title: "कागदपत्रे हरवणे व तपासण्यांची पुनरावृत्ती",
        description: "प्रवासात कागदी पावत्या गहाळ झाल्याने जिल्हा रुग्णालयात त्याच चाचण्या पुन्हा कराव्या लागतात आणि उपचाराला उशीर होतो.",
      },
    ],
  },
};

export function ProblemSection() {
  const { language } = useLanguage();
  const txt = PROBLEM_CONTENT[language] || PROBLEM_CONTENT.en;

  return (
    <section className="py-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-3 py-1 rounded-full border border-rose-200 dark:border-rose-800">
            {txt.badge}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {txt.title}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            {txt.subtitle}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {txt.problems.map((prob, idx) => {
            const Icon = prob.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-600 transition-all space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-100/70 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 flex items-center justify-center border border-rose-200 dark:border-rose-800">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  {prob.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {prob.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default ProblemSection;
