/**
 * ==============================================================================
 * JEEVANSETU TEST SUITE 48: MULTILINGUAL MEDICAL KNOWLEDGE ENGINE
 * ==============================================================================
 * Comprehensive automated test suite verifying:
 *  1. ~530+ Curated Condition Records across 17 Clinical Categories
 *  2. Trilingual Precision (Marathi Default, Hindi, English, Roman, Slang, Typos)
 *  3. In-Memory Search & Differential Symptom Scoring
 *  4. Oncology & Serious Disease Safety Protocol (Zero Home Cures, MJPJAY Routing)
 *  5. Deterministic Emergency Red-Flag Escalation (Instant 108 Trigger)
 *  6. Integration with AI Context, Safety Service, and OpenAI Realtime Voice Tools
 */

const assert = require("assert");
const medicalKnowledgeService = require("../src/services/ai/medicalKnowledge.service");
const safetyService = require("../src/services/ai/safety.service");
const contextService = require("../src/services/ai/context.service");
const FallbackAIProvider = require("../src/services/ai/providers/fallback.provider");
const realtimeVoiceService = require("../src/services/ai/realtimeVoice.service");

let totalTests = 0;
let passedTests = 0;

function runTest(testName, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ ${testName}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${testName}`);
    console.error(`    Error: ${err.message}`);
  }
}

async function runAsyncTest(testName, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✓ ${testName}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${testName}`);
    console.error(`    Error: ${err.message}`);
  }
}

