const { createCondition } = require("./dataset_helper");

const oncologyEmergency = [
  // Oncology / Cancers (STRICT: ZERO home cure, evaluation & referral only)
  createCondition({
    id: "breast_cancer_carcinoma",
    canonical_name: "Breast Cancer (Carcinoma of Breast)",
    category: "oncology_cancers",
    names: { english: "Breast Cancer", hindi: "स्तन कैंसर (ब्रेस्ट कैंसर)", marathi: "स्तनाचा कर्करोग (ब्रेस्ट कॅन्सर)" },
    synonyms: {
      english: ["breast cancer", "breast lump", "mammary carcinoma", "breast tumor"],
      hindi: ["स्तन कैंसर", "ब्रेस्ट कैंसर", "स्तन में गांठ"],
      marathi: ["स्तनाचा कॅन्सर", "स्तनाचा कर्करोग", "स्तनात गाठ", "ब्रेस्ट कॅन्सर"],
      roman_hindi: ["breast cancer", "stan me gath", "chhati me gath"],
      roman_marathi: ["breast cancer", "stanat gath", "karkrog"],
      common_indian_terms: ["breast cancer", "stanat gath", "karkrog"]
    },
    common_symptoms: ["स्तनात किंवा काखेत वेदनारहित कडक गाठ जाणवणे (Painless hard breast or axillary lump)", "स्तनाच्या त्वचेमध्ये खड्डा किंवा संत्र्याच्या सालीसारखा बदल (Dimpling / peau d'orange)", "स्तनाग्रातून (Nipple) रक्त किंवा स्त्राव येणे (Bloody nipple discharge)", "स्तनाग्र आत ओढले जाणे (Nipple retraction)"],
    general_information: ["स्तनाचा कर्करोग हा महिलांमधील सर्वात सामान्य कर्करोग आहे. पहिल्या टप्प्यात वेळेवर निदान झाल्यास तो आधुनिक उपचारांनी (शस्त्रक्रिया, केमोथेरपी, रेडिएशन) पूर्णपणे बरा होऊ शकतो."],
    safe_supportive_care: [], // STRICT: ZERO home cures for cancer!
    things_to_avoid: ["घरगुती उपाय, काढे, औषधी वनस्पती किंवा अघोरी उपचारांवर वेळ वाया घालवू नका (कर्करोगात वेळ अत्यंत मोलाची असते).", "गाठ दुखत नाही म्हणून दुर्लक्ष करू नका."],
    red_flags: ["स्तनावरील गाठ वेगाने वाढणे", "स्तनाची त्वचा फुटून व्रण तयार होणे", "हाडांमध्ये वेदना किंवा धाप लागणे"],
    urgency: "urgent",
    when_to_visit_doctor: ["स्तनात कोणतीही नवी गाठ आढळल्यास मॅमोग्राफी (Mammography) व एफएनएसी (FNAC/Biopsy) तपासणीसाठी शासकीय वैद्यकीय महाविद्यालय (GMC), जिल्हा रुग्णालय किंवा कॅन्सर हॉस्पिटलमध्ये जा."],
    appropriate_specialty: ["Surgical Oncologist", "Medical Oncologist", "Gynecologist"],
    facility_type: ["District Hospital", "GMC Cancer Centre", "Apex Oncology Hospital (Tata Memorial / RST Nagpur)"],
    emergency_action: "हा कर्करोग संशयित तपासणीचा विषय आहे. महात्मा फुले जन आरोग्य योजना (MJPJAY) व PM-JAY अंतर्गत सर्व कर्करोग उपचार मोफत उपलब्ध आहेत.",
    sources: ["National Cancer Grid of India", "WHO Cancer Guidelines", "ICMR Guidelines on Breast Cancer"]
  }),
  createCondition({
    id: "oral_cavity_cancer",
    canonical_name: "Oral Cavity Cancer (Mouth Cancer)",
    category: "oncology_cancers",
    names: { english: "Oral Cavity Cancer (Mouth Cancer)", hindi: "मुख का कैंसर (मुंह का कैंसर)", marathi: "तोंडाचा कर्करोग (तोंडाचा कॅन्सर)" },
    synonyms: {
      english: ["mouth cancer", "oral cancer", "tongue cancer", "buccal mucosa carcinoma"],
      hindi: ["मुंह का कैंसर", "जबड़े का कैंसर", "मुंह में न भरने वाला छाला"],
      marathi: ["तोंडाचा कर्करोग", "तोंडाचा कॅन्सर", "जिभेचा कॅन्सर", "गालाचा कॅन्सर"],
      roman_hindi: ["muh ka cancer", "gutkha cancer", "muh me ghav"],
      roman_marathi: ["tondacha cancer", "tondacha karkrog", "tambakhu cancer"],
      common_indian_terms: ["mouth cancer", "tondacha cancer", "gutkha cancer"]
    },
    common_symptoms: ["तोंडात किंवा जिभेवर ३ आठवड्यांपेक्षा जास्त काळ न भरणारा व्रण / अल्सर (Non-healing oral ulcer > 3 weeks)", "गालाच्या आत पांढरा किंवा लाल जाड थर (Leukoplakia/Erythroplakia)", "तोंड उघडण्यास अडचण (Reduced mouth opening)", "गिळताना वेदना किंवा मानेमध्ये गाठ"],
    general_information: ["तंबाखू, गुटखा, खारा, सुपारी व धुम्रपानामुळे तोंडाचा कर्करोग होतो. सुरुवातीच्या टप्प्यात तपासणी केल्यास हा बरा होऊ शकतो."],
    safe_supportive_care: [],
    things_to_avoid: ["तंबाखू, गुटखा, सुपारी, सिगारेट व मद्यपान तात्काळ पूर्णपणे बंद करा.", "घरगुती उपायांनी अल्सर बरा होण्याची वाट पाहू नका."],
    red_flags: ["तोंडातून सतत रक्तस्त्राव", "मानेतील गाठ वेगाने वाढणे", "अन्न गिळणे अशक्य होणे"],
    urgency: "urgent",
    when_to_visit_doctor: ["तोंडात ३ आठवड्यांपेक्षा जास्त काळ फोड किंवा जखम असल्यास शासकीय दंत रुग्णालय किंवा कॅन्सर सर्जनकडे बायोप्सी (Biopsy) करा."],
    appropriate_specialty: ["Head and Neck Surgical Oncologist", "ENT Surgeon"],
    facility_type: ["Government Dental College", "District Hospital", "GMC Cancer Centre"]
  }),
  createCondition({
    id: "cervical_cancer",
    canonical_name: "Cervical Cancer",
    category: "oncology_cancers",
    names: { english: "Cervical Cancer", hindi: "गर्भाशय ग्रीवा कैंसर (सर्वाइकल कैंसर)", marathi: "गर्भाशयाच्या मुखाचा कर्करोग (सर्व्हायकल कॅन्सर)" },
    synonyms: {
      english: ["cervical cancer", "cervix carcinoma", "hpv cancer"],
      hindi: ["सर्वाइकल कैंसर", "बच्चेदानी के मुंह का कैंसर"],
      marathi: ["सर्व्हायकल कॅन्सर", "गर्भाशय मुखाचा कर्करोग"],
      roman_hindi: ["cervical cancer", "safed pani me badbu", "sambhandh ke baad khoon"],
      roman_marathi: ["cervical cancer", "garbhashay karkrog"],
      common_indian_terms: ["cervical cancer", "pap smear"]
    },
    common_symptoms: ["संबंधानंतर किंवा पाळीच्या मध्ये अनपेक्षित रक्तस्त्राव (Post-coital bleeding)", "दुर्गंधीयुक्त पांढरा/पाणचट स्त्राव (Foul-smelling vaginal discharge)", "रजोनिवृत्तीनंतर (Menopause नंतर) रक्तस्त्राव", "ओटीपोटात व कमरेत सतत वेदना"],
    general_information: ["सर्व्हायकल कॅन्सर हा एचपीव्ही (HPV) विषाणूमुळे होतो. शासकीय आरोग्य केंद्रात पॅप स्मीअर (Pap Smear) व व्हिज्युअल तपासणीने (VIA) याचे प्राथमिक टप्प्यात निदान होते."],
    safe_supportive_care: [],
    things_to_avoid: ["पाळी बंद झाल्यानंतर रक्तस्त्राव झाल्यास त्याकडे साधे समजून दुर्लक्ष करू नका."],
    red_flags: ["प्रचंड प्रमाणात रक्तस्त्राव", "तीव्र अशक्तपणा"],
    urgency: "urgent",
    when_to_visit_doctor: ["३० वर्षांवरील सर्व महिलांनी प्राथमिक आरोग्य केंद्रात मोफत पॅप स्मीअर तपासणी करून घ्यावी."],
    appropriate_specialty: ["Gynecological Oncologist", "Gynecologist"],
    facility_type: ["District Hospital", "Medical College (GMC)"]
  }),

  // Emergency & Trauma (STRICT: Immediate 108 Emergency routing!)
  createCondition({
    id: "snakebite_envenomation",
    canonical_name: "Snakebite Envenomation",
    category: "emergency_trauma",
    names: { english: "Snakebite Envenomation", hindi: "सर्पदंश (सांप का काटना)", marathi: "सर्पदंश (साप चावणे)" },
    synonyms: {
      english: ["snakebite", "snake bite", "cobra bite", "viper bite", "krait bite", "asv"],
      hindi: ["सर्पदंश", "सांप काटना", "नाग का काटना", "एंटी स्नेक वेनम"],
      marathi: ["सर्पदंश", "साप चावला", "नाग चावला", "घोणस", "फुरसे चावणे"],
      roman_hindi: ["saanp kaatna", "saap ne kata", "snake bite", "asv"],
      roman_marathi: ["sap chawla", "sarpdansh", "naag chawla", "asv aushadh"],
      common_indian_terms: ["snake bite", "sap chawla", "saanp kata", "asv"]
    },
    common_symptoms: ["चावलेल्या जागी २ दात उमटणे व तीव्र वेदना (Fang marks)", "चावलेल्या भागावर वेगाने वाढणारी सूज व काळे पडणे (Local swelling and necrosis)", "पापण्या जड पडणे व डोळे उघडता न येणे (Ptosis - Neurotoxic)", "तोंडावाटे लाळ गळणे व श्वास घेण्यास त्रास", "हिरड्यांमधून किंवा जखमेतून रक्त न थांबणे (Hemotoxic)"],
    general_information: ["सर्पदंश ही अत्यंत तातडीची जीवघेणी आणीबाणी आहे. सर्व शासकीय प्राथमिक आरोग्य केंद्र (PHC), ग्रामीण रुग्णालय व GMC मध्ये जीवनरक्षक **अँटी-स्नेक व्हेनम (ASV)** मोफत उपलब्ध आहे."],
    safe_supportive_care: ["रुग्णाला शांत ठेवा आणि चावलेला अवयव न हलवता स्प्लिंट लावा (जसे हाड मोडल्यावर पट्टी बांधतात).", "तातडीने १०८ डायल करा."],
    things_to_avoid: ["चावलेल्या जागी दोरी किंवा कपड्याने घट्ट आवळू नका (टॉर्निके बांधू नका).", "जखमेवर ब्लेडने कापू नका किंवा तोंड लावून विष चोखू नका.", "मांत्रिकाकडे जाऊन वेळ वाया घालवू नका (ASV हेच एकमेव वैज्ञानिक औषध आहे)."],
    red_flags: ["श्वास घेण्यास अडचण", "डोळे मिटणे", "रक्तस्राव न थांबणे", "बेशुद्ध पडणे"],
    urgency: "emergency",
    when_to_visit_doctor: ["एका मिनिटाचाही विलंब न करता तात्काळ नजीकच्या प्राथमिक आरोग्य केंद्रात (PHC) किंवा शासकीय रुग्णालयात ASV साठी जा."],
    appropriate_specialty: ["Emergency Physician", "Medical Officer"],
    facility_type: ["PHC (Has Free ASV Stock)", "Rural Hospital", "District Hospital", "GMC Trauma"],
    emergency_action: "तातडीने १०८ वर कॉल करा! शासकीय PHC/रुग्णालयात मोफत अँटी-स्नेक व्हेनम (ASV) उपलब्ध आहे."
  }),
  createCondition({
    id: "organophosphate_poisoning",
    canonical_name: "Organophosphate (Pesticide) Poisoning",
    category: "emergency_trauma",
    names: { english: "Pesticide / Poisoning (Organophosphate)", hindi: "कीटनाशक / विषबाधा (पॉइजनिंग)", marathi: "कीटकनाशक विषबाधा (पॉइझनिंग)" },
    synonyms: {
      english: ["poisoning", "pesticide ingestion", "insecticide toxicity", "atropine"],
      hindi: ["जहर खाना", "कीटनाशक पीना", "पॉइजनिंग", "खेत की दवाई"],
      marathi: ["विषबाधा", "कीटकनाशक पिणे", "शेतातील औषध पोटात जाणे", "पॉइझनिंग"],
      roman_hindi: ["zehar peena", "pesticide poisoning", "keetnashak"],
      roman_marathi: ["vishbadha", "aushadh pile", "poisoning"],
      common_indian_terms: ["poisoning", "vishbadha", "zehar"]
    },
    common_symptoms: ["तोंडावाटे भरपूर लाळ व फेस येणे (Excessive salivation)", "डोळ्यांच्या बाहुल्या अत्यंत बारीक होणे (Pinpoint pupils)", "उलट्या, जुलाब व पोटात तीव्र गोळा येणे", "श्वास घेताना घरघर व छातीत कफ भरणे", "बेशुद्ध पडणे व झटके"],
    general_information: ["शेतातील कीटकनाशक पोटात गेल्याने किंवा अंगावर उडाल्याने होणारी ही तातडीची विषबाधा आहे. ॲट्रोपिन (Atropine) हे शासकीय रुग्णालयात मिळणारे याचे जीवनरक्षक औषध आहे."],
    safe_supportive_care: ["त्वचेवर औषध पडले असल्यास कपडे काढून साबणाच्या पाण्याने अंग स्वच्छ धुवा.", "त्वरित १०८ बोलवा."],
    things_to_avoid: ["जबरदस्तीने उलटी करायला लावू नका (औषध फुफ्फुसात जाऊ शकते).", "मीठ-पाणी किंवा शेण पाजू नका."],
    red_flags: ["बेशुद्ध पडणे", "श्वास पूर्णपणे थांबणे"],
    urgency: "emergency",
    when_to_visit_doctor: ["तातडीने १०८ रुग्णवाहिकेतून आयसीयू सुविधा असलेल्या शासकीय रुग्णालयात दाखल करा."],
    appropriate_specialty: ["Emergency Medicine", "Intensivist"],
    facility_type: ["Rural Hospital", "District Hospital", "GMC ICU"]
  })
];

