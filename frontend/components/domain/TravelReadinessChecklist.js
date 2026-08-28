"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { useLanguage } from "@/context/LanguageContext";
import {
  CheckCircle2,
  FileText,
  Luggage,
  AlertTriangle,
} from "lucide-react";

const CHECKLIST_CONTENT = {
  en: {
    heading: "Don't Make Me Travel Twice — Travel Checklist",
    targetFacility: "Target Facility:",
    caseRef: "Case Ref:",
    readinessProgress: "Readiness Progress",
    ready: "Ready",
    journeyConfirmation: "Referral Journey Confirmation:",
    step1: "Referral Created",
    step2: "Facility Confirmed",
    step3: "Service Active",
    step4Ready: "Documents Ready",
    step4Pending: "Documents Pending",
    whatToCarry: "What Do I Need To Carry? (Document Checklist)",
    tapToMark: "Tap items to mark as packed",
    requiredBadge: "Required by Facility",
    recommendedBadge: "Recommended",
    alertNote: "Important: Carrying all verified documents prevents having to travel multiple times between your village and district headquarters.",
    items: [
      {
        id: "doc-1",
        name: "JeevanSetu Referral Printout / Case ID",
        category: "required",
        checked: true,
        note: "Present at Ayushman Mitra or Referral Counter upon arrival.",
      },
      {
        id: "doc-2",
        name: "Patient Aadhaar Card (Original or Copy)",
        category: "required",
        checked: true,
        note: "Mandatory for government portal entry and cashless empanelment.",
      },
      {
        id: "doc-3",
        name: "Ration Card (Yellow / BPL / AAY Card)",
        category: "required",
        checked: true,
        note: "Required to verify PM-JAY / MJPJAY scheme eligibility.",
      },
      {
        id: "doc-4",
        name: "Previous PHC Prescription & Vitals Slip",
        category: "recommended",
        checked: true,
        note: "Helps the specialist understand previous treatment history.",
      },
      {
        id: "doc-5",
        name: "All Current Medicine Strips / Bottles",
        category: "recommended",
        checked: false,
        note: "Bring existing tablets so the hospital doctor knows active dosages.",
      },
      {
        id: "doc-6",
        name: "Previous X-Ray / ECG / Lab Reports",
        category: "recommended",
        checked: false,
        note: "Prevents unnecessary duplicate tests at the district hospital.",
      },
    ],
  },
  hi: {
    heading: "बार-बार यात्रा से बचें — तैयारी चेकलिस्ट",
    targetFacility: "गंतव्य अस्पताल:",
    caseRef: "केस संदर्भ:",
    readinessProgress: "तैयारी की स्थिति",
    ready: "तैयार",
    journeyConfirmation: "रेफरल यात्रा पुष्टि:",
    step1: "रेफरल निर्मित",
    step2: "अस्पताल पुष्टि",
    step3: "सेवाएं सक्रिय",
    step4Ready: "दस्तावेज़ पूर्ण",
    step4Pending: "दस्तावेज़ अपूर्ण",
    whatToCarry: "साथ में क्या ले जाना आवश्यक है? (कागजात सूची)",
    tapToMark: "पैक होने पर टिक करें",
    requiredBadge: "अस्पताल द्वारा अनिवार्य",
    recommendedBadge: "अनुशंसित",
    alertNote: "महत्वपूर्ण: सभी आवश्यक दस्तावेज साथ रखने से गांव और जिला अस्पताल के बीच दोबारा चक्कर लगाने से बचेंगे।",
    items: [
      {
        id: "doc-1",
        name: "जीवनसेतु रेफरल पर्ची / केस आईडी",
        category: "required",
        checked: true,
        note: "अस्पताल पहुंचने पर आयुष्मान मित्र या रेफरल काउंटर पर दिखाएं।",
      },
      {
        id: "doc-2",
        name: "मरीज का आधार कार्ड (मूल या फोटोकॉपी)",
        category: "required",
        checked: true,
        note: "सरकारी पोर्टल में पंजीकरण और कैशलेस इलाज के लिए अनिवार्य।",
      },
      {
        id: "doc-3",
        name: "राशन कार्ड (पीला / बीपीएल / अंत्योदय कार्ड)",
        category: "required",
        checked: true,
        note: "आयुष्मान भारत / महात्मा फुले योजना पात्रता के सत्यापन हेतु।",
      },
      {
        id: "doc-4",
        name: "पीएचसी की पुरानी डॉक्टर पर्ची व वाइटल्स रिकॉर्ड",
        category: "recommended",
        checked: true,
        note: "विशेषज्ञ डॉक्टर को पूर्व इलाज समझने में मदद मिलती है।",
      },
      {
        id: "doc-5",
        name: "चल रही सभी दवाइयों के पत्ते / शीशियां",
        category: "recommended",
        checked: false,
        note: "वर्तमान दवाइयां साथ लाएं ताकि सही खुराक निर्धारित हो सके।",
      },
      {
        id: "doc-6",
        name: "पुराने एक्स-रे / ईसीजी / खून जांच रिपोर्ट",
        category: "recommended",
        checked: false,
        note: "जिला अस्पताल में अनावश्यक दोबारा जांच से बचाएगा।",
      },
    ],
  },
  mr: {
    heading: "दुहेरी प्रवास टाळा — पूर्वतयारी यादी",
    targetFacility: "संदर्भ रुग्णालय:",
    caseRef: "केस संदर्भ क्रमांक:",
    readinessProgress: "तयारीची स्थिती",
    ready: "तयार",
    journeyConfirmation: "रेफरल प्रवासाची खात्री:",
    step1: "रेफरल नोंदवले",
    step2: "रुग्णालय निश्चित",
    step3: "सेवा सक्रिय",
    step4Ready: "कागदपत्रे तयार",
    step4Pending: "कागदपत्रे अपूर्ण",
    whatToCarry: "रुग्णालयात जाताना सोबत काय आवश्यक आहे? (कागदपत्रे)",
    tapToMark: "पॅक झाल्यावर खूण करा",
    requiredBadge: "रुग्णालयासाठी बंधनकारक",
    recommendedBadge: "उपलब्ध असल्यास आवश्यक",
    alertNote: "महत्त्वाची सूचना: सर्व आवश्यक कागदपत्रे सोबत ठेवल्याने गाव आणि जिल्हा रुग्णालय यांच्यात वारंवार फेऱ्या मारण्याची वेळ येत नाही.",
    items: [
      {
        id: "doc-1",
        name: "जीवनसेतू रेफरल पावती / केस आयडी",
        category: "required",
        checked: true,
        note: "रुग्णालयात पोहोचल्यावर आयुष्यमान मित्र किंवा रेफरल काउंटरवर दाखवा.",
      },
      {
        id: "doc-2",
        name: "रुग्णाचे आधार कार्ड (मूळ किंवा प्रत)",
        category: "required",
        checked: true,
        note: "शासकीय नोंदणी व कॅशलेस योजनेसाठी बंधनकारक.",
      },
      {
        id: "doc-3",
        name: "रेशन कार्ड (पिवळे / बीपीएल / अंत्योदय कार्ड)",
        category: "required",
        checked: true,
        note: "आयुष्मान भारत / म.फुले जन आरोग्य योजना पात्रतेसाठी.",
      },
      {
        id: "doc-4",
        name: "प्राथमिक आरोग्य केंद्राची जुनी औषध चिठ्ठी",
        category: "recommended",
        checked: true,
        note: "तज्ज्ञ डॉक्टरांना आधीचा उपचार समजण्यास मदत होते.",
      },
      {
        id: "doc-5",
        name: "सध्या सुरू असलेल्या सर्व औषधांच्या गोळ्या/बाटल्या",
        category: "recommended",
        checked: false,
        note: "सध्याची औषधे सोबत ठेवा जेणेकरून योग्य डोस निश्चित करता येईल.",
      },
      {
        id: "doc-6",
        name: "जुने क्ष-किरण (X-Ray) / ईसीजी / लॅब तपासणी अहवाल",
        category: "recommended",
        checked: false,
        note: "जिल्हा रुग्णालयात पुन्हा त्याच चाचण्या करण्याचा वेळ वाचेल.",
      },
    ],
  },
};

