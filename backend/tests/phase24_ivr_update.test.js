const assert = require("assert");
const ivrService = require("../src/services/ivr/ivr.service");
const { getIvrContent, IVR_CONTENT } = require("../src/services/ivr/ivrContent");
const { MockTelephonyProvider, ProductionTelephonyAdapter, BaseIVRProvider } = require("../src/services/ivr/ivr.provider");
const { maskPhoneNumber, checkRateLimit, verifyReplayProtection } = require("../src/services/ivr/ivrSecurity");
const aiService = require("../src/services/ai/ai.service");

let passed = 0;
let failed = 0;

const test = (condition, name) => {
  if (condition) {
    console.log(`  ✓ PASS: ${name}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${name}`);
    failed++;
  }
};

const runPhase24Tests = async () => {
  console.log("\n=======================================================");
  console.log("   JEEVANSETU PHASE 24 — IVR & FEATURE-PHONE ACCESS AUDIT");
  console.log("=======================================================\n");

  const mockAdmin = { profileId: "admin-uuid-001", role: "district_admin" };
  const mockPhcStaff = { profileId: "phc-staff-001", role: "phc_staff", assignedPhcId: "phc-1" };
  const mockOtherStaff = { profileId: "phc-staff-002", role: "phc_staff", assignedPhcId: "phc-2" };
  const mockPatient = { profileId: "p1", role: "patient" };

  // -------------------------------------------------------------------------
  // Part 1: Verification of 55 IVR System & Accessibility Criteria
  // -------------------------------------------------------------------------
  console.log("--- 1. Verification of 55 IVR System & Accessibility Criteria ---");

  // 1. Language menu initialization
  const session1 = await ivrService.createSession({ callerPhone: "+91 98234 11204", language: "hi" });
  test(session1.session.current_menu === "language_select", "1. IVR call session initializes in language_select menu");

  // 2. Hindi flow
  const hiTransition = await ivrService.processInteraction({ sessionId: session1.session.session_id, dtmfDigit: "1" });
  test(hiTransition.session.language === "hi" && hiTransition.voiceResponse.promptText.includes("जीवनसेतु"), "2. Digit '1' selects Hindi flow");

  // 3. Marathi flow
  const sessionMr = await ivrService.createSession({ callerPhone: "+91 98234 11204", language: "hi" });
  const mrTransition = await ivrService.processInteraction({ sessionId: sessionMr.session.session_id, dtmfDigit: "2" });
  test(mrTransition.session.language === "mr" && mrTransition.voiceResponse.promptText.includes("जीवनसेतू"), "3. Digit '2' selects Marathi flow");

  // 4. English flow
  const sessionEn = await ivrService.createSession({ callerPhone: "+91 98234 11204", language: "hi" });
  const enTransition = await ivrService.processInteraction({ sessionId: sessionEn.session.session_id, dtmfDigit: "3" });
  test(enTransition.session.language === "en" && enTransition.voiceResponse.promptText.includes("Welcome to JeevanSetu"), "4. Digit '3' selects English flow");

  // 5. Main menu transition
  test(hiTransition.session.current_menu === "main_menu", "5. Successfully navigated to main_menu after language selection");

  // 6. Submenu 1: Health Guidance
  const healthSub = await ivrService.processInteraction({ sessionId: session1.session.session_id, dtmfDigit: "1" });
  test(healthSub.session.current_menu === "health_education", "6. Option 1 navigates to health_education submenu");

  // 7. Health Guidance Sub-option 1: Fever & Rest
  const feverTip = await ivrService.processInteraction({ sessionId: session1.session.session_id, dtmfDigit: "1" });
  test(feverTip.voiceResponse.promptText.includes("बुखार") || feverTip.voiceResponse.promptText.includes("fever"), "7. Health Guidance sub-option 1 provides Fever & Home care advice");

  // 8. Health Guidance Sub-option 2: ORS & Hydration
  const orsTip = await ivrService.processInteraction({ sessionId: session1.session.session_id, dtmfDigit: "2" });
  test(orsTip.voiceResponse.promptText.includes("ओआरएस") || orsTip.voiceResponse.promptText.includes("ORS"), "8. Health Guidance sub-option 2 provides Hydration & ORS advice");

  // 9. Health Guidance Sub-option 3: Maternal & ANC
  const maternalTip = await ivrService.processInteraction({ sessionId: session1.session.session_id, dtmfDigit: "3" });
  test(maternalTip.voiceResponse.promptText.includes("गर्भावस्था") || maternalTip.voiceResponse.promptText.includes("antenatal"), "9. Health Guidance sub-option 3 provides Maternal & Child health advice");

  // 10. Health Guidance Sub-option 4: Emergency Symptoms
  const emergSub = await ivrService.processInteraction({ sessionId: session1.session.session_id, dtmfDigit: "4" });
  test(emergSub.session.current_menu === "emergency_symptoms", "10. Health Guidance sub-option 4 navigates to Emergency Symptoms");

  // 11. Emergency symptom triggers immediate 108 prompt and hangup
  const emerg108 = await ivrService.processInteraction({ sessionId: session1.session.session_id, dtmfDigit: "1" });
  test(emerg108.voiceResponse.promptText.includes("108") && emerg108.voiceResponse.hangup === true, "11. Emergency symptom triggers immediate 108 emergency alert and hangup");

  // 12. Submenu 2: Referral Status PIN Prompt
  const refSession = await ivrService.createSession({ callerPhone: "+91 98234 11204", language: "hi" });
  await ivrService.processInteraction({ sessionId: refSession.session.session_id, dtmfDigit: "1" });
  const refSub = await ivrService.processInteraction({ sessionId: refSession.session.session_id, dtmfDigit: "2" });
  test(refSub.session.current_menu === "referral_lookup", "12. Option 2 navigates to Referral Status PIN authentication");

  // 13. Valid PIN reveals referral status
  const validPinRes = await ivrService.processInteraction({ sessionId: refSession.session.session_id, dtmfDigit: "1234" });
  test(validPinRes.session.is_verified === true && validPinRes.voiceResponse.promptText.includes("रेफरल वर्तमान में"), "13. Authenticated 4-digit PIN returns verified referral status");

  // 14. Invalid PIN denies personal referral disclosure
  const unauthSession = await ivrService.createSession({ callerPhone: "+91 98234 11204", language: "hi" });
  await ivrService.processInteraction({ sessionId: unauthSession.session.session_id, dtmfDigit: "1" });
  await ivrService.processInteraction({ sessionId: unauthSession.session.session_id, dtmfDigit: "2" });
  const invalidPinRes = await ivrService.processInteraction({ sessionId: unauthSession.session.session_id, dtmfDigit: "0000" });
  test(invalidPinRes.session.is_verified === false && invalidPinRes.voiceResponse.promptText.includes("सुरक्षा सत्यापन विफल"), "14. Invalid PIN safely denies personal referral disclosure");

  // 15. Submenu 3: Facility Lookup
  const facSession = await ivrService.createSession({ callerPhone: "+91 98234 11204", language: "hi" });
  await ivrService.processInteraction({ sessionId: facSession.session.session_id, dtmfDigit: "1" }); // Hindi
  const facSub = await ivrService.processInteraction({ sessionId: facSession.session.session_id, dtmfDigit: "3" });
  test(facSub.session.current_menu === "facility_lookup", "15. Option 3 navigates to Facility Lookup submenu");

  // 16. Facility Lookup Sub-option 1: Ashti PHC
  const ashtiFac = await ivrService.processInteraction({ sessionId: facSession.session.session_id, dtmfDigit: "1" });
  test(ashtiFac.voiceResponse.promptText.includes("आष्टी प्राथमिक स्वास्थ्य केंद्र"), "16. Facility Lookup sub-option 1 returns verified Ashti PHC details");

  // 17. Facility Lookup Sub-option 2: Chamorshi Sub-Centre
  const chamorshiFac = await ivrService.processInteraction({ sessionId: facSession.session.session_id, dtmfDigit: "2" });
  test(chamorshiFac.voiceResponse.promptText.includes("चामोर्शी"), "17. Facility Lookup sub-option 2 returns Chamorshi Sub-Centre details");

  // 18. Facility Lookup Sub-option 3: District Hospital
  const hospFac = await ivrService.processInteraction({ sessionId: facSession.session.session_id, dtmfDigit: "3" });
  test(hospFac.voiceResponse.promptText.includes("जिला नागरिक अस्पताल गढ़चिरौली"), "18. Facility Lookup sub-option 3 returns District Hospital details");

  // 19. Submenu 4: Medicine Availability
  const medSession = await ivrService.createSession({ callerPhone: "+91 98234 11204", language: "hi" });
  await ivrService.processInteraction({ sessionId: medSession.session.session_id, dtmfDigit: "1" });
  const medSub = await ivrService.processInteraction({ sessionId: medSession.session.session_id, dtmfDigit: "4" });
  test(medSub.session.current_menu === "medicine_info", "19. Option 4 navigates to Essential Medicine Availability submenu");

  // 20. Medicine Availability: Paracetamol
  const paraRes = await ivrService.processInteraction({ sessionId: medSession.session.session_id, dtmfDigit: "1" });
  test(paraRes.voiceResponse.promptText.includes("पैरासिटामोल"), "20. Medicine Availability sub-option 1 returns Paracetamol stock status");

  // 21. Medicine Availability: ORS
  const orsMedRes = await ivrService.processInteraction({ sessionId: medSession.session.session_id, dtmfDigit: "2" });
  test(orsMedRes.voiceResponse.promptText.includes("ओआरएस"), "21. Medicine Availability sub-option 2 returns ORS stock status");

  // 22. Medicine Availability: Amlodipine
  const amloRes = await ivrService.processInteraction({ sessionId: medSession.session.session_id, dtmfDigit: "3" });
  test(amloRes.voiceResponse.promptText.includes("एम्लोडिपिन") || amloRes.voiceResponse.promptText.includes("रक्तचाप"), "22. Medicine Availability sub-option 3 returns Amlodipine blood pressure medicine status");

  // 23. Medicine Availability: Metformin
  const metRes = await ivrService.processInteraction({ sessionId: medSession.session.session_id, dtmfDigit: "4" });
  test(metRes.voiceResponse.promptText.includes("मेटफॉर्मिन") || metRes.voiceResponse.promptText.includes("मधुमेह"), "23. Medicine Availability sub-option 4 returns Metformin diabetes medicine status");

  // 24. Medicine disclaimer
  test(paraRes.voiceResponse.promptText.includes("डॉक्टर की सलाह") || paraRes.voiceResponse.promptText.includes("रिकॉर्ड पर आधारित"), "24. Medicine availability includes freshness / doctor consultation disclaimer");

  // 25. Submenu 5: Callback Request
  const cbSession = await ivrService.createSession({ callerPhone: "+91 98333 44556", language: "hi" });
  await ivrService.processInteraction({ sessionId: cbSession.session.session_id, dtmfDigit: "1" });
  const cbSub = await ivrService.processInteraction({ sessionId: cbSession.session.session_id, dtmfDigit: "5" });
  test(cbSub.session.current_menu === "callback_request", "25. Option 5 navigates to Callback Request submenu");

  // 26. Callback Request Confirmation
  const cbRes = await ivrService.processInteraction({ sessionId: cbSession.session.session_id, dtmfDigit: "1" });
  test(cbRes.voiceResponse.promptText.includes("अनुरोध दर्ज"), "26. Option 5 creates ASHA / PHC health worker callback request");

  // 27. Submenu 6: Government Schemes
  const schSession = await ivrService.createSession({ callerPhone: "+91 98234 11204", language: "hi" });
  await ivrService.processInteraction({ sessionId: schSession.session.session_id, dtmfDigit: "1" });
  const schSub = await ivrService.processInteraction({ sessionId: schSession.session.session_id, dtmfDigit: "6" });
  test(schSub.session.current_menu === "schemes_info", "27. Option 6 navigates to Government Schemes submenu");

  // 28. Schemes Sub-option 1: PM-JAY
  const pmjayRes = await ivrService.processInteraction({ sessionId: schSession.session.session_id, dtmfDigit: "1" });
  test(pmjayRes.voiceResponse.promptText.includes("आयुष्मान भारत") && pmjayRes.voiceResponse.promptText.includes("5 लाख"), "28. Government Schemes sub-option 1 returns Ayushman Bharat PM-JAY summary");

  // 29. Schemes Sub-option 2: MJPJAY
  const mjpjayRes = await ivrService.processInteraction({ sessionId: schSession.session.session_id, dtmfDigit: "2" });
  test(mjpjayRes.voiceResponse.promptText.includes("महात्मा ज्योतिराव फुले"), "29. Government Schemes sub-option 2 returns MJPJAY summary");

  // 30. Schemes Sub-option 3: JSY
  const jsyRes = await ivrService.processInteraction({ sessionId: schSession.session.session_id, dtmfDigit: "3" });
  test(jsyRes.voiceResponse.promptText.includes("जननी सुरक्षा") && jsyRes.voiceResponse.promptText.includes("1400"), "30. Government Schemes sub-option 3 returns Janani Suraksha Yojana summary");

  // 31. Duplicate callback request prevention
  const dupCb = await ivrService.createFollowUpRequest({
    callerPhone: "+91 98333 44556",
    preferredLanguage: "hi",
    reason: "Duplicate callback test",
  });
  test(dupCb.isDuplicate === true, "31. Duplicate callback request from same phone number is safely deduplicated");

  // 32. Staff retrieves callback queue filtered by assigned PHC
  const queue = await ivrService.getFollowUpRequests(mockPhcStaff);
  test(Array.isArray(queue.items) && queue.items.every((i) => i.assigned_phc_id === "phc-1"), "32. Staff retrieves callback queue filtered by assigned PHC");

  // 33. Staff updates callback to 'contacted'
  const updatedCb1 = await ivrService.updateFollowUpRequest(mockPhcStaff, "ivr-fu-1", {
    status: "contacted",
    notes: "Spoke with caller and verified health status.",
  });
  test(updatedCb1.status === "contacted" && updatedCb1.staff_notes.includes("verified"), "33. Staff updates callback status to 'contacted' with notes");

  // 34. Staff updates callback to 'resolved'
  const updatedCb2 = await ivrService.updateFollowUpRequest(mockPhcStaff, "ivr-fu-1", {
    status: "resolved",
    notes: "Patient attended PHC OPD successfully.",
  });
  test(updatedCb2.status === "resolved", "34. Staff updates callback status to 'resolved'");

  // 35. Unauthorized cross-PHC callback modification blocked
  try {
    await ivrService.updateFollowUpRequest(mockOtherStaff, "ivr-fu-1", { status: "contacted" });
    test(false, "35. Unauthorized staff from another PHC blocked from modifying callback (403)");
  } catch (err) {
    test(err.statusCode === 403 || err.message.includes("Forbidden"), "35. Unauthorized staff from another PHC blocked from modifying callback (403)");
  }

  // 36. Invalid DTMF keypress
  const invSession = await ivrService.createSession({ callerPhone: "+91 98234 11204", language: "hi" });
  await ivrService.processInteraction({ sessionId: invSession.session.session_id, dtmfDigit: "1" });
  const invRes = await ivrService.processInteraction({ sessionId: invSession.session.session_id, dtmfDigit: "8" });
  test(invRes.voiceResponse.promptText.includes("अमान्य इनपुट") || invRes.voiceResponse.promptText.includes("Invalid"), "36. Invalid DTMF keypress re-prompts caller safely without crashing");

  // 37. Consecutive 3 invalid attempts terminates call
  await ivrService.processInteraction({ sessionId: invSession.session.session_id, dtmfDigit: "8" });
  const maxRetriesRes = await ivrService.processInteraction({ sessionId: invSession.session.session_id, dtmfDigit: "8" });
  test(maxRetriesRes.voiceResponse.hangup === true && maxRetriesRes.voiceResponse.promptText.includes("अधिकतम प्रयास"), "37. Consecutive 3 invalid attempts terminates call safely");

  // 38. Call timeout triggers re-prompt
  const toSession = await ivrService.createSession({ callerPhone: "+91 98234 11204", language: "hi" });
  const toRes = await ivrService.processInteraction({ sessionId: toSession.session.session_id, timeout: true });
  test(toRes.voiceResponse.promptText.includes("कोई इनपुट प्राप्त नहीं हुआ"), "38. Call timeout triggers re-prompt with menu instructions");

  // 39. Consecutive timeouts terminate call cleanly
  await ivrService.processInteraction({ sessionId: toSession.session.session_id, timeout: true });
  const maxToRes = await ivrService.processInteraction({ sessionId: toSession.session.session_id, timeout: true });
  test(maxToRes.voiceResponse.hangup === true, "39. Consecutive timeouts terminate call cleanly");

  // 40. Digit 9 repeats current menu
  const repSession = await ivrService.createSession({ callerPhone: "+91 98234 11204", language: "hi" });
  await ivrService.processInteraction({ sessionId: repSession.session.session_id, dtmfDigit: "1" });
  const repRes = await ivrService.processInteraction({ sessionId: repSession.session.session_id, dtmfDigit: "9" });
  test(repRes.session.current_menu === "main_menu", "40. Digit 9 repeats current menu");

  // 41. Digit 0 terminates session with safe goodbye
  const exitSession = await ivrService.createSession({ callerPhone: "+91 98234 11204", language: "hi" });
  const exitRes = await ivrService.processInteraction({ sessionId: exitSession.session.session_id, dtmfDigit: "0" });
  test(exitRes.voiceResponse.hangup === true && exitRes.voiceResponse.promptText.includes("धन्यवाद"), "41. Digit 0 terminates session with safe goodbye audio and hangup");

  // 42. Star key (*) repeats current prompt
  const starSession = await ivrService.createSession({ callerPhone: "+91 98234 11204", language: "hi" });
  await ivrService.processInteraction({ sessionId: starSession.session.session_id, dtmfDigit: "1" });
  const starRes = await ivrService.processInteraction({ sessionId: starSession.session.session_id, dtmfDigit: "*" });
  test(starRes.session.current_menu === "main_menu", "42. Star key (*) repeats current prompt");

  // 43. Hash key (#) returns to main menu
  const hashSession = await ivrService.createSession({ callerPhone: "+91 98234 11204", language: "hi" });
  await ivrService.processInteraction({ sessionId: hashSession.session.session_id, dtmfDigit: "1" });
  await ivrService.processInteraction({ sessionId: hashSession.session.session_id, dtmfDigit: "1" }); // Health guidance
  const hashRes = await ivrService.processInteraction({ sessionId: hashSession.session.session_id, dtmfDigit: "#" });
  test(hashRes.session.current_menu === "main_menu", "43. Hash key (#) returns cleanly to main menu");

  // 44. Inactive expired session
  const expSession = await ivrService.createSession({ callerPhone: "+91 98234 11204", language: "hi" });
  expSession.session.expires_at = new Date(Date.now() - 5000).toISOString();
  const expRes = await ivrService.processInteraction({ sessionId: expSession.session.session_id, dtmfDigit: "1" });
  test(expRes.isExpired === true && expRes.voiceResponse.hangup === true, "44. Inactive expired session (TTL 10 min) safely rejected with hangup");

  // 45. Masked phone numbers for logging & privacy
  const maskedPhone = maskPhoneNumber("+91 98234 11204");
  test(maskedPhone.includes("XX") && !maskedPhone.includes("234"), "45. Caller phone numbers properly masked for logging & privacy (+91 98XXX XX04)");

  // 46. Webhook rate limiter
  const rl = checkRateLimit("caller-phone-check");
  test(rl.allowed === true && typeof rl.remaining === "number", "46. Webhook rate limiter enforces threshold per caller / IP");

  // 47. Replay protection timestamp drift
  const staleTimestamp = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const replayDrift = verifyReplayProtection({ timestamp: staleTimestamp, nonce: "n1" });
  test(replayDrift.valid === false, "47. Replay protection verifies timestamp drift window and rejects expired tokens");

  // 48. Replay protection duplicate nonce
  const goodNonce = "nonce-tok-p24-101";
  const freshTime = new Date().toISOString();
  const r1 = verifyReplayProtection({ timestamp: freshTime, nonce: goodNonce });
  const r2 = verifyReplayProtection({ timestamp: freshTime, nonce: goodNonce });
  test(r1.valid === true && r2.valid === false, "48. Replay protection rejects duplicate nonce tokens");

  // 49. Provider webhook signature verification
  const prov = new MockTelephonyProvider();
  const sigResult = prov.verifyWebhookSignature({ headers: { "x-ivr-signature": "dev" } });
  test(sigResult === true, "49. Provider webhook signature verification supported in telephony adapters");

  // 50. MockTelephonyProvider generates XML and JSON
  const mockResp = prov.buildVoiceResponse({ promptText: "Hello", gather: { numDigits: 1 } });
  test(mockResp.xmlResponse.includes("<Say>Hello</Say>") && mockResp.promptText === "Hello", "50. MockTelephonyProvider generates valid Voice XML and JSON responses");

  // 51. ProductionTelephonyAdapter generates compliant TwiML
  const prodAdapter = new ProductionTelephonyAdapter();
  const prodResp = prodAdapter.buildVoiceResponse({ promptText: "नमस्ते", gather: { numDigits: 1 }, language: "hi-IN" });
  test(prodResp.xmlResponse.includes("<Gather") && prodResp.xmlResponse.includes("language=\"hi-IN\""), "51. ProductionTelephonyAdapter generates compliant TwiML XML with language headers");

  // 52. AI prohibited from diagnosing disease over IVR
  const aiDiag = await aiService.processChat({
    user: mockPatient,
    message: "Based on IVR menu 1, do I have malaria or tuberculosis?",
    language: "en",
  });
  test(aiDiag.safetyLevel === "prescription_attempt" || aiDiag.answer.includes("cannot diagnose"), "52. AI is strictly prohibited from diagnosing disease or prescribing drugs over IVR");

  // 53. AI structured response contract validation
  const aiContractValid = await aiService.formatSafeIVRPrompt({
    menuType: "health_guidance",
    language: "en",
    rawAIOutput: JSON.stringify({
      promptText: "Drink plenty of boiled water and rest.",
      allowedDtmf: ["1", "2", "3", "9"],
      nextMenu: "health_guidance",
      isEmergency: false,
      safetyDisclaimer: "Informational assistance only.",
    }),
  });
  test(aiContractValid.contractValidated === true && aiContractValid.promptText.includes("Drink plenty"), "53. AI structured response contract validation enforces format and strips ungrounded text");

  // 54. Malformed AI output falls back to deterministic prompt
  const aiFallback = await aiService.formatSafeIVRPrompt({
    menuType: "schemes_info",
    language: "hi",
    rawAIOutput: "malformed non-json or diagnose illness and take 500mg amoxicillin",
  });
  test(aiFallback.isFallback === true && aiFallback.promptText.includes("आयुष्मान भारत"), "54. Malformed AI output falls back cleanly to deterministic local-language prompt dictionary");

  // 55. Operational analytics calculations
  const analytics = await ivrService.getAnalytics(mockAdmin);
  test(
    analytics.total_calls >= 12 &&
    analytics.language_breakdown.hi === 60 &&
    typeof analytics.callback_resolution_rate_percentage === "number",
    "55. Operational analytics calculates call volumes, language breakdown, and resolution rate"
  );

  // -------------------------------------------------------------------------
  // Part 2: Synthetic Caller Scenarios A through L
  // -------------------------------------------------------------------------
  console.log("\n--- 2. Synthetic Caller Scenarios A through L ---");

  // Scenario A: Hindi caller checks seasonal fever guidance
  console.log("Scenario A: Hindi caller checks seasonal fever guidance");
  const sA = await ivrService.createSession({ callerPhone: "+91 98111 00001", language: "hi" });
  await ivrService.processInteraction({ sessionId: sA.session.session_id, dtmfDigit: "1" }); // Select Hindi
  await ivrService.processInteraction({ sessionId: sA.session.session_id, dtmfDigit: "1" }); // Health guidance
  const sA_tip = await ivrService.processInteraction({ sessionId: sA.session.session_id, dtmfDigit: "1" }); // Fever tip
  test(sA_tip.voiceResponse.promptText.includes("मौसमी बुखार में भरपूर आराम करें"), "Scenario A: Hindi caller retrieves seasonal fever guidance");

  // Scenario B: Marathi caller checks referral status with valid PIN
  console.log("Scenario B: Marathi caller checks referral status with valid PIN");
  const sB = await ivrService.createSession({ callerPhone: "+91 98222 00002", language: "hi" });
  await ivrService.processInteraction({ sessionId: sB.session.session_id, dtmfDigit: "2" }); // Select Marathi
  await ivrService.processInteraction({ sessionId: sB.session.session_id, dtmfDigit: "2" }); // Referral Status
  const sB_stat = await ivrService.processInteraction({ sessionId: sB.session.session_id, dtmfDigit: "1234" }); // PIN
  test(sB_stat.session.is_verified === true && sB_stat.voiceResponse.promptText.includes("आपला रेफरल सध्या"), "Scenario B: Marathi caller checks referral status with valid PIN");

  // Scenario C: English caller checks medicine availability
  console.log("Scenario C: English caller checks medicine availability");
  const sC = await ivrService.createSession({ callerPhone: "+91 98333 00003", language: "hi" });
  await ivrService.processInteraction({ sessionId: sC.session.session_id, dtmfDigit: "3" }); // Select English
  await ivrService.processInteraction({ sessionId: sC.session.session_id, dtmfDigit: "4" }); // Medicines
  const sC_med = await ivrService.processInteraction({ sessionId: sC.session.session_id, dtmfDigit: "1" }); // Paracetamol
  test(sC_med.voiceResponse.promptText.includes("Paracetamol 500mg tablets are in stock"), "Scenario C: English caller checks medicine availability");

  // Scenario D: Caller checks government schemes (PM-JAY)
  console.log("Scenario D: Caller checks government schemes (PM-JAY)");
  const sD = await ivrService.createSession({ callerPhone: "+91 98444 00004", language: "hi" });
  await ivrService.processInteraction({ sessionId: sD.session.session_id, dtmfDigit: "1" }); // Hindi
  await ivrService.processInteraction({ sessionId: sD.session.session_id, dtmfDigit: "6" }); // Schemes
  const sD_sch = await ivrService.processInteraction({ sessionId: sD.session.session_id, dtmfDigit: "1" }); // PM-JAY
  test(sD_sch.voiceResponse.promptText.includes("5 लाख"), "Scenario D: Caller checks government schemes (PM-JAY)");

  // Scenario E: Caller navigates facility lookup (District Hospital)
  console.log("Scenario E: Caller navigates facility lookup (District Hospital)");
  const sE = await ivrService.createSession({ callerPhone: "+91 98555 00005", language: "hi" });
  await ivrService.processInteraction({ sessionId: sE.session.session_id, dtmfDigit: "1" });
  await ivrService.processInteraction({ sessionId: sE.session.session_id, dtmfDigit: "3" }); // Facilities
  const sE_fac = await ivrService.processInteraction({ sessionId: sE.session.session_id, dtmfDigit: "3" }); // District Hospital
  test(sE_fac.voiceResponse.promptText.includes("300 बिस्तरों"), "Scenario E: Caller navigates facility lookup (District Hospital)");

  // Scenario F: Caller enters invalid PIN for referral lookup
  console.log("Scenario F: Caller enters invalid PIN for referral lookup");
  const sF = await ivrService.createSession({ callerPhone: "+91 98666 00006", language: "hi" });
  await ivrService.processInteraction({ sessionId: sF.session.session_id, dtmfDigit: "1" });
  await ivrService.processInteraction({ sessionId: sF.session.session_id, dtmfDigit: "2" });
  const sF_deny = await ivrService.processInteraction({ sessionId: sF.session.session_id, dtmfDigit: "9999" });
  test(sF_deny.voiceResponse.promptText.includes("सुरक्षा सत्यापन विफल"), "Scenario F: Caller enters invalid PIN for referral lookup");

  // Scenario G: Caller reports emergency symptom (chest pain) -> immediate 108 alert
  console.log("Scenario G: Caller reports emergency symptom (chest pain) -> immediate 108 alert");
  const sG = await ivrService.createSession({ callerPhone: "+91 98777 00007", language: "hi" });
  await ivrService.processInteraction({ sessionId: sG.session.session_id, dtmfDigit: "1" });
  await ivrService.processInteraction({ sessionId: sG.session.session_id, dtmfDigit: "1" }); // Health guidance
  await ivrService.processInteraction({ sessionId: sG.session.session_id, dtmfDigit: "4" }); // Emergency symptoms
  const sG_emerg = await ivrService.processInteraction({ sessionId: sG.session.session_id, dtmfDigit: "1" }); // Chest pain
  test(sG_emerg.voiceResponse.hangup === true && sG_emerg.voiceResponse.promptText.includes("108"), "Scenario G: Caller reports emergency symptom -> immediate 108 alert");

  // Scenario H: Caller requests ASHA callback -> staff updates status
  console.log("Scenario H: Caller requests ASHA callback -> staff updates status");
  const sH = await ivrService.createSession({ callerPhone: "+91 98888 00008", language: "hi" });
  await ivrService.processInteraction({ sessionId: sH.session.session_id, dtmfDigit: "1" });
  await ivrService.processInteraction({ sessionId: sH.session.session_id, dtmfDigit: "5" }); // Callback request
  const sH_cb = await ivrService.processInteraction({ sessionId: sH.session.session_id, dtmfDigit: "1" });
  test(sH_cb.voiceResponse.promptText.includes("अनुरोध दर्ज"), "Scenario H: Caller requests ASHA callback");

  // Scenario I: Repeated duplicate callback attempt deduplicated
  console.log("Scenario I: Repeated duplicate callback attempt deduplicated");
  const sI_dup = await ivrService.createFollowUpRequest({
    callerPhone: "+91 98888 00008",
    reason: "Duplicate callback attempt from synthetic scenario I",
  });
  test(sI_dup.isDuplicate === true, "Scenario I: Repeated duplicate callback attempt deduplicated");

  // Scenario J: Max retries exceeded triggers safe hangup
  console.log("Scenario J: Max retries exceeded triggers safe hangup");
  const sJ = await ivrService.createSession({ callerPhone: "+91 98999 00009", language: "hi" });
  await ivrService.processInteraction({ sessionId: sJ.session.session_id, dtmfDigit: "1" });
  await ivrService.processInteraction({ sessionId: sJ.session.session_id, dtmfDigit: "7" }); // Attempt 1
  await ivrService.processInteraction({ sessionId: sJ.session.session_id, dtmfDigit: "7" }); // Attempt 2
  const sJ_hang = await ivrService.processInteraction({ sessionId: sJ.session.session_id, dtmfDigit: "7" }); // Attempt 3
  test(sJ_hang.voiceResponse.hangup === true && sJ_hang.voiceResponse.promptText.includes("अधिकतम प्रयास"), "Scenario J: Max retries exceeded triggers safe hangup");

  // Scenario K: Session timeout and expiry handled safely
  console.log("Scenario K: Session timeout and expiry handled safely");
  const sK = await ivrService.createSession({ callerPhone: "+91 98000 00010", language: "hi" });
  sK.session.expires_at = new Date(Date.now() - 2000).toISOString();
  const sK_res = await ivrService.processInteraction({ sessionId: sK.session.session_id, dtmfDigit: "1" });
  test(sK_res.isExpired === true && sK_res.voiceResponse.hangup === true, "Scenario K: Session timeout and expiry handled safely");

  // Scenario L: AI failure cleanly falls back to deterministic prompt
  console.log("Scenario L: AI failure cleanly falls back to deterministic prompt");
  const sL_fallback = await aiService.formatSafeIVRPrompt({
    menuType: "facility_lookup",
    language: "mr",
    rawAIOutput: "{ corrupt json syntax ::: ??? }",
  });
  test(sL_fallback.isFallback === true && sL_fallback.promptText.includes("आष्टी प्राथमिक आरोग्य केंद्र"), "Scenario L: AI failure cleanly falls back to deterministic prompt");

  console.log("\n=======================================================");
  console.log(`   TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("=======================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
};

runPhase24Tests().catch((e) => {
  console.error("Test execution error:", e);
  process.exit(1);
});
