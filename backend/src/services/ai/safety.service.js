/**
 * Medical Safety, Emergency Detection & Prompt Injection Defense Service
 */

// Emergency Red-Flag Trigger Keywords & Patterns
const EMERGENCY_PATTERNS = [
  /severe\s+chest\s+pain/i,
  /acute\s+chest\s+pain/i,
  /chest\s+pain/i,
  /chest\s+tightness/i,
  /difficulty\s+breathing/i,
  /shortness\s+of\s+breath/i,
  /cannot\s+breathe/i,
  /choking/i,
  /loss\s+of\s+consciousness/i,
  /unconscious/i,
  /fainted/i,
  /collapsed/i,
  /heavy\s+bleeding/i,
  /profuse\s+bleeding/i,
  /coughing\s+up\s+blood/i,
  /vomiting\s+blood/i,
  /severe\s+head\s+injury/i,
  /sudden\s+weakness.*one\s+side/i,
  /slurred\s+speech/i,
  /facial\s+droop/i,
  /poisoning/i,
  /snake\s*bite/i,
  /heart\s+attack/i,
  /stroke/i,
  /छाती\s*में\s*(तेज\s*)?दर्द/i, // Hindi chest pain
  /सांस\s*लेने\s*में\s*तकलीफ/i,
  /सांस\s*फूल/i,
  /बेहोश/i,
  /छातीत\s*कळा/i, // Marathi chest pain
  /श्वास\s*घेण्यास\s*त्रास/i,
  /रक्तस्राव/i,
];

// Diagnosis & Prescription Patterns
const PRESCRIPTION_OR_DIAGNOSIS_PATTERNS = [
  /diagnos(e|is)/i,
  /what\s+disease/i,
  /what\s+illness/i,
  /do\s+i\s+have\s+/i,
  /prescribe/i,
  /what\s+medicine\s+should\s+i\s+take/i,
  /what\s+drug\s+should\s+i\s+take/i,
  /what\s+dose\s+of\s+\w+/i,
  /change\s+my\s+medicine\s+dose/i,
  /which\s+antibiotic/i,
  /क्या\s+मुझे\s+यह\s+दवा\s+लेनी\s+चाहिए/i,
  /माझे\s+निदान\s+करा/i,
  /कोणते\s+औषध\s+घेऊ/i,
];

// Prompt Injection Patterns & Boundaries
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /disregard\s+(all\s+)?(the\s+)?above/i,
  /you\s+are\s+now\s+a\s+doctor/i,
  /act\s+as\s+a\s+licensed\s+physician/i,
  /override\s+safety\s+filter/i,
  /disable\s+safety\s+rules/i,
  /jailbreak/i,
  /print\s+(your\s+)?system\s+prompt/i,
  /give\s+me\s+your\s+system\s+prompt/i,
  /reveal\s+instructions/i,
  /tell\s+me\s+another\s+patient('s)?\s+records?/i,
  /show\s+me\s+other\s+patients?/i,
  /dump\s+database/i,
  /reveal\s+api\s*key/i,
];

const medicalKnowledgeService = require("./medicalKnowledge.service");

/**
 * Check if the text contains life-threatening emergency symptoms
 */
const detectEmergency = (text, language = "mr") => {
  if (!text || typeof text !== "string") return null;

  const lang = ["en", "hi", "mr"].includes(language) ? language : "mr";
  const regexEmergency = EMERGENCY_PATTERNS.some((pattern) => pattern.test(text));
  const knowledgeRedFlags = medicalKnowledgeService.checkRedFlags(text);

  const isEmergency = regexEmergency || knowledgeRedFlags.isEmergency;
  if (!isEmergency) return null;

  let message = "";
  if (lang === "mr") {
    message = "⚠️ तातडीची सूचना (EMERGENCY): आपण नमूद केलेली लक्षणे अत्यंत गंभीर असू शकतात. कृपया त्वरित १०८ वर कॉल करा किंवा जवळच्या शासकीय रुग्णालयाच्या आपत्कालीन (ICU/Casualty) विभागात जा. जीवनसेतू AI वैद्यकीय उपचारांचा पर्याय नाही.";
  } else if (lang === "hi") {
    message = "⚠️ आपातकालीन सूचना (EMERGENCY): आपने जो लक्षण बताए हैं वे गंभीर हो सकते हैं। कृपया तुरंत 108 पर कॉल करें या निकटतम सरकारी अस्पताल के आपातकालीन विभाग में जाएँ। जीवनसेतु AI कोई नैदानिक उपकरण नहीं है।";
  } else {
    message = "⚠️ MEDICAL EMERGENCY ALERT: The symptoms you described may require immediate medical intervention. Please call 108 (Free Emergency Ambulance) immediately or proceed directly to the nearest hospital emergency room. Do not rely on AI for emergency medical care.";
  }

  return {
    isEmergency: true,
    safetyLevel: "emergency",
    message,
    emergencyPhone: "108",
    matchedRedFlags: knowledgeRedFlags.redFlags || [],
    requiresHumanReview: true,
  };
};

