const { createCondition } = require("./dataset_helper");

const rawList = [
  // Infections Expansion (30 items)
  ["syphilis_infection", "Syphilis", "सिफलिस (उपदंश)", "उपदंश (सिफिलीस)", ["गुप्तांगावर न दुखणारे व्रण", "अंगावर पुरळ", "ताप"], "urgent", "infections_fever"],
  ["gonorrhea_infection", "Gonorrhea", "गोनोरिया (सुजाक)", "सुजाक (गोनोरिया)", ["लघवी करताना तीव्र जळजळ", "पूयुक्त स्त्राव"], "urgent", "infections_fever"],
  ["chlamydia_trachomatis", "Chlamydia Infection", "क्लैमाइडिया संक्रमण", "क्लॅमिडीया संसर्ग", ["पांढरा स्त्राव", "ओटीपोटात वेदना", "लघवीला त्रास"], "doctor_soon", "infections_fever"],
  ["genital_warts_hpv", "Genital Warts (HPV)", "गुप्तांग के मस्से", "गुप्तांगावरील चामखीळ (HPV)", ["गुप्तांगावर लहान गाठी किंवा चामखीळ", "खाज"], "doctor_soon", "infections_fever"],
  ["trichomoniasis_infection", "Trichomoniasis", "ट्राइकोमोनिएसिस", "ट्रायकोमोनियासिस", ["हिरवट-पिवळा फेसयुक्त स्त्राव", "तीव्र खाज व दुर्गंध"], "doctor_soon", "infections_fever"],
  ["dengue_hemorrhagic_fever", "Dengue Hemorrhagic Fever / Shock", "गंभीर डेंगू (शॉक सिंड्रोम)", "डेंग्यू रक्तस्त्राव व शॉक", ["हिरड्यांतून रक्त", "अचानक बीपी कोसळणे", "तीव्र पोटदुखी"], "emergency", "infections_fever"],
  ["cerebral_malaria_falciparum", "Cerebral Malaria (Falciparum)", "सेरेब्रल मलेरिया (दिमागी मलेरिया)", "मेंदूचा मलेरिया (फाल्सिपॅरम)", ["तीव्र तापानंतर बेशुद्धी", "झटके", "गोंधळलेली अवस्था"], "emergency", "infections_fever"],
  ["kala_azar_visceral_leishmania", "Kala-Azar (Visceral Leishmaniasis)", "कालाजार (काला अजार)", "काला आजार (काळा ताप)", ["दीर्घकाळ ताप", "यकृत व प्लीहा वाढणे", "अशक्तपणा", "त्वचा काळी पडणे"], "urgent", "infections_fever"],
  ["japanese_encephalitis_je", "Japanese Encephalitis", "जापानी एन्सेफलाइटिस", "जपानी मेंदूज्वर (JE)", ["तीव्र ताप", "मान आखडणे", "झटके", "बेशुद्धी"], "emergency", "infections_fever"],
  ["scrub_typhus_mite", "Scrub Typhus (Orientia)", "स्क्रब टाइफस", "स्क्रब टायफस (किड्याचा ताप)", ["काळे चट्टे (Eschar)", "तीव्र ताप", "डोकेदुखी", "खोकला"], "urgent", "infections_fever"],
  ["diphtheria_respiratory", "Diphtheria (Galghotu)", "डिप्थीरिया (गलघोंटू)", "घटसर्प (घळघोटू)", ["घशात जाड राखाडी पडदा", "श्वास घेण्यास अडचण", "मानेला सूज"], "emergency", "infections_fever"],
  ["scarlet_fever_strep", "Scarlet Fever", "स्कार्लेट ज्वर", "स्कार्लेट ताप (लाल पुरळ ताप)", ["स्ट्रॉबेरीसारखी लाल जीभ", "सँडपेपरसारखे लाल पुरळ", "ताप"], "doctor_soon", "infections_fever"],
  ["cytomegalovirus_cmv", "Cytomegalovirus (CMV)", "साइटोमेगालोवायरस", "सायटोमेगालोव्हायरस संसर्ग", ["थकवा", "हलका ताप", "घशात सूज"], "doctor_soon", "infections_fever"],
  ["epstein_barr_virus_ebv", "Epstein-Barr Virus (Glandular Fever)", "ईबीवी संक्रमण", "ग्रंथिज्वर संसर्ग", ["तीव्र थकवा", "मानेतील गाठी", "घसा दुखणे"], "doctor_soon", "infections_fever"],
  ["brucellosis_undulant_fever", "Brucellosis (Malta Fever)", "ब्रुसेलोसिस (पशु जन्य बुखार)", "ब्रुसेलोसिस (जनावरांच्या संपर्कातील ताप)", ["वारंवार येणारा ताप", "सांधेदुखी", "रात्री घाम"], "doctor_soon", "infections_fever"],
  ["toxoplasmosis_parasitic", "Toxoplasmosis", "टोक्सोप्लाज्मोसिस", "टॉक्सोप्लाझ्मोसिस संसर्ग", ["मानेतील गाठी", "स्नायूदुखी", "गरोदरपणात धोका"], "urgent", "infections_fever"],
  ["parvovirus_fifth_disease", "Fifth Disease (Parvovirus B19)", "फिफ्थ डिजीज (गाल पर लाल थप्पड़)", "पाचवा आजार (गालांवर लाल चट्टा)", ["गालांवर चपराक मारल्यासारखे लाल चट्टे", "ताप"], "self_care", "infections_fever"],
  ["hanta_virus_pulmonary", "Hantavirus Infection", "हंतावायरस", "हंताव्हायरस संसर्ग (उंदरांपासून)", ["ताप", "स्नायूदुखी", "अचानक धाप"], "emergency", "infections_fever"],
  ["listeria_monocytogenes", "Listeriosis (Foodborne Infection)", "लिस्टेरियोसिस", "लिस्टेरिओसिस अन्नसंसर्ग", ["ताप", "उलट्या", "मान आखडणे"], "urgent", "infections_fever"],
  ["schistosomiasis_bilharzia", "Schistosomiasis", "सिस्टोसोमियासिस", "सिस्टोसोमियासिस परजीवी संसर्ग", ["लघवीतून रक्त", "पोटदुखी", "जुलाब"], "doctor_soon", "infections_fever"],

  // Dermatology Expansion (25 items)
  ["pityriasis_versicolor_fungus", "Pityriasis Versicolor", "सेहुआ (फंगल पैच)", "शिबूक / छातीवर पांढरे-तपकिरी चट्टे", ["छातीवर व पाठीवर हलके किंवा गडद चट्टे", "हलकी खाज"], "self_care", "dermatology"],
  ["paronychia_nail_infection", "Paronychia (Nail Fold Infection)", "नाखून का पकना", "नखवेढ (नखाच्या बाजूला पू)", ["नखाच्या बाजूला लाल, गरम व पूयुक्त सूज", "ठसठस"], "self_care", "dermatology"],
  ["onychomycosis_fungal_nail", "Onychomycosis (Fungal Nail)", "नाखून का फंगस", "नखांमधील बुरशी (नखे जाड होणे)", ["नखे पिवळी, जाड व ठिसूळ होणे"], "self_care", "dermatology"],
  ["molluscum_contagiosum_skin", "Molluscum Contagiosum", "मोलस्कम (मोती जैसे दाने)", "मोत्यासारखे गुळगुळीत फोड", ["मध्यभागी खड्डा असलेले मोत्यासारखे लहान दाणे"], "self_care", "dermatology"],
  ["keloid_hypertrophic_scar", "Keloid & Hypertrophic Scar", "केलोइड (उभरी हुई गांठ)", "किलॉइड (जखमेनंतरची फुगलेली गाठ)", ["जखमेच्या जागी जाड, कडक व वाढणारी लाल गाठ"], "self_care", "dermatology"],
  ["corns_and_calluses_feet", "Corns and Calluses (Gokhru)", "गोखरू (पैरों के कॉर्न)", "गोखरू / पायातील काटा गाठ (कॉर्न)", ["तळपायावर कडक वेदनादायी गाठ", "चालताना टोचणे"], "self_care", "dermatology"],
  ["rosacea_facial_erythema", "Rosacea", "रोसैसिया (चेहरे की लालिमा)", "चेहऱ्यावरील लालसरपणा (रोझेशिया)", ["नाक व गालांवर सतत लालसरपणा", "बारीक रक्तवाहिन्या दिसणे"], "doctor_soon", "dermatology"],
  ["lichen_planus_skin_oral", "Lichen Planus", "लाइकेन प्लेनस", "लायकेन प्लॅनस (जांभळे चट्टे)", ["मनगटावर व पायांवर जांभळट सपाट चट्टे", "तोंडात पांढरी जाळी"], "doctor_soon", "dermatology"],
  ["hidradenitis_suppurativa", "Hidradenitis Suppurativa", "कांख या जांघ की गांठें", "काखेतील जुनाट पूयुक्त गाठी", ["काखेत किंवा जांघेत वारंवार फुटणाऱ्या वेदनादायी गाठी"], "doctor_soon", "dermatology"],
  ["pemphigus_vulgaris_blisters", "Pemphigus Vulgaris", "पेम्फिगस (त्वचा के छाले)", "पेम्फिगस (त्वचेवरील मोठे फोड)", ["त्वचेवर व तोंडात फुटणारे मोठे पाण्यासारखे फोड", "जखमा"], "urgent", "dermatology"],
  ["bullous_pemphigoid_elderly", "Bullous Pemphigoid", "बुलोउस पेम्फिगोइड", "वृद्धांमधील मोठे फोड विकार", ["कडक फोड", "तीव्र खाज"], "urgent", "dermatology"],
  ["erythema_multiforme", "Erythema Multiforme", "एरिथेमा मल्टीफॉर्म", "लक्ष्यवेधी लाल चट्टे (टार्गेट लिजन्स)", ["बंदुकीच्या लक्ष्यासारखे (Target) गोल लाल चट्टे"], "urgent", "dermatology"],
  ["stevens_johnson_syndrome_sjs", "Stevens-Johnson Syndrome (SJS)", "एसजेएस (दवा की गंभीर एलर्जी)", "स्टीव्हन्स-जॉन्सन सिंड्रोम (औषधाची तीव्र ॲलर्जी)", ["औषधानंतर संपूर्ण अंगावर फोड", "ओठ व डोळे जळणे", "त्वचा सोलवटणे"], "emergency", "dermatology"],
  ["keratosis_pilaris_strawberry", "Keratosis Pilaris (Strawberry Skin)", "स्ट्रॉबेरी स्किन", "त्वचेवरील बारीक खडबडीत दाणे", ["दंडावर व मांड्यांवर खडबडीत पुटकुळ्या"], "self_care", "dermatology"],
  ["stasis_dermatitis_leg_ulcer", "Stasis Dermatitis & Varicose Ulcer", "पैरों में सूजन व घाव", "पायावरील काळे चट्टे व शिरांचा व्रण", ["घोट्याजवळ त्वचा तपकिरी होणे", "न भरणारी जखम"], "doctor_soon", "dermatology"],

  // Respiratory & ENT Expansion (30 items)
  ["aspiration_pneumonia", "Aspiration Pneumonia", "एस्पिरेशन निमोनिया", "अन्न फुफ्फुसात गेल्याने न्युमोनिया", ["अन्न किंवा उलट्या श्वासनलिकेत जाऊन खोकला", "ताप", "धाप"], "emergency", "respiratory"],
  ["hypersensitivity_pneumonitis", "Hypersensitivity Pneumonitis", "एलर्जिक फेफड़ों की सूजन", "ॲलर्जिक फुफ्फुसदाह (पक्ष्यांच्या विष्ठेमुळे)", ["धाप", "सुका खोकला", "ताप"], "doctor_soon", "respiratory"],
  ["atelectasis_lung_collapse", "Atelectasis (Lung Collapse)", "फेफड़े का सिकुड़ना", "फुफ्फुस आकुंचन पावणे", ["धाप", "छातीत दुखणे", "कमी ऑक्सिजन"], "urgent", "respiratory"],
  ["silicosis_occupational", "Silicosis (Stone Dust Lung)", "सिलिकोसिस (पत्थर धूलि रोग)", "सिलिकॉसिस (दगड खाण कामगार आजार)", ["खाणीत काम केल्यामुळे वाढणारी धाप", "जुनाट खोकला"], "doctor_soon", "respiratory"],
  ["asbestosis_lung_disease", "Asbestosis", "एस्बेस्टोसिस", "ॲस्बेस्टॉसिस फुफ्फुस विकार", ["पत्र्यांच्या कारखान्यातील कामगारांना धाप", "छातीत आवळणे"], "doctor_soon", "respiratory"],
  ["vocal_cord_nodules_polyps", "Vocal Cord Nodules / Polyps", "वोकल कॉर्ड नोड्यूल (आवाज बैठना)", "स्वरतंतूंवरील गाठी (घोगरा आवाज)", ["शिक्षकांमध्ये किंवा गायकांमध्ये सतत आवाज घोगरा असणे"], "doctor_soon", "ent_ophthalmology"],
  ["acute_epiglottitis_airway", "Acute Epiglottitis", "एपिग्लोटाइटिस (गले का अवरोध)", "स्वरद्वार झाकणीची तीव्र सूज (श्वास अडथळा)", ["लाळ गिळता न येणे", "पुढे झुकून श्वास घेणे", "घरघर"], "emergency", "ent_ophthalmology"],
  ["swimmers_ear_otitis_externa", "Otitis Externa (Swimmer's Ear)", "बाहरी कान का संक्रमण", "बाह्य कानाचा संसर्ग (जलतरण कानदुखी)", ["कान ओढल्यावर तीव्र वेदना", "कानातून स्त्राव", "खाज"], "self_care", "ent_ophthalmology"],
  ["mastoiditis_ear_bone", "Mastoiditis", "कान के पीछे की हड्डी में मवाद", "कानाच्या मागील हाडाचा संसर्ग (मॅस्टॉइडायटिस)", ["कानाच्या मागे लाल, गरम सूज", "तीव्र कानदुखी", "ताप"], "urgent", "ent_ophthalmology"],
  ["eustachian_tube_dysfunction", "Eustachian Tube Dysfunction", "कान का पर्दा बंद होना", "कानाचा पडदा चोंदणे (विमानात कान बंद)", ["कानात दडे बसणे", "कमी ऐकू येणे", "चटकन आवाज येणे"], "self_care", "ent_ophthalmology"],
  ["cholesteatoma_chronic_ear", "Cholesteatoma", "कान में हड्डी गलना", "कानात हाड झिजवणारी गाठ (कोलेस्टिटोमा)", ["कानातून सतत दुर्गंधीयुक्त पू येणे", "ऐकू न येणे"], "doctor_soon", "ent_ophthalmology"],
  ["menieres_disease_ear", "Meniere's Disease", "मेनियार्स रोग", "मेनियर्स आजार (कानाचा जुनाट आजार)", ["तीव्र भोवळ", "कानात शिट्टीचा आवाज", "ऐकू कमी होणे"], "doctor_soon", "ent_ophthalmology"],
  ["peritonsillar_abscess_quinsy", "Peritonsillar Abscess (Quinsy)", "टॉन्सिल का मवाद (क्विंसी)", "टॉन्सिल्सच्या मागे पू भरणे (क्विन्सी)", ["एक बाजूचा घसा प्रचंड दुखणे", "तोंड न उघडता येणे", "गरम बटाट्यासारखा आवाज"], "urgent", "ent_ophthalmology"],
  ["corneal_ulcer_keratitis", "Corneal Ulcer (Keratitis)", "कॉर्नियल अल्सर (आंख की पुतली का घाव)", "डोळ्याच्या बाहुलीवरील व्रण (कॉर्निया जखम)", ["बाहुलीवर पांढरा ठिपका", "तीव्र वेदना", "प्रकाशाचा त्रास"], "urgent", "ent_ophthalmology"],
  ["acute_anterior_uveitis_iritis", "Acute Anterior Uveitis (Iritis)", "आंख के भीतरी भाग की सूजन (यूरिवाइटिस)", "डोळ्याच्या आतील आवरणाची सूज (युव्हायटिस)", ["डोळा लाल", "बाहुलीजवळ वेदना", "दृष्टी धूसर"], "urgent", "ent_ophthalmology"],
  ["retinal_detachment_eye", "Retinal Detachment", "रेटिना का फटना / हटना", "डोळ्याचा पडदा सरकणे (रेटिनल डिटॅचमेंट)", ["डोळ्यासमोर विजेसारखे चमकणे (Flashes)", "पडदा पडल्यासारखा अंधार"], "emergency", "ent_ophthalmology"],
  ["age_related_macular_degeneration", "Age-Related Macular Degeneration (AMD)", "मैक्युलर डिजनरेशन", "वृद्धापकाळातील दृष्टी ऱ्हास (मॅक्युलर डिजनरेशन)", ["मध्यभागातील वस्तू वाकड्या-तिकड्या दिसणे", "वाचता न येणे"], "doctor_soon", "ent_ophthalmology"],
  ["strabismus_squint_eye", "Strabismus (Squint)", "भेंगापन (आंख का तिरछा होना)", "तिरळेपणा (डोळ्यांचा तिरळेपणा)", ["दोन्ही डोळे एका दिशेने न फिरणे", "दुहेरी दिसणे"], "doctor_soon", "ent_ophthalmology"],
  ["pterygium_surfers_eye", "Pterygium (Surfer's Eye)", "नाखूना (आंख में मांस बढ़ना)", "डोळ्यातील मांसाची वाढ (नाखून / टेरिजियम)", ["डोळ्याच्या कोपऱ्यातून बाहुलीकडे मांसल पापुद्रा वाढणे"], "self_care", "ent_ophthalmology"],

  // Gastrointestinal Expansion (25 items)
  ["achalasia_cardia_esophagus", "Achalasia Cardia", "अकेलेशिया (खाना निगलने में रुकावट)", "अन्ननलिकेचा अडथळा (अचलेशिया कार्डिया)", ["घन व पातळ अन्न दोन्ही गिळताना अडकणे", "उलट्या"], "doctor_soon", "gastrointestinal"],
  ["mallory_weiss_tear", "Mallory-Weiss Tear", "उल्टी के बाद खून आना", "वारंवार उलट्यांमुळे अन्ननलिकेत चीर व रक्त", ["तीव्र उलट्यांनंतर लाल रक्ताची उलटी"], "urgent", "gastrointestinal"],
  ["gastroparesis_diabetic", "Diabetic Gastroparesis", "पेट का धीरे खाली होना", "पोट रिकामे होण्यास विलंब (मधुमेही गॅस्ट्रोपेरेसिस)", ["थोडे खाल्ल्यावरही पोट खूप वेळ जड राहणे", "मळमळ"], "doctor_soon", "gastrointestinal"],
  ["mesenteric_ischemia_bowel", "Acute Mesenteric Ischemia", "आंतों में खून की रुकावट", "आतड्यांचा रक्तपुरवठा खंडित होणे", ["तपासणीत काही न दिसणारी असह्य तीव्र पोटदुखी", "रक्ताचे जुलाब"], "emergency", "gastrointestinal"],
  ["volvulus_sigmoid_cecal", "Sigmoid / Cecal Volvulus", "आंतों में गांठ लगना (वाल्वुलस)", "आतड्यांना पीळ पडणे (व्हॉल्व्ह्युलस)", ["पोट प्रचंड फुगणे", "शौच व गॅस पूर्ण बंद", "उलट्या"], "emergency", "gastrointestinal"],
  ["intussusception_bowel", "Intussusception (Bowel Telescoping)", "आंत का आंत में घुसना", "आतड्यात आतडे अडकणे (इन्ट्युससेप्शन)", ["लहान मुलांमध्ये लाल जेलीसारखे शौच (Red currant jelly)", "रडण्याची उबळ"], "emergency", "gastrointestinal"],
  ["toxic_megacolon_colitis", "Toxic Megacolon", "बड़ी आंत का अत्यधिक फूलना", "मोठ्या आतड्याची प्राणघातक सूज (मेगाकोलोन)", ["तीव्र ताप", "पोट प्रचंड फुगणे", "रक्ताचे जुलाब", "शॉक"], "emergency", "gastrointestinal"],
  ["biliary_colic_spasm", "Biliary Colic", "पित्त की नली का दर्द", "पित्तनलिकेची तीव्र कळ", ["उजव्या कुशीत तेलकट जेवणानंतर असह्य कळ"], "urgent", "gastrointestinal"],
  ["acute_cholangitis_charcot", "Acute Cholangitis", "पित्त नली का गंभीर संक्रमण", "पित्तनलिकेचा गंभीर संसर्ग (कोलेंजायटिस)", ["कावीळ", "थंडी वाजून तीव्र ताप", "उजव्या कुशीत वेदना"], "emergency", "gastrointestinal"],

  // Cardio & Vascular Expansion (25 items)
  ["aortic_stenosis_heart_valve", "Aortic Valve Stenosis", "एओर्टिक वाल्व का सिकुड़ना", "हृदयाच्या महाधमनी झडपेचे आकुंचन", ["चालताना धाप", "छातीत दुखणे", "व्यायामादरम्यान चक्कर येऊन पडणे"], "urgent", "cardiovascular"],
  ["mitral_valve_prolapse", "Mitral Valve Prolapse (MVP)", "माइट्रल वाल्व प्रोलैप्स", "मायट्रल झडपेचा विकार (MVP)", ["छातीत अधूनमधून धडधड", "छातीत टोचणे", "थकवा"], "self_care", "cardiovascular"],
  ["aortic_dissection_tear", "Acute Aortic Dissection", "महाधमनी का फटना", "हृदयाच्या मुख्य रक्तवाहिनीला चीर (अओर्टिक डिसेक्शन)", ["छातीतून पाठीकडे जाणारी असह्य फाटल्यासारखी वेदना", "बीपीमध्ये तफावत"], "emergency", "cardiovascular"],
  ["thoracic_aortic_aneurysm", "Thoracic Aortic Aneurysm", "महाधमनी की थैली", "छातीतील मुख्य रक्तवाहिनी फुगणे", ["छातीत किंवा पाठीत खोलवर दुखणे", "आवाज बसणे"], "urgent", "cardiovascular"],
  ["abdominal_aortic_aneurysm_aaa", "Abdominal Aortic Aneurysm (AAA)", "पेट की मुख्य नस का फूलना", "पोटातील मुख्य रक्तवाहिनी फुगणे (AAA)", ["नाभीजवळ हृदयासारखे ठोके जाणवणारी गाठ", "कमरदुखी"], "emergency", "cardiovascular"],
  ["raynauds_phenomenon", "Raynaud's Phenomenon", "ठंड से उंगलियां नीली पड़ना", "थंडीमुळे हाताची बोटे पांढरी-निळी पडणे", ["थंडीत बोटे पांढरी, नंतर निळी व शेवटी लाल होणे", "वेदना"], "self_care", "cardiovascular"],
  ["buergers_disease_thromboangiitis", "Buerger's Disease (TAO)", "बीड़ी पीने से पैर की नसें बंद होना", "विडी पिण्यामुळे पायांची बोटे काळी पडणे (बर्गर रोग)", ["पायाच्या बोटांना असह्य वेदना", "बोटे काळी पडून गळणे (गँगरीन)"], "urgent", "cardiovascular"],
  ["vasovagal_syncope_fainting", "Vasovagal Syncope (Fainting Spell)", "घबराहट से बेहोश होना", "ताण किंवा उभे राहिल्याने तात्पुरती भोवळ", ["डोळ्यांसमोर अंधारी येऊन तात्पुरते पडणे", "पुन्हा लगेच शुद्धी"], "self_care", "cardiovascular"],
  ["supraventricular_tachycardia_svt", "Supraventricular Tachycardia (SVT)", "अचानक तेज दिल की धड़कन (एसवीटी)", "हृदयाचे अचानक अतिवेगवान ठोके (१५०-२००)", ["अचानक छातीत धडधड सुरू होणे व अचानक थांबणे", "चक्कर"], "urgent", "cardiovascular"],
  ["ventricular_tachycardia_vt", "Ventricular Tachycardia", "खतरनाक तेज धड़कन", "हृदयाचे धोकादायक वेगवान ठोके", ["अचानक चक्कर येऊन पडणे", "नाडी न लागणे", "छातीत तीव्र अस्वस्थता"], "emergency", "cardiovascular"],
  ["complete_heart_block_third_degree", "Third-Degree Complete Heart Block", "हार्ट ब्लॉक (पूर्ण ब्लॉकेज)", "हार्ट ब्लॉक (ठोके ३०-४० वर येणे)", ["हृदयाचे ठोके अतिशय मंद होणे", "वारंवार भोवळ येणे व बेशुद्धी"], "emergency", "cardiovascular"],

  // Neurological Expansion (25 items)
  ["subarachnoid_hemorrhage_sah", "Subarachnoid Hemorrhage (Aneurysm Rupture)", "दिमाग की नस फटना (ब्रेन ब्लीडिंग)", "मेंदूतील रक्तवाहिनी फुटून रक्तस्त्राव (SAH)", ["आयुष्यातील सर्वात तीव्र डोकेदुखी (विजेचा कडकडाट)", "मान आखडणे", "उलट्या"], "emergency", "neurological"],
  ["chronic_subdural_hematoma", "Chronic Subdural Hematoma", "बुजुर्गों में सिर में खून जमना", "वृद्धांमध्ये मार लागल्यानंतर मेंदूत रक्त साचणे", ["काही आठवड्यांपूर्वी मार लागल्यानंतर हळूहळू चाल मंदावणे", "विस्मरण"], "urgent", "neurological"],
  ["guillain_barre_syndrome_gbs", "Guillain-Barre Syndrome (GBS)", "जीबीएस (पैरों से ऊपर बढ़ता लकवा)", "पायांकडून वर सरकणारा पक्षाघात (GBS)", ["पायांपासून सुरू होऊन हातांकडे व छातीकडे जाणारा अशक्तपणा"], "emergency", "neurological"],
  ["myasthenia_gravis_muscle_weakness", "Myasthenia Gravis", "मायस्थेनिया (मांसपेशियों की थकान)", "स्नायूंचा तीव्र थकवा विकार (मायस्थेनिया)", ["दिवसाच्या शेवटी पापण्या जड पडणे", "गिळताना व बोलताना त्रास"], "urgent", "neurological"],
  ["amyotrophic_lateral_sclerosis_als", "Amyotrophic Lateral Sclerosis (ALS)", "एएलएस (मोटर न्यूरॉन डिजीज)", "मोटर न्यूरॉन आजार (ALS)", ["हात-पायांचे स्नायू बारीक होणे", "स्नायूंमध्ये थरथर", "गिळण्यास त्रास"], "doctor_soon", "neurological"],
  ["essential_tremor_hands", "Essential Tremor", "हाथ कांपना", "हात थरथरणे (काही काम करताना)", ["चहाचा कप उचलताना किंवा लिहिताना हात थरथरणे"], "self_care", "neurological"],
  ["normal_pressure_hydrocephalus_nph", "Normal Pressure Hydrocephalus (NPH)", "दिमाग में पानी का दबाव", "मेंदूतील पाण्याचा दाब (NPH)", ["चालताना पाय जमिनीला चिकटल्यासारखे वाटणे", "लघवीवर ताबा नसणे", "विस्मरण"], "doctor_soon", "neurological"],
  ["cauda_equina_syndrome_spine", "Cauda Equina Syndrome", "रीढ़ की हड्डी की नस दबना (आपातकाल)", "मणक्याच्या खालच्या नसांचा तातडीचा अडथळा", ["जांघ व शौचाची जागा सुन्न होणे (Saddle anesthesia)", "लघवी-शौच बंद"], "emergency", "neurological"],
  ["idiopathic_intracranial_hypertension", "Idiopathic Intracranial Hypertension", "दिमाग का प्रेशर बढ़ना", "मेंदूतील पाण्याचा दाब विनाकारण वाढणे", ["लठ्ठ महिलांमध्ये सतत डोकेदुखी", "दृष्टी धूसर होणे", "कानात शिट्टी"], "doctor_soon", "neurological"],

  // Metabolic & Endocrine Expansion (25 items)
  ["diabetic_ketoacidosis_dka", "Diabetic Ketoacidosis (DKA)", "डीकेए (डायबिटीज की गंभीर आपात स्थिति)", "डायबिटीज कोमा व आम्लबाधा (DKA)", ["फळांसारखा श्वासाला गोड वास", "उलट्या", "जलद खोल श्वास", "बेशुद्धी"], "emergency", "metabolic_endocrine"],
  ["hyperosmolar_hyperglycemic_state", "Hyperosmolar Hyperglycemic State (HHS)", "अत्यधिक शुगर कोमा", "अतिउच्च साखर कोमा (साखर > ६००)", ["प्रचंड डिहायड्रेशन", "बेशुद्धी", "साखर अतिशय जास्त"], "emergency", "metabolic_endocrine"],
  ["cushings_syndrome_hypercortisol", "Cushing's Syndrome", "कुशिंग सिंड्रोम", "कर्टिसोल संप्रेरक अतिवाढ (कुशिंग सिंड्रोम)", ["चंद्रासारखा गोल चेहरा (Moon face)", "मानेच्या मागे चरबीचा गोळा", "जांभळे चट्टे"], "doctor_soon", "metabolic_endocrine"],
  ["addisons_disease_adrenal_failure", "Addison's Disease", "एडिसन रोग (एड्रीनल ग्रंथि खराबी)", "ॲडिसन्स आजार (ॲड्रिनल ग्रंथीची कमतरता)", ["अतिशय अशक्तपणा", "त्वचा काळी पडणे", "लो बीपी", "मिठाची तीव्र इच्छा"], "urgent", "metabolic_endocrine"],
  ["acromegaly_growth_hormone", "Acromegaly (Excess Growth Hormone)", "एक्रोमेगाली", "वाढीचे संप्रेरक वाढणे (हात-पाय मोठे होणे)", ["हात, पाय, जबडा व जीभ असामान्य मोठी होणे", "बूट व अंगठी घट्ट होणे"], "doctor_soon", "metabolic_endocrine"],
  ["hypercalcemia_high_calcium", "Hypercalcemia (High Blood Calcium)", "कैल्शियम की अधिकता", "रक्तातील कॅल्शियमचे अतिप्रमाण", ["बद्धकोष्ठता", "वारंवार लघवी", "हाडे दुखणे", "गोंधळलेली अवस्था"], "urgent", "metabolic_endocrine"],
  ["hypocalcemia_tetany_spasm", "Hypocalcemia & Tetany", "कैल्शियम की कमी (मांसपेशियों में ऐंठन)", "कॅल्शियमची तीव्र कमतरता व स्नायूंचा ताण (टेटनी)", ["हाताची बोटे वाकडी होणे (Carpopedal spasm)", "ओठांभोवती मुंग्या"], "urgent", "metabolic_endocrine"],
  ["diabetic_foot_ulcer", "Diabetic Foot Ulcer", "डायबिटिक फुट अल्सर", "मधुमेहातील न भरणारी पायाची जखम", ["तळपायाला न दुखणारी खोल जखम", "पू किंवा दुर्गंध"], "urgent", "metabolic_endocrine"],

  // Women's & Maternal Expansion (25 items)
  ["ectopic_pregnancy_tubal", "Ectopic Pregnancy (Tubal Rupture)", "अस्थानिक गर्भावस्था (एक्टोपिक प्रेग्नेंसी)", "गर्भाशयाबाहेरील गर्भधारणा (एक्टोपिक)", ["पाळी चुकल्यानंतर पोटाच्या एका बाजूला असह्य कळ", "रक्तस्त्राव", "चक्कर"], "emergency", "womens_maternal"],
  ["threatened_miscarriage_abortion", "Threatened Miscarriage", "गर्भपात का खतरा", "गर्भपाताचा धोका (रक्तस्त्राव)", ["गरोदरपणाच्या पहिल्या ३ महिन्यांत हलका रक्तस्त्राव व ओटीपोटात मंद कळ"], "urgent", "womens_maternal"],
  ["placenta_previa_bleeding", "Placenta Previa (Painless Bleeding)", "प्लेसेंटा प्रीविया (आंवल नीचे होना)", "वार खाली असणे व वेदनाविरहित रक्तस्त्राव", ["गरोदरपणाच्या शेवटच्या महिन्यांत वेदनेशिवाय अचानक लाल रक्तस्त्राव"], "emergency", "womens_maternal"],
  ["abruptio_placentae_emergency", "Abruptio Placentae (Placental Separation)", "प्लेसेंटा का समय से पहले अलग होना", "वार गर्भाशयापासून आधीच सुटणे", ["पोटात सतत असह्य कडकपणा व तीव्र वेदना", "काळे रक्त"], "emergency", "womens_maternal"],
  ["postpartum_puerperal_sepsis", "Puerperal Sepsis (Childbed Fever)", "प्रसव के बाद का संक्रमण (सूतिका ज्वर)", "बाळंतपणानंतरचा संसर्ग (सूतिका ज्वर)", ["बाळंतपणानंतर तीव्र ताप", "दुर्गंधीयुक्त रक्तस्त्राव (Lochia)", "ओटीपोटात वेदना"], "emergency", "womens_maternal"],
  ["bartholins_abscess_vulva", "Bartholin's Cyst & Abscess", "बार्थोलिन ग्रंथि का फोड़ा", "बार्थोलिन ग्रंथीचा पूयुक्त गळू", ["योनिमुखाच्या एका बाजूला मोठी अत्यंत वेदनादायी गाठ", "चालताना व बसताना त्रास"], "urgent", "womens_maternal"],
  ["premenstrual_dysphoric_pmdd", "Premenstrual Dysphoric Disorder (PMDD)", "माहवारी से पहले गंभीर चिड़चिड़ापन", "पाळीपूर्व तीव्र मानसिक ताण (PMDD)", ["पाळीपूर्वी १ आठवडा तीव्र नैराश्य, चिडचिड व राग", "पाळी सुरू झाल्यावर आराम"], "doctor_soon", "womens_maternal"],
  ["adenomyosis_uterine_enlargement", "Adenomyosis", "एडेनोमायोसिस", "गर्भाशयाची सूज व वेदना (ॲडिनोमायोसिस)", ["पाळीत तीव्र पोटदुखी", "मोठ्या प्रमाणावर रक्तस्त्राव", "गर्भाशय मोठे होणे"], "doctor_soon", "womens_maternal"],

  // Pediatric Expansion (25 items)
  ["neonatal_sepsis_infection", "Neonatal Sepsis", "नवजात शिशु का गंभीर संक्रमण", "नवजात बाळाचा गंभीर संसर्ग (सेप्सिस)", ["दूध पिणे बंद करणे", "शरीर थंड पडणे किंवा ताप", "सुस्त पडून राहणे"], "emergency", "pediatric"],
  ["infantile_hypertrophic_pyloric_stenosis", "Infantile Pyloric Stenosis", "शिशु में उल्टी की रुकावट", "लहान बाळाच्या जठराचा अडथळा", ["दूध पिल्यावर २-३ फुटांवर उडणारी तीव्र उलटी (Projectile)", "सतत भूक"], "urgent", "pediatric"],
  ["laryngomalacia_infant_stridor", "Laryngomalacia", "शिशु की सांस में आवाज", "लहान बाळाच्या श्वासातील घरघर (लॅरिंजोमॅलेशिया)", ["पाठीवर झोपल्यावर श्वास घेताना कर्कश आवाज", "पोटात पालथे झोपवल्यावर आराम"], "doctor_soon", "pediatric"],
  ["vitamin_a_deficiency_bitot", "Vitamin A Deficiency (Night Blindness)", "रतौंधी (विटामिन ए की कमी)", "रातांधळेपणा (व्हिटॅमिन-ए ची कमतरता)", ["संध्याकाळी कमी दिसणे", "डोळ्यावर पांढरा त्रिकोणी डाग (Bitot's spots)"], "self_care", "pediatric"],
  ["kwashiorkor_protein_deficiency", "Kwashiorkor (Protein Malnutrition)", "क्वाशिओरकोर (प्रोटीन कुपोषण)", "प्रथिनांच्या कमतरतेमुळे कुपोषण (क्वाशिओरकॉर)", ["पोट फुगणे", "पायांवर सूज", "केस तांबूस व पातळ होणे", "त्वचा सोलवटणे"], "urgent", "pediatric"],
  ["marasmus_calorie_wasting", "Marasmus (Severe Calorie Deficiency)", "मरास्मस (सूखा रोग)", "कॅलरीजच्या अभावामुळे हाडकुळे होणे (मरास्मस)", ["वृद्धासारखा सुरकुतलेला चेहरा", "शरीरावर फक्त कातडी व हाडे उरणे"], "urgent", "pediatric"],

  // Renal & Urology Expansion (25 items)
  ["nephrotic_syndrome_proteinuria", "Nephrotic Syndrome", "नेफ्रोटिक सिंड्रोम (प्रोटीन लीक होना)", "नेफ्रोटिक सिंड्रोम (लघवीतून प्रथिने जाणे)", ["सकाळी उठल्यावर डोळ्यांभोवती मोठी सूज", "पायांवर सूज", "फेसाळ लघवी"], "urgent", "renal_urological"],
  ["acute_post_strep_glomerulonephritis", "Post-Streptococcal Glomerulonephritis", "गले के संक्रमण के बाद किडनी रोग", "घशाच्या संसर्गानंतर मूत्रपिंडाचा दाह", ["घसा दुखल्यानंतर २ आठवड्यांनी चहाच्या रंगाची लघवी", "चेहऱ्यावर सूज", "हाय बीपी"], "urgent", "renal_urological"],
  ["autosomal_dominant_polycystic_kidney", "Polycystic Kidney Disease (PKD)", "किडनी में गांठें (पॉलीसिस्टिक)", "मूत्रपिंडात पाण्याच्या गाठी (पॉलीसिस्टिक किडनी)", ["दोन्ही कुशीत दुखणे", "वारंवार लघवीतून रक्त", "कमी वयात हाय बीपी"], "doctor_soon", "renal_urological"],
  ["acute_testicular_torsion", "Testicular Torsion (Twisted Testicle)", "अंडकोष में अचानक तेज दर्द (मरोड़)", "वृषणाला पीळ पडणे (टेस्टीक्युलर टॉर्शन)", ["एका बाजूच्या अंडकोषात अचानक असह्य कळ", "अंडकोष वर खेचला जाणे", "उलटी"], "emergency", "renal_urological"],
  ["acute_epididymo_orchitis", "Epididymo-Orchitis", "अंडकोष की सूजन व संक्रमण", "अंडकोषाची तीव्र सूज व संसर्ग", ["अंडकोष लाल व प्रचंड सुजणे", "तीव्र ताप", "लघवीत जळजळ"], "urgent", "renal_urological"],
  ["hydrocele_testicular_swelling", "Hydrocele", "अंडकोष में पानी भरना (हाइड्रोसील)", "अंडकोषात पाणी भरणे (हायड्रोसील)", ["अंडकोषाची वेदनारहित मोठी वाढ", "जडपणा"], "doctor_soon", "renal_urological"],
  ["varicocele_scrotal_veins", "Varicocele", "अंडकोष की नसों का फूलना", "अंडकोषातील फुगलेल्या शिरा (व्हेरिकोसील)", ["अंडकोषात गांडुळांच्या पिशवीसारखा गुंता जाणवणे", "मंद दुखणे"], "doctor_soon", "renal_urological"],
  ["phimosis_tight_foreskin", "Phimosis", "लिंग की चमड़ी का पीछे न जाना", "शिश्नाची त्वचा मागे न जाणे (फायमोसिस)", ["लघवी करताना शिश्नाची त्वचा फुग्यासारखी फुगणे", "वेदना"], "doctor_soon", "renal_urological"],
  ["paraphimosis_strangulated_foreskin", "Paraphimosis", "लिंग की चमड़ी का फंस जाना", "शिश्नाची त्वचा मागे अडकणे (पॅराफायमोसिस)", ["शिश्नाचे टोक प्रचंड सुजणे व निळे पडणे", "असह्य वेदना"], "emergency", "renal_urological"],

  // Mental Health Expansion (20 items)
  ["social_anxiety_disorder", "Social Anxiety Disorder", "सामाजिक भय (सोशल एंग्जायटी)", "लोकांमध्ये जाण्याची भीती (सोशल ॲन्झायटी)", ["लोकांसमोर बोलताना प्रचंड भीती व घाम सुटणे", "गर्दी टाळणे"], "self_care", "mental_health"],
  ["agoraphobia_open_spaces", "Agoraphobia", "भीड़ या खुली जगहों का डर", "गर्दीच्या किंवा मोकळ्या जागेची भीती (ॲगोराफोबिया)", ["घराबाहेर एकटे पडण्याची तीव्र भीती", "पॅनिक अटॅक"], "doctor_soon", "mental_health"],
  ["acute_stress_reaction", "Acute Stress Reaction", "अचानक मानसिक सदमा", "अचानक मानसिक आघात / तीव्र ताण", ["मोठ्या दुर्घटनेनंतर स्तब्ध होणे", "काही न सुचणे", "थरकाप"], "self_care", "mental_health"],
  ["somatic_symptom_disorder", "Somatic Symptom Disorder", "शारीरिक लक्षणों की चिंता", "शरीराच्या दुखण्यांची अतिचिंता विकार", ["तपासण्या सामान्य असूनही सतत आजाराची भीती वाटणे"], "doctor_soon", "mental_health"],
  ["alcohol_withdrawal_delirium", "Alcohol Withdrawal (Delirium Tremens)", "शराब छोड़ने पर कंपन व दौरा", "दारू सोडल्यानंतरचे झटके व भ्रम (DT)", ["दारू बंद केल्यावर हात प्रचंड थरथरणे", "नसलेले प्राणी दिसणे", "ताप व घाम"], "emergency", "mental_health"],
  ["opioid_overdose_emergency", "Opioid Overdose (Naloxone Emergency)", "अफीम/ड्रग्स ओवरडोज", "अंमली पदार्थांचे अतिसेवन (ओव्हरडोस)", ["श्वास अतिशय मंद होणे", "बाहुल्या अतिशय बारीक", "बेशुद्धी"], "emergency", "mental_health"],

  // Oral & Dental Expansion (20 items)
  ["geographic_tongue_benign", "Geographic Tongue", "जीभ पर नक्शे जैसे दाग", "जिभेवर नकाशासारखे लाल-पांढरे चट्टे", ["जिभेवर ठिकठिकाणी बदलणारे लाल गुळगुळीत चट्टे", "तिखट खाताना जळजळ"], "self_care", "oral_dental"],
  ["burning_mouth_syndrome", "Burning Mouth Syndrome", "मुंह में जलन", "तोंडात व जिभेवर सतत जळजळ", ["तोंडात काही नसतानाही सतत तिखट खाल्ल्यासारखी जळजळ"], "self_care", "oral_dental"],
  ["angular_cheilitis_mouth_corners", "Angular Cheilitis", "होंठों के कोनों का फटना", "ओठांच्या कोपऱ्यात भेगा पडणे व दुखणे", ["ओठांच्या दोन्ही कोपऱ्यात लाल चिरा पडणे", "तोंड उघडताना आग"], "self_care", "oral_dental"],
  ["dry_socket_alveolar_osteitis", "Dry Socket (Post-Extraction)", "दांत निकालने के बाद तेज दर्द", "दाढ काढल्यानंतरचा तीव्र त्रास (ड्राय सॉकेट)", ["दाढ काढल्याच्या ३ दिवसांनी अचानक असह्य ठसठस", "दुर्गंध"], "urgent", "oral_dental"],
  ["pericoronitis_wisdom_tooth", "Pericoronitis (Wisdom Tooth)", "अक्ल दाढ़ की सूजन", "अक्कलदाढेवरील हिरडीची सूज", ["अक्कलदाढ येताना हिरडी सुजणे", "तोंड उघडताना वेदना"], "doctor_soon", "oral_dental"],

  // Hepatic Expansion (20 items)
  ["autoimmune_hepatitis_liver", "Autoimmune Hepatitis", "ऑटोइम्यून हेपेटाइटिस", "स्वप्रतिकारशक्तीमुळे यकृतदाह", ["थकवा", "सांधेदुखी", "कावीळ"], "doctor_soon", "hepatic_biliary"],
  ["primary_biliary_cholangitis", "Primary Biliary Cholangitis", "पित्त नलियों की बीमारी", "पित्तवाहिन्यांची झीज (PBC)", ["शरीराला तीव्र खाज", "थकवा", "डोळ्यांभोवती पिवळ्या गाठी"], "doctor_soon", "hepatic_biliary"],
  ["amoebic_liver_abscess", "Amoebic Liver Abscess", "लिवर में मवाद (फोड़ा)", "यकृतात पू भरणे (लिव्हर ॲब्सेस)", ["उजव्या कुशीत तीव्र वेदना", "थंडी वाजून ताप", "उजव्या खांद्यात कळ"], "urgent", "hepatic_biliary"],
  ["hydatid_cyst_of_liver", "Hydatid Cyst of Liver", "लिवर में कीड़े की गांठ", "यकृतातील हायडॅटिड गाठ (जंतांची गाठ)", ["उजव्या पोटात वेदनारहित मोठी गाठ", "अस्वस्थता"], "doctor_soon", "hepatic_biliary"],

  // Oncology Expansion (STRICT: Zero home cures, evaluation and tertiary hospital only) (20 items)
  ["bladder_cancer_urothelial", "Urinary Bladder Cancer", "मूत्राशय का कैंसर", "मूत्राशयाचा कर्करोग (ब्लॅडर कॅन्सर)", ["लघवीतून वेदनारहित लाल रक्त पडणे (Painless hematuria)", "वारंवार लघवी"], "urgent", "oncology_cancers"],
  ["renal_cell_carcinoma_kidney", "Renal Cell Carcinoma (Kidney Cancer)", "गुर्दे का कैंसर", "मूत्रपिंडाचा कर्करोग (किडनी कॅन्सर)", ["कुशीत मोठी गाठ", "लघवीतून रक्त", "कुशीत वेदना"], "urgent", "oncology_cancers"],
  ["endometrial_uterine_cancer", "Endometrial (Uterine) Cancer", "गर्भाशय का कैंसर", "गर्भाशयाचा कर्करोग (एंडोमेट्रिअल कॅन्सर)", ["मेनोपॉजनंतर पुन्हा रक्तस्त्राव", "ओटीपोटात जडपणा"], "urgent", "oncology_cancers"],
  ["testicular_cancer_seminoma", "Testicular Cancer", "अंडकोष का कैंसर", "वृषणाचा कर्करोग (टेस्टीक्युलर कॅन्सर)", ["अंडकोषात न दुखणारी कडक वेगाने वाढणारी गाठ"], "urgent", "oncology_cancers"],
  ["penile_cancer_carcinoma", "Penile Cancer", "लिंग का कैंसर", "शिश्नाचा कर्करोग (पेनाईल कॅन्सर)", ["शिश्नाच्या टोकावर न भरणारा व्रण किंवा गाठ", "दुर्गंधी"], "urgent", "oncology_cancers"],
  ["gallbladder_cancer", "Gallbladder Cancer", "पित्ताशय का कैंसर", "पित्ताशयाचा कर्करोग (गॉलब्लाडर कॅन्सर)", ["उजव्या कुशीत गाठ", "सतत वाढणारी कावीळ", "वजन घट"], "urgent", "oncology_cancers"],
  ["cholangiocarcinoma_bile_duct", "Cholangiocarcinoma (Bile Duct Cancer)", "पित्त नली का कैंसर", "पित्तनलिकेचा कर्करोग", ["तीव्र कावीळ", "अंगाला प्रचंड खाज", "पांढऱ्या रंगाचे शौच"], "urgent", "oncology_cancers"],
  ["melanoma_skin_cancer", "Malignant Melanoma", "त्वचा का काला कैंसर (मेलेनोमा)", "त्वचेचा घातक काळा कर्करोग (मेलानोमा)", ["तीळ अचानक वेगाने वाढणे", "तिळाचा रंग व कडा बदलणे (ABCDE नियम)"], "urgent", "oncology_cancers"],
  ["basal_cell_carcinoma_skin", "Basal Cell Carcinoma (BCC)", "त्वचा का कैंसर (बीसीसी)", "त्वचेचा बेसल सेल कर्करोग", ["चेहऱ्यावर न भरणारा चकचकीत मोतीसारखा फोड"], "urgent", "oncology_cancers"],
  ["squamous_cell_carcinoma_skin", "Squamous Cell Carcinoma of Skin", "त्वचा का कैंसर (एससीसी)", "त्वचेचा स्क्वॅमस सेल कर्करोग", ["त्वचेवर खपली असलेला कडक लाल व्रण"], "urgent", "oncology_cancers"],
  ["glioblastoma_multiforme_gbm", "Glioblastoma Multiforme (GBM)", "गंभीर ब्रेन ट्यूमर (ग्लियोब्लास्टोमा)", "मेंदूचा अत्यंत घातक ट्युमर (ग्लिओब्लास्टोमा)", ["सकाळी तीव्र उलट्या व डोकेदुखी", "स्वभावात बदल", "झटके"], "emergency", "oncology_cancers"],
  ["acute_myeloid_leukemia_aml", "Acute Myeloid Leukemia (AML)", "तीव्र रक्त कैंसर (एएमएल)", "तीव्र रक्ताचा कर्करोग (एएमएल)", ["अचानक तीव्र ताप", "हिरड्यांतून रक्तस्त्राव", "अतिशय पांढरे पडणे"], "urgent", "oncology_cancers"],
  ["chronic_myeloid_leukemia_cml", "Chronic Myeloid Leukemia (CML)", "क्रोनिक ब्लड कैंसर", "जुनाट रक्ताचा कर्करोग (सीएमएल)", ["पोटाच्या डाव्या बाजूला मोठी प्लीहा (Spleen)", "रात्री घाम", "वजन घट"], "urgent", "oncology_cancers"],

  // Emergency & Trauma Expansion (20 items)
  ["chemical_burn_eye_skin", "Chemical Burn (Acid / Alkali)", "एसिड या केमिकल से जलना", "ॲसिड किंवा रासायनिक विषारी भाजणे", ["तीव्र जळजळ", "त्वचा किंवा डोळा पांढरा/काळा पडणे"], "emergency", "emergency_trauma"],
  ["electrical_burn_shock", "High-Voltage Electrical Burn & Shock", "बिजली का करंट लगना", "विजेचा तीव्र धक्का व भाजणे", ["प्रवेश व बाहेर पडण्याच्या जागी जळणे", "हृदयाचे ठोके अनियमित"], "emergency", "emergency_trauma"],
  ["cardiac_tamponade_shock", "Cardiac Tamponade", "हृदय के चारों ओर खून भरना", "हृदयाच्या आवरणात रक्त साचणे (टॅम्पोनेड)", ["बीपी कोसळणे", "मानेच्या शिरा फुगणे", "हृदयाचे ठोके मंद"], "emergency", "emergency_trauma"],
  ["flail_chest_rib_fracture", "Flail Chest (Multiple Rib Fractures)", "पसलियां टूटना (छाती की गंभीर चोट)", "बरगड्या अनेक ठिकाणी मोडणे", ["श्वास घेताना छाती उलट दिशेने हलणे (Paradoxical breathing)"], "emergency", "emergency_trauma"],
  ["crush_injury_compartment_syndrome", "Crush Injury & Compartment Syndrome", "दबने से गंभीर चोट (कंपार्टमेंट सिंड्रोम)", "जड वस्तूखाली अवयव दबणे व स्नायूंचा दाब", ["अवयवात असह्य ताणलेली वेदना", "नाडी न लागणे", "पाय लाकडासारखा ताठ"], "emergency", "emergency_trauma"],
  ["spinal_cord_injury_trauma", "Acute Spinal Cord Injury", "रीढ़ की हड्डी की चोट (लकवा)", "पाठीच्या कण्याला गंभीर मार व लुळे पडणे", ["अपघातानंतर हात-पाय पूर्णपणे हलवता न येणे", "संवेदना जाणे"], "emergency", "emergency_trauma"],
  ["carbon_monoxide_poisoning", "Carbon Monoxide Poisoning (Chulha/Heater)", "अंगीठी के धुएं से दम घुटना", "बंद खोलीत चुलीच्या धुरामुळे विषबाधा", ["चेरी-लाल ओठ", "तीव्र डोकेदुखी", "भोवळ", "बेशुद्धी"], "emergency", "emergency_trauma"],
  ["methanol_poisoning_illicit_liquor", "Methanol Poisoning (Spurious Alcohol)", "जहरीली शराब से अंधापन", "विषारी दारूमुळे विषबाधा (मिथॅनॉल)", ["डोळ्यांसमोर बर्फाचे वादळ दिसणे / अंधत्व", "उलट्या", "बेशुद्धी"], "emergency", "emergency_trauma"],
  ["kerosene_hydrocarbon_ingestion", "Kerosene / Petrol Ingestion in Child", "मिट्टी का तेल पीना (केरोसिन)", "लहान मुलाने रॉकेल किंवा डिझेल पिणे", ["उलटी करू देऊ नका! खोकला", "श्वास घेण्यास धाप"], "emergency", "emergency_trauma"],
  ["corrosive_acid_alkali_ingestion", "Corrosive Acid / Toilet Cleaner Ingestion", "तेजाब पीना (एसिड पॉइजनिंग)", "ॲसिड किंवा टॉयलेट क्लिनर पोटात जाणे", [" तोंडाची व अन्ननलिकेची तीव्र जळजळ", "लाळ न गिळता येणे"], "emergency", "emergency_trauma"]
];

