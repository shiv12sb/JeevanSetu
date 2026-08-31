const { supabase, isConfigured } = require("../config/supabase");
const auditService = require("./audit.service");

// Structured IVR DTMF & Voice Agent Script in 3 Languages (Default: Marathi)
const ivrMenus = {
  mr: {
    language_name: "मराठी (Default)",
    toll_free_number: "1800-108-102",
    welcome: "नमस्कार, मी जीवनसेतू शासकीय आरोग्य सहाय्यक बोलत आहे. ही मोफत शासकीय आरोग्य मार्गदर्शन सेवा आहे. मराठीसाठी १ दाबा, हिंदी के लिए २ दबाएं, for English press ३.",
    mainMenu: {
      prompt: "जीवनसेतू आरोग्य सेवेमध्ये आपले स्वागत आहे. पावसाळी आजार आणि साथीच्या रोगांच्या माहितीसाठी १ दाबा. मोफत जननी शिशु सुरक्षा आणि गरोदर महिला तपासणीसाठी २ दाबा. आयुष्मान भारत व महात्मा फुले जन आरोग्य योजनेच्या मोफत उपचारांसाठी ३ दाबा. किंवा तुमच्या गावातील आशा सेविकेकडून घरपोच तपासणी आणि संपर्कासाठी ४ दाबा. आपत्कालीन रुग्णवाहिकेसाठी ९ दाबा.",
      options: {
        "1": "पावसाळी आजार मार्गदर्शन: दूषित पाणी उकळून प्या, ताप आल्यास त्वरित जवळच्या प्राथमिक आरोग्य केंद्रात (PHC) मोफत रक्ततपासणी करा.",
        "2": "माता व बाल संगोपन: शासकीय रुग्णालयात मोफत प्रसूती, १०२ मोफत रुग्णवाहिका आणि जननी सुरक्षा योजनेअंतर्गत आर्थिक लाभ उपलब्ध आहेत.",
        "3": "शासकीय मोफत उपचार योजना: महात्मा जोतीराव फुले जन आरोग्य योजना (MJPJAY) आणि आयुष्मान भारत अंतर्गत ५ लाखांपर्यंत मोफत कॅशलेस उपचार मिळतात.",
        "4": "आशा सेविका संपर्क: धन्यवाद! तुमच्या मोबाईल नंबरची नोंदणी जीवनसेतू प्रणालीमध्ये यशस्वी झाली आहे. तुमच्या परिसरातील आशा सेविका लवकरच या नंबरवर फोन करून प्रत्यक्ष भेट देतील.",
        "9": "आपत्कालीन: त्वरित १०८ मोफत रुग्णवाहिका विभागाशी जोडले जात आहे.",
      },
    },
  },
  hi: {
    language_name: "हिन्दी",
    toll_free_number: "1800-108-102",
    welcome: "नमस्कार, मैं जीवनसेतु शासकीय स्वास्थ्य सहायक बोल रहा हूँ। यह निःशुल्क स्वास्थ्य मार्गदर्शन सेवा है। हिंदी के लिए २ दबाएं, मराठीसाठी १ दाबा, for English press ३.",
    mainMenu: {
      prompt: "जीवनसेतु स्वास्थ्य सेवा में आपका स्वागत है। मौसमी बीमारियों की जानकारी के लिए १ दबाएं। गर्भवती महिलाओं एवं शिशु देखभाल के लिए २ दबाएं। आयुष्मान भारत एवं मुफ्त इलाज योजनाओं के लिए ३ दबाएं। या अपने गांव की आशा कार्यकर्ता से घर पर परामर्श हेतु ४ दबाएं। आपातकाल के लिए ९ दबाएं।",
      options: {
        "1": "मौसमी बीमारी सुरक्षा: पानी उबालकर पिएं, बुखार होने पर नजदीकी प्राथमिक स्वास्थ्य केंद्र (PHC) में मुफ्त जांच कराएं।",
        "2": "मातृ एवं शिशु स्वास्थ्य: सरकारी अस्पताल में मुफ्त प्रसव, १०२ मुफ्त एम्बुलेंस और जननी सुरक्षा योजना का लाभ उपलब्ध है।",
        "3": "मुफ्त इलाज योजनाएं: आयुष्मान भारत एवं महात्मा फुले योजना (MJPJAY) के तहत ५ लाख रुपये तक का मुफ्त इलाज उपलब्ध है।",
        "4": "आशा कार्यकर्ता संपर्क: धन्यवाद! आपका मोबाइल नंबर जीवनसेतु प्रणाली में दर्ज हो गया है। आपके गांव की आशा कार्यकर्ता जल्द ही आपसे संपर्क करेंगी।",
        "9": "आपातकाल: सीधे १०८ एम्बुलेंस नियंत्रण कक्ष से जोड़ा जा रहा है।",
      },
    },
  },
  en: {
    language_name: "English",
    toll_free_number: "1800-108-102",
    welcome: "Hello, this is the JeevanSetu Government Health Voice Assistant. Press 1 for Marathi, 2 for Hindi, 3 for English.",
    mainMenu: {
      prompt: "Welcome to JeevanSetu Healthcare. Press 1 for Seasonal Disease Advisory. Press 2 for Maternal & Child Care. Press 3 for Free Government Health Schemes. Press 4 to Request a Home Visit from your Village ASHA Worker. Press 9 for 108 Emergency Dispatch.",
      options: {
        "1": "Seasonal Advisory: Drink boiled water, report fevers immediately to your nearest PHC for free testing.",
        "2": "Maternal Health: 100% Free hospital deliveries, free 102 transport, and cash incentives under JSSK.",
        "3": "Health Schemes: Cashless treatment up to 5 Lakhs under Ayushman Bharat (PM-JAY) and MJPJAY.",
        "4": "ASHA Worker Request: Thank you! Your mobile number is registered. Your local ASHA worker will call you or visit your home within 24 hours.",
        "9": "EMERGENCY: Immediate routing to MEMS 108 Ambulance Dispatch.",
      },
    },
  },
};

