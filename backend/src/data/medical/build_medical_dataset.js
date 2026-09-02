/**
 * ==============================================================================
 * JEEVANSETU MASTER MEDICAL KNOWLEDGE DATASET COMPILER (~550+ Conditions)
 * ==============================================================================
 * Compiles all category files into:
 *  1. conditions.json (~550+ fully populated structured conditions)
 *  2. symptoms.json (200+ indexed symptom-to-condition mappings)
 *  3. synonyms.json (Inverted search dictionary for EN, HI, MR, Roman & Slang)
 *  4. red_flags.json (Deterministic emergency triggers)
 */

const fs = require("fs");
const path = require("path");

const DATA_DIR = __dirname;

const infections = require("./category_infections");
const respiratoryGi = require("./category_respiratory_gi");
const cardioNeuro = require("./category_cardio_neuro");
const metabolicWomensPed = require("./category_metabolic_womens_pediatric");
const dermOrthoEnt = require("./category_derm_ortho_ent");
const mentalOralRenalHep = require("./category_mental_oral_renal_hepatic");
const oncologyEmerg = require("./category_oncology_emergency");
const expansion = require("./category_expansion");
const coreClinical = require("./category_core_clinical");
const expandedRegistry = require("./category_expanded_registry");

// Combine all category datasets
const allConditions = [
  ...infections,
  ...respiratoryGi,
  ...cardioNeuro,
  ...metabolicWomensPed,
  ...dermOrthoEnt,
  ...mentalOralRenalHep,
  ...oncologyEmerg,
  ...expansion,
  ...coreClinical,
  ...expandedRegistry
];

console.log(`[COMPILER] Total raw conditions collected: ${allConditions.length}`);

// Deduplicate conditions by ID
const conditionMap = new Map();
allConditions.forEach((c) => {
  if (!conditionMap.has(c.id)) {
    conditionMap.set(c.id, c);
  }
});

const conditions = Array.from(conditionMap.values());
console.log(`[COMPILER] Total unique conditions after deduplication: ${conditions.length}`);

// 1. Build Inverted Synonyms Dictionary
const synonymsDict = {};
const addSynonym = (term, conditionId) => {
  if (!term || typeof term !== "string") return;
  const clean = term.toLowerCase().trim().replace(/[.,!?:;()]/g, "");
  if (clean.length < 2) return;
  if (!synonymsDict[clean]) {
    synonymsDict[clean] = [];
  }
  if (!synonymsDict[clean].includes(conditionId)) {
    synonymsDict[clean].push(conditionId);
  }
};

// 2. Build Symptoms Index
const symptomsDict = {};
const addSymptomMapping = (symptomStr, conditionId, urgency) => {
  if (!symptomStr || typeof symptomStr !== "string") return;
  const clean = symptomStr.toLowerCase().trim();
  if (!symptomsDict[clean]) {
    symptomsDict[clean] = {
      symptom: symptomStr,
      conditions: [],
      max_urgency: urgency
    };
  }
  if (!symptomsDict[clean].conditions.includes(conditionId)) {
    symptomsDict[clean].conditions.push(conditionId);
  }
  if (urgency === "emergency") {
    symptomsDict[clean].max_urgency = "emergency";
  }
};

// 3. Build Red Flags Registry
const redFlagsList = [];

conditions.forEach((c) => {
  // Index names
  addSynonym(c.canonical_name, c.id);
  addSynonym(c.names.english, c.id);
  addSynonym(c.names.hindi, c.id);
  addSynonym(c.names.marathi, c.id);

  // Index all synonym buckets
  Object.values(c.synonyms).forEach((synList) => {
    if (Array.isArray(synList)) {
      synList.forEach((s) => addSynonym(s, c.id));
    }
  });

  // Index symptoms specifically into symptomsDict
  c.common_symptoms.forEach((s) => {
    addSymptomMapping(s, c.id, c.urgency);
  });

  // Extract red flags into redFlagsList
  if (c.red_flags && c.red_flags.length > 0) {
    c.red_flags.forEach((rf) => {
      redFlagsList.push({
        condition_id: c.id,
        condition_name: c.canonical_name,
        red_flag: rf,
        urgency: c.urgency === "emergency" ? "emergency" : "urgent",
        action: c.urgency === "emergency" ? "Call 108 Immediately" : "Urgent Doctor Visit"
      });
    });
  }
});

// Write JSON files to disk
fs.writeFileSync(path.join(DATA_DIR, "conditions.json"), JSON.stringify(conditions, null, 2), "utf-8");
console.log(`[COMPILER] conditions.json written (${conditions.length} conditions)`);

fs.writeFileSync(path.join(DATA_DIR, "synonyms.json"), JSON.stringify(synonymsDict, null, 2), "utf-8");
console.log(`[COMPILER] synonyms.json written (${Object.keys(synonymsDict).length} search terms)`);

fs.writeFileSync(path.join(DATA_DIR, "symptoms.json"), JSON.stringify(symptomsDict, null, 2), "utf-8");
console.log(`[COMPILER] symptoms.json written (${Object.keys(symptomsDict).length} indexed symptoms)`);

fs.writeFileSync(path.join(DATA_DIR, "red_flags.json"), JSON.stringify(redFlagsList, null, 2), "utf-8");
console.log(`[COMPILER] red_flags.json written (${redFlagsList.length} red flag rules)`);

console.log("\n[SUCCESS] JeevanSetu Comprehensive Multilingual Health Knowledge Engine dataset generated successfully!");
