"use client";

import React from "react";
import Link from "next/link";
import { PhoneCall, ShieldCheck, ExternalLink } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const FOOTER_CONTENT = {
  en: {
    safetyNotice: "JeevanSetu connects rural patients to verified resources. It is not a diagnostic tool or substitute for medical professionals.",
    emergencyLabel: "National Emergency: 108",
    tagline: "AI-powered rural healthcare access, assistance, referral coordination, and PHC service-monitoring platform.",
    subTagline: "Designed for rural, tribal, and underserved healthcare networks across India.",
    patientServicesTitle: "Patient Services",
    phcAdminTitle: "PHC & Administration",
    govtPortalsTitle: "Official Govt Portals",
    helplinesTitle: "Emergency & Helplines",
    natAmbulance: "National Ambulance:",
    maternalAmbulance: "Maternal (JSSK):",
    healthHelpline: "Health Helpline:",
    pmjayHelpline: "Ayushman PM-JAY:",
    organHelpline: "Organ Donation:",
    mentalHelpline: "Tele-MANAS (Mental):",
    copyright: "© 2026 JeevanSetu Healthcare Platform. Public Health & Digital India Initiative.",
    pillar1: "Rural Access Focused",
    pillar2: "100% Non-Commercial",
    pillar3: "Public Health Stack",
  },
  hi: {
    safetyNotice: "जीवनसेतु ग्रामीण मरीजों को सत्यापित स्वास्थ्य सेवाओं से जोड़ता है। यह कोई डॉक्टरी नुस्खा या निदान का विकल्प नहीं है।",
    emergencyLabel: "राष्ट्रीय आपातकालीन: 108",
    tagline: "एआई-संचालित ग्रामीण स्वास्थ्य पहुंच, सहायता, रेफरल समन्वय और प्राथमिक स्वास्थ्य निगरानी मंच।",
    subTagline: "भारत के ग्रामीण, जनजातीय और दूरदराज के क्षेत्रों के लिए विशेष रूप से निर्मित।",
    patientServicesTitle: "नागरिक एवं मरीज सेवाएं",
    phcAdminTitle: "पीएचसी एवं प्रशासनिक नियंत्रण",
    govtPortalsTitle: "आधिकारिक सरकारी पोर्टल",
    helplinesTitle: "आपातकालीन नंबर एवं हेल्पलाइन",
    natAmbulance: "राष्ट्रीय एम्बुलेंस:",
    maternalAmbulance: "मातृ सहायता (JSSK):",
    healthHelpline: "स्वास्थ्य परामर्श हेल्पलाइन:",
    pmjayHelpline: "आयुष्मान भारत PM-JAY:",
    organHelpline: "अंगदान राष्ट्रीय हेल्पलाइन:",
    mentalHelpline: "टेली-मानस मानसिक स्वास्थ्य:",
    copyright: "© 2026 जीवनसेतु स्वास्थ्य मंच। सार्वजनिक स्वास्थ्य एवं डिजिटल इंडिया पहल।",
    pillar1: "ग्रामीण जन-स्वास्थ्य केंद्रित",
    pillar2: "100% गैर-व्यावसायिक",
    pillar3: "डिजिटल भारत स्वास्थ्य पहल",
  },
  mr: {
    safetyNotice: "जीवनसेतू ग्रामीण रुग्णांना प्रमाणित आरोग्य सेवांशी जोडतो. हा कोणताही थेट वैद्यकीय उपाय किंवा डॉक्टरांचा पर्याय नाही.",
    emergencyLabel: "राष्ट्रीय आपत्कालीन: 108",
    tagline: "एआय-समर्थित ग्रामीण आरोग्य समन्वय, रेफरल व्यवस्थापन आणि प्राथमिक आरोग्य संनियंत्रण मंच.",
    subTagline: "भारतातील ग्रामीण व दुर्गम भागातील आरोग्य व्यवस्थेसाठी विशेष निर्मिती.",
    patientServicesTitle: "रुग्ण व नागरिक सेवा",
    phcAdminTitle: "आरोग्य केंद्र व प्रशासन",
    govtPortalsTitle: "शासकीय अधिकृत पोर्टल्स",
    helplinesTitle: "आपत्कालीन व हेल्पलाइन क्रमांक",
    natAmbulance: "राष्ट्रीय रुग्णवाहिका:",
    maternalAmbulance: "माता रुग्णवाहिका (JSSK):",
    healthHelpline: "आरोग्य हेल्पलाइन:",
    pmjayHelpline: "आयुष्यमान PM-JAY:",
    organHelpline: "अवयवदान हेल्पलाइन:",
    mentalHelpline: "टेलि-मानस मानसिक आधार:",
    copyright: "© 2026 जीवनसेतू आरोग्य मंच. सार्वजनिक आरोग्य व डिजिटल इंडिया उपक्रम.",
    pillar1: "ग्रामीण आरोग्य केंद्रित",
    pillar2: "१००% मोफत व सुरक्षित",
    pillar3: "सार्वजनिक आरोग्य मंच",
  },
};

