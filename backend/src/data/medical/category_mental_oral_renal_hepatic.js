const { createCondition } = require("./dataset_helper");

const mentalOralRenalHepatic = [
  // Mental Health
  createCondition({
    id: "generalized_anxiety_disorder",
    canonical_name: "Generalized Anxiety Disorder",
    category: "mental_health",
    names: { english: "Generalized Anxiety Disorder", hindi: "चिंता विकार (एंग्जायटी / घबराहट)", marathi: "चिंता विकार (ॲन्झायटी / अस्वस्थता)" },
    synonyms: {
      english: ["anxiety", "nervousness", "panic", "excessive worrying"],
      hindi: ["चिंता", "घबराहट", "बेचैनी", "दिल की धड़कन तेज होना"],
      marathi: ["चिंता", "घाबरल्यासारखे वाटणे", "छातीत धडधडणे", "अस्वस्थता"],
      roman_hindi: ["anxiety", "ghabrahat", "bechaini", "dar lagna"],
      roman_marathi: ["anxiety", "ghabrayla hotay", "chhatit dhad dhad"],
      common_indian_terms: ["anxiety", "ghabrahat", "tension"]
    },
    common_symptoms: ["विनाकारण सतत अस्वस्थ वाटणे व काळजी वाटणे (Excessive persistent worry)", "छातीत धडधड (Palpitations)", "हात-पाय थरथरणे किंवा घाम सुटणे", "झोप न लागणे"],
    general_information: ["हा मानसिक आरोग्याशी संबंधित विकार असून समुपदेशन (Counselling) व जीवनशैलीतील बदलांनी पूर्ण नियंत्रणात येतो."],
    safe_supportive_care: ["दीर्घ श्वसन (Deep breathing) व प्राणायाम करा.", "नियमित व्यायाम व ७-८ तास पुरेशी झोप घ्या.", "जवळच्या विश्वासू व्यक्तीशी मनमोकळे बोला."],
    things_to_avoid: ["चहा, कॉफी, तंबाखू व मद्यपान टाळा (याने घबराहट वाढते).", "एकटे राहणे टाळा."],
    red_flags: ["स्वतःला इजा करण्याचे किंवा आत्महत्येचे विचार येणे (Suicide risk)"],
    urgency: "doctor_soon",
    when_to_visit_doctor: ["दैनिक जीवनावर परिणाम होत असल्यास मानसोपचारतज्ज्ञ (Psychiatrist) किंवा टेली-मानस (Tele-MANAS १४४१६) शी संपर्क साधा."],
    appropriate_specialty: ["Psychiatrist", "Clinical Psychologist"],
    facility_type: ["District Hospital", "Tele-MANAS 14416", "Medical College"]
  }),
  createCondition({
    id: "suicidal_crisis_emergency",
    canonical_name: "Severe Mental Health Crisis (Suicidal Ideation)",
    category: "mental_health",
    names: { english: "Mental Health Crisis / Suicide Risk", hindi: "मानसिक स्वास्थ्य आपातकाल (आत्महत्या जोखिम)", marathi: "मानसिक आरोग्य आणीबाणी (आत्महत्या विचार / टोकाचे पाऊल)" },
    synonyms: {
      english: ["suicide thoughts", "self harm", "mental crisis", "tele manas"],
      hindi: ["आत्महत्या का विचार", "खुद को नुकसान", "टेली मानस"],
      marathi: ["आत्महत्येचे विचार", "टोकाचे पाऊल", "मानसिक संकट"],
      roman_hindi: ["marne ka man karna", "suicide", "tele manas 14416"],
      roman_marathi: ["maraycha vichar", "jagne nako vatne", "14416"],
      common_indian_terms: ["suicide helpline", "14416", "tele-manas", "kiran"]
    },
    common_symptoms: ["स्वतःचे जीवन संपवण्याचे किंवा टोकाचे पाऊल उचलण्याचे तीव्र विचार", "प्रचंड निराशा व एकटेपणा"],
    general_information: ["आपण एकटे नाही आहात! भारत सरकार व महाराष्ट्र शासनाची २४x७ मोफत मानसिक आरोग्य हेल्पलाइन १४४१६ (Tele-MANAS) सदैव मदतीसाठी उपलब्ध आहे."],
    safe_supportive_care: ["त्वरित राष्ट्रीय मानसिक आरोग्य हेल्पलाइन १४४१६ (Tele-MANAS) वर मोफत कॉल करा.", "कुटुंब किंवा जवळच्या मित्रांशी त्वरित संपर्क साधा."],
    things_to_avoid: ["एकटे राहू नका."],
    red_flags: ["स्वतःला इजा करण्याचा त्वरित धोका"],
    urgency: "emergency",
    when_to_visit_doctor: ["तातडीने शासकीय रुग्णालयातील मानसोपचार विभाग किंवा १०८ / १४४१६ वर संपर्क साधा."],
    appropriate_specialty: ["Psychiatrist", "Crisis Counselor"],
    facility_type: ["Tele-MANAS 14416", "District Hospital", "Emergency Casualty 108"]
  }),

  // Oral & Dental
  createCondition({
    id: "dental_caries_pulpitis",
    canonical_name: "Dental Caries & Pulpitis (Toothache)",
    category: "oral_dental",
    names: { english: "Dental Caries & Pulpitis (Toothache)", hindi: "दांत दर्द / कीड़ा लगना (कैविटी)", marathi: "दातदुखी / दात किडणे (कॅव्हिटी)" },
    synonyms: {
      english: ["toothache", "cavity", "dental caries", "pulpitis"],
      hindi: ["दांत में कीड़ा", "दांत दर्द", "दांत में गड्ढा", "दांत में सड़न"],
      marathi: ["दात किडणे", "दात दुखणे", "दाढेत ठसठस", "कॅव्हिटी"],
      roman_hindi: ["daant dard", "daant me keeda", "thanda garam lagna"],
      roman_marathi: ["dat dukhtay", "dadhet kal", "thanda lagtay"],
      common_indian_terms: ["daant dard", "dat dukhi", "cavity"]
    },
    common_symptoms: ["गोड, थंड किंवा गरम खाल्ल्यावर दातात तीव्र कळ (Sensitivity to hot/cold)", "रात्री झोपताना दाढेत ठसठसणारी वेदना (Throbbing toothache)", "दातामध्ये काळा खड्डा दिसणे"],
    general_information: ["अन्नाचे कण साचून जिवाणूंनी दातात आम्ल तयार केल्यामुळे दात किडतो व नसेपर्यंत संसर्ग पोहोचतो."],
    safe_supportive_care: ["कोमट पाण्यात मीठ टाकून गुळण्या करा.", "लवंगाचे तेल (Clove oil) कापसाच्या बोळ्याने दुखऱ्या दातावर ठेवा."],
    things_to_avoid: ["अति गोड व चिकट पदार्थ खाणे टाळा.", "दातावर थेट ॲस्पिरिनची गोळी ठेवू नका (हिरडी जळू शकते)."],
    red_flags: ["गालावर किंवा जबड्याला मोठी सूज येणे (Dental abscess)", "ताप येणे व तोंड उघडता न येणे"],
    urgency: "doctor_soon",
    when_to_visit_doctor: ["रूट कॅनॉल (RCT) किंवा फिलिंगसाठी शासकीय दंत महाविद्यालयात किंवा दंतवैद्यांकडे (Dentist) जा."],
    appropriate_specialty: ["Dentist", "Endodontist"],
    facility_type: ["PHC Dental Clinic", "District Hospital", "Govt Dental College"]
  }),

  // Renal & Urological
  createCondition({
    id: "nephrolithiasis_kidney_stones",
    canonical_name: "Kidney Stones (Renal Calculi)",
    category: "renal_urological",
    names: { english: "Kidney Stones (Renal Calculi)", hindi: "गुर्दे की पथरी (किडनी स्टोन)", marathi: "मुतखडा (किडनी स्टोन / मूत्रखडा)" },
    synonyms: {
      english: ["kidney stone", "renal calculi", "ureteric colic", "nephrolithiasis"],
      hindi: ["गुर्दे की पथरी", "किडनी स्टोन", "पथरी का दर्द"],
      marathi: ["मुतखडा", "किडनी स्टोन", "मूतखडा", "कमरेत कळ"],
      roman_hindi: ["kidney stone", "pathri", "kamar me tez dard"],
      roman_marathi: ["mutkhada", "kidney stone", "kamret kal"],
      common_indian_terms: ["pathri", "mutkhada", "kidney stone"]
    },
    common_symptoms: ["पाठीच्या एका बाजूला कुशीत अचानक सुरू होऊन जांघेकडे जाणारी तीव्र असह्य कळ (Flank to groin radiating pain)", "लघवीतून लालसर रक्त येणे (Hematuria)", "लघवी करताना तीव्र जळजळ", "उलट्या व मळमळ"],
    general_information: ["मूत्रातील क्षार व खनिजे घट्ट होऊन खड्याचे रूप घेतात, ज्यामुळे मूत्रमार्गात अडथळा निर्माण होतो."],
    safe_supportive_care: ["दररोज किमान ३ ते ४ लिटर स्वच्छ पाणी किंवा नारळ पाणी प्या.", "वेदना असल्यास विश्रांती घ्या."],
    things_to_avoid: ["अति मीठ, पालक, टोमॅटोचे बी, मांसाहार व कोल्ड्रिंक्सचे अतिसेवन टाळा."],
    red_flags: ["लघवी पूर्णपणे बंद होणे (Anuria)", "थंडी वाजून तीव्र ताप येणे (संक्रमण)"],
    urgency: "urgent",
    when_to_visit_doctor: ["तीव्र कळ आल्यास सोनोग्राफी (USG KUB) व तपासणीसाठी नजीकच्या रुग्णालयात जा."],
    appropriate_specialty: ["Urologist", "Nephrologist", "General Surgeon"],
    facility_type: ["Rural Hospital", "Sub-District Hospital", "District Hospital"]
  }),

  // Hepatic & Biliary
  createCondition({
    id: "acute_viral_hepatitis_jaundice",
    canonical_name: "Viral Hepatitis & Jaundice (Piliya)",
    category: "hepatic_biliary",
    names: { english: "Viral Hepatitis & Jaundice", hindi: "पीलिया (हेपेटाइटिस / जॉन्डिस)", marathi: "कावीळ (हेपॅटायटिस / जॉन्डिस)" },
    synonyms: {
      english: ["jaundice", "hepatitis A", "hepatitis B", "liver infection"],
      hindi: ["पीलिया", "हेपेटाइटिस", "जॉन्डिस", "आंखें पीली होना"],
      marathi: ["कावीळ", "जॉन्डिस", "डोळे पिवळे होणे", "पिवळी लघवी"],
      roman_hindi: ["piliya", "jaundice", "hepatitis", "aankh peeli"],
      roman_marathi: ["kavil", "jaundice", "dole pivle", "laghvi pivli"],
      common_indian_terms: ["kavil", "piliya", "jaundice"]
    },
    common_symptoms: ["डोळे व त्वचा पिवळी दिसणे (Yellow sclera and skin)", "गडद पिवळ्या रंगाची लघवी (Dark urine)", "भूक पूर्णपणे मंदावणे (Loss of appetite)", "अतिशय अशक्तपणा व मळमळ"],
    general_information: ["दूषित पाणी व अन्नामुळे यकृताला (Liver) संसर्ग झाल्यामुळे रक्तातील बिलीरुबिनचे प्रमाण वाढते व कावीळ होते."],
    safe_supportive_care: ["उकळून थंड केलेले पाणीच प्या.", "हलका, तेलविरहित, गोड व कर्बोदके असलेला आहार (उदा. उसाचा ताजा स्वच्छ रस, फळे, लापशी) घ्या.", "पूर्ण विश्रांती घ्या."],
    things_to_avoid: ["तळलेले, मसालेदार व मांसाहारी पदार्थ पूर्णपणे बंद करा.", "मद्यपान (दारू) व डॉक्टरांच्या सल्ल्याशिवाय अघोरी झाडपाल्याचे उपचार टाळा."],
    red_flags: ["रुग्ण गोंधळणे किंवा अतिशय झोपेत राहणे (Hepatic encephalopathy)", "उलटीतून रक्त पडणे", "पोटात पाणी भरणे (Ascites)"],
    urgency: "urgent",
    when_to_visit_doctor: ["काविळीची लक्षणे दिसताच शासकीय प्राथमिक आरोग्य केंद्रात (PHC) लिव्हर फंक्शन टेस्ट (LFT) करून घ्या."],
    appropriate_specialty: ["Gastroenterologist", "Hepatologist", "General Physician"],
    facility_type: ["PHC", "Rural Hospital", "District Hospital"]
  })
];