export function TravelReadinessChecklist({
  caseId = "JVS-MH-7A82K1",
  facilityName = "District Civil Hospital",
}) {
  const { language } = useLanguage();
  const txt = CHECKLIST_CONTENT[language] || CHECKLIST_CONTENT.en;

  const [checkedMap, setCheckedMap] = useState({
    "doc-1": true,
    "doc-2": true,
    "doc-3": true,
    "doc-4": true,
    "doc-5": false,
    "doc-6": false,
  });

  const toggleItem = (id) => {
    setCheckedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const totalCount = txt.items.length;
  const checkedCount = txt.items.filter((i) => checkedMap[i.id]).length;
  const progressPercent = Math.round((checkedCount / totalCount) * 100);

  return (
    <Card className="border-teal-200 dark:border-teal-800 shadow-xs overflow-hidden bg-white dark:bg-slate-900">
      {/* Header */}
      <CardHeader className="bg-linear-to-r from-teal-900 to-slate-900 text-white p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Luggage className="w-5 h-5 text-teal-400" />
              <CardTitle className="text-base font-bold text-white">
                {txt.heading}
              </CardTitle>
            </div>
            <p className="text-xs text-teal-200">
              {txt.targetFacility} <strong className="text-white">{facilityName}</strong> • {txt.caseRef} <span className="font-mono">{caseId}</span>
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-teal-200 block">{txt.readinessProgress}</span>
            <span className="text-lg font-black text-white">{checkedCount} / {totalCount} {txt.ready} ({progressPercent}%)</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 space-y-6">
        {/* Pathway sequence overview */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
          <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px] block">
            {txt.journeyConfirmation}
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 rounded-lg border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{txt.step1}</span>
            </div>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 rounded-lg border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{txt.step2}</span>
            </div>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 rounded-lg border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{txt.step3}</span>
            </div>
            <div className={`p-2 rounded-lg border font-semibold flex items-center gap-1.5 ${progressPercent === 100 ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200" : "bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200"}`}>
              {progressPercent === 100 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />}
              <span>{progressPercent === 100 ? txt.step4Ready : txt.step4Pending}</span>
            </div>
          </div>
        </div>

        {/* What Do I Need To Carry? Interactive Checklist */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>{txt.whatToCarry}</span>
            </h4>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">{txt.tapToMark}</span>
          </div>

          <div className="space-y-2.5">
            {txt.items.map((item) => {
              const isChecked = !!checkedMap[item.id];
              return (
                <label
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`p-3.5 rounded-xl border flex items-start gap-3.5 cursor-pointer transition-all ${
                    isChecked
                      ? "bg-teal-50/40 dark:bg-teal-950/30 border-teal-300 dark:border-teal-700 shadow-2xs"
                      : "bg-slate-50/60 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="mt-0.5 w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                  />
                  <div className="flex-1 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`font-semibold ${isChecked ? "text-teal-950 dark:text-teal-200 line-through opacity-80" : "text-slate-900 dark:text-white"}`}>
                        {item.name}
                      </span>
                      <Badge
                        variant={item.category === "required" ? "danger" : "default"}
                        size="sm"
                        className="text-[10px] shrink-0"
                      >
                        {item.category === "required" ? txt.requiredBadge : txt.recommendedBadge}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      {item.note}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Information Alert */}
        <Alert variant="info" className="text-xs">
          {txt.alertNote}
        </Alert>
      </CardContent>
    </Card>
  );
}

export default TravelReadinessChecklist;
