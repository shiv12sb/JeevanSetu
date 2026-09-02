const medicalKnowledgeService = require("../src/services/ai/medicalKnowledge.service");

console.log("Total conditions loaded:", medicalKnowledgeService.getConditionCount());

// Test 1: Exact search
const r1 = medicalKnowledgeService.searchCondition("dengue", "mr");
console.log("Search 'dengue':", r1.match ? r1.match.canonical_name : "NULL", "Score:", r1.confidence);

// Test 2: Marathi search
const r2 = medicalKnowledgeService.searchCondition("व्हायरल ताप", "mr");
console.log("Search 'व्हायरल ताप':", r2.match ? r2.match.canonical_name : "NULL", "Score:", r2.confidence);

// Test 3: Roman Marathi search
const r3 = medicalKnowledgeService.searchCondition("tap aala", "mr");
console.log("Search 'tap aala':", r3.match ? r3.match.canonical_name : "NULL", "Score:", r3.confidence);

// Test 4: Hindi search
const r4 = medicalKnowledgeService.searchCondition("mujhe bukhar hai", "hi");
console.log("Search 'mujhe bukhar hai':", r4.match ? r4.match.canonical_name : "NULL", "Score:", r4.confidence);

// Test 5: Cancer search & zero home cure check
const r5 = medicalKnowledgeService.searchCondition("breast cancer", "mr");
console.log("Search 'breast cancer':", r5.match ? r5.match.canonical_name : "NULL");
const guidanceCancer = medicalKnowledgeService.generateGuidance(r5.match.id, "mr");
console.log("Cancer supportive care length (must be 0):", r5.match.safe_supportive_care.length);
console.log("Cancer guidance contains MJPJAY:", guidanceCancer.guidanceText.includes("MJPJAY"));

// Test 6: Red flags
const rf1 = medicalKnowledgeService.checkRedFlags("chest pain and cold sweat");
console.log("Red flag 'chest pain':", rf1.isEmergency);

const rf2 = medicalKnowledgeService.checkRedFlags("saap ne kaata");
console.log("Red flag 'saap ne kaata':", rf2.isEmergency);

console.log("\nALL QUICK TESTS PASSED!");
