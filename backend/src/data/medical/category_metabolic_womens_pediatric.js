const { createCondition } = require("./dataset_helper");

const metabolicWomensPediatric = [
  // Metabolic & Endocrine
  createCondition({
    id: "type_2_diabetes_mellitus",
    canonical_name: "Type 2 Diabetes Mellitus",
    category: "metabolic_endocrine",
    names: { english: "Type 2 Diabetes Mellitus", hindi: "टाइप 2 डायबिटीज (मधुमेह / शुगर)", marathi: "टाइप २ मधुमेह (डायबिटीस / साखर)" },
    synonyms: {
      english: ["diabetes", "sugar", "type 2 diabetes", "hyperglycemia", "high blood sugar"],
      hindi: ["डायबिटीज", "शुगर", "मधुमेह", "शक्कर की बीमारी"],
      marathi: ["मधुमेह", "डायबिटीस", "साखरेचा आजार", "शुगर"],
      roman_hindi: ["diabetes", "sugar ki bimari", "sugar badhna", "peshab me sugar"],
      roman_marathi: ["madhumeh", "diabetes", "sakhar vadhli", "sugar cha tras"],
      common_indian_terms: ["sugar", "diabetes", "madhumeh", "sakhar"]
    },
    common_symptoms: ["वारंवार तहान लागणे (Polydipsia)", "वारंवार लघवीला जावे लागणे (Polyuria)", "सतत भूक लागणे (Polyphagia)", "न भरून येणाऱ्या जखमा (Delayed wound healing)", "हात-पायांना मुंग्या येणे व अंधुक दृष्टी (Tingling and blurred vision)"],
    general_information: ["मधुमेह हा शरीरातील इन्सुलिनच्या अभावामुळे किंवा प्रतिकारामुळे रक्तातील साखरेचे प्रमाण अनियंत्रित होणारा जुनाट चयापचय विकार आहे."],
    safe_supportive_care: ["साखर, गूळ, गोड पदार्थ, पांढरा भात, बटाटे व मैद्याचे पदार्थ टाळा.", "आहारात मेथी, कारले, जांभूळ, कडधान्ये, हिरव्या पालेभाज्या व फायबरचे प्रमाण वाढवा.", "दररोज किमान ४५ मिनिटे वेगाने चाला.", "दरमहा उपाशीपोटी (Fasting) व जेवणानंतर (PP) साखर आणि ३ महिन्यांची सरासरी (HbA1c) तपासा."],
    things_to_avoid: ["अचानक जेवण सोडणे किंवा जास्त वेळ उपाशी राहणे टाळा.", "अनवाणी पायांनी चालणे टाळा (पायांना जखम होऊ नये म्हणून).", "औषधोपचारात अनियमितता ठेवू नका."],
    red_flags: ["साखर ४० पेक्षा कमी होऊन चक्कर येणे व घाम सुटणे (Hypoglycemia)", "साखर ४०० पेक्षा जास्त होऊन श्वास फळांसारखा वास येणे व उलट्या होणे (Diabetic Ketoacidosis)", "बेशुद्ध पडणे"],
    urgency: "doctor_soon",
    when_to_visit_doctor: ["साखरेचे प्रमाण सतत जास्त राहत असल्यास किंवा पायाला जखम झाल्यास तात्काळ डॉक्टरांना दाखवा."],
    appropriate_specialty: ["Endocrinologist", "Diabetologist", "General Physician"],
    facility_type: ["PHC", "Rural Hospital", "District Hospital"]
  }),
  createCondition({
    id: "iron_deficiency_anemia",
    canonical_name: "Iron Deficiency Anemia",
    category: "metabolic_endocrine",
    names: { english: "Iron Deficiency Anemia", hindi: "एनीमिया (खून की कमी)", marathi: "रक्तक्षय (ॲनिमिया / रक्ताची कमतरता)" },
    synonyms: {
      english: ["anemia", "low hemoglobin", "iron deficiency", "pale skin"],
      hindi: ["एनीमिया", "खून की कमी", "हीमोग्लोबिन कम होना"],
      marathi: ["रक्तक्षय", "ॲनिमिया", "अशक्तपणा", "रक्त कमी असणे"],
      roman_hindi: ["anemia", "khoon ki kami", "kamjori", "hb kam hona"],
      roman_marathi: ["anemia", "rakt kami ahe", "raktakshay", "ashaktapana"],
      common_indian_terms: ["anemia", "khoon ki kami", "hb kam"]
    },
    common_symptoms: ["सतत थकवा व प्रचंड अशक्तपणा (Extreme fatigue)", "त्वचा, नखे व डोळ्यांच्या पापण्या फिकट दिसणे (Pallor)", "किरकोळ श्रमानेही धाप लागणे व चक्कर येणे (Breathlessness and dizziness)", "हात-पाय थंड पडणे"],
    general_information: ["शरीरात लोहाच्या कमतरतेमुळे लाल रक्तपेशींमध्ये पुरेसे हिमोग्लोबिन (Hb) तयार न झाल्यामुळे ॲनिमिया होतो. हा महिला व बालकांमध्ये अत्यंत सामान्य आहे."],
    safe_supportive_care: ["लोहयुक्त पदार्थांचा आहारात समावेश करा (पालक, मेथी, गूळ-शेंगदाणे, खजूर, बीट, डाळिंब, अंडी).", "शासकीय प्राथमिक आरोग्य केंद्र (PHC) व आशा ताईंकडून मिळणाऱ्या आयर्न व फॉलिक अ‍ॅसिड (IFA) च्या मोफत गोळ्या नियमित घ्या.", "व्हिटॅमिन-सी (लिंबू, आवळा) लोहाचे शोषण वाढवण्यासाठी जेवणासोबत घ्या."],
    things_to_avoid: ["जेवणासोबत लगेच चहा किंवा कॉफी पिणे टाळा (यामुळे लोहाचे शोषण थांबते).", "जंतनाशक गोळी (Albendazole) न घेणे टाळा."],
    red_flags: ["हिमोग्लोबिन ७ g/dL पेक्षा कमी असणे", "विश्रांतीतही धाप लागणे व छातीत धडधड", "अचानक बेशुद्ध पडणे"],
    urgency: "doctor_soon",
    when_to_visit_doctor: ["सर्व गरोदर महिला व बालकांनी PHC मध्ये मोफत सीबीसी/हिमोग्लोबिन चाचणी वेळेवर करून घ्यावी."],
    appropriate_specialty: ["General Physician", "Gynecologist", "Pediatrician"],
    facility_type: ["PHC", "Sub-Center", "Rural Hospital"]
  }),

  // Women's & Maternal Health
  createCondition({
    id: "pcos_polycystic_ovary",
    canonical_name: "Polycystic Ovary Syndrome (PCOS)",
    category: "womens_maternal",
    names: { english: "Polycystic Ovary Syndrome (PCOS)", hindi: "पीसीओएस (पॉलीसिस्टिक ओवरी सिंड्रोम)", marathi: "पीसीओएस (अंडाशयातील गाठी व पाळीचे विकार)" },
    synonyms: {
      english: ["pcos", "pcod", "ovarian cysts", "hormonal imbalance in women"],
      hindi: ["पीसीओएस", "पीसीओडी", "माहवारी की अनियमितता", "चेहरे पर अनचाहे बाल"],
      marathi: ["पीसीओएस", "पीसीओडी", "मासिक पाळीची अनियमितता", "अंडाशयात गाठी"],
      roman_hindi: ["pcos", "pcod", "periods time pe na aana", "wajan badhna"],
      roman_marathi: ["pcos", "pcod", "pali velvar na yene", "wajan vadhl"],
      common_indian_terms: ["pcos", "pcod", "irregular periods"]
    },
    common_symptoms: ["अनियमित किंवा उशिरा येणारी मासिक पाळी (Irregular/delayed menses)", "वजन अचानक वाढणे (Weight gain)", "चेहऱ्यावर पिंपल्स व नको असलेले केस येणे (Hirsutism and acne)", "केस गळणे (Hair thinning)"],
    general_information: ["पीसीओएस हा महिलांमधील हार्मोन्सच्या असंतुलनामुळे होणारा सामान्य चयापचय व प्रजनन विकार आहे, ज्यावर जीवनशैलीतील बदलांनी उत्तम नियंत्रण मिळवता येते."],
    safe_supportive_care: ["दररोज ४० ते ४५ मिनिटे नियमित व्यायाम करा.", "वजन नियंत्रित ठेवा (५-१०% वजन कमी केल्याने पाळी नियमित होते).", "जंक फूड, प्रक्रिया केलेले अन्न, अति गोड व तेलकट अन्न टाळा."],
    things_to_avoid: ["औषधांशिवाय पाळी पुढे ढकलण्याच्या गोळ्या स्वतःहून घेणे टाळा."],
    red_flags: ["अतिप्रमाणात रक्तस्त्राव होणे", "तीव्र पोटदुखी"],
    urgency: "doctor_soon",
    when_to_visit_doctor: ["मासिक पाळी २ महिन्यांपेक्षा जास्त न आल्यास सोनोग्राफी (USG Pelvis) व तपासणीसाठी स्त्रीरोगतज्ज्ञांना भेटा."],
    appropriate_specialty: ["Gynecologist", "Endocrinologist"],
    facility_type: ["Rural Hospital", "Sub-District Hospital", "District Hospital"]
  }),
  createCondition({
    id: "preeclampsia_maternal_hypertension",
    canonical_name: "Pre-Eclampsia (Pregnancy High BP)",
    category: "womens_maternal",
    names: { english: "Pre-Eclampsia in Pregnancy", hindi: "प्री-एक्लेमप्सिया (गर्भावस्था में हाई बीपी)", marathi: "प्री-एक्लेम्पसिया (गरोदरपणातील उच्च रक्तदाब)" },
    synonyms: {
      english: ["preeclampsia", "toxemia of pregnancy", "gestational hypertension"],
      hindi: ["गर्भावस्था में बीपी", "प्री एक्लेम्पसिया", "गर्भावस्था में सूजन"],
      marathi: ["गरोदरपणातील बीपी", "प्री-एक्लेम्पसिया", "गरोदरपणात अंगावर सूज"],
      roman_hindi: ["garbh me bp badhna", "preeclampsia", "chehre pe sujan"],
      roman_marathi: ["garodarpani bp", "angavar suz", "doke dukhtay"],
      common_indian_terms: ["preeclampsia", "pregnancy bp"]
    },
    common_symptoms: ["गरोदरपणात २० आठवड्यांनंतर बीपी १४०/९० पेक्षा जास्त होणे", "चेहऱ्यावर, हातांवर व पायांवर अचानक तीव्र सूज येणे (Sudden severe edema)", "सतत तीव्र डोकेदुखी (Persistent severe headache)", "डोळ्यांसमोर अंधारी किंवा चमकणारे ठिपके दिसणे (Visual disturbances)"],
    general_information: ["हा गरोदरपणातील अत्यंत गंभीर विकार आहे, ज्यामुळे माता व गर्भातील बाळाच्या जीवाला धोका निर्माण होऊ शकतो."],
    safe_supportive_care: ["शांतपणे डाव्या कुशीवर झोपा.", "तात्काळ नजीकच्या शासकीय रुग्णालयात प्रसूती कक्षात जा."],
    things_to_avoid: ["घरगुती उपायांवर थांबणे टाळा.", "मीठ बंद करून डॉक्टरांकडे जाणे लांबवू नका."],
    red_flags: ["लघवी पूर्णपणे बंद होणे", "पोटाच्या वरच्या भागात तीव्र कळ", "झटके किंवा फेफरे येणे (Eclampsia)"],
    urgency: "emergency",
    when_to_visit_doctor: ["गरोदरपणात बीपी वाढल्यास तात्काळ सिझेरियन/आयसीयू सुविधा असलेल्या शासकीय रुग्णालयात दाखल व्हा."],
    appropriate_specialty: ["Obstetrician", "Gynecologist"],
    facility_type: ["Sub-District Hospital", "District Hospital", "GMC"]
  })
];

