"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";

const JOURNEY_CONTENT = {
  en: {
    badge: "Real-World Impact",
    title: "The Patient Journey: From Symptom to Completed Care",
    subtitle: "Follow a rural patient's journey navigating a critical referral across the public health network.",
    steps: [
      {
        actor: "Patient / ASHA Worker",
        title: "1. Intake at Local Health Sub-Centre",
        detail: "ASHA worker records symptoms on mobile, captures preliminary vitals, and flags need for specialist cardiology review.",
      },
      {
        actor: "JeevanSetu Grounded Engine",
        title: "2. Automatic Scheme & Facility Matching",
        detail: "System verifies patient's BPL card qualifies under Ayushman Bharat PM-JAY and identifies District Hospital as the nearest facility with an active ICU and specialist.",
      },
      {
        actor: "PHC Medical Officer",
        title: "3. Referral Generation & Direct Sync",
        detail: "Medical Officer approves referral. The District Hospital Referral Desk is automatically notified to reserve an OPD consultation slot.",
      },
      {
        actor: "Rural NGO Partner",
        title: "4. Transit Support Coordinated",
        detail: "Gramin Arogya Sahayog Trust receives automated notification to provide subsidized transport and attendant food tokens.",
      },
      {
        actor: "Tertiary Hospital Desk",
        title: "5. Admission & Care Completion",
        detail: "Patient reaches hospital on scheduled date, undergoes diagnostics under PM-JAY, and post-discharge recovery instructions sync back to the local PHC.",
      },
    ],
  },
  hi: {
    badge: "वास्तविक जन-स्वास्थ्य प्रभाव",
    title: "मरीज की स्वास्थ्य यात्रा: लक्षण से लेकर सफल इलाज तक",
    subtitle: "देखें कि कैसे एक ग्रामीण मरीज जीवनसेतु के जरिए जिला अस्पताल में समय पर इलाज प्राप्त करता है।",
    steps: [
      {
        actor: "मरीज / आशा कार्यकर्ता",
        title: "1. उप-स्वास्थ्य केंद्र पर प्रारंभिक जांच",
        detail: "आशा कार्यकर्ता मोबाइल पर मरीज के लक्षण और बीपी/ऑक्सीजन दर्ज करती हैं तथा विशेषज्ञ डॉक्टर की आवश्यकता चिन्हित करती हैं।",
      },
      {
        actor: "जीवनसेतु एआई इंजन",
        title: "2. स्वचालित योजना एवं अस्पताल मिलान",
        detail: "सिस्टम आयुष्मान भारत (PM-JAY) के तहत मुफ्त इलाज की पुष्टि करता है और निकटतम सरकारी जिला अस्पताल में डॉक्टर उपलब्धता बताता है।",
      },
      {
        actor: "पीएचसी चिकित्सा अधिकारी",
        title: "3. रेफरल निर्माण एवं सीधी सूचना",
        detail: "डॉक्टर द्वारा रेफरल स्वीकृत होते ही जिला अस्पताल के रेफरल डेस्क को सूचना मिल जाती है और अपॉइंटमेंट सुरक्षित हो जाता है।",
      },
      {
        actor: "एनजीओ सहायता भागीदार",
        title: "4. रोगी परिवहन एवं भोजन सहायता",
        detail: "सहयोगी ग्रामीण ट्रस्ट को सूचना मिलती है जिससे मरीज को रियायती वाहन व परिजनों के लिए भोजन सहायता उपलब्ध होती है।",
      },
      {
        actor: "जिला अस्पताल डेस्क",
        title: "5. अस्पताल भर्ती एवं सफल उपचार",
        detail: "मरीज बिना किसी भटकाव के अस्पताल पहुंचता है, मुफ्त इलाज पाता है और डिस्चार्ज के बाद की देखभाल वापस स्थानीय पीएचसी से जुड़ जाती है।",
      },
    ],
  },
  mr: {
    badge: "प्रत्यक्ष सामाजिक प्रभाव",
    title: "रुग्णाचा आरोग्य प्रवास: लक्षणांपासून ते यशस्वी उपचारापर्यंत",
    subtitle: "पहा कसा एक ग्रामीण रुग्ण जीवनसेतूच्या माध्यमातून वेळेवर योग्य उपचार मिळवतो.",
    steps: [
      {
        actor: "रुग्ण / आशा स्वयंसेविका",
        title: "१. उपकेंद्रात प्राथमिक तपासणी",
        detail: "आशा स्वयंसेविका मोबाईलवर रुग्णाची लक्षणे व रक्तदाब नोंदवून तज्ज्ञ डॉक्टरांच्या सल्ल्याची गरज निश्चित करतात.",
      },
      {
        actor: "जीवनसेतू एआय प्रणाली",
        title: "२. स्वयंचलित योजना व रुग्णालय जुळणी",
        detail: "आयुष्यमान भारत (PM-JAY) / म.फुले योजनेअंतर्गत मोफत उपचाराची खात्री करून जवळच्या जिल्हा रुग्णालयातील खाटांची माहिती मिळते.",
      },
      {
        actor: "पीएचसी वैद्यकीय अधिकारी",
        title: "३. रेफरल निर्मिती व थेट जोडणी",
        detail: "वैद्यकीय अधिकाऱ्यांनी रेफरल मंजूर करताच जिल्हा रुग्णालयाच्या मदत कक्षाला पूर्वसूचना जाते आणि ओपीडी वेळ निश्चित होते.",
      },
      {
        actor: "स्वयंसेवी संस्था मदतनीस",
        title: "४. रुग्ण वाहतूक व भोजन सहाय्य",
        detail: "संबंधित स्वयंसेवी संस्थेला अलर्ट मिळून रुग्णाला तात्काळ वाहन व्यवस्था व सोबतच्या नातेवाईकांना मदत दिली जाते.",
      },
      {
        actor: "जिल्हा रुग्णालय मदत कक्ष",
        title: "५. रुग्णालय भरती व पूर्ण उपचार",
        detail: "रुग्ण वेळेत रुग्णालयात दाखल होऊन मोफत उपचार घेतो आणि पुढील देखभालीची माहिती पुन्हा मूळ प्राथमिक आरोग्य केंद्राला मिळते.",
      },
    ],
  },
};

export function PatientJourneySection() {
  const { language } = useLanguage();
  const txt = JOURNEY_CONTENT[language] || JOURNEY_CONTENT.en;

  return (
    <section className="py-16 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300 bg-teal-100/80 dark:bg-teal-950/80 px-3 py-1 rounded-full border border-teal-200 dark:border-teal-800">
            {txt.badge}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {txt.title}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            {txt.subtitle}
          </p>
        </div>

        <div className="mt-12 max-w-4xl mx-auto space-y-4">
          {txt.steps.map((item, idx) => (
            <div
              key={idx}
              className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:border-teal-300 dark:hover:border-teal-600 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white font-bold flex items-center justify-center shrink-0">
                {idx + 1}
              </div>
              <div className="flex-1 space-y-1">
                <span className="text-[10px] font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded border border-teal-100 dark:border-teal-800">
                  {item.actor}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PatientJourneySection;
