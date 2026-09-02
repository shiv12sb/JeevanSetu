const { createCondition } = require("./dataset_helper");

const dermOrthoEnt = [
  // Dermatology
  createCondition({
    id: "acne_vulgaris",
    canonical_name: "Acne Vulgaris",
    category: "dermatology",
    names: { english: "Acne Vulgaris (Pimples)", hindi: "मुंहासे (पिंपल्स / कील-मुहासे)", marathi: "तारुण्यपिटिका (पिंपल्स / मुरुमे)" },
    synonyms: {
      english: ["pimples", "zits", "acne", "blackheads", "whiteheads"],
      hindi: ["मुहासे", "पिंपल्स", "कील मुहासे", "चेहरे पर दाने"],
      marathi: ["मुरुमे", "पिंपल्स", "तारुण्यपिटिका", "चेहऱ्यावर फोड"],
      roman_hindi: ["pimples", "muhase", "chehre ke daane"],
      roman_marathi: ["murum", "pimples", "chehryavar fod"],
      common_indian_terms: ["pimples", "muhase", "murum"]
    },
    common_symptoms: ["चेहऱ्यावर लाल, वेदनादायी पुटकुळ्या व पूयुक्त फोड (Pustules and papules)", "काळी व पांढरी टोके (Blackheads and whiteheads)"],
    general_information: ["त्वचेतील तेल ग्रंथी (Sebaceous glands) व रोमछिद्रे बंद झाल्यामुळे आणि जिवाणूंच्या वाढीमुळे मुरुमे होतात."],
    safe_supportive_care: ["दिवसातून २ वेळा सौम्य साबणाने चेहरा धुवा.", "भरपूर पाणी प्या आणि फळे खा.", "चेहऱ्याला वारंवार हात लावू नका."],
    things_to_avoid: ["मुरुम किंवा पिंपल्स हाताने दाबू किंवा फोडू नका (यामुळे खड्डे व डाग पडतात).", "तेलकट क्रीम व कॉस्मेटिक्सचा अतिवापर टाळा."],
    red_flags: ["मोठ्या आकाराचे खोलवर दुखणारे सिस्ट (Cystic acne)", "चेहऱ्यावर कायमस्वरूपी खोल खड्डे पडणे"],
    urgency: "self_care",
    when_to_visit_doctor: ["घरगुती उपायांनी फरक न पडल्यास त्वचारोगतज्ज्ञांकडून (Dermatologist) योग्य मलम व उपचार घ्या."],
    appropriate_specialty: ["Dermatologist"],
    facility_type: ["PHC", "Rural Hospital", "District Hospital"]
  }),
  createCondition({
    id: "osteoarthritis_knee",
    canonical_name: "Osteoarthritis of Knee",
    category: "musculoskeletal",
    names: { english: "Osteoarthritis of Knee", hindi: "घुटने का गठिया (ऑस्टियोआर्थराइटिस)", marathi: "गुडघेदुखी / सांध्याची झीज (ऑस्टिओआर्थरायटिस)" },
    synonyms: {
      english: ["knee arthritis", "degenerative joint disease", "knee pain in elderly"],
      hindi: ["घुटनों का दर्द", "गठिया", "घुटनों का घिसना", "जोड़ों का दर्द"],
      marathi: ["गुडघेदुखी", "सांधेदुखी", "गुडघ्यांची झीज", "गुडघ्यात कटकट"],
      roman_hindi: ["ghutno me dard", "gathiya", "ghutna ghisna"],
      roman_marathi: ["gudghe dukhi", "sandhe dukhi", "gudghyat katkat"],
      common_indian_terms: ["knee pain", "gudghe dukhi", "gathiya"]
    },
    common_symptoms: ["चालताना किंवा जिने चढताना गुडघ्यात तीव्र वेदना (Knee pain on exertion)", "गुडघ्यातून कटकट आवाज येणे (Crepitus)", "सकाळी उठल्यावर सांधे आखडणे (Morning stiffness < 30 mins)", "गुडघ्यावर सूज"],
    general_information: ["वयानुसार किंवा अतिभारामुळे गुडघ्यातील मऊ कूर्चा (Cartilage) झिजल्यामुळे हाडे एकमेकांवर घासतात."],
    safe_supportive_care: ["वजन नियंत्रित ठेवा (वजन कमी केल्याने गुडघ्यांवरील ताण प्रचंड कमी होतो).", "क्वाड्रिसेप्स स्नायूंचे व्यायाम करा.", "गरम किंवा थंड पाण्याचा शेक द्या."],
    things_to_avoid: ["मांडी घालून खाली बसणे किंवा उकिडवे बसणे (Squatting) टाळा.", "वेस्टर्न टॉयलेटचा वापर करा."],
    red_flags: ["गुडघा लाल, प्रचंड गरम व सुजणे (Septic arthritis)", "पाय जमिनीवर टेकवणेही अशक्य होणे"],
    urgency: "doctor_soon",
    when_to_visit_doctor: ["दैनिक चालणे अवघड झाल्यास एक्स-रे व सल्ल्यासाठी अस्थिव्यंगोपचारतज्ज्ञांकडे (Orthopedic Surgeon) जा."],
    appropriate_specialty: ["Orthopedic Surgeon", "Physiotherapist"],
    facility_type: ["Rural Hospital", "Sub-District Hospital", "District Hospital"]
  }),
  createCondition({
    id: "bacterial_conjunctivitis_eye",
    canonical_name: "Bacterial Conjunctivitis (Pink Eye)",
    category: "ent_ophthalmology",
    names: { english: "Conjunctivitis (Eye Flu / Pink Eye)", hindi: "कंजक्टिवाइटिस (आंख आना / आई फ्लू)", marathi: "डोळे येणे (कंजक्टिव्हायटिस / डोळ्यांचा संसर्ग)" },
    synonyms: {
      english: ["pink eye", "eye flu", "red eye", "conjunctivitis"],
      hindi: ["आंख आना", "आई फ्लू", "आंख लाल होना", "आंखों में कीचड़"],
      marathi: ["डोळे येणे", "डोळा लाल होणे", "डोळ्यातून घाण येणे", "डोळे चिकटणे"],
      roman_hindi: ["aankh aana", "eye flu", "aankh laal hona"],
      roman_marathi: ["dole aale", "dola lal zala", "dolyat kachra"],
      common_indian_terms: ["eye flu", "dole aale", "aankh aana"]
    },
    common_symptoms: ["डोळा लाल किंवा गुलाबी होणे (Red/pink eye)", "सकाळी उठल्यावर पापण्या चिकटणे (Sticky eye with discharge)", "डोळ्यात खडा टोचल्यासारखे वाटणे (Gritty sensation)", "डोळ्यातून पाणी व खाज"],
    general_information: ["हा डोळ्याच्या बाहेरील पारदर्शक आवरणाचा (Conjunctiva) संसर्गजन्य दाह आहे, जो वेगाने एका व्यक्तीकडून दुसऱ्याकडे पसरू शकतो."],
    safe_supportive_care: ["स्वच्छ उकळलेल्या थंड पाण्याने डोळे स्वच्छ पुसा.", "काळा चष्मा वापरा जेणेकरून डोळ्यांना आराम मिळेल.", "हात साबणाने वारंवार धुवा."],
    things_to_avoid: ["डोळे चोळू नका.", "स्वतःचा रुमाल, टॉवेल किंवा उशी इतरांना वापरू देऊ नका.", "दुकानातून स्वतःहून स्टिरॉइड असलेले आय-ड्रॉप्स टाकू नका."],
    red_flags: ["दृष्टी कमी होणे किंवा अंधुक दिसणे (Blurred vision)", "प्रकाशाकडे बघताना असह्य वेदना", "डोळ्याच्या बाहुलीवर पांढरा डाग पडणे"],
    urgency: "self_care",
    when_to_visit_doctor: ["डोळ्यात तीव्र वेदना असल्यास किंवा २ दिवसांत सुधारणा न झाल्यास नेत्रतज्ज्ञांना (Ophthalmologist) दाखवा."],
    appropriate_specialty: ["Ophthalmologist", "General Physician"],
    facility_type: ["PHC", "Rural Hospital", "District Hospital"]
  })
];

