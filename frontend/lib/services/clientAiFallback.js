/**
 * Client-Side Resilient AI Healthcare Assistance Engine
 * Provides instant grounded public health guidance and verified emergency/directory routing
 * even during upstream network cold-starts, latency, or offline conditions.
 */

export function getClientAiFallbackResponse(query = "", language = "en") {
  const text = (query || "").toLowerCase();
  
  // Detect language if not provided
  let lang = language;
  if (/[\u0900-\u097F]/.test(query)) {
    lang = /(आहे|नाही|झाले|औषध|रुग्ण|रुग्णालय|करावे|कुठे|कधी|सांगा)/.test(query) ? "mr" : "hi";
  } else if (/(kya|kaise|kaunsa|kidhar|chahiye|bukhar|dawa|dard)/i.test(text)) {
    lang = "hi";
  } else if (/(kay|kasa|kuthe|hava|tap|aushadh)/i.test(text)) {
    lang = "mr";
  }

  // 1. Emergency Red Flag Detection
  const emergencyKeywords = [
    "emergency", "chest pain", "heart attack", "unconscious", "stroke", "bleeding",
    "saans", "chhati", "behosh", "khun", "seena", "daura",
    "छातीत", "श्वास", "बेशुद्ध", "रक्तस्राव", "हार्ट अटॅक", "आपत्कालीन"
  ];
  
  const isEmergency = emergencyKeywords.some(kw => text.includes(kw));

  if (isEmergency) {
    if (lang === "hi") {
      return {
        answer: "⚠️ **आपातकालीन चेतावनी**: आपके द्वारा बताए गए लक्षण गंभीर हो सकते हैं। कृपया तुरंत **108** पर कॉल करें या नजदीकी आपातकालीन अस्पताल के कैजुअल्टी विभाग में जाएं।",
        groundedCards: [
          {
            type: "emergency",
            title: "108 एम्बुलेंस आपातकालीन सेवा",
            detail: "24x7 निःशुल्क सरकारी आपातकालीन एम्बुलेंस सेवा।",
            actionLabel: "108 डायल करें",
          },
          {
            type: "hospital",
            title: "जिला सिविल अस्पताल गडचिरोली",
            detail: "24x7 आपातकालीन ट्राइएज और आईसीयू वार्ड उपलब्ध।",
            actionLabel: "इमरजेंसी डेस्क देखें",
          }
        ],
        safetyLevel: "emergency",
        sources: ["राष्ट्रीय स्वास्थ्य मिशन आपातकालीन प्रोटोकॉल"],
      };
    } else if (lang === "mr") {
      return {
        answer: "⚠️ **आपत्कालीन सूचना**: आपण सांगितलेली लक्षणे गंभीर असू शकतात. कृपया त्वरित **108** वर संपर्क साधा किंवा जवळच्या शासकीय रुग्णालयात जा.",
        groundedCards: [
          {
            type: "emergency",
            title: "108 रुग्णवाहिका आपत्कालीन सेवा",
            detail: "24x7 मोफत शासकीय आपत्कालीन रुग्णवाहिका सेवा.",
            actionLabel: "108 वर कॉल करा",
          },
          {
            type: "hospital",
            title: "जिल्हा सामान्य रुग्णालय गडचिरोली",
            detail: "24x7 आपत्कालीन कक्ष व अतिदक्षता विभाग उपलब्ध.",
            actionLabel: "इमर्जन्सी डेस्क पहा",
          }
        ],
        safetyLevel: "emergency",
        sources: ["राष्ट्रीय आरोग्य अभियान आपत्कालीन मार्गदर्शक तत्वे"],
      };
    } else {
      return {
        answer: "⚠️ **CRITICAL EMERGENCY ALERT**: Severe symptoms detected. Please immediately dial **108** for emergency ambulance or visit the nearest casualty triage hospital.",
        groundedCards: [
          {
            type: "emergency",
            title: "108 Emergency Ambulance Dispatch",
            detail: "24x7 Toll-free government emergency critical response service.",
            actionLabel: "Dial 108 Immediately",
          },
          {
            type: "hospital",
            title: "District Civil Hospital Gadchiroli",
            detail: "Equipped with 24x7 Emergency Casualty Triage & ICU resuscitation beds.",
            actionLabel: "View Emergency Desk",
          }
        ],
        safetyLevel: "emergency",
        sources: ["National Health Mission Emergency Protocols"],
      };
    }
  }

  // 2. Government Health Schemes & Ayushman Bharat Detection
  const schemeKeywords = ["yojana", "scheme", "ayushman", "pmjay", "mjpjay", "card", "free", "योजना", "आयुष्मान", "कार्ड"];
  const isScheme = schemeKeywords.some(kw => text.includes(kw));

  if (isScheme) {
    if (lang === "hi") {
      return {
        answer: "जीवनसेतु पर सत्यापित सरकारी स्वास्थ्य योजनाएं उपलब्ध हैं। **आयुष्मान भारत (PM-JAY)** के तहत पात्र परिवारों को प्रति वर्ष ₹5 लाख तक का निःशुल्क कैशलेस उपचार मिलता है।",
        groundedCards: [
          {
            type: "scheme",
            title: "आयुष्मान भारत प्रधानमंत्री जन आरोग्य योजना (PM-JAY)",
            detail: "द्वितीयक और तृतीयक अस्पताल में भर्ती के लिए ₹5,00,000 वार्षिक निःशुल्क कवरेज।",
            actionLabel: "पात्रता और दस्तावेज देखें",
          },
          {
            type: "scheme",
            title: "महात्मा ज्योतिराव फुले जन आरोग्य योजना (MJPJAY)",
            detail: "महाराष्ट्र राज्य के नागरिकों के लिए चिन्हित सर्जरी व उपचारों पर कैशलेस सुविधा।",
            actionLabel: "योजना विवरण देखें",
          }
        ],
        safetyLevel: "safe",
        sources: ["राष्ट्रीय स्वास्थ्य प्राधिकरण (NHA)", "सार्वजनिक आरोग्य विभाग महाराष्ट्र"],
      };
    } else if (lang === "mr") {
      return {
        answer: "जीवनसेतूवर शासकीय आरोग्य योजनांची माहिती उपलब्ध आहे. **आयुष्मान भारत (PM-JAY)** आणि **महात्मा फुले जन आरोग्य योजना (MJPJAY)** अंतर्गत पात्र कुटुंबांना मोफत कॅशलेस उपचार मिळतात.",
        groundedCards: [
          {
            type: "scheme",
            title: "महात्मा ज्योतिराव फुले जन आरोग्य योजना (MJPJAY)",
            detail: "महाराष्ट्र शासनाची मोफत कॅशलेस आरोग्य संरक्षण योजना.",
            actionLabel: "पात्रता तपासा",
          },
          {
            type: "scheme",
            title: "आयुष्मान भारत (PM-JAY)",
            detail: "प्रति कुटुंब प्रति वर्ष ₹5 लाख रुपयांपर्यंत मोफत उपचार संरक्षण.",
            actionLabel: "तपशील पहा",
          }
        ],
        safetyLevel: "safe",
        sources: ["महाराष्ट्र सार्वजनिक आरोग्य विभाग"],
      };
    } else {
      return {
        answer: "JeevanSetu connects citizens with verified healthcare schemes. Under **Ayushman Bharat (PM-JAY)**, eligible families receive up to ₹5 Lakh annual cashless hospitalization cover.",
        groundedCards: [
          {
            type: "scheme",
            title: "Ayushman Bharat PM-JAY",
            detail: "₹5,00,000 annual secondary and tertiary cashless healthcare coverage.",
            actionLabel: "Check Eligibility & Benefits",
          },
          {
            type: "scheme",
            title: "Mahatma Jyotirao Phule Jan Arogya Yojana (MJPJAY)",
            detail: "Comprehensive cashless surgical and specialty care in Maharashtra.",
            actionLabel: "View Scheme Details",
          }
        ],
        safetyLevel: "safe",
        sources: ["National Health Authority (NHA)"],
      };
    }
  }

  // 3. PHC & Medicine Directory Queries
  const phcKeywords = ["phc", "dawa", "medicine", "doctor", "ashti", "hospital", "दवा", "डॉक्टर", "औषध", "दवाखाना"];
  const isPhc = phcKeywords.some(kw => text.includes(kw));

  if (isPhc) {
    if (lang === "hi") {
      return {
        answer: "प्राथमिक स्वास्थ्य केंद्र (PHC) पर बुनियादी दवाएं (जैसे पेरासिटामोल, ओआरएस, बीपी/शुगर की दवाएं) और डॉक्टर परामर्श प्रातः 9:00 बजे से सायं 4:00 बजे तक निःशुल्क उपलब्ध हैं।",
        groundedCards: [
          {
            type: "facility",
            title: "आष्टी प्राथमिक स्वास्थ्य केंद्र (PHC)",
            detail: "ओपीडी समय: सुबह 9:00 - शाम 4:00 | आपातकालीन सेवाएं 24x7",
            actionLabel: "PHC प्रोफाइल देखें",
          },
          {
            type: "facility",
            title: "जिला सिविल अस्पताल गडचिरोली",
            detail: "विशेषज्ञ डॉक्टर, पैथोलॉजी लैब, और रेफरल सुविधाएं।",
            actionLabel: "रेफरल गाइड देखें",
          }
        ],
        safetyLevel: "safe",
        sources: ["ग्रामीण स्वास्थ्य मिशन निर्देशिका"],
      };
    } else if (lang === "mr") {
      return {
        answer: "प्राथमिक आरोग्य केंद्र (PHC) येथे आवश्यक औषधे आणि डॉक्टरांचा सल्ला सकाळी 9:00 ते संध्याकाळी 4:00 वाजेपर्यंत विनामूल्य उपलब्ध आहे.",
        groundedCards: [
          {
            type: "facility",
            title: "आष्टी प्राथमिक आरोग्य केंद्र (PHC)",
            detail: "ओपीडी वेळ: सकाळी 9:00 - संध्याकाळी 4:00 | आपत्कालीन सेवा 24x7",
            actionLabel: "आरोग्य केंद्र माहिती",
          }
        ],
        safetyLevel: "safe",
        sources: ["सार्वजनिक आरोग्य विभाग महाराष्ट्र"],
      };
    } else {
      return {
        answer: "Primary Health Centres (PHC) provide essential medicines and medical officer consultations from 9:00 AM to 4:00 PM on working days at zero cost.",
        groundedCards: [
          {
            type: "facility",
            title: "Ashti Primary Health Centre (PHC)",
            detail: "OPD Hours: 9:00 AM - 4:00 PM | 24x7 Emergency Delivery Room & Casualty.",
            actionLabel: "View PHC Details",
          },
          {
            type: "facility",
            title: "District Civil Hospital Gadchiroli",
            detail: "Specialist consultation, laboratory diagnostics, and secondary referral center.",
            actionLabel: "View Hospital Profile",
          }
        ],
        safetyLevel: "safe",
        sources: ["National Rural Health Mission Directory"],
      };
    }
  }

  // 4. Default Safe Grounded Healthcare Assistance
  if (lang === "hi") {
    return {
      answer: "नमस्ते! मैं जीवनसेतु का स्वास्थ्य सहायक हूँ। मैं आपको नजदीकी प्राथमिक स्वास्थ्य केंद्र (PHC), डॉक्टर परामर्श समय, आवश्यक दवा उपलब्धता, और सरकारी स्वास्थ्य योजनाओं (जैसे आयुष्मान भारत) की जानकारी दे सकता हूँ। आप किस विषय में जानकारी चाहते हैं?",
      groundedCards: [
        {
          type: "facility",
          title: "नजदीकी प्राथमिक स्वास्थ्य केंद्र (PHC)",
          detail: "निःशुल्क परामर्श व दवाइयों के लिए अपने नजदीकी स्वास्थ्य केंद्र का पता लगाएं।",
          actionLabel: "सत्यापित डायरेक्टरी देखें",
        },
        {
          type: "scheme",
          title: "सरकारी स्वास्थ्य योजनाएं (PM-JAY)",
          detail: "कैशलेस अस्पताल भर्ती और ₹5 लाख तक का सरकारी बीमा।",
          actionLabel: "योजनाएं देखें",
        }
      ],
      safetyLevel: "safe",
      sources: ["जीवनसेतु सत्यापित स्वास्थ्य डायरेक्टरी"],
    };
  } else if (lang === "mr") {
    return {
      answer: "नमस्कार! मी जीवनसेतूचा आरोग्य सहाय्यक आहे. मी आपल्याला प्राथमिक आरोग्य केंद्र (PHC), औषध साठा, डॉक्टर वेळ, आणि शासकीय आरोग्य योजनांची माहिती देऊ शकतो. आपल्याला काय मदत हवी आहे?",
      groundedCards: [
        {
          type: "facility",
          title: "प्राथमिक आरोग्य केंद्र डायरेक्टरी",
          detail: "जवळचे शासकीय रुग्णालय आणि आरोग्य केंद्रांची अद्ययावत माहिती.",
          actionLabel: "डायरेक्टरी पहा",
        }
      ],
      safetyLevel: "safe",
      sources: ["जीवनसेतू आरोग्य सहाय्यता"],
    };
  } else {
    return {
      answer: "Hello! I am your JeevanSetu Healthcare Assistant. I can help guide you to verified Primary Health Centres (PHCs), doctor schedules, essential medicine stock status, and government health schemes like Ayushman Bharat (PM-JAY). How can I assist you today?",
      groundedCards: [
        {
          type: "facility",
          title: "Primary Health Centres Directory",
          detail: "Locate verified public health facilities and doctors in your district.",
          actionLabel: "Explore Facilities",
        },
        {
          type: "scheme",
          title: "Ayushman Bharat & State Schemes",
          detail: "Access verified cashless government healthcare schemes.",
          actionLabel: "View Verified Schemes",
        }
      ],
      safetyLevel: "safe",
      sources: ["JeevanSetu Verified Rural Healthcare Directory"],
    };
  }
}
