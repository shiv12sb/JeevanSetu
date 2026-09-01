"use client";

import React from "react";
import {
  Siren,
  Bot,
  Stethoscope,
  Truck,
  Building2,
  GitPullRequest,
  Package,
  FileText,
  ShieldCheck,
  HeartHandshake,
  PhoneOutgoing,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const CAPABILITIES_CONTENT = {
  en: {
    badge: "11 Unified Healthcare Pillars",
    title: "Complete Healthcare Access for Every Citizen & Health Worker",
    subtitle: "Engineered specifically for low-connectivity PHCs, district referral networks, and multi-tier public health administrators.",
    capabilities: [
      {
        icon: Siren,
        title: "1. 24x7 Emergency 108 Dispatch",
        desc: "Direct link to national ambulance hotline and district emergency response dispatchers.",
        badge: "Critical 24x7",
      },
      {
        icon: Bot,
        title: "2. Multilingual AI Voice Assistant",
        desc: "Interactive conversational guidance in Marathi, Hindi & English for symptoms and schemes.",
        badge: "Voice & Chat",
      },
      {
        icon: Stethoscope,
        title: "3. Verified Doctor Registry (MMC)",
        desc: "Maharashtra Medical Council verified practitioners with live duty status and qualifications.",
        badge: "100% Genuine",
      },
      {
        icon: Truck,
        title: "4. Live Ambulance Fleet Tracking",
        desc: "Real-time GPS ambulance coordination with ETA, crew details, and direct reception contact.",
        badge: "Live Telemetry",
      },
      {
        icon: Building2,
        title: "5. Healthcare Facilities & PHCs",
        desc: "Comprehensive directory of 24x7 Primary Health Centres, anti-snake venom depots & civil hospitals.",
        badge: "Check Travel Status",
      },
      {
        icon: GitPullRequest,
        title: "6. Multi-Stage Referral Tracking",
        desc: "End-to-end transparency: Created → Accepted → Hospital Reached → Treatment Started → Completed.",
        badge: "SLA Monitored",
      },
      {
        icon: Package,
        title: "7. DVDMS Medicine Stock & Alerts",
        desc: "Real-time tracking of essential drugs with automated depletion warnings before stockouts occur.",
        badge: "Supply Chain",
      },
      {
        icon: FileText,
        title: "8. ABDM Health Records & Cases",
        desc: "Structured case sheets capturing symptoms, vitals, lab reports, and longitudinal health history.",
        badge: "ABDM Compliant",
      },
      {
        icon: ShieldCheck,
        title: "9. PM-JAY & MJPJAY Free Schemes",
        desc: "Cashless government hospitalization benefits verified before patient travels to apex hospitals.",
        badge: "Cashless Health",
      },
      {
        icon: HeartHandshake,
        title: "10. Community & Organ Donation",
        desc: "Organ donation awareness, maternal health guidance, and seasonal epidemic prevention hubs.",
        badge: "Public Health",
      },
      {
        icon: PhoneOutgoing,
        title: "11. Rural Keypad Phone Voice & ASHA",
        desc: "Automated Toll-Free 1800-108-102 voice helpline and direct ASHA worker home visit dispatch queue.",
        badge: "Zero Internet",
      },
    ],
  },
  hi: {
    badge: "11 एकीकृत स्वास्थ्य सेवाएं",
    title: "हर नागरिक और स्वास्थ्य कार्यकर्ता के लिए संपूर्ण स्वास्थ्य पहुंच",
    subtitle: "कमजोर इंटरनेट वाले प्राथमिक स्वास्थ्य केंद्रों, जिला रेफरल नेटवर्क और स्वास्थ्य अधिकारियों के लिए विशेष रूप से निर्मित।",
    capabilities: [
      {
        icon: Siren,
        title: "1. 24x7 आपातकालीन 108 एम्बुलेंस",
        desc: "राष्ट्रीय आपातकालीन एम्बुलेंस हेल्पलाइन और जिला आपातकालीन प्रतिक्रिया प्रणालियों से सीधा संपर्क।",
        badge: "24x7 आपातकालीन",
      },
      {
        icon: Bot,
        title: "2. बहुभाषी AI वॉयस स्वास्थ्य सहायक",
        desc: "मराठी, हिंदी और अंग्रेजी में लक्षणों और सरकारी स्वास्थ्य योजनाओं पर संवादात्मक मार्गदर्शन।",
        badge: "वॉयस और चैट",
      },
      {
        icon: Stethoscope,
        title: "3. सत्यापित डॉक्टर निर्देशिका (MMC Verified)",
        desc: "महाराष्ट्र मेडिकल काउंसिल द्वारा सत्यापित डॉक्टर, उनकी विशेषज्ञता और लाइव ड्यूटी स्थिति।",
        badge: "100% प्रामाणिक",
      },
      {
        icon: Truck,
        title: "4. लाइव एम्बुलेंस ट्रैकिंग (GPS Live)",
        desc: "रीयल-टाइम जीपीएस ट्रैकिंग, पहुंचने का सटीक समय (ETA), ड्राइवर विवरण और फोन संपर्क।",
        badge: "लाइव ट्रैकिंग",
      },
      {
        icon: Building2,
        title: "5. प्राथमिक स्वास्थ्य केंद्र एवं अस्पताल",
        desc: "24x7 प्राथमिक स्वास्थ्य केंद्र, सर्पदंश रोधी दवा (ASV) डिपो और विशेषज्ञ डॉक्टरों की उपस्थिति।",
        badge: "यात्रा पूर्व जांचें",
      },
      {
        icon: GitPullRequest,
        title: "6. चरणबद्ध रेफरल ट्रैकिंग",
        desc: "रेफरल बनने से लेकर अस्पताल पहुंचने और उपचार पूर्ण होने तक संपूर्ण पारदर्शिता।",
        badge: "समयबद्ध निगरानी",
      },
      {
        icon: Package,
        title: "7. DVDMS आवश्यक दवा स्टॉक एवं अलर्ट",
        desc: "जरूरी दवाओं का रीयल-टाइम स्टॉक और दवा समाप्त होने से 5 दिन पूर्व स्वचालित चेतावनी।",
        badge: "दवा आपूर्ति",
      },
      {
        icon: FileText,
        title: "8. ABDM स्वास्थ्य रिकॉर्ड एवं केस फाइल",
        desc: "मरीजों के लक्षण, जांच रिपोर्ट और पिछली बीमारियों का डिजिटल स्वास्थ्य इतिहास।",
        badge: "डिजिटल रिकॉर्ड",
      },
      {
        icon: ShieldCheck,
        title: "9. PM-JAY एवं महात्मा फुले जन आरोग्य योजना",
        desc: "मुफ्त एवं कैशलेस इलाज की पात्रता जांचें और जिला अस्पतालों में बिना परेशानी भर्ती हों।",
        badge: "मुफ्त उपचार",
      },
      {
        icon: HeartHandshake,
        title: "10. सामुदायिक स्वास्थ्य एवं अंगदान",
        desc: "मातृ एवं शिशु स्वास्थ्य, अंगदान प्रतिज्ञा और मौसमी बीमारियों से बचाव की संपूर्ण जानकारी।",
        badge: "जन स्वास्थ्य",
      },
      {
        icon: PhoneOutgoing,
        title: "11. कीपैड फोन वॉयस कॉल एवं आशा कार्यकर्ता",
        desc: "टोल-फ्री 1800-108-102 से स्वचालित वॉयस कॉल और गांव की आशा कार्यकर्ता द्वारा घर पर सहायता।",
        badge: "बिना इंटरनेट सेवा",
      },
    ],
  },
  mr: {
    badge: "११ एकात्मिक आरोग्य सेवा",
    title: "प्रत्येक नागरिक आणि आरोग्य सेवकांसाठी परिपूर्ण आरोग्य पोहोच",
    subtitle: "कमी कनेक्टिव्हिटी असलेल्या प्राथमिक आरोग्य केंद्र (PHC), जिल्हा रेफरल नेटवर्क आणि आरोग्य प्रशासनासाठी विशेष निर्मिती.",
    capabilities: [
      {
        icon: Siren,
        title: "१. २४ तास आपत्कालीन १०८ रुग्णवाहिका",
        desc: "राष्ट्रीय आपत्कालीन रुग्णवाहिका हेल्पलाइन आणि जिल्हा आपत्ती नियंत्रण कक्षाशी थेट संपर्क.",
        badge: "आपत्कालीन २४x७",
      },
      {
        icon: Bot,
        title: "२. बहुभाषिक AI व्हॉईस आरोग्य सहाय्यक",
        desc: "मराठी, हिंदी आणि इंग्रजीमध्ये आरोग्याच्या प्रश्नांवर spoken मार्गदर्शन व योजनांची माहिती.",
        badge: "व्हॉईस व चॅट",
      },
      {
        icon: Stethoscope,
        title: "३. प्रमाणित डॉक्टर सूची (MMC Verified)",
        desc: "महाराष्ट्र मेडिकल कौन्सिल नोंदणीकृत डॉक्टर, पात्रता आणि ऑन-ड्युटी स्थिती.",
        badge: "१००% अधिकृत",
      },
      {
        icon: Truck,
        title: "४. थेट रुग्णवाहिका ट्रॅकिंग (Live GPS)",
        desc: "रुग्णवाहिकेचे लाईव्ह स्थान, चालकाचा फोन नंबर आणि पोहोचण्याची अचूक वेळ.",
        badge: "लाईव्ह जीपीएस",
      },
      {
        icon: Building2,
        title: "५. प्राथमिक आरोग्य केंद्र व रुग्णालये (PHC)",
        desc: "२४ तास प्रसूती सुविधा, सर्पदंश लस (ASV) साठा आणि तज्ज्ञ डॉक्टरांचे वेळापत्रक.",
        badge: "प्रवासापूर्वी तपासा",
      },
      {
        icon: GitPullRequest,
        title: "६. टप्प्याटप्प्याने रेफरल ट्रॅकिंग",
        desc: "रेफरल तयार करण्यापासून ते रुग्णालय प्रवेश आणि उपचार पूर्ण होईपर्यंत थेट माहिती.",
        badge: "पारदर्शक ट्रॅकिंग",
      },
      {
        icon: Package,
        title: "७. DVDMS औषध साठा व स्वयंचलित सूचना",
        desc: "आवश्यक औषधांचा थेट साठा आणि तुटवडा निर्माण होण्यापूर्वी ५ दिवस आधी सतर्कता इशारा.",
        badge: "औषध साठा",
      },
      {
        icon: FileText,
        title: "८. ABDM डिजिटल आरोग्य नोंदी",
        desc: "रुग्णांची लक्षणे, तपासण्या, वैद्यकीय अहवाल आणि मागील आजारांचा संपूर्ण इतिहास.",
        badge: "डिजिटल नोंदी",
      },
      {
        icon: ShieldCheck,
        title: "९. PM-JAY व महात्मा फुले जन आरोग्य योजना",
        desc: "मोफत व कॅशलेस उपचारांची खात्री आणि मोठ्या रुग्णालयात जाण्यापूर्वी पात्रता पडताळणी.",
        badge: "मोफत उपचार",
      },
      {
        icon: HeartHandshake,
        title: "१०. जन-आरोग्य व अवयवदान जागृती",
        desc: "माता व बाल संगोपन, अवयवदान प्रतिज्ञा आणि हंगामी साथीच्या आजारांपासून बचावाचे मार्गदर्शन.",
        badge: "जन आरोग्य",
      },
      {
        icon: PhoneOutgoing,
        title: "११. कीपॅड फोन व्हॉईस कॉल व आशा सेविका",
        desc: "टोल-फ्री १८००-१०८-१०२ वरून कॉल आणि गावातील आशा सेविकेकडून घरपोच तपासणी नोंद.",
        badge: "इंटरनेटशिवाय सेवा",
      },
    ],
  },
};

export function CapabilitiesSection() {
  const { language } = useLanguage();
  const content = CAPABILITIES_CONTENT[language] || CAPABILITIES_CONTENT.mr || CAPABILITIES_CONTENT.en;

  return (
    <section className="py-16 sm:py-20 bg-slate-50 dark:bg-[#070a13] border-b border-slate-200/80 dark:border-white/10 relative overflow-hidden transition-colors duration-300">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 right-10 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 dark:bg-teal-500/15 border border-teal-500/20 dark:border-teal-500/30 text-teal-800 dark:text-teal-300 text-xs font-bold shadow-xs backdrop-blur-md">
            <span>{content.badge}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {content.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {content.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {content.capabilities.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-lg shadow-slate-200/50 dark:shadow-none hover:border-teal-400/50 hover:bg-slate-50 dark:hover:bg-slate-900/80 hover:shadow-xl hover:shadow-teal-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-4 text-left group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/25 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-mono border border-slate-200 dark:border-white/10">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.desc}
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

export default CapabilitiesSection;