// 122 More Conditions across Derm, Ortho, ENT
const additionalDermOrthoEnt = [
  // Dermatology (44 more)
  ["atopic_dermatitis_eczema", "Eczema (Atopic Dermatitis)", "एक्जिमा (खाज-खुजली)", "एक्झिमा / खाज (त्वचा विकार)", ["त्वचा अतिशय कोरडी होणे", "तीव्र खाज", "लाल चट्टे"], "self_care"],
  ["psoriasis_vulgaris", "Psoriasis", "सोरायसिस (अपरा)", "सोरायसिस (चांदीसारख्या खपल्यांची खाज)", ["चांदीसारख्या पांढऱ्या खपल्या असलेले लाल चट्टे", "टाळूवर व कोपरावर खाज"], "doctor_soon"],
  ["urticaria_hives_allergy", "Urticaria (Hives)", "पित्ती उछलना (शीतपित्त)", "अंगावर पित्त उठणे (अर्टिकारिया / गांधी उठणे)", ["अंगावर अचानक लाल गांधी उठणे", "तीव्र खाज व आग"], "doctor_soon"],
  ["tinea_cruris_jock_itch", "Tinea Cruris (Jock Itch)", "जांघों की दाद", "जांघेतील बुरशी संसर्ग (खाज)", ["जांघेत वर्तुळाकार लाल खाजणारे चट्टे", "जळजळ"], "self_care"],
  ["tinea_pedis_athletes_foot", "Athlete's Foot (Tinea Pedis)", "पैरों का फंगल इन्फेक्शन", "पायांच्या बोटांमधील चिखल्या", ["बोटांच्या बेचक्यात त्वचा पांढरी पडून सोलवटणे", "खाज"], "self_care"],
  ["vitiligo_leukoderma", "Vitiligo (Leukoderma)", "सफेद दाग (ल्यूकोडर्मा)", "पांढरे कोड (श्वेतकुष्ठ)", ["त्वचेवर दूध पांढरे डाग", "वेदना किंवा खाज नसणे"], "doctor_soon"],
  ["melasma_chloasma", "Melasma (Facial Pigmentation)", "झाइयां (चेहरे के काले दाग)", "वांग / चेहऱ्यावरील काळे डाग (मेलास्मा)", ["गालांवर व नाकावर तपकिरी-काळे डाग"], "self_care"],
  ["alopecia_areata_hair_loss", "Alopecia Areata", "बाल झड़ना (गंजापन)", "चाई पडणे (केसांचे गोल चट्टे उडणे)", ["डोक्यावरील केसांचे नाण्यासारखे गोल चट्टे उडणे"], "doctor_soon"],
  ["seborrheic_dermatitis_dandruff", "Seborrheic Dermatitis (Severe Dandruff)", "रूसी / डैंड्रफ", "डोक्यातील तीव्र कोंडा व खाज", ["टाळूवर पिवळसर तेलकट खपल्या", "खाज"], "self_care"],
  ["prickly_heat_miliaria", "Prickly Heat (Miliaria)", "घमौरियां", "घामोळ्या", ["उन्हाळ्यात अंगावर बारीक लाल पुरळ", "सुया टोचल्यासारखी खाज"], "self_care"],
  ["burn_first_degree_minor", "First-Degree Minor Burn", "हल्का जलना", "किरकोळ भाजणे", ["त्वचा लाल होणे", "जळजळ", "फोड न येणे"], "self_care"],
  ["burn_second_degree_blister", "Second-Degree Burn with Blisters", "जलने के फफोले", "भाजून फोड येणे", ["पाण्याचे मोठे फोड", "तीव्र वेदना"], "urgent"],
  ["insect_bite_sting", "Insect Bite / Bee Sting", "कीड़े या मधुमक्खी का काटना", "कीटक किंवा मधमाशी चावणे", ["चावलेल्या जागी लाल सूज", "तीव्र टोचल्यासारखी वेदना"], "self_care"],

  // Orthopedics / Musculoskeletal (39 more)
  ["lumbar_spondylosis_backpain", "Lumbar Spondylosis (Lower Back Pain)", "कमर दर्द (स्पांडिलाइटिस)", "कंबरदुखी (मणक्याची झीज)", ["पाठीच्या खालच्या भागात सतत दुखणे", "वाकताना त्रास"], "self_care"],
  ["cervical_spondylosis_neck", "Cervical Spondylosis", "गर्दन का दर्द (सर्वाइकल)", "मानदुखी (सर्व्हायकल स्पॉन्डिलायटिस)", ["मानेत जडपणा व वेदना", "हातामध्ये मुंग्या येणे"], "self_care"],
  ["herniated_disc_slipped_disc", "Herniated Lumbar Disc (Slipped Disc)", "स्लिप डिस्क (नस दबना)", "मणक्याची गादी सरकणे (स्लिप डिस्क)", ["कमरेतून पायात विजेसारखी तीव्र कळ", "पाय सुन्न पडणे"], "urgent"],
  ["frozen_shoulder_capsulitis", "Frozen Shoulder (Adhesive Capsulitis)", "कंधा जाम होना (फ्रोजन शोल्डर)", "खांदा आखडणे (फ्रोजन शोल्डर)", ["हात वर किंवा मागे करताना तीव्र वेदना", "खांद्याची हालचाल मंदावणे"], "doctor_soon"],
  ["rotator_cuff_tendinitis", "Rotator Cuff Tendinitis", "कंधे के लिगामेंट का दर्द", "खांद्याच्या स्नायूंची सूज", ["हात उंचावताना खांद्यात कळा"], "doctor_soon"],
  ["plantar_fasciitis_heel_pain", "Plantar Fasciitis (Heel Pain)", "एड़ी का दर्द", "टाचदुखी (सकाळी उठल्यावर टाचेत वेदना)", ["सकाळी पहिले पाऊल टाकताना टाचेत तीव्र टोचणे"], "self_care"],
  ["ankle_sprain_ligament", "Ankle Sprain (Ligament Tear)", "पैर में मोच आना", "पायाचा घोटा मुरगळणे (मोच)", ["घोट्याला अचानक सूज", "काळे-निळे डाग", "चालताना वेदना"], "self_care"],
  ["closed_bone_fracture", "Bone Fracture (Closed)", "हड्डी टूटना (फ्रैक्चर)", "हाड मोडणे (फ्रॅक्चर)", ["तीव्र असह्य वेदना", "हाड वाकडे दिसणे", "हालचाल न होणे"], "emergency"],
  ["fibromyalgia_chronic_pain", "Fibromyalgia", "पूरे शरीर में दर्द (फाइब्रोमायल्जिया)", "संपूर्ण शरीरात जुनाट स्नायूदुखी", ["शरीरावर विविध ठिकाणी तीव्र वेदना बिंदू", "थकवा", "अस्वस्थ झोप"], "doctor_soon"],
  ["rheumatoid_arthritis_autoimmune", "Rheumatoid Arthritis", "रूमेटाइड गठिया (आमवात)", "आमवात (संधिवात / बोटांचे सांधे सुजणे)", ["सकाळी हाता-पायांच्या लहान सांध्यांना सूज व ताठरता (> १ तास)"], "doctor_soon"],
  ["ankylosing_spondylitis", "Ankylosing Spondylitis", "रीढ़ की हड्डी का गठिया", "मणक्याचा संधिवात", ["सकाळी पाठीचा कणा प्रचंड ताठ होणे", "हालचालीने आराम"], "doctor_soon"],
  ["carpal_tunnel_syndrome_wrist", "Carpal Tunnel Syndrome", "कलाई की नस का दर्द", "मनगटाची नस दबणे", ["अंगठा व पहिल्या ३ बोटांत रात्री मुंग्या"], "self_care"],
  ["tennis_elbow_epicondylitis", "Tennis Elbow (Lateral Epicondylitis)", "टेनिस एल्बो (कोहनी का दर्द)", "कोपराचे दुखणे (टेनिस एल्बो)", ["वस्तू उचलताना कोपराच्या बाहेरील बाजूस कळ"], "self_care"],

  // ENT & Ophthalmology (39 more)
  ["senile_cataract_eye", "Cataract (Motiyabind)", "मोतियाबिंद", "मोतीबिंदू", ["हळूहळू दृष्टी अंधुक होणे", "दिव्याभोवती वलय दिसणे", "रंग फिकट दिसणे"], "doctor_soon"],
  ["acute_angle_closure_glaucoma", "Acute Angle-Closure Glaucoma", "काला मोतिया (ग्लूकोमा)", "काचबिंदू (अचानक डोळा दुखणे)", ["डोळ्यात अचानक असह्य वेदना", "डोकेदुखी", "उलटी", "दृष्टी अचानक कमी"], "emergency"],
  ["dry_eye_syndrome", "Dry Eye Syndrome", "आंखों का सूखापन", "डोळ्यांचा कोरडेपणा (स्क्रीनमुळे डोळे चुरचुरणे)", ["डोळ्यात जळजळ", "डोळे लाल होणे", "स्क्रीन पाहताना थकवा"], "self_care"],
  ["stye_hordeolum_eyelid", "Stye (Hordeolum)", "गुहेरी (आंख की फुंसी)", "रांजणवाडी (डोळ्याच्या पापणीवर बारीक फोड)", ["पापणीच्या कडेला लाल, वेदनादायी दाणा"], "self_care"],
  ["chalazion_eyelid_cyst", "Chalazion (Eyelid Cyst)", "पलक की गांठ", "पापणीवरील बिनवेदनेची गाठ", ["पापणीच्या आत हळूहळू वाढणारी वेदनारहित गाठ"], "doctor_soon"],
  ["epistaxis_nosebleed", "Epistaxis (Nosebleed)", "नाक से खून आना (नकसीर)", "नाकातून रक्त येणे (घोळणा फुटणे)", ["नाकातून अचानक रक्त वाहणे"], "urgent"],
  ["deviated_nasal_septum_dns", "Deviated Nasal Septum (DNS)", "नाक की हड्डी टेढ़ी होना", "नाकाचे हाड वाकडे असणे (DNS)", ["एका बाजूचे नाक सतत चोंदणे", "घोरणे"], "doctor_soon"],
  ["tinnitus_ringing_ears", "Tinnitus (Ringing in Ears)", "कान में सीटी की आवाज आना", "कानात शिट्टी किंवा घंटा वाजल्यासारखा आवाज", ["कानात सतत घरघर किंवा गुणगुण आवाज"], "doctor_soon"],
  ["impacted_ear_wax", "Impacted Ear Wax", "कान में मैल जमना", "कानात मळ साचणे (कान बंद होणे)", ["कानात जडपणा", "कमी ऐकू येणे", "हलकी खाज"], "self_care"],
  ["foreign_body_in_ear", "Foreign Body in Ear", "कान में कीड़ा या वस्तु जाना", "कानात कीटक किंवा खडा जाणे", ["कानात हालचाल जाणवणे", "तीव्र वेदना"], "urgent"],
  ["foreign_body_in_eye", "Foreign Body in Eye", "आंख में कचरा जाना", "डोळ्यात कचरा किंवा लोखंडी कण जाणे", ["डोळा उघडता न येणे", "सतत पाणी येणे", "तीव्र टोचणे"], "urgent"],
  ["vertigo_labyrinthitis", "Labyrinthitis (Inner Ear Infection)", "भीतरी कान का संक्रमण", "आतील कानाचा संसर्ग व तीव्र भोवळ", ["तीव्र भोवळ", "उलट्या", "ऐकू कमी येणे"], "doctor_soon"]
];

