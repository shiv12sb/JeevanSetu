/**
 * ==============================================================================
 * JEEVANSETU PHASE 26 — CITIZEN FEEDBACK MULTILINGUAL CONTENT DICTIONARY
 * ==============================================================================
 * Curated, non-punitive, accessible voice and text prompt scripts for
 * Hindi, Marathi, and English. Strictly avoids clinical diagnosis or accusations.
 */

const FEEDBACK_CONTENT = {
  hi: {
    welcome: "जीवनसेतु स्वास्थ्य सेवा नागरिक प्रतिक्रिया प्रणाली में आपका स्वागत है।",
    language_prompt: "हिंदी के लिए 1 दबाएं। मराठीसाठी 2 दाबा। For English, press 3.",
    privacy_notice: "आपकी प्रतिक्रिया पूरी तरह गोपनीय है। कृपया इसमें अपनी कोई निजी बीमारी या मेडिकल पर्चा न बताएं।",
    
    // Facility / Target Menu
    facility_menu: "कृपया स्वास्थ्य केंद्र का प्रकार चुनें: प्राथमिक स्वास्थ्य केंद्र (PHC) के लिए 1 दबाएं। ग्रामीण या जिला अस्पताल के लिए 2 दबाएं। रेफरल सेवा अनुभव के लिए 3 दबाएं। सामान्य जिला सेवा के लिए 4 दबाएं। समाप्त करने के लिए 5 दबाएं।",
    
    // Rating Menu (1 - 5)
    rating_prompt: "कृपया अपना सेवा अनुभव रेट करें: 1 बहुत खराब, 2 खराब, 3 सामान्य, 4 अच्छा, अथवा 5 बहुत अच्छा के लिए दबाएं। रेटिंग न देने के लिए 0 दबाएं।",
    
    // Category Menu (1 - 9)
    category_prompt: "प्रतिक्रिया का मुख्य विषय चुनें: प्राथमिक स्वास्थ्य सेवा के लिए 1, डॉक्टर की उपलब्धता के लिए 2, स्वास्थ्य कर्मचारियों के व्यवहार के लिए 3, दवाओं की उपलब्धता के लिए 4, प्रतीक्षा समय के लिए 5, स्वच्छता व सुविधा के लिए 6, रेफरल अनुभव के लिए 7, आपातकालीन सेवा के लिए 8, या अन्य विषय के लिए 9 दबाएं।",
    
    // Voice Recording Prompt
    voice_prompt: "यदि आप बीप के बाद 30 सेकंड का संक्षिप्त वॉयस संदेश रिकॉर्ड करना चाहते हैं तो 1 दबाएं, अथवा सीधे सबमिट करने के लिए 2 दबाएं।",
    voice_recording_start: "कृपया बीप के बाद अपनी बात कहें और समाप्त होने पर हैश (#) दबाएं।",
    
    // Confirmation
    confirmation: "आपकी सेवा प्रतिक्रिया सफलतापूर्वक दर्ज कर ली गई है। स्वास्थ्य सेवाओं को बेहतर बनाने में सहयोग के लिए धन्यवाद। नमस्ते।",
    
    // Error & Timeout
    invalid_input: "अमान्य विकल्प। कृपया सही संख्या चुनें।",
    timeout_message: "कोई इनपुट प्राप्त नहीं हुआ। मेनू दोहराया जा रहा है।",
    max_retries_exceeded: "अधिकतम प्रयास पूरे हुए। कॉल समाप्त की जा रही है। धन्यवाद।",
    
    // Categories Labels Map
    categories: {
      PHC_SERVICE: "प्राथमिक स्वास्थ्य सेवा",
      DOCTOR_AVAILABILITY: "डॉक्टर की उपलब्धता",
      STAFF_BEHAVIOUR: "कर्मचारियों का व्यवहार",
      MEDICINE_AVAILABILITY: "दवाओं की उपलब्धता",
      WAITING_TIME: "प्रतीक्षा समय",
      CLEANLINESS_FACILITY: "स्वच्छता व सुविधा",
      REFERRAL_EXPERIENCE: "रेफरल अनुभव",
      EMERGENCY_SERVICE_ACCESS: "आपातकालीन सेवा",
      OTHER: "अन्य विषय",
    },
  },

  mr: {
    welcome: "जीवनसेतू आरोग्य सेवा नागरिक अभिप्राय प्रणालीमध्ये आपले स्वागत आहे.",
    language_prompt: "हिंदी के लिए 1 दबाएं. मराठीसाठी 2 दाबा. For English, press 3.",
    privacy_notice: "आपला अभिप्राय पूर्णपणे गोपनीय आहे. कृपया कोणताही खाजगी वैद्यकीय आजार किंवा माहिती नमूद करू नका.",
    
    // Facility / Target Menu
    facility_menu: "कृपया आरोग्य केंद्राचा प्रकार निवडा: प्राथमिक आरोग्य केंद्र (PHC) साठी 1 दाबा. ग्रामीण किंवा जिल्हा रुग्णालयासाठी 2 दाबा. रेफरल अनुभवासाठी 3 दाबा. सामान्य सेवेसाठी 4 दाबा. कॉल संपवण्यासाठी 5 दाबा.",
    
    // Rating Menu (1 - 5)
    rating_prompt: "कृपया आपला सेवा अनुभव नोंदवा: 1 अतिशय वाईट, 2 वाईट, 3 मध्यम, 4 चांगले, किंवा 5 खूप चांगले साठी दाबा. रेटिंग न देण्यासाठी 0 दाबा.",
    
    // Category Menu (1 - 9)
    category_prompt: "अभिप्रायाचा मुख्य विषय निवडा: PHC सेवेसाठी 1, डॉक्टर उपलब्धतेसाठी 2, कर्मचाऱ्यांच्या वर्तनासाठी 3, औषध साठ्यासाठी 4, प्रतीक्षा वेळेसाठी 5, स्वच्छता व सुविधेसाठी 6, रेफरल अनुभवासाठी 7, आपत्कालीन सेवेसाठी 8, किंवा इतर विषयासाठी 9 दाबा.",
    
    // Voice Recording Prompt
    voice_prompt: "आपल्याला 30 सेकंदांचा संक्षिप्त व्हॉईस संदेश नोंदवायचा असल्यास 1 दाबा, किंवा थेट सबमिट करण्यासाठी 2 दाबा.",
    voice_recording_start: "कृपया बीप नंतर बोला आणि पूर्ण झाल्यावर हॅश (#) दाबा.",
    
    // Confirmation
    confirmation: "आपला अभिप्राय यशस्वीरीत्या नोंदवला गेला आहे. आरोग्य सेवा सुधारण्यास मदत केल्याबद्दल धन्यवाद. नमस्कार.",
    
    // Error & Timeout
    invalid_input: "चुकीचा पर्याय. कृपया योग्य क्रमांक निवडा.",
    timeout_message: "कोणताही प्रतिसाद मिळाला नाही. मेनू पुन्हा सुरू होत आहे.",
    max_retries_exceeded: "कमाल मर्यादा संपली. कॉल बंद होत आहे. धन्यवाद.",
    
    // Categories Labels Map
    categories: {
      PHC_SERVICE: "प्राथमिक आरोग्य सेवा",
      DOCTOR_AVAILABILITY: "डॉक्टर उपलब्धता",
      STAFF_BEHAVIOUR: "कर्मचाऱ्यांचे वर्तन",
      MEDICINE_AVAILABILITY: "औषध उपलब्धता",
      WAITING_TIME: "प्रतीक्षा वेळ",
      CLEANLINESS_FACILITY: "स्वच्छता व सुविधा",
      REFERRAL_EXPERIENCE: "रेफरल अनुभव",
      EMERGENCY_SERVICE_ACCESS: "आपत्कालीन सेवा",
      OTHER: "इतर विषय",
    },
  },

  en: {
    welcome: "Welcome to the JeevanSetu Healthcare Citizen Feedback System.",
    language_prompt: "Press 1 for Hindi. Press 2 for Marathi. Press 3 for English.",
    privacy_notice: "Your feedback is strictly confidential. Please do not share sensitive personal medical diagnoses.",
    
    // Facility / Target Menu
    facility_menu: "Please select facility type: Press 1 for Primary Health Centre (PHC). Press 2 for District or Sub-District Hospital. Press 3 for Referral Experience. Press 4 for General District Healthcare. Press 5 to exit.",
    
    // Rating Menu (1 - 5)
    rating_prompt: "Please rate your experience: Press 1 for Very Poor, 2 for Poor, 3 for Average, 4 for Good, or 5 for Very Good. Press 0 to skip rating.",
    
    // Category Menu (1 - 9)
    category_prompt: "Select feedback topic: Press 1 for PHC Service, 2 for Doctor Availability, 3 for Staff Behaviour, 4 for Medicine Availability, 5 for Waiting Time, 6 for Cleanliness & Facility, 7 for Referral Experience, 8 for Emergency Service, or 9 for Other.",
    
    // Voice Recording Prompt
    voice_prompt: "Press 1 to record an optional 30-second voice comment after the tone, or press 2 to submit directly.",
    voice_recording_start: "Please speak your comment after the beep, then press hash (#) when finished.",
    
    // Confirmation
    confirmation: "Your feedback has been recorded. Thank you for helping improve rural healthcare delivery. Goodbye.",
    
    // Error & Timeout
    invalid_input: "Invalid selection. Please choose a valid digit.",
    timeout_message: "No input received. Repeating menu.",
    max_retries_exceeded: "Maximum attempts exceeded. Call disconnected. Thank you.",
    
    // Categories Labels Map
    categories: {
      PHC_SERVICE: "PHC Service",
      DOCTOR_AVAILABILITY: "Doctor Availability",
      STAFF_BEHAVIOUR: "Staff Behaviour",
      MEDICINE_AVAILABILITY: "Medicine Availability",
      WAITING_TIME: "Waiting Time",
      CLEANLINESS_FACILITY: "Cleanliness / Facility",
      REFERRAL_EXPERIENCE: "Referral Experience",
      EMERGENCY_SERVICE_ACCESS: "Emergency / Service Access",
      OTHER: "Other",
    },
  },
};

const getFeedbackContent = (lang = "hi") => {
  const c = FEEDBACK_CONTENT[lang] || FEEDBACK_CONTENT.hi;
  return { ...c, timeout: c.timeout_message };
};

module.exports = {
  FEEDBACK_CONTENT,
  getFeedbackContent,
};
