/**
 * JeevanSetu IVR Multilingual Content Dictionary
 * Curated, pre-approved, non-diagnostic audio prompt scripts for Hindi, Marathi, and English.
 * Strictly adheres to safety boundaries: No autonomous diagnosis or pharmaceutical prescriptions.
 */

const IVR_CONTENT = {
  hi: {
    welcome: "जीवनसेतु ग्रामीण स्वास्थ्य सेवा में आपका स्वागत है।",
    language_prompt: "हिंदी के लिए 1 दबाएं। मराठीसाठी 2 दाबा। For English, press 3.",
    main_menu: "मुख्य मेनू: स्वास्थ्य मार्गदर्शन के लिए 1 दबाएं। अपने रेफरल की स्थिति जानने के लिए 2 दबाएं। नजदीकी स्वास्थ्य केंद्र और अस्पताल की जानकारी के लिए 3 दबाएं। आवश्यक दवाओं की उपलब्धता के लिए 4 दबाएं। आशा या स्वास्थ्य कार्यकर्ता से संपर्क अनुरोध के लिए 5 दबाएं। सरकारी स्वास्थ्य योजनाओं की जानकारी के लिए 6 दबाएं। मेनू दोहराने के लिए 9 या स्टार दबाएं। कॉल समाप्त करने के लिए 0 दबाएं।",

    // Submenu 1: Health Guidance & Triage
    health_education_menu: "स्वास्थ्य मार्गदर्शन मेनू: मौसमी बुखार और प्राथमिक देखभाल के लिए 1 दबाएं। ओआरएस और स्वच्छता के लिए 2 दबाएं। मातृ एवं शिशु स्वास्थ्य सलाह के लिए 3 दबाएं। गंभीर या आपातकालीन लक्षण रिपोर्ट करने के लिए 4 दबाएं। मुख्य मेनू के लिए 9 या हैश दबाएं।",
    health_guidance_menu: "स्वास्थ्य मार्गदर्शन मेनू: मौसमी बुखार और प्राथमिक देखभाल के लिए 1 दबाएं। ओआरएस और स्वच्छता के लिए 2 दबाएं। मातृ एवं शिशु स्वास्थ्य सलाह के लिए 3 दबाएं। गंभीर या आपातकालीन लक्षण रिपोर्ट करने के लिए 4 दबाएं। मुख्य मेनू के लिए 9 या हैश दबाएं।",
    health_tips: {
      "1": "मौसमी बुखार में भरपूर आराम करें और पर्याप्त पानी पिएं। यदि बुखार 3 दिन से अधिक रहे या तेज हो, तो तुरंत नजदीकी प्राथमिक स्वास्थ्य केंद्र जाएं। बिना डॉक्टर की सलाह के कोई दवा न लें।",
      "2": "गर्मियों और दस्त में ओआरएस और उबला हुआ पानी पिएं। भोजन से पहले साबुन से हाथ धोएं। स्वच्छता बीमारियों से बचाव का सबसे सरल उपाय है।",
      "3": "गर्भावस्था के दौरान नियमित एएनसी जांच कराएं और आयरन की गोलियां लें। सरकारी अस्पताल में सुरक्षित और निःशुल्क प्रसव की सुविधा उपलब्ध है।",
    },

    // Emergency Triage
    emergency_symptoms_menu: "यदि आपको गंभीर लक्षण हैं तो चुनें: तेज सीने में दर्द या सांस लेने में भारी तकलीफ के लिए 1 दबाएं। अत्यधिक रक्तस्राव या बेहोशी के लिए 2 दबाएं। मुख्य मेनू के लिए 9 या हैश दबाएं।",
    emergency_alert: "⚠️ आपातकालीन सूचना: आपके लक्षण गंभीर हो सकते हैं। कृपया तुरंत 108 पर कॉल करें या नजदीकी अस्पताल के आपातकालीन विभाग में जाएं। जीवनसेतु फोन सेवा कोई नैदानिक उपकरण नहीं है।",

    // Submenu 2: Referral Status (PIN Protected)
    referral_auth_prompt: "अपने रेफरल की स्थिति जानने के लिए, कृपया अपना 4 अंकों का सुरक्षा पिन दर्ज करें और हैश दबाएं, या अपने पंजीकृत फोन से कॉल की पुष्टि के लिए 1 दबाएं।",
    referral_status_template: "आपका रेफरल वर्तमान में {stage} स्थिति पर है। आपका गंतव्य अस्पताल {hospital} है।",
    referral_not_found: "आपके पंजीकृत नंबर से कोई सक्रिय रेफरल नहीं मिला। सहायता के लिए अपने नजदीकी प्राथमिक स्वास्थ्य केंद्र से संपर्क करें।",
    referral_auth_failed: "सुरक्षा सत्यापन विफल रहा। व्यक्तिगत स्वास्थ्य डेटा की सुरक्षा के लिए विवरण साझा नहीं किया जा सकता। कृपया प्राथमिक स्वास्थ्य केंद्र से संपर्क करें।",

    // Submenu 3: Facility Lookup
    facility_lookup_menu: "स्वास्थ्य सुविधा मेनू: आष्टी प्राथमिक स्वास्थ्य केंद्र की जानकारी के लिए 1 दबाएं। चामोर्शी उप-केंद्र की जानकारी के लिए 2 दबाएं। जिला नागरिक अस्पताल गढ़चिरौली के लिए 3 दबाएं। मुख्य मेनू के लिए 9 या हैश दबाएं।",
    facility_details: {
      "1": "आष्टी प्राथमिक स्वास्थ्य केंद्र 24 घंटे आपातकालीन और प्रसव सेवा के लिए खुला है। ओपीडी समय सुबह 9 से शाम 5 बजे तक है। संपर्क फोन: शून्य सात एक तीन दो, दो चार पांच शून्य एक दो।",
      "2": "चामोर्शी स्वास्थ्य उप-केंद्र में एएनएम और आशा कार्यकर्ता प्राथमिक जांच और टीकाकरण के लिए उपलब्ध हैं। संपर्क फोन: शून्य सात एक तीन दो, दो चार पांच शून्य एक तीन।",
      "3": "जिला नागरिक अस्पताल गढ़चिरौली 300 बिस्तरों, 24 घंटे आईसीयू और विशेषज्ञ डॉक्टरों की सुविधा से युक्त है। आपातकालीन फोन: शून्य सात एक तीन दो, दो दो दो एक पांच पांच।",
    },
    facility_info: "आष्टी प्राथमिक स्वास्थ्य केंद्र 24 घंटे आपातकालीन सेवा के लिए खुला है। फोन: शून्य सात एक तीन दो, दो चार पांच शून्य एक दो। जिला नागरिक अस्पताल गढ़चिरौली में आईसीयू और विशेष डॉक्टर उपलब्ध हैं।",

    // Submenu 4: Medicine Availability
    medicine_info_menu: "दवा उपलब्धता मेनू: पैरासिटामोल के लिए 1 दबाएं। ओआरएस पैकेट के लिए 2 दबाएं। रक्तचाप दवा एम्लोडिपिन के लिए 3 दबाएं। मधुमेह दवा मेटफॉर्मिन के लिए 4 दबाएं। मुख्य मेनू के लिए 9 या हैश दबाएं।",
    medicine_details: {
      "1": "आष्टी प्राथमिक स्वास्थ्य केंद्र में पैरासिटामोल 500 एमजी की पर्याप्त गोलियां उपलब्ध हैं। ओपीडी समय में निःशुल्क प्राप्त करें।",
      "2": "ओआरएस (ORS) घोल के पैकेट आष्टी प्राथमिक स्वास्थ्य केंद्र और सभी आशा कार्यकर्ताओं के पास उपलब्ध हैं।",
      "3": "एम्लोडिपिन 5 एमजी रक्तचाप की दवा सीमित मात्रा में उपलब्ध है। नियमित रोगियों को वितरण जारी है।",
      "4": "मेटफॉर्मिन 500 एमजी मधुमेह की दवा आष्टी प्राथमिक स्वास्थ्य केंद्र में उपलब्ध है। डॉक्टर की पर्ची अनिवार्य है।",
    },
    medicine_info: "आष्टी प्राथमिक स्वास्थ्य केंद्र में पैरासिटामोल, ओआरएस और एम्लोडिपिन का आवश्यक स्टॉक उपलब्ध है। निःशुल्क दवा वितरण के लिए ओपीडी समय पर जाएं।",
    medicine_disclaimer: "दवाओं की उपलब्धता प्राथमिक स्वास्थ्य केंद्र के रिकॉर्ड पर आधारित है। कृपया डॉक्टर की सलाह के बाद ही दवा लें।",

    // Submenu 5: Callback Request
    callback_prompt: "स्वास्थ्य कार्यकर्ता से कॉल बैक प्राप्त करने के लिए 1 दबाएं। मुख्य मेनू के लिए 9 या हैश दबाएं।",
    callback_success: "आपका अनुरोध दर्ज कर लिया गया है। आपके क्षेत्र के आशा या प्राथमिक स्वास्थ्य केंद्र कार्यकर्ता कार्य समय में आपसे संपर्क करेंगे।",
    callback_duplicate: "आपके नंबर से पहले ही एक कॉल बैक अनुरोध दर्ज है। स्वास्थ्य कार्यकर्ता शीघ्र ही संपर्क करेंगे।",

    // Submenu 6: Government Schemes
    schemes_menu: "सरकारी स्वास्थ्य योजना मेनू: आयुष्मान भारत प्रधानमंत्री जन आरोग्य योजना के लिए 1 दबाएं। महात्मा ज्योतिराव फुले जन आरोग्य योजना के लिए 2 दबाएं। जननी सुरक्षा योजना के लिए 3 दबाएं। मुख्य मेनू के लिए 9 या हैश दबाएं।",
    scheme_details: {
      "1": "आयुष्मान भारत योजना के तहत प्रति परिवार प्रति वर्ष 5 लाख रुपये तक का कैशलेस इलाज सूचीबद्ध अस्पतालों में उपलब्ध है। पात्र परिवार अपने राशन कार्ड या आधार कार्ड से पंजीकरण करा सकते हैं।",
      "2": "महात्मा ज्योतिराव फुले जन आरोग्य योजना (MJPJAY) महाराष्ट्र सरकार की योजना है, जिसके तहत गंभीर बीमारियों के लिए निःशुल्क उपचार प्रदान किया जाता है।",
      "3": "जननी सुरक्षा योजना (JSY) के तहत ग्रामीण क्षेत्र की गर्भवती महिलाओं को सरकारी अस्पताल में प्रसव कराने पर 1400 रुपये की वित्तीय सहायता दी जाती है।",
    },

    // System Messages
    invalid_input: "अमान्य इनपुट। कृपया सही विकल्प चुनें।",
    timeout_message: "कोई इनपुट प्राप्त नहीं हुआ। मेनू दोहराया जा रहा है।",
    max_retries_exceeded: "अधिकतम प्रयास पूरे हुए। कॉल समाप्त की जा रही है। जीवनसेतु में कॉल करने के लिए धन्यवाद।",
    goodbye: "जीवनसेतु से जुड़ने के लिए धन्यवाद। स्वस्थ रहें, सुरक्षित रहें। नमस्ते।",
  },

  mr: {
    welcome: "जीवनसेतू ग्रामीण आरोग्य सेवेमध्ये आपले स्वागत आहे.",
    language_prompt: "हिंदी के लिए 1 दबाएं. मराठीसाठी 2 दाबा. For English, press 3.",
    main_menu: "मुख्य मेनू: आरोग्य मार्गदर्शनासाठी 1 दाबा. आपल्या रेफरलच्या स्थितीसाठी 2 दाबा. जवळचे प्राथमिक आरोग्य केंद्र आणि रुग्णालयांच्या माहितीसाठी 3 दाबा. अत्यावश्यक औषधांच्या उपलब्धतेसाठी 4 दाबा. आशा किंवा आरोग्य सेवकाशी संपर्क विनंतीसाठी 5 दाबा. शासकीय आरोग्य योजनांच्या माहितीसाठी 6 दाबा. मेनू पुन्हा ऐकण्यासाठी 9 किंवा स्टार दाबा. कॉल संपवण्यासाठी 0 दाबा.",

    // Submenu 1: Health Guidance & Triage
    health_education_menu: "आरोग्य मार्गदर्शन मेनू: ताप आणि प्राथमिक काळजीसाठी 1 दाबा. ओआरएस आणि स्वच्छतेसाठी 2 दाबा. माता आणि बाल संगोपनासाठी 3 दाबा. तातडीची किंवा गंभीर लक्षणे नोंदवण्यासाठी 4 दाबा. मुख्य मेनूसाठी 9 किंवा हॅश दाबा.",
    health_guidance_menu: "आरोग्य मार्गदर्शन मेनू: ताप आणि प्राथमिक काळजीसाठी 1 दाबा. ओआरएस आणि स्वच्छतेसाठी 2 दाबा. माता आणि बाल संगोपनासाठी 3 दाबा. तातडीची किंवा गंभीर लक्षणे नोंदवण्यासाठी 4 दाबा. मुख्य मेनूसाठी 9 किंवा हॅश दाबा.",
    health_tips: {
      "1": "ताप आल्यास विश्रांती घ्या आणि भरपूर पाणी प्या. ताप 3 दिवसांपेक्षा जास्त राहिल्यास जवळच्या प्राथमिक आरोग्य केंद्रात जा. डॉक्टरांच्या सल्ल्याशिवाय औषधे घेऊ नका.",
      "2": "उन्हाळ्यात आणि जुलाब झाल्यास ओआरएस आणि उकळलेले पाणी प्या. जेवणापूर्वी हात स्वच्छ धुवा. स्वच्छता हा आजारांपासून संरक्षणाचा सोपा उपाय आहे.",
      "3": "गरोदरपणात नियमित तपासणी करा आणि लोहयुक्त गोळ्या घ्या. शासकीय रुग्णालयात मोफत व सुरक्षित प्रसूती सुविधा उपलब्ध आहे.",
    },

    // Emergency Triage
    emergency_symptoms_menu: "आपणास गंभीर लक्षणे असल्यास निवडा: छातीत तीव्र कळ किंवा श्वास घेण्यास त्रास असल्यास 1 दाबा. चक्कर किंवा जास्त रक्तस्राव असल्यास 2 दाबा. मुख्य मेनूसाठी 9 किंवा हॅश दाबा.",
    emergency_alert: "⚠️ तातडीची सूचना: आपली लक्षणे गंभीर असू शकतात. कृपया त्वरित 108 वर डायल करा किंवा जवळच्या रुग्णालयाच्या आपत्कालीन विभागात जा. जीवनसेतू फोन सेवा वैद्यकीय उपचारांचा पर्याय नाही.",

    // Submenu 2: Referral Status (PIN Protected)
    referral_auth_prompt: "आपल्या रेफरलची स्थिती जाणून घेण्यासाठी, कृपया आपला 4 अंकी पिन टाका किंवा पुष्टीसाठी 1 दाबा.",
    referral_status_template: "आपला रेफरल सध्या {stage} टप्प्यावर आहे. आपले गंतव्य रुग्णालय {hospital} आहे.",
    referral_not_found: "आपल्या नोंदणीकृत नंबरवर कोणताही सक्रिय रेफरल आढळला नाही. मदतीसाठी जवळच्या प्राथमिक आरोग्य केंद्राशी संपर्क साधा.",
    referral_auth_failed: "सुरक्षा पडताळणी अयशस्वी. गोपनीयतेसाठी माहिती उघड केली जाऊ शकत नाही. कृपया प्राथमिक आरोग्य केंद्राशी संपर्क साधा.",

    // Submenu 3: Facility Lookup
    facility_lookup_menu: "आरोग्य सुविधा मेनू: आष्टी प्राथमिक आरोग्य केंद्रासाठी 1 दाबा. चामोर्शी उप-केंद्रासाठी 2 दाबा. जिल्हा सामान्य रुग्णालय गडचिरोलीसाठी 3 दाबा. मुख्य मेनूसाठी 9 किंवा हॅश दाबा.",
    facility_details: {
      "1": "आष्टी प्राथमिक आरोग्य केंद्र 24 तास आपत्कालीन व प्रसूती सेवेसाठी सुरू आहे. ओपीडी वेळ सकाळी 9 ते संध्याकाळी 5. फोन: 07132-245012.",
      "2": "चामोर्शी आरोग्य उप-केंद्रात प्राथमिक तपासणी आणि लसीकरण उपलब्ध आहे. फोन: 07132-245013.",
      "3": "जिल्हा सामान्य रुग्णालय गडचिरोली येथे 300 खाटा, 24 तास आयसीयू आणि तज्ज्ञ डॉक्टर उपलब्ध आहेत. आपत्कालीन फोन: 07132-222155.",
    },
    facility_info: "आष्टी प्राथमिक आरोग्य केंद्र 24 तास आपत्कालीन सेवेसाठी सुरू आहे. फोन: 07132-245012. जिल्हा सामान्य रुग्णालय गडचिरोली येथे तज्ज्ञ डॉक्टर व आयसीयू उपलब्ध आहे.",

    // Submenu 4: Medicine Availability
    medicine_info_menu: "औषध उपलब्धता मेनू: पॅरासिटामॉलसाठी 1 दाबा. ओआरएस पाकिटांसाठी 2 दाबा. रक्तदाब औषध अम्लोडिपाइनसाठी 3 दाबा. मधुमेह औषध मेटफॉर्मिनसाठी 4 दाबा. मुख्य मेनूसाठी 9 किंवा हॅश दाबा.",
    medicine_details: {
      "1": "आष्टी प्राथमिक आरोग्य केंद्रात पॅरासिटामॉल 500 एमजी उपलब्ध आहे. ओपीडी वेळेत मोफत उपलब्ध.",
      "2": "ओआरएस पाकिटे आष्टी प्राथमिक आरोग्य केंद्रात व सर्व आशा ताईंकडे उपलब्ध आहेत.",
      "3": "अम्लोडिपाइन 5 एमजी मर्यादित साठ्यात उपलब्ध असून नियमित रुग्णांना वाटप सुरू आहे.",
      "4": "मेटफॉर्मिन 500 एमजी औषध आष्टी केंद्रात उपलब्ध आहे. डॉक्टरांची चिठ्ठी आवश्यक आहे.",
    },
    medicine_info: "आष्टी प्राथमिक आरोग्य केंद्रात पॅरासिटामॉल, ओआरएस आणि आवश्यक रक्तदाब औषधांचा पुरवठा उपलब्ध आहे. मोफत औषधांसाठी ओपीडी वेळेत भेट द्या.",
    medicine_disclaimer: "औषधांची उपलब्धता प्राथमिक आरोग्य केंद्राच्या नोंदींवर आधारित आहे. कृपया डॉक्टरांच्या सल्ल्यानुसारच औषध घ्या.",

    // Submenu 5: Callback Request
    callback_prompt: "आरोग्य कर्मचाऱ्याकडून संपर्क हवा असल्यास 1 दाबा. मुख्य मेनूसाठी 9 किंवा हॅश दाबा.",
    callback_success: "आपली विनंती नोंदवली गेली आहे. आपल्या भागातील आशा किंवा आरोग्य सेवक कामाच्या वेळेत आपल्याशी संपर्क साधतील.",
    callback_duplicate: "आपल्या नंबरवरून आधीच संपर्क विनंती नोंदवली आहे. आरोग्य सेवक लवकरच संपर्क करतील.",

    // Submenu 6: Government Schemes
    schemes_menu: "शासकीय योजना मेनू: आयुष्यमान भारत प्रधानमंत्री जन आरोग्य योजनेसाठी 1 दाबा. महात्मा ज्योतिराव फुले जन आरोग्य योजनेसाठी 2 दाबा. जननी सुरक्षा योजनेसाठी 3 दाबा. मुख्य मेनूसाठी 9 किंवा हॅश दाबा.",
    scheme_details: {
      "1": "आयुष्यमान भारत योजनेअंतर्गत पात्र कुटुंबांना दरवर्षी 5 लाख रुपयांपर्यंत मोफत उपचारांची सोय आहे.",
      "2": "महात्मा ज्योतिराव फुले जन आरोग्य योजना (MJPJAY) अंतर्गत गंभीर आजारांवर मोफत उपचार उपलब्ध आहेत.",
      "3": "जननी सुरक्षा योजनेअंतर्गत शासकीय रुग्णालयात सुरक्षित प्रसूती करणाऱ्या ग्रामीण महिलांना 1400 रुपयांचे आर्थिक सहाय्य मिळते.",
    },

    // System Messages
    invalid_input: "चुकीचा पर्याय. कृपया योग्य क्रमांक निवडा.",
    timeout_message: "कोणताही प्रतिसाद मिळाला नाही. मेनू पुन्हा सुरू होत आहे.",
    max_retries_exceeded: "कमाल मर्यादा संपली. कॉल बंद होत आहे. जीवनसेतूशी संपर्क केल्याबद्दल धन्यवाद.",
    goodbye: "जीवनसेतू आरोग्य सेवेला कॉल केल्याबद्दल धन्यवाद. निरोगी राहा. नमस्कार.",
  },

  en: {
    welcome: "Welcome to JeevanSetu Rural Healthcare Access.",
    language_prompt: "Press 1 for Hindi. Press 2 for Marathi. Press 3 for English.",
    main_menu: "Main Menu: Press 1 for Health Education and Guidance. Press 2 for Referral Status. Press 3 for PHC and Hospital Information. Press 4 for Essential Medicine Availability. Press 5 to Request Health Worker Callback. Press 6 for Government Schemes. Press 9 or Star to repeat menu. Press 0 to exit.",

    // Submenu 1: Health Guidance & Triage
    health_education_menu: "Health Guidance Menu: Press 1 for Seasonal Fever & Care. Press 2 for Hydration & Hygiene. Press 3 for Maternal & Child Health. Press 4 to report emergency symptoms. Press 9 or Hash for main menu.",
    health_guidance_menu: "Health Guidance Menu: Press 1 for Seasonal Fever & Care. Press 2 for Hydration & Hygiene. Press 3 for Maternal & Child Health. Press 4 to report emergency symptoms. Press 9 or Hash for main menu.",
    health_tips: {
      "1": "For mild seasonal fevers, stay hydrated and rest. If fever persists over 3 days or is high, visit your nearest Primary Health Centre immediately. Do not take unprescribed antibiotics.",
      "2": "Drink boiled or filtered water and ORS during hot weather or diarrhea. Wash hands thoroughly before meals to prevent infections.",
      "3": "Ensure timely antenatal check-ups and iron supplementation. Free institutional delivery and ambulance support are available at government hospitals.",
    },

    // Emergency Triage
    emergency_symptoms_menu: "For serious symptoms, select: Press 1 for severe chest pain or breathlessness. Press 2 for sudden fainting or profuse bleeding. Press 9 or Hash for main menu.",
    emergency_alert: "⚠️ Emergency Medical Guidance: The symptoms you described may require immediate medical attention. Please call 108 immediately for a free emergency ambulance or proceed to the nearest hospital casualty. JeevanSetu is not a diagnostic tool.",

    // Submenu 2: Referral Status (PIN Protected)
    referral_auth_prompt: "To check your referral status securely, please enter your 4-digit security PIN, or press 1 to confirm with your registered caller phone.",
    referral_status_template: "Your referral is currently at the {stage} stage. Your destination hospital is {hospital}.",
    referral_not_found: "No active clinical referral found for your registered phone number. Please contact your nearest PHC for assistance.",
    referral_auth_failed: "Security verification failed. To protect your medical privacy, details cannot be disclosed. Please visit your PHC.",

    // Submenu 3: Facility Lookup
    facility_lookup_menu: "Healthcare Facility Menu: Press 1 for Ashti Primary Health Centre. Press 2 for Chamorshi Sub-Centre. Press 3 for District Civil Hospital Gadchiroli. Press 9 or Hash for main menu.",
    facility_details: {
      "1": "Ashti Primary Health Centre is operational 24x7 for emergencies and delivery care. OPD hours are 9 AM to 5 PM. Contact phone: 07132-245012.",
      "2": "Chamorshi Health Sub-Centre provides routine health checkups and vaccination services. Contact phone: 07132-245013.",
      "3": "District Civil Hospital Gadchiroli is equipped with 300 beds, 24x7 ICU, and specialist consultants. Emergency Desk phone: 07132-222155.",
    },
    facility_info: "Ashti Primary Health Centre is operational with 24x7 emergency triage. Phone: 07132-245012. District Civil Hospital Gadchiroli provides ICU beds and specialist consultations.",

    // Submenu 4: Medicine Availability
    medicine_info_menu: "Medicine Availability Menu: Press 1 for Paracetamol. Press 2 for ORS Packets. Press 3 for Amlodipine (Blood Pressure). Press 4 for Metformin (Diabetes). Press 9 or Hash for main menu.",
    medicine_details: {
      "1": "Paracetamol 500mg tablets are in stock at Ashti Primary Health Centre. Free dispensation is available during OPD hours.",
      "2": "ORS hydration packets are in stock at Ashti PHC and with local ASHA workers.",
      "3": "Amlodipine 5mg blood pressure medication is available in limited quantity for registered chronic care patients.",
      "4": "Metformin 500mg diabetes tablets are in stock at Ashti PHC with a valid doctor prescription.",
    },
    medicine_info: "Essential supplies including Paracetamol, ORS, and Amlodipine are stocked at Ashti Primary Health Centre. Free dispensation is available during OPD hours.",
    medicine_disclaimer: "Medicine availability is based on PHC inventory records. Please consult a doctor during OPD hours for prescription and dispensation.",

    // Submenu 5: Callback Request
    callback_prompt: "Press 1 to request a follow-up callback from your local health worker. Press 9 or Hash for main menu.",
    callback_success: "Your callback request has been logged. An ASHA or PHC health coordinator will reach out to you during working hours.",
    callback_duplicate: "A pending callback request already exists for your number. Health staff will reach out shortly.",

    // Submenu 6: Government Schemes
    schemes_menu: "Government Healthcare Schemes Menu: Press 1 for Ayushman Bharat PM-JAY. Press 2 for MJPJAY. Press 3 for Janani Suraksha Yojana. Press 9 or Hash for main menu.",
    scheme_details: {
      "1": "Ayushman Bharat PM-JAY provides cashless hospitalization coverage up to ₹5,00,000 per eligible family per year at empaneled hospitals.",
      "2": "Mahatma Jyotirao Phule Jan Arogya Yojana (MJPJAY) provides free critical and surgical care coverage for families in Maharashtra.",
      "3": "Janani Suraksha Yojana (JSY) offers ₹1,400 direct financial assistance to rural mothers opting for institutional delivery at government facilities.",
    },

    // System Messages
    invalid_input: "Invalid selection. Please choose a valid digit.",
    timeout_message: "No input received. Repeating menu.",
    max_retries_exceeded: "Maximum attempts exceeded. Disconnecting call. Thank you for calling JeevanSetu.",
    goodbye: "Thank you for contacting JeevanSetu Healthcare. Stay healthy and safe. Goodbye.",
  },
};

/**
 * Get localized content helper
 */
const getIvrContent = (lang = "hi") => {
  return IVR_CONTENT[lang] || IVR_CONTENT.hi;
};

module.exports = {
  IVR_CONTENT,
  getIvrContent,
};
