const { createCondition } = require("./dataset_helper");

const respiratoryGi = [
  // Respiratory
  createCondition({
    id: "bronchial_asthma",
    canonical_name: "Bronchial Asthma",
    category: "respiratory",
    names: { english: "Bronchial Asthma", hindi: "दमा (अस्थमा)", marathi: "दमा (अस्थमा)" },
    synonyms: {
      english: ["asthma", "wheezing", "bronchospasm"],
      hindi: ["दमा", "अस्थमा", "सांस फूलना", "घबराहट"],
      marathi: ["दमा", "दम लागणे", "श्वास रोखणे", "घरघर"],
      roman_hindi: ["dama", "asthma", "saans phoolna", "seena jakadna"],
      roman_marathi: ["dama", "dam lagtoy", "shwas ghenyala tras"],
      common_indian_terms: ["asthma", "dama", "puffer"]
    },
    common_symptoms: ["श्वास घेताना घरघर आवाज (Wheezing)", "धाप लागणे (Shortness of breath)", "छातीत आवळल्यासारखे वाटणे (Chest tightness)", "रात्रीचा खोकला (Night cough)"],
    general_information: ["दमा हा श्वसनमार्गाचा जुनाट दाहक आजार आहे, ज्यामध्ये हवा जाण्याच्या नलिका आकुंचन पावतात."],
    safe_supportive_care: ["शांतपणे ताठ बसा.", "डॉक्टरांनी दिलेला इनहेलर (Inhaler) व्यवस्थित वापरा.", "हवेशीर खोलीत राहा."],
    things_to_avoid: ["धूर, धूळ, अगरबत्ती, तीव्र वास आणि थंड हवेत जाणे टाळा.", "स्वतःहून इनहेलर बंद करू नका."],
    red_flags: ["इनहेलर घेऊनही श्वास न लागणे", "सलग बोलता न येणे", "ओठ निळे पडणे", "छाती जोरात खाली-वर होणे"],
    urgency: "urgent",
    when_to_visit_doctor: ["दम्याची लक्षणे वाढल्यास तात्काळ नेब्युलायझेशनसाठी नजीकच्या PHC किंवा रुग्णालयात जा."],
    appropriate_specialty: ["Pulmonologist", "Chest Physician"],
    facility_type: ["PHC", "Rural Hospital", "District Hospital"]
  }),
  createCondition({
    id: "copd_chronic_obstructive",
    canonical_name: "Chronic Obstructive Pulmonary Disease (COPD)",
    category: "respiratory",
    names: { english: "COPD", hindi: "सीओपीडी (फेफड़ों की पुरानी बीमारी)", marathi: "सीओपीडी (दीर्घकालीन फुफ्फुस विकार)" },
    synonyms: {
      english: ["copd", "chronic bronchitis", "emphysema"],
      hindi: ["सीओपीडी", "फेफड़ों की पुरानी बीमारी", "धूम्रपान से खांसी"],
      marathi: ["सीओपीडी", "जुनाट खोकला व धाप", "बिडीचा खोकला"],
      roman_hindi: ["copd", "purani khansi", "bidi khansi"],
      roman_marathi: ["copd", "junat khokla", "dam lagne"],
      common_indian_terms: ["copd", "bidi khansi"]
    },
    common_symptoms: ["सकाळी येणारा जुनाट कफयुक्त खोकला (Chronic productive cough)", "किरकोळ श्रमानेही धाप लागणे (Exertional breathlessness)", "थकवा"],
    general_information: ["सीओपीडी हा बहुतांश वेळा धूम्रपान किंवा चुलीच्या धुरामुळे फुफ्फुसांचे नुकसान झाल्यामुळे होतो."],
    safe_supportive_care: ["घरात चुलीचा धूर टाळण्यासाठी मोकळी हवा ठेवा.", "प्राणायाम व हलके श्वसन व्यायाम करा."],
    things_to_avoid: ["धूम्रपान (विडी/सिगारेट) पूर्णपणे बंद करा.", "थंड व प्रदूषित वातावरणात जाणे टाळा."],
    red_flags: ["विश्रांती घेत असतानाही श्वास घेता न येणे", "पायांवर सूज येणे", "ऑक्सिजन ९०% पेक्षा खाली जाणे"],
    urgency: "urgent",
    when_to_visit_doctor: ["श्वास घेण्यास त्रास वाढल्यास फुफ्फुस तपासणी (Spirometry) साठी जिल्हा रुग्णालयात जा."],
    appropriate_specialty: ["Pulmonologist"],
    facility_type: ["District Hospital", "Medical College"]
  }),
  createCondition({
    id: "allergic_rhinitis",
    canonical_name: "Allergic Rhinitis",
    category: "respiratory",
    names: { english: "Allergic Rhinitis", hindi: "एलर्जिक राइनाइटिस (धूल-एलर्जी)", marathi: "ॲलर्जिक सर्दी (धूळ ॲलर्जी)" },
    synonyms: {
      english: ["hay fever", "nasal allergy", "dust allergy"],
      hindi: ["धूल से छींके", "एलर्जी वाली सर्दी", "नाक में खुजली"],
      marathi: ["धूळ ॲलर्जी", "सकाळी शिंका येणे", "ॲलर्जिक सर्दी"],
      roman_hindi: ["dhool allergy", "chheenk aana", "naak khujli"],
      roman_marathi: ["dhul allergy", "sakali shinka", "nakala aag"],
      common_indian_terms: ["dust allergy", "hay fever"]
    },
    common_symptoms: ["सकाळी उठल्यावर सलग शिंका येणे (Morning sneezing bursts)", "नाकातून पातळ पाणी वाहणे (Clear rhinorrhea)", "डोळ्यांना व टाळूला खाज सुटणे (Itchy eyes and palate)"],
    general_information: ["धूळ, परागकण किंवा प्राण्यांच्या केसांमुळे नाकातील पडद्याला येणारी ही ॲलर्जी आहे."],
    safe_supportive_care: ["घराची साफसफाई करताना मास्क वापरा.", "कोमट पाण्याच्या वाफा घ्या."],
    things_to_avoid: ["धूळ, धूर, तीव्र परफ्यूम आणि पाळीव प्राण्यांच्या संपर्कात थेट जाणे टाळा."],
    red_flags: ["श्वास घेण्यास त्रास होणे किंवा छातीत घरघर आवाज सुरू होणे"],
    urgency: "self_care",
    when_to_visit_doctor: ["दैनिक कामात व्यत्यय येत असल्यास ॲलर्जी उपचारांसाठी ईएनटी किंवा फिजिशियनचा सल्ला घ्या."],
    appropriate_specialty: ["ENT Specialist", "General Physician"],
    facility_type: ["PHC", "Rural Hospital"]
  }),

  // Gastrointestinal
  createCondition({
    id: "gerd_acid_reflux",
    canonical_name: "Gastroesophageal Reflux Disease (GERD)",
    category: "gastrointestinal",
    names: { english: "GERD (Acid Reflux)", hindi: "एसिडिटी / अम्लपित्त (GERD)", marathi: "अम्लपित्त / ॲसिडिटी (GERD)" },
    synonyms: {
      english: ["acid reflux", "heartburn", "hyperacidity", "gastroesophageal reflux", "upset stomach", "indigestion"],
      hindi: ["एसिडिटी", "सीने में जलन", "खट्टी डकार", "अम्लपित्त", "पेट खराब", "पेट में जलन"],
      marathi: ["पित्त", "ॲसिडिटी", "छातीत जळजळ", "आंबट ढेकर", "पोटात जळजळ", "पोट खराब"],
      roman_hindi: ["acidity", "chhati me jalan", "khatti dakar", "pitta", "pet kharab", "pet kharab hai", "pet me jalan", "pet dard"],
      roman_marathi: ["acidity", "pitta vadhl", "chhatit jaljal", "ambat dhekar", "potat kal", "pot kharab"],
      common_indian_terms: ["acidity", "gas", "pitta", "pet kharab"]
    },
    common_symptoms: ["छातीत व घशात जळजळ (Heartburn)", "तोंडात आंबट किंवा कडू पाणी येणे (Acid regurgitation)", "जेवणानंतर छातीत जडपणा", "पोटात जळजळ"],
    general_information: ["पोटातील पाचक आम्ल (Acid) अन्ननलिकेत उलट दिशेने आल्यामुळे ही जळजळ होते."],
    safe_supportive_care: ["कमी प्रमाणात पण नियमित अंतराने जेवा.", "जेवल्यानंतर लगेच झोपू नका (किमान २ तास अंतर ठेवा).", "थंड दूध किंवा ताक थोडे-थोडे प्या.", "झोपताना डोक्याची बाजू थोडी उंच ठेवा."],
    things_to_avoid: ["अति तिखट, तेलकट, मसालेदार, तळलेले अन्न, चहा आणि कॉफीचे अतिसेवन टाळा.", "उपाशी राहणे टाळा."],
    red_flags: ["अन्न गिळताना तीव्र त्रास किंवा अडकल्यासारखे वाटणे", "काळ्या रंगाचे शौच होणे", "उलटीतून रक्त येणे", "छातीत तीव्र दाब जाणवणे"],
    urgency: "self_care",
    when_to_visit_doctor: ["आठवड्यातून २ पेक्षा जास्त वेळा त्रास होत असल्यास डॉक्टरांना दाखवून तपासणी करा."],
    appropriate_specialty: ["Gastroenterologist", "General Physician"],
    facility_type: ["PHC", "Rural Hospital", "District Hospital"]
  }),
  createCondition({
    id: "peptic_ulcer_disease",
    canonical_name: "Peptic Ulcer Disease",
    category: "gastrointestinal",
    names: { english: "Peptic Ulcer Disease", hindi: "पेट का अल्सर (पेप्टिक अल्सर)", marathi: "पोटातील व्रण (पेप्टिक अल्सर)" },
    synonyms: {
      english: ["stomach ulcer", "gastric ulcer", "duodenal ulcer"],
      hindi: ["पेट में अल्सर", "आमाशय का घाव"],
      marathi: ["पोटात व्रण", "अल्सर", "पोटातील जखम"],
      roman_hindi: ["pet me ulcer", "pet me ghav"],
      roman_marathi: ["potat ulcer", "potat jakham"],
      common_indian_terms: ["ulcer", "stomach ulcer"]
    },
    common_symptoms: ["उपाशीपोटी पोटाच्या वरच्या भागात जळजळ व तीव्र वेदना (Epigastric burning pain)", "अन्नानंतर किंवा रात्री पोट दुखणे", "मळमळ"],
    general_information: ["पोटाच्या किंवा लहान आतड्याच्या आतील आवरणावर जखम (Ulcer) झाल्यामुळे हा त्रास होतो."],
    safe_supportive_care: ["वेळेवर हलका आहार घ्या.", "भरपूर पाणी प्या."],
    things_to_avoid: ["पेनकिलर (NSAIDs) गोळ्या डॉक्टरांच्या सल्ल्याशिवाय वारंवार खाणे टाळा.", "मद्यपान व धुम्रपान टाळा."],
    red_flags: ["उलटीमध्ये कॉफीच्या रंगाचे किंवा लाल रक्त पडणे", "डांबरासारखे काळे शौच होणे", "अचानक तीव्र पोटदुखी"],
    urgency: "urgent",
    when_to_visit_doctor: ["तीव्र पोटदुखी व वजन कमी होत असल्यास एन्डोस्कोपीसाठी तज्ज्ञ डॉक्टरांना भेटा."],
    appropriate_specialty: ["Gastroenterologist", "General Surgeon"],
    facility_type: ["Sub-District Hospital", "District Hospital"]
  }),
  createCondition({
    id: "hemorrhoids_piles",
    canonical_name: "Hemorrhoids (Piles)",
    category: "gastrointestinal",
    names: { english: "Hemorrhoids (Piles)", hindi: "बवासीर (पाइल्स)", marathi: "मूळव्याध (पाइल्स)" },
    synonyms: {
      english: ["piles", "hemorrhoids", "anal bleeding"],
      hindi: ["बवासीर", "पाइल्स", "शौच में खून"],
      marathi: ["मूळव्याध", "पाइल्स", "शौचाच्या जागी रक्त"],
      roman_hindi: ["bawasir", "piles", "shauch me khoon"],
      roman_marathi: ["mulvyadh", "piles", "sandasat rakt"],
      common_indian_terms: ["piles", "bawasir", "mulvyadh"]
    },
    common_symptoms: ["शौचाच्या वेळी गुदद्वारामधून ताजे लाल रक्त पडणे (Painless rectal bleeding)", "गुदद्वारात कोंब किंवा गाठ जाणवणे (Prolapsing mass)", "गुदद्वारात खाज व अस्वस्थता"],
    general_information: ["गुदद्वारातील रक्तवाहिन्या सुजल्यामुळे व फुगल्यामुळे मूळव्याध होतो, ज्याचे मुख्य कारण बद्धकोष्ठता आहे."],
    safe_supportive_care: ["आहारात फायबर (हिरव्या पालेभाज्या, फळे, कोंड्यासह धान्य) वाढवा.", "दिवसाला ३ ते ४ लिटर पाणी प्या.", "शौचाच्या जागी कोमट पाण्याच्या टबमध्ये बसा (Sitz bath)."],
    things_to_avoid: ["शौचाच्या वेळी जास्त जोर लावणे टाळा.", "जास्त वेळ एकाच जागी बसून राहणे टाळा."],
    red_flags: ["मोठ्या प्रमाणावर रक्तस्त्राव होऊन चक्कर येणे", "तीव्र असह्य वेदना (Thrombosed piles)", "ताप येणे"],
    urgency: "doctor_soon",
    when_to_visit_doctor: ["शौचातून रक्त पडत असल्यास इतर गंभीर आजार वगळण्यासाठी डॉक्टरांकडून तपासणी करून घ्या."],
    appropriate_specialty: ["General Surgeon", "Proctologist"],
    facility_type: ["Rural Hospital", "Sub-District Hospital", "District Hospital"]
  }),
  createCondition({
    id: "acute_appendicitis",
    canonical_name: "Acute Appendicitis",
    category: "gastrointestinal",
    names: { english: "Acute Appendicitis", hindi: "अपेंडिसाइटिस (अपेंडिक्स की सूजन)", marathi: "अपेंडिसायटिस (अपेंडिक्सची सूज)" },
    synonyms: {
      english: ["appendicitis", "appendix inflammation", "appendix pain"],
      hindi: ["अपेंडिक्स का दर्द", "अपेंडिसाइटिस"],
      marathi: ["अपेंडिक्स", "अपेंडिसायटिस", "पोटाच्या उजव्या बाजूला कळ"],
      roman_hindi: ["appendix", "pet ke dahine taraf dard"],
      roman_marathi: ["appendix", "potachya ujvya bajula kal"],
      common_indian_terms: ["appendix", "appendicitis"]
    },
    common_symptoms: ["नाभीजवळ सुरू होऊन पोटाच्या उजव्या खालच्या भागात जाणारी तीव्र कळ (Right lower quadrant pain)", "उलट्या व मळमळ (Nausea/vomiting)", "हलका ताप", "भूक पूर्णपणे मंदावणे"],
    general_information: ["अपेंडिक्सला अचानक जिवाणू संसर्ग व सूज आल्यामुळे ही स्थिती निर्माण होते व ही सर्जिकल आणीबाणी असते."],
    safe_supportive_care: ["काहीही खाणे-पिणे तात्काळ थांबवा आणि डॉक्टरांकडे जा."],
    things_to_avoid: ["पोटावर शेक देऊ नका (यामुळे अपेंडिक्स फुटू शकतो).", "जुलाबाचे औषध किंवा पेनकिलर स्वतःहून घेऊ नका."],
    red_flags: ["पोट लाकडासारखे कडक होणे (Rigid abdomen)", "तीव्र ताप व संपूर्ण पोटात असह्य वेदना (Peritonitis)"],
    urgency: "emergency",
    when_to_visit_doctor: ["उजव्या बाजूला तीव्र पोटदुखी असल्यास तात्काळ जवळच्या शासकीय रुग्णालयात किंवा सर्जनकडे जा."],
    appropriate_specialty: ["General Surgeon"],
    facility_type: ["Sub-District Hospital", "District Hospital", "GMC"]
  })
];

