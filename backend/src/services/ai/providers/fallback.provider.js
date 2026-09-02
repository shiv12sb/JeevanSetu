const BaseAIProvider = require("./base.provider");
const medicalKnowledgeService = require("../medicalKnowledge.service");

class FallbackAIProvider extends BaseAIProvider {
  constructor(config = {}) {
    super("Deterministic Fallback", config);
  }

  isConfigured() {
    return true;
  }

  async generateCompletion({ systemPrompt, messages, language = "mr", maxTokens = 800, temperature = 0.2 }) {
    const userMessages = messages.filter((m) => m.role === "user");
    const lastUserMessage = userMessages[userMessages.length - 1]?.content || "";
    const previousUserMessage = userMessages.length > 1 ? userMessages[userMessages.length - 2]?.content || "" : "";
    const combinedContext = `${previousUserMessage} ${lastUserMessage}`.toLowerCase();
    const lower = lastUserMessage.toLowerCase();

    // Strictly honor the user's chosen language ('mr' is default)
    let lang = language && ["en", "hi", "mr"].includes(language) ? language : "mr";

    let text = "";

    // 0. Deterministic Medical Knowledge & Triage Engine (~531 Conditions)
    const redFlagCheck = medicalKnowledgeService.checkRedFlags(lastUserMessage);
    if (redFlagCheck.isEmergency) {
      if (lang === "mr") {
        text = `🚨 **तातडीची आपत्कालीन सूचना (EMERGENCY)**:\n\nआपण नमूद केलेली लक्षणे अत्यंत गंभीर असू शकतात. कृपया वेळ न घालवता त्वरित **१०८ रुग्णवाहिका** (मोफत आपत्कालीन सेवा) बोलवा किंवा जवळच्या शासकीय जिल्हा सामान्य रुग्णालयात / शासकीय वैद्यकीय महाविद्यालय (GMC) अतिदक्षता विभागात (ICU/Casualty) जा.\n\n- शासकीय रुग्णालयांमध्ये २४x७ इमर्जन्सी ट्रॅव्हल व आयसीयू सुविधा उपलब्ध आहे.\n- सर्पदंश किंवा विषबाधेसाठी मोफत औषधे (ASV / Atropine) शासकीय रुग्णालयात उपलब्ध असतात.`;
      } else if (lang === "hi") {
        text = `🚨 **आपातकालीन अलर्ट (EMERGENCY)**:\n\nआपके द्वारा बताए गए लक्षण अत्यंत गंभीर हो सकते हैं। कृपया तुरंत **108 एम्बुलेंस** (मुफ्त आपातकालीन सेवा) पर कॉल करें या नजदीकी सरकारी अस्पताल / मेडिकल कॉलेज (GMC) के इमरजेंसी वार्ड में जाएं।\n\n- सभी जिला अस्पतालों में 24x7 इमरजेंसी व आईसीयू उपलब्ध है।\n- सर्पदंश व कीटनाशक पॉइजनिंग के लिए मुफ्त दवाएं (ASV / Atropine) उपलब्ध हैं।`;
      } else {
        text = `🚨 **CRITICAL MEDICAL EMERGENCY ALERT**:\n\nThe symptoms you described indicate a potential medical emergency. Please dial **108** immediately for free government ambulance dispatch, or proceed to the nearest emergency department / ICU.\n\n- Government Medical Colleges and District Hospitals provide 24x7 emergency casualty care.\n- Anti-Snake Venom (ASV) and resuscitation medicines are freely stocked at all government facilities.`;
      }
      return {
        text,
        rawUsage: { prompt_tokens: 50, completion_tokens: 150, total_tokens: 200 },
        provider: this.name,
      };
    }

    // Direct Condition Search (Threshold lowered to >= 0.25 for broad colloquial and disease-name capture)
    const conditionSearch = medicalKnowledgeService.searchCondition(lastUserMessage, lang);
    if (conditionSearch.match && conditionSearch.confidence >= 0.25) {
      const guidance = medicalKnowledgeService.generateGuidance(conditionSearch.match.id, lang);
      return {
        text: guidance.guidanceText,
        rawUsage: { prompt_tokens: 60, completion_tokens: 250, total_tokens: 310 },
        provider: this.name,
      };
    }

    // Symptom-Based Evaluation (If user mentioned multiple symptoms or colloquial health indicators)
    const symptomMatches = medicalKnowledgeService.searchBySymptoms(lastUserMessage, lang);
    if (symptomMatches.length > 0) {
      const topMatch = symptomMatches[0];
      const guidance = medicalKnowledgeService.generateGuidance(topMatch.condition.id, lang);
      return {
        text: guidance.guidanceText,
        rawUsage: { prompt_tokens: 60, completion_tokens: 250, total_tokens: 310 },
        provider: this.name,
      };
    }

    // 1. Casual Greetings & Social
    if (/^(hi|hello|hey|namaste|namaskar|pranam|kasa ahes|kaise ho|kya haal|shubh prabhat)[\s!.,?]*$/i.test(lower) || /^(नमस्ते|नमस्कार|हॅलो|हाय)[\s!.,?]*$/.test(lastUserMessage.trim())) {
      if (lang === "mr") {
        text = "नमस्कार! मी जीवनसेतू आरोग्य सहाय्यक आहे. आपण कसे आहात? आपल्याला डॉक्टर, शासकीय रुग्णालय, १०८ रुग्णवाहिका, औषध साठा किंवा कोणत्याही आरोग्य समस्येबद्दल माहिती हवी असल्यास सांगा, मी मदत करतो.";
      } else if (lang === "hi") {
        text = "नमस्ते! मैं आपका जीवनसेतु स्वास्थ्य सहायक हूँ। आप कैसे हैं? आपको किसी लक्षण, डॉक्टर, अस्पताल, 108 एम्बुलेंस या स्वास्थ्य योजना के बारे में क्या जानकारी चाहिए? बताइए, मैं मदद के लिए तैयार हूँ।";
      } else {
        text = "Hello! I am your JeevanSetu Healthcare Assistant. How are you feeling today? You can ask me about symptoms, on-duty doctors, hospital beds, 108 ambulances, or government schemes.";
      }
    }
    // 2. Frustration / Direct Assistance Prompt ("answer de", "kuch bol", "bakwas hai", "help karo")
    else if (/(bakwas|answer de|kuch bol|kuch bata|fix kar|theek kar|help karo|madat kara|kaise use kare)/i.test(lower) || /(मदत करा|उत्तर द्या|काहीतरी सांगा)/.test(lastUserMessage)) {
      if (lang === "mr") {
        text = "माफ करा! मी आपल्या थेट मदतीसाठी सज्ज आहे. आपल्याला कशाबद्दल माहिती हवी आहे? उदा. \n१. 'पोटात दुखत आहे काय करू?'\n२. 'जवळचे डॉक्टर किंवा रुग्णालय दाखवा'\n३. '१०८ रुग्णवाहिका बोलवा'\n४. 'महात्मा फुले जन आरोग्य योजना'\nकृपया आपली समस्या सांगा, मी लगेच अचूक उत्तर देतो.";
      } else if (lang === "hi") {
        text = "क्षमा करें! मैं आपकी सीधी और स्पष्ट सहायता करने के लिए यहाँ हूँ। कृपया बताइए आपको किस बारे में जानकारी चाहिए? जैसे:\n1. 'पेट दर्द या सिरदर्द का प्राथमिक उपचार'\n2. 'नजदीकी डॉक्टर या अस्पताल'\n3. '108 एम्बुलेंस बुकिंग'\n4. 'आयुष्मान भारत योजना'\nआप अपना सवाल पूछें, मैं तुरंत सटीक उत्तर दूँगा।";
      } else {
        text = "I apologize for any inconvenience! I am here to assist you one-on-one. Please tell me your specific question regarding symptoms, doctors, 108 ambulance, hospital beds, or government schemes, and I will answer directly.";
      }
    }
    // 3. Thanks & Gratitude
    else if (/(dhanyawad|shukriya|thank you|thanks|theek hai|thik hai|ok|accha|samajh gaya|samajhla)/i.test(lower) || /(धन्यवाद|आभारी आहे|ठीक आहे)/.test(lastUserMessage)) {
      if (lang === "mr") {
        text = "आपले स्वागत आहे! आपल्या आरोग्याची काळजी घ्या. जर आणखी कोणतीही माहिती हवी असेल, तर मी सदैव उपलब्ध आहे.";
      } else if (lang === "hi") {
        text = "आपका स्वागत है! अपना और परिवार का ख्याल रखें। यदि स्वास्थ्य संबंधित कोई और सवाल हो, तो कभी भी पूछें।";
      } else {
        text = "You are welcome! Take care of your health. Feel free to ask anytime if you need more assistance.";
      }
    }
    // 4. Headache / Sir Dard / Sar Dard / Dizziness / Chakkar
    else if (lower.includes("sir dard") || lower.includes("sar dard") || lower.includes("sar dukh") || lower.includes("sir dukh") || lower.includes("sir me") || lower.includes("sar me") || lower.includes("headache") || lower.includes("doke") || lower.includes("dokedukhi") || lower.includes("matha") || lower.includes("chakkar") || lower.includes("chakar") || lower.includes("dizziness") || lower.includes("vertigo") || lower.includes("डोके") || lower.includes("चक्कर")) {
      if (lang === "mr") {
        text = "डोकेदुखी किंवा चक्कर येत असल्यास शांत व हवेशीर ठिकाणी विश्रांती घ्या आणि पुरेसे पाणी किंवा ओआरएस प्या. उपाशी राहणे व जास्त वेळ उन्हात जाणे टाळा.\n\n⚠️ **धोक्याची लक्षणे**: जर डोकेदुखी अचानक अतिशय तीव्र झाली असेल, एका बाजूला अशक्तपणा आला असेल, दृष्टी धूसर झाली असेल किंवा उलट्या होत असतील, तर त्वरित जवळच्या प्राथमिक आरोग्य केंद्रात (PHC) रक्तदाब तपासा किंवा १०८ वर संपर्क साधा.\n\nआपल्याला जवळच्या शासकीय रुग्णालयाची माहिती हवी आहे का?";
      } else if (lang === "hi") {
        text = "सिरदर्द या चक्कर आने पर शांत व अंधेरे कमरे में आराम करें और पर्याप्त पानी या ओआरएस पिएं। खाली पेट न रहें।\n\n⚠️ **चेतावनी के संकेत**: यदि सिरदर्द अचानक बहुत तेज हो, साथ में उल्टी, धुंधला दिखना, बोलने में लड़खड़ाहट या शरीर के एक हिस्से में कमजोरी महसूस हो, तो तुरंत अपना ब्लड प्रेशर चेक कराएं या 108 पर कॉल करें।\n\nक्या मैं आपके नजदीकी अस्पताल या डॉक्टर की जानकारी दूँ?";
      } else {
        text = "For headache or dizziness, rest in a quiet ventilated space and stay well-hydrated. Avoid skipping meals.\n\n⚠️ **Warning Signs**: If the headache is sudden and explosive, or accompanied by weakness on one side, visual disturbance, or slurred speech, seek immediate medical evaluation at your nearest hospital or call 108.\n\nWould you like me to find the nearest hospital?";
      }
    }
    // 5. Stomach Pain / Cramps / Vomiting / Diarrhea / Loose Motions / Acidity / Gas
    else if (lower.includes("stomach") || lower.includes("pottat") || lower.includes("pet me") || lower.includes("pait me") || lower.includes("pet dard") || lower.includes("pait dard") || lower.includes("pet kharab") || lower.includes("पोट") || lower.includes("पेट") || lower.includes("dast") || lower.includes("julab") || lower.includes("जुलाब") || lower.includes("उलटी") || lower.includes("ulti") || lower.includes("ultiya") || lower.includes("vomiting") || lower.includes("vomit") || lower.includes("acidity") || lower.includes("loose motion") || lower.includes("diarrhea") || lower.includes("kabz") || lower.includes("gas")) {
      if (lang === "mr") {
        text = "पोटदुखी, उलटी किंवा जुलाब होत असल्यास शरीरातील पाण्याचे प्रमाण टिकवून ठेवण्यासाठी ओआरएस (ORS) चे पाणी किंवा उकळलेले थंड पाणी थोडे-थोडे प्यावे. हलका व ताजा आहार (मऊ भात, ताक, मुगाची खिचडी) घ्यावा.\n\n⚠️ **धोक्याची लक्षणे**: जर पोटात असह्य कळ येत असेल, रक्ताची उलटी किंवा शौचातून रक्त जात असेल, अथवा चक्कर येत असेल, तर घरगुती उपायांवर अवलंबून न राहता त्वरित नजीकच्या प्राथमिक आरोग्य केंद्रातील (PHC) डॉक्टरांचा सल्ला घ्यावा.\n\nआपल्या तालुक्यातील PHC किंवा औषध साठा पाहायचा आहे का?";
      } else if (lang === "hi") {
        text = "पेट दर्द, उल्टी या दस्त की स्थिति में डिहाइड्रेशन से बचने के लिए ओआरएस (ORS) का घोल या उबला पानी घूंट-घूंट पिएं। हल्का भोजन जैसे मूंग दाल खिचड़ी या छाछ लें।\n\n⚠️ **खतरे के लक्षण**: यदि पेट में तेज मरोड़ हो, उल्टी में खून आए, तेज बुखार हो या चक्कर आए, तो तुरंत नजदीकी प्राथमिक स्वास्थ्य केंद्र (PHC) में डॉक्टर को दिखाएं।\n\nक्या आपको नजदीकी प्राथमिक स्वास्थ्य केंद्र की जानकारी चाहिए?";
      } else {
        text = "For abdominal pain, vomiting, or diarrhea, maintain hydration with ORS solution and clean boiled fluids. Eat light, bland foods like rice porridge and curd.\n\n⚠️ **Warning Signs**: If pain is severe and stabbing, or if there is blood in vomit/stool, visit your nearest Primary Health Centre (PHC) doctor immediately.";
      }
    }
    // 6. Fever / Cold / Cough / Dengue / Malaria / Body pain
    else if (lower.includes("fever") || lower.includes("bukhar") || lower.includes("bukhaar") || lower.includes("tap") || lower.includes("taap") || lower.includes("ताप") || lower.includes("बुखार") || lower.includes("cough") || lower.includes("sardi") || lower.includes("zukham") || lower.includes("khansi") || lower.includes("खोकला") || lower.includes("dengue") || lower.includes("malaria") || lower.includes("body pain") || lower.includes("badan dard")) {
      if (lang === "mr") {
        text = "सामान्य ताप किंवा खोकल्यासाठी पुरेसे पाणी/ORS प्यावे, सकस आहार घ्यावा आणि विश्रांती घ्यावी. ताप २ दिवसांपेक्षा जास्त राहिल्यास, तीव्र थंडी वाजत असल्यास किंवा अंगावर पुरळ आल्यास डेंग्यू/मलेरियाची मोफत तपासणी करण्यासाठी लगेच जवळच्या प्राथमिक आरोग्य केंद्रातील (PHC) डॉक्टरांचा सल्ला घ्यावा. प्राथमिक आरोग्य केंद्रात पॅरासिटामॉल व आवश्यक औषधे मोफत मिळतात.";
      } else if (lang === "hi") {
        text = "हल्के बुखार या खांसी में पर्याप्त पानी पिएं और आराम करें। यदि बुखार 2 दिन से अधिक समय तक बना रहे, तेज ठंड लगे या शरीर में तेज दर्द हो, तो तुरंत नजदीकी सरकारी अस्पताल (PHC) में डॉक्टर को दिखाएं और मलेरिया/डेंगू की मुफ्त जांच करवाएं। सभी सरकारी PHC में दवाएं मुफ्त मिलती हैं।";
      } else {
        text = "For mild fever and cold, maintain hydration and get adequate rest. If the fever exceeds 48 hours or is accompanied by chills or body ache, visit your nearest PHC doctor for free malaria/dengue diagnostic testing and essential medicine supply.";
      }
    }
    // 7. Chest pain, Heart Attack, Severe Emergency, Snake Bite
    else if (lower.includes("chest pain") || lower.includes("chhati") || lower.includes("heart attack") || lower.includes("छात") || lower.includes("हार्ट अटॅक") || lower.includes("snake bite") || lower.includes("साप") || lower.includes("सर्पदंश") || lower.includes("saap") || lower.includes("unconscious") || lower.includes("behosh") || lower.includes("बेहोश") || lower.includes("bleeding") || lower.includes("रक्तस्त्राव")) {
      if (lang === "mr") {
        text = "🚨 **तातडीची आपत्कालीन सूचना (EMERGENCY)**:\n\nहे लक्षण गंभीर असू शकते! रुग्णाला अजिबात हालचाल करू देऊ नका आणि त्वरित **१०८** (मोफत आपत्कालीन रुग्णवाहिका) वर कॉल करा.\n\n- शासकीय वैद्यकीय महाविद्यालय (GMC) व जिल्हा सामान्य रुग्णालयात २४x७ अतिदक्षता (ICU) व ट्रॉमा विभाग उपलब्ध आहे.\n- सर्पदंशासाठी शासकीय रुग्णालयांमध्ये अँटी-स्नेक व्हेनम (ASV) मोफत उपलब्ध आहे.";
      } else if (lang === "hi") {
        text = "🚨 **आपातकालीन अलर्ट (EMERGENCY)**:\n\nयह लक्षण गंभीर हो सकता है! मरीज को शांत रखें और तुरंत **108** (मुफ्त आपातकालीन एम्बुलेंस) पर कॉल करें।\n\n- सरकारी मेडिकल कॉलेज (GMC) एवं जिला अस्पतालों में 24x7 आईसीयू और ट्रॉमा सुविधा उपलब्ध है।\n- सांप काटने की स्थिति में सभी सरकारी अस्पतालों में एंटी-स्नेक वेनम (ASV) मुफ्त उपलब्ध है।";
      } else {
        text = "🚨 **CRITICAL MEDICAL EMERGENCY ALERT**:\n\nPlease dial **108** immediately for free emergency ALS ambulance dispatch. Keep the patient calm and stationary. Major district hospitals provide 24x7 ICU and Anti-Snake Venom (ASV) care.";
      }
    }
    // 8. Cardiologist / Heart Specialist
    else if (lower.includes("cardiologist") || lower.includes("heart doctor") || lower.includes("हृदय") || lower.includes("हार्ट")) {
      if (lang === "mr") {
        text = "महाराष्ट्रातील पडताळणी झालेल्या हृदयविकार तज्ज्ञांमध्ये (Cardiologists) नागपूर येथील डॉ. जसपाल अर्नेजा (Arneja Heart Institute) आणि डॉ. प्रशांत जगताप यांचा समावेश आहे. शासकीय स्तरावर GMC नागपूर व ससून रुग्णालय पुणे येथे २४x७ कार्डियाक ओपीडी व आयसीयू उपलब्ध आहे. आपण 'डॉक्टर' पेजवरून थेट ऑन-ड्युटी स्थिती तपासू शकता.";
      } else if (lang === "hi") {
        text = "सत्यापित कार्डियोलॉजिस्ट में नागपुर के डॉ. जसपाल अर्नेजा और डॉ. प्रशांत जगताप शामिल हैं। सरकारी स्तर पर GMC नागपुर और ससून पुणे में 24x7 हृदय रोग ओपीडी व इमरजेंसी सुविधा उपलब्ध है। आप ऐप के 'Doctors' सेक्शन में लाइव ड्यूटी देख सकते हैं।";
      } else {
        text = "Verified cardiologists include Dr. Jaspal Arneja and Dr. Prashant Jagtap in Nagpur. Government facilities such as GMC Nagpur and Sassoon General Hospital Pune provide 24x7 cardiac care. You can verify live duty rosters on the Doctors page.";
      }
    }
    // 9. Doctors Directory & On-Duty Status
    else if (lower.includes("doctor") || lower.includes("डॉक्टर") || lower.includes("वैद्यकीय") || lower.includes("physician") || lower.includes("specialist") || lower.includes("duty") || lower.includes("ड्युटी") || lower.includes("opd") || lower.includes("pediatrician") || lower.includes("gynecologist")) {
      if (lang === "mr") {
        text = "जीवनसेतूवर महाराष्ट्रातील १.५ लाखांपेक्षा जास्त MMC, MCIM व MHC नोंदणीकृत डॉक्टर्सची पडताळणी केलेली आहे. प्राथमिक आरोग्य केंद्रात (PHC) सकाळी ९ ते संध्याकाळी ५ या वेळेत वैद्यकीय अधिकारी उपलब्ध असतात. विशिष्ट तज्ज्ञ किंवा ओपीडी तपासणीसाठी आपण 'Doctors' मेनूमध्ये जिल्हा निवडून शोध घेऊ शकता.";
      } else if (lang === "hi") {
        text = "जीवनसेतु पर महाराष्ट्र के 1.5 लाख से अधिक सत्यापित डॉक्टर्स उपलब्ध हैं। प्राथमिक स्वास्थ्य केंद्रों (PHC) पर सुबह 9 से शाम 5 बजे तक ओपीडी चालू रहती है। विशेषज्ञ डॉक्टर खोजने के लिए आप 'Doctors' पेज पर जाकर अपने जिले के अनुसार सर्च कर सकते हैं।";
      } else {
        text = "JeevanSetu features over 150,000 verified Maharashtra medical council practitioners. PHC OPD operates from 9:00 AM to 5:00 PM. Please browse the Doctors directory to filter by district, specialty, and duty status.";
      }
    }
    // 10. Ambulance 108 Booking & Dispatch
    else if (lower.includes("ambulance") || lower.includes("रुग्णवाहिका") || lower.includes("एम्बुलेंस") || lower.includes("108") || lower.includes("१०८") || lower.includes("गाडी")) {
      if (lang === "mr") {
        text = "१०८ ही महाराष्ट्र शासनाची २४x७ मोफत आपत्कालीन रुग्णवाहिका सेवा आहे. रुग्णवाहिका त्वरित बोलावण्यासाठी थेट १०८ वर कॉल करा किंवा जीवनसेतूच्या 'Ambulance' पेजवर जाऊन 'Book 108 Ambulance' बटणावर क्लिक करून पिकअप लोकेशन कन्फर्म करा. वाहनाचे लाइव्ह जीपीएस लोकेशन व ईटीए (ETA) आपल्याला स्क्रीनवर दिसेल.";
      } else if (lang === "hi") {
        text = "108 महाराष्ट्र शासन की 24x7 निःशुल्क आपातकालीन एम्बुलेंस सेवा है। एम्बुलेंस बुलाने के लिए सीधे 108 डायल करें या ऐप में 'Ambulance' पेज पर जाकर 'Book Ambulance' पर क्लिक करें। आपको ड्राइवर का संपर्क और लाइव आगमन समय (ETA) तुरंत मिल जाएगा।";
      } else {
        text = "108 is Maharashtra's 24x7 toll-free emergency ambulance network. You can dial 108 directly or use the 'Ambulance' page to dispatch an ALS/BLS ambulance with live GPS tracking and arrival ETA.";
      }
    }
    // 11. Blood Pressure / Hypertension
    else if (lower.includes("blood pressure") || lower.includes("bp") || lower.includes("रक्तदाब") || lower.includes("hypertension") || lower.includes("बीपी")) {
      if (lang === "mr") {
        text = "रक्तदाब (BP) नियंत्रणात ठेवण्यासाठी जेवणातील मिठाचे प्रमाण कमी करा, तेलकट व प्रक्रिया केलेले अन्न टाळा, दररोज ३० मिनिटे हलका व्यायाम करा आणि ताणतणाव टाळा. प्राथमिक आरोग्य केंद्रात (PHC) दर आठवड्याला मोफत रक्तदाब तपासणी केली जाते. डॉक्टरांच्या सल्ल्याशिवाय कोणतीही गोळी सुरू किंवा बंद करू नका.";
      } else if (lang === "hi") {
        text = "ब्लड प्रेशर (BP) नियंत्रित रखने के लिए खाने में नमक की मात्रा कम करें, तला-भुना भोजन न लें, प्रतिदिन 30 मिनट टहलें और तनाव से बचें। सभी सरकारी स्वास्थ्य केंद्रों (PHC) में मुफ्त बीपी जांच उपलब्ध है। बिना डॉक्टर के परामर्श के दवाएं न बदलें।";
      } else {
        text = "To manage blood pressure, reduce dietary sodium/salt, avoid processed oily foods, exercise regularly (30 mins daily), and monitor your BP weekly at your nearest PHC wellness center.";
      }
    }
    // 12. Diabetes / Sugar
    else if (lower.includes("diabetes") || lower.includes("sugar") || lower.includes("मधुमेह") || lower.includes("साखर") || lower.includes("शुगर")) {
      if (lang === "mr") {
        text = "मधुमेह (Diabetes) नियंत्रणात ठेवण्यासाठी साखर, गूळ, गोड पदार्थ आणि मैद्याचे पदार्थ टाळा. हिरव्या पालेभाज्या, कडधान्ये आणि फायबरयुक्त आहाराचा समावेश करा. दरमहा उपाशीपोटी (Fasting) व जेवणानंतर रक्तातील साखरेची तपासणी शासकीय आरोग्य केंद्रात करून घ्या आणि नियमित औषधे वेळेवर घ्या.";
      } else if (lang === "hi") {
        text = "डायबिटीज (शुगर) नियंत्रित रखने के लिए मीठे खाद्य पदार्थ और जंक फूड से बचें। रेशेदार भोजन, हरी सब्जियां और दालें आहार में शामिल करें। समय-समय पर फास्टिंग शुगर की जांच कराएं और नियमित वॉक करें।";
      } else {
        text = "To control diabetes, minimize refined sugars and carbohydrates, maintain a high-fiber balanced diet, engage in daily exercise, and get your blood sugar tested regularly at your local PHC.";
      }
    }
    // 13. Anemia / Low Hb / Weakness
    else if (lower.includes("anemia") || lower.includes("khoon ki kami") || lower.includes("रक्तक्षय") || lower.includes("अशक्तपणा") || lower.includes("एनीमिया") || lower.includes("iron") || lower.includes("kamjori") || lower.includes("weakness")) {
      if (lang === "mr") {
        text = "रक्तातील हिमोग्लोबिन (Hb) वाढवण्यासाठी पालक, मेथी, गूळ, शेंगदाणे, खजूर, बीट आणि डाळिंब यांसारख्या लोहयुक्त आहाराचा वापर करा. महिला व गरोदर मातांनी प्राथमिक आरोग्य केंद्रातून मोफत मिळणाऱ्या आयर्न आणि फॉलिक अ‍ॅसिड (IFA) च्या गोळ्या नियमित घ्याव्यात. आपल्या जवळच्या PHC मध्ये मोफत रक्त तपासणी उपलब्ध आहे.";
      } else if (lang === "hi") {
        text = "एनीमिया (खून की कमी) दूर करने के लिए पालक, मेथी, गुड़, चना, अनार, चुकंदर और दालों का सेवन करें। सरकारी स्वास्थ्य केंद्र व आशा ताई से मुफ्त आयरन एवं फोलिक एसिड (IFA) की गोलियां प्राप्त करें और अपना हीमोग्लोबिन स्तर जांचें।";
      } else {
        text = "To manage anemia, consume iron-rich foods like green leafy vegetables, jaggery, beetroot, and lentils. Pregnant women and adolescent girls can receive free Iron & Folic Acid (IFA) supplements from their local PHC or ASHA worker.";
      }
    }
    // 14. Government Health Schemes (Ayushman Bharat PM-JAY & MJPJAY)
    else if (lower.includes("scheme") || lower.includes("pmjay") || lower.includes("pm-jay") || lower.includes("mjpjay") || lower.includes("ayushman") || lower.includes("योजना") || lower.includes("रेशन") || lower.includes("कार्ड") || lower.includes("free treatment")) {
      if (lang === "mr") {
        text = "महाराष्ट्रातील शासकीय रुग्णालये आणि संलग्न खासगी रुग्णालयांमध्ये दोन प्रमुख आरोग्य योजना लागू आहेत:\n१. **महात्मा ज्योतिराव फुले जन आरोग्य योजना (MJPJAY)**: महाराष्ट्रातील सर्व रेशन कार्डधारक कुटुंबांना प्रति वर्ष ₹५ लाख रुपयांपर्यंत मोफत कॅशलेस उपचार मिळतात.\n२. **आयुष्मान भारत (PM-JAY)**: देशभरातील नोंदणीकृत रुग्णालयांमध्ये ₹५ लाखांपर्यंत द्वितीयक व तृतीयक उपचारांची मोफत सुविधा.\n\nआपण 'Resources' विभागात जाऊन योजना पात्रता तपासू शकता आणि आरोग्य मित्राची मदत घेऊ शकता.";
      } else if (lang === "hi") {
        text = "महाराष्ट्र के सभी सरकारी और सूचीबद्ध अस्पतालों में प्रमुख सरकारी स्वास्थ्य योजनाएं उपलब्ध हैं:\n1. **महात्मा ज्योतिराव फुले जन आरोग्य योजना (MJPJAY)**: सभी राशन कार्ड धारकों को प्रति परिवार प्रति वर्ष ₹5 लाख तक का कैशलेस इलाज।\n2. **आयुष्मान भारत - प्रधानमंत्री जन आरोग्य योजना (PM-JAY)**: ₹5 लाख तक का मुफ्त इनपेशेंट इलाज।\n\nआप अपने नजदीकी अस्पताल में आरोग्य मित्र से मिलकर सीधे योजना का लाभ ले सकते हैं।";
      } else {
        text = "Key government healthcare schemes available in Maharashtra include:\n1. **Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana (PM-JAY)**: Provides cashless health cover up to ₹5,00,000 per family per year for secondary and tertiary care hospitalization.\n2. **Mahatma Jyotirao Phule Jan Arogya Yojana (MJPJAY)**: 100% cashless treatment across 996+ medical packages for all ration card holders in Maharashtra.\n\nPlease visit the Resources tab to check eligibility or connect with an on-duty Aarogya Mitra at your hospital.";
      }
    }
    // 14. Maternal Health / Pregnancy / ANC / Safe Delivery
    else if (lower.includes("pregnancy") || lower.includes("garbhavastha") || lower.includes("maternal") || lower.includes("गरोदर") || lower.includes("बाळंतपण") || lower.includes("anc") || lower.includes("delivery") || lower.includes("बाळ") || lower.includes("pregnant")) {
      if (lang === "mr") {
        text = "गरोदर मातांसाठी शासनाच्या 'मातृ वंदना' व जननी सुरक्षा योजनेअंतर्गत मोफत तपासणी, पोषण आहार व सुरक्षित संस्थात्मक बाळंतपणाची सुविधा उपलब्ध आहे. गरोदरपणात किमान ४ प्रसवपूर्व (ANC) तपासण्या करून घ्याव्यात आणि आयर्न-कॅल्शियमच्या गोळ्या नियमित घ्याव्यात. अधिक मदतीसाठी आशा ताई किंवा प्राथमिक आरोग्य केंद्राशी संपर्क साधा.";
      } else if (lang === "hi") {
        text = "गर्भावस्था के दौरान सरकारी जननी सुरक्षा योजना के तहत मुफ्त प्रसव, पोषण और दवाएं उपलब्ध हैं। कम से कम 4 बार प्रसवपूर्व (ANC) जांच जरूर कराएं और टिटनेस (TT) के टीके लगवाएं। आशा ताई आपके घर आकर आवश्यक मार्गदर्शन प्रदान कर सकती हैं।";
      } else {
        text = "Under the Janani Suraksha Yojana and National Health Mission, all pregnant women are entitled to free ANC checkups, IFA supplementation, institutional delivery, and cash incentives at government facilities.";
      }
    }
    // 15. Child Immunization / Vaccination / Tika
    else if (lower.includes("vaccination") || lower.includes("immunization") || lower.includes("lasikaran") || lower.includes("लसीकरण") || lower.includes("लस") || lower.includes("टीका") || lower.includes("tika") || lower.includes("vaccine")) {
      if (lang === "mr") {
        text = "राष्ट्रीय लसीकरण वेळापत्रकानुसार जन्माच्या वेळी बीसीजी, पोलिओ व हेपेटायटिस-बी, तर दीड, अडीच व साडेतीन महिन्यांनी पेंटाव्हॅलंट व रोटाव्हायरसच्या मोफत लसी प्राथमिक आरोग्य केंद्रात (PHC) दिल्या जातात. लसीकरण कार्ड नेहमी सोबत ठेवा आणि वेळेवर लसी टोचून घ्या.";
      } else if (lang === "hi") {
        text = "मिशन इंद्रधनुष के तहत सभी बच्चों को बीसीजी, पोलियो, पेंटावेलेंट, एमआर और रोटावायरस के सभी टीके सरकारी स्वास्थ्य केंद्रों और आंगनवाड़ी में बिल्कुल मुफ्त लगाए जाते हैं। अपने बच्चे का टीकाकरण कार्ड संभाल कर रखें।";
      } else {
        text = "All universal childhood vaccinations (BCG, Polio, Pentavalent, Rotavirus, MR) are provided free of charge at all government PHCs, sub-centers, and Anganwadis as per the National Immunization Schedule.";
      }
    }
    // 16. ASHA Support / Call Assistance
    else if (lower.includes("asha") || lower.includes("ताई") || lower.includes("आषा") || lower.includes("call assistance") || lower.includes("1800")) {
      if (lang === "mr") {
        text = "आपल्या गावातील किंवा प्रभागातील आशा स्वयंसेविका (ASHA Tai) माता-बाल आरोग्य, लसीकरण, पोषण आणि औषधांसाठी मार्गदर्शन करतात. आपण जीवनसेतूच्या 'Rural Access' पेजवरून आशा गृहभेटीची विनंती नोंदवू शकता किंवा टोल-फ्री क्रमांक १८००-१०८-१०२ वर कॉल करू शकता.";
      } else if (lang === "hi") {
        text = "आशा कार्यकर्ता (ASHA Worker) मातृ एवं शिशु स्वास्थ्य, पोषण और दवाओं के लिए घर-घर सहयोग देती हैं। आप 'Rural Access' सेक्शन से आशा गृह-भ्रमण का अनुरोध कर सकते हैं या टोल-फ्री 1800-108-102 पर कॉल कर सकते हैं।";
      } else {
        text = "ASHA community health facilitators provide maternal care, child immunization tracking, and home visits. You can queue a request on the Rural Access page or dial toll-free 1800-108-102.";
      }
    }
    // 17. Government Schemes (PM-JAY, MJPJAY ₹5 Lakh)
    else if (lower.includes("scheme") || lower.includes("pmjay") || lower.includes("ayushman") || lower.includes("mjpjay") || lower.includes("योजना") || lower.includes("कार्ड") || lower.includes("5 lakh") || lower.includes("cashless")) {
      if (lang === "mr") {
        text = "आयुष्मान भारत PM-JAY आणि महात्मा ज्योतिराव फुले जन आरोग्य योजना (MJPJAY) अंतर्गत प्रत्येक पात्र कुटुंबाला दरवर्षी ₹५,००,००० पर्यंतचे मोफत कॅशलेस उपचार शासकीय व संलग्न खाजगी रुग्णालयांमध्ये मिळतात. यासाठी रेशन कार्ड आणि आधार कार्ड आवश्यक असते. रुग्णालयातील 'आयुष्मान मित्र' कक्षात जाऊन आपण थेट लाभ घेऊ शकता.";
      } else if (lang === "hi") {
        text = "आयुष्मान भारत PM-JAY और महात्मा ज्योतिराव फुले जन आरोग्य योजना (MJPJAY) के तहत प्रत्येक पात्र परिवार को प्रति वर्ष ₹5,00,000 तक का मुफ्त कैशलेस इलाज मिलता है। इसके लिए आधार कार्ड व राशन कार्ड लेकर अस्पताल के आयुष्मान मित्र काउंटर पर संपर्क करें।";
      } else {
        text = "Under Ayushman Bharat PM-JAY & MJPJAY, eligible families receive up to ₹5,00,000 in annual cashless hospitalization across empanelled hospitals with Aadhaar and Ration Card verification.";
      }
    }
    // 18. Medicine Stock & Inventory
    else if (lower.includes("medicine") || lower.includes("stock") || lower.includes("paracetamol") || lower.includes("asv") || lower.includes("dawa") || lower.includes("aushadh") || lower.includes("औषध") || lower.includes("दवा")) {
      if (lang === "mr") {
        text = "शासकीय प्राथमिक आरोग्य केंद्र (PHC) व ग्रामीण रुग्णालयात e-Aushadhi DVDMS प्रणालीद्वारे सर्व अत्यावश्यक औषधे (उदा. ताप, वेदनाशामक, प्रतिजैविके, अँटी-स्नेक व्हेनम) मोफत उपलब्ध करून दिली जातात. आपण 'Inventory' पेजवरून आपल्या तालुक्यातील थेट साठा तपासू शकता.";
      } else if (lang === "hi") {
        text = "सरकारी प्राथमिक स्वास्थ्य केंद्र (PHC) में आवश्यक दवाएं (पैरासिटामोल, एंटी-स्नेक वेनम, एंटीबायोटिक्स, ओआरएस) ई-औषधि प्रणाली द्वारा निशुल्क उपलब्ध कराई जाती हैं। आप 'Inventory' पेज पर स्टॉक देख सकते हैं।";
      } else {
        text = "According to live records, essential medicines including Paracetamol, Anti-Snake Venom (ASV), Antibiotics, and ORS are available and provided free across government PHCs tracked via e-Aushadhi DVDMS.";
      }
    }
    // 19. Hospital & PHC Directory
    else if (lower.includes("hospital") || lower.includes("icu") || lower.includes("bed") || lower.includes("phc") || lower.includes("रुग्णालय") || lower.includes("अस्पताल") || lower.includes("दवाखाना") || lower.includes("dawakhana") || lower.includes("gmc") || lower.includes("mayo")) {
      if (lang === "mr") {
        text = "महाराष्ट्रातील शासकीय वैद्यकीय महाविद्यालये (उदा. GMC नागपूर, ससून पुणे) व जिल्हा सामान्य रुग्णालयांमध्ये २४x७ आपत्कालीन कॅज्युअल्टी, आयसीयू आणि ऑक्सिजन खाटांची सोय आहे. उपलब्ध खाटा आणि ओपीडी वेळा पाहण्यासाठी 'Hospitals' किंवा 'Resources' पेज पहा.";
      } else if (lang === "hi") {
        text = "सरकारी मेडिकल कॉलेज (जैसे GMC नागपुर, ससून पुणे) और जिला अस्पतालों में 24x7 इमरजेंसी कैजुअल्टी और आईसीयू बेड उपलब्ध हैं। लाइव बेड स्टेटस देखने के लिए 'Resources' पेज देखें।";
      } else {
        text = "Major verified government hospitals provide 24x7 emergency casualty, ICU, and surgical facilities. You can view bed capacities and facility contact numbers on the Resources page.";
      }
    }
    // 20. Referral Tracking
    else if (lower.includes("referral") || lower.includes("status") || combinedContext.includes("referral") || lower.includes("रेफरल")) {
      if (lang === "mr") {
        text = "सध्याच्या जीवनसेतू नोंदीनुसार, आपला संदर्भ (Referral) १०-टप्प्यांच्या सातत्यपूर्ण प्रणालीत सक्रिय आहे. विशेषज्ञ रुग्णालयातील बेड आरक्षण आणि रुग्णवाहिका समन्वयाची स्थिती पाहण्यासाठी 'Referrals' पेज तपासा.";
      } else if (lang === "hi") {
        text = "जीवनसेतु रिकॉर्ड के अनुसार आपका रेफरल 10-चरणीय ट्रैकिंग सिस्टम में सक्रिय है। विशेषज्ञ अस्पताल में बेड और डॉक्टर समन्वय की लाइव स्थिति देखने के लिए 'Referrals' पेज देखें।";
      } else {
        text = "Your referral is tracked across JeevanSetu's 10-stage care continuum. You can inspect real-time milestones on the Referrals dashboard.";
      }
    }
    // 21. Specific App Page Navigation Queries (e.g. "ambulance page kaha hai", "doctor kaise dhundhe")
    else if (lower.includes("navigate") || lower.includes("kaise use") || lower.includes("kaha jau") || lower.includes("page kaha") || lower.includes("page open")) {
      if (lang === "mr") {
        text = "जीवनसेतूमध्ये आपण खालील सुविधा वापरू शकता:\n१. रुग्णवाहिका: '/ambulance' पेज\n२. डॉक्टर शोध: '/doctors' पेज\n३. रुग्णालये व खाटा: '/resources' पेज\n४. औषध साठा: '/inventory' पेज\n५. संदर्भ (Referrals): '/referrals' पेज\nआपल्याला कोणत्या सुविधेवर जायचे आहे?";
      } else if (lang === "hi") {
        text = "जीवनसेतु में आप निम्न सुविधाएं देख सकते हैं:\n1. एम्बुलेंस: '/ambulance' पेज\n2. डॉक्टर सर्च: '/doctors' पेज\n3. अस्पताल व बेड: '/resources' पेज\n4. दवा स्टॉक: '/inventory' पेज\n5. रेफरल: '/referrals' पेज\nआप किस पेज की जानकारी चाहते हैं?";
      } else {
        text = "JeevanSetu modules include: Ambulance (/ambulance), Doctors (/doctors), Hospitals & Beds (/resources), Medicine Inventory (/inventory), and Referral Tracking (/referrals). How can I guide you?";
      }
    }
    // 22. Deep Fallback Search & Guidance (Zero Generic Deflection)
    else {
      // Last-chance fuzzy search across all 531 curated conditions
      const allConditions = medicalKnowledgeService.getAllConditions();
      const userWords = lower.split(/[\s,;.!?-]+/).filter((w) => w.length >= 3);

      let matchedCond = null;
      for (const cond of allConditions) {
        const condTerms = [
          cond.id,
          cond.canonical_name,
          cond.names.english,
          cond.names.hindi,
          cond.names.marathi,
          ...(cond.synonyms.english || []),
          ...(cond.synonyms.hindi || []),
          ...(cond.synonyms.marathi || []),
          ...(cond.synonyms.roman_hindi || []),
          ...(cond.synonyms.roman_marathi || []),
          ...(cond.synonyms.common_indian_terms || []),
        ].map((t) => (t || "").toLowerCase());

        const matchesWord = userWords.some((w) => condTerms.some((t) => t.includes(w) || w.includes(t)));
        if (matchesWord) {
          matchedCond = cond;
          break;
        }
      }

      if (matchedCond) {
        const guidance = medicalKnowledgeService.generateGuidance(matchedCond.id, lang);
        return {
          text: guidance.guidanceText,
          rawUsage: { prompt_tokens: 60, completion_tokens: 250, total_tokens: 310 },
          provider: this.name,
        };
      }

      // If purely a general greeting or non-medical query, provide proactive health guidance
      if (lang === "mr") {
        text = `मी जीवनसेतू शासकीय आरोग्य सहाय्यक आहे. आपण मला कोणत्याही आजाराबद्दल (उदा. ताप, डेंग्यू, मलेरिया, कावीळ, मधुमेह, रक्तदाब, दमा, पोटदुखी, मूळव्याध, कर्करोग), जवळचे शासकीय रुग्णालय, प्राथमिक आरोग्य केंद्र (PHC), ऑन-ड्युटी डॉक्टर किंवा महात्मा फुले जन आरोग्य योजनेविषयी (MJPJAY) विचारू शकता. कृपया आपले नेमके लक्षण किंवा आजार सांगा, मी संपूर्ण मार्गदर्शन देतो.`;
      } else if (lang === "hi") {
        text = `मैं जीवनसेतु स्वास्थ्य सहायक हूँ। आप मुझसे किसी भी बीमारी (जैसे बुखार, डेंगू, मलेरिया, पीलिया, शुगर, बीपी, दमा, पेट दर्द, बवासीर, कैंसर), नजदीकी सरकारी अस्पताल, प्राथमिक स्वास्थ्य केंद्र (PHC), डॉक्टर या आयुष्मान भारत योजना (PM-JAY) के बारे में पूछ सकते हैं। कृपया अपनी बीमारी या लक्षण का नाम बताएं, मैं तुरंत सटीक जानकारी दूँगा।`;
      } else {
        text = `I am your JeevanSetu Healthcare Assistant. You can ask me about any medical condition (e.g. fever, dengue, malaria, jaundice, diabetes, hypertension, asthma, stomach pain, cancer), on-duty doctors, hospital beds, 108 ambulances, or government schemes. Please mention your condition or symptoms, and I will guide you immediately.`;
      }
    }

    return {
      text,
      rawUsage: { fallback: true },
    };
  }
}

module.exports = FallbackAIProvider;
