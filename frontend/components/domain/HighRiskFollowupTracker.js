"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/context/LanguageContext";
import {
  Baby,
  HeartPulse,
  Activity,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  Pill,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

const TRACKER_CONTENT = {
  en: {
    headerTitle: "High-Risk Follow-Up & Maternal/Child Health Tracker",
    beneficiaryLabel: "Beneficiary:",
    mcpLabel: "RCH/MCP Card:",
    tabMaternal: "Maternal (ANC/JSSK)",
    tabChild: "Child (Immunization)",
    tabChronic: "Chronic (NCD)",
    statusCompleted: "Completed",
    statusDue: "Due Soon",
    statusUpcoming: "Scheduled",
    statusActive: "Active Treatment",
    schemeSupported: "Scheme Support:",
    nextRefillLabel: "Next Refill Due:",
    lastRefillLabel: "Last Dispensed:",
    complianceLabel: "Health Parameter:",
    emergencyTransitNotice: "Need urgent ambulance for maternal/child emergency? Call 102 / 108 Free Govt Service.",
    callBtn: "Emergency 108",
    maternalMilestones: [
      {
        id: "anc-1",
        title: "1st Trimester ANC (Registration & Td-1)",
        timing: "Within 12 Weeks",
        status: "completed",
        date: "14 Jan 2026",
        details: "Blood grouping, Hemoglobin (11.2 g/dL), Urine routine, and Folic Acid tablets issued.",
        scheme: "PMMVY 1st Installment (₹3,000) Processed",
      },
      {
        id: "anc-2",
        title: "2nd Trimester ANC (Ultrasound & IFA)",
        timing: "14 - 26 Weeks",
        status: "completed",
        date: "18 Feb 2026",
        details: "Anomaly scan verified, Td-2 given, Iron Folic Acid (100 tablets) dispensed.",
        scheme: "Free JSSK Diagnostics at District Civil Hospital",
      },
      {
        id: "anc-3",
        title: "3rd Trimester ANC (High-Risk Screening)",
        timing: "28 - 34 Weeks",
        status: "due",
        date: "Due in 5 Days (04 Mar 2026)",
        details: "BP monitoring (Pre-eclampsia check), Blood Sugar, Fetal Heart Rate check.",
        scheme: "ASHA Home Visit Scheduled",
      },
      {
        id: "anc-4",
        title: "Institutional Delivery & Transit Plan",
        timing: "36 - 40 Weeks",
        status: "upcoming",
        date: "Expected Delivery: 22 Apr 2026",
        details: "Designated Delivery Facility: District Civil Hospital.",
        scheme: "100% Free Delivery, Food, & 102 Ambulance under JSSK",
      },
    ],
    childMilestones: [
      {
        id: "imm-1",
        title: "Birth Dose (BCG, OPV-0, Hepatitis B-0)",
        timing: "At Birth (0-24 hrs)",
        status: "completed",
        date: "Recorded at PHC Delivery",
        details: "Zero-dose polio drops, BCG intradermal injection, and Birth dose Hep-B.",
      },
      {
        id: "imm-2",
        title: "Primary 6-Week Dose (Pentavalent-1, Rota-1, fIPV-1)",
        timing: "6 Weeks",
        status: "completed",
        date: "Administered by ANM Worker",
        details: "Protection against Diphtheria, Pertussis, Tetanus, Hep-B, Hib & Rotavirus diarrhea.",
      },
      {
        id: "imm-3",
        title: "10 & 14-Week Boosters (Pentavalent 2 & 3, PCV)",
        timing: "10 to 14 Weeks",
        status: "due",
        date: "Due Next Routine Immunization Day",
        details: "Pneumococcal Conjugate Vaccine (PCV) booster & oral polio drops.",
      },
      {
        id: "imm-4",
        title: "9-Month Measles-Rubella (MR-1) & Vitamin A",
        timing: "9 Completed Months",
        status: "upcoming",
        date: "Scheduled Oct 2026",
        details: "First dose of MR vaccine with 1 mL Vitamin A oral solution to prevent blindness.",
      },
    ],
    chronicCareItems: [
      {
        id: "chr-1",
        condition: "Hypertension (High BP) Management",
        regimen: "Amlodipine 5mg (1 tablet daily after breakfast)",
        lastRefill: "10 Feb 2026 at PHC",
        nextRefillDue: "10 Mar 2026 (12 Days remaining)",
        compliance: "Good (BP stable at 128/82 mmHg)",
        status: "active",
      },
      {
        id: "chr-2",
        condition: "Type 2 Diabetes Blood Sugar Monitoring",
        regimen: "Metformin 500mg (1 tablet twice daily with meals)",
        lastRefill: "10 Feb 2026 at PHC",
        nextRefillDue: "10 Mar 2026 (12 Days remaining)",
        compliance: "Fasting Blood Sugar: 118 mg/dL",
        status: "active",
      },
    ],
  },
  hi: {
    headerTitle: "उच्च-जोखिम फॉलो-अप एवं मातृ/शिशु स्वास्थ्य ट्रैकर",
    beneficiaryLabel: "लाभार्थी:",
    mcpLabel: "आरसीएच/एमसीपी कार्ड:",
    tabMaternal: "मातृ स्वास्थ्य (ANC/JSSK)",
    tabChild: "शिशु टीकाकरण (Immunization)",
    tabChronic: "दीर्घकालिक रोग (NCD)",
    statusCompleted: "पूर्ण",
    statusDue: "जल्द देय (Due)",
    statusUpcoming: "आगामी निर्धारित",
    statusActive: "सक्रिय उपचार",
    schemeSupported: "योजना सहायता:",
    nextRefillLabel: "अगली दवा तिथि:",
    lastRefillLabel: "पिछली दवा प्राप्त:",
    complianceLabel: "स्वास्थ्य स्थिति:",
    emergencyTransitNotice: "मातृ अथवा शिशु आपातकाल के लिए 102 / 108 निःशुल्क सरकारी एम्बुलेंस पर तुरंत कॉल करें।",
    callBtn: "आपातकाल 108",
    maternalMilestones: [
      {
        id: "anc-1",
        title: "प्रथम तिमाही प्रसवपूर्व जांच (पंजीकरण एवं Td-1)",
        timing: "12 सप्ताह के भीतर",
        status: "completed",
        date: "14 जनवरी 2026",
        details: "रक्त समूह, हीमोग्लोबिन (11.2 g/dL), मूत्र परीक्षण और फोलिक एसिड गोलियां वितरित।",
        scheme: "PMMVY पहली किस्त (₹3,000) स्वीकृत",
      },
      {
        id: "anc-2",
        title: "द्वितीय तिमाही प्रसवपूर्व जांच (अल्ट्रासाउंड एवं IFA)",
        timing: "14 - 26 सप्ताह",
        status: "completed",
        date: "18 फरवरी 2026",
        details: "एनोमली स्कैन सत्यापित, Td-2 दिया गया, आयरन फोलिक एसिड (100 गोलियां) वितरित।",
        scheme: "जिला अस्पताल में निःशुल्क JSSK जांच",
      },
      {
        id: "anc-3",
        title: "तृतीय तिमाही प्रसवपूर्व जांच (उच्च जोखिम स्क्रीनिंग)",
        timing: "28 - 34 सप्ताह",
        status: "due",
        date: "5 दिनों में देय (04 मार्च 2026)",
        details: "रक्तचाप निगरानी (प्री-एक्लेमप्सिया जांच), ब्लड शुगर, भ्रूण हृदय गति जांच।",
        scheme: "आशा कार्यकर्ता गृह भेंट निर्धारित",
      },
      {
        id: "anc-4",
        title: "संस्थागत प्रसव एवं परिवहन योजना",
        timing: "36 - 40 सप्ताह",
        status: "upcoming",
        date: "संभावित प्रसव: 22 अप्रैल 2026",
        details: "निर्धारित प्रसव केंद्र: जिला नागरिक अस्पताल।",
        scheme: "JSSK अंतर्गत 100% निःशुल्क प्रसव, भोजन व 102 एम्बुलेंस",
      },
    ],
    childMilestones: [
      {
        id: "imm-1",
        title: "जन्म खुराक (BCG, OPV-0, हेपेटाइटिस B-0)",
        timing: "जन्म पर (0-24 घंटे)",
        status: "completed",
        date: "पीएचसी प्रसव पर दर्ज",
        details: "शून्य खुराक पोलियो ड्रॉप्स, बीसीजी टीका और हेपेटाइटिस-बी जन्म खुराक।",
      },
      {
        id: "imm-2",
        title: "प्राथमिक 6-सप्ताह खुराक (पेंटावेलेंट-1, रोटा-1, fIPV-1)",
        timing: "6 सप्ताह",
        status: "completed",
        date: "एएनएम कार्यकर्ता द्वारा दिया गया",
        details: "डिप्थीरिया, काली खांसी, टिटनेस, हेप-बी, हिब और रोटावायरस डायरिया से सुरक्षा।",
      },
      {
        id: "imm-3",
        title: "10 और 14-सप्ताह बूस्टर (पेंटावेलेंट 2 व 3, PCV)",
        timing: "10 से 14 सप्ताह",
        status: "due",
        date: "अगले नियमित टीकाकरण दिवस पर",
        details: "न्यूमोकोकल कंजुगेट वैक्सीन (PCV) बूस्टर एवं ओरल पोलियो ड्रॉप्स।",
      },
      {
        id: "imm-4",
        title: "9-माह खसरा-रूबेला (MR-1) एवं विटामिन ए",
        timing: "9 माह पूर्ण होने पर",
        status: "upcoming",
        date: "निर्धारित अक्टूबर 2026",
        details: "एमआर वैक्सीन की पहली खुराक एवं रतौंधी से बचाव हेतु 1 मिली विटामिन ए सिरप।",
      },
    ],
    chronicCareItems: [
      {
        id: "chr-1",
        condition: "उच्च रक्तचाप (High BP) प्रबंधन",
        regimen: "एम्लोडिपिन 5 मिग्रा (नाश्ते के बाद रोजाना 1 गोली)",
        lastRefill: "10 फरवरी 2026 (पीएचसी पर)",
        nextRefillDue: "10 मार्च 2026 (12 दिन शेष)",
        compliance: "संतोषजनक (बीपी 128/82 mmHg पर स्थिर)",
        status: "active",
      },
      {
        id: "chr-2",
        condition: "टाइप 2 मधुमेह (Diabetes) ब्लड शुगर निगरानी",
        regimen: "मेटफॉर्मिन 500 मिग्रा (भोजन के साथ रोजाना 2 बार 1 गोली)",
        lastRefill: "10 फरवरी 2026 (पीएचसी पर)",
        nextRefillDue: "10 मार्च 2026 (12 दिन शेष)",
        compliance: "खाली पेट ब्लड शुगर: 118 mg/dL",
        status: "active",
      },
    ],
  },
  mr: {
    headerTitle: "अति-जोखीम पाठपुरावा व माता/बाल आरोग्य ट्रॅकर",
    beneficiaryLabel: "लाभार्थी:",
    mcpLabel: "आरसीएच/एमसीपी कार्ड:",
    tabMaternal: "माता आरोग्य (ANC/JSSK)",
    tabChild: "बाल लसीकरण (Immunization)",
    tabChronic: "दीर्घकालीन आजार (NCD)",
    statusCompleted: "पूर्ण झाले",
    statusDue: "लवकरच देय",
    statusUpcoming: "नियोजित",
    statusActive: "सक्रिय उपचार",
    schemeSupported: "योजना सहाय्य:",
    nextRefillLabel: "पुढील औषध तारीख:",
    lastRefillLabel: "मागील औषध मिळाले:",
    complianceLabel: "आरोग्य स्थिती:",
    emergencyTransitNotice: "माता किंवा बाल आपत्कालीन सेवेसाठी 102 / 108 मोफत शासकीय रुग्णवाहिकेवर त्वरित कॉल करा.",
    callBtn: "आपत्कालीन 108",
    maternalMilestones: [
      {
        id: "anc-1",
        title: "पहिली तिमाही प्रसूतीपूर्व तपासणी (नोंदणी व Td-1)",
        timing: "१२ आठवड्यांच्या आत",
        status: "completed",
        date: "१४ जानेवारी २०२६",
        details: "रक्तगट, हिमोग्लोबिन (11.2 g/dL), लघवी तपासणी आणि फॉलिक ॲसिड गोळ्यांचे वाटप.",
        scheme: "PMMVY पहिला हप्ता (₹३,०००) जमा",
      },
      {
        id: "anc-2",
        title: "दुसरी तिमाही प्रसूतीपूर्व तपासणी (सोनोग्राफी व IFA)",
        timing: "१४ - २६ आठवडे",
        status: "completed",
        date: "१८ फेब्रुवारी २०२६",
        details: "ॲनोमली स्कॅन तपासणी, Td-2 लस, आयर्न फॉलिक ॲसिड (१०० गोळ्या) वाटप.",
        scheme: "जिल्हा रुग्णालयात मोफत JSSK तपासणी",
      },
      {
        id: "anc-3",
        title: "तिसरी तिमाही प्रसूतीपूर्व तपासणी (अति-जोखीम तपासणी)",
        timing: "२८ - ३४ आठवडे",
        status: "due",
        date: "५ दिवसांत देय (०४ मार्च २०२६)",
        details: "रक्तदाब तपासणी (प्री-एक्लॅम्प्सिया खात्री), रक्तातील साखर, गर्भाच्या हृदयाचे ठोके तपासणी.",
        scheme: "आशा स्वयंसेविकेची गृहभेट नियोजित",
      },
      {
        id: "anc-4",
        title: "संस्थात्मक प्रसूती व वाहतूक नियोजन",
        timing: "३६ - ४० आठवडे",
        status: "upcoming",
        date: "अपेक्षित प्रसूती तारीख: २२ एप्रिल २०२६",
        details: "नियुक्त प्रसूती केंद्र: जिल्हा सामान्य रुग्णालय.",
        scheme: "JSSK अंतर्गत १००% मोफत प्रसूती, आहार व १०२ रुग्णवाहिका",
      },
    ],
    childMilestones: [
      {
        id: "imm-1",
        title: "जन्मावेळचा डोस (BCG, OPV-0, हिपॅटायटिस B-0)",
        timing: "जन्माच्या वेळी (०-२४ तास)",
        status: "completed",
        date: "पीएचसी प्रसूतीवेळी नोंदवले",
        details: "झिरो-डोस पोलिओ थेंब, बीसीजी लस आणि जन्मावेळचा हिपॅटायटिस-बी डोस.",
      },
      {
        id: "imm-2",
        title: "प्राथमिक ६-आठवडे डोस (पेंटाव्हॅलेंट-१, रोटा-१, fIPV-१)",
        timing: "६ आठवडे",
        status: "completed",
        date: "एएनएम परिचारिकाद्वारे देण्यात आले",
        details: "घटसर्प, डांग्या खोकला, धनुर्वात, हिपॅटायटिस-बी आणि रोटाव्हायरसपासून संरक्षण.",
      },
      {
        id: "imm-3",
        title: "१० व १४-आठवडे बूस्टर (पेंटाव्हॅलेंट २ व ३, PCV)",
        timing: "१० ते १४ आठवडे",
        status: "due",
        date: "पुढील नियमित लसीकरण दिवशी देय",
        details: "न्यूमोकोकल लस (PCV) बूस्टर आणि तोंडावाटे पोलिओ थेंब.",
      },
      {
        id: "imm-4",
        title: "९-महिने गोवर-रुबेला (MR-1) व जीवनसत्त्व अ",
        timing: "९ महिने पूर्ण झाल्यावर",
        status: "upcoming",
        date: "नियोजित ऑक्टोबर २०२६",
        details: "गोवर-रुबेला लसीचा पहिला डोस आणि रातांधळेपणा टाळण्यासाठी १ मिली जीवनसत्त्व अ सिरप.",
      },
    ],
    chronicCareItems: [
      {
        id: "chr-1",
        condition: "उच्च रक्तदाब (High BP) व्यवस्थापन",
        regimen: "ॲम्लोडिपाइन ५ मिग्रॅ (न्याहारीनंतर दररोज १ गोळी)",
        lastRefill: "१० फेब्रुवारी २०२६ (पीएचसीवर)",
        nextRefillDue: "१० मार्च २०२६ (१२ दिवस बाकी)",
        compliance: "उत्तम (रक्तदाब १२८/८२ mmHg वर स्थिर)",
        status: "active",
      },
      {
        id: "chr-2",
        condition: "प्रकार २ मधुमेह (Diabetes) साखर तपासणी",
        regimen: "मेटफॉर्मिन ५०० मिग्रॅ (जेवणासोबत दररोज २ वेळा १ गोळी)",
        lastRefill: "१० फेब्रुवारी २०२६ (पीएचसीवर)",
        nextRefillDue: "१० मार्च २०२६ (१२ दिवस बाकी)",
        compliance: "उपाशीपोटी रक्तातील साखर: ११८ mg/dL",
        status: "active",
      },
    ],
  },
};

export function HighRiskFollowupTracker({
  patientName = "Smt. Sunita Patil",
  mcpCardNumber = "MCP-MH-2026-89104",
  className = "",
}) {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState("maternal");

  const txt = TRACKER_CONTENT[language] || TRACKER_CONTENT.en;

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return <Badge variant="success" size="sm" className="gap-1"><CheckCircle2 className="w-3 h-3" /> {txt.statusCompleted}</Badge>;
      case "due":
        return <Badge variant="warning" size="sm" className="gap-1"><Clock className="w-3 h-3" /> {txt.statusDue}</Badge>;
      case "upcoming":
        return <Badge variant="default" size="sm" className="gap-1"><Calendar className="w-3 h-3" /> {txt.statusUpcoming}</Badge>;
      default:
        return <Badge variant="default" size="sm">{status}</Badge>;
    }
  };

  return (
    <Card className={`border-teal-200 dark:border-teal-800 shadow-xs bg-white dark:bg-slate-900 ${className}`}>
      {/* Header */}
      <CardHeader className="bg-linear-to-r from-teal-900 via-teal-850 to-slate-900 text-white p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <CardTitle className="text-base font-bold text-white">
                {txt.headerTitle}
              </CardTitle>
            </div>
            <p className="text-xs text-teal-200">
              {txt.beneficiaryLabel} <strong className="text-white">{patientName}</strong> • {txt.mcpLabel} <span className="font-mono">{mcpCardNumber}</span>
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-1 bg-teal-950/80 p-1 rounded-xl border border-teal-700/80 text-xs w-fit">
            <button
              type="button"
              onClick={() => setActiveTab("maternal")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === "maternal"
                  ? "bg-teal-500 text-slate-950 shadow-2xs"
                  : "text-teal-200 hover:text-white"
              }`}
            >
              <Baby className="w-3.5 h-3.5" />
              <span>{txt.tabMaternal}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("child")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === "child"
                  ? "bg-teal-500 text-slate-950 shadow-2xs"
                  : "text-teal-200 hover:text-white"
              }`}
            >
              <HeartPulse className="w-3.5 h-3.5" />
              <span>{txt.tabChild}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("chronic")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === "chronic"
                  ? "bg-teal-500 text-slate-950 shadow-2xs"
                  : "text-teal-200 hover:text-white"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>{txt.tabChronic}</span>
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-4">
        {/* Tab 1: Maternal Care */}
        {activeTab === "maternal" && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {txt.maternalMilestones.map((m) => (
                <div
                  key={m.id}
                  className={`p-4 rounded-xl border transition-all ${
                    m.status === "due"
                      ? "bg-amber-50/60 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700"
                      : m.status === "completed"
                      ? "bg-teal-50/40 dark:bg-teal-950/20 border-teal-200 dark:border-teal-800"
                      : "bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider">
                        {m.timing}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                        {m.title}
                      </h4>
                    </div>
                    {getStatusBadge(m.status)}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    {m.details}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                      📅 {m.date}
                    </span>
                    <span className="text-teal-700 dark:text-teal-300 font-semibold">
                      🏛️ {m.scheme}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Child Immunization */}
        {activeTab === "child" && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {txt.childMilestones.map((c) => (
                <div
                  key={c.id}
                  className={`p-4 rounded-xl border transition-all ${
                    c.status === "due"
                      ? "bg-amber-50/60 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700"
                      : c.status === "completed"
                      ? "bg-teal-50/40 dark:bg-teal-950/20 border-teal-200 dark:border-teal-800"
                      : "bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider">
                        {c.timing}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                        {c.title}
                      </h4>
                    </div>
                    {getStatusBadge(c.status)}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    {c.details}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/80 dark:border-slate-700/80 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    📅 {c.date}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Chronic Condition Care */}
        {activeTab === "chronic" && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {txt.chronicCareItems.map((ch) => (
                <div
                  key={ch.id}
                  className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Pill className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                      <span>{ch.condition}</span>
                    </h4>
                    <Badge variant="teal" size="sm">{txt.statusActive}</Badge>
                  </div>

                  <p className="text-slate-700 dark:text-slate-300 font-medium">
                    💊 {ch.regimen}
                  </p>

                  <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400">
                    <div><strong>{txt.lastRefillLabel}</strong> {ch.lastRefill}</div>
                    <div><strong className="text-amber-600 dark:text-amber-400">{txt.nextRefillLabel}</strong> {ch.nextRefillDue}</div>
                    <div className="text-emerald-700 dark:text-emerald-400 font-semibold">✓ {txt.complianceLabel} {ch.compliance}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Emergency Transit Strip */}
        <div className="p-3 bg-linear-to-r from-rose-50 to-orange-50 dark:from-rose-950/40 dark:to-orange-950/30 rounded-xl border border-rose-200 dark:border-rose-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-rose-900 dark:text-rose-200">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{txt.emergencyTransitNotice}</span>
          </div>
          <a
            href="tel:108"
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1 shrink-0 shadow-xs"
          >
            <span>{txt.callBtn}</span>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

export default HighRiskFollowupTracker;