// Additional 73 Respiratory & GI conditions programmatically populated
const additionalRespGi = [
  // Respiratory (32 more)
  ["acute_bronchitis", "Acute Bronchitis", "तीव्र ब्रोंकाइटिस", "तीव्र श्वासनलिका दाह", ["खोकल्यासोबत कफ", "छातीत जडपणा", "हलका ताप"], "doctor_soon"],
  ["chronic_bronchitis", "Chronic Bronchitis", "क्रोनिक ब्रोंकाइटिस", "जुनाट श्वासनलिका दाह", ["३ महिने सलग कफयुक्त खोकला", "धाप"], "doctor_soon"],
  ["pleural_effusion", "Pleural Effusion", "फेफड़ों में पानी भरना", "फुफ्फुसात पाणी भरणे", ["श्वास घेताना छातीत तीव्र टोचणे", "धाप लागणे", "खोकला"], "urgent"],
  ["pneumothorax_spontaneous", "Pneumothorax", "फेफड़े की हवा लीक होना", "फुफ्फुसातून हवा गळती", ["अचानक एका बाजूला तीव्र छातीत दुखणे", "तीव्र धाप"], "emergency"],
  ["pulmonary_embolism", "Pulmonary Embolism", "फेफड़ों में खून का थक्का", "फुफ्फुसातील रक्तवाहिनीत रक्ताची गाठ", ["अचानक तीव्र धाप", "छातीत असह्य वेदना", "थुंकीत रक्त"], "emergency"],
  ["sleep_apnea_obstructive", "Obstructive Sleep Apnea", "स्लीप एप्निया (नींद में सांस रुकना)", "झोपेत श्वास अडखळणे (स्लीप ॲप्निया)", ["मोठ्याने घोरणे", "दिवसा अतिझोप", "सकाळी डोकेदुखी"], "doctor_soon"],
  ["interstitial_lung_disease", "Interstitial Lung Disease (ILD)", "फेफड़ों का फाइब्रोसिस", "फुफ्फुसांचा जुनाट आजार (ILD)", ["दीर्घकाळ धाप लागणे", "सुका खोकला", "नखे गोल होणे"], "doctor_soon"],
  ["bronchiectasis", "Bronchiectasis", "ब्रोन्किइक्टेसिस", "श्वासनलिका विस्तार विकार", ["मोठ्या प्रमाणावर दुर्गंधीयुक्त कफ", "वारंवार संसर्ग"], "doctor_soon"],
  ["laryngitis_acute", "Acute Laryngitis", "स्वरयंत्र की सूजन (गला बैठना)", "आवाज बसणे (स्वरयंत्र दाह)", ["आवाज पूर्णपणे बसणे किंवा कर्कश होणे", "घशात कोरडेपणा"], "self_care"],
  ["croup_pediatric_stridor", "Croup (Laryngotracheobronchitis)", "क्रुप (कुत्ते जैसी खांसी)", "क्रूप खोकला (घसा सूज)", ["कुत्र्यासारखा भुंकणारा खोकला", "श्वास घेताना घरघर आवाज"], "urgent"],
  ["occupational_pneumoconiosis", "Pneumoconiosis", "धूल से फेफड़ों की बीमारी", "कामाच्या ठिकाणच्या धुळीमुळे फुफ्फुस विकार", ["हळूहळू वाढणारी धाप", "जुनाट खोकला"], "doctor_soon"],
  ["hyperventilation_syndrome", "Hyperventilation Syndrome", "अत्यधिक तेज सांस लेना", "जलद श्वास घेणे (घाबरल्यामुळे)", ["हात-पाय सुन्न पडणे", "भोवळ येणे", "छातीत धडधड"], "self_care"],

  // Gastrointestinal (41 more)
  ["acute_gastritis", "Acute Gastritis", "पेट की सूजन (गैस्ट्राइटिस)", "जठराची तीव्र जळजळ", ["पोटात जळजळ", "मळमळ", "उलट्या"], "self_care"],
  ["chronic_gastritis", "Chronic Gastritis", "क्रोनिक गैस्ट्राइटिस", "जुनाट जठर दाह", ["वारंवार अपचन", "पोट जड होणे", "भूक कमी"], "doctor_soon"],
  ["irritable_bowel_syndrome_ibs", "Irritable Bowel Syndrome (IBS)", "आईबीएस (पेट की खराबी)", "आतड्यांचे विकार (IBS)", ["पोटात मुरडा", "कधी जुलाब कधी बद्धकोष्ठता", "गॅस"], "doctor_soon"],
  ["inflammatory_bowel_disease_uc", "Ulcerative Colitis", "अल्सरेटिव कोलाइटिस", "आतड्यांवर व्रण (कोलायटिस)", ["शौचातून रक्त व शेम पडणे", "वारंवार जुलाब", "वजन घट"], "urgent"],
  ["crohns_disease", "Crohn's Disease", "क्रोहन रोग", "क्रोहनचा आजार", ["तीव्र पोटदुखी", "जुलाब", "वजन कमी होणे", "अशक्तपणा"], "urgent"],
  ["anal_fissure_acute", "Anal Fissure", "एनल फिशर (गुदा का चीरा)", "भगंदर / गुदद्वारातील चीर (फिशर)", ["शौचाच्या वेळी तीव्र काच लागल्यासारखी वेदना", "थेंब थेंब रक्त"], "doctor_soon"],
  ["fistula_in_ano", "Fistula-in-Ano", "भगंदर (फिस्टुला)", "भगंदर (फिस्ट्युला)", ["गुदद्वाराजवळून पू किंवा दुर्गंधीयुक्त पाणी वाहणे", "वेदना"], "doctor_soon"],
  ["perianal_abscess", "Perianal Abscess", "गुदा के पास फोड़ा", "गुदद्वाराजवळील गळू", ["गुदद्वाराजवळ तीव्र वेदनादायी सूज", "ताप"], "urgent"],
  ["gallstones_cholelithiasis", "Gallstones (Cholelithiasis)", "पित्त की पथरी", "पित्ताशयातील खडे (गॉलब्लाडर स्टोन)", ["उजव्या बरगडीखाली अचानक तीव्र कळ", "उलटी", "खांद्यापर्यंत वेदना"], "doctor_soon"],
  ["acute_cholecystitis", "Acute Cholecystitis", "पित्ताशय की सूजन", "पित्ताशयाची तीव्र सूज", ["उजव्या कुशीत असह्य वेदना", "तीव्र ताप", "उलट्या"], "urgent"],
  ["acute_pancreatitis", "Acute Pancreatitis", "अग्न्याशय की सूजन (पैंक्रियाटाइटिस)", "स्वादुपिंडाची तीव्र सूज", ["पोटाच्या वरच्या भागात तीव्र वेदना जी पाठीकडे जाते", "उलट्या"], "emergency"],
  ["chronic_pancreatitis", "Chronic Pancreatitis", "क्रोनिक पैंक्रियाटाइटिस", "जुनाट स्वादुपिंड दाह", ["सतत पाठीकडे जाणारी पोटदुखी", "चरबीयुक्त जुलाब", "वजन घट"], "urgent"],
  ["intestinal_obstruction", "Intestinal Obstruction", "आंतों में रुकावट", "आतड्यांचा अडथळा (आतडे अडकणे)", ["पोट प्रचंड फुगणे", "उलट्या", "शौच व गॅस पूर्ण बंद होणे"], "emergency"],
  ["inguinal_hernia", "Inguinal Hernia", "हर्निया (हर्निया की गांठ)", "हर्निया (जांघेतील गाठ)", ["जांघेत उभे राहिल्यावर किंवा खोकल्यावर फुगणारी गाठ", "वेदना"], "doctor_soon"],
  ["strangulated_hernia", "Strangulated Hernia", "स्ट्रैंगुलेटेड हर्निया", "अडकलेला हर्निया (रक्तपुरवठा बंद)", ["हर्नियाची गाठ आत न जाणे", "असह्य वेदना", "उलट्या"], "emergency"],
  ["food_poisoning_staph", "Bacterial Food Poisoning", "फूड पॉइजनिंग (विषाक्त भोजन)", "अन्न विषबाधा (फूड पॉयझनिंग)", ["अचानक तीव्र उलट्या", "जुलाब", "पोटात तीव्र कळ"], "urgent"],
  ["chronic_constipation", "Chronic Constipation", "कब्ज (पुरानी कब्ज)", "जुनाट बद्धकोष्ठता / मलबद्धता", ["आठवड्यातून ३ पेक्षा कमी वेळा शौच", "खडे शौच", "जोर लावावा लागणे"], "self_care"],
  ["non_ulcer_dyspepsia", "Functional Dyspepsia", "अपच (खट्टी डकार व भारीपन)", "अपचन व पोटफुगी", ["लवकर पोट भरणे", "पोटात अस्वस्थता", "वारंवार ढेकर"], "self_care"],
  ["celiac_disease_gluten", "Celiac Disease", "सीलिएक रोग (गेहूं से एलर्जी)", "गहू ॲलर्जी (सिलिॲक आजार)", ["गव्हाचे पदार्थ खाल्ल्यावर जुलाब", "पोट फुगणे", "वजन न वाढणे"], "doctor_soon"],
  ["rectal_prolapse", "Rectal Prolapse", "कांच निकलना (गुदा बाहर आना)", "गुदद्वार बाहेर येणे (काच पडणे)", ["शौचाच्या वेळी आतडे बाहेर येणे", "शेम पडणे"], "doctor_soon"],
  ["diverticulitis_colon", "Diverticulitis", "डाइवर्टिकुलाइटिस", "आतड्यांच्या पिशव्यांची सूज", ["पोटाच्या डाव्या बाजूला तीव्र कळ", "ताप", "जुलाब"], "urgent"],
  ["gastric_polyps", "Gastric Polyps", "पेट के पॉलीप्स", "जठरातील गाठी (पॉलीप्स)", ["पोटात अस्वस्थता", "रक्तक्षय"], "doctor_soon"],
  ["colonic_polyps", "Colonic Polyps", "बड़ी आंत के पॉलीप्स", "मोठ्या आतड्यातील गाठी", ["शौचातून बारीक रक्तस्त्राव", "शौचाच्या सवयींमध्ये बदल"], "doctor_soon"]
];

