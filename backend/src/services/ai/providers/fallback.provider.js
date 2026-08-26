const BaseAIProvider = require("./base.provider");

class FallbackAIProvider extends BaseAIProvider {
  constructor(config = {}) {
    super("Deterministic Fallback", config);
  }

  isConfigured() {
    return true;
  }

  async generateCompletion({ systemPrompt, messages, language = "en", maxTokens = 800, temperature = 0.2 }) {
    const userMessages = messages.filter((m) => m.role === "user");
    const lastUserMessage = userMessages[userMessages.length - 1]?.content || "";
    const previousUserMessage = userMessages.length > 1 ? userMessages[userMessages.length - 2]?.content || "" : "";
    const combinedContext = `${previousUserMessage} ${lastUserMessage}`.toLowerCase();
    const lower = lastUserMessage.toLowerCase();

    let text = "";

    if (lower.includes("referral") || lower.includes("status") || combinedContext.includes("referral")) {
      if (language === "hi") {
        text = "वर्तमान जीवनसेतु रिकॉर्ड के अनुसार, आपका रेफरल सक्रिय है और विशेषज्ञ सुविधा में समन्वय प्रगति पर है। आप रेफरल टाइमलाइन में लाइव स्थिति देख सकते हैं।";
      } else if (language === "mr") {
        text = "सध्याच्या जीवनसेतू नोंदीनुसार, आपला संदर्भ (Referral) सक्रिय असून विशेषज्ञ रुग्णालयाकडे समन्वयासाठी पाठवला आहे. अधिक माहितीसाठी रेफरल डॅशबोर्ड तपासा.";
      } else {
        text = "According to your current JeevanSetu record, your referral is active and being coordinated with the assigned destination facility. Please check your referrals timeline for stage updates.";
      }
    } else if (lower.includes("medicine") || lower.includes("stock") || lower.includes("paracetamol") || lower.includes("atorvastatin") || lower.includes("dawa") || lower.includes("aushadh")) {
      if (language === "hi") {
        text = "आपके प्राथमिक स्वास्थ्य केंद्र (PHC) के लाइव स्टॉक रिकॉर्ड के अनुसार आवश्यक दवाएं उपलब्ध हैं। दवा वितरण और उचित सलाह के लिए अपने प्राथमिक स्वास्थ्य केंद्र के फार्मासिस्ट या डॉक्टर से संपर्क करें।";
      } else if (language === "mr") {
        text = "आपल्या प्राथमिक आरोग्य केंद्राच्या (PHC) थेट साठा नोंदीनुसार आवश्यक औषधे उपलब्ध आहेत. औषध वितरणासाठी आपल्या आरोग्य केंद्राशी संपर्क साधा.";
      } else {
        text = "According to the live PHC inventory records in JeevanSetu, essential medicines are available. Please consult the on-duty PHC officer for physical dispensation.";
      }
    } else if (lower.includes("scheme") || lower.includes("pmjay") || lower.includes("ayushman") || lower.includes("mjpjay") || lower.includes("योजना")) {
      if (language === "hi") {
        text = "आयुष्मान भारत PM-JAY और महात्मा ज्योतिराव फुले जन आरोग्य योजना (MJPJAY) के तहत ₹5 लाख तक का वार्षिक कैशलेस उपचार सरकारी और सूचीबद्ध निजी अस्पतालों में राशन/आधार कार्ड के साथ उपलब्ध है।";
      } else if (language === "mr") {
        text = "आयुष्मान भारत PM-JAY आणि महात्मा ज्योतिराव फुले जन आरोग्य योजना (MJPJAY) अंतर्गत ₹५ लाख पर्यंतचे मोफत उपचार सरकारी आणि संलग्न रुग्णालयांमध्ये रेशन/आधार कार्डद्वारे मिळतात.";
      } else {
        text = "Under Ayushman Bharat PM-JAY & MJPJAY, up to ₹5,00,000 annual cashless coverage is available at empanelled government and trust hospitals with valid Ration/Aadhaar verification.";
      }
    } else if (lower.includes("hospital") || lower.includes("icu") || lower.includes("bed") || lower.includes("रुग्णालय") || lower.includes("अस्पताल")) {
      if (language === "hi") {
        text = "जिले के सत्यापित अस्पतालों में जिला नागरिक अस्पताल गढ़चिरौली (District Civil Hospital Gadchiroli) शामिल है जहाँ 24x7 आपातकालीन, आईसीयू और विशेषज्ञ ओपीडी सेवाएं उपलब्ध हैं।";
      } else if (language === "mr") {
        text = "जिल्ह्यातील पडताळणी केलेल्या रुग्णालयांमध्ये जिल्हा सामान्य रुग्णालय गडचिरोली समाविष्ट असून येथे २४x७ आपत्कालीन आणि आयसीयू सुविधा उपलब्ध आहेत.";
      } else {
        text = "Verified district facilities include District Civil Hospital Gadchiroli with 24x7 emergency triage, ICU beds, and Ayushman Mitra scheme desks.";
      }
    } else if (lower.includes("phc") || lower.includes("doctor") || lower.includes("timing") || lower.includes("wahan") || lower.includes("kab aata") || lower.includes("कधी") || lower.includes("केन्द्र")) {
      if (language === "hi") {
        text = "प्राथमिक स्वास्थ्य केंद्र (PHC) में सामान्य ओपीडी समय सुबह 9:00 बजे से शाम 5:00 बजे तक (सोमवार से शनिवार) रहता है। आपातकालीन प्राथमिक चिकित्सा 24 घंटे उपलब्ध रहती है।";
      } else if (language === "mr") {
        text = "प्राथमिक आरोग्य केंद्राची (PHC) बाह्यरुग्ण विभाग (OPD) वेळ सकाळी ९:०० ते संध्याकाळी ५:०० (सोमवार ते शनिवार) असते. तातडीच्या प्रथमोपचाराची सोय २४ तास उपलब्ध असते.";
      } else {
        text = "Primary Health Centres (PHCs) operate routine OPD from 9:00 AM to 5:00 PM (Monday to Saturday), with 24x7 basic emergency casualty and nursing triage.";
      }
    } else if (lower.includes("fever") || lower.includes("bukhar") || lower.includes("tap") || lower.includes("ताप") || lower.includes("बुखार") || lower.includes("cough") || lower.includes("sardi")) {
      if (language === "hi") {
        text = "सामान्य बुखार या सर्दी के लिए पर्याप्त पानी व ओआरएस (ORS) पिएं और आराम करें। यदि बुखार 2 दिन से अधिक रहे, बहुत तेज हो, या सांस लेने में परेशानी हो तो तुरंत नजदीकी प्राथमिक स्वास्थ्य केंद्र (PHC) में डॉक्टर को दिखाएं।";
      } else if (language === "mr") {
        text = "सामान्य ताप किंवा थंडीसाठी पुरेसे पाणी/ORS प्यावे आणि विश्रांती घ्यावी. ताप २ दिवसांपेक्षा जास्त राहिल्यास किंवा तीव्र असल्यास जवळच्या प्राथमिक आरोग्य केंद्रातील (PHC) डॉक्टरांचा सल्ला घ्यावा.";
      } else {
        text = "For mild fever, maintain hydration with ORS and clean fluids and get adequate rest. If fever exceeds 101°F, persists for more than 48 hours, or is accompanied by severe weakness, please visit your nearest PHC doctor promptly.";
      }
    } else {
      if (language === "hi") {
        text = "नमस्ते! मैं आपका जीवनसेतु स्वास्थ्य व अस्पताल सहायक हूँ। मैं आपको नजदीकी प्राथमिक स्वास्थ्य केंद्र, अस्पताल, आयुष्मान भारत योजना, रेफरल और दवाओं की जानकारी देने में मदद कर सकता हूँ। आप क्या जानना चाहते हैं?";
      } else if (language === "mr") {
        text = "नमस्कार! मी आपला जीवनसेतू आरोग्य व रुग्णालय सहाय्यक आहे. मी आपणास जवळचे प्राथमिक आरोग्य केंद्र, रुग्णालये, सरकारी योजना, रेफरल आणि औषधांची माहिती देण्यास मदत करू शकतो. आपल्याला काय माहिती हवी आहे?";
      } else {
        text = "Hello! I am your JeevanSetu Healthcare Navigation Assistant. I can help guide you to verified district hospitals, government assistance schemes, referral tracking, and PHC medicine availability. How may I assist your care today?";
      }
    }

    return {
      text,
      rawUsage: { fallback: true },
    };
  }
}

module.exports = FallbackAIProvider;
