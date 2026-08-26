/**
 * Client-Side Resilient AI Healthcare Assistance Engine
 * Provides INSTANT (<50ms) grounded public health guidance and verified emergency/directory routing
 * with zero lag, ensuring ultra-fast and reliable answers even on slow network connections.
 */

export function getClientAiFallbackResponse(query = "", language = "en") {
  const text = (query || "").toLowerCase();
  
  // Detect language if not provided or if query has specific scripts/keywords
  let lang = language;
  if (/[\u0900-\u097F]/.test(query)) {
    lang = /(आहे|नाही|झाले|औषध|रुग्ण|रुग्णालय|करावे|कुठे|कधी|सांगा|ताप|खोकला)/.test(query) ? "mr" : "hi";
  } else if (/(kya|kaise|kaunsa|kidhar|chahiye|bukhar|dawa|dard|khansi|dast|ilaaj)/i.test(text)) {
    lang = "hi";
  } else if (/(kay|kasa|kuthe|hava|tap|aushadh|khokla|pottat)/i.test(text)) {
    lang = "mr";
  }

  // 1. Emergency Red Flag Detection
  const emergencyKeywords = [
    "emergency", "chest pain", "heart attack", "unconscious", "stroke", "bleeding",
    "saans", "chhati", "behosh", "khun", "seena", "daura", "accident",
    "छातीत", "श्वास", "बेशुद्ध", "रक्तस्राव", "हार्ट अटॅक", "आपत्कालीन", "अपघात"
  ];
  
  const isEmergency = emergencyKeywords.some(kw => text.includes(kw));

  if (isEmergency) {
    if (lang === "hi") {
      return {
        answer: "⚠️ **आपातकालीन चेतावनी**: आपके द्वारा बताए गए लक्षण गंभीर हो सकते हैं। कृपया तुरंत **108** पर कॉल करें या नजदीकी आपातकालीन अस्पताल के कैजुअल्टी विभाग में जाएं।\n\n- तुरंत मरीज को आरामदायक स्थिति में बैठाएं।\n- खुद गाड़ी चलाने के बजाय 108 एम्बुलेंस का उपयोग करें।",
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
        answer: "⚠️ **आपत्कालीन सूचना**: आपण सांगितलेली लक्षणे गंभीर असू शकतात. कृपया त्वरित **108** वर संपर्क साधा किंवा जवळच्या शासकीय रुग्णालयात जा.\n\n- रुग्णाला त्वरित आरामदायक स्थितीत बसवा.\n- स्वतः वाहन चालवण्याऐवजी 108 रुग्णवाहिकेची मदत घ्या.",
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
        answer: "⚠️ **CRITICAL EMERGENCY ALERT**: Severe symptoms detected. Please immediately dial **108** for emergency ambulance or visit the nearest casualty triage hospital.\n\n- Keep the patient calm and seated in a comfortable posture.\n- Do not drive yourself; utilize the 108 ambulance triage network.",
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

  // 2. Fever / Bukhar / Temperature / Tap
  const feverKeywords = ["fever", "bukhar", "temperature", "tap", "sardi", "thand", "बुखार", "ताप"];
  if (feverKeywords.some(kw => text.includes(kw))) {
    if (lang === "hi") {
      return {
        answer: "🌡️ **बुखार के लिए प्राथमिक मार्गदर्शन**:\n\n1. **हाइड्रेशन**: भरपूर मात्रा में साफ पानी, ओआरएस (ORS) या नारियल पानी पिएं।\n2. **आराम**: पर्याप्त विश्राम करें और सामान्य तापमान के पानी की पट्टी माथे पर रखें।\n3. **नजदीकी PHC**: यदि बुखार 101°F से अधिक है या 2 दिनों से अधिक बना हुआ है, तो तुरंत नजदीकी **प्राथमिक स्वास्थ्य केंद्र (PHC)** पर जाकर डॉक्टर से परामर्श लें और खून की निःशुल्क जांच (मलेरिया/डेंगू) करवाएं।\n\n*(नोट: बिना डॉक्टर की सलाह के कोई भी एंटीबायोटिक न लें।)*",
        groundedCards: [
          {
            type: "facility",
            title: "नजदीकी प्राथमिक स्वास्थ्य केंद्र (PHC)",
            detail: "सुबह 9:00 - शाम 4:00 तक निःशुल्क डॉक्टर परामर्श और बुखार की दवाएं।",
            actionLabel: "PHC डायरेक्टरी देखें",
          },
          {
            type: "scheme",
            title: "निःशुल्क पैथोलॉजी एवं दवा वितरण",
            detail: "राष्ट्रीय ग्रामीण स्वास्थ्य मिशन के अंतर्गत सभी आवश्यक जांचें मुफ्त।",
            actionLabel: "सेवाएं देखें",
          }
        ],
        safetyLevel: "safe",
        sources: ["राष्ट्रीय स्वास्थ्य मिशन ग्रामीण स्वास्थ्य निर्देशिका"],
      };
    } else if (lang === "mr") {
      return {
        answer: "🌡️ **तापासाठी प्राथमिक आरोग्य सल्ला**:\n\n1. **पाणी व विश्रांती**: भरपूर पाणी, ओआरएस (ORS) प्या आणि पूर्ण विश्रांती घ्या.\n2. **थंड पाण्याच्या पट्ट्या**: ताप जास्त असल्यास कपाळावर साध्या पाण्याच्या पट्ट्या ठेवा.\n3. **PHC तपासणी**: ताप २ दिवसांपेक्षा जास्त असल्यास जवळच्या **प्राथमिक आरोग्य केंद्रात (PHC)** जाऊन रक्ततपासणी (मलेरिया/डेंग्यू) करून घ्या.\n\n*(टीप: डॉक्टरांच्या सल्ल्याशिवाय कोणतेही औषध घेऊ नका.)*",
        groundedCards: [
          {
            type: "facility",
            title: "प्राथमिक आरोग्य केंद्र (PHC)",
            detail: "सकाळी 9:00 ते संध्याकाळी 4:00 विनामूल्य डॉक्टर सल्ला व औषध साठा.",
            actionLabel: "आरोग्य केंद्र पहा",
          }
        ],
        safetyLevel: "safe",
        sources: ["सार्वजनिक आरोग्य विभाग महाराष्ट्र"],
      };
    } else {
      return {
        answer: "🌡️ **Primary Guidance for Fever**:\n\n1. **Hydration & Fluids**: Drink plenty of safe drinking water, ORS fluids, and electrolyte drinks.\n2. **Rest**: Take adequate bed rest and apply cool damp cloths to reduce body heat.\n3. **Visit Local PHC**: If fever exceeds 101°F (38.3°C) or lasts over 48 hours, visit your nearest **Primary Health Centre (PHC)** for free clinical evaluation and blood testing (Malaria/Dengue).\n\n*(Note: Avoid self-prescribing antibiotics without medical consultation.)*",
        groundedCards: [
          {
            type: "facility",
            title: "Primary Health Centre (PHC) Directory",
            detail: "Free OPD medical officer consultations and essential fever antipyretics.",
            actionLabel: "Find Nearest PHC",
          }
        ],
        safetyLevel: "safe",
        sources: ["National Rural Health Mission Clinical Protocols"],
      };
    }
  }

  // 3. Cough / Cold / Khansi / Khokla / Respiration
  const coughKeywords = ["cough", "khansi", "cold", "khokla", "gala", "कफ", "खांसी", "खोकला"];
  if (coughKeywords.some(kw => text.includes(kw))) {
    if (lang === "hi") {
      return {
        answer: "🫁 **खांसी और सर्दी के लिए मार्गदर्शन**:\n\n- गुनगुना पानी पिएं और भाप (steam) लें।\n- नमक के गुनगुने पानी से गरारे करें।\n- **महत्वपूर्ण**: यदि खांसी 2 सप्ताह से अधिक समय से है या बलगम में खून आ रहा है, तो नजदीकी PHC पर निःशुल्क बलगम (TB) जांच अवश्य करवाएं।",
        groundedCards: [
          {
            type: "facility",
            title: "आष्टी प्राथमिक स्वास्थ्य केंद्र (PHC)",
            detail: "निःशुल्क बलगम जांच एवं परामर्श केंद्र।",
            actionLabel: "PHC प्रोफाइल देखें",
          }
        ],
        safetyLevel: "safe",
        sources: ["राष्ट्रीय टीबी उन्मूलन कार्यक्रम (NTEP)"],
      };
    } else if (lang === "mr") {
      return {
        answer: "🫁 **खोकला आणि सर्दीसाठी सल्ला**:\n\n- कोमट पाणी प्या आणि वाफ घ्या.\n- मिठाच्या पाण्याच्या गुळण्या करा.\n- **महत्त्वाचे**: खोकला २ आठवड्यांपेक्षा जास्त काळ राहिल्यास नजीकच्या प्राथमिक आरोग्य केंद्रात थुंकी तपासणी विनामूल्य करून घ्या.",
        groundedCards: [
          {
            type: "facility",
            title: "प्राथमिक आरोग्य केंद्र",
            detail: "विनामूल्य तपासणी आणि औषधोपचार.",
            actionLabel: "तपशील पहा",
          }
        ],
        safetyLevel: "safe",
        sources: ["आरोग्य विभाग महाराष्ट्र"],
      };
    } else {
      return {
        answer: "🫁 **Guidance for Cough & Cold**:\n\n- Drink warm water and practice gentle steam inhalation.\n- Gargle with warm salt water twice daily.\n- **Crucial**: If cough persists for more than 2 weeks or involves blood/weight loss, visit your local PHC for free sputum testing.",
        groundedCards: [
          {
            type: "facility",
            title: "Primary Health Centre",
            detail: "Free sputum diagnostics, respiratory care, and essential medicines.",
            actionLabel: "View Facilities",
          }
        ],
        safetyLevel: "safe",
        sources: ["National TB Elimination Program Guidelines"],
      };
    }
  }

  // 4. Government Health Schemes & Ayushman Bharat Detection
  const schemeKeywords = ["yojana", "scheme", "ayushman", "pmjay", "mjpjay", "card", "free", "योजना", "आयुष्मान", "कार्ड"];
  if (schemeKeywords.some(kw => text.includes(kw))) {
    if (lang === "hi") {
      return {
        answer: "📜 **सत्यापित सरकारी स्वास्थ्य योजनाएं**:\n\n1. **आयुष्मान भारत (PM-JAY)**:\n   - प्रति परिवार प्रति वर्ष **₹5 लाख तक का निःशुल्क कैशलेस उपचार**।\n   - सभी सरकारी और सूचीबद्ध निजी अस्पतालों में मान्य।\n\n2. **महात्मा ज्योतिराव फुले जन आरोग्य योजना (MJPJAY)**:\n   - महाराष्ट्र राज्य के राशन कार्ड धारक परिवारों के लिए चिन्हित विशेषज्ञ सर्जरी और उपचारों पर पूर्ण कैशलेस सुविधा।\n\n3. **जरूरी दस्तावेज**: आधार कार्ड, राशन कार्ड और मोबाइल नंबर।",
        groundedCards: [
          {
            type: "scheme",
            title: "आयुष्मान भारत (PM-JAY)",
            detail: "द्वितीयक और तृतीयक अस्पताल में भर्ती के लिए ₹5,00,000 वार्षिक निःशुल्क कवरेज।",
            actionLabel: "पात्रता और दस्तावेज देखें",
          },
          {
            type: "scheme",
            title: "महात्मा ज्योतिराव फुले जन आरोग्य योजना (MJPJAY)",
            detail: "महाराष्ट्र के नागरिकों के लिए 996+ सर्जिकल व मेडिकल प्रक्रियाओं पर कैशलेस सुविधा।",
            actionLabel: "योजना विवरण देखें",
          }
        ],
        safetyLevel: "safe",
        sources: ["राष्ट्रीय स्वास्थ्य प्राधिकरण (NHA)", "सार्वजनिक आरोग्य विभाग महाराष्ट्र"],
      };
    } else if (lang === "mr") {
      return {
        answer: "📜 **शासकीय आरोग्य योजनांची माहिती**:\n\n1. **महात्मा ज्योतिराव फुले जन आरोग्य योजना (MJPJAY)**:\n   - महाराष्ट्र शासनाची मोफत कॅशलेस आरोग्य संरक्षण योजना.\n   - रेशन कार्डधारक कुटुंबांसाठी गंभीर आजारांवर मोफत उपचार.\n\n2. **आयुष्मान भारत (PM-JAY)**:\n   - प्रति वर्ष ₹5 लाख रुपयांपर्यंत मोफत कॅशलेस उपचार.\n\n3. **आवश्यक कागदपत्रे**: आधार कार्ड, रेशन कार्ड आणि उत्पन्न दाखला.",
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
        answer: "📜 **Verified Government Healthcare Schemes**:\n\n1. **Ayushman Bharat PM-JAY**:\n   - Provides **₹5 Lakh annual cashless cover** per family for secondary & tertiary hospitalizations.\n   - Valid across all public and empanelled private hospitals nationwide.\n\n2. **Mahatma Jyotirao Phule Jan Arogya Yojana (MJPJAY)**:\n   - State-sponsored catastrophic healthcare coverage for families in Maharashtra.\n\n3. **Required Documents**: Aadhaar card, Ration card, and mobile number.",
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

  // 5. PHC & Medicine Directory Queries
  const phcKeywords = ["phc", "dawa", "medicine", "doctor", "ashti", "hospital", "दवा", "डॉक्टर", "औषध", "दवाखाना", "टाइमिंग", "timing"];
  if (phcKeywords.some(kw => text.includes(kw))) {
    if (lang === "hi") {
      return {
        answer: "🏥 **प्राथमिक स्वास्थ्य केंद्र (PHC) विवरण**:\n\n- **ओपीडी समय**: प्रातः 9:00 बजे से सायं 4:00 बजे तक (सोमवार - शनिवार)।\n- **उपलब्ध सेवाएं**: डॉक्टर परामर्श, निःशुल्क आवश्यक दवाइयां (पेरासिटामोल, ओआरएस, बीपी/डायबिटीज दवाएं), टीकाकरण, और प्रसव पूर्व जांच (ANC)।\n- **आपातकालीन प्रसव कक्ष**: 24x7 खुला रहता है।",
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
        answer: "🏥 **प्राथमिक आरोग्य केंद्र (PHC) माहिती**:\n\n- **ओपीडी वेळ**: सकाळी 9:00 ते संध्याकाळी 4:00 (सोमवार ते शनिवार).\n- **मोफत सेवा**: डॉक्टर तपासणी, आवश्यक औषधे (बीपी, साखर, ताप औषध), लसीकरण आणि प्रसूती कक्ष २४ तास सुरू.\n- **तातडीची मदत**: आपत्कालीन रुग्णवाहिकेशी संलग्न.",
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
        answer: "🏥 **Primary Health Centre (PHC) Operations**:\n\n- **OPD Timings**: 9:00 AM to 4:00 PM (Monday through Saturday).\n- **Free Services**: Doctor consultations, essential generic medicines (Paracetamol, ORS, Hypertension, Diabetes medications), immunization, and ANC checkups.\n- **Emergency Casualty & Delivery Suite**: Operational 24x7.",
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

  // 6. Default Safe Grounded Healthcare Assistance
  if (lang === "hi") {
    return {
      answer: "नमस्ते! मैं **जीवनसेतु का AI स्वास्थ्य सहायक** हूँ।\n\nमैं आपको निम्नलिखित विषयों पर तुरंत सत्यापित जानकारी दे सकता हूँ:\n1. 🏥 **नजदीकी PHC और अस्पताल की जानकारी एवं ओपीडी समय**\n2. 📜 **आयुष्मान भारत (PM-JAY) एवं सरकारी स्वास्थ्य योजनाएं**\n3. 💊 **दवाइयों की उपलब्धता और प्राथमिक स्वास्थ्य मार्गदर्शन**\n4. 🚨 **108 आपातकालीन एम्बुलेंस सेवा**\n\nआप किस विषय में सहायता चाहते हैं?",
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
      answer: "नमस्कार! मी **जीवनसेतूचा AI आरोग्य सहाय्यक** आहे.\n\nमी आपल्याला खालील विषयांवर त्वरित अधिकृत माहिती देऊ शकतो:\n1. 🏥 **प्राथमिक आरोग्य केंद्र (PHC) आणि ओपीडी वेळ**\n2. 📜 **महात्मा फुले जन आरोग्य योजना व आयुष्मान भारत**\n3. 💊 **आवश्यक औषध उपलब्धता**\n4. 🚨 **108 आपत्कालीन रुग्णवाहिका संपर्क**\n\nआपल्याला कोणती मदत हवी आहे?",
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
      answer: "Hello! I am your **JeevanSetu AI Healthcare Assistant**.\n\nI provide instant verified guidance on:\n1. 🏥 **Primary Health Centres (PHC) & Doctor Schedules**\n2. 📜 **Ayushman Bharat (PM-JAY) & State Health Schemes**\n3. 💊 **Essential Medicines & Non-Diagnostic Primary Guidance**\n4. 🚨 **108 Emergency Ambulance Coordination**\n\nHow can I help you today?",
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
