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
    <section className="py-20 relative bg-slate-100/60 dark:bg-slate-950/40 border-b border-slate-200/80 dark:border-white/10 overflow-hidden transition-colors duration-300">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-rose-500/5 dark:bg-rose-500/5 blur-[120px] rounded-full pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 bg-rose-500/10 px-3.5 py-1.5 rounded-full border border-rose-500/20 backdrop-blur-md shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 dark:bg-rose-400 animate-pulse" />
            {txt.badge}
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            {txt.title}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
            {txt.subtitle}
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {txt.problems.map((prob, idx) => {
            const Icon = prob.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-lg shadow-slate-200/50 dark:shadow-none hover:border-rose-500/40 hover:shadow-xl hover:shadow-rose-500/5 transition-all duration-300 space-y-4 group"
              >
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/20 group-hover:scale-105 group-hover:bg-rose-500/20 transition-all duration-300">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug group-hover:text-rose-600 dark:group-hover:text-rose-300 transition-colors">
                  {prob.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
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
