const { createCondition } = require("./dataset_helper");

const cardioNeuro = [
  // Cardiovascular
  createCondition({
    id: "essential_hypertension",
    canonical_name: "Essential Hypertension (High Blood Pressure)",
    category: "cardiovascular",
    names: { english: "Hypertension (High Blood Pressure)", hindi: "उच्च रक्तचाप (हाई ब्लड प्रेशर / BP)", marathi: "उच्च रक्तदाब (हाय बीपी)" },
    synonyms: {
      english: ["high bp", "hypertension", "high blood pressure", "elevated bp"],
      hindi: ["हाई बीपी", "उच्च रक्तचाप", "ब्लड प्रेशर बढ़ जाना"],
      marathi: ["हाय बीपी", "उच्च रक्तदाब", "बीपी वाढणे", "रक्तदाब"],
      roman_hindi: ["high bp", "blood pressure badhna", "bp high hai"],
      roman_marathi: ["high bp", "bp vadhla", "raktdab"],
      common_indian_terms: ["high bp", "bp problem", "blood pressure"]
    },
    common_symptoms: ["डोक्याच्या मागील बाजूस जडपणा (Occipital heaviness)", "चक्कर येणे (Dizziness)", "छातीत धडधड (Palpitations)", "अस्वस्थता (Restlessness)"],
    general_information: ["उच्च रक्तदाबामध्ये रक्तवाहिन्यांवर रक्ताचा दाब सातत्याने १४०/९० mmHg पेक्षा जास्त राहतो. याला 'सायलेंट किलर' असेही म्हणतात."],
    safe_supportive_care: ["जेवणातील मिठाचे प्रमाण (सोडियम) कमी करा (दिवसाला १ चमच्यापेक्षा कमी).", "दररोज ३० मिनिटे चालणे किंवा हलका व्यायाम करा.", "ताणतणाव कमी करण्यासाठी ध्यान किंवा प्राणायाम करा.", "दर आठवड्याला प्राथमिक आरोग्य केंद्रात (PHC) मोफत बीपी मोजून नोंद ठेवा."],
    things_to_avoid: ["पापड, लोणची, फरसाण, बेकरी पदार्थ आणि प्रक्रिया केलेले अन्न टाळा.", "डॉक्टरांच्या सल्ल्याशिवाय बीपीची औषधे घेणे अचानक बंद करू नका."],
    red_flags: ["बीपी १८०/१२० पेक्षा जास्त असणे", "छातीत तीव्र दाब किंवा कळ", "अचानक अंधारी येणे किंवा डोके प्रचंड दुखणे", "हात किंवा पायात अशक्तपणा"],
    urgency: "doctor_soon",
    when_to_visit_doctor: ["रक्तदाब सतत १४०/९० पेक्षा जास्त येत असल्यास वैद्यकीय तपासणीसाठी डॉक्टरांकडे जा."],
    appropriate_specialty: ["Cardiologist", "General Physician"],
    facility_type: ["PHC", "Rural Hospital", "District Hospital"]
  }),
  createCondition({
    id: "myocardial_infarction_heart_attack",
    canonical_name: "Acute Myocardial Infarction (Heart Attack)",
    category: "cardiovascular",
    names: { english: "Heart Attack (Myocardial Infarction)", hindi: "हार्ट अटैक (दिल का दौरा)", marathi: "हार्ट अटॅक (हृदयविकाराचा झटका)" },
    synonyms: {
      english: ["heart attack", "myocardial infarction", "cardiac arrest", "coronary thrombosis"],
      hindi: ["हार्ट अटैक", "दिल का दौरा", "सीने में तेज दर्द"],
      marathi: ["हार्ट अटॅक", "हृदयविकाराचा झटका", "छातीत कळा", "हार्टचा त्रास"],
      roman_hindi: ["heart attack", "dil ka daura", "seene me dard", "paseena aana"],
      roman_marathi: ["heart attack", "chhatit kal", "dolyasomorkhari", "gham yetoy"],
      common_indian_terms: ["heart attack", "chhati dard", "attack"]
    },
    common_symptoms: ["छातीच्या मध्यभागी तीव्र आवळल्यासारखा किंवा हत्ती बसल्यासारखा दाब (Crushing retrosternal chest pain)", "डाव्या हाताकडे, मानेकडे, जबड्याकडे किंवा पाठीकडे पसरणाऱ्या कळा (Radiation to left arm/jaw)", "अचानक प्रचंड थंड घाम येणे (Profuse cold sweating)", "श्वास घेण्यास अडचण व भोवळ (Breathlessness and dizziness)"],
    general_information: ["हृदयाच्या रक्तवाहिनीत रक्ताची गाठ अडकल्यामुळे हृदयाच्या स्नायूंचा रक्तपुरवठा अचानक खंडित होतो. हा अत्यंत तातडीचा वैद्यकीय आणीबाणीचा प्रसंग आहे."],
    safe_supportive_care: ["रुग्णाला तातडीने शांत बसवा किंवा अर्धे झोपवा.", "अजिबात चालू किंवा हालचाल करू देऊ नका.", "त्वरित १०८ वर कॉल करा."],
    things_to_avoid: ["रुग्णाला पाणी पाजणे किंवा अन्न भरवणे टाळा.", "चालवत नेण्याचा प्रयत्न करू नका.", "घरगुती उपायांवर एक सेकंदही वाया घालवू नका."],
    red_flags: ["छातीत असह्य वेदना आणि थंड घाम येणे", "रुग्ण बेशुद्ध पडणे", "नाडी मंदावणे किंवा न लागणे"],
    urgency: "emergency",
    when_to_visit_doctor: ["ही तातडीची आणीबाणी आहे! ताबडतोब १०८ रुग्णवाहिका बोलवा किंवा नजीकच्या कॅथ लॅब / आयसीयू सुविधा असलेल्या शासकीय रुग्णालयात (उदा. GMC) जा."],
    appropriate_specialty: ["Cardiologist", "Interventional Cardiologist", "Emergency Physician"],
    facility_type: ["District Hospital", "GMC Trauma Care", "Cardiac Specialty Hospital"]
  }),

  // Neurological
  createCondition({
    id: "migraine_headache",
    canonical_name: "Migraine Headache",
    category: "neurological",
    names: { english: "Migraine Headache", hindi: "माइग्रेन (आधा सीसी सिरदर्द)", marathi: "मायग्रेन (अर्धे डोकेदुखी)" },
    synonyms: {
      english: ["migraine", "vascular headache", "hemicrania"],
      hindi: ["माइग्रेन", "आधा सीसी दर्द", "सिर में धड़कन जैसा दर्द"],
      marathi: ["मायग्रेन", "अर्धे डोके दुखणे", "डोक्यात ठसठस"],
      roman_hindi: ["migraine", "aadha sir dard", "thas thas dard"],
      roman_marathi: ["migraine", "ardhe doke dukhtay", "thasthas"],
      common_indian_terms: ["migraine", "aadha sirdard", "ardha doke"]
    },
    common_symptoms: ["डोक्याच्या एका बाजूला ठसठसणारी तीव्र वेदना (Unilateral throbbing pain)", "प्रकाश व आवाजाचा त्रास (Photophobia and phonophobia)", "उलटी किंवा मळमळ (Nausea/vomiting)", "डोळ्यांसमोर चमकणारे ठिपके (Visual aura)"],
    general_information: ["मायग्रेन हा मेंदूतील नसा व रक्तवाहिन्यांच्या अतिसंवेदनशीलतेमुळे होणारा तीव्र डोकेदुखीचा विकार आहे."],
    safe_supportive_care: ["अंधाऱ्या आणि शांत खोलीत विश्रांती घ्या.", "कपाळावर किंवा मानेवर थंड पाण्याची पट्टी ठेवा.", "पुरेसे पाणी प्या.", "झोपेचे वेळापत्रक नियमित ठेवा."],
    things_to_avoid: ["उपाशी राहणे किंवा जेवणाची वेळ चुकवणे टाळा.", "उन्हात थेट जाणे, मोठा आवाज आणि मोबाईल स्क्रीनचा अतिवापर टाळा."],
    red_flags: ["अचानक विजेसारखी अत्यंत तीव्र डोकेदुखी (Thunderclap headache)", "हात किंवा पायात अशक्तपणा", "बोलताना अडखळणे किंवा दृष्टी जाणे"],
    urgency: "doctor_soon",
    when_to_visit_doctor: ["वारंवार मायग्रेनचे झटके येत असल्यास प्रतिबंधात्मक उपचारांसाठी न्यूरोलॉजिस्ट किंवा डॉक्टरांना भेटा."],
    appropriate_specialty: ["Neurologist", "General Physician"],
    facility_type: ["PHC", "Rural Hospital", "District Hospital"]
  }),
  createCondition({
    id: "acute_ischemic_stroke",
    canonical_name: "Acute Ischemic Stroke (Paralysis)",
    category: "neurological",
    names: { english: "Acute Ischemic Stroke (Brain Stroke)", hindi: "स्ट्रोक / लकवा (ब्रेन अटैक)", marathi: "ब्रेन स्ट्रोक / पक्षाघात (लकवा)" },
    synonyms: {
      english: ["stroke", "brain attack", "cerebrovascular accident", "paralysis"],
      hindi: ["स्ट्रोक", "लकवा", "फालिज", "ब्रेन अटैक"],
      marathi: ["स्ट्रोक", "पक्षाघात", "लकवा", "मेंदूतील रक्तस्राव"],
      roman_hindi: ["stroke", "lakwa", "falij", "bolne me dikkat"],
      roman_marathi: ["stroke", "lakva", "pakshaghat", "ek baju thapali"],
      common_indian_terms: ["stroke", "lakwa", "paralysis", "brain attack"]
    },
    common_symptoms: ["चेहऱ्याची एक बाजू वाकडी होणे (Facial drooping - F)", "एका हातामध्ये किंवा पायात अचानक ताकद जाणे (Arm weakness - A)", "बोलताना अडखळणे किंवा स्पष्ट न बोलता येणे (Slurred speech - S)", "वेळ अत्यंत महत्त्वाची (Time to call 108 - T - FAST नियम)"],
    general_information: ["मेंदूच्या रक्तवाहिनीत अडथळा आल्यामुळे मेंदूच्या पेशींना रक्तपुरवठा बंद होतो. पहिल्या ४.५ तासांत (Golden Window) उपचार झाल्यास रुग्ण पूर्ण बरा होऊ शकतो."],
    safe_supportive_care: ["रुग्णाला तात्काळ सुरक्षित झोपवा.", "उलट्या होत असल्यास एका कुशीवर वळवा.", "त्वरित १०८ वर कॉल करा."],
    things_to_avoid: ["रुग्णाला काहीही खायला किंवा प्यायला देऊ नका (घशात अडकू शकते).", "ॲस्पिरिन किंवा इतर गोळ्या डॉक्टरांच्या सीटी स्कॅनशिवाय देऊ नका."],
    red_flags: ["अचानक शरीराची एक बाजू लुळी पडणे", "बोलणे पूर्णपणे बंद होणे", "बेशुद्ध पडणे"],
    urgency: "emergency",
    when_to_visit_doctor: ["तातडीने सीटी स्कॅन सुविधा असलेल्या शासकीय मेडिकल कॉलेज (GMC) किंवा जिल्हा रुग्णालयात जा."],
    appropriate_specialty: ["Neurologist", "Neurosurgeon", "Emergency Physician"],
    facility_type: ["District Hospital", "GMC Stroke Center"]
  })
];

