"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { useLanguage } from "@/context/LanguageContext";
import {
  HeartPulse,
  Baby,
  ShieldAlert,
  Apple,
  AlertOctagon,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  PhoneCall,
  Activity,
  Droplets,
  Volume2,
  BookOpen,
} from "lucide-react";
import Link from "next/link";

export function HealthAwarenessPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [playingTopicId, setPlayingTopicId] = useState(null);
  const { language, t } = useLanguage();

  const categories = [
    { id: "all", label: "All Health Topics" },
    { id: "maternal", label: "Maternal & Child Care" },
    { id: "chronic", label: "Hypertension & Diabetes" },
    { id: "seasonal", label: "Seasonal Infections & Water Safety" },
    { id: "emergency", label: "When to Seek Urgent Care" },
  ];

  const topics = [
    {
      id: "top-1",
      category: "maternal",
      titleEn: "Antenatal Checkups & Anemia Prevention",
      titleHi: "गर्भावस्था में जांच और खून की कमी से बचाव",
      titleMr: "गरोदरपणातील तपासणी व रक्तक्षय प्रतिबंध",
      icon: Baby,
      badge: "Maternal Health",
      badgeVariant: "teal",
      summaryEn: "Regular antenatal visits at the local PHC/Sub-Centre ensure healthy maternal and fetal development.",
      summaryHi: "प्राथमिक स्वास्थ्य केंद्र पर नियमित प्रसवपूर्व जांच से मां और बच्चे दोनों का स्वास्थ्य सुरक्षित रहता है।",
      summaryMr: "प्राथमिक आरोग्य केंद्रातील नियमित तपासणीमुळे माता व बाळाचे आरोग्य सुरक्षित राहते.",
      points: [
        "Attend at least 4 scheduled ANC checkups during pregnancy.",
        "Take prescribed Iron & Folic Acid (IFA) supplements with clean water to prevent severe anemia.",
        "Ensure institutional delivery registration under JSSK for free transport and cashless delivery.",
      ],
      warning: "Seek immediate hospital care if severe headache, blurred vision, or sudden swelling occurs.",
    },
    {
      id: "top-2",
      category: "chronic",
      titleEn: "Understanding Blood Pressure (Hypertension)",
      titleHi: "उच्च रक्तचाप और नियमित जांच का महत्व",
      titleMr: "उच्च रक्तदाब आणि नियमित तपासणीचे महत्त्व",
      icon: Activity,
      badge: "NCD Management",
      badgeVariant: "info",
      summaryEn: "Hypertension is often called a silent condition because it develops without obvious early symptoms.",
      summaryHi: "उच्च रक्तचाप अक्सर बिना स्पष्ट लक्षणों के बढ़ता है, इसलिए हर महीने बीपी की जांच अवश्य करवाएं।",
      summaryMr: "उच्च रक्तदाबाची सुरुवातीला लक्षणे दिसत नाहीत, म्हणून दरमहा तपासणी करणे अत्यंत आवश्यक आहे.",
      points: [
        "Get your blood pressure checked once every month at the nearest PHC.",
        "Reduce high dietary salt intake and avoid tobacco products.",
        "Never stop antihypertensive medicines abruptly without a doctor's instruction.",
      ],
      warning: "Chest tightness, sudden shortness of breath, or radiating arm pain require immediate 108 emergency escalation.",
    },
    {
      id: "top-3",
      category: "seasonal",
      titleEn: "Monsoon Precautions & Clean Drinking Water",
      titleHi: "मौसम में पानी की शुद्धता और बुखार से बचाव",
      titleMr: "पावसाळ्यातील साथीचे आजार व पिण्याचे शुद्ध पाणी",
      icon: Droplets,
      badge: "Infection Control",
      badgeVariant: "success",
      summaryEn: "Waterborne infections and mosquito-borne fevers are common during monsoon and post-harvest seasons.",
      summaryHi: "दूषित पानी और मच्छरों से फैलने वाले बुखार से बचने के लिए पानी उबालकर पिएं और घर के आसपास पानी न जमने दें।",
      summaryMr: "पाण्यामुळे होणारे संसर्ग आणि डासांमुळे होणारा ताप टाळण्यासाठी पाणी उकळून प्यावे.",
      points: [
        "Boil drinking water or use chlorinated water provided by gram panchayats.",
        "Prevent stagnant water accumulation near homes to avoid mosquito breeding.",
        "Use Oral Rehydration Salts (ORS) immediately at the onset of diarrheal symptoms.",
      ],
      warning: "High fever with chills, body rash, or persistent vomiting should be examined at the PHC promptly.",
    },
    {
      id: "top-4",
      category: "emergency",
      titleEn: "Recognizing Critical Emergency Red Flags",
      titleHi: "आपातकालीन खतरे के लक्षण और 108 की मदद",
      titleMr: "तातडीच्या धोक्याची लक्षणे व १०८ ची मदत",
      icon: AlertOctagon,
      badge: "Emergency Guidance",
      badgeVariant: "danger",
      summaryEn: "Certain clinical signs require instant emergency transport to a secondary or tertiary civil hospital.",
      summaryHi: "गंभीर लक्षणों जैसे सांस लेने में भारी तकलीफ या बेहोशी की स्थिति में तुरंत 108 एम्बुलेंस बुलाएं।",
      summaryMr: "श्वास घेण्यास प्रचंड त्रास किंवा बेशुद्ध पडल्यास ताबडतोब १०८ रुग्णवाहिकेला कॉल करा.",
      points: [
        "Loss of consciousness, sudden facial drooping, or slurred speech (suspected stroke).",
        "Severe breathing difficulty or blue-colored lips/fingernails.",
        "Uncontrolled bleeding, major road trauma, or snakebite emergencies.",
      ],
      warning: "In all life-threatening situations, dial 108 immediately for free emergency ambulance transit.",
    },
  ];

  const filteredTopics = topics.filter((t) => {
    if (activeCategory === "all") return true;
    return t.category === activeCategory;
  });

  const handleListenToggle = (id) => {
    if (playingTopicId === id) {
      setPlayingTopicId(null);
    } else {
      setPlayingTopicId(id);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded border border-teal-200 dark:border-teal-800 flex items-center gap-1">
              <HeartPulse className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              {t("healthAwareness", "Community Health Awareness Hub")}
            </span>
            <Badge variant="teal" size="sm">Preventive Education</Badge>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {t("awarenessHeading", "Rural Healthcare Awareness & Preventive Guidance")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
            {t("awarenessSubheading", "Essential public health information designed to help families recognize symptoms early, practice preventive care, and know when to seek qualified clinical attention. Available in simple text and audio guidance.")}
          </p>
        </div>

        {/* Non-Diagnostic Safety Alert */}
        <Alert variant="safety" className="text-xs py-3">
          <strong>Public Education Notice:</strong> This health awareness portal provides generalized wellness and preventive information. It is not personalized medical advice or clinical diagnosis. Always consult your Primary Health Centre medical officer for diagnostic tests and treatment plans.
        </Alert>

        {/* Category Filter Tabs */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <Tabs
            tabs={categories}
            activeTab={activeCategory}
            onChange={setActiveCategory}
            variant="pills"
          />
        </div>

        {/* Health Topics Grid - Dynamic Pure Single Language */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTopics.map((topic) => {
            const Icon = topic.icon;
            const isPlaying = playingTopicId === topic.id;
            const displayTitle = language === "hi" ? topic.titleHi : language === "mr" ? topic.titleMr : topic.titleEn;
            const displaySummary = language === "hi" ? topic.summaryHi : language === "mr" ? topic.summaryMr : topic.summaryEn;

            return (
              <Card key={topic.id} className="hover:border-teal-300 dark:hover:border-teal-600 transition-all flex flex-col justify-between shadow-2xs">
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center border border-teal-100 dark:border-teal-800 shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <Badge variant={topic.badgeVariant} size="sm">{topic.badge}</Badge>
                        <CardTitle className="text-base text-slate-900 dark:text-white mt-1">{displayTitle}</CardTitle>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-5 space-y-3.5 flex-1 text-xs">
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{displaySummary}</p>

                  <div className="space-y-1.5 pt-1">
                    <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px] block">
                      Recommended Preventive Actions:
                    </span>
                    <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                      {topic.points.map((pt, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-teal-600 dark:text-teal-400 font-bold leading-none mt-0.5">•</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {topic.warning && (
                    <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 rounded-lg border border-rose-100 dark:border-rose-800 text-rose-900 dark:text-rose-200 font-medium">
                      ⚠️ <strong>Red Flag:</strong> {topic.warning}
                    </div>
                  )}

                  {/* Simulated Audio Mode */}
                  {isPlaying && (
                    <div className="p-3 bg-teal-50 dark:bg-teal-950/60 rounded-xl border border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-200 flex items-center gap-2 animate-pulse">
                      <Volume2 className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                      <span className="text-[11px] font-semibold">
                        Playing audio guidance for "{displayTitle}"...
                      </span>
                    </div>
                  )}

                  {/* Actions: Read & Listen Buttons */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleListenToggle(topic.id)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isPlaying
                          ? "bg-teal-600 text-white border-teal-600"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{isPlaying ? t("stopAudio", "Stop Audio") : t("listenAudio", "Listen Audio")}</span>
                    </button>

                    <Link href="/resources">
                      <Button size="sm" variant="ghost" className="text-xs text-teal-700 dark:text-teal-400 font-semibold gap-1">
                        <span>Find Clinic</span>
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Resource Link Bar */}
        <div className="p-6 bg-linear-to-r from-teal-800 to-slate-900 rounded-2xl text-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-base font-bold">Looking for a verified hospital or doctor?</h4>
            <p className="text-xs text-slate-300">
              Access our accredited directory of district hospitals, maternal wings, and government cashless schemes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/resources">
              <Button size="sm" className="bg-white text-teal-950 hover:bg-teal-50 font-bold gap-1.5 text-xs">
                <span>Explore Directory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default HealthAwarenessPage;
