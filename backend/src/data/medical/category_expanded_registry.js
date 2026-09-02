const { createCondition } = require("./dataset_helper");

const registryList = [
  // Infectious & Fevers (20)
  ["leptospirosis_mild", "Early Leptospirosis", "हल्का लेप्टोस्पायरोसिस", "सौम्य लेप्टोस्पायरोसिस", ["पावसाच्या पाण्याशी संपर्कानंतर ताप", "डोळे लाल", "पोटऱ्या दुखणे"], "urgent", "infections_fever"],
  ["swine_flu_h1n1_severe", "Swine Flu (H1N1 Severe)", "स्वाइन फ्लू (एच1एन1)", "स्वाइन फ्लू (H1N1 तीव्र संसर्ग)", ["तीव्र ताप", "धाप", "कफयुक्त खोकला", "घसा खवखवणे"], "urgent", "infections_fever"],
  ["chikungunya_chronic_arthritis", "Chronic Chikungunya Arthritis", "चिकनगुनिया के बाद जोड़ों का दर्द", "चिकनगुनियानंतरची जुनाट सांधेदुखी", ["ताप गेल्यानंतर महिनाभर बोटांच्या व पायांच्या सांध्यांत कळा"], "doctor_soon", "infections_fever"],
  ["cutaneous_anthrax_pustule", "Cutaneous Anthrax", "त्वचा का एंथ्रेक्स", "त्वचेचा ॲन्थ्रॅक्स संसर्ग", ["काळे खपली असलेले न दुखणारे व्रण (Malignant pustule)"], "urgent", "infections_fever"],
  ["cutaneous_leishmaniasis_oriental", "Cutaneous Leishmaniasis", "त्वचा का कालाजार", "त्वचेचा ओरिएंटल व्रण", ["न भरणारा चेहऱ्यावरील खपलीचा व्रण"], "doctor_soon", "infections_fever"],
  ["tinea_barbae_bearded_ringworm", "Tinea Barbae (Barber's Itch)", "दाढ़ी की दाद", "दाढीतील बुरशी संसर्ग (खाज)", ["दाढीत लाल पुरळ, खाज व केस गळणे"], "self_care", "dermatology"],
  ["tinea_unguium_toenail", "Tinea Unguium (Toenail Fungus)", "पैर के अंगूठे का फंगस", "पायाच्या अंगठ्याच्या नखातील बुरशी", ["नख काळे-पिवळे व जाड होणे"], "self_care", "dermatology"],
  ["pityriasis_rosea_herald_patch", "Pityriasis Rosea", "पिटिरियासिस रोजिया", "गुलाबी चट्टे (पिटिरिॲसिस रोझिया)", ["छातीवर मोठा मातृ चट्टा (Herald patch), पाठीवर ख्रिसमस ट्रीसारखे डाग"], "self_care", "dermatology"],
  ["granuloma_annulare_skin", "Granuloma Annulare", "त्वचा पर गोल छल्ले", "त्वचेवरील वर्तुळाकार गुळगुळीत रिंग", ["हातावर किंवा पायावर वेदनारहित लहान दाण्यांचे वर्तुळ"], "self_care", "dermatology"],
  ["cherry_angioma_red_moles", "Cherry Angioma (Red Moles)", "लाल तिल", "अंगावरील बारीक लाल तीळ", ["छातीवर व पोटावर लहान लाल रक्तबिंदूसारखे डाग (निरुपद्रवी)"], "self_care", "dermatology"],
  ["seborrheic_keratosis_barnacles", "Seborrheic Keratosis", "उम्र के साथ काले मस्से", "वृद्धापकाळातील तपकिरी-काळे चामखीळ", ["मेणासारखे चिकटवलेले दिसणारे काळे-तपकिरी डाग"], "self_care", "dermatology"],
  ["actinic_keratosis_sun_spots", "Actinic Keratosis (Solar Keratosis)", "धूप से खुरदुरी त्वचा", "उन्हामुळे त्वचेवर खडबडीत लाल खपली", ["उन्हात उघड्या राहणाऱ्या भागावर खसखशीत डाग"], "doctor_soon", "dermatology"],
  ["nummular_eczema_coin_shaped", "Nummular Eczema (Discoid)", "सिक्के जैसा एक्जिमा", "नाण्यासारखे गोल खाजणारे चट्टे", ["हात-पायांवर नाण्यासारखे गोल खाजणारे लाल खवले"], "self_care", "dermatology"],
  ["pompholyx_dyshidrotic_eczema", "Dyshidrotic Eczema (Pompholyx)", "हथेलियों पर पानी भरे दाने", "तळहात व बोटांच्या कडेला बारीक पाण्याचे फोड", ["तळहातावर तीव्र खाज सुटून बारीक खोल पाण्याचे फोड"], "self_care", "dermatology"],
  ["contact_dermatitis_nickel_cement", "Contact Dermatitis (Cement / Jewellery)", "सीमेंट या धातु से एलर्जी", "सिमेंट किंवा धातूची त्वचा ॲलर्जी", ["घड्याळ, टिकली, सिमेंट किंवा बांगडीच्या जागी लाल पुरळ व खाज"], "self_care", "dermatology"],
  ["xerosis_cutis_winter_dry_skin", "Xerosis (Severe Winter Dry Skin)", "सर्दियों में त्वचा का फटना", "हिवाळ्यात त्वचा अति कोरडी पडून भेगा पडणे", ["पायांची त्वचा पांढरी पडून माशाच्या खवल्यासारखी दिसणे"], "self_care", "dermatology"],
  ["photodermatitis_sun_allergy", "Polymorphous Light Eruption (Sun Allergy)", "धूप से एलर्जी", "उन्हाची ॲलर्जी (अंगावर पुरळ)", ["उन्हात फिरल्याने हात व गळ्यावर लाल खाजणारे दाणे"], "self_care", "dermatology"],
  ["acanthosis_nigricans_neck", "Acanthosis Nigricans (Velvety Dark Neck)", "गर्दन का कालापन", "मानेवरील काळे मखमली डाग (इन्सुलिन प्रतिकार)", ["मानेच्या मागे, काखेत त्वचा काळी, जाड व मखमली होणे"], "self_care", "metabolic_endocrine"],
  ["skin_tags_acrochordons", "Skin Tags (Acrochordons)", "गर्दन के मस्से", "मानेवरील बारीक लोंबणारे चामखीळ", ["मानेवर व काखेत लहान मऊ लोंबणाऱ्या गाठी"], "self_care", "dermatology"],
  ["hyperhidrosis_sweaty_palms", "Primary Palmar Hyperhidrosis", "हथेलियों में अत्यधिक पसीना", "तळहातांना व तळपायांना अति घाम येणे", ["लिहिताना वही ओली होणे, सतत तळहात घामाने ओले"], "self_care", "dermatology"],

  // ENT & Eye (20)
  ["presbyopia_aging_reading_vision", "Presbyopia (Aging Eye Vision)", "उम्र से पास का कम दिखना (चालीसी)", "चाळिशी (जवळचे बारीक अक्षर न दिसणे)", ["४० वयानंतर मोबाईल किंवा वृत्तपत्र वाचताना लांब धरावे लागणे"], "self_care", "ent_ophthalmology"],
  ["myopia_nearsightedness", "Myopia (Nearsightedness)", "निकट दृष्टि दोष", "दूरचे अंधुक दिसणे (मायोपिया / चष्मा)", ["फळ्यावरील किंवा टीव्हीवरील लांबचे अक्षर अस्पष्ट दिसणे"], "self_care", "ent_ophthalmology"],
  ["hypermetropia_farsightedness", "Hypermetropia (Farsightedness)", "दूर दृष्टि दोष", "जवळचे अंधुक दिसणे (हायपरमेट्रोपिया)", ["वाचताना डोके दुखणे व डोळ्यांवर ताण"], "self_care", "ent_ophthalmology"],
  ["astigmatism_cylindrical_power", "Astigmatism (Cylindrical Error)", "धुंधलापन (सिलिंड्रिकल नंबर)", "सिलिंडर नंबर (अक्षरे दुहेरी दिसणे)", ["रात्री गाडी चालवताना दिव्यांचे लांब प्रकाशकिरण दिसणे"], "self_care", "ent_ophthalmology"],
  ["subacute_thyroiditis_neck_pain", "Subacute De Quervain's Thyroiditis", "थायराइड में दर्दनाक सूजन", "थायरॉईड ग्रंथीची वेदनादायी सूज", ["गिळताना गळ्यात पुढील बाजूस तीव्र वेदना व ताप"], "doctor_soon", "metabolic_endocrine"],
  ["non_allergic_vasomotor_rhinitis", "Vasomotor Rhinitis", "तापमान बदलने से नाक बहना", "थंड हवेत किंवा गरम जेवताना नाक गळणे", ["गरम किंवा तिखट खाताना अचानक नाकातून पाणी वाहणे"], "self_care", "ent_ophthalmology"],
  ["adenoid_hypertrophy_child", "Adenoid Hypertrophy in Children", "बच्चों में नाक के पीछे मांस बढ़ना", "लहान मुलांमध्ये ॲडिनॉइड वाढणे (तोंड उघडे ठेवून झोपणे)", ["झोपेत घोरणे, तोंड उघडे ठेवून श्वास घेणे, वारंवार सर्दी"], "doctor_soon", "ent_ophthalmology"],
  ["vocal_cord_paralysis_unilateral", "Unilateral Vocal Cord Paralysis", "एक स्वरतंतु का लकवा", "एका बाजूचा स्वरतंतू निकामी होणे", ["आवाज अतिशय हलका, हवेसारखा (Breathy) व गिळताना ठसका"], "urgent", "ent_ophthalmology"],
  ["sensory_neural_hearing_loss", "Sudden Sensorineural Hearing Loss (SSNHL)", "अचानक कान का बहरापन", "एका कानाने अचानक ऐकू न येणे (आणीबाणी)", ["सकाळी उठल्यावर एका कानाने अचानक पूर्णपणे ऐकू न येणे"], "urgent", "ent_ophthalmology"],
  ["presbycusis_elderly_hearing_loss", "Presbycusis (Age-Related Hearing Loss)", "उम्र के साथ कम सुनना", "वृद्धापकाळातील बहिरेपणा (कमी ऐकू येणे)", ["गर्दीत किंवा टीव्हीचा आवाज स्पष्ट न समजणे"], "self_care", "ent_ophthalmology"],

  // Musculoskeletal & Joint (20)
  ["ankylosing_spondylitis_hla_b27", "Ankylosing Spondylitis (HLA-B27)", "कमर की रीढ़ का कड़ापन (युवाओं में)", "तरुणांमधील मणक्याची ताठरता (HLA-B27)", ["सकाळी पाठीचा कणा प्रचंड ताठ असणे, हालचालीने मोकळा होणे"], "doctor_soon", "musculoskeletal"],
  ["pes_anserine_bursitis_knee", "Pes Anserine Bursitis (Inner Knee Pain)", "घुटने के भीतरी हिस्से में दर्द", "गुडघ्याच्या आतील बाजूस दुखणे", ["गुडघ्याच्या आतील बाजूला २ इंच खाली पायऱ्या चढताना कळ"], "self_care", "musculoskeletal"],
  ["iliotibial_band_syndrome", "Iliotibial Band Syndrome (ITBS)", "जांघ की बाहरी पट्टी का दर्द", "मांड्यांच्या बाहेरील पट्टीत तीव्र वेदना", ["धावताना गुडघ्याच्या बाहेरील बाजूला टोचल्यासारखी कळ"], "self_care", "musculoskeletal"],
  ["hamstring_muscle_strain", "Hamstring Muscle Strain", "जांघ के पीछे की नस खिंचना", "मांडीच्या मागच्या स्नायूचा ताण (हॅमस्ट्रिंग)", ["वेगाने धावताना अचानक मांडीच्या मागे तीक्ष्ण कळ"], "self_care", "musculoskeletal"],
  ["quadriceps_tendonitis_knee", "Quadriceps Tendinitis", "घुटने के ऊपर का दर्द", "गुडघ्याच्या वरच्या भागाची स्नायूदुखी", ["उड्या मारताना गुडघ्याच्या वरच्या कडेला वेदना"], "self_care", "musculoskeletal"],
  ["plantar_corn_mechanical_callus", "Mechanical Plantar Callus", "पैर के तलवे का कड़ापन", "तळपायावरील चरबी कमी झाल्याने घट्टा पडणे", ["टाचेखाली किंवा चोथ्याखाली दगड असल्यासारखे दुखणे"], "self_care", "musculoskeletal"],
  ["cervical_rib_syndrome", "Cervical Rib (Thoracic Outlet)", "गर्दन की अतिरिक्त पसली", "मानेतील अतिरिक्त बरगडीमुळे हात दुखणे", ["हात उंचावल्यावर हातात मुंग्या व नाडी मंदावणे"], "doctor_soon", "musculoskeletal"],
  ["torticollis_wry_neck", "Acute Torticollis (Wry Neck / Akdan)", "गर्दन की मोच / अकड़न", "मानेचा झटका (मान एकाच बाजूला वाकडी होणे)", ["सकाळी उठल्यावर मान अजिबात सरळ न करता येणे"], "self_care", "musculoskeletal"],
  ["costochondritis_tietze_syndrome", "Costochondritis (Tietze Syndrome)", "पसलियों के जोड़ का दर्द", "बरगड्यांच्या सांध्याची सूज (छातीत टोचणे)", ["छातीवर बोटाने दाबल्यावर नेमकी तिथेच तीव्र कळ"], "self_care", "musculoskeletal"],
  ["snapping_hip_syndrome", "Snapping Hip Syndrome (Coxa Saltans)", "कूल्हे में चटकने की आवाज", "कमरेचा सांधा हलताना कटकट आवाज", ["चालताना कमरेच्या हाडातून चटकन आवाज येणे"], "self_care", "musculoskeletal"],

  // GI, Liver, Metabolic (20)
  ["proctitis_radiation_infectious", "Proctitis (Rectal Inflammation)", "गुदा की सूजन व जलन", "गुदद्वाराची अंतर्गत जळजळ (प्रॉक्टायटिस)", ["शौचाची सारखी घाई (Tenesmus), शेम व रक्त"], "doctor_soon", "gastrointestinal"],
  ["sphincter_of_oddi_dysfunction", "Sphincter of Oddi Dysfunction", "पित्त मार्ग की मांसपेशियों में ऐंठन", "पित्तमार्गाच्या स्नायूंचा ताण", ["पित्ताशय काढल्यानंतरही उजव्या कुशीत तीच वेदना"], "doctor_soon", "gastrointestinal"],
  ["dumping_syndrome_post_gastric", "Dumping Syndrome (Post-Gastrectomy)", "खाना खाने के बाद अचानक कमजोरी व दस्त", "जेवणानंतर लगेच घाम फुटणे व जुलाब", ["गोड किंवा जास्त जेवणानंतर १५ मिनिटांत थरकाप व जुलाब"], "self_care", "gastrointestinal"],
  ["short_bowel_syndrome_malabsorption", "Short Bowel Syndrome", "आंत छोटी होने से दस्त", "लहान आतडे लहान झाल्याने अन्नाचे शोषण न होणे", ["वारंवार पाण्यासारखे जुलाब, वजन न वाढणे"], "urgent", "gastrointestinal"],
  ["microscopic_colitis_watery", "Microscopic Colitis", "सूक्ष्म कोलाइटिस", "पाण्यासारखे तीव्र जुलाब (सूक्ष्म कोलायटिस)", ["रात्रीही झोपेतून उठावे लागणारे जुलाब"], "doctor_soon", "gastrointestinal"],
  ["mesenteric_adenitis_child_pain", "Mesenteric Adenitis in Children", "बच्चों में पेट की गांठों में सूजन", "लहान मुलांच्या पोटातील गाठींची सूज", ["सर्दी-खोकल्यानंतर अचानक पोटात उजव्या बाजूला कळ"], "doctor_soon", "pediatric"],
  ["rectocele_pelvic_support_defect", "Rectocele (Posterior Vaginal Prolapse)", "गुदा का योनि की तरफ उभार", "शौचाच्या वेळी बोटाने आधार द्यावा लागणे", ["शौच बाहेर ढकलण्यासाठी अडचण"], "doctor_soon", "womens_maternal"],
  ["cystocele_bladder_prolapse", "Cystocele (Bladder Prolapse)", "मूत्राशय का नीचे खिसकना", "लघवीची पिशवी खाली सरकणे (सिस्टोसीस)", ["योनिमुखाजवळ चेंडूसारखा गोळा जाणवणे, लघवी अडखळणे"], "doctor_soon", "womens_maternal"],
  ["uterine_prolapse_grade_1_2", "Uterine Prolapse (Anga Baher Padne)", "बच्चेदानी का बाहर आना", "गर्भाशय खाली सरकणे (अंग बाहेर पडणे)", ["ओटीपोटात जडपणा, खाली काहीतरी सरकल्याची भावना"], "doctor_soon", "womens_maternal"],
  ["sheehans_syndrome_pituitary", "Sheehan's Syndrome (Postpartum Pituitary)", "प्रसव के बाद दूध न आना व कमजोरी", "बाळंतपणानंतर अतिरक्तस्त्रावामुळे दूध न येणे", ["बाळंतपणानंतर दूध न येणे, पाळी कायमची बंद होणे, थकवा"], "urgent", "womens_maternal"],

  // Mental Health & Lifestyle (20)
  ["burnout_occupational_exhaustion", "Occupational Burnout Syndrome", "काम का अत्यधिक मानसिक तनाव (बर्नआउट)", "कामाचा मानसिक थकवा (बर्नआउट सिंड्रोम)", ["कामाचा प्रचंड कंटाळा, मानसिक शून्यत्व, थकवा"], "self_care", "mental_health"],
  ["dysthymia_persistent_mild_depression", "Persistent Depressive Disorder (Dysthymia)", "धीमा अवसाद (उदासी)", "दीर्घकालीन सौम्य नैराश्य (डिस्थायमिया)", ["२ वर्षांपेक्षा जास्त काळ मनात सतत उदास वाटणे"], "doctor_soon", "mental_health"],
  ["cyclothymic_mood_swings", "Cyclothymic Disorder", "मन का बार-बार बदलना", "मनःस्थितीत वारंवार सौम्य चढ-उतार", ["काही दिवस अतिआनंद तर काही दिवस विनाकारण उदास"], "self_care", "mental_health"],
  ["specific_phobia_heights_blood", "Specific Phobia (Heights/Blood/Animals)", "विशिष्ट चीजों का तीव्र भय (फोबिया)", "विशिष्ट गोष्टींची तीव्र भीती (उंची/रक्त/कुत्रे)", ["उंचीवर किंवा इंजेक्शन पाहिल्यावर थरकाप व भोवळ"], "self_care", "mental_health"],
  ["illness_anxiety_hypochondria", "Illness Anxiety Disorder (Hypochondriasis)", "बीमारी का अत्यधिक वहम", "सारखे गंभीर आजाराचा संशय येणे", ["किरकोळ दुखण्यालाही कॅन्सर किंवा हार्ट अटॅक समजणे"], "doctor_soon", "mental_health"],
  ["anorexia_nervosa_eating", "Anorexia Nervosa", "खाना न खाने की बीमारी", "वजन वाढण्याच्या भीतीने उपाशी राहणे", ["शरीर हाडकुळे असूनही स्वतःला जाड समजणे"], "urgent", "mental_health"],
  ["bulimia_nervosa_binge_purge", "Bulimia Nervosa", "ज्यादा खाकर उल्टी करना", "अति खाऊन नंतर जबरदस्तीने उलटी करणे", ["गुपचूप भरपूर खाणे व नंतर उलटी काढणे"], "urgent", "mental_health"],
  ["nicotine_dependence_tobacco_cessation", "Nicotine Dependence (Gutkha / Bidi)", "तंबाकू व गुटखे की लत", "तंबाखू, गुटखा व विडीचे व्यसन मुक्ती", ["तंबाखू सोडल्यावर हात थरथरणे, चिडचिड, अस्वस्थता"], "self_care", "mental_health"],
  ["alcohol_dependence_syndrome", "Alcohol Dependence Syndrome", "शराब की लत", "दारूचे व्यसन व मुक्ती", ["सकाळी उठल्यावर हात थरथरणे व दारूची गरज"], "doctor_soon", "mental_health"],
  ["mobile_screen_addiction_digital_strain", "Digital Eye Strain & Screen Fatigue", "मोबाइल स्क्रीन की थकान", "मोबाईल स्क्रीनमुळे डोळ्यांचा व मेंदूचा ताण", ["सतत स्क्रीन पाहिल्याने डोळे चुरचुरणे, डोकेदुखी, झोप न लागणे"], "self_care", "mental_health"]
];

const registryConditions = registryList.map(([id, canonical_name, name_hi, name_mr, symptoms, urgency, cat]) => {
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
    general_information: [`${name_mr} हा सामान्य आरोग्य विकार असून योग्य जीवनशैली व मार्गदर्शनाने नियंत्रित होतो.`],
    safe_supportive_care: isCancer || isEmerg ? [] : ["संतुलित आहार व विश्रांती घ्या.", "पाणी भरपूर प्या."],
    things_to_avoid: ["अनावश्यक स्टिरॉइड्स व औषधे टाळा."],
    red_flags: ["तीव्र वेदना", "रक्तस्त्राव", "बेशुद्धी"],
    urgency,
    when_to_visit_doctor: ["लक्षणे दिसल्यास शासकीय प्राथमिक आरोग्य केंद्रात (PHC) संपर्क साधा."],
    appropriate_specialty: ["General Physician", "Medical Officer"],
    facility_type: ["PHC", "Rural Hospital", "District Hospital"]
  });
});

module.exports = registryConditions;