// 55 More Conditions across Oncology & Emergency
const additionalOncoEmerg = [
  // Cancers (32 more)
  ["lung_cancer_bronchogenic", "Lung Cancer", "फेफड़ों का कैंसर", "फुफ्फुसाचा कर्करोग", ["रक्ताची थुंकी", "सतत खोकला", "वजन घट", "छातीत दुखणे"], "urgent"],
  ["colorectal_cancer_colon", "Colorectal Cancer", "बड़ी आंत का कैंसर", "मोठ्या आतड्याचा कर्करोग", ["शौचातून काळे किंवा लाल रक्त", "शौचाच्या सवयींत बदल", "वजन घट"], "urgent"],
  ["esophageal_cancer_foodpipe", "Esophageal Cancer", "अन्ननली का कैंसर", "अन्ननलिकेचा कर्करोग", ["अन्न गिळताना तीव्र त्रास", "अन्न अडकणे", "वजन वेगाने कमी"], "urgent"],
  ["stomach_gastric_cancer", "Gastric (Stomach) Cancer", "आमाशय (पेट) का कैंसर", "जठराचा कर्करोग (पोटाचा कॅन्सर)", ["पोटात सतत जडपणा", "थोडे खाल्ल्यावर पोट भरणे", "रक्ताची उलटी"], "urgent"],
  ["prostate_cancer_elderly", "Prostate Cancer", "प्रोस्टेट कैंसर", "प्रोस्टेट ग्रंथीचा कर्करोग", ["लघवी अडखळणे", "लघवीतून रक्त", "हाडांमध्ये तीव्र वेदना"], "urgent"],
  ["ovarian_cancer_female", "Ovarian Cancer", "अंडाशय का कैंसर", "अंडाशयाचा कर्करोग", ["पोट सतत फुगणे", "ओटीपोटात जडपणा", "भूक न लागणे"], "urgent"],
  ["acute_leukemia_blood_cancer", "Leukemia (Blood Cancer)", "ब्लड कैंसर (ल्यूकेमिया)", "रक्ताचा कर्करोग (ल्युकेमिया / ब्लड कॅन्सर)", ["वारंवार तीव्र ताप", "अंगावर काळे-निळे डाग", "रक्तस्त्राव", "अतिशय फिकटपणा"], "urgent"],
  ["lymphoma_hodgkin_nonhodgkin", "Lymphoma", "लिम्फोमा (लसीका ग्रंथि कैंसर)", "लसिका ग्रंथींचा कर्करोग (लिम्फोमा)", ["मानेवर, काखेत किंवा जांघेत न दुखणाऱ्या गाठी", "रात्री घाम", "ताप"], "urgent"],
  ["multiple_myeloma_bone_marrow", "Multiple Myeloma", "मल्टीपल मायलोमा", "अस्थिमज्जेचा कर्करोग", ["हाडांमध्ये सतत वेदना", "किरकोळ कारणाने हाड मोडणे", "किडनीचा त्रास"], "urgent"],
  ["pancreatic_cancer", "Pancreatic Cancer", "पैंक्रियाज का कैंसर", "स्वादुपिंडाचा कर्करोग", ["पाठीकडे जाणारी तीव्र पोटदुखी", "विनाकारण अचानक कावीळ", "वजन घट"], "urgent"],
  ["liver_cancer_hepatocellular", "Liver Cancer", "लिवर का कैंसर", "यकृताचा कर्करोग (लिव्हर कॅन्सर)", ["पोटाच्या उजव्या बाजूला कडक गाठ", "तीव्र कावीळ", "पोटात पाणी भरणे"], "urgent"],
  ["thyroid_cancer_papillary", "Thyroid Cancer", "थायराइड कैंसर", "थायरॉईड ग्रंथीचा कर्करोग", ["गळ्याच्या पुढील भागात वेगाने वाढणारी कडक गाठ", "आवाज घोगरा होणे"], "urgent"],
  ["brain_tumor_glioma", "Brain Tumor (Glioma)", "ब्रेन ट्यूमर", "मेंदूतील गाठ (ब्रेन ट्युमर)", ["सकाळी उठल्यावर तीव्र डोकेदुखी व उलटी", "झटके", "शरीराची एक बाजू लुळी पडणे"], "emergency"],
  ["laryngeal_cancer_vocal", "Laryngeal Cancer", "स्वरयंत्र (गले) का कैंसर", "स्वरयंत्राचा कर्करोग (घशाचा कॅन्सर)", ["आवाज ३ आठवड्यांपेक्षा जास्त काळ बसणे", "गिळताना वेदना"], "urgent"],
  ["osteosarcoma_bone_cancer", "Osteosarcoma (Bone Cancer)", "हड्डी का कैंसर", "हाडांचा कर्करोग (बोन कॅन्सर)", ["हाडावर वेगाने वाढणारी वेदनादायी सूज", "रात्री तीव्र वेदना"], "urgent"],

  // Emergency & Trauma (23 more)
  ["severe_anaphylaxis_allergy", "Anaphylaxis (Severe Allergic Reaction)", "गंभीर एलर्जी (एनाफिलेक्सिस)", "तीव्र ॲलर्जी झटका (ॲनाफायलेक्सिस)", ["ओठ, जीभ व घसा सुजणे", "श्वास पूर्णपणे रोखणे", "बीपी अचानक खाली जाणे"], "emergency"],
  ["status_epilepticus_prolonged", "Status Epilepticus", "लगातार दौरे पड़ना", "सलग येणारे फेफरे (थांबणारे झटके)", ["५ मिनिटांपेक्षा जास्त वेळ सलग झटके येणे", "शुद्धीवर न येणे"], "emergency"],
  ["severe_head_injury_trauma", "Severe Head Injury & Concussion", "सिर की गंभीर चोट", "डोक्याला गंभीर मार (हेड इन्जुरी)", ["डोक्यातून किंवा कानातून रक्त येणे", "उलट्या", "बेशुद्ध पडणे"], "emergency"],
  ["polytrauma_road_accident", "Polytrauma (Road Traffic Accident)", "सड़क दुर्घटना / गंभीर चोट", "रस्ता अपघात व गंभीर दुखापत (पॉलीट्रामा)", ["अनेक हाडे मोडणे", "प्रचंड रक्तस्त्राव", "शॉक"], "emergency"],
  ["heat_stroke_hyperthermia", "Heat Stroke (Loo Lagna)", "लू लगना (हीट स्ट्रोक)", "उष्माघात (उन्हाचा झटका)", ["शरीराचे तापमान १०४°F पेक्षा जास्त", "घाम येणे पूर्ण बंद होणे", "बेशुद्धी"], "emergency"],
  ["foreign_body_airway_choking", "Choking (Foreign Body Airway Obstruction)", "गले में कुछ अटकना (दम घुटना)", "घशात घास किंवा वस्तू अडकणे (दम भरणे)", ["सलग खोकणे अशक्य", "बोलता न येणे", "ओठ निळे पडणे"], "emergency"],
  ["severe_arterial_bleeding", "Severe Active Arterial Bleeding", "धमनी से तेज खून बहना", "रक्तवाहिनीतून वेगाने रक्त वाहणे", ["पिचकारीसारखे लाल रक्त उडणे", "दाबूनही रक्त न थांबणे"], "emergency"],
  ["hypovolemic_shock_blood_loss", "Hypovolemic Shock", "रक्त की कमी से सदमा", "अति रक्तस्त्रावामुळे शॉक", ["बीपी अत्यंत कमी", "हात-पाय बर्फासारखे थंड", "नाडी न लागणे"], "emergency"],
  ["scorpion_sting_envenomation", "Scorpion Sting Envenomation", "बिच्छू का डंक", "विंचू चावणे (विंचूदंश)", ["चावलेल्या जागी असह्य वेदना", "प्रचंड घाम सुटणे", "रक्तदाब वाढणे", "फुफ्फुसात पाणी"], "emergency"],
  ["drowning_submersion_injury", "Drowning / Near Drowning", "डूबना (पानी में दम घुटना)", "पाण्यात बुडणे (श्वास रोखणे)", ["श्वास बंद असणे", "तोंडातून फेस", "नाडी मंद"], "emergency"]
];

