"use client";

import React from "react";
import {
  FileText,
  Building2,
  Sparkles,
  GitPullRequest,
  Package,
  TrendingDown,
  Activity,
  ShieldCheck,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const CAPABILITIES_CONTENT = {
  en: {
    badge: "Enterprise Public Health Stack",
    title: "Complete Capabilities Built for Rural Healthcare Realities",
    subtitle: "Engineered specifically for low-connectivity PHCs, district referral networks, and multi-tier public health administrators.",
    capabilities: [
      {
        icon: FileText,
        title: "Patient Healthcare Cases",
        desc: "Structured case records capturing symptoms, vital observations, uploaded lab documents, and longitudinal consultation history.",
      },
      {
        icon: Building2,
        title: "Verified Resource Registry",
        desc: "Up-to-date directory of accredited government hospitals, private empaneled clinics, state/national schemes, and verified NGOs.",
      },
      {
        icon: Sparkles,
        title: "AI-Assisted Grounded Matching",
        desc: "Context-aware recommendations grounded in verified facility registries with explicit reasoning and safety boundaries.",
      },
      {
        icon: GitPullRequest,
        title: "6-Stage Referral Tracking",
        desc: "Complete visibility: Created → Notified → Accepted → Hospital Reached → Treatment Started → Completed with SLA status updates.",
      },
      {
        icon: Package,
        title: "PHC Medicine Inventory",
        desc: "Real-time tracking of essential drug stock levels across primary health centers with supplier and batch auditing.",
      },
      {
        icon: TrendingDown,
        title: "Stock Depletion Warnings",
        desc: "Automated depletion alerts calculated from current stock and average daily usage, enabling proactive reorders before stockouts.",
      },
      {
        icon: Activity,
        title: "PHC Service Monitoring",
        desc: "Facility-level activity monitoring, doctor attendance check-ins, and daily patient visit logs for district administrative review.",
      },
      {
        icon: ShieldCheck,
        title: "Admin Anomaly & Alert Hub",
        desc: "Centralized intelligence for district health officers to investigate referral bottlenecks, inventory deficits, and service variances.",
      },
    ],
  },
  hi: {
    badge: "सार्वजनिक स्वास्थ्य तकनीकी मंच",
    title: "ग्रामीण स्वास्थ्य व्यवस्था के लिए पूर्ण व सशक्त समाधान",
    subtitle: "कमजोर इंटरनेट वाले प्राथमिक स्वास्थ्य केंद्रों, जिला रेफरल नेटवर्क और स्वास्थ्य अधिकारियों के लिए विशेष रूप से निर्मित।",
    capabilities: [
      {
        icon: FileText,
        title: "मरीज स्वास्थ्य केस प्रबंधन",
        desc: "लक्षण, प्राथमिक जांच, ब्लड प्रेशर/ऑक्सीजन और मेडिकल पर्चियों का सुरक्षित डिजिटल रिकॉर्ड।",
      },
      {
        icon: Building2,
        title: "सत्यापित अस्पताल निर्देशिका",
        desc: "महाराष्ट्र के सभी 36 जिलों के सरकारी अस्पताल, आईसीयू बेड, उपस्थित डॉक्टर और मान्यता प्राप्त एनजीओ सूची।",
      },
      {
        icon: Sparkles,
        title: "सत्यापित एआई मिलान",
        desc: "मरीज की स्थिति के आधार पर सही अस्पताल, मुफ्त सरकारी योजनाएं (PM-JAY) और एम्बुलेंस सहायता का सटीक सुझाव।",
      },
      {
        icon: GitPullRequest,
        title: "6-चरणीय रेफरल ट्रैकिंग",
        desc: "रेफरल बनने से लेकर बेड कन्फर्मेशन, अस्पताल आगमन और इलाज पूरा होने तक का पारदर्शी लाइव ट्रैक।",
      },
      {
        icon: Package,
        title: "पीएचसी दवा स्टॉक निगरानी",
        desc: "प्राथमिक स्वास्थ्य केंद्रों पर आवश्यक आपातकालीन और मातृ दवाओं के स्टॉक का वास्तविक समय में संधारण।",
      },
      {
        icon: TrendingDown,
        title: "दवा तुटवड़ा पूर्व-चेतावनी",
        desc: "स्टॉक खत्म होने से 5 दिन पहले ही दैनिक खपत के आधार पर स्वचालित री-ऑर्डर और अलर्ट सिस्टम।",
      },
      {
        icon: Activity,
        title: "स्वास्थ्य केंद्र सेवा संनियंत्रण",
        desc: "डॉक्टर उपस्थिति, दैनिक ओपीडी मरीज संख्या और स्वास्थ्य केंद्र की कार्यप्रणाली की पारदर्शी निगरानी।",
      },
      {
        icon: ShieldCheck,
        title: "प्रशासकीय अलर्ट एवं नियंत्रण केंद्र",
        desc: "जिला स्वास्थ्य अधिकारियों के लिए रेफरल रुकावटों और दवा स्टॉक की कमी का विश्लेषण व समाधान।",
      },
    ],
  },
  mr: {
    badge: "सार्वजनिक आरोग्य तंत्रज्ञान व्यासपीठ",
    title: "ग्रामीण आरोग्य व्यवस्थेसाठी संपूर्ण व सक्षम कार्यप्रणाली",
    subtitle: "कमी इंटरनेट कनेक्टिव्हिटी असलेली प्राथमिक आरोग्य केंद्र, जिल्हा संदर्भ रुग्णालये आणि आरोग्य प्रशासनासाठी विशेष निर्मिती.",
    capabilities: [
      {
        icon: FileText,
        title: "रुग्ण आरोग्य केस व्यवस्थापन",
        desc: "लक्षणे, प्राथमिक तपासणी नोंदी, रक्तदाब/ऑक्सिजन आणि वैद्यकीय अहवालांचा सुरक्षित डिजिटल संग्रह.",
      },
      {
        icon: Building2,
        title: "प्रमाणित रुग्णालय निर्देशिका",
        desc: "महाराष्ट्रातील सर्व ३६ जिल्ह्यांतील शासकीय रुग्णालये, खाटा, उपस्थित डॉक्टर व स्वयंसेवी संस्थांची थेट सूची.",
      },
      {
        icon: Sparkles,
        title: "प्रमाणित एआय शिफारस",
        desc: "रुग्णाच्या गरजेनुसार योग्य रुग्णालय, मोफत शासकीय योजना (PM-JAY / म.फुले) आणि रुग्णवाहिकेची अचूक माहिती.",
      },
      {
        icon: GitPullRequest,
        title: "६-टप्प्यांचे पारदर्शक रेफरल",
        desc: "रेफरल नोंदणी, खाट निश्चिती, रुग्ण दाखल होणे ते उपचार पूर्ण होईपर्यंतची पारदर्शक थेट प्रगती.",
      },
      {
        icon: Package,
        title: "आरोग्य केंद्र औषध साठा",
        desc: "प्राथमिक आरोग्य केंद्रांवरील अत्यावश्यक आणि जीवनरक्षक औषध साठ्याचे वास्तविक वेळेत व्यवस्थापन.",
      },
      {
        icon: TrendingDown,
        title: "औषध तुटवडा पूर्व-सूचना",
        desc: "दैनिक खपाच्या आधारे औषध संपण्यापूर्वीच ५ दिवस आधी स्वयंचलित अलर्ट आणि मागणी प्रणाली.",
      },
      {
        icon: Activity,
        title: "आरोग्य केंद्र सेवा संनियंत्रण",
        desc: "वैद्यकीय अधिकारी उपस्थिती, दैनंदिन ओपीडी रुग्ण संख्या आणि सेवा गुणवत्तेचा पारदर्शक आढावा.",
      },
      {
        icon: ShieldCheck,
        title: "प्रशासकीय नियंत्रण व अलर्ट केंद्र",
        desc: "जिल्हा आरोग्य अधिकाऱ्यांसाठी संदर्भ व्यवस्था आणि औषध पुरवठ्यातील अडचणींचे तात्काळ निवारण.",
      },
    ],
  },
};

export function CapabilitiesSection() {
  const { language } = useLanguage();
  const txt = CAPABILITIES_CONTENT[language] || CAPABILITIES_CONTENT.en;

  return (
    <section className="py-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
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

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {txt.capabilities.map((cap, idx) => {
            const Icon = cap.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-600 transition-all space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center border border-teal-100 dark:border-teal-800">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  {cap.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {cap.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default CapabilitiesSection;
