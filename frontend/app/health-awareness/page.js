"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { useLanguage } from "@/context/LanguageContext";
import {
  HeartPulse,
  Baby,
  ShieldAlert,
  Apple,
  AlertOctagon,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  PhoneCall,
  Activity,
  Droplets,
  Volume2,
  BookOpen,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

export function HealthAwarenessPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [playingTopicId, setPlayingTopicId] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const { language, t } = useLanguage();

  const categories = [
    { id: "all", label: language === "mr" ? "सर्व आरोग्य विषय" : language === "hi" ? "सभी स्वास्थ्य विषय" : "All Health Topics" },
    { id: "maternal", label: language === "mr" ? "माता व बाल आरोग्य" : language === "hi" ? "मातृ एवं शिशु स्वास्थ्य" : "Maternal & Child Care" },
    { id: "emergency", label: language === "mr" ? "आपत्कालीन व सर्पदंश" : language === "hi" ? "आपातकाल व सर्पदंश" : "Emergency & First Aid" },
    { id: "chronic", label: language === "mr" ? "रक्तदाब व मधुमेह (NCD)" : language === "hi" ? "बीपी व शुगर (NCD)" : "Hypertension & Diabetes" },
    { id: "seasonal", label: language === "mr" ? "पावसाळी आजार व पाणी" : language === "hi" ? "मौसमी बीमारियां व जल" : "Seasonal Infections & Water" },
    { id: "cancer", label: language === "mr" ? "कर्करोग व मोफत योजना" : language === "hi" ? "कैंसर व सरकारी योजनाएं" : "Cancer & Government Schemes" },
    { id: "mental", label: language === "mr" ? "मानसिक आरोग्य (टेलि-मानस)" : language === "hi" ? "मानसिक स्वास्थ्य (टेली-मानस)" : "Mental Wellness" },
  ];

  const topics = [
    {
      id: "top-1",
      category: "maternal",
      image: "/images/awareness/maternal_child_care.jpg",
      titleEn: "Antenatal Checkups, Maternal Nutrition & Anemia Prevention",
      titleHi: "गर्भावस्था में जांच, पौष्टिक आहार और खून की कमी से बचाव",
      titleMr: "गरोदरपणातील नियमित तपासणी, पोषण व रक्तक्षय (ॲनिमिया) प्रतिबंध",
      icon: Baby,
      badge: language === "mr" ? "माता व बाल आरोग्य" : language === "hi" ? "मातृ स्वास्थ्य" : "Maternal Health",
      badgeVariant: "teal",
      summaryEn: "Regular antenatal visits at your local Primary Health Centre (PHC) ensure the safety of both mother and child with free iron-folic acid tablets and nutritional support.",
      summaryHi: "प्राथमिक स्वास्थ्य केंद्र (PHC) पर नियमित प्रसवपूर्व जांच, मुफ्त आयरन-फोलिक एसिड की गोलियां और पोषण सहायता से जच्चा-बच्चा दोनों स्वस्थ रहते हैं।",
      summaryMr: "प्राथमिक आरोग्य केंद्रातील (PHC) नियमित तपासणी, मोफत लोह व फॉलिक ॲसिडच्या गोळ्या आणि सकस आहारामुळे माता व बाळाचे आरोग्य सुरक्षित राहते.",
      pointsEn: [
        "Attend at least 4 scheduled ANC checkups during pregnancy at your nearest PHC/Sub-Centre.",
        "Take daily prescribed Iron & Folic Acid (IFA) tablets after meals to maintain healthy hemoglobin.",
        "Register for institutional delivery under JSSK for 100% free hospital transit, medicines, and delivery.",
        "Exclusive breastfeeding for the first 6 months provides vital antibodies and complete infant nourishment."
      ],
      pointsHi: [
        "गर्भावस्था के दौरान नजदीकी प्राथमिक स्वास्थ्य केंद्र पर कम से कम 4 प्रसवपूर्व जांच (ANC) अवश्य करवाएं।",
        "खून की कमी (एनीमिया) से बचने के लिए भोजन के बाद आयरन और फोलिक एसिड की गोलियां नियमित लें।",
        "जननी शिशु सुरक्षा कार्यक्रम (JSSK) के तहत मुफ्त एम्बुलेंस और अस्पताल प्रसव के लिए पंजीकरण कराएं।",
        "जन्म के पहले 6 महीने केवल स्तनपान कराएं, जो शिशु को संक्रामक बीमारियों से जीवनभर सुरक्षा देता है।"
      ],
      pointsMr: [
        "गरोदरपणात जवळच्या प्राथमिक आरोग्य केंद्रात (PHC) किंवा उपकेंद्रात किमान ४ वेळा प्रसवपूर्व तपासणी (ANC) करून घ्या.",
        "रक्तक्षय (ॲनिमिया) टाळण्यासाठी जेवणानंतर नियमितपणे आयर्न व फॉलिक ॲसिडच्या गोळ्या स्वच्छ पाण्यासोबत घ्या.",
        "जननी शिशु सुरक्षा योजनेअंतर्गत (JSSK) मोफत रुग्णवाहिका प्रवास व १००% मोफत सुरक्षित प्रसूतीचा लाभ घ्या.",
        "पहिल्या ६ महिन्यांपर्यंत बाळाला केवळ आईचे दूध द्यावे; यामुळे बाळाची रोगप्रतिकारक शक्ती मजबूत होते."
      ],
      warningEn: "Seek immediate emergency care if severe headache, blurred vision, severe abdominal pain, or sudden swelling occurs.",
      warningHi: "यदि अचानक तेज सिरदर्द, आंखों के आगे अंधेरा, पेट में तेज दर्द या पैरों में भारी सूजन हो तो तुरंत अस्पताल जाएं।",
      warningMr: "तीव्र डोकेदुखी, डोळ्यांसमोर अंधारी येणे, अचानक तीव्र पोटदुखी किंवा अंगावर सूज आल्यास वेळ न घालवता त्वरित रुग्णालयात जा.",
      helpline: "102 / 108",
      helplineLabel: language === "mr" ? "JSSK / १०८ रुग्णवाहिका" : language === "hi" ? "102 / 108 एम्बुलेंस" : "102 / 108 Ambulance",
    },
    {
      id: "top-2",
      category: "emergency",
      image: "/images/awareness/snakebite_firstaid.jpg",
      titleEn: "Snakebite First Aid Protocol & Free Anti-Snake Venom (ASV)",
      titleHi: "सर्पदंश प्राथमिक उपचार और सरकारी अस्पतालों में मुफ्त ASV",
      titleMr: "सर्पदंश शास्त्रीय प्रथमोपचार व शासकीय केंद्रात मोफत अँटी-स्नेक व्हेनम (ASV)",
      icon: ShieldAlert,
      badge: language === "mr" ? "आपत्कालीन प्रथमोपचार" : language === "hi" ? "आपातकालीन उपचार" : "Emergency Protocol",
      badgeVariant: "danger",
      summaryEn: "Snakebite is a medical emergency. Never cut, suck, or tie tight tourniquets. Immediately immobilize the limb, keep the patient calm, and reach the nearest PHC with ASV.",
      summaryHi: "सांप काटने पर घबराएं नहीं। काटे गए अंग पर चीरा न लगाएं, न ही कसकर धागा बांधें। तुरंत अंग को स्थिर रखें और मुफ्त एंटी-वेनम (ASV) के लिए सरकारी अस्पताल पहुंचें।",
      summaryMr: "सर्पदंश हा आपत्कालीन वैद्यकीय प्रसंग आहे. जखमेवर काप मारू नका, रक्त चोखू नका किंवा घट्ट दोरी बांधू नका. बाधित अवयव स्थिर ठेवून तात्काळ जवळच्या शासकीय PHC मध्ये जा.",
      pointsEn: [
        "DO NOT use tight tourniquets, do not cut the bite site, and do not waste time on faith healers.",
        "Immobilize the bitten limb using a simple wooden splint or bandage just like a bone fracture.",
        "Keep the patient calm and lying down to slow venom absorption in blood circulation.",
        "Call 108 immediately. Anti-Snake Venom (ASV) is available 100% free at all Government Medical Colleges, District Hospitals, and PHCs."
      ],
      pointsHi: [
        "काटे गए स्थान पर चीरा न लगाएं, मुंह से जहर न चूसें और झाड़-फूंक के चक्कर में कीमती समय बर्बाद न करें।",
        "काटे हुए हाथ या पैर को लकड़ी की पट्टी (Splint) से फ्रैक्चर की तरह स्थिर रखें, मरीज को दौड़ने या चलने न दें।",
        "मरीज को शांत और आरामदायक स्थिति में रखें ताकि शरीर में विष तेजी से न फैले।",
        "तुरंत 108 डायल करें। सभी सरकारी अस्पतालों और प्राथमिक स्वास्थ्य केंद्रों (PHC) में एंटी-स्नेक वेनम (ASV) मुफ्त उपलब्ध है।"
      ],
      pointsMr: [
        "दंशाच्या जागेवर काप मारू नका, रक्त चोखू नका आणि झाडपाला किंवा मांत्रिकाच्या नादी लागून वेळ वाया घालवू नका.",
        "हाताला किंवा पायाला दंश झाला असल्यास लाकडी पट्टी व कपड्याने अवयव हालचाल न करता स्थिर (Splint) बांधा.",
        "रुग्णाला शांत ठेवा व पळू किंवा चालू देऊ नका, ज्यामुळे शरीरात विष वेगाने पसरत नाही.",
        "तात्काळ १०८ वर कॉल करा. शासकीय प्राथमिक आरोग्य केंद्र (PHC), ग्रामीण रुग्णालय व GMC मध्ये अँटी-स्नेक व्हेनम (ASV) मोफत उपलब्ध असते."
      ],
      warningEn: "Drowsiness, drooping eyelids (ptosis), difficulty swallowing, or breathing distress require instant 108 resuscitation.",
      warningHi: "पलकें झपकना, निगलने में कठिनाई, आवाज बैठना या सांस लेने में तकलीफ जहर फैलने के गंभीर संकेत हैं।",
      warningMr: "डोळ्यांच्या पापण्या जड होणे, गिळताना त्रास होणे किंवा श्वास घेण्यास अडचण येणे ही विषबाधेची गंभीर लक्षणे आहेत.",
      helpline: "108",
      helplineLabel: language === "mr" ? "१०८ मोफत रुग्णवाहिका" : language === "hi" ? "108 फ्री एम्बुलेंस" : "108 Free Ambulance",
    },
    {
      id: "top-3",
      category: "seasonal",
      image: "/images/awareness/monsoon_dengue.jpg",
      titleEn: "Monsoon Precautions, Dengue/Malaria & Safe Drinking Water",
      titleHi: "बरसात में जल सुरक्षा, डेंगू/मलेरिया से बचाव और ओआरएस",
      titleMr: "पावसाळ्यातील साथीचे आजार, डेंग्यू-हिवताप प्रतिबंध व शुद्ध पाणी",
      icon: Droplets,
      badge: language === "mr" ? "साथीचे आजार नियंत्रण" : language === "hi" ? "संक्रमण रोकथाम" : "Infection Control",
      badgeVariant: "success",
      summaryEn: "Prevent mosquito breeding by draining stagnant water drums, sleep under bed nets, and always boil drinking water to avoid jaundice, typhoid, and gastro.",
      summaryHi: "कूलर और बर्तनों में जमा पानी खाली करें, मच्छरदानी में सोएं और पीलिया व टायफाइड से बचने के लिए पानी उबालकर ही पिएं।",
      summaryMr: "पाण्याची भांडी झाकून ठेवा, साचलेले पाणी रिकामे करा, मच्छरदाणीचा वापर करा आणि कावीळ, विषमज्वर (टायफॉइड) टाळण्यासाठी पाणी उकळूनच प्या.",
      pointsEn: [
        "Observe a 'Dry Day' once a week by scrubbing and drying all water coolers, pots, and drums.",
        "Boil drinking water vigorously for at least 10 minutes or use Medichlor chlorine drops provided by Gram Panchayats.",
        "At the first sign of loose motions or diarrhea, immediately prepare Oral Rehydration Salts (ORS) in clean water.",
        "Never self-medicate with Brufen/Ibuprofen/Aspirin during fever, as they can cause dangerous bleeding in Dengue."
      ],
      pointsHi: [
        "सप्ताह में एक दिन 'सूखा दिवस' मनाएं—कूलर, पानी की टंकियों और बर्तनों को खाली करके सुखाएं।",
        "पीने का पानी कम से कम 10 मिनट उबालकर पिएं या ग्राम पंचायत द्वारा दी गई क्लोरीन की बूंदें डालें।",
        "दस्त या उल्टी शुरू होते ही तुरंत स्वच्छ पानी में ओआरएस (ORS) घोल बनाकर बार-बार पिलाएं।",
        "बुखार में बिना डॉक्टर के आइबुप्रोफेन या एस्पिरिन न लें, क्योंकि डेंगू में ये रक्तस्राव बढ़ा सकती हैं।"
      ],
      pointsMr: [
        "आठवड्यातून एक दिवस 'कोरडा दिवस' पाळा—कूलर, कुंड्या, नारळाच्या करवंट्या व पाण्याचे ड्रम रिकामे करून पुसून कोरडे करा.",
        "पिण्याचे पाणी किमान १० मिनिटे खळखळून उकळून थंड करून प्या किंवा ग्रामपंचायतीने दिलेले मेडीक्लोअर द्रावण वापरा.",
        "जुलाब किंवा उलट्या सुरू होताच त्वरित ओआरएस (ORS) चे पाणी तयार करून घोट-घोट प्यावे.",
        "तापात डॉक्टरांच्या सल्ल्याशिवाय आयबुप्रोफेन किंवा ॲस्पिरिनच्या गोळ्या घेऊ नका; डेंग्यूमध्ये त्यामुळे रक्तस्रावाचा धोका वाढतो."
      ],
      warningEn: "Continuous vomiting, bleeding from gums/nose, or intense abdominal pain are red flags for severe Dengue shock.",
      warningHi: "मसूड़ों से खून आना, लगातार उल्टी होना या पेट में असह्य दर्द गंभीर डेंगू के संकेत हैं, तुरंत PHC जाएं।",
      warningMr: "हिरड्यांतून रक्त येणे, सतत उलट्या होणे किंवा पोटात असह्य वेदना ही गंभीर डेंग्यूची चिन्हे आहेत.",
      helpline: "104 / 108",
      helplineLabel: language === "mr" ? "१०४ आरोग्य सल्ला / १०८" : language === "hi" ? "104 स्वास्थ्य हेल्पलाइन" : "104 Health Helpline",
    },
    {
      id: "top-4",
      category: "chronic",
      image: "/images/awareness/hypertension_diabetes.jpg",
      titleEn: "Hypertension & Diabetes: Early Screening at PHC NCD Clinics",
      titleHi: "उच्च रक्तचाप और मधुमेह (शुगर): मासिक जांच और स्वस्थ दिनचर्या",
      titleMr: "उच्च रक्तदाब व मधुमेह (साखर विकार): प्राथमिक आरोग्य केंद्रात मोफत तपासणी",
      icon: Activity,
      badge: language === "mr" ? "असंक्रामक आजार (NCD)" : language === "hi" ? "NCD प्रबंधन" : "NCD Management",
      badgeVariant: "info",
      summaryEn: "High blood pressure and diabetes develop silently. Get checked monthly for free at your local PHC NCD Clinic to protect your heart, kidneys, and eyes.",
      summaryHi: "हाई ब्लड प्रेशर और शुगर बिना किसी लक्षण के अंगों को नुकसान पहुंचाते हैं। प्राथमिक स्वास्थ्य केंद्र पर हर महीने मुफ्त जांच करवाएं।",
      summaryMr: "उच्च रक्तदाब आणि मधुमेह कोणतीही पूर्वसूचना न देता शरीराचे नुकसान करतात. हृदय, मूत्रपिंड व डोळ्यांच्या सुरक्षिततेसाठी दरमहा PHC मध्ये मोफत तपासणी करा.",
      pointsEn: [
        "Get your blood pressure and blood sugar tested every month for free at the nearest Health & Wellness Centre (Arogya Vardhini).",
        "Reduce high dietary salt intake (less than 1 teaspoon per day) and avoid packaged salty snacks and tobacco.",
        "Engage in at least 30 minutes of brisk walking or physical work every day.",
        "Never discontinue prescribed hypertension or diabetes medications on your own without a physician's advice."
      ],
      pointsHi: [
        "हर महीने नजदीकी आरोग्य वर्धिनी केंद्र पर ब्लड प्रेशर और शुगर की मुफ्त जांच अवश्य कराएं।",
        "भोजन में नमक की मात्रा कम करें (प्रतिदिन 1 चम्मच से कम) और बीड़ी, गुटखा व तंबाकू से पूरी तरह दूर रहें।",
        "रोजाना कम से कम 30 मिनट तेज गति से टहलें या हल्का व्यायाम करें।",
        "डॉक्टर द्वारा दी गई बीपी या शुगर की दवा कभी भी अपनी मर्जी से बंद न करें।"
      ],
      pointsMr: [
        "जवळच्या प्राथमिक आरोग्य केंद्र किंवा आरोग्यवर्धिनी केंद्रात दरमहा रक्तदाब व रक्तातील साखरेची विनामूल्य तपासणी करून घ्या.",
        "आहारातील मिठाचे प्रमाण कमी करा (दिवसाला १ चमच्यापेक्षा कमी) आणि तंबाखू, गुटखा, धूम्रपान पूर्णपणे बंद करा.",
        "दररोज किमान ३० मिनिटे वेगाने चालण्याचा किंवा शरीराचा व्यायाम करा.",
        "डॉक्टरांनी सुरू केलेल्या गोळ्या परस्पर कधीही बंद करू नका; नियमित गोळ्यांमुळे पक्षाघात (स्ट्रोक) टळतो."
      ],
      warningEn: "Sudden chest pressure, sweating, shortness of breath, or facial numbness/slurred speech require instant 108 hospital transit.",
      warningHi: "छाती में तेज दबाव, ठंडा पसीना आना, सांस फूलना या चेहरे का सुन्न होना हार्ट अटैक या स्ट्रोक हो सकता है, तुरंत 108 बुलाएं।",
      warningMr: "छातीत दाब जाणवणे, घाम फुटणे, धाप लागणे किंवा एका बाजूचे तोंड वाकडे होणे ही हृदयविकार किंवा पक्षाघाताची लक्षणे आहेत.",
      helpline: "108",
      helplineLabel: language === "mr" ? "१०८ तात्काळ ट्रॉमा सेवा" : language === "hi" ? "108 इमरजेंसी" : "108 Cardiac Transit",
    },
    {
      id: "top-5",
      category: "maternal",
      image: "/images/awareness/childhood_immunization.jpg",
      titleEn: "Mission Indradhanush: Life-Saving Childhood Immunization",
      titleHi: "मिशन इंद्रधनुष: सभी बच्चों का समय पर संपूर्ण टीकाकरण",
      titleMr: "मिशन इंद्रधनुष: बालकांचे संपूर्ण व वेळेवर मोफत लसीकरण",
      icon: Baby,
      badge: language === "mr" ? "बाल संगोपन व लसीकरण" : language === "hi" ? "शिशु टीकाकरण" : "Child Immunization",
      badgeVariant: "teal",
      summaryEn: "Protect infants from life-threatening diseases including Polio, Measles, Rubella, Tetanus, Hepatitis B, and Pneumonia with 100% free vaccines under Universal Immunization.",
      summaryHi: "पोलियो, खसरा, रूबेला, हेपेटाइटिस बी और निमोनिया जैसी जानलेवा बीमारियों से अपने बच्चे को बचाएं। सभी सरकारी उपकेंद्रों पर टीके बिल्कुल मुफ्त उपलब्ध हैं।",
      summaryMr: "पोलिओ, गोवर, रुबेला, धनुर्वात, हेपॅटायटिस बी आणि न्यूमोनिया यांसारख्या गंभीर आजारांपासून बाळाचे रक्षण करण्यासाठी अंगणवाडी व PHC मध्ये मोफत लस टोचून घ्या.",
      pointsEn: [
        "Follow the National Immunization Schedule diligently from birth up to 16 years of age.",
        "Birth doses (BCG, OPV-0, Hepatitis B) must be administered within the first 24 hours after delivery.",
        "Carry your Mother-Child Protection (MCP) card to every immunization session at your village Anganwadi/PHC.",
        "Mild fever or swelling at the injection site is normal and shows that the child's immune system is responding well."
      ],
      pointsHi: [
        "जन्म से लेकर 16 वर्ष की आयु तक राष्ट्रीय टीकाकरण तालिका का पूर्ण पालन करें।",
        "जन्म के तुरंत बाद (24 घंटे के भीतर) बीसीजी, पोलियो की जीरो खुराक और हेपेटाइटिस बी का टीका अवश्य लगवाएं।",
        "टीकाकरण सत्र के समय अपना 'मदर-चाइल्ड प्रोटेक्शन' (MCP कार्ड) हमेशा साथ रखें।",
        "टीके के बाद हल्का बुखार या सूजन सामान्य है, यह दर्शाता है कि टीका शरीर में काम कर रहा है।"
      ],
      pointsMr: [
        "बाळाच्या जन्मापासून ते १६ वर्षांपर्यंत राष्ट्रीय लसीकरण वेळापत्रकाचे तंतोतंत पालन करा.",
        "जन्मानंतर २४ तासांच्या आत बीसीजी, पोलिओ डोस व हेपॅटायटिस-बी ची लस देणे अत्यंत महत्त्वाचे आहे.",
        "प्रत्येक लसीकरण सत्राला जाताना अंगणवाडी किंवा PHC मध्ये आपले माता-बाल संरक्षण (MCP) कार्ड सोबत ठेवा.",
        "लसीकरणानंतर हलका ताप किंवा इंजेक्शनच्या जागी सूज येणे सामान्य असून यामुळे प्रतिकारशक्ती तयार होते."
      ],
      warningEn: "If a child develops persistent high fever, extreme drowsiness, or continuous crying for over 24 hours, notify the ASHA/ANM.",
      warningHi: "यदि बच्चे को 24 घंटे से अधिक तेज बुखार हो या वह सुस्त होकर दूध न पिए, तो तुरंत डॉक्टर को दिखाएं।",
      warningMr: "लसीकरणानंतर बाळाला सतत तीव्र ताप असल्यास किंवा बाळ दूध पित नसल्यास तात्काळ आशा किंवा डॉक्टरांशी संपर्क साधा.",
      helpline: "104",
      helplineLabel: language === "mr" ? "१०४ बाल आरोग्य माहिती" : language === "hi" ? "104 स्वास्थ्य सेवा" : "104 Vaccine Support",
    },
    {
      id: "top-6",
      category: "cancer",
      image: "/images/awareness/cancer_screening.jpg",
      titleEn: "Early Cancer Detection, Screening Camps & Free MJPJAY Treatment",
      titleHi: "कैंसर की शुरुआती पहचान, स्क्रीनिंग कैंप और MJPJAY के तहत मुफ्त इलाज",
      titleMr: "कर्करोग पूर्वतपासणी शिबिरे व महात्मा फुले जन आरोग्य योजनेतून (MJPJAY) मोफत उपचार",
      icon: Sparkles,
      badge: language === "mr" ? "कर्करोग जागृती व योजना" : language === "hi" ? "कैंसर सहायता" : "Cancer Care & Schemes",
      badgeVariant: "danger",
      summaryEn: "Cancer detected early is fully curable. Government Medical Colleges (GMC Nagpur, RST Cancer Hospital) offer free screening, biopsy, surgery, and chemotherapy under MJPJAY & PM-JAY.",
      summaryHi: "शुरुआती चरण में पहचान होने पर कैंसर पूरी तरह ठीक हो सकता है। सरकारी मेडिकल कॉलेजों में MJPJAY व PM-JAY के तहत बायोप्सी, कीमोथेरेपी व सर्जरी 100% मुफ्त है।",
      summaryMr: "कर्करोगाचे सुरुवातीच्या टप्प्यात निदान झाल्यास हा आजार पूर्णपणे बरा होतो. GMC नागपूर व RST कर्करोग रुग्णालयात MJPJAY व PM-JAY अंतर्गत मोफत शस्त्रक्रिया व केमोथेरपी उपलब्ध आहे.",
      pointsEn: [
        "Screening is vital: Oral inspection for white patches/ulcers, Clinical Breast Exam for lumps, and Cervical Pap smears.",
        "Never use unscientific herbal potions or delay care; modern oncology offers high cure rates in early stages.",
        "Mahatma Jyotirao Phule Jan Arogya Yojana (MJPJAY) covers up to ₹5 Lakh cashless treatment per family per year in Maharashtra.",
        "Attend periodic free NCD/cancer screening camps conducted at your Rural Hospital or District Civil Hospital."
      ],
      pointsHi: [
        "नियमित जांच कराएं: मुंह में न भरने वाले छाले, स्तन में कोई गांठ या असामान्य रक्तस्राव की तुरंत डॉक्टर से जांच करवाएं।",
        "झाड़-फूंक या देसी दवाओं के चक्कर में समय बर्बाद न करें; आधुनिक चिकित्सा से कैंसर का इलाज संभव है।",
        "महात्मा ज्योतिराव फुले जन आरोग्य योजना (MJPJAY) के तहत महाराष्ट्र में प्रति परिवार ₹5 लाख तक का कैशलेस इलाज मुफ्त है।",
        "जिला अस्पताल और मेडिकल कॉलेज (GMC Nagpur, RST Hospital) में विशेष ऑन्कोलॉजी विंग कार्यरत हैं।"
      ],
      pointsMr: [
        "नियमित तपासणी करा: तोंडातील न भरणारे पांढरे डाग, स्तनातील गाठ किंवा असामान्य रक्तस्राव दिसताच शासकीय शिबिरात तपासणी करा.",
        "कर्करोगावर कोणतेही अघोरी घरगुती उपाय करू नका; वेळेवर केलेल्या आधुनिक उपचारांमुळे रुग्ण पूर्णपणे बरा होतो.",
        "महात्मा ज्योतिराव फुले जन आरोग्य योजना (MJPJAY) अंतर्गत शासकीय रुग्णालयांमध्ये ₹५ लाख रुपयांपर्यंत मोफत कॅशलेस उपचार मिळतात.",
        "शासकीय वैद्यकीय महाविद्यालय (GMC नागपूर) आणि RST प्रादेशिक कर्करोग रुग्णालयात तज्ज्ञ डॉक्टर व मोफत औषधे उपलब्ध आहेत."
      ],
      warningEn: "Any non-healing mouth ulcer lasting over 2 weeks or rapid unexplained weight loss warrants an immediate biopsy consultation.",
      warningHi: "2 सप्ताह से अधिक समय तक मुंह में छाला ठीक न होना या तेजी से वजन घटना कैंसर के लक्षण हो सकते हैं।",
      warningMr: "तोंडातील व्रण किंवा जखम २ आठवड्यांपेक्षा जास्त काळ न भरल्यास किंवा वेगाने वजन घटल्यास तात्काळ बायोप्सी तपासणी करा.",
      helpline: "104 / 108",
      helplineLabel: language === "mr" ? "MJPJAY / १०४ कक्ष" : language === "hi" ? "MJPJAY / आयुष्मान हेल्प" : "MJPJAY Cashless Help",
    },
    {
      id: "top-7",
      category: "emergency",
      image: "/images/awareness/emergency_108.jpg",
      titleEn: "108 Emergency Ambulance: Golden Hour Trauma & Critical Care",
      titleHi: "108 एम्बुलेंस: गोल्डन आवर में जीवन रक्षक आपातकालीन सेवा",
      titleMr: "१०८ मोफत आपत्कालीन रुग्णवाहिका: गोल्डन अवरमध्ये जीवनरक्षक सेवा",
      icon: AlertOctagon,
      badge: language === "mr" ? "१०८ आपत्कालीन सेवा" : language === "hi" ? "108 आपातकालीन" : "Emergency 108 MEMS",
      badgeVariant: "danger",
      summaryEn: "Maharashtra Emergency Medical Services (MEMS 108) provides 24x7 free GPS-tracked ambulances equipped with emergency medical technicians, oxygen, and defibrillators.",
      summaryHi: "महाराष्ट्र सरकार की 108 एम्बुलेंस सेवा 24 घंटे पूरी तरह मुफ्त है। इसमें प्रशिक्षित पैरामेडिक्स, ऑक्सीजन और जीवन रक्षक दवाएं उपलब्ध रहती हैं।",
      summaryMr: "महाराष्ट्र आपत्कालीन वैद्यकीय सेवा (MEMS १०८) २४ तास मोफत उपलब्ध असून यामध्ये प्रशिक्षित डॉक्टर (EMT), ऑक्सिजन, व्हेंटिलेटर व प्रथमोपचार साधने असतात.",
      pointsEn: [
        "Dial 108 from any mobile or landline without any prefix; the call is 100% toll-free even with zero balance.",
        "Clearly state your exact village name, landmark, and the patient's chief complaint to the control room operator.",
        "In road accidents, never move the neck/spine of an unconscious victim without cervical support.",
        "All emergency admissions, triage, and critical ICU stabilization at Government District Hospitals are completely cashless."
      ],
      pointsHi: [
        "किसी भी फोन से बिना किसी कोड के सीधे 108 डायल करें; बैलेंस न होने पर भी यह कॉल बिल्कुल मुफ्त है।",
        "ऑपरेटर को अपना सही गांव, नजदीकी पहचान चिह्न (लैंडमार्क) और मरीज की मुख्य परेशानी स्पष्ट बताएं।",
        "सड़क दुर्घटना में घायल व्यक्ति की गर्दन या रीढ़ को बिना सहारे के न हिलाएं, एम्बुलेंस टीम का इंतजार करें।",
        "सरकारी जिला अस्पताल और ट्रॉमा सेंटर में आपातकालीन उपचार और आईसीयू भर्ती पूरी तरह निःशुल्क है।"
      ],
      pointsMr: [
        "कोणत्याही मोबाईलवरून थेट १०८ डायल करा; बॅलन्स नसला तरी हा कॉल १००% मोफत कनेक्ट होतो.",
        "कंट्रोल रूम ऑपरेटरला आपल्या गावाचे नाव, महत्त्वाचा लँडमार्क आणि रुग्णाची मुख्य समस्या स्पष्ट सांगा.",
        "रस्ते अपघातात बेशुद्ध रुग्णाची मान किंवा पाठीचा कणा आधार दिल्याशिवाय हालवू नका.",
        "शासकीय जिल्हा रुग्णालय, उपजिल्हा रुग्णालय व GMC मधील आपत्कालीन कॅज्युअल्टी व अतिदक्षता (ICU) उपचार मोफत असतात."
      ],
      warningEn: "Severe head injuries, profuse arterial bleeding, or cardiac arrest require immediate bystander CPR while 108 is en route.",
      warningHi: "बेहोशी या सांस रुकने की स्थिति में 108 आने तक तुरंत सीपीआर (CPR) देना शुरू करें।",
      warningMr: "रुग्णाचा श्वास थांबल्यास १०८ रुग्णवाहिका पोहोचेपर्यंत त्वरित छातीवर दाब देऊन सीपीआर (CPR) सुरू करा.",
      helpline: "108",
      helplineLabel: language === "mr" ? "१०८ थेट डायल करा" : language === "hi" ? "108 डायल करें" : "Dial 108 Direct",
    },
    {
      id: "top-8",
      category: "mental",
      image: "/images/awareness/mental_health.jpg",
      titleEn: "Tele-MANAS (14416): 24x7 Free & Confidential Mental Health Support",
      titleHi: "टेली-मानस (14416): 24x7 मुफ्त और गोपनीय मानसिक स्वास्थ्य परामर्श",
      titleMr: "टेलि-मानस (१४४१६): २४ तास मोफत व गोपनीय मानसिक आरोग्य समुपदेशन",
      icon: HeartPulse,
      badge: language === "mr" ? "मानसिक आरोग्य" : language === "hi" ? "मानसिक स्वास्थ्य" : "Tele-MANAS Support",
      badgeVariant: "info",
      summaryEn: "Mental health is as crucial as physical health. Tele-MANAS toll-free helpline 14416 offers 24x7 confidential counseling in Marathi, Hindi, and English for stress, anxiety, and depression.",
      summaryHi: "तनाव, अवसाद या पारिवारिक चिंता की स्थिति में अकेले न रहें। टेली-मानस टोल-फ्री नंबर 14416 पर प्रशिक्षित मनोवैज्ञानिकों से मुफ्त और गोपनीय परामर्श लें।",
      summaryMr: "शारीरिक आरोग्याइतकेच मानसिक आरोग्यही महत्त्वाचे आहे. शेतीची चिंता, नैराश्य, भीती किंवा ताणतणावावर टेलि-मानस टोल-फ्री क्रमांक १४४१६ वर मोफत व गोपनीय सल्ला मिळतो.",
      pointsEn: [
        "Call toll-free 14416 or 1800-891-4416 anytime; support is accessible 24 hours a day, 365 days a year.",
        "Talk openly with trained clinical psychologists and psychiatric social workers in your mother tongue (Marathi, Hindi, English).",
        "Your identity and conversations remain strictly confidential and protected by government medical ethics.",
        "District Mental Health Programme (DMHP) units at your District Civil Hospital provide free in-person therapy and medications."
      ],
      pointsHi: [
        "टोल-फ्री नंबर 14416 या 1800-891-4416 पर कभी भी कॉल करें; यह सेवा दिन-रात पूरी तरह मुफ्त उपलब्ध है।",
        "अपनी मातृभाषा (मराठी, हिंदी या अंग्रेजी) में प्रशिक्षित मनोवैज्ञानिकों से खुलकर अपनी परेशानी साझा करें।",
        "आपकी पहचान और बातचीत पूरी तरह गोपनीय रखी जाती है।",
        "जिला अस्पताल के मानसिक स्वास्थ्य विभाग (DMHP) में विशेषज्ञ डॉक्टरों द्वारा मुफ्त जांच और दवाएं उपलब्ध हैं।"
      ],
      pointsMr: [
        "टोल-फ्री क्रमांक १४४१६ किंवा १८००-८९१-४४१६ वर कधीही कॉल करा; ही शासकीय समुपदेशन सेवा २४ तास मोफत सुरू असते.",
        "आपल्या मातृभाषेत (मराठी, हिंदी किंवा इंग्रजी) तज्ज्ञ मानसोपचारतज्ज्ञ व समुपदेशकांशी मोकळेपणाने बोला.",
        "आपली ओळख आणि संभाषण पूर्णपणे गोपनीय ठेवले जाते.",
        "जिल्हा सामान्य रुग्णालयातील मानसिक आरोग्य विभागामध्ये (DMHP) मोफत तपासणी व औषधोपचार उपलब्ध असतात."
      ],
      warningEn: "If someone expresses thoughts of self-harm or deep hopelessness, do not leave them alone. Dial 14416 or 108 immediately.",
      warningHi: "यदि कोई व्यक्ति खुद को नुकसान पहुंचाने की बात करे, तो उसे अकेला न छोड़ें। तुरंत 14416 या 108 पर कॉल करें।",
      warningMr: "कोणीही आत्महत्येचा किंवा स्वतःला इजा करण्याचा विचार बोलून दाखवल्यास त्यांना एकटे सोडू नका; तात्काळ १४४१६ किंवा १०८ वर संपर्क साधा.",
      helpline: "14416",
      helplineLabel: language === "mr" ? "१४४१६ टेलि-मानस" : language === "hi" ? "14416 टेली-मानस" : "14416 Tele-MANAS",
    },
  ];

  const filteredTopics = topics.filter((t) => {
    if (activeCategory === "all") return true;
    return t.category === activeCategory;
  });

  const handleListenToggle = (topic) => {
    if (playingTopicId === topic.id) {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setPlayingTopicId(null);
    } else {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const displayTitle = language === "hi" ? topic.titleHi : language === "mr" ? topic.titleMr : topic.titleEn;
        const displaySummary = language === "hi" ? topic.summaryHi : language === "mr" ? topic.summaryMr : topic.summaryEn;
        const pts = language === "hi" ? topic.pointsHi : language === "mr" ? topic.pointsMr : topic.pointsEn;
        const speechText = `${displayTitle}. ${displaySummary}. ${pts.slice(0, 2).join(". ")}`;

        const utterance = new SpeechSynthesisUtterance(speechText);
        utterance.lang = language === "hi" ? "hi-IN" : language === "mr" ? "mr-IN" : "en-IN";
        utterance.rate = 0.95;
        utterance.onend = () => setPlayingTopicId(null);
        utterance.onerror = () => setPlayingTopicId(null);
        window.speechSynthesis.speak(utterance);
      }
      setPlayingTopicId(topic.id);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8 space-y-8">
        {/* Banner */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded border border-teal-200 dark:border-teal-800 flex items-center gap-1">
              <HeartPulse className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              {language === "mr" ? "सामुदायिक आरोग्य व जनजागृती केंद्र" : language === "hi" ? "सामुदायिक स्वास्थ्य व जागरूकता केंद्र" : "Community Health Awareness Hub"}
            </span>
            <Badge variant="teal" size="sm">{language === "mr" ? "सचित्र माहिती" : language === "hi" ? "सचित्र गाइड" : "Visual Education"}</Badge>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {language === "mr" 
              ? "ग्रामीण आरोग्य जागरूकता, सचित्र मार्गदर्शिका व प्रथमोपचार" 
              : language === "hi" 
              ? "ग्रामीण स्वास्थ्य जागरूकता, सचित्र गाइड और प्राथमिक उपचार" 
              : "Rural Healthcare Awareness, Visual Guides & First Aid"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
            {language === "mr"
              ? "माता व बाल संगोपन, सर्पदंश प्रथमोपचार, साथीचे आजार, कर्करोग पूर्वतपासणी व १०८ आपत्कालीन सेवेची सचित्र व अधिकृत माहिती. चित्र मोठे करून पाहण्यासाठी चित्रावर क्लिक करा."
              : language === "hi"
              ? "मातृ एवं शिशु पोषण, सर्पदंश प्राथमिक उपचार, मौसमी बुखार, कैंसर स्क्रीनिंग और 108 एम्बुलेंस की सचित्र आधिकारिक जानकारी। फोटो को बड़ा देखने के लिए उस पर क्लिक करें।"
              : "Essential visual public health guidelines for maternal care, snakebite first aid, monsoon infections, cancer screening, and 108 emergency transit. Click any image to open full-screen poster."}
          </p>
        </div>

        {/* Emergency Quick Action Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <a
            href="tel:108"
            className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 rounded-xl flex items-center gap-3 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors group"
          >
            <div className="w-10 h-10 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0 font-black text-sm">
              108
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-rose-800 dark:text-rose-300 block truncate">
                {language === "mr" ? "१०८ रुग्णवाहिका" : language === "hi" ? "108 एम्बुलेंस" : "108 Ambulance"}
              </span>
              <span className="text-[10px] text-rose-600 dark:text-rose-400 block truncate">
                {language === "mr" ? "२४x७ मोफत आपत्कालीन" : language === "hi" ? "24x7 मुफ्त आपातकाल" : "24x7 Free Trauma"}
              </span>
            </div>
          </a>

          <a
            href="tel:104"
            className="p-3 bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-900/60 rounded-xl flex items-center gap-3 hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors group"
          >
            <div className="w-10 h-10 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0 font-black text-sm">
              104
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-teal-800 dark:text-teal-300 block truncate">
                {language === "mr" ? "१०४ आरोग्य सल्ला" : language === "hi" ? "104 स्वास्थ्य सलाह" : "104 Health Advice"}
              </span>
              <span className="text-[10px] text-teal-600 dark:text-teal-400 block truncate">
                {language === "mr" ? "शासकीय वैद्यकीय मदत" : language === "hi" ? "सरकारी हेल्पलाइन" : "Medical Guidance"}
              </span>
            </div>
          </a>

          <a
            href="tel:14416"
            className="p-3 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/60 rounded-xl flex items-center gap-3 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors group"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 font-black text-xs">
              14416
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-blue-800 dark:text-blue-300 block truncate">
                {language === "mr" ? "टेलि-मानस" : language === "hi" ? "टेली-मानस" : "Tele-MANAS"}
              </span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 block truncate">
                {language === "mr" ? "मानसिक समुपदेशन" : language === "hi" ? "मानसिक स्वास्थ्य" : "Mental Wellness"}
              </span>
            </div>
          </a>

          <a
            href="tel:102"
            className="p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/60 rounded-xl flex items-center gap-3 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors group"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0 font-black text-sm">
              102
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 block truncate">
                {language === "mr" ? "१०२ JSSK प्रसूती" : language === "hi" ? "102 जननी सुरक्षा" : "102 JSSK Transit"}
              </span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 block truncate">
                {language === "mr" ? "माता-बाळ वाहतूक" : language === "hi" ? "जच्चा-बच्चा वाहन" : "Maternal Transport"}
              </span>
            </div>
          </a>
        </div>

        {/* Non-Diagnostic Safety Alert */}
        <Alert variant="safety" className="text-xs py-3">
          <strong>{language === "mr" ? "सार्वजनिक आरोग्य सूचना:" : language === "hi" ? "सार्वजनिक स्वास्थ्य सूचना:" : "Public Education Notice:"}</strong>{" "}
          {language === "mr"
            ? "हे पोर्टल प्राथमिक प्रतिबंधात्मक माहिती व जनजागृतीसाठी आहे. प्रत्यक्ष तपासणी, औषधोपचार व निदानासाठी जवळच्या शासकीय प्राथमिक आरोग्य केंद्र (PHC) किंवा डॉक्टरांचा सल्ला घ्या."
            : language === "hi"
            ? "यह पोर्टल केवल स्वास्थ्य जागरूकता और प्राथमिक बचाव के लिए है। किसी भी बीमारी के सटीक निदान व इलाज हेतु सरकारी PHC अथवा चिकित्सक से जांच करवाएं।"
            : "This health awareness portal provides generalized wellness and preventive information. Always consult your Primary Health Centre medical officer for clinical diagnosis and treatment."}
        </Alert>

        {/* Category Filter Tabs */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <Tabs
            tabs={categories}
            activeTab={activeCategory}
            onChange={setActiveCategory}
            variant="pills"
          />
        </div>

        {/* Health Topics Grid with High-Definition Working Pictures */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTopics.map((topic) => {
            const Icon = topic.icon;
            const isPlaying = playingTopicId === topic.id;
            const displayTitle = language === "hi" ? topic.titleHi : language === "mr" ? topic.titleMr : topic.titleEn;
            const displaySummary = language === "hi" ? topic.summaryHi : language === "mr" ? topic.summaryMr : topic.summaryEn;
            const displayPoints = language === "hi" ? topic.pointsHi : language === "mr" ? topic.pointsMr : topic.pointsEn;
            const displayWarning = language === "hi" ? topic.warningHi : language === "mr" ? topic.warningMr : topic.warningEn;

            return (
              <Card key={topic.id} className="hover:border-teal-300 dark:hover:border-teal-600 transition-all flex flex-col justify-between shadow-xs overflow-hidden group">
                {/* Working High-Definition Picture Banner */}
                <div 
                  className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer border-b border-slate-200 dark:border-slate-800"
                  onClick={() => setLightboxImage({ src: topic.image, title: displayTitle, summary: displaySummary, points: displayPoints, helpline: topic.helpline, helplineLabel: topic.helplineLabel })}
                >
                  <img
                    src={topic.image}
                    alt={displayTitle}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20 pointer-events-none" />
                  
                  {/* Floating Category Badge & Zoom Hint */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <Badge variant={topic.badgeVariant} size="sm" className="shadow-xs backdrop-blur-md">
                      {topic.badge}
                    </Badge>
                  </div>

                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md flex items-center gap-1">
                    <span>🔍 {language === "mr" ? "मोठा फोटो पहा" : language === "hi" ? "बड़ा फोटो देखें" : "View Full Poster"}</span>
                  </div>

                  {/* Bottom Title on Image for Rich Poster Feel */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-500/30 inline-block mb-1">
                      {topic.helplineLabel}
                    </span>
                    <h3 className="text-sm sm:text-base font-black leading-tight drop-shadow-md line-clamp-1">
                      {displayTitle}
                    </h3>
                  </div>
                </div>

                <CardContent className="p-5 space-y-3.5 flex-1 text-xs">
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {displaySummary}
                  </p>

                  <div className="space-y-1.5 pt-1">
                    <span className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px] block">
                      {language === "mr" ? "शिफारस केलेल्या महत्त्वाच्या कृती:" : language === "hi" ? "महत्वपूर्ण बचाव और सावधानियां:" : "Recommended Actions:"}
                    </span>
                    <ul className="space-y-1.5 text-slate-600 dark:text-slate-300">
                      {displayPoints.map((pt, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-teal-600 dark:text-teal-400 font-black leading-none mt-1 text-sm">•</span>
                          <span className="leading-normal">{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {displayWarning && (
                    <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 rounded-lg border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 font-medium">
                      ⚠️ <strong>{language === "mr" ? "धोक्याचा इशारा (Red Flag):" : language === "hi" ? "खतरे के संकेत (Red Flag):" : "Red Flag Warning:"}</strong> {displayWarning}
                    </div>
                  )}

                  {/* Audio Mode Active Indicator */}
                  {isPlaying && (
                    <div className="p-3 bg-teal-50 dark:bg-teal-950/60 rounded-xl border border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-200 flex items-center gap-2 animate-pulse">
                      <Volume2 className="w-4 h-4 text-teal-700 dark:text-teal-400 animate-bounce" />
                      <span className="text-[11px] font-semibold">
                        {language === "mr" ? `"${displayTitle}" ऑडिओ मार्गदर्शन सुरू आहे...` : language === "hi" ? `"${displayTitle}" का ऑडियो शुरू है...` : `Playing voice guide for "${displayTitle}"...`}
                      </span>
                    </div>
                  )}

                  {/* Actions: Listen, Call Helpline, View Clinic */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleListenToggle(topic)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          isPlaying
                            ? "bg-teal-600 text-white border-teal-600 shadow-xs"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{isPlaying ? (language === "mr" ? "ऑडिओ बंद करा" : language === "hi" ? "ऑडियो रोकें" : "Stop Audio") : (language === "mr" ? "माहिती ऐका (TTS)" : language === "hi" ? "ऑडियो सुनें" : "Listen Audio")}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setLightboxImage({ src: topic.image, title: displayTitle, summary: displaySummary, points: displayPoints, helpline: topic.helpline, helplineLabel: topic.helplineLabel })}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <span>🖼️ {language === "mr" ? "पोस्टर" : language === "hi" ? "पोस्टर" : "Poster"}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${topic.helpline.split(" ")[0]}`}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-bold text-xs hover:bg-rose-100 flex items-center gap-1"
                      >
                        <PhoneCall className="w-3 h-3" />
                        <span>{topic.helpline}</span>
                      </a>

                      <Link href="/resources">
                        <Button size="sm" variant="ghost" className="text-xs text-teal-700 dark:text-teal-400 font-bold gap-1 px-2">
                          <span>{language === "mr" ? "PHC शोधा" : language === "hi" ? "PHC देखें" : "Find PHC"}</span>
                          <ArrowRight className="w-3 h-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Full-Screen Poster / Image Lightbox Modal */}
        {lightboxImage && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 max-w-3xl w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {lightboxImage.title}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setLightboxImage(null)}
                  className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body with Large Picture */}
              <div className="overflow-y-auto p-5 space-y-4">
                <div className="aspect-video w-full rounded-xl overflow-hidden shadow-md bg-slate-950">
                  <img
                    src={lightboxImage.src}
                    alt={lightboxImage.title}
                    className="w-full h-full object-cover object-center"
                  />
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-2 text-xs">
                  <p className="text-slate-700 dark:text-slate-200 font-medium leading-relaxed text-sm">
                    {lightboxImage.summary}
                  </p>
                  <ul className="space-y-1.5 text-slate-600 dark:text-slate-300 pt-2">
                    {lightboxImage.points.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-teal-600 font-bold">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                <a
                  href={`tel:${lightboxImage.helpline.split(" ")[0]}`}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs text-center"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{language === "mr" ? `थेट कॉल करा: ${lightboxImage.helpline}` : `Call Helpline: ${lightboxImage.helpline}`}</span>
                </a>

                <div className="flex items-center gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.print()}
                    className="text-xs font-semibold gap-1.5 flex-1 sm:flex-initial"
                  >
                    <span>🖨️ {language === "mr" ? "पोस्टर प्रिंट" : language === "hi" ? "प्रिंट करें" : "Print Poster"}</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => setLightboxImage(null)}
                    className="text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white flex-1 sm:flex-initial"
                  >
                    {language === "mr" ? "बंद करा" : language === "hi" ? "बंद करें" : "Close"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Official Government Health Portals & Public Registries */}
        <section className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="teal" size="sm">National Health Infrastructure</Badge>
              <span className="text-xs font-bold text-teal-700 dark:text-teal-400">Government of India Portals</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Official Public Health Portals & Registries
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Access verified Government of India healthcare digital portals for teleconsultations, disease surveillance, blood availability, and maternal tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <a
              href="https://esanjeevani.mohfw.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-500 shadow-2xs hover:shadow-xs transition-all group flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                    Free Tele-OPD
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  eSanjeevani Teleconsultation
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  National free doctor-to-patient online telemedicine consultation platform by MoHFW.
                </p>
              </div>
              <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400 pt-3 flex items-center gap-1">
                <span>Visit esanjeevani.mohfw.gov.in</span>
                <span>→</span>
              </span>
            </a>

            <a
              href="https://eraktkosh.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-rose-400 dark:hover:border-rose-500 shadow-2xs hover:shadow-xs transition-all group flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800">
                    Blood Banks
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                  e-RaktKosh Blood Portal
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Real-time blood stock availability and nearest blood bank search across all districts in India.
                </p>
              </div>
              <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 pt-3 flex items-center gap-1">
                <span>Visit eraktkosh.in</span>
                <span>→</span>
              </span>
            </a>

            <a
              href="https://www.nikshay.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 shadow-2xs hover:shadow-xs transition-all group flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                    TB Care & DBT
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  Nikshay Portal (NTEP)
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Direct Nutritional Assistance (₹500/mo) and free treatment tracking for tuberculosis patients.
                </p>
              </div>
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 pt-3 flex items-center gap-1">
                <span>Visit nikshay.in</span>
                <span>→</span>
              </span>
            </a>

            <a
              href="https://ncvbdc.mohfw.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500 shadow-2xs hover:shadow-xs transition-all group flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                    Vector-Borne
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  NCVBDC (Malaria & Dengue)
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  National guidelines for vector control, Dengue fever alerts, and free rapid diagnostic tests.
                </p>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 pt-3 flex items-center gap-1">
                <span>Visit ncvbdc.mohfw.gov.in</span>
                <span>→</span>
              </span>
            </a>

            <a
              href="https://mohfw.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-sky-400 dark:hover:border-sky-500 shadow-2xs hover:shadow-xs transition-all group flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950 px-2 py-0.5 rounded border border-sky-200 dark:border-sky-800">
                    MoHFW
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                  Ministry of Health & Family Welfare
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Central government health policies, clinical guidelines, and national health mission programs.
                </p>
              </div>
              <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 pt-3 flex items-center gap-1">
                <span>Visit mohfw.gov.in</span>
                <span>→</span>
              </span>
            </a>

            <a
              href="https://pmjay.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-500 shadow-2xs hover:shadow-xs transition-all group flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                    PM-JAY Portal
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  Ayushman Bharat Portal (NHA)
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Search empaneled hospitals, check eligibility, and generate digital Ayushman cards.
                </p>
              </div>
              <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400 pt-3 flex items-center gap-1">
                <span>Visit pmjay.gov.in</span>
                <span>→</span>
              </span>
            </a>
          </div>
        </section>

        {/* Quick Resource Link Bar */}
        <div className="p-6 bg-linear-to-r from-teal-800 to-slate-900 rounded-2xl text-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-base font-bold">Looking for a verified hospital or doctor?</h4>
            <p className="text-xs text-slate-300">
              Access our accredited directory of district hospitals, maternal wings, and government cashless schemes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/resources">
              <Button size="sm" className="bg-white text-teal-950 hover:bg-teal-50 font-bold gap-1.5 text-xs">
                <span>Explore Directory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default HealthAwarenessPage;