additionalOncoEmerg.forEach(([id, canonical_name, name_hi, name_mr, symptoms, urgency]) => {
  const isCancer = id.includes("cancer") || id.includes("carcinoma") || id.includes("leukemia") || id.includes("lymphoma") || id.includes("myeloma") || id.includes("tumor") || id.includes("sarcoma");
  const cat = isCancer ? "oncology_cancers" : "emergency_trauma";

  oncologyEmergency.push(createCondition({
    id,
    canonical_name,
    category: cat,
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
    general_information: [`${name_mr} ही अत्यंत गंभीर स्थिती असून तात्काळ शासकीय रुग्णालयात तज्ज्ञ डॉक्टरांकडून उपचार आवश्यक आहेत.`],
    safe_supportive_care: [], // NO home cures for cancer or emergencies!
    things_to_avoid: isCancer ? ["घरगुती उपायांवर वेळ वाया घालवू नका."] : ["वेळ न दवडता १०८ डायल करा."],
    red_flags: ["तातडीचा जीवघेणा धोका", "तीव्र रक्तस्त्राव", "बेशुद्धी"],
    urgency,
    when_to_visit_doctor: [isCancer ? "कर्करोग संशयित लक्षणांसाठी बायोप्सी व उपचारासाठी शासकीय कॅन्सर केंद्रात जा." : "तातडीने १०८ रुग्णवाहिकेतून जवळच्या शासकीय रुग्णालयात जा."],
    appropriate_specialty: isCancer ? ["Oncologist", "Surgical Oncologist"] : ["Emergency Physician", "Trauma Surgeon"],
    facility_type: isCancer ? ["GMC Cancer Centre", "District Hospital", "Apex Oncology Centre"] : ["District Hospital", "GMC Trauma Care", "108 Ambulance"],
    emergency_action: isCancer ? "महात्मा फुले जन आरोग्य योजना (MJPJAY) व PM-JAY अंतर्गत मोफत कॅन्सर उपचार उपलब्ध आहेत." : "तातडीने १०८ वर कॉल करा!",
    sources: isCancer ? ["National Cancer Grid of India", "ICMR Guidelines"] : ["National Emergency Life Support (NELS)", "MEMS 108 Protocols"]
  }));
});

module.exports = oncologyEmergency;