// 100 More Conditions across Mental, Oral, Renal, Hepatic
const additionalMentalOralRenalHep = [
  // Mental Health (23 more)
  ["panic_disorder_acute", "Panic Attack", "पैनिक अटैक", "पॅनिक अटॅक (अचानक भीतीचा झटका)", ["अचानक छातीत धडधड", "श्वास रोखल्यासारखे वाटणे", "मृत्यूची भीती"], "urgent"],
  ["major_depressive_disorder", "Major Depression", "गंभीर अवसाद (डिप्रेशन)", "तीव्र नैराश्य (डिप्रेशन)", ["कोणत्याही गोष्टीत रस न वाटणे", "सतत उदासी", "झोप व भूक नसणे"], "doctor_soon"],
  ["chronic_insomnia_sleep", "Chronic Insomnia", "अनिद्रा (नींद न आना)", "निद्रानाश (झोप न येणे)", ["रात्री झोप न लागणे", "सकाळी थकवा", "चिडचिड"], "self_care"],
  ["post_traumatic_stress_ptsd", "PTSD", "पोस्ट ट्रॉमेटिक स्ट्रेस", "आघातानंतरचा मानसिक ताण (PTSD)", ["जुनाट अपघाताची भीती वारंवार आठवणे", "धडधड"], "doctor_soon"],
  ["bipolar_mood_disorder", "Bipolar Disorder", "बाइपोलर डिसऑर्डर", "द्विध्रुवीय मनःस्थिती विकार", ["कधी अतिउत्साह तर कधी तीव्र नैराश्य"], "doctor_soon"],
  ["obsessive_compulsive_disorder", "OCD", "ओसीडी (वहमी बीमारी)", "सतत हात धुणे किंवा संशय विकार (OCD)", ["वारंवार हात धुणे", "वारंवार कुलूप तपासणे"], "doctor_soon"],

  // Oral & Dental (24 more)
  ["gingivitis_gum_inflammation", "Gingivitis (Gum Inflammation)", "मसूड़ों की सूजन", "हिरड्यांची सूज व रक्त येणे", ["ब्रश करताना हिरड्यांतून रक्त", "हिरड्या लाल होणे"], "self_care"],
  ["periodontitis_pyorrhea", "Periodontitis (Pyorrhea)", "पायरिया (दांतों से मवाद)", "पायरिया (हिरड्यांमधून पू येणे)", ["दातांमधून पू येणे", "तोंडातून दुर्गंध", "दात हलणे"], "doctor_soon"],
  ["aphthous_ulcer_mouth", "Aphthous Ulcers (Mouth Sores)", "मुंह के छाले", "तोंडातील फोड / चट्टे (तोंड येणे)", ["गालाच्या आत पांढरे वेदनादायी फोड", "तिखट खाताना आग"], "self_care"],
  ["oral_submucous_fibrosis_osf", "Oral Submucous Fibrosis (OSF)", "मुंह कम खुलना (ओबीएमएफ)", "तोंड कमी उघडणे (सुपारी-गुटखा विकार)", ["गुटखा खाल्ल्यामुळे तोंड पूर्ण न उघडणे", "तिखट सहन न होणे"], "urgent"],
  ["leukoplakia_oral_patch", "Oral Leukoplakia", "मुंह में सफेद पैच", "तोंडातील न निघणारा पांढरा डाग", ["गालावर किंवा जिभेवर पांढरा जाड थर"], "urgent"],
  ["dental_abscess_facial_swelling", "Dental Abscess", "दांत का मवाद / फोड़ा", "दातातील पू व गालाला सूज", ["गालाला मोठी सूज", "तीव्र ठसठस", "ताप"], "urgent"],

  // Renal & Urological (28 more)
  ["acute_pyelonephritis_kidney", "Acute Pyelonephritis", "गुर्दे का संक्रमण", "मूत्रपिंडाचा तीव्र जंतू संसर्ग", ["पाठीत कुशीत तीव्र वेदना", "थंडी वाजून तीव्र ताप", "उलट्या"], "urgent"],
  ["benign_prostatic_hyperplasia_bph", "Benign Prostatic Hyperplasia (BPH)", "गदूद बढ़ना (प्रोस्टेट)", "प्रोस्टेट ग्रंथीची वाढ (BPH)", ["रात्री वारंवार लघवी", "लघवीची धार बारीक होणे", "जोर लावावा लागणे"], "doctor_soon"],
  ["chronic_kidney_disease_ckd", "Chronic Kidney Disease (CKD)", "क्रोनिक किडनी डिजीज (किडनी खराबी)", "जुनाट मूत्रपिंड विकार (किडनी फेल्युअर)", ["पायांवर व चेहऱ्यावर सूज", "रक्तक्षय", "लघवीचे प्रमाण कमी"], "urgent"],
  ["urinary_incontinence_elderly", "Urinary Incontinence", "पेशाब न रोक पाना", "लघवीवर नियंत्रण न राहणे", ["खोकताना किंवा शिंकताना नकळत लघवी गळणे"], "self_care"],
  ["painless_gross_hematuria", "Gross Hematuria (Blood in Urine)", "पेशाब में खून आना", "लघवीतून थेट लाल रक्त येणे", ["वेदनेशिवाय लघवी लाल होणे"], "urgent"],
  ["acute_kidney_injury_aki", "Acute Kidney Injury", "अचानक किडनी काम न करना", "मूत्रपिंड अचानक बंद पडणे (AKI)", ["लघवी पूर्णपणे बंद होणे", "धाप लागणे", "उलट्या"], "emergency"],

  // Hepatic & Biliary (24 more)
  ["non_alcoholic_fatty_liver_nafld", "Fatty Liver Disease (NAFLD)", "फैटी लिवर", "यकृतावर चरबी साचणे (फॅटी लिव्हर)", ["पोटाच्या उजव्या वरच्या भागात जडपणा", "थकवा"], "self_care"],
  ["alcoholic_liver_disease", "Alcoholic Liver Disease", "शराब से लिवर खराबी", "अल्कोहोलमुळे यकृताचे नुकसान", ["भूक न लागणे", "वजन कमी", "कावीळ"], "doctor_soon"],
  ["liver_cirrhosis_portal_htn", "Liver Cirrhosis", "लिवर सिरोसिस", "यकृत निकामी होणे (लिव्हर सिरॉसिस)", ["पोटात पाणी भरणे (जलोदर)", "रक्ताची उलटी", "पायांवर सूज"], "urgent"],
  ["hepatic_encephalopathy", "Hepatic Encephalopathy", "लिवर के कारण बेहोशी", "यकृताच्या विकारामुळे मेंदूवर परिणाम", ["गोंधळलेली अवस्था", "हात थरथरणे", "बेशुद्धी"], "emergency"],
  ["hepatitis_b_chronic", "Chronic Hepatitis B", "हेपेटाइटिस बी", "हेपॅटायटिस-बी संसर्ग", ["दीर्घकाळ थकवा", "यकृताला सूज"], "urgent"],
  ["hepatitis_c_infection", "Hepatitis C", "हेपेटाइटिस सी", "हेपॅटायटिस-सी संसर्ग", ["रक्त तपासणीत आढळणारा विषाणू संसर्ग"], "urgent"]
];