// In-Memory Live ASHA Worker Dispatch Queue Store
let ashaIncomingQueueStore = [
  {
    id: "queue-ticket-101",
    phone: "+91 98220 44512",
    citizen_name: "Pending ASHA Verification",
    district: "Gadchiroli",
    taluka: "Ashti",
    language: "mr",
    source: "KEYPAD_IVR_KEY_4",
    status: "PENDING_CALL",
    notes: "Citizen requested ASHA home visit via Toll-Free 1800-108-102.",
    created_at: new Date(Date.now() - 1200000).toISOString(),
    priority: "HIGH",
  },
  {
    id: "queue-ticket-102",
    phone: "+91 94231 88901",
    citizen_name: "Pending ASHA Verification",
    district: "Wardha",
    taluka: "Karanja",
    language: "mr",
    source: "KEYPAD_IVR_KEY_4",
    status: "HOME_VISIT_SCHEDULED",
    notes: "Maternal nutrition checkup requested by resident.",
    created_at: new Date(Date.now() - 3600000).toISOString(),
    priority: "NORMAL",
  },
];

// In-Memory Outbound Voice Sessions Store
let outboundCallSessions = [];

const getIvrFlow = async (lang = "mr") => {
  const selectedLang = lang === "en" || lang === "hi" ? lang : "mr";
  return ivrMenus[selectedLang];
};

/**
 * Service: Request Outbound AI Voice Helpline Call to a Citizen's Feature Phone
 */
const requestOutboundVoiceCall = async (user, payload = {}) => {
  const { recipient_phone, district = "Nagpur", language = "mr", topic = "general_awareness" } = payload;

  if (!recipient_phone || !recipient_phone.trim()) {
    throw new Error("Recipient Mobile Number is required to dispatch voice call");
  }

  const cleanPhone = recipient_phone.trim();
  const sessionId = `call-outbound-${Date.now()}`;

  const session = {
    session_id: sessionId,
    recipient_phone: cleanPhone,
    caller_id: "1800-108-102",
    district,
    language: language || "mr",
    topic,
    status: "DISPATCHED_RINGING",
    initiated_by: user ? user.email || user.role : "Citizen Neighbor / Volunteer",
    scheduled_at: new Date().toISOString(),
    estimated_connect_seconds: 5,
    menu_tree: ivrMenus[language] || ivrMenus.mr,
  };

  outboundCallSessions.unshift(session);

  return {
    success: true,
    message: `Automated voice call successfully dispatched from Toll-Free 1800-108-102 to ${cleanPhone}.`,
    session,
  };
};