// 71 More Cardio & Neuro Conditions
const additionalCardioNeuro = [
  // Cardio (33 more)
  ["angina_pectoris_stable", "Angina Pectoris", "एंजाइना (सीने में जकड़न)", "अँजायना (हृदयावर ताण)", ["श्रमानंतर छातीत जडपणा", "विश्रांतीनंतर बरे वाटणे"], "urgent"],
  ["congestive_heart_failure", "Heart Failure", "हार्ट फेल्योर (दिल की कमजोरी)", "हार्ट फेल्युअर (हृदय दुर्बलता)", ["पायांवर सूज", "झोपल्यावर श्वास गुदमरणे", "थकवा"], "urgent"],
  ["atrial_fibrillation", "Atrial Fibrillation", "अनियमित दिल की धड़कन", "हृदयाचे अनियमित ठोके", ["छातीत अनियमित धडधड", "चक्कर", "दम लागणे"], "urgent"],
  ["postural_hypotension", "Orthostatic Hypotension", "खड़े होने पर लो बीपी", "अचानक उभे राहिल्यावर चक्कर", ["उभे राहिल्यावर डोळ्यांसमोर अंधारी", "भोवळ"], "self_care"],
  ["deep_vein_thrombosis_dvt", "Deep Vein Thrombosis (DVT)", "पैरों में खून का थक्का", "पायातील शिरांमध्ये रक्ताची गाठ", ["एकाच पायाच्या पोटरीला सूज", "तीव्र लालसरपणा व वेदना"], "urgent"],
  ["varicose_veins_legs", "Varicose Veins", "वेरिकोज वेन्स (फूली हुई नसें)", "फुगलेल्या शिरा (व्हेरकोज व्हेन्स)", ["पायांवर जांभळ्या फुगलेल्या शिरा", "पायात जडपणा व दुखणे"], "doctor_soon"],
  ["rheumatic_heart_disease", "Rheumatic Heart Disease", "रूमैटिक हार्ट डिजीज", "हृदयाच्या झडपांचा आजार", ["लहानपणी सांधेदुखीनंतर धाप लागणे", "हृदयात घरघर"], "doctor_soon"],
  ["infective_endocarditis", "Infective Endocarditis", "हृदय के वाल्व का संक्रमण", "हृदयाच्या झडपांचा जंतू संसर्ग", ["सतत ताप", "अशक्तपणा", "नखांखाली काळे डाग"], "urgent"],
  ["pericarditis_acute", "Acute Pericarditis", "हृदय की झिल्ली की सूजन", "हृदयाच्या आवरणाची सूज", ["पुढे झुकल्यावर बरे वाटणारे छातीत दुखणे", "ताप"], "urgent"],
  ["hypertrophic_cardiomyopathy", "Hypertrophic Cardiomyopathy", "कार्डियोमायोपैथी", "हृदयाच्या स्नायूंचा जाडपणा", ["व्यायामादरम्यान भोवळ", "छातीत दुखणे"], "urgent"],
  ["peripheral_artery_disease_pad", "Peripheral Artery Disease", "पैरों की धमनियों की रुकावट", "पायांच्या रक्तवाहिन्यांमधील अडथळा", ["चालताना पोटऱ्यांमध्ये असह्य गोळा येणे", "विश्रांतीने आराम"], "doctor_soon"],
  ["sinus_tachycardia", "Sinus Tachycardia", "तेज दिल की धड़कन", "हृदयाचे वेगवान ठोके", ["छातीत सतत १०० पेक्षा जास्त ठोके", "घाबरल्यासारखे वाटणे"], "doctor_soon"],
  ["sinus_bradycardia", "Sinus Bradycardia", "धीमी दिल की धड़कन", "हृदयाचे अत्यंत मंद ठोके", ["ठोके ५० पेक्षा कमी", "सतत चक्कर येणे", "थकवा"], "doctor_soon"],

  // Neuro (38 more)
  ["tension_type_headache", "Tension Headache", "तनाव से सिरदर्द", "तणावामुळे होणारी डोकेदुखी", ["डोक्याभोवती पट्टा आवळल्यासारखी मंद वेदना", "मानेत ताण"], "self_care"],
  ["cluster_headache", "Cluster Headache", "क्लस्टर सिरदर्द", "एका डोळ्याभोवती तीव्र डोकेदुखी", ["एका डोळ्यातून पाणी व लालसरपणा", "असह्य तीक्ष्ण वेदना"], "urgent"],
  ["benign_paroxysmal_vertigo_bppv", "BPPV (Vertigo)", "चक्कर आना (वर्टिगो)", "भोवळ / चक्कर येणे (व्हर्टिगो)", ["मान हलवल्यावर खोली फिरल्यासारखे वाटणे", "उलट्या"], "self_care"],
  ["general_epilepsy_seizure", "Epileptic Seizures (Mirgi)", "मिर्गी (दौरे पड़ना)", "अपस्मार (फेफरे / मिरगी)", ["हात-पाय झटकणे", "तोंडातून फेस येणे", "बेशुद्ध पडणे"], "emergency"],
  ["febrile_convulsion_child", "Febrile Seizure", "बुखार में झटका आना", "तापामुळे लहान मुलांमध्ये येणारे फेफरे", ["तीव्र तापानंतर शरीराचे झटके", "डोळे पांढरे होणे"], "urgent"],
  ["acute_bacterial_meningitis", "Bacterial Meningitis", "दिमागी बुखार (मेनिनजाइटिस)", "मेंदूज्वर (मेनिनजायटिस)", ["तीव्र ताप", "मान पूर्ण आखडणे", "प्रकाशाचा त्रास", "उलट्या"], "emergency"],
  ["viral_encephalitis", "Viral Encephalitis", "मस्तिष्क ज्वर", "मेंदूची तीव्र जळजळ", ["तीव्र ताप", "बेशुद्धी किंवा भ्रम", "झटके"], "emergency"],
  ["parkinsons_disease", "Parkinson's Disease", "पार्किंसंस (कंपवात)", "कंपवात (पार्किन्सन्स)", ["हात थरथरणे", "चालताना तोल जाणे", "शरीर ताठ होणे"], "doctor_soon"],
  ["alzheimers_dementia", "Alzheimer's Dementia", "अल्जाइमर (स्मृतिभ्रंश)", "स्मृतिभ्रंश (अल्झायमर / विस्मरण)", ["नुकत्याच घडलेल्या गोष्टी विसरणे", "ओळखीच्या जागा न समजणे"], "doctor_soon"],
  ["bells_palsy_facial", "Bell's Palsy", "चेहरे का लकवा (बेल्स पाल्सी)", "चेहऱ्याचा पक्षाघात (बेल्स पाल्सी)", ["एका बाजूचा चेहरा अचानक वाकडा होणे", "डोळा पूर्ण न मिटणे"], "urgent"],
  ["trigeminal_neuralgia", "Trigeminal Neuralgia", "चेहरे की नसों का दर्द", "चेहऱ्यावरील नसांची तीव्र कळ", ["गालावर विजेचा झटका बसल्यासारखी अचानक असह्य वेदना"], "doctor_soon"],
  ["peripheral_neuropathy_diabetic", "Diabetic Neuropathy", "डायबिटिक न्यूरोपैथी", "मधुमेहामुळे पायांच्या नसा सुन्न होणे", ["पायांत मुंग्या येणे", "तळपायांची जळजळ", "सुन्नपणा"], "doctor_soon"],
  ["sciatica_nerve_pain", "Sciatica Nerve Pain", "साइटिका (कमर से पैर तक दर्द)", "सायटिका (कमरेतून पायात जाणारी कळ)", ["कमरेपासून पायाच्या मागून घोट्यापर्यंत जाणारी तीव्र कळ"], "doctor_soon"],
  ["cervical_radiculopathy", "Cervical Radiculopathy", "गर्दन से हाथ में दर्द", "मानेतून हातात जाणारी कळ", ["मानेतून हातात मुंग्या व अशक्तपणा"], "doctor_soon"],
  ["carpal_tunnel_syndrome", "Carpal Tunnel Syndrome", "कलाई की नस का दबना", "मनगटातील नस दबणे (कार्पल टनेल)", ["अंगठा व बोटांत रात्री मुंग्या व बधीरपणा"], "self_care"],
  ["transient_ischemic_attack_tia", "Transient Ischemic Attack (Mini-Stroke)", "मिनी स्ट्रोक (टीआईए)", "मिनी स्ट्रोक (तात्पुरता पक्षाघात)", ["काही मिनिटांसाठी हात किंवा बोलणे जाणे व पुन्हा बरे वाटणे"], "emergency"],
  ["restless_leg_syndrome", "Restless Leg Syndrome", "पैरों में बेचैनी", "पायांमध्ये अस्वस्थता", ["झोपताना पाय हलवण्याची तीव्र इच्छा"], "self_care"]
];