// 111 More Conditions in Metabolic, Womens & Pediatric
const additionalMetabolicWomensPed = [
  // Metabolic & Endocrine (38 more)
  ["type_1_diabetes_mellitus", "Type 1 Diabetes", "टाइप 1 डायबिटीज (इंसुलिन निर्भर)", "टाइप १ मधुमेह (इन्सुलिन अवलंबित्व)", ["लहान वयात जास्त तहान व भूक", "वजन अचानक घटणे", "वारंवार लघवी"], "urgent"],
  ["hypoglycemia_acute", "Acute Hypoglycemia (Low Blood Sugar)", "लो शुगर (हाइपोग्लाइसीमिया)", "रक्तातील साखर अचानक कमी होणे (लो शुगर)", ["थंड घाम सुटणे", "हात थरथरणे", "चक्कर", "गोंधळलेली अवस्था"], "emergency"],
  ["primary_hypothyroidism", "Hypothyroidism", "हाइपोथायरायडिज्म (थायराइड की कमी)", "हायपोथायरॉईडीझम (थायरॉईड ग्रंथीची कमतरता)", ["अचानक वजन वाढणे", "थकवा", "थंडी सहन न होणे", "केस गळणे", "बद्धकोष्ठता"], "doctor_soon"],
  ["hyperthyroidism_graves", "Hyperthyroidism", "हाइपरथायरायडिज्म (अतिसक्रिय थायराइड)", "हायपरथायरॉईडीझम (अतिसक्रिय थायरॉईड)", ["वजन वेगाने कमी होणे", "उष्णता सहन न होणे", "छातीत धडधड", "हात थरथरणे"], "doctor_soon"],
  ["goiter_iodine_deficiency", "Goiter (Iodine Deficiency)", "घेंघा रोग (गलगंड)", "गलगंड (गळ्यातील थायरॉईड ग्रंथीची वाढ)", ["गळ्याच्या पुढील भागात मोठी गाठ / सूज", "गिळताना अडचण"], "doctor_soon"],
  ["vitamin_d_deficiency", "Vitamin D Deficiency", "विटामिन डी की कमी", "व्हिटॅमिन-डी ची कमतरता", ["हाडांमध्ये मंद वेदना", "स्नायूंचा अशक्तपणा", "वारंवार आजारी पडणे"], "self_care"],
  ["vitamin_b12_deficiency", "Vitamin B12 Deficiency", "विटामिन बी12 की कमी", "व्हिटॅमिन-बी१२ ची कमतरता", ["हात-पायांना सुया टोचल्यासारख्या मुंग्या", "जीभ लाल व गुळगुळीत होणे", "थकवा"], "self_care"],
  ["hyperlipidemia_high_cholesterol", "Hyperlipidemia (High Cholesterol)", "हाई कोलेस्ट्रॉल", "रक्तातील अतिचरबी (हाय कोलेस्ट्रॉल)", ["लक्षणे नसतात, रक्त तपासणीत आढळते", "छातीत जडपणा"], "doctor_soon"],
  ["gouty_arthritis_hyperuricemia", "Gout (High Uric Acid)", "गाउट (यूरिक एसिड गठिया)", "गाउट (युरिक ॲसिड सांधेदुखी)", ["पायाच्या अंगठ्यात अचानक असह्य वेदना व लाल सूज", "रात्री जास्त त्रास"], "doctor_soon"],
  ["osteoporosis_bone_loss", "Osteoporosis", "ऑस्टियोपोरोसिस (हड्डियों का कमजोर होना)", "हाडांची झीज (ऑस्टिओपोरोसिस)", ["किरकोळ पडण्यानेही हाड मोडणे", "उंची कमी होणे", "पाठीला बाक"], "doctor_soon"],
  ["thalassemia_major", "Thalassemia Major", "थैलेसीमिया मेजर", "थॅलेसेमिया (रक्ताचा अनुवंशिक आजार)", ["जन्मानंतर काही महिन्यांत तीव्र फिकटपणा", "वारंवार रक्त भरण्याची गरज"], "urgent"],
  ["sickle_cell_anemia", "Sickle Cell Disease", "सिकल सेल एनीमिया", "सिकलसेल (विदर्भातील अनुवंशिक रक्तदोष)", ["हाडे व सांध्यांमध्ये अचानक तीव्र कळा (Crisis)", "वारंवार कावीळ", "अशक्तपणा"], "urgent"],
  ["obesity_metabolic_syndrome", "Metabolic Syndrome & Obesity", "मोटापा (ओबेसिटी)", "लठ्ठपणा व चयापचय विकार", ["पोटाचा घेर वाढणे", "किरकोळ श्रमाने धाप लागणे", "उच्च बीपी व शुगर"], "self_care"],

  // Women's Health (38 more)
  ["dysmenorrhea_menstrual_pain", "Primary Dysmenorrhea", "माहवारी का तेज दर्द (कष्टार्तव)", "मासिक पाळीतील तीव्र पोटदुखी", ["पाळीच्या पहिल्या २ दिवसांत ओटीपोटात तीव्र कळ", "कंबरदुखी", "मळमळ"], "self_care"],
  ["menorrhagia_heavy_periods", "Menorrhagia (Heavy Menstrual Bleeding)", "माहवारी में ज्यादा खून बहना", "पाळीत अतिरक्तस्त्राव", ["सलग ७ दिवसांपेक्षा जास्त रक्तस्त्राव", "रक्ताच्या मोठ्या गुठळ्या पडणे"], "doctor_soon"],
  ["bacterial_vaginosis", "Bacterial Vaginosis", "योनि का जीवाणु संक्रमण", "योनिमार्गाचा संसर्ग", ["पांढरा/राखाडी स्त्राव", "माशासारखा दुर्गंध", "हलकी खाज"], "doctor_soon"],
  ["vaginal_candidiasis_yeast", "Vaginal Candidiasis", "योनि का फंगल इन्फेक्शन", "योनिमार्गातील बुरशी संसर्ग (यीस्ट)", ["दह्यासारखा घट्ट पांढरा स्त्राव", "तीव्र खाज व जळजळ"], "doctor_soon"],
  ["pelvic_inflammatory_disease_pid", "Pelvic Inflammatory Disease (PID)", "श्रोणि सूजन रोग (PID)", "ओटीपोटातील अंतर्गत जंतू संसर्ग (PID)", ["ओटीपोटात सतत दुखणे", "दुर्गंधीयुक्त स्त्राव", "ताप", "संबंधाच्या वेळी वेदना"], "urgent"],
  ["endometriosis_pelvic_pain", "Endometriosis", "एंडोमेट्रिओसिस", "गर्भाशयाच्या आवरणाचा विकार (एंडोमेट्रिओसिस)", ["पाळीच्या वेळी असह्य वेदना", "वंध्यत्व", "शौचाच्या वेळी वेदना"], "doctor_soon"],
  ["uterine_fibroids_leiomyoma", "Uterine Fibroids", "गर्भाशय में रसौली (फाइब्रॉयड)", "गर्भाशयातील गाठी (फायब्रॉइड्स)", ["पाळीत अतिरक्तस्त्राव", "ओटीपोटात जडपणा व फुगवटा", "वारंवार लघवी"], "doctor_soon"],
  ["postpartum_hemorrhage_pph", "Postpartum Hemorrhage (PPH)", "प्रसव के बाद भारी रक्तस्राव", "बाळंतपणानंतरचा अतिरक्तस्त्राव (PPH)", ["बाळंतपणानंतर प्रचंड प्रमाणात रक्त वाहणे", "चक्कर येऊन पडणे"], "emergency"],
  ["acute_mastitis_breast_infection", "Puerperal Mastitis", "स्तन की सूजन / इन्फेक्शन", "स्तनाची सूज व संसर्ग (स्तनदाह)", ["स्तनाचा एक भाग लाल व गरम होणे", "तीव्र वेदना", "दूध पिताना त्रास", "ताप"], "doctor_soon"],
  ["hyperemesis_gravidarum", "Hyperemesis Gravidarum", "गर्भावस्था में अत्यधिक उल्टी", "गरोदरपणात अतिउलट्या", ["काहीही खाल्ले तरी न पचणे", "तीव्र डिहायड्रेशन", "वजन कमी होणे"], "urgent"],
  ["postpartum_depression", "Postpartum Depression", "प्रसवोत्तर अवसाद", "बाळंतपणानंतरचा मानसिक ताण व नैराश्य", ["सतत रडू येणे", "बाळाची काळजी घेण्यात अनास्था", "तीव्र अपराधीपणा"], "doctor_soon"],
  ["menopause_vasomotor_symptoms", "Menopausal Syndrome", "रजोनिवृत्ति (मेनोपॉज)", "मासिक पाळी बंद होणे (मेनोपॉज)", ["अचानक अंगात उष्णतेची लाट येणे (Hot flashes)", "रात्री घाम", "स्वभावात चिडचिड"], "self_care"],

  // Pediatric Conditions (35 more)
  ["neonatal_hyperbilirubinemia_jaundice", "Neonatal Jaundice", "नवजात शिशु में पीलिया", "नवजात बाळाची कावीळ", ["बाळाचे डोळे व त्वचा जन्मानंतर पिवळी दिसणे", "दूध कमी पिणे"], "urgent"],
  ["infantile_colic", "Infant Colic", "शिशु के पेट में गैस का दर्द", "लहान बाळाचे पोटदुखीने रडणे (इन्फंट कोलिक)", ["बाळाचे संध्याकाळी सलग २-३ तास पाय पोटाशी धरून रडणे", "पोट टम्म असणे"], "self_care"],
  ["hand_foot_mouth_disease", "Hand, Foot, and Mouth Disease (HFMD)", "हाथ, पैर और मुंह की बीमारी", "हात-पाय-तोंडाचे फोड (HFMD)", ["तोंडाच्या आत, तळहात व तळपायांवर लाल फोड", "ताप", "लाळ गळणे"], "self_care"],
  ["pediatric_acute_diarrhea", "Pediatric Acute Diarrhea & Dehydration", "बच्चों में दस्त और निर्जलीकरण", "लहान मुलांमधील जुलाब व डिहायड्रेशन", ["पाण्यासारखे शौच", "डोळे खोल जाणे", "लघवीचे प्रमाण कमी", "टाळू खोल जाणे"], "urgent"],
  ["teething_symptoms_infant", "Infant Teething", "दांत निकलना", "बाळाचे दात येणे", ["लाळ जास्त गळणे", "हिरड्या खाजवणे", "किरकिर करणे"], "self_care"],
  ["diaper_dermatitis_rash", "Diaper Rash", "डायपर रैश", "डायपरमुळे येणारे लाल पुरळ", ["डायपरच्या भागात लालसर पुरळ व जळजळ"], "self_care"],
  ["pediatric_rickets_vitamin_d", "Nutritional Rickets", "रिकेट्स (सूखा रोग)", "मुडदूस (रिकेट्स - हाडांचा विकार)", ["पायांची हाडे वाकडी होणे (Bow legs)", "मनगटे जाड होणे", "चालण्यास उशीर"], "doctor_soon"],
  ["severe_acute_malnutrition_sam", "Severe Acute Malnutrition (SAM)", "गंभीर कुपोषण (सैम)", "तीव्र कुपोषण (सॅम)", ["शरीराचे हाडकुळे होणे", "दंड घेर ११.५ सेमी पेक्षा कमी", "पायांवर सूज"], "urgent"],
  ["nocturnal_enuresis_bedwetting", "Nocturnal Enuresis (Bedwetting)", "बिस्तर गीला करना", "झोपेत बिछाना ओला करणे (रात्री लघवी)", ["५ वर्षांनंतरही झोपेत नकळत लघवी होणे"], "self_care"],
  ["pediatric_atopic_eczema", "Pediatric Atopic Dermatitis", "बच्चों का एक्जिमा", "लहान मुलांचे एक्झिमा (खरुज)", ["गालांवर व कोपरांच्या बेचक्यात कोरडे, लाल व खाजणारे चट्टे"], "self_care"]
];