const expansion = rawList.map(([id, canonical_name, name_hi, name_mr, symptoms, urgency, cat]) => {
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
    general_information: [`${name_mr} हा विकार असून शासकीय आरोग्य केंद्र किंवा रुग्णालयात तपासणी आवश्यक आहे.`],
    safe_supportive_care: isCancer || isEmerg ? [] : ["विश्रांती घ्या.", "पाणी भरपूर प्या.", "सकस आहार घ्या."],
    things_to_avoid: isCancer ? ["घरगुती उपायांवर वेळ वाया घालवू नका."] : isEmerg ? ["विलंब न करता १०८ वर कॉल करा."] : ["अनावश्यक औषधे घेणे टाळा."],
    red_flags: ["तीव्र जीवघेणी लक्षणे", "रक्तस्त्राव", "बेशुद्ध पडणे"],
    urgency,
    when_to_visit_doctor: [isCancer ? "बायोप्सी व तपासणीसाठी शासकीय कॅन्सर सेंटरला भेट द्या." : isEmerg ? "१०८ रुग्णवाहिकेतून तातडीने शासकीय रुग्णालयात दाखल व्हा." : "शासकीय प्राथमिक आरोग्य केंद्रात (PHC) संपर्क साधा."],
    appropriate_specialty: isCancer ? ["Oncologist"] : isEmerg ? ["Emergency Physician"] : ["General Physician", "Medical Officer"],
    facility_type: isCancer ? ["GMC Cancer Centre", "District Hospital"] : isEmerg ? ["District Hospital", "GMC Trauma Care", "108 Ambulance"] : ["PHC", "Rural Hospital"],
    emergency_action: isCancer ? "महात्मा फुले जन आरोग्य योजना (MJPJAY) अंतर्गत सर्व उपचार मोफत आहेत." : isEmerg ? "तातडीने १०८ वर कॉल करा!" : ""
  });
});

module.exports = expansion;