additionalMentalOralRenalHep.forEach(([id, canonical_name, name_hi, name_mr, symptoms, urgency]) => {
  let cat = "mental_health";
  if (id.includes("dental") || id.includes("gingiv") || id.includes("periodont") || id.includes("ulcer") || id.includes("oral") || id.includes("leuko")) {
    cat = "oral_dental";
  } else if (id.includes("kidney") || id.includes("prostat") || id.includes("urinar") || id.includes("hematuria") || id.includes("pyelo") || id.includes("stone")) {
    cat = "renal_urological";
  } else if (id.includes("liver") || id.includes("hepat") || id.includes("jaundice") || id.includes("cirrhosis") || id.includes("fatty")) {
    cat = "hepatic_biliary";
  }

  mentalOralRenalHepatic.push(createCondition({
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
    general_information: [`${name_mr} हा विकार असून योग्य शासकीय केंद्रात तपासणी व उपचार आवश्यक आहेत.`],
    safe_supportive_care: urgency === "emergency" ? [] : ["संतुलित आहार व विश्रांती घ्या.", "पाणी स्वच्छ प्या."],
    things_to_avoid: ["मद्यपान, तंबाखू व अघोरी उपाय टाळा."],
    red_flags: ["रक्ताची उलटी", "लघवी बंद होणे", "बेशुद्ध पडणे", "आत्महत्येचा धोका"],
    urgency,
    when_to_visit_doctor: ["लक्षणे दिसल्यास शासकीय रुग्णालयात वैद्यकीय सल्ला घ्या."],
    appropriate_specialty: cat === "mental_health" ? ["Psychiatrist"] : cat === "oral_dental" ? ["Dentist"] : cat === "renal_urological" ? ["Urologist", "Nephrologist"] : ["Hepatologist", "Gastroenterologist"],
    facility_type: ["PHC", "Rural Hospital", "District Hospital", "GMC"]
  }));
});

module.exports = mentalOralRenalHepatic;