async function main() {
  console.log("\n==============================================================================");
  console.log("PHASE 48: JEEVANSETU MULTILINGUAL MEDICAL KNOWLEDGE ENGINE TEST SUITE");
  console.log("==============================================================================\n");

  // SECTION 1: Dataset Integrity & Schema Validation
  console.log("[1/6] Validating Medical Knowledge Dataset Schema & Completeness...");

  runTest("Dataset contains at least 500 curated medical conditions", () => {
    const count = medicalKnowledgeService.getConditionCount();
    assert.ok(count >= 500, `Expected >= 500 conditions, found ${count}`);
  });

  runTest("All 17 Clinical Categories are populated", () => {
    const EXPECTED_CATEGORIES = [
      "infections_fever",
      "respiratory",
      "gastrointestinal",
      "cardiovascular",
      "neurological",
      "metabolic_endocrine",
      "womens_maternal",
      "pediatric",
      "dermatology",
      "musculoskeletal",
      "ent_ophthalmology",
      "mental_health",
      "oral_dental",
      "renal_urological",
      "hepatic_biliary",
      "oncology_cancers",
      "emergency_trauma"
    ];

    const conditions = medicalKnowledgeService.getAllConditions();
    const foundCategories = new Set(conditions.map((c) => c.category));

    EXPECTED_CATEGORIES.forEach((cat) => {
      assert.ok(foundCategories.has(cat), `Category '${cat}' is missing from conditions dataset!`);
    });
  });

  runTest("Every condition has non-empty trilingual names and required clinical metadata", () => {
    const conditions = medicalKnowledgeService.getAllConditions();
    conditions.forEach((c) => {
      assert.ok(c.id && typeof c.id === "string", `Condition ID missing for ${JSON.stringify(c)}`);
      assert.ok(c.canonical_name, `Canonical name missing for ${c.id}`);
      assert.ok(c.names && c.names.english && c.names.hindi && c.names.marathi, `Trilingual names missing for ${c.id}`);
      assert.ok(Array.isArray(c.common_symptoms), `Symptoms array missing for ${c.id}`);
      assert.ok(Array.isArray(c.general_information), `General info missing for ${c.id}`);
      assert.ok(Array.isArray(c.things_to_avoid), `Things to avoid missing for ${c.id}`);
      assert.ok(Array.isArray(c.appropriate_specialty), `Specialty missing for ${c.id}`);
      assert.ok(Array.isArray(c.facility_type), `Facility type missing for ${c.id}`);
      assert.ok(["self_care", "doctor_soon", "urgent", "emergency"].includes(c.urgency), `Invalid urgency '${c.urgency}' in ${c.id}`);
    });
  });

  // SECTION 2: Multilingual Search Precision (Marathi, Hindi, English, Roman, Slang, Typos)
  console.log("\n[2/6] Testing Multilingual & Typo-Tolerant Search Engine...");

  runTest("Exact and English search finds canonical condition", () => {
    const res = medicalKnowledgeService.searchCondition("Dengue Fever", "en");
    assert.ok(res.match !== null, "Expected match for 'Dengue Fever'");
    assert.strictEqual(res.match.id, "dengue_fever");
  });

  runTest("Pure Marathi search finds condition accurately", () => {
    const res1 = medicalKnowledgeService.searchCondition("व्हायरल ताप", "mr");
    assert.ok(res1.match !== null, "Expected match for 'व्हायरल ताप'");
    assert.strictEqual(res1.match.id, "viral_fever");

    const res2 = medicalKnowledgeService.searchCondition("क्षयरोग", "mr");
    assert.ok(res2.match !== null, "Expected match for 'क्षयरोग'");
    assert.strictEqual(res2.match.id, "tuberculosis_pulmonary");
  });

  runTest("Hindi search matches colloquial and clinical terms", () => {
    const res = medicalKnowledgeService.searchCondition("टाइफाइड बुखार", "hi");
    assert.ok(res.match !== null, "Expected match for 'टाइफाइड बुखार'");
    assert.strictEqual(res.match.id, "typhoid_fever");
  });

  runTest("Roman Marathi and Hinglish queries resolve correctly", () => {
    const res1 = medicalKnowledgeService.searchCondition("tap aala", "mr");
    assert.ok(res1.match !== null, "Expected match for 'tap aala'");
    assert.strictEqual(res1.match.id, "viral_fever");

    const res2 = medicalKnowledgeService.searchCondition("pottat kal", "mr");
    assert.ok(res2.match !== null, "Expected match for 'pottat kal'");

    const res3 = medicalKnowledgeService.searchCondition("pet kharab hai", "hi");
    assert.ok(res3.match !== null, "Expected match for 'pet kharab hai'");
  });

  runTest("Typo-tolerant fuzzy matching succeeds on misspelled queries", () => {
    const res1 = medicalKnowledgeService.searchCondition("dengu fevr", "mr");
    assert.ok(res1.match !== null, "Expected typo match for 'dengu fevr'");
    assert.strictEqual(res1.match.id, "dengue_fever");

    const res2 = medicalKnowledgeService.searchCondition("typhyd", "en");
    assert.ok(res2.match !== null, "Expected typo match for 'typhyd'");
    assert.strictEqual(res2.match.id, "typhoid_fever");
  });

  // SECTION 3: Symptom Scoring & Differential Evaluation
  console.log("\n[3/6] Testing Symptom-Based Differential Scoring...");

  runTest("Differential search scores multiple symptoms and returns candidates", () => {
    const results = medicalKnowledgeService.searchBySymptoms(["ताप", "अंगदुखी", "थकवा"], "mr");
    assert.ok(Array.isArray(results) && results.length > 0, "Expected ranked symptom results");
    assert.ok(results[0].score >= 1, "Expected match score >= 1");
    assert.ok(results[0].condition.id !== null, "Candidate condition must have valid ID");
  });

  runTest("Non-diagnostic disclaimer is enforced on symptom search guidance", () => {
    const guidance = medicalKnowledgeService.generateGuidance("viral_fever", "mr");
    assert.ok(guidance.guidanceText.includes("निश्चित निदानासाठी शासकीय PHC"), "Guidance must state PHC doctor examination requirement");
  });

  // SECTION 4: Oncology & Serious Disease Safety Protocol (Zero Home Cures)
  console.log("\n[4/6] Validating Oncology & Serious Illness Safety Protocol...");

  runTest("Cancer conditions strictly have ZERO home cures in safe_supportive_care", () => {
    const cancers = medicalKnowledgeService.getAllConditions().filter((c) => c.category === "oncology_cancers");
    assert.ok(cancers.length >= 20, `Expected >= 20 cancer conditions, found ${cancers.length}`);

    cancers.forEach((cancer) => {
      assert.strictEqual(cancer.safe_supportive_care.length, 0, `Cancer '${cancer.id}' must have 0 home cures!`);
    });
  });

  runTest("Cancer guidance embeds MJPJAY / PM-JAY and tertiary hospital referral", () => {
    const breastCancer = medicalKnowledgeService.getConditionById("breast_cancer_carcinoma");
    assert.ok(breastCancer !== null, "Breast cancer record must exist");

    const guidance = medicalKnowledgeService.generateGuidance(breastCancer.id, "mr");
    assert.ok(guidance.guidanceText.includes("MJPJAY") || guidance.guidanceText.includes("महात्मा ज्योतिराव फुले"), "Cancer guidance must mention MJPJAY scheme");
    assert.ok(guidance.guidanceText.includes("घरगुती उपाय करू नयेत"), "Cancer guidance must prohibit home remedies");
  });

  // SECTION 5: Deterministic Emergency Red Flag Escalation (108 Trigger)
  console.log("\n[5/6] Testing Deterministic Emergency Red-Flag Escalation...");

  runTest("Cardiac chest pain triggers deterministic emergency alert", () => {
    const eval1 = medicalKnowledgeService.checkRedFlags("मला छातीत तीव्र दुखत आहे आणि घाम येत आहे");
    assert.strictEqual(eval1.isEmergency, true, "Severe chest pain must be emergency");

    const eval2 = medicalKnowledgeService.checkRedFlags("acute chest pain radiating to left arm");
    assert.strictEqual(eval2.isEmergency, true, "Acute chest pain must be emergency");
  });

  runTest("Snakebite and poisoning trigger immediate 108 emergency escalation", () => {
    const eval1 = medicalKnowledgeService.checkRedFlags("शेतात सापाने चावले आहे");
    assert.strictEqual(eval1.isEmergency, true, "Snakebite in Marathi must be emergency");

    const eval2 = medicalKnowledgeService.checkRedFlags("saap ne kaata hai");
    assert.strictEqual(eval2.isEmergency, true, "Snakebite in Roman Hindi must be emergency");

    const eval3 = medicalKnowledgeService.checkRedFlags("कीटकनाशक विषबाधा झाली");
    assert.strictEqual(eval3.isEmergency, true, "Pesticide poisoning must be emergency");
  });

  runTest("Stroke / FAST symptoms trigger immediate 108 emergency escalation", () => {
    const eval1 = medicalKnowledgeService.checkRedFlags("चेहऱ्याची एक बाजू वाकडी झाली आणि बोलणे अडखळत आहे (stroke)");
    assert.strictEqual(eval1.isEmergency, true, "Stroke must trigger emergency");
  });

  // SECTION 6: AI Integration & Provider Verification
  console.log("\n[6/6] Verifying AI Context, Safety Service, and Realtime Tools Integration...");

  await runAsyncTest("SafetyService.detectEmergency catches red flags deterministically", async () => {
    const safety1 = safetyService.detectEmergency("मला खूप chest pain होत आहे", "mr");
    assert.ok(safety1 !== null && safety1.isEmergency === true, "Safety service must detect chest pain emergency");
    assert.strictEqual(safety1.emergencyPhone, "108");

    const safety2 = safetyService.detectEmergency("साप चावला", "mr");
    assert.ok(safety2 !== null && safety2.isEmergency === true, "Safety service must detect snakebite emergency");
  });

  await runAsyncTest("ContextService.retrieveContextForUser injects clinical protocol grounding", async () => {
    const context = await contextService.retrieveContextForUser({ role: "patient" }, "मला डेंग्यू ताप बद्दल माहिती द्या", "mr");
    assert.ok(context.contextText.includes("Dengue Fever") || context.contextText.includes("डेंग्यू"), "Context must contain Dengue clinical details");
    assert.ok(context.groundedCards.length > 0, "Grounded card must be returned");
    assert.ok(context.sources.length > 0, "Sources must be cited");
  });

  await runAsyncTest("FallbackAIProvider returns deterministic clinical guidance for conditions", async () => {
    const fallback = new FallbackAIProvider();
    const result = await fallback.generateCompletion({
      messages: [{ role: "user", content: "व्हायरल ताप घरगुती काळजी" }],
      language: "mr"
    });

    assert.ok(result.text.includes("व्हायरल ताप") || result.text.includes("Viral Fever"), "Fallback must provide Viral Fever guidance");
    assert.ok(result.text.includes("काळजी"), "Must include care instructions");
  });

  await runAsyncTest("RealtimeVoiceService executes search_medical_condition and check_medical_red_flags", async () => {
    // 1. Tool execution: search_medical_condition
    const toolCall1 = {
      name: "search_medical_condition",
      args: { query: "मधुमेह (diabetes)", language: "mr" }
    };
    const res1 = await realtimeVoiceService.executeToolCall(toolCall1, { role: "patient" });
    assert.ok(res1.found === true, "search_medical_condition must find Type 2 Diabetes");
    assert.strictEqual(res1.condition_id, "type_2_diabetes_mellitus");

    // 2. Tool execution: check_medical_red_flags
    const toolCall2 = {
      name: "check_medical_red_flags",
      args: { symptoms_description: "patient collapsed with chest pain" }
    };
    const res2 = await realtimeVoiceService.executeToolCall(toolCall2, { role: "patient" });
    assert.strictEqual(res2.is_emergency, true, "check_medical_red_flags must return is_emergency = true");
    assert.strictEqual(res2.emergency_phone, "108");
  });

  console.log("\n==============================================================================");
  console.log(`PHASE 48 TEST SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED (${((passedTests / totalTests) * 100).toFixed(1)}%)`);
  console.log("==============================================================================\n");

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal test runner error:", err);
  process.exit(1);
});