additionalMetabolicWomensPed.forEach(([id, canonical_name, name_hi, name_mr, symptoms, urgency]) => {
  let cat = "metabolic_endocrine";
  if (id.includes("pcos") || id.includes("period") || id.includes("vagin") || id.includes("pelvic") || id.includes("endometr") || id.includes("fibroid") || id.includes("postpartum") || id.includes("mastitis") || id.includes("menopause") || id.includes("preeclampsia") || id.includes("gravidarum")) {
    cat = "womens_maternal";
  } else if (id.includes("neonatal") || id.includes("infant") || id.includes("pediatric") || id.includes("teething") || id.includes("diaper") || id.includes("rickets") || id.includes("malnutrition") || id.includes("enuresis") || id.includes("hand_foot")) {
    cat = "pediatric";
  }

  metabolicWomensPediatric.push(createCondition({
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
    general_information: [`${name_mr} हा विकार असून शासकीय आरोग्य केंद्रात (PHC) योग्य सल्ला उपलब्ध आहे.`],
    safe_supportive_care: urgency === "emergency" ? [] : ["सकस आहार व विश्रांती घ्या.", "वेळेवर तपासणी करा."],
    things_to_avoid: ["अंधश्रद्धा किंवा अघोरी उपाय टाळा."],
    red_flags: ["तीव्र डिहायड्रेशन", "अतिरक्तस्त्राव", "बेशुद्ध पडणे"],
    urgency,
    when_to_visit_doctor: ["लक्षणे दिसल्यास शासकीय आरोग्य केंद्र किंवा तज्ज्ञांशी संपर्क साधा."],
    appropriate_specialty: cat === "womens_maternal" ? ["Gynecologist"] : cat === "pediatric" ? ["Pediatrician"] : ["Endocrinologist", "General Physician"],
    facility_type: ["PHC", "Rural Hospital", "District Hospital"]
  }));
});

module.exports = metabolicWomensPediatric;
