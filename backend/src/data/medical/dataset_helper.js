/**
 * ==============================================================================
 * JEEVANSETU COMPREHENSIVE MEDICAL DATASET GENERATOR (~550+ Conditions)
 * ==============================================================================
 * Sourced from MoHFW, National Health Mission, WHO, ICMR, and Maharashtra DHS.
 */

const fs = require("fs");
const path = require("path");

const DATA_DIR = __dirname;
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 17 Structured Clinical Categories
const CATEGORIES = [
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

// Helper to create rich condition record
function createCondition({
  id,
  canonical_name,
  category,
  names,
  synonyms = {},
  common_symptoms = [],
  general_information = [],
  safe_supportive_care = [],
  things_to_avoid = [],
  red_flags = [],
  urgency = "doctor_soon",
  when_to_visit_doctor = [],
  appropriate_specialty = ["General Physician"],
  facility_type = ["PHC", "Rural Hospital", "District Hospital"],
  pediatric_notes = [],
  pregnancy_notes = [],
  elderly_notes = [],
  emergency_action = "",
  sources = ["Ministry of Health & Family Welfare (MoHFW)", "National Health Mission (NHM)", "ICMR Guidelines"]
}) {
  return {
    id,
    canonical_name,
    category,
    names: {
      english: names.english || canonical_name,
      hindi: names.hindi || canonical_name,
      marathi: names.marathi || canonical_name
    },
    synonyms: {
      english: synonyms.english || [],
      hindi: synonyms.hindi || [],
      marathi: synonyms.marathi || [],
      roman_hindi: synonyms.roman_hindi || [],
      roman_marathi: synonyms.roman_marathi || [],
      common_indian_terms: synonyms.common_indian_terms || []
    },
    common_symptoms,
    general_information,
    safe_supportive_care: (category === "oncology_cancers" || urgency === "emergency") ? [] : safe_supportive_care,
    things_to_avoid,
    red_flags,
    urgency, // 'self_care' | 'doctor_soon' | 'urgent' | 'emergency'
    when_to_visit_doctor,
    appropriate_specialty,
    facility_type,
    pediatric_notes,
    pregnancy_notes,
    elderly_notes,
    emergency_action: emergency_action || (urgency === "emergency" ? "तातडीने १०८ वर कॉल करा किंवा जवळच्या शासकीय रुग्णालयात अतिदक्षता विभागात (ICU/Casualty) जा." : ""),
    medical_disclaimer: "ही सामान्य आरोग्यविषयक माहिती आहे; निश्चित निदानासाठी शासकीय प्राथमिक आरोग्य केंद्र (PHC) किंवा डॉक्टरांची तपासणी आवश्यक आहे.",
    sources
  };
}

module.exports = {
  createCondition,
  CATEGORIES,
  DATA_DIR
};
