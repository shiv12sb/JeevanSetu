const { createCondition } = require("./dataset_helper");

const infections = [
  createCondition({
    id: "viral_fever",
    canonical_name: "Viral Fever",
    category: "infections_fever",
    names: { english: "Viral Fever", hindi: "वायरल बुखार", marathi: "व्हायरल ताप" },
    synonyms: {
      english: ["viral infection", "acute viral illness", "temperature"],
      hindi: ["वायरल फीवर", "मौसमी बुखार", "साधारण बुखार"],
      marathi: ["व्हायरल ताप", "अंगात ताप", "साधा ताप", "हंगामी ताप"],
      roman_hindi: ["viral bukhar", "mausami bukhar", "bukhar hai", "body garam"],
      roman_marathi: ["tap aala", "ang garam", "viral tap", "ang dukhtay"],
      common_indian_terms: ["viral", "tap", "bukhar", "temperature vadhl"]
    },
    common_symptoms: ["ताप (Fever)", "अंगदुखी (Body ache)", "डोकेदुखी (Headache)", "थकवा (Fatigue)", "घसा खवखवणे (Sore throat)"],
    general_information: ["व्हायरल ताप हा विषाणूंच्या संसर्गामुळे होणारा सामान्य ताप आहे जो साधारण ३ ते ५ दिवस राहतो."],
    safe_supportive_care: ["भरपूर पाणी, ओआरएस किंवा ताजे पातळ पदार्थ प्या.", "शांत ठिकाणी पुरेशी विश्रांती घ्या.", "हलका व ताजा आहार घ्या.", "तापमानाची नियमित नोंद ठेवा."],
    things_to_avoid: ["डॉक्टरांच्या सल्ल्याशिवाय स्वतःहून अँटीबायोटिक्स घेऊ नका.", "उपाशी राहणे किंवा अतिश्रम करणे टाळा."],
    red_flags: ["ताप १०३°F पेक्षा जास्त असणे", "३ दिवसांपेक्षा जास्त काळ ताप न उतरणे", "श्वास घेण्यास त्रास", "तीव्र डोकेदुखी किंवा मान आखडणे"],
    urgency: "self_care",
    when_to_visit_doctor: ["ताप ३ दिवसांपेक्षा जास्त राहिल्यास", "तीव्र थंडी वाजून ताप येत असल्यास"],
    appropriate_specialty: ["General Physician", "Medical Officer"],
    facility_type: ["PHC", "Rural Hospital"]
  }),
  createCondition({
    id: "dengue_fever",
    canonical_name: "Dengue Fever",
    category: "infections_fever",
    names: { english: "Dengue Fever", hindi: "डेंगू बुखार", marathi: "डेंग्यू ताप" },
    synonyms: {
      english: ["breakbone fever", "dengue virus infection"],
      hindi: ["डेंगू", "हड्डी तोड़ बुखार"],
      marathi: ["डेंग्यू", "डेंग्यू ताप", "हाडमोडी ताप"],
      roman_hindi: ["dengue bukhar", "platelet kam hona"],
      roman_marathi: ["dengue tap", "platelets kami zale"],
      common_indian_terms: ["dengue", "breakbone"]
    },
    common_symptoms: ["तीव्र ताप (High fever)", "डोळ्यांच्या मागे तीव्र वेदना (Retro-orbital pain)", "हाडे व सांधेदुखी (Bone/joint pain)", "अंगावर बारीक पुरळ (Skin rash)", "मळमळ (Nausea)"],
    general_information: ["डेंग्यू हा एडिस डासाच्या चावण्यामुळे पसरणारा विषाणूजन्य आजार आहे."],
    safe_supportive_care: ["भरपूर पाणी, ओआरएस, नारळ पाणी आणि ताक घ्या.", "पूर्ण विश्रांती घ्या."],
    things_to_avoid: ["ॲस्पिरिन किंवा आयबुप्रोफेन (Ibuprofen) गोळ्या घेऊ नका, कारण त्यामुळे रक्तस्राव होऊ शकतो.", "पाणी पिणे कमी करू नका."],
    red_flags: ["हिरड्यांमधून किंवा नाकातून रक्त येणे", "सतत उलट्या होणे", "तीव्र पोटदुखी", "अतिशय अशक्तपणा किंवा चक्कर येणे"],
    urgency: "urgent",
    when_to_visit_doctor: ["डेंग्यूची लक्षणे दिसताच त्वरित शासकीय आरोग्य केंद्रात रक्त तपासणी (NS1/IgM/Platelet count) करून घ्या."],
    appropriate_specialty: ["General Physician", "Internal Medicine"],
    facility_type: ["PHC", "Sub-District Hospital", "District Hospital"]
  }),
  createCondition({
    id: "malaria",
    canonical_name: "Malaria",
    category: "infections_fever",
    names: { english: "Malaria", hindi: "मलेरिया", marathi: "मलेरिया (हिवताप)" },
    synonyms: {
      english: ["plasmodium infection", "intermittent fever"],
      hindi: ["मलेरिया बुखार", "हिवताप", "कंपकंपी वाला बुखार"],
      marathi: ["हिवताप", "मलेरिया ताप", "थंडी वाजून येणारा ताप"],
      roman_hindi: ["malaria bukhar", "thand lagke bukhar"],
      roman_marathi: ["hivtap", "thandi wajun tap"],
      common_indian_terms: ["malaria", "hivtap"]
    },
    common_symptoms: ["तीव्र थंडी वाजून ताप येणे (Chills and rigors)", "ताप उतरताना भरपूर घाम येणे (Profuse sweating)", "डोकेदुखी (Headache)", "उलट्या किंवा मळमळ (Vomiting)"],
    general_information: ["मलेरिया हा ॲनोफिलीस डासाच्या चावण्यामुळे होणारा परजीवी संसर्ग आहे."],
    safe_supportive_care: ["ओआरएस व द्रवपदार्थ नियमित घ्या.", "रक्ताची तपासणी होईपर्यंत आराम करा."],
    things_to_avoid: ["तपासणी न करता औषधे घेणे टाळा."],
    red_flags: ["लघवीचा रंग गडद होणे", "अतिशय अशक्तपणा", "सतत उलट्या होणे", "बेशुद्धी किंवा भ्रम"],
    urgency: "urgent",
    when_to_visit_doctor: ["थंडी वाजून ताप येत असल्यास प्राथमिक आरोग्य केंद्रात (PHC) मोफत रक्ताचा नमुना (Blood Smear/RDT) तपासा."],
    appropriate_specialty: ["General Physician", "Infectious Disease Specialist"],
    facility_type: ["PHC", "Rural Hospital", "District Hospital"]
  }),
  createCondition({
    id: "typhoid_fever",
    canonical_name: "Typhoid Fever",
    category: "infections_fever",
    names: { english: "Typhoid Fever", hindi: "टाइफाइड (मियादी बुखार)", marathi: "टायफॉइड (विषमज्वर)" },
    synonyms: {
      english: ["enteric fever", "salmonella typhi infection"],
      hindi: ["टाइफाइड", "मियादी बुखार", "मोतीझरा"],
      marathi: ["टायफॉइड", "विषमज्वर", "मोतीझरा ताप"],
      roman_hindi: ["typhoid", "miyadi bukhar", "motijhara"],
      roman_marathi: ["typhoid tap", "vishamjwar"],
      common_indian_terms: ["typhoid", "enteric fever"]
    },
    common_symptoms: ["सतत पायऱ्यांप्रमाणे वाढणारा ताप (Step-ladder fever)", "पोटदुखी (Abdominal pain)", "बद्धकोष्ठता किंवा जुलाब (Constipation/Diarrhea)", "भूक मंदावणे (Loss of appetite)"],
    general_information: ["टायफॉइड हा दूषित पाणी आणि अन्नामुळे पसरणारा जिवाणू संसर्ग (Salmonella) आहे."],
    safe_supportive_care: ["उकळून थंड केलेले पाणीच प्या.", "मऊ, पचायला सोपा व ताजा आहार घ्या.", "हात स्वच्छ धुण्याची सवय ठेवा."],
    things_to_avoid: ["बाहेरील उघड्यावरील अन्न व अस्वच्छ पाणी पिणे टाळा.", "डॉक्टरांनी दिलेला औषधांचा कोर्स अर्धवट सोडू नका."],
    red_flags: ["तीव्र पोटदुखी व पोट फुगणे", "शौचातून रक्त पडणे", "अतिशय उच्च ताप व गोंधळलेली अवस्था"],
    urgency: "urgent",
    when_to_visit_doctor: ["सलग ५ दिवसांपेक्षा जास्त काळ ताप असल्यास विडाल (Widal) किंवा ब्लड कल्चर चाचणीसाठी डॉक्टरांना भेटा."],
    appropriate_specialty: ["General Physician", "Internal Medicine"],
    facility_type: ["PHC", "Sub-District Hospital", "District Hospital"]
  }),
  createCondition({
    id: "chikungunya",
    canonical_name: "Chikungunya",
    category: "infections_fever",
    names: { english: "Chikungunya", hindi: "चिकनगुनिया", marathi: "चिकनगुनिया" },
    synonyms: {
      english: ["chikungunya virus"],
      hindi: ["चिकनगुनिया बुखार", "जोड़ों का दर्द बुखार"],
      marathi: ["चिकनगुनिया", "सांधेदुखीचा ताप"],
      roman_hindi: ["chikungunya", "jodo me dard"],
      roman_marathi: ["chikungunya tap", "sandhe dukhi"],
      common_indian_terms: ["chikungunya"]
    },
    common_symptoms: ["अचानक तीव्र ताप (Sudden high fever)", "तीव्र सांधेदुखी व सूज (Severe joint pain and swelling)", "अंगावर लाल पुरळ (Rash)", "स्नायूदुखी (Muscle pain)"],
    general_information: ["चिकनगुनिया हा एडिस डासांमुळे पसरणारा विषाणूजन्य आजार असून यात सांधेदुखी दीर्घकाळ राहू शकते."],
    safe_supportive_care: ["सांध्यांना विश्रांती द्या.", "भरपूर पाणी व द्रवपदार्थ घ्या.", "सांध्यांना हलका गरम किंवा थंड शेक द्या."],
    things_to_avoid: ["अतिप्रमाणात जड व्यायाम करणे टाळा."],
    red_flags: ["हालचाल करणे अशक्य होणे", "तीव्र डिहायड्रेशन", "डोळ्यांमध्ये जळजळ व दृष्टी समस्या"],
    urgency: "doctor_soon",
    when_to_visit_doctor: ["सांध्यांमध्ये तीव्र सूज व ताप असल्यास शासकीय आरोग्य केंद्रात सल्ला घ्या."],
    appropriate_specialty: ["General Physician", "Rheumatologist"],
    facility_type: ["PHC", "Rural Hospital", "District Hospital"]
  }),
  createCondition({
    id: "tuberculosis_pulmonary",
    canonical_name: "Pulmonary Tuberculosis (TB)",
    category: "infections_fever",
    names: { english: "Pulmonary Tuberculosis (TB)", hindi: "टीबी (क्षय रोग)", marathi: "क्षयरोग (टीबी)" },
    synonyms: {
      english: ["tuberculosis", "TB", "mycobacterium tuberculosis"],
      hindi: ["टीबी", "क्षय रोग", "तपेदिक"],
      marathi: ["क्षयरोग", "टीबी", "खोborderयाचा आजार"],
      roman_hindi: ["tb", "tapedik", "khansi me khoon"],
      roman_marathi: ["tb", "kshayrog", "khoklyat rakt"],
      common_indian_terms: ["tb", "dots", "kshay rog"]
    },
    common_symptoms: ["२ आठवड्यांपेक्षा जास्त काळ खोकला (Cough > 2 weeks)", "संध्याकाळी येणारा हलका ताप (Evening rise of temperature)", "रात्री घाम येणे (Night sweats)", "वजन कमी होणे (Weight loss)", "थुंकीतून रक्त येणे (Hemoptysis)"],
    general_information: ["क्षयरोग हा मायकोबॅक्टेरियममुळे होणारा संसर्गजन्य आजार आहे, जो योग्य उपचाराने १००% बरा होतो."],
    safe_supportive_care: ["सकस, प्रथिनांनी समृद्ध आहार (डाळी, अंडी, दूध) घ्या.", "खोकताना तोंडावर रुमाल धरा."],
    things_to_avoid: ["शासकीय डॉट्स (DOTS) उपचार अर्धवट थांबवू नका.", "धूम्रपान व मद्यपान पूर्णपणे टाळा."],
    red_flags: ["थुंकीतून मोठ्या प्रमाणात रक्त येणे", "तीव्र धाप लागणे", "तीव्र छातीत दुखणे"],
    urgency: "urgent",
    when_to_visit_doctor: ["२ आठवड्यांपेक्षा जास्त खोकला असल्यास नजीकच्या PHC/DMC मध्ये मोफत थुंकी तपासणी (CBNAAT/Sputum) करून घ्या."],
    appropriate_specialty: ["Pulmonologist", "Chest Physician", "General Physician"],
    facility_type: ["PHC", "DOTS Centre", "District Tuberculosis Centre (DTC)"]
  }),
  createCondition({
    id: "common_cold",
    canonical_name: "Common Cold",
    category: "infections_fever",
    names: { english: "Common Cold", hindi: "सामान्य जुकाम / सर्दी", marathi: "सर्दी व पडसे" },
    synonyms: {
      english: ["rhinitis", "head cold", "coryza", "viral upper respiratory infection"],
      hindi: ["सर्दी", "जुकाम", "नजला"],
      marathi: ["सर्दी", "पडसे", "नाक गळणे", "शिंका"],
      roman_hindi: ["sardi", "jukham", "naak behna", "khansi"],
      roman_marathi: ["sardi zali", "nak galtoy", "padse"],
      common_indian_terms: ["sardi", "jukham", "cold"]
    },
    common_symptoms: ["नाक गळणे किंवा चोंदणे (Runny/stuffy nose)", "शिंका येणे (Sneezing)", "घसा खवखवणे (Sore throat)", "हलका ताप (Mild fever)"],
    general_information: ["सर्दी हा नाकाच्या व घशाच्या वरच्या भागाचा सामान्य विषाणूजन्य संसर्ग आहे."],
    safe_supportive_care: ["मिठाच्या कोमट पाण्याच्या गुळण्या करा.", "गरम पाण्याची वाफ घ्या.", "गरम पाणी, सूप किंवा काढा हळूहळू प्या."],
    things_to_avoid: ["अनावश्यक अँटीबायोटिक्स घेणे टाळा.", "थंड व आंबट पदार्थ जास्त प्रमाणात घेणे टाळा."],
    red_flags: ["श्वास घेताना शिट्टीसारखा आवाज किंवा धाप लागणे", "ताप ५ दिवसांपेक्षा जास्त राहणे", "तीव्र कानदुखी"],
    urgency: "self_care",
    when_to_visit_doctor: ["लक्षणे आठवड्यापेक्षा जास्त काळ टिकल्यास डॉक्टरांना दाखवा."],
    appropriate_specialty: ["General Physician"],
    facility_type: ["PHC", "Dispensary"]
  }),
  createCondition({
    id: "influenza_flu",
    canonical_name: "Influenza (Flu)",
    category: "infections_fever",
    names: { english: "Influenza (Flu)", hindi: "इन्फ्लूएंजा (फ्लू)", marathi: "इन्फ्लूएंझा (फ्लू)" },
    synonyms: {
      english: ["flu", "seasonal influenza", "H1N1"],
      hindi: ["फ्लू", "इन्फ्लूएंजा"],
      marathi: ["फ्लू", "इन्फ्लुएंझा"],
      roman_hindi: ["flu", "mausami flu"],
      roman_marathi: ["flu", "swine flu"],
      common_indian_terms: ["flu", "swine flu"]
    },
    common_symptoms: ["अचानक तीव्र ताप (Sudden high fever)", "तीव्र अंगदुखी (Severe myalgia)", "सुका खोकला (Dry cough)", "तीव्र थकवा (Extreme exhaustion)"],
    general_information: ["फ्लू हा इन्फ्लूएंझा विषाणूमुळे होणारा संसर्ग असून सामान्य सर्दीपेक्षा जास्त तीव्र असतो."],
    safe_supportive_care: ["सक्तीने विश्रांती घ्या.", "द्रवपदार्थ भरपूर प्रमाणात प्या."],
    things_to_avoid: ["गर्दीच्या ठिकाणी जाणे टाळा.", "स्वतःहून औषधे घेणे टाळा."],
    red_flags: ["छातीत तीव्र दुखणे", "श्वास घेण्यास गंभीर अडचण", "ओठ किंवा नखे निळी पडणे"],
    urgency: "doctor_soon",
    when_to_visit_doctor: ["उच्च ताप आणि श्वास घेण्यास अडचण असल्यास तात्काळ तपासणी करा."],
    appropriate_specialty: ["General Physician", "Pulmonologist"],
    facility_type: ["PHC", "Rural Hospital", "District Hospital"]
  }),
  createCondition({
    id: "pneumonia_community_acquired",
    canonical_name: "Pneumonia",
    category: "infections_fever",
    names: { english: "Pneumonia", hindi: "निमोनिया (फेफड़ों का संक्रमण)", marathi: "न्युमोनिया (फुफ्फुसाचा संसर्ग)" },
    synonyms: {
      english: ["chest infection", "lung infection", "bronchopneumonia"],
      hindi: ["निमोनिया", "फेफड़ों का इन्फेक्शन", "पसली चलना"],
      marathi: ["निमोनिया", "न्युमोनिया", "छाती भरणे", "फुफ्फुसात कफ"],
      roman_hindi: ["pneumonia", "pasli chalna", "chhati me balgam"],
      roman_marathi: ["pneumonia", "chhati bharli", "shwas ghenyala tras"],
      common_indian_terms: ["pneumonia", "pasli chalna"]
    },
    common_symptoms: ["खोकल्यासोबत पिवळा/हिरवा कफ (Cough with phlegm)", "तीव्र ताप व थंडी (Fever with chills)", "श्वास घेताना छातीत दुखणे (Chest pain while breathing)", "जलद श्वासोच्छ्वास (Rapid breathing)"],
    general_information: ["न्युमोनिया हा फुफ्फुसांच्या हवेच्या पिशव्यांचा (Alveoli) गंभीर जिवाणू किंवा विषाणू संसर्ग आहे."],
    safe_supportive_care: ["डॉक्टरांनी दिलेली औषधे वेळेवर पूर्ण करा.", "ऑक्सिजन पातळी (SpO2) नियमित तपासा."],
    things_to_avoid: ["धूर, धूळ आणि थंड हवेत जाणे टाळा.", "औषधोपचारात विलंब करू नका."],
    red_flags: ["ऑक्सिजन पातळी (SpO2) ९४% पेक्षा कमी होणे", "श्वास घेण्यास प्रचंड त्रास होणे", "ओठ निळे पडणे", "मानसिक गोंधळ"],
    urgency: "urgent",
    when_to_visit_doctor: ["लहान मुलांमध्ये किंवा वृद्धांमध्ये जलद श्वास असल्यास त्वरित शासकीय रुग्णालयात दाखल व्हा."],
    appropriate_specialty: ["Pulmonologist", "General Physician", "Pediatrician"],
    facility_type: ["Rural Hospital", "Sub-District Hospital", "District Hospital"]
  }),
  createCondition({
    id: "urinary_tract_infection_uti",
    canonical_name: "Urinary Tract Infection (UTI)",
    category: "infections_fever",
    names: { english: "Urinary Tract Infection (UTI)", hindi: "मूत्र मार्ग संक्रमण (UTI)", marathi: "मूत्रमार्ग संसर्ग (UTI)" },
    synonyms: {
      english: ["cystitis", "bladder infection", "water infection"],
      hindi: ["यूटीआई", "पेशाब में जलन", "पेशाब का इन्फेक्शन"],
      marathi: ["लघवीची जळजळ", "मूत्रमार्गाचा संसर्ग", "लघवीला आग"],
      roman_hindi: ["peshab me jalan", "uti", "bar bar peshab aana"],
      roman_marathi: ["laghvila aag", "uti", "laghvi rokhne"],
      common_indian_terms: ["peshab me jalan", "laghvi aag", "uti"]
    },
    common_symptoms: ["लघवी करताना जळजळ किंवा वेदना (Burning micturition)", "वारंवार लघवीची भावना (Frequent urination)", "लघवीचा रंग गढूळ असणे (Cloudy urine)", "पोटाच्या खालच्या भागात कळ (Lower abdominal pain)"],
    general_information: ["UTI हा मूत्रमार्गात जिवाणूंचा प्रादुर्भाव झाल्यामुळे होणारा त्रास आहे, जो महिलांमध्ये अधिक प्रमाणात आढळतो."],
    safe_supportive_care: ["दररोज ३ ते ४ लिटर स्वच्छ पाणी प्या.", "लघवी रोखून धरू नका.", "वैयक्तिक स्वच्छता ठेवा."],
    things_to_avoid: ["अस्वच्छ सार्वजनिक प्रसाधनगृहांचा वापर करताना काळजी घ्या.", "स्वतःहून औषध दुकानातून अँटीबायोटिक्स घेऊ नका."],
    red_flags: ["थंडी वाजून ताप येणे", "पाठीत किंवा कमरेच्या बाजूला तीव्र वेदना (Flank pain)", "लघवीतून रक्त येणे (Hematuria)"],
    urgency: "doctor_soon",
    when_to_visit_doctor: ["लघवीतील जळजळ २ दिवसांपेक्षा जास्त राहिल्यास किंवा ताप आल्यास युरिन टेस्ट (Routine/Microscopy) साठी PHC ला भेट द्या."],
    appropriate_specialty: ["General Physician", "Urologist", "Gynecologist"],
    facility_type: ["PHC", "Rural Hospital", "District Hospital"]
  })
];

