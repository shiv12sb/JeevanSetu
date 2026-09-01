"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const AI_AUTOMATION_CONTENT = {
  en: {
    badge: "Responsible AI & Automation",
    title: "How JeevanSetu uses AI with strict safety guardrails",
    subtitle: "AI is deployed as a coordination assistant, never as an ungrounded medical diagnostic authority.",
    points: [
      {
        title: "Grounded Context Retrieval",
        desc: "AI models never hallucinate hospital names or government aid numbers. Recommendations are strictly retrieved from verified registry records via secure backend filtering.",
      },
      {
        title: "Structured Outputs & Validation",
        desc: "All AI responses are schema-validated with explicit confidence scores, matched reasons, and actionable next steps before display.",
      },
      {
        title: "Deterministic Stock Prediction",
        desc: "Medicine depletion warnings start with deterministic formula (Current Stock ÷ Average Daily Usage) to guarantee 100% transparency without black-box bias.",
      },
      {
        title: "Automated Escalation Workflows",
        desc: "Integrated background notifications (SMS, WhatsApp, and n8n webhooks) trigger alerts for low stock thresholds and pending referral acknowledgments.",
      },
    ],
  },
  hi: {
    badge: "जिम्मेदार एआई एवं स्वचालन",
    title: "जीवनसेतु कैसे सख्त सुरक्षा नियमों के साथ एआई का उपयोग करता है",
    subtitle: "एआई को केवल समन्वय और सूचना सहायक के रूप में उपयोग किया जाता है, कभी भी डॉक्टरी नुस्खे या निदान के विकल्प के रूप में नहीं।",
    points: [
      {
        title: "सत्यापित डेटा पर आधारित खोज",
        desc: "एआई मॉडल कभी भी मनगढ़ंत अस्पताल या योजनाएं नहीं बताता। सभी सुझाव केवल सत्यापित सरकारी स्वास्थ्य डायरेक्टरी से आते हैं।",
      },
      {
        title: "सत्यापित एवं सुरक्षित परिणाम",
        desc: "सभी एआई उत्तरों का डेटाबेस सत्यापन, स्पष्ट कारण और अगले आवश्यक कदमों के साथ पारदर्शी प्रदर्शन किया जाता है।",
      },
      {
        title: "पारदर्शी दवा स्टॉक भविष्यवाणी",
        desc: "दवा खत्म होने की चेतावनी गणितीय सूत्र (वर्तमान स्टॉक ÷ दैनिक औसत खपत) द्वारा पारदर्शी रूप से तय होती है।",
      },
      {
        title: "स्वचालित अलर्ट एवं फॉलो-अप",
        desc: "कम स्टॉक या लंबित रेफरल पर तुरंत संबंधित नोडल अधिकारी को एसएमएस व स्वचालित चेतावनी भेजी जाती है।",
      },
    ],
  },
  mr: {
    badge: "जबाबदार एआय व ऑटोमेशन",
    title: "जीवनसेतू सुरक्षित नियमावलीसह एआयचा कसा वापर करतो",
    subtitle: "एआयचा वापर केवळ समन्वय व मार्गदर्शक सहाय्यक म्हणून केला जातो, थेट वैद्यकीय उपचारासाठी नाही.",
    points: [
      {
        title: "प्रमाणित माहितीवर आधारित शोध",
        desc: "एआय कोणतीही चुकीची रुग्णालये किंवा योजनांची माहिती देत नाही. सर्व शिफारसी केवळ शासकीय प्रमाणित नोंदवहीतूनच येतात.",
      },
      {
        title: "संरचित व सुरक्षित निष्कर्ष",
        desc: "सर्व एआय शिफारसी तपासल्या जातात आणि रुग्णाला स्पष्ट कारणे व पुढील पायऱ्या सोप्या भाषेत दाखवल्या जातात.",
      },
      {
        title: "पारदर्शक औषध साठा अंदाज",
        desc: "औषध संपण्याची पूर्व-सूचना पारदर्शक गणितावर (सध्याचा साठा ÷ दैनिक सरासरी वापर) आधारित असते.",
      },
      {
        title: "स्वयंचलित पाठपुरावा व अलर्ट",
        desc: "औषधांचा तुटवडा किंवा प्रलंबित संदर्भ असल्यास संबंधित अधिकाऱ्यांना तात्काळ एसएमएस व सूचना पाठवल्या जातात.",
      },
    ],
  },
};

export function AiAutomationSection() {
  const { language } = useLanguage();
  const txt = AI_AUTOMATION_CONTENT[language] || AI_AUTOMATION_CONTENT.en;

  return (
    <section className="py-20 relative bg-slate-100/60 dark:bg-slate-950/60 border-b border-slate-200/80 dark:border-white/10 overflow-hidden transition-colors duration-300">
      {/* Ambient background lighting */}
      <div className="absolute top-1/2 left-1/3 w-[500px] h-[300px] bg-sky-500/5 blur-[120px] rounded-full pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300 bg-sky-500/10 px-3.5 py-1.5 rounded-full border border-sky-500/20 backdrop-blur-md shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-600 dark:bg-sky-400 animate-pulse" />
            {txt.badge}
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            {txt.title}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
            {txt.subtitle}
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-6">
          {txt.points.map((pt, idx) => (
            <div
              key={idx}
              className="p-6 bg-white dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-lg shadow-slate-200/50 dark:shadow-none flex items-start gap-4 hover:border-sky-500/40 hover:shadow-xl hover:shadow-sky-500/10 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/20 group-hover:scale-105 group-hover:bg-sky-500/20 transition-all duration-300">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-300 transition-colors">
                  {pt.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {pt.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default AiAutomationSection;
