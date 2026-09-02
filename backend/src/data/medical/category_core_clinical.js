const { createCondition } = require("./dataset_helper");

const clinicalList = [
  // Additional Respiratory & Allergy
  ["chronic_cough_unexplained", "Chronic Unexplained Cough", "पुरानी खांसी", "जुनाट खोकला", ["८ आठवड्यांपेक्षा जास्त खोकला", "छातीत जडपणा"], "doctor_soon", "respiratory"],
  ["occupational_asthma", "Occupational Asthma", "कार्यस्थल का दमा", "कामाच्या ठिकाणचा दमा (केमिकल / कापूस)", ["कामावर गेल्यावर धाप व खोकला", "सुट्टीत बरे वाटणे"], "doctor_soon", "respiratory"],
  ["bronchospasm_exercise_induced", "Exercise-Induced Bronchospasm", "व्यायाम के बाद सांस फूलना", "व्यायामानंतर श्वास भरून येणे", ["धावल्यानंतर छातीत घरघर व खोकला"], "self_care", "respiratory"],
  ["nasal_polyps_chronic", "Nasal Polyps", "नाक में मांस बढ़ना", "नाकातील मांसाची गाठ (पॉलिप्स)", ["नाक सतत चोंदणे", "वास न येणे", "घोरणे"], "doctor_soon", "ent_ophthalmology"],
  ["allergic_conjunctivitis_seasonal", "Seasonal Allergic Conjunctivitis", "मौसमी आंख की एलर्जी", "हंगामी डोळ्यांची ॲलर्जी", ["दोन्ही डोळ्यांत तीव्र खाज", "पाणी येणे", "पापण्या सुजणे"], "self_care", "ent_ophthalmology"],
  ["blepharitis_eyelid_crusts", "Blepharitis (Eyelid Inflammation)", "पलकों की सूजन व रूसी", "पापण्यांची सूज व खपल्या", ["पापण्यांवर कोंड्यासारख्या खपल्या", "डोळे चुरचुरणे"], "self_care", "ent_ophthalmology"],
  ["subconjunctival_hemorrhage_red_spot", "Subconjunctival Hemorrhage", "आंख में खून का धब्बा", "डोळ्यात रक्ताचा ठिपका उमटणे", ["डोळ्यात वेदनेशिवाय अचानक लाल रक्ताचा डाग"], "self_care", "ent_ophthalmology"],
  ["epiglottic_cyst_throat", "Epiglottic Cyst", "गले की गांठ", "घशातील गाठ", ["घशात काही अडकल्यासारखे वाटणे", "गिळताना त्रास"], "doctor_soon", "ent_ophthalmology"],
  ["cerumen_impaction_wax", "Ear Wax Impaction", "कान में खूंट जमना", "कानात मळ साचणे", ["कानात जडपणा", "कमी ऐकू येणे"], "self_care", "ent_ophthalmology"],
  ["glossitis_swollen_tongue", "Glossitis (Inflamed Tongue)", "जीभ की सूजन", "जिभेची जळजळ व सूज", ["जीभ लाल, गुळगुळीत व दुखणे", "अन्न खाताना आग"], "self_care", "oral_dental"],
  ["temporomandibular_joint_tmj", "TMJ Dysfunction", "जबड़े का दर्द व चटकना", "जबड्याचा सांधा दुखणे व चटकणे", ["तोंड उघडताना जबड्यातून आवाज", "गालात वेदना"], "self_care", "oral_dental"],
  ["halitosis_bad_breath", "Chronic Halitosis (Bad Breath)", "मुंह की बदबू", "तोंडाचा तीव्र दुर्गंध (हॅलिटोसिस)", ["तोंडातून सतत दुर्गंध येणे", "हिरड्यांचा त्रास"], "self_care", "oral_dental"],
  ["oral_thrush_candidiasis", "Oral Candidiasis in Adults", "मुंह का फंगस", "तोंडातील पांढरी बुरशी", ["गालाच्या आत पांढरे दहीसारखे थर"], "doctor_soon", "oral_dental"],
  ["leukoplakia_tongue", "Tongue Leukoplakia", "जीभ पर सफेद पैच", "जिभेवरील न निघणारा पांढरा डाग", ["जिभेवर पांढरा कडक थर", "तंबाखू इतिहास"], "urgent", "oral_dental"],
  ["salivary_gland_stone_sialolithiasis", "Salivary Gland Stone", "लार ग्रंथि की पथरी", "लाळग्रंथीतील खडा", ["जेवताना जबड्याखाली वेदना व सूज"], "doctor_soon", "oral_dental"],

  // Additional Musculoskeletal & Ortho
  ["cervical_myofascial_pain", "Cervical Myofascial Pain", "गर्दन की मांसपेशियों में जकड़न", "मानेच्या स्नायूंमध्ये गाठी व ताठरता", ["मानेत व खांद्यात कडक गाठी (Trigger points)", "डोकेदुखी"], "self_care", "musculoskeletal"],
  ["patellofemoral_pain_syndrome", "Patellofemoral Pain (Runner's Knee)", "दौड़ने वालों का घुटना दर्द", "धावपटूंची गुडघेदुखी (पटेलोफेमोरल)", ["गुडघ्याच्या वाटीखाली पायऱ्या उतरताना वेदना"], "self_care", "musculoskeletal"],
  ["achilles_tendonitis_heel", "Achilles Tendinitis", "एड़ी की नस की सूजन", "टाचेच्या मागील नसेची सूज", ["टाचेच्या वर मागच्या बाजूला चालताना वेदना"], "self_care", "musculoskeletal"],
  ["shin_splints_leg_pain", "Shin Splints (Medial Tibial Stress)", "पिंडली की हड्डी में दर्द", "धावल्यानंतर नडगीच्या हाडात वेदना", ["नडगीच्या हाडावर चालताना किंवा पळताना ठसठस"], "self_care", "musculoskeletal"],
  ["ganglion_cyst_wrist", "Ganglion Cyst of Wrist", "कलाई की गांठ (गैंग्लियन)", "मनगटावरील मऊ गाठ (गँग्लिऑन)", ["मनगटावर हालचालीसोबत दिसणारी बिनदुखी गाठ"], "self_care", "musculoskeletal"],
  ["trigger_finger_stenosing", "Trigger Finger (Stenosing Tenosynovitis)", "उंगली का अटकना (ट्रिगर फिंगर)", "बोट वाकवून सरळ करताना अडकणे", ["बोट सरळ करताना चटकन अडकून उघडणे"], "doctor_soon", "musculoskeletal"],
  ["de_quervains_tenosynovitis", "De Quervain's Tenosynovitis", "अंगूठे की नस का दर्द", "अंगठ्याच्या मुळाशी मनगटात तीव्र कळ", ["मोबाईल टाईप करताना किंवा वस्तू पकडताना अंगठा दुखणे"], "self_care", "musculoskeletal"],
  ["bunion_hallux_valgus", "Bunion (Hallux Valgus)", "पैर के अंगूठे की हड्डी बढ़ना", "पायाच्या अंगठ्याची हाड वाढणे (बनियन)", ["अंगठ्याच्या सांध्यावर लाल हाडाची वाढ", "बूट लागणे"], "self_care", "musculoskeletal"],
  ["kyphosis_hunchback", "Postural Kyphosis (Hunchback)", "कूबड़ निकलना (कुबड़ापन)", "पाठीला कुबड येणे (कुबडेपणा)", ["पाठीचा कणा पुढे झुकणे", "पाठदुखी"], "self_care", "musculoskeletal"],
  ["scoliosis_spinal_curvature", "Adolescent Scoliosis", "रीढ़ की हड्डी टेढ़ी होना", "पाठीचा कणा एका बाजूला वाकडा होणे", ["एका खांद्याची उंची दुसऱ्यापेक्षा जास्त दिसणे"], "doctor_soon", "musculoskeletal"],
  ["bursitis_olecranon_elbow", "Olecranon Bursitis (Student's Elbow)", "कोहनी में पानी की थैली", "कोपरावर मऊ पाचकळ गाठ (बर्सायटिस)", ["कोपरावर अंड्यासारखी मऊ सूज"], "self_care", "musculoskeletal"],
  ["calcific_tendinitis_shoulder", "Calcific Tendinitis of Shoulder", "कंधे में कैल्शियम जमाव", "खांद्यात कॅल्शियम साचून तीव्र वेदना", ["अचानक खांद्यात असह्य वेदना"], "doctor_soon", "musculoskeletal"],

  // Additional Cardio, Vascular, Neuro
  ["sinus_arrhythmia_respiratory", "Respiratory Sinus Arrhythmia", "सांस के साथ धड़कन बदलना", "श्वासासोबत हृदयाचे ठोके बदलणे (सामान्य)", ["श्वास घेताना ठोके वाढणे व सोडताना मंदावणे"], "self_care", "cardiovascular"],
  ["premature_ventricular_contractions_pvc", "Premature Ventricular Contractions (PVC)", "दिल की छूटी हुई धड़कन (स्किप बीट)", "हृदयाचा ठोका चुकल्यासारखे वाटणे (स्किप बीट)", ["छातीत अचानक एक ठोका सुटल्याची जाणीव"], "self_care", "cardiovascular"],
  ["thoracic_outlet_syndrome", "Thoracic Outlet Syndrome", "कंधे और हाथ की नसों का दबाव", "खांद्यातून हातात जाणाऱ्या नसांवर दाब", ["हात वर केल्यावर हात सुन्न पडणे व मुंग्या"], "doctor_soon", "neurological"],
  ["restless_legs_syndrome_rls", "Restless Legs Syndrome", "पैरों में असहजता", "रात्री पायांत अस्वस्थता व पाय हलवणे", ["झोपताना पाय हलवण्याची अनावर ओढ"], "self_care", "neurological"],
  ["tension_headache_chronic", "Chronic Tension-Type Headache", "पुरानी तनाव सिरदर्द", "जुनाट तणाव डोकेदुखी", ["महिनाभरात १५ पेक्षा जास्त दिवस डोक्यात मंद दाब"], "self_care", "neurological"],
  ["occipital_neuralgia", "Occipital Neuralgia", "सिर के पिछले हिस्से में तेज दर्द", "डोक्याच्या मागच्या बाजूला विजेसारखी कळ", ["मानेच्या खालून डोक्याच्या शेंड्यापर्यंत शॉक लागल्यासारखी वेदना"], "doctor_soon", "neurological"],
  ["post_herpetic_neuralgia_shingles", "Post-Herpetic Neuralgia", "नागिन के बाद का दर्द", "नागीण बरी झाल्यानंतरची तीव्र जळजळ", ["नागिणीचे फोड बरे झाल्यावरही महिने न थांबणारी जळजळ"], "doctor_soon", "neurological"],
  ["complex_regional_pain_syndrome", "Complex Regional Pain Syndrome (CRPS)", "चोट के बाद अत्यधिक दर्द", "अपघाताच्या जागेवर अतिसंवेदनशील असह्य जळजळ", ["हात किंवा पायाला हलका स्पर्शही सहन न होणे"], "urgent", "neurological"],

  // Additional Metabolic, Renal, Liver, Women's
  ["impaired_fasting_glucose_prediabetes", "Prediabetes (Impaired Glucose)", "प्री-डायबिटीज (शुगर की शुरुआत)", "मधुमेहाची पूर्वअवस्था (प्री-डायबिटीज)", ["उपाशीपोटी साखर १००-१२५ दरम्यान असणे"], "self_care", "metabolic_endocrine"],
  ["gestational_diabetes_mellitus", "Gestational Diabetes Mellitus (GDM)", "गर्भावस्था में शुगर", "गरोदरपणातील मधुमेह (GDM)", ["गरोदरपणात रक्तातील साखर वाढणे"], "urgent", "womens_maternal"],
  ["hypertriglyceridemia_fats", "Hypertriglyceridemia", "ट्राइग्लिसराइड्स बढ़ना", "रक्तातील ट्रायग्लिसराइड्स चरबी वाढणे", ["रक्तातील चरबी वाढणे, स्वादुपिंडावर ताण"], "doctor_soon", "metabolic_endocrine"],
  ["metabolic_syndrome_x", "Metabolic Syndrome X", "मेटाबॉलिक सिंड्रोम", "मेटाबॉलिक सिंड्रोम (लठ्ठपणा, बीपी, शुगर)", ["पोटाचा मोठा घेर, उच्च बीपी, हाय ट्रायग्लिसराइड्स"], "self_care", "metabolic_endocrine"],
  ["diabetic_retinopathy_early", "Diabetic Retinopathy (Early Signs)", "डायबिटीज से आंख की कमजोरी", "मधुमेहामुळे डोळ्यांच्या पडद्याची हानी", ["मधुमेहाच्या रुग्णांमध्ये हळूहळू दृष्टी कमी होणे"], "urgent", "metabolic_endocrine"],
  ["diabetic_nephropathy_microalbumin", "Diabetic Nephropathy", "डायबिटीज से गुर्दे की खराबी", "मधुमेहामुळे मूत्रपिंडाची हानी", ["लघवीत मायक्रोअल्ब्युमिन प्रथिने आढळणे"], "urgent", "metabolic_endocrine"],
  ["hyperuricemia_asymptomatic", "Asymptomatic Hyperuricemia", "यूरिक एसिड बढ़ना", "युरिक ॲसिडचे प्रमाण वाढणे", ["रक्त तपासणीत युरिक ॲसिड ७ पेक्षा जास्त"], "self_care", "metabolic_endocrine"],
  ["osteopenia_low_bone_density", "Osteopenia (Mild Bone Thinning)", "हड्डियों का हल्का कमजोर होना", "हाडांची प्राथमिक झीज (ऑस्टिओपेनिया)", ["हाडांची घनता किंचित कमी असणे"], "self_care", "metabolic_endocrine"],
  ["hypothyroidism_subclinical", "Subclinical Hypothyroidism", "थायराइड की हल्की कमी", "थायरॉईडची प्राथमिक कमतरता (TSH वाढ)", ["किंचित थकवा, वजन थोडे वाढणे"], "self_care", "metabolic_endocrine"],
  ["hashimotos_thyroiditis_autoimmune", "Hashimoto's Thyroiditis", "हाशिमोटो थायराइडाइटिस", "हाशिमोटो थायरॉईड विकार", ["गळ्यातील ग्रंथी हळूहळू सुजणे व काम कमी करणे"], "doctor_soon", "metabolic_endocrine"],

  // Additional GI & Liver
  ["functional_dyspepsia_epigastric", "Epigastric Pain Syndrome", "पेट के ऊपरी हिस्से में दर्द", "पोटाच्या वरच्या भागात जेवणानंतर दुखणे", ["जेवणानंतर लगेच पोट दुखणे"], "self_care", "gastrointestinal"],
  ["aerophagia_excessive_burping", "Aerophagia (Excessive Burping)", "हवा निगलना व ज्यादा डकार", "जास्त हवा गिळल्यामुळे वारंवार ढेकर येणे", ["सतत रिकाम्या मोठ्या ढेकरा येणे"], "self_care", "gastrointestinal"],
  ["proctalgia_fugax_rectal_cramp", "Proctalgia Fugax (Rectal Cramp)", "गुदा में अचानक ऐंठन का दर्द", "रात्री गुदद्वारात अचानक येणारी तीव्र कळ", ["रात्री झोपेत गुदद्वारात काही मिनिटांची तीक्ष्ण कळ"], "self_care", "gastrointestinal"],
  ["coccydynia_tailbone_pain", "Coccydynia (Tailbone Pain)", "रीढ़ की पूंछ की हड्डी का दर्द", "माकडहाड दुखणे (टेलबोन पेन)", ["कठीण पृष्ठभागावर बसल्यावर माकडहाडात तीव्र वेदना"], "self_care", "musculoskeletal"],
  ["fatty_liver_grade_1", "Grade 1 Hepatic Steatosis", "ग्रेड 1 फैटी लिवर", "ग्रेड १ फॅटी लिव्हर (प्राथमिक चरबी)", ["सोनोग्राफीमध्ये यकृतावर सौम्य चरबी आढळणे"], "self_care", "hepatic_biliary"],
  ["biliary_sludge_microlithiasis", "Biliary Sludge (Gallbladder Sludge)", "पित्ताशय में कीचड़ / गाद", "पित्ताशयातील गाळ (स्लज)", ["चरबीयुक्त जेवणानंतर हलकी पोटदुखी"], "self_care", "hepatic_biliary"],
  ["gilberts_syndrome_mild_jaundice", "Gilbert's Syndrome (Benign Jaundice)", "गिल्बर्ट सिंड्रोम (हल्का पीलिया)", "गिलबर्ट सिंड्रोम (निरुपद्रवी हलकी कावीळ)", ["उपाशी राहिल्यावर किंवा आजारी पडल्यावर डोळे किंचित पिवळे होणे"], "self_care", "hepatic_biliary"],

  // Additional Women's, Maternal, Pediatric
  ["mastodynia_cyclical_breast_pain", "Cyclical Mastalgia (Breast Pain)", "माहवारी से पहले स्तन में दर्द", "मासिक पाळीपूर्वी स्तनामध्ये दुखणे व जडपणा", ["पाळीच्या ५ दिवस आधी दोन्ही स्तनात जडपणा व दुखणे"], "self_care", "womens_maternal"],
  ["fibroadenoma_benign_breast_lump", "Fibroadenoma of Breast", "स्तन की सौम्य गांठ (फाइब्रोएडेनोमा)", "स्तनातील निरुपद्रवी मऊ गाठ (फायब्रोॲडेनोमा)", ["स्तनात इकडून तिकडे सरकणारी मऊ रबरी गाठ (Breast mouse)"], "doctor_soon", "womens_maternal"],
  ["mittelschmerz_ovulation_pain", "Mittelschmerz (Ovulation Pain)", "ओव्यूलेशन का हल्का दर्द", "अंडी फुटताना पाळीच्या मध्यभागी होणारी पोटदुखी", ["पाळीच्या १४ व्या दिवशी पोटाच्या एका बाजूला हलकी कळ"], "self_care", "womens_maternal"],
  ["cervical_erosion_ectropion", "Cervical Ectropion / Erosion", "बच्चेदानी के मुंह पर लाली", "गर्भाशयाच्या मुखावर लालसरपणा व स्त्राव", ["पांढरा स्त्राव, संबंधानंतर हलका डाग"], "doctor_soon", "womens_maternal"],
  ["neonatal_erythema_toxic_rash", "Erythema Toxic Neonatorum", "नवजात का लाल रैश (सामान्य)", "नवजात बाळाच्या अंगावरील सामान्य लाल पुरळ", ["जन्मानंतर २-३ दिवसांत अंगावर लाल डाग, बाळ खेळते असते"], "self_care", "pediatric"],
  ["milia_neonatal_white_bumps", "Neonatal Milia (Milk Spots)", "शिशु के चेहरे पर सफेद दाने", "नवजात बाळाच्या नाकावरील बारीक पांढरे दाणे", ["नाकावर व गालांवर बारीक मोत्यासारखे दाणे (आपोआप जातात)"], "self_care", "pediatric"],
  ["cradle_cap_infant_seborrhea", "Cradle Cap (Infant Dandruff)", "शिशु के सिर की पपड़ी", "लहान बाळाच्या टाळूवरील पिवळी खपली", ["बाळाच्या डोक्यावर तेलकट जाड पिवळी खपली"], "self_care", "pediatric"]
];

const clinicalConditions = clinicalList.map(([id, canonical_name, name_hi, name_mr, symptoms, urgency, cat]) => {
  const isCancer = cat === "oncology_cancers";
  const isEmerg = urgency === "emergency" || cat === "emergency_trauma";

  return createCondition({
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
    general_information: [`${name_mr} हा सामान्य वैद्यकीय विकार असून योग्य सल्ल्याने नियंत्रणात राहतो.`],
    safe_supportive_care: isCancer || isEmerg ? [] : ["संतुलित आहार व विश्रांती घ्या.", "पाणी स्वच्छ व भरपूर प्या."],
    things_to_avoid: ["स्वतःहून औषधे घेणे टाळा."],
    red_flags: ["तीव्र असह्य वेदना", "रक्तस्राव", "बेशुद्धी"],
    urgency,
    when_to_visit_doctor: ["लक्षणे जास्त काळ टिकल्यास शासकीय आरोग्य केंद्र किंवा डॉक्टरांना दाखवा."],
    appropriate_specialty: ["General Physician", "Medical Officer"],
    facility_type: ["PHC", "Rural Hospital"]
  });
});

module.exports = clinicalConditions;