/**
 * Service: Handle Keypad DTMF Action (e.g. When citizen presses Key 4)
 */
const handleIvrDtmfAction = async (payload = {}) => {
  const { session_id, phone, pressed_key, language = "mr", district = "Nagpur" } = payload;

  if (pressed_key === "4" || pressed_key === 4) {
    // Automatically inject citizen's mobile number into Live ASHA Dispatch Queue
    const newTicket = {
      id: `queue-ticket-${Date.now()}`,
      phone: phone || "+91 98220 99999",
      citizen_name: "Village Resident (Pending ASHA Checkup)",
      district: district || "Nagpur",
      taluka: "Local Taluka",
      language: language || "mr",
      source: "KEYPAD_IVR_KEY_4",
      status: "PENDING_CALL",
      notes: "Citizen pressed Key 4 on Toll-Free 1800-108-102 requesting ASHA home visit.",
      created_at: new Date().toISOString(),
      priority: "HIGH",
    };

    ashaIncomingQueueStore.unshift(newTicket);

    return {
      success: true,
      action: "ASHA_QUEUE_REGISTERED",
      spoken_response: ivrMenus[language]?.mainMenu?.options["4"] || ivrMenus.mr.mainMenu.options["4"],
      ticket: newTicket,
    };
  }

  const spokenOption = ivrMenus[language]?.mainMenu?.options[pressed_key] || "Invalid Option Selected.";
  return {
    success: true,
    action: `OPTION_${pressed_key}_PLAYED`,
    spoken_response: spokenOption,
  };
};

/**
 * Service: Get Live Inbound ASHA Dispatch Queue
 */
const getAshaIncomingQueue = async (params = {}) => {
  const { district, status } = params;
  let list = [...ashaIncomingQueueStore];

  if (district && district !== "ALL") {
    list = list.filter((t) => t.district.toLowerCase() === district.toLowerCase());
  }

  if (status && status !== "ALL") {
    list = list.filter((t) => t.status === status);
  }

  return list;
};

/**
 * Service: Update ASHA Queue Ticket Status (e.g. ASHA called citizen / visited home)
 */
const updateAshaQueueStatus = async (ticketId, payload = {}) => {
  const { status, citizen_name, vitals_notes } = payload;
  const ticket = ashaIncomingQueueStore.find((t) => t.id === ticketId);

  if (!ticket) {
    throw new Error("ASHA queue ticket not found");
  }

  if (status) ticket.status = status;
  if (citizen_name) ticket.citizen_name = citizen_name;
  if (vitals_notes) ticket.notes = vitals_notes;
  ticket.updated_at = new Date().toISOString();

  return {
    success: true,
    message: `Ticket ${ticketId} updated to ${status}`,
    ticket,
  };
};

/**
 * Service: Submit Assisted Access Request (Form Flow)
 */
const submitAssistedRequest = async (user, payload) => {
  const { citizen_name, citizen_phone, service_requested, details, citizen_consent_given } = payload;

  if (!citizen_name || !service_requested) {
    throw new Error("Citizen Name and Service Requested are required fields");
  }

  if (!citizen_consent_given) {
    throw new Error("Explicit patient consent is mandatory for assisted access request");
  }

  if (user && !["phc_staff", "doctor", "hospital_staff", "district_admin", "patient", "asha_worker"].includes(user.role)) {
    throw new Error("Unauthorized: Assisted access can only be registered by authorized health coordinators.");
  }

  const mockRequest = {
    id: `request-${Date.now()}`,
    asha_id: user?.profileId || "asha-worker-1",
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
};

module.exports = {
  getIvrFlow,
  requestOutboundVoiceCall,
  handleIvrDtmfAction,
  getAshaIncomingQueue,
  updateAshaQueueStatus,
  submitAssistedRequest,
};
