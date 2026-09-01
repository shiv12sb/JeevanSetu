"use client";

import React from "react";
import { Package, AlertTriangle, Stethoscope, RefreshCw } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const PHC_CONTENT = {
  en: {
    badge: "Facility Logistics & Intelligence",
    title: "Strengthening Primary Health Centres from within",
    subtitle: "Giving medical officers and pharmacists the visibility needed to prevent drug shortages and track local consultations.",
    features: [
      {
        icon: Package,
        title: "Daily Medicine Stock Auditing",
        desc: "Real-time stock balance updating upon dispense, ensuring stock counts always match physical shelf counts.",
      },
      {
        icon: AlertTriangle,
        title: "Dynamic Depletion Forecasting",
        desc: "Instant burn-rate calculation (Current Stock ÷ Average Daily Usage). Triggers visual badges when supply drops under 3 to 5 days.",
      },
      {
        icon: Stethoscope,
        title: "Doctor Attendance & Check-In",
        desc: "Transparent logging of duty medical officers and consultation hours, improving service visibility across the district.",
      },
      {
        icon: RefreshCw,
        title: "One-Click Sub-Depot Reorders",
        desc: "Auto-generates standardized medicine requisition indent slips for District Health Warehouses before stockouts occur.",
      },
    ],
  },
  hi: {
    badge: "प्राथमिक स्वास्थ्य केंद्र रसद एवं निगरानी",
    title: "प्राथमिक स्वास्थ्य केंद्रों (PHC) को भीतर से सशक्त बनाना",
    subtitle: "चिकित्सा अधिकारियों और फार्मासिस्टों को दवाओं की कमी रोकने और दैनिक जांच ट्रैक करने के लिए पूर्ण डिजिटल सुविधा।",
    features: [
      {
        icon: Package,
        title: "दैनिक दवा स्टॉक ऑडिट",
        desc: "दवा वितरण के साथ ही स्टॉक का वास्तविक समय में स्वतः अपडेट ताकि रिकॉर्ड और वास्तविक संख्या हमेशा बराबर रहे।",
      },
      {
        icon: AlertTriangle,
        title: "खपत दर एवं तुटवड़ा पूर्व-सूचना",
        desc: "दैनिक औसत खपत के आधार पर गणना। 3 से 5 दिनों से कम स्टॉक होने पर स्वतः अलर्ट जारी होता है।",
      },
      {
        icon: Stethoscope,
        title: "डॉक्टर उपस्थिति एवं ड्यूटी समय",
        desc: "ऑन-ड्यूटी चिकित्सा अधिकारियों और परामर्श घंटों का पारदर्शी रिकॉर्ड, जिससे नागरिकों को डॉक्टर उपलब्धता पता रहे।",
      },
      {
        icon: RefreshCw,
        title: "1-क्लिक दवा मांग पत्र (Indent)",
        desc: "स्टॉक खत्म होने से पहले ही जिला मुख्य दवा भंडार के लिए स्वचालित मांग पत्र तैयार करने की सुविधा।",
      },
    ],
  },
  mr: {
    badge: "आरोग्य केंद्र पुरवठा व संनियंत्रण",
    title: "प्राथमिक आरोग्य केंद्रांना (PHC) प्रत्यक्ष सक्षम करणे",
    subtitle: "वैद्यकीय अधिकारी आणि औषधनिर्मात्यांना औषधांचा तुटवडा रोखण्यासाठी व तपासण्यांची नोंद ठेवण्यासाठी डिजिटल सहाय्य.",
    features: [
      {
        icon: Package,
        title: "दैनंदिन औषध साठा तपासणी",
        desc: "औषध वाटप होताच साठ्याची तात्काळ डिजिटल नोंद, जेणेकरून साठा नोंदवही आणि प्रत्यक्ष साठ्यात तफावत राहत नाही.",
      },
      {
        icon: AlertTriangle,
        title: "साठा खप दर व तुटवडा पूर्व-सूचना",
        desc: "दैनिक सरासरी खपाच्या आधारे गणना. ३ ते ५ दिवसांपेक्षा कमी साठा उरल्यास तात्काळ इशारा मिळतो.",
      },
      {
        icon: Stethoscope,
        title: "वैद्यकीय अधिकारी उपस्थिती नोंद",
        desc: "ड्यूटीवरील डॉक्टर व तपासणी वेळेची पारदर्शक नोंद, जेणेकरून नागरिकांना डॉक्टर उपलब्धतेची अचूक माहिती मिळते.",
      },
      {
        icon: RefreshCw,
        title: "१-क्लिक औषध मागणी पत्रक",
        desc: "साठा संपण्यापूर्वीच जिल्हा औषध गोदामासाठी स्वयंचलित अधिकृत मागणी पत्रक (Indent) तयार करण्याची सुविधा.",
      },
    ],
  },
};

export function PhcCapabilitiesSection() {
  const { language } = useLanguage();
  const txt = PHC_CONTENT[language] || PHC_CONTENT.en;

  return (
    <section className="py-20 relative bg-slate-50/50 dark:bg-slate-950/60 border-b border-slate-200/80 dark:border-white/10 overflow-hidden transition-colors duration-300">
      {/* Ambient background lighting */}
      <div className="absolute top-1/2 right-1/3 w-[500px] h-[300px] bg-teal-500/5 blur-[120px] rounded-full pointer-events-none -z-0" />

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

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {txt.features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-lg shadow-slate-200/50 dark:shadow-none hover:border-teal-500/40 hover:shadow-xl hover:shadow-teal-500/5 transition-all duration-300 space-y-4 group"
              >
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-500/20 group-hover:scale-105 group-hover:bg-teal-500/20 transition-all duration-300">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug group-hover:text-teal-600 dark:group-hover:text-teal-300 transition-colors">
                  {feat.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default PhcCapabilitiesSection;