export function Footer() {
  const { language, t } = useLanguage();
  const txt = FOOTER_CONTENT[language] || FOOTER_CONTENT.en;

  return (
    <footer className="bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 text-xs border-t border-slate-200 dark:border-white/10 transition-colors duration-300">
      {/* Safety Notice Strip */}
      <div className="bg-slate-200/70 dark:bg-[#050811] border-b border-slate-300/60 dark:border-white/5 py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
            <span>
              <strong className="text-slate-900 dark:text-white">Healthcare Principle:</strong> {txt.safetyNotice}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 shrink-0 font-bold">
            <PhoneCall className="w-3.5 h-3.5" />
            <a href="tel:108" className="hover:underline">{txt.emergencyLabel}</a>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="space-y-3 md:col-span-1 lg:col-span-1 text-left">
            <div className="flex items-center gap-2">
              <img
                src="/logo.png"
                alt="JeevanSetu Logo"
                className="w-8 h-8 rounded-xl object-contain bg-white p-0.5 border border-slate-200 dark:border-white/10"
              />
              <span className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                Jeevan<span className="text-teal-600 dark:text-teal-400">Setu</span>
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {txt.tagline}
            </p>
            <p className="text-[11px] text-slate-500">
              {txt.subTagline}
            </p>
          </div>

          {/* Patient Portals */}
          <div className="space-y-2.5 text-left">
            <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {txt.patientServicesTitle}
            </h5>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard/patient" className="hover:text-teal-600 dark:hover:text-teal-300 transition-colors">
                  {t("healthcarePortal", "Patient Dashboard")}
                </Link>
              </li>
              <li>
                <Link href="/resources" className="hover:text-teal-600 dark:hover:text-teal-300 transition-colors">
                  {t("verifiedDirectory", "Verified Hospitals Directory")}
                </Link>
              </li>
              <li>
                <Link href="/referrals" className="hover:text-teal-600 dark:hover:text-teal-300 transition-colors">
                  {t("referralTracking", "Referral Tracking")}
                </Link>
              </li>
              <li>
                <Link href="/organ-donation" className="hover:text-teal-600 dark:hover:text-teal-300 transition-colors">
                  {t("organDonation", "Organ Donation Info")}
                </Link>
              </li>
              <li>
                <Link href="/call-assistance" className="hover:text-teal-600 dark:hover:text-teal-300 transition-colors">
                  {t("voiceAssistance", "Voice IVR & 2G Support")}
                </Link>
              </li>
              <li>
                <Link href="/feedback" className="hover:text-teal-600 dark:hover:text-teal-300 transition-colors">
                  {t("feedbackPortal", "Feedback & Grievance")}
                </Link>
              </li>
            </ul>
          </div>

          {/* PHC & Admin Portals */}
          <div className="space-y-2.5 text-left">
            <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {txt.phcAdminTitle}
            </h5>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard/phc" className="hover:text-teal-600 dark:hover:text-teal-300 transition-colors">
                  {t("phcDashboard", "PHC Portal")}
                </Link>
              </li>
              <li>
                <Link href="/inventory" className="hover:text-teal-600 dark:hover:text-teal-300 transition-colors">
                  {t("medicineInventory", "Medicine Stock (DVDMS)")}
                </Link>
              </li>
              <li>
                <Link href="/cases" className="hover:text-teal-600 dark:hover:text-teal-300 transition-colors">
                  {t("patientCases", "Patient Cases & Notes")}
                </Link>
              </li>
              <li>
                <Link href="/dashboard/hospital" className="hover:text-teal-600 dark:hover:text-teal-300 transition-colors">
                  {t("hospitalDashboard", "District Hospital Desk")}
                </Link>
              </li>
              <li>
                <Link href="/dashboard/doctor" className="hover:text-teal-600 dark:hover:text-teal-300 transition-colors">
                  {t("doctorDutyDesk", "Doctor Duty Desk")}
                </Link>
              </li>
              <li>
                <Link href="/dashboard/admin" className="hover:text-teal-600 dark:hover:text-teal-300 transition-colors">
                  {t("districtOperations", "District Admin Command")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Govt Healthcare Portals */}
          <div className="space-y-2.5 text-left">
            <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {txt.govtPortalsTitle}
            </h5>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://dhs.maharashtra.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-teal-600 dark:hover:text-teal-300 transition-colors inline-flex items-center gap-1"
                >
                  <span>DHS Maharashtra</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://pmjay.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-teal-600 dark:hover:text-teal-300 transition-colors inline-flex items-center gap-1"
                >
                  <span>Ayushman Bharat PM-JAY</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.jeevandayee.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-teal-600 dark:hover:text-teal-300 transition-colors inline-flex items-center gap-1"
                >
                  <span>MJPJAY Maharashtra</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://abdm.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-teal-600 dark:hover:text-teal-300 transition-colors inline-flex items-center gap-1"
                >
                  <span>ABDM Health ID (ABHA)</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://nhm.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-teal-600 dark:hover:text-teal-300 transition-colors inline-flex items-center gap-1"
                >
                  <span>National Health Mission</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
              </li>
            </ul>
          </div>

          {/* Emergency Helplines Box */}
          <div className="space-y-2.5 text-left">
            <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {txt.helplinesTitle}
            </h5>
            <div className="p-4 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 space-y-2 shadow-sm dark:shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-slate-700 dark:text-slate-300">{txt.natAmbulance}</span>
                <a href="tel:108" className="text-rose-600 dark:text-rose-400 hover:text-rose-500 font-extrabold font-mono">108</a>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700 dark:text-slate-300">{txt.maternalAmbulance}</span>
                <a href="tel:102" className="text-teal-600 dark:text-teal-400 hover:text-teal-500 font-extrabold font-mono">102</a>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700 dark:text-slate-300">{txt.healthHelpline}</span>
                <a href="tel:104" className="text-teal-600 dark:text-teal-400 hover:text-teal-500 font-extrabold font-mono">104</a>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700 dark:text-slate-300">{txt.pmjayHelpline}</span>
                <a href="tel:14555" className="text-amber-600 dark:text-amber-300 hover:text-amber-500 font-extrabold font-mono">14555</a>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700 dark:text-slate-300">{txt.organHelpline}</span>
                <a href="tel:1800114477" className="text-teal-600 dark:text-teal-300 hover:text-teal-500 font-extrabold font-mono">1800-11-4477</a>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700 dark:text-slate-300">{txt.mentalHelpline}</span>
                <a href="tel:14416" className="text-slate-900 dark:text-white hover:text-teal-600 font-extrabold font-mono">14416</a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>{txt.copyright}</p>
          <div className="flex items-center gap-4">
            <span className="text-slate-600 dark:text-slate-400">{txt.pillar1}</span>
            <span>•</span>
            <span className="text-slate-600 dark:text-slate-400">{txt.pillar2}</span>
            <span>•</span>
            <span className="text-slate-600 dark:text-slate-400">{txt.pillar3}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