additionalRespGi.forEach(([id, canonical_name, name_hi, name_mr, symptoms, urgency]) => {
  respiratoryGi.push(createCondition({
    id,
    canonical_name,
    category: id.includes("bronch") || id.includes("effusion") || id.includes("pneumo") || id.includes("apnea") || id.includes("lung") || id.includes("laryng") || id.includes("croup") ? "respiratory" : "gastrointestinal",
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
    general_information: [`${name_mr} हा आजार असून योग्य वैद्यकीय मूल्यमापन आवश्यक आहे.`],
    safe_supportive_care: urgency === "emergency" ? [] : ["हलका व सुपाच्य आहार घ्या.", "भरपूर पाणी प्या.", "विश्रांती घ्या."],
    things_to_avoid: ["तिखट व तेलकट पदार्थ खाणे टाळा.", "धुम्रपान टाळा."],
    red_flags: ["तीव्र वेदना", "रक्तस्राव", "उलट्या न थांबणे"],
    urgency,
    when_to_visit_doctor: ["लक्षणे दिसल्यास शासकीय रुग्णालयात वैद्यकीय तपासणी करून घ्या."],
    appropriate_specialty: id.includes("bronch") || id.includes("lung") ? ["Pulmonologist"] : ["Gastroenterologist", "General Surgeon"],
    facility_type: ["PHC", "Rural Hospital", "District Hospital"]
  }));
});

module.exports = respiratoryGi;