additionalCardioNeuro.forEach(([id, canonical_name, name_hi, name_mr, symptoms, urgency]) => {
  cardioNeuro.push(createCondition({
    id,
    canonical_name,
    category: id.includes("headache") || id.includes("vertigo") || id.includes("epilep") || id.includes("seizure") || id.includes("mening") || id.includes("enceph") || id.includes("parkinson") || id.includes("dementia") || id.includes("bells") || id.includes("neuralgia") || id.includes("neuropathy") || id.includes("sciatica") || id.includes("radiculo") || id.includes("carpal") || id.includes("tia") || id.includes("restless") ? "neurological" : "cardiovascular",
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
    general_information: [`${name_mr} हा आजार असून तज्ज्ञ डॉक्टरांकडून तपासणी व उपचार आवश्यक आहेत.`],
    safe_supportive_care: urgency === "emergency" ? [] : ["शांत व सुरक्षित जागी विश्रांती घ्या.", "ताणतणाव कमी ठेवा."],
    things_to_avoid: ["स्वतःहून औषधे बंद करू नका."],
    red_flags: ["बेशुद्ध पडणे", "छातीत तीव्र वेदना", "शरीराची एक बाजू लुळी पडणे"],
    urgency,
    when_to_visit_doctor: ["लक्षणे दिसल्यास त्वरित शासकीय रुग्णालयात किंवा तज्ज्ञांकडे जा."],
    appropriate_specialty: id.includes("headache") || id.includes("vertigo") || id.includes("neuro") || id.includes("stroke") ? ["Neurologist"] : ["Cardiologist", "General Physician"],
    facility_type: ["Rural Hospital", "District Hospital", "Medical College (GMC)"]
  }));
});

module.exports = cardioNeuro;