// Add 35 more conditions in infections category programmatically to reach 45
const additionalInfections = [
  ["acute_gastroenteritis", "Acute Gastroenteritis", "गैस्ट्रोएंटेराइटिस (उल्टी-दस्त)", "गॅस्ट्रो (उलटी-जुलाब)", ["पोटदुखी", "उलटी", "पाण्यासारखे जुलाब", "ताप"], "urgent"],
  ["cholera", "Cholera", "हैजा", "पटकी (कॉलरा)", ["तांदळाच्या पाण्यासारखे जुलाब", "अतिशय तीव्र डिहायड्रेशन", "स्नायूंमध्ये गोळे येणे"], "emergency"],
  ["leptospirosis", "Leptospirosis", "लेप्टोस्पायरोसिस", "लेप्टोस्पायरोसिस", ["तीव्र ताप", "डोळे लाल होणे", "पोटऱ्यांमध्ये तीव्र वेदना", "कावीळ"], "urgent"],
  ["acute_tonsillitis", "Acute Tonsillitis", "टॉन्सिलाइटिस (गले का संक्रमण)", "टॉन्सिल्सची सूज", ["घसा तीव्र दुखणे", "गिळताना त्रास", "ताप", "मानेवर गाठी"], "doctor_soon"],
  ["acute_pharyngitis", "Acute Pharyngitis", "फैरिंजाइटिस (गले में खराश)", "घशाची जळजळ", ["घसा खवखवणे", "सुका खोकला", "हलका ताप"], "self_care"],
  ["acute_sinusitis", "Acute Sinusitis", "साइनुसाइटिस", "सायनसचा त्रास", ["कपाळावर व गालांवर जडपणा", "नाकातून घट्ट पिवळा स्त्राव", "डोकेदुखी"], "doctor_soon"],
  ["acute_otitis_media", "Acute Otitis Media", "मध्य कान का संक्रमण", "कानदुखी व संसर्ग", ["कानात तीव्र वेदना", "कानातून पू वाहणे", "ताप"], "doctor_soon"],
  ["chickenpox_varicella", "Chickenpox", "चेचक (छोटी माता)", "कांजण्या", ["अंगावर पाण्यासारखे फोड", "खाज सुटणे", "ताप"], "doctor_soon"],
  ["measles_rubeola", "Measles", "खसरा", "गोवर", ["तीव्र ताप", "डोळे लाल होणे", "अंगावर तांबूस पुरळ", "खोकला"], "urgent"],
  ["mumps_parotitis", "Mumps", "गलसुआ", "गालगुंड", ["कानाखालील गालाला सूज", "ताप", "तोंड उघडताना वेदना"], "doctor_soon"],
  ["rubella_german_measles", "Rubella", "रूबेला", "जर्मन गोवर", ["हलका ताप", "बारीक गुलाबी पुरळ", "मानेच्या ग्रंथी सुजणे"], "doctor_soon"],
  ["pertussis_whooping_cough", "Whooping Cough", "काली खांसी", "डांग्या खोकला", ["सलग खोकल्याची उबळ", "श्वास घेताना विशिष्ट आवाज"], "urgent"],
  ["tetanus", "Tetanus", "धनुस्तंभ (टिटनेस)", "धनुर्वात (टिटॅनस)", ["जबडा घट्ट मिटणे", "स्नायू आखडणे", "पाठीला बाक येणे"], "emergency"],
  ["rabies", "Rabies", "रेबीज (अलर्क रोग)", "रेबीज (पिसाळणे)", ["पाण्याची भीती (Hydrophobia)", "लाळ गळणे", "आक्रमकता"], "emergency"],
  ["covid19_infection", "COVID-19", "कोविड-19", "कोरोना संसर्ग", ["ताप", "खोकला", "श्वास घेण्यास अडचण", "वास व चव न लागणे"], "urgent"],
  ["scabies_infestation", "Scabies", "खुजली (स्केबीज)", "खरूज", ["रात्रीच्या वेळी तीव्र खाज", "बोटांच्या बेचक्यात बारीक फोड"], "doctor_soon"],
  ["ringworm_tinea", "Ringworm (Tinea)", "दाद (दाद-खाज)", "गजकर्ण", ["वर्तुळाकार लाल चट्टे", "कडांना तीव्र खाज"], "self_care"],
  ["candida_oral_thrush", "Oral Thrush", "मुंह का फंगल संक्रमण", "तोंडातील बुरशी संसर्ग", ["जिभेवर पांढरे डाग", "तोंडात जळजळ"], "doctor_soon"],
  ["amoebic_dysentery", "Amoebic Dysentery", "अमीबिक पेचिश", "आमांश (आव पडणे)", ["शौचातून शेम पडणे", "पोटात पीळ पडणे", "रक्ताचे जुलाब"], "urgent"],
  ["giardiasis", "Giardiasis", "गियार्डियासिस", "जिआर्डिया पोट संसर्ग", ["दुर्गंधीयुक्त जुलाब", "पोट फुगणे", "मळमळ"], "doctor_soon"],
  ["herpes_zoster_shingles", "Herpes Zoster (Shingles)", "दादरा (हर्पीस)", "नागीण (हर्पिस)", ["एकाच बाजूला पट्ट्यासारखे वेदनादायी फोड", "तीव्र जळजळ"], "urgent"],
  ["cellulitis_bacterial", "Cellulitis", "सेल्युलाइटिस", "त्वचेखालील तीव्र संसर्ग", ["त्वचा लाल, गरम व सुजणे", "तीव्र वेदना", "ताप"], "urgent"],
  ["impetigo_contagiosa", "Impetigo", "फुंसी (इम्पेटिगो)", "त्वचेवरील पूयुक्त फोड", ["मधमाश्यांच्या पोळ्यासारखे खपली असलेले फोड"], "doctor_soon"],
  ["folliculitis_skin", "Folliculitis", "बालतोड़", "केसतोड व पुटी", ["केसांच्या मुळाशी बारीक पूयुक्त पुटकुळ्या", "वेदना"], "self_care"],
  ["furuncle_boil", "Boil (Furuncle)", "फोड़ा", "मोठा गळू / गळू", ["लाल, वेदनादायी गाठ, मध्यभागी पू"], "doctor_soon"],
  ["carbuncle_deep_infection", "Carbuncle", "बड़ा फोड़ा", "मोठा विषारी गळू", ["अनेक तोंडांचा मोठा पू भरलेला गळू", "ताप"], "urgent"],
  ["infectious_mononucleosis", "Infectious Mononucleosis", "मोनोन्यूक्लियोसिस", "ग्रंथिज्वर", ["तीव्र थकवा", "घसा दुखणे", "मानेवरील गाठी"], "doctor_soon"],
  ["h_pylori_gastric_infection", "H. Pylori Infection", "एच पाइलोरी इन्फेक्शन", "पोटातील जंतू संसर्ग", ["पोटात सतत जळजळ", "उपाशीपोटी वेदना"], "doctor_soon"],
  ["cutaneous_larva_migrans", "Cutaneous Larva Migrans", "त्वचा लार्वा संक्रमण", "त्वचेखालील जंत संसर्ग", ["त्वचेखाली सर्पाकार रेषेत खाज व लालसरपणा"], "doctor_soon"],
  ["filariasis_elephantiasis", "Filariasis (Elephantiasis)", "हाथीपांव (फाइलेरिया)", "हत्तीरोग (पाय सुजणे)", ["पायाला तीव्र सूज", "त्वचा जाड होणे", "वारंवार ताप"], "urgent"],
  ["hookworm_infestation", "Hookworm Infection", "हुकवर्म (अंकुशकृमि)", "अंकुशकृमी जंत संसर्ग", ["अशक्तपणा", "रक्तक्षय", "पोटात अस्वस्थता"], "doctor_soon"],
  ["roundworm_ascariasis", "Ascariasis", "पेट के कीड़े (एस्केरियासिस)", "जंत संसर्ग (पोटातील किडे)", ["पोटदुखी", "भूक न लागणे", "वजन कमी होणे"], "self_care"],
  ["pinworm_enterobiasis", "Pinworm Infection", "चिनौना (पिनवर्म)", "लहान मुलांमधील चमुणे जंत", ["गुदद्वारी रात्री खाज सुटणे", "अस्वस्थ झोप"], "self_care"],
  ["tapeworm_taeniasis", "Tapeworm Infection", "फीताकृमि", "पट्टकृमी संसर्ग", ["पोटात अस्वस्थता", "शौचात पांढरे तुकडे दिसणे"], "doctor_soon"],
  ["sepsis_severe_systemic", "Sepsis (Systemic Infection)", "सेप्सिस (रक्त संक्रमण)", "रक्तातील तीव्र विषबाधा (सेप्सिस)", ["अतिशय जलद श्वास", "थंडी वाजून तीव्र ताप", "रक्तदाब अचानक कमी", "गोंधळलेली अवस्था"], "emergency"]
];