/**
 * Check if query asks for unsafe diagnosis or pharmaceutical prescription
 */
const detectDiagnosisOrPrescription = (text, language = "en") => {
  if (!text || typeof text !== "string") return null;

  const isPrescriptionAttempt = PRESCRIPTION_OR_DIAGNOSIS_PATTERNS.some((pattern) => pattern.test(text));
  if (!isPrescriptionAttempt) return null;

  let guidance = "";
  if (language === "hi") {
    guidance = "जीवनसेतु AI डॉक्टर नहीं है और किसी बीमारी का निदान (Diagnosis) या दवाओं का प्रिस्क्रिप्शन नहीं दे सकता। कृपया उचित जांच और उपचार के लिए अपने नजदीकी प्राथमिक स्वास्थ्य केंद्र (PHC) या योग्य चिकित्सक से परामर्श लें।";
  } else if (language === "mr") {
    guidance = "जीवनसेतू AI डॉक्टर नाही आणि आजाराचे निदान किंवा औषधांची शिफारस करू शकत नाही. कृपया तपासणी आणि योग्य सल्ल्यासाठी जवळच्या प्राथमिक आरोग्य केंद्रातील (PHC) वैद्यकीय अधिकाऱ्यांशी संपर्क साधा.";
  } else {
    guidance = "JeevanSetu AI is an informational coordination tool and cannot diagnose medical illnesses or prescribe pharmaceutical drugs. Please consult a registered medical practitioner at your local PHC or District Hospital for professional clinical evaluation.";
  }

  return {
    isPrescriptionAttempt: true,
    safetyLevel: "prescription_attempt",
    guidance,
  };
};

/**
 * Detect prompt injection attempts
 */
const detectPromptInjection = (text) => {
  if (!text || typeof text !== "string") return false;
  return INJECTION_PATTERNS.some((pattern) => pattern.test(text));
};

/**
 * Full safety analysis of user query
 */
const evaluateSafety = (text, language = "en") => {
  const emergencyCheck = detectEmergency(text, language);
  if (emergencyCheck) return emergencyCheck;

  const presCheck = detectDiagnosisOrPrescription(text, language);
  if (presCheck) return presCheck;

  const hasInjection = detectPromptInjection(text);

  if (hasInjection) {
    let refusal = "";
    if (language === "hi") {
      refusal = "मैं केवल जीवनसेतु सार्वजनिक स्वास्थ्य, अस्पताल, योजना और रेफरल समन्वय से संबंधित सत्यापित जानकारी में सहायता कर सकता हूँ। सुरक्षा नियमों को अनदेखा नहीं किया जा सकता।";
    } else if (language === "mr") {
      refusal = "मी केवळ जीवनसेतू सार्वजनिक आरोग्य, रुग्णालये, योजना आणि संदर्भ समन्वयाबाबत पडताळणी केलेली माहिती देऊ शकतो. सुरक्षा नियमांचे उल्लंघन करता येत नाही.";
    } else {
      refusal = "I am authorized strictly to provide verified JeevanSetu public health coordination, government schemes, and facility navigation guidance. System safety instructions cannot be bypassed.";
    }

    return {
      isEmergency: false,
      isPrescriptionAttempt: false,
      hasInjectionAttempt: true,
      isInjectionRefusal: true,
      safetyLevel: "injection_detected",
      message: refusal,
      requiresHumanReview: false,
    };
  }

  return {
    isEmergency: false,
    isPrescriptionAttempt: false,
    hasInjectionAttempt: false,
    safetyLevel: "safe",
    requiresHumanReview: false,
  };
};

module.exports = {
  detectEmergency,
  detectDiagnosisOrPrescription,
  detectPromptInjection,
  evaluateSafety,
};