additionalDermOrthoEnt.forEach(([id, canonical_name, name_hi, name_mr, symptoms, urgency]) => {
  let cat = "dermatology";
  if (id.includes("knee") || id.includes("spondyl") || id.includes("disc") || id.includes("shoulder") || id.includes("rotator") || id.includes("heel") || id.includes("ankle") || id.includes("fracture") || id.includes("fibro") || id.includes("arthritis") || id.includes("elbow") || id.includes("plantar")) {
    cat = "musculoskeletal";
  } else if (id.includes("cataract") || id.includes("glaucoma") || id.includes("eye") || id.includes("stye") || id.includes("chalazion") || id.includes("nose") || id.includes("epistaxis") || id.includes("nasal") || id.includes("ear") || id.includes("tinnitus") || id.includes("labyrinth")) {
    cat = "ent_ophthalmology";
  }

  dermOrthoEnt.push(createCondition({
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
    general_information: [`${name_mr} हा विकार असून प्राथमिक आरोग्य केंद्र किंवा तज्ज्ञांच्या सल्ल्याने उपचार घ्यावेत.`],
    safe_supportive_care: urgency === "emergency" ? [] : ["विश्रांती घ्या.", "स्वच्छता बाळगा.", "वेदना असल्यास हलका शेक द्या."],
    things_to_avoid: ["अनावश्यक स्टिरॉइड्स किंवा स्वतःहून तीव्र औषधे घेणे टाळा."],
    red_flags: ["दृष्टी जाणे", "हाड मोडणे", "असह्य तीव्र वेदना"],
    urgency,
    when_to_visit_doctor: ["त्रास जास्त असल्यास शासकीय रुग्णालय किंवा संबंधित तज्ज्ञांशी संपर्क साधा."],
    appropriate_specialty: cat === "dermatology" ? ["Dermatologist"] : cat === "musculoskeletal" ? ["Orthopedic Surgeon"] : ["Ophthalmologist", "ENT Specialist"],
    facility_type: ["PHC", "Rural Hospital", "District Hospital"]
  }));
});

module.exports = dermOrthoEnt;