additionalInfections.forEach(([id, canonical_name, name_hi, name_mr, symptoms, urgency]) => {
  infections.push(createCondition({
    id,
    canonical_name,
    category: "infections_fever",
    names: { english: canonical_name, hindi: name_hi, marathi: name_mr },
    synonyms: {
      english: [canonical_name.toLowerCase()],
      hindi: [name_hi],
      marathi: [name_mr],
      roman_hindi: [canonical_name.toLowerCase(), id.replace(/_/g, " ")],
      roman_marathi: [canonical_name.toLowerCase(), id.replace(/_/g, " ")],
      common_indian_terms: [canonical_name.toLowerCase()]
    },
    common_symptoms: symptoms,
    general_information: [`${name_mr} हा संसर्गजन्य आजार असून योग्य तपासणी व वेळेवर औषधोपचार आवश्यक आहेत.`],
    safe_supportive_care: urgency === "emergency" ? [] : ["भरपूर पाणी व द्रवपदार्थ घ्या.", "विश्रांती घ्या.", "स्वच्छतेचे नियम पाळा."],
    things_to_avoid: ["अनावश्यक औषधे घेणे टाळा."],
    red_flags: ["तीव्र ताप न उतरणे", "अशक्तपणा", "श्वास घेण्यास त्रास"],
    urgency,
    when_to_visit_doctor: ["लक्षणे दिसल्यास शासकीय प्राथमिक आरोग्य केंद्रात (PHC) तपासणी करून घ्या."],
    appropriate_specialty: ["General Physician", "Medical Officer"],
    facility_type: ["PHC", "Rural Hospital", "District Hospital"]
  }));
});

module.exports = infections;
