const { supabase, isConfigured } = require("../config/supabase");
const auditService = require("./audit.service");

// Structured IVR DTMF flow schema in 3 languages
const ivrMenus = {
  en: {
    welcome: "Welcome to JeevanSetu Healthcare IVR dispatch. Press 1 for English, 2 for Hindi, 3 for Marathi.",
    mainMenu: {
      prompt: "Main Menu: Press 1 for General Health Info, 2 for Facility Directory, 3 for Referral Status, 4 for Medicine Stock, 5 for Schemes, 6 for ASHA Callback, 9 for Emergency Escalation.",
      options: {
        "1": "General Health Info: Press 1 for Monsoon Prevention, 2 for Heatwave Advisory, 3 for Child Vaccination.",
        "2": "Facility Directory: Press 1 to find Nearest PHC, 2 for District Civil Hospital.",
        "3": "Referral Status: Enter your 6-digit Case Number to retrieve active transfer updates.",
        "4": "Medicine Stock: Press 1 for Paracetamol, 2 for Anti-snake venom, 3 for Antibiotics.",
        "5": "Govt Schemes: Press 1 for PMJAY, 2 for MJPJAY (Mahatma Jyotirao Phule Jan Arogya Yojana).",
        "6": "ASHA Callback: A frontline health worker will visit your home within 24 hours.",
        "9": "EMERGENCY: Immediate routing to MEMS 108 Ambulance Dispatch."
      }
    }
  },
  hi: {
    welcome: "जीवनसेतु स्वास्थ्य आईवीआर सेवा में आपका स्वागत है। अंग्रेजी के लिए 1, हिंदी के लिए 2, मराठी के लिए 3 दबाएं।",
    mainMenu: {
      prompt: "मुख्य मेनू: सामान्य स्वास्थ्य जानकारी के लिए 1, स्वास्थ्य केंद्र खोजने के लिए 2, रेफरल स्थिति के लिए 3, दवा स्टॉक के लिए 4, सरकारी योजनाओं के लिए 5, आशा कार्यकर्ता सहायता के लिए 6, आपातकालीन सेवा के लिए 9 दबाएं।",
      options: {
        "1": "स्वास्थ्य जानकारी: मानवाधिकार सुरक्षा के लिए 1, लू से बचाव के लिए 2, टीकाकरण के लिए 3 दबाएं।",
        "2": "स्वास्थ्य केंद्र: नजदीकी पीएचसी (PHC) के लिए 1, जिला सिविल अस्पताल के लिए 2 दबाएं।",
        "3": "रेफरल स्थिति: अपडेट प्राप्त करने के लिए अपना 6-अंकीय केस नंबर दर्ज करें।",
        "4": "दवा स्टॉक: पैरासिटामोल के लिए 1, सर्पदंश रोधी दवा के लिए 2 दबाएं।",
        "5": "सरकारी योजनाएं: पीएम-जय (PM-JAY) के लिए 1, महात्मा ज्योतिराव फुले जन आरोग्य योजना (MJPJAY) के लिए 2 दबाएं।",
        "6": "आशा कार्यकर्ता संपर्क: आपके गांव की आशा कार्यकर्ता आपसे २४ घंटे में संपर्क करेगी।",
        "9": "आपातकाल: सीधे महाराष्ट्र १०८ एम्बुलेंस सेवा से संपर्क करने के लिए ९ दबाएं।"
      }
    }
  },
  mr: {
    welcome: "जीवनसेतू आरोग्य आयव्हीआर सेवेमध्ये आपले स्वागत आहे. इंग्रजीसाठी 1, हिंदीसाठी 2, मराठीसाठी 3 दाबा.",
    mainMenu: {
      prompt: "मुख्य मेनू: सामान्य आरोग्य माहितीसाठी 1, आरोग्य केंद्र शोधण्यासाठी 2, रेफरल स्थितीसाठी 3, औषध साठ्यासाठी 4, सरकारी योजनांसाठी 5, आशा सेविका संपर्कासाठी 6, आपत्कालीन सेवेसाठी 9 दाबा.",
      options: {
        "1": "आरोग्य माहिती: पावसाळी आजार मार्गदर्शनासाठी 1, उष्माघातापासून बचावासाठी 2, बाल लसीकरणासाठी 3 दाबा.",
        "2": "आरोग्य केंद्र: जवळील प्राथमिक आरोग्य केंद्रासाठी (PHC) 1, जिल्हा सिव्हिल हॉस्पिटलसाठी 2 दाबा.",
        "3": "रेफरल स्थिती: आपली रेफरल स्थिती जाणून घेण्यासाठी ६-अंकी केस नंबर टाका.",
        "4": "औषध साठा: पॅरासिटामॉलसाठी 1, सर्पदंश लस साठ्यासाठी 2 दाबा.",
        "5": "सरकारी योजना: पीएम-जय (PMJAY) योजनेसाठी 1, महात्मा ज्योतिराव फुले जन आरोग्य योजनेसाठी (MJPJAY) 2 दाबा.",
        "6": "आशा सेविका संपर्क: तुमच्या गावातील आशा सेविका २४ तासात घरी येऊन संपर्क करतील.",
        "9": "आपत्कालीन: त्वरित १०८ रुग्णवाहिका विभागाशी जोडण्यासाठी ९ दाबा."
      }
    }
  }
};

const getIvrFlow = async (lang = "en") => {
  const selectedLang = lang === "mr" || lang === "hi" ? lang : "en";
  return ivrMenus[selectedLang];
};

const submitAssistedRequest = async (user, payload) => {
  const { citizen_name, citizen_phone, service_requested, details, citizen_consent_given } = payload;

  if (!citizen_name || !service_requested) {
    throw new Error("Citizen Name and Service Requested are required fields");
  }

  if (!citizen_consent_given) {
    throw new Error("Explicit patient consent is mandatory for assisted access request");
  }

  // Double check authorization: Only ASHA (profile role phc_staff/doctor/admin/hospital_staff) can assist
  if (!["phc_staff", "doctor", "hospital_staff", "district_admin"].includes(user.role)) {
    throw new Error("Unauthorized: Assisted access can only be registered by authorized health coordinators.");
  }

  if (!isConfigured) {
    const mockRequest = {
      id: `request-${Date.now()}`,
      asha_id: user.profileId || "asha-worker-1",
      citizen_name,
      citizen_phone: citizen_phone || null,
      citizen_consent_given: true,
      service_requested,
      details: details || "",
      status: "COMPLETED",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return mockRequest;
  }

  // Insert assisted request audit trail in Supabase
  const { data, error } = await supabase
    .from("assisted_access_requests")
    .insert({
      asha_id: user.profileId,
      citizen_name,
      citizen_phone,
      citizen_consent_given: true,
      service_requested,
      details,
      status: "COMPLETED",
    })
    .select("*")
    .single();

  if (error) throw error;

  // Log audit event for tracking assisted health coordination
  await auditService.logAuditEvent({
    actor_id: user.profileId,
    action: "ASHA_ASSISTED_ACCESS_REQUESTED",
    entity_type: "assisted_access",
    entity_id: data.id,
    metadata: {
      citizen_name,
      service_requested,
      consent: true,
    },
  });

  return data;
};

module.exports = {
  getIvrFlow,
  submitAssistedRequest,
};
