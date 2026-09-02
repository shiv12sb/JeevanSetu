const casesService = require("../cases.service");
const referralsService = require("../referrals.service");
const inventoryService = require("../inventory.service");
const resourcesService = require("../resources.service");
const medicineForecastService = require("../forecasting/medicineForecast.service");
const earlyWarningService = require("../earlyWarning/earlyWarning.service");
const referralFollowUpService = require("../referrals/referralFollowUp.service");
const medicalKnowledgeService = require("./medicalKnowledge.service");

/**
 * Redact sensitive PII and internal technical IDs from context before LLM injection
 */
const minimizeContextData = (obj) => {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(minimizeContextData);

  const clean = {};
  const REDACTED_FIELDS = [
    "abha_id",
    "ration_card_number",
    "emergency_contact",
    "token",
    "jwt",
    "password",
    "user_id",
    "actor_id",
  ];

  for (const [key, val] of Object.entries(obj)) {
    if (REDACTED_FIELDS.includes(key.toLowerCase())) {
      clean[key] = "[REDACTED]";
    } else if (key === "phone" || key === "contact_phone") {
      clean[key] = typeof val === "string" && val.length > 5 ? `${val.substring(0, 4)}XXXX` : "[PROTECTED]";
    } else if (val && typeof val === "object") {
      clean[key] = minimizeContextData(val);
    } else {
      clean[key] = val;
    }
  }

  return clean;
};

/**
 * Retrieve minimal permissioned context for user query
 * @param {Object} user - Authenticated user from JWT
 * @param {string} query - User message query
 * @returns {Promise<{contextText: string, groundedCards: Array<Object>, sources: Array<string>}>}
 */
const retrieveContextForUser = async (user, query = "", language = "mr") => {
  const safeUser = user || { profileId: null, role: "patient" };
  const lang = ["en", "hi", "mr"].includes(language) ? language : "mr";
  const q = query.toLowerCase();
  const contextSections = [];
  const groundedCards = [];
  const sources = [];

  try {
    // 0. Verified Clinical Knowledge & Symptoms Retrieval (~530+ Curated Conditions)
    const medSearch = medicalKnowledgeService.searchCondition(query, lang);
    if (medSearch.match && medSearch.confidence >= 0.45) {
      const cond = medSearch.match;
      const guidance = medicalKnowledgeService.generateGuidance(cond.id, lang);
      const isCancer = medicalKnowledgeService.isCancer(cond);

      contextSections.push(`Verified Clinical Protocol Grounding:
- Canonical Name: ${cond.canonical_name} (${cond.names[lang] || cond.names.marathi})
- Category: ${cond.category}
- Clinical Overview: ${cond.general_information.join(" ")}
- Common Symptoms: ${cond.common_symptoms.join(", ")}
- Safe Supportive Measures: ${cond.safe_supportive_care.length > 0 ? cond.safe_supportive_care.join("; ") : "None (clinical consultation required)"}
- Things to Avoid: ${cond.things_to_avoid.join("; ")}
- Red Flags (Warning Signs): ${cond.red_flags.join("; ")}
- Urgency Level: ${cond.urgency}
- Appropriate Specialty: ${cond.appropriate_specialty.join(", ")}
- Recommended Facility: ${cond.facility_type.join(", ")}
${isCancer ? "- CANCER SAFETY DIRECTIVE: Strictly forbid home cure claims. Recommend formal clinical biopsy/evaluation and MJPJAY cashless hospital coverage." : ""}`);

      sources.push(...(cond.sources || ["Ministry of Health & Family Welfare (MoHFW) / ICMR Protocols"]));

      groundedCards.push({
        type: isCancer ? "cancer" : cond.urgency === "emergency" ? "emergency" : "condition",
        title: cond.names[lang] || cond.canonical_name,
        detail: `Category: ${cond.category.replace(/_/g, " ").toUpperCase()} • Recommended Specialty: ${cond.appropriate_specialty[0] || "General Physician"} • Facility: ${cond.facility_type[0] || "PHC"}`,
        actionLabel: isCancer ? "View Cancer Care Center" : cond.urgency === "emergency" ? "Call 108 Immediately" : "View Clinical Guidance",
      });
    } else {
      // Check if multiple symptoms were provided
      const symMatches = medicalKnowledgeService.searchBySymptoms(query, lang);
      if (symMatches.length > 0) {
        contextSections.push(`Differential Symptom Considerations (Non-Diagnostic Evaluation Only):
${symMatches.map((m) => `- Possible Consideration: ${m.condition.names[lang] || m.condition.canonical_name} (Matched Indicators: ${m.matchedSymptoms.join(", ")}, Specialty: ${m.condition.appropriate_specialty[0]})`).join("\n")}
*Mandatory Rule: Present symptoms as considerations requiring clinical evaluation, never as definitive diagnoses.*`);
        sources.push("National Health Portal (NHP) Clinical Symptoms Index");
      }
    }

    // 1. Patient / Case & Referral Follow-Up Milestone Context (Scoped to Authenticated User)
    if (q.includes("referral") || q.includes("follow up") || q.includes("follow-up") || q.includes("milestone") || q.includes("status") || q.includes("my case") || q.includes("appointment") || q.includes("stage") || q.includes("overdue") || q.includes("attention")) {
      if (safeUser.profileId && (safeUser.role === "patient" || safeUser.role === "doctor" || safeUser.role === "phc_staff" || safeUser.role === "hospital_staff" || safeUser.role === "district_admin")) {
        const [refs, followUps] = await Promise.all([
          referralsService.getReferrals(safeUser, { limit: 3 }).catch(() => ({ items: [] })),
          referralFollowUpService.getFollowUpQueue(safeUser, { limit: 3 }).catch(() => ({ items: [] })),
        ]);

        if (refs.items && refs.items.length > 0) {
          const cleanRefs = minimizeContextData(refs.items);
          contextSections.push(`Active Referrals for User:
${cleanRefs.map((r) => `- Referral Number: ${r.referral_number}, Stage: ${r.status}, Specialty: ${r.required_specialty}, Priority: ${r.priority}, Destination: ${r.hospitals?.name || "District Hospital"}`).join("\n")}`);
          sources.push("JeevanSetu Verified Referral Registry");

          const firstRef = refs.items[0];
          groundedCards.push({
            type: "referral",
            title: `Referral ${firstRef.referral_number}`,
            detail: `Current Stage: ${firstRef.status.replace(/_/g, " ").toUpperCase()} • Department: ${firstRef.required_specialty} • Priority: ${firstRef.priority.toUpperCase()}`,
            actionLabel: "View Referral Timeline",
          });
        }

        if (followUps.items && followUps.items.length > 0) {
          contextSections.push(`Referral Care-Continuity Follow-Up Intelligence:
${followUps.items.map((f) => `- Referral: ${f.referral_number || f.referral_id}, Current Stage: ${f.current_stage}, Expected Next Milestone: ${f.expected_milestone_label || f.expected_stage}, Follow-Up Status: ${f.follow_up_status}, Priority: ${f.priority}, Due: ${f.due_at ? f.due_at.split("T")[0] : "N/A"}`).join("\n")}`);
          sources.push("JeevanSetu Care-Continuity Intelligence");
        }
      }
    }

    // 2. Medicine Inventory & Depletion Forecast Context
    if (q.includes("medicine") || q.includes("stock") || q.includes("paracetamol") || q.includes("atorvastatin") || q.includes("amlodipine") || q.includes("drug") || q.includes("deplet") || q.includes("run out")) {
      const inv = await inventoryService.getInventory(safeUser, { limit: 5 }).catch(() => ({ items: [] }));
      if (inv.items && inv.items.length > 0) {
        const cleanInv = minimizeContextData(inv.items);
        contextSections.push(`PHC Medicine Inventory Availability:
${cleanInv.map((i) => `- Medicine: ${i.medicines?.name || "Essential Drug"}, Current Quantity: ${i.current_quantity} ${i.medicines?.standard_unit || "tablets"}, Threshold: ${i.minimum_threshold}, Facility: ${i.phcs?.name || "Ashti PHC"}`).join("\n")}`);
        sources.push("PHC Live Stock Surveillance");

        // If user is health worker/admin or asking about depletion, attach verified statistical forecast
        if (safeUser.role !== "patient" || q.includes("deplet") || q.includes("run out") || q.includes("forecast") || q.includes("days remaining")) {
          try {
            const forecasts = await medicineForecastService.getForecasts(safeUser, { phc_id: safeUser.assignedPhcId || "phc-1" });
            if (forecasts.items && forecasts.items.length > 0) {
              contextSections.push(`Verified Medicine Depletion Forecasts (Statistical Engine):
${forecasts.items.map((f) => `- ${f.medicine_name}: Stock ${f.current_quantity} ${f.standard_unit}, Daily Consumption: ${f.estimated_daily_consumption}/day, Est. Days Remaining: ${f.estimated_days_remaining !== null ? `~${f.estimated_days_remaining} days` : "Insufficient historical data"}, Trend: ${f.consumption_trend}, Risk Level: ${f.risk_level}`).join("\n")}`);
              sources.push("JeevanSetu Depletion Forecasting Engine");
            }
          } catch (e) {
            console.warn("Forecast context retrieval note:", e.message);
          }
        }

        const firstMed = inv.items[0];
        groundedCards.push({
          type: "medicine",
          title: firstMed.medicines?.name || "Essential Medicine",
          detail: `Stock Count: ${firstMed.current_quantity} ${firstMed.medicines?.standard_unit || "tablets"} • Facility: ${firstMed.phcs?.name || "Ashti PHC"}`,
          actionLabel: "View Full Inventory",
        });
      }
    }

    // 3. Early-Warning Surveillance Anomaly Context (Health Workers & Admins)
    if (q.includes("outbreak") || q.includes("anomaly") || q.includes("surge") || q.includes("fever spike") || q.includes("warning") || q.includes("epidemic")) {
      try {
        const ewSignals = await earlyWarningService.getSignals(safeUser, { district: "Gadchiroli" });
        if (ewSignals.items && ewSignals.items.length > 0) {
          contextSections.push(`Verified Early-Warning Surveillance Signals (Operational Anomaly Detection Only — NOT Outbreak Confirmation):
${ewSignals.items.map((s) => `- Location: ${s.phc_name || s.district}, Signal Level: ${s.signal_level}, Status: ${s.status}, Deviation: +${s.deviation_percentage}%, Note: ${s.notes}`).join("\n")}`);
          sources.push("JeevanSetu Health Early-Warning Surveillance");
        } else {
          contextSections.push("Verified Early-Warning Surveillance: All health case volumes and medicine usage signals are within nominal statistical thresholds.");
          sources.push("JeevanSetu Health Early-Warning Surveillance");
        }
      } catch (e) {
        console.warn("Early warning context retrieval note:", e.message);
      }
    }

    // 4. Verified Hospitals & Specialty Facilities
    if (q.includes("hospital") || q.includes("bed") || q.includes("icu") || q.includes("nearest") || q.includes("doctor") || q.includes("gadchiroli") || q.includes("chandrapur")) {
      const hospitals = await resourcesService.getHospitals({ limit: 3 });
      if (hospitals && hospitals.length > 0) {
        const cleanHosps = minimizeContextData(hospitals);
        contextSections.push(`Verified District Hospitals:
${cleanHosps.map((h) => `- Name: ${h.name}, Type: ${h.hospital_type}, District: ${h.district}, Total Beds: ${h.total_beds}, ICU Beds: ${h.icu_beds}, Schemes: ${Array.isArray(h.empanelled_schemes) ? h.empanelled_schemes.join(", ") : "PM-JAY"}`).join("\n")}`);
        sources.push("State Verified Hospital Registry");

        const hosp = hospitals[0];
        groundedCards.push({
          type: "hospital",
          title: hosp.name,
          detail: `${hosp.hospital_type} • ICU Beds: ${hosp.icu_beds} • Empanelled: ${(hosp.empanelled_schemes || []).join(", ") || "Ayushman Bharat PM-JAY"}`,
          actionLabel: "View Hospital Details",
        });
      }
    }

    // 5. Government Healthcare Schemes (PM-JAY, MJPJAY)
    if (q.includes("scheme") || q.includes("pmjay") || q.includes("ayushman") || q.includes("mjpjay") || q.includes("free") || q.includes("cost") || q.includes("card") || q.includes("ration")) {
      const schemes = await resourcesService.getGovernmentSchemes();
      if (schemes && schemes.length > 0) {
        contextSections.push(`Verified Government Assistance Schemes:
${schemes.map((s) => `- Code: ${s.scheme_code}, Name: ${s.name}, Summary: ${s.benefits_summary}, Eligibility: ${Array.isArray(s.eligibility_criteria) ? s.eligibility_criteria.join("; ") : "Valid Aadhaar / Ration Card"}`).join("\n")}`);
        sources.push("National Health Authority Scheme Database");

        const scheme = schemes[0];
        groundedCards.push({
          type: "scheme",
          title: scheme.name,
          detail: scheme.benefits_summary || "Provides cashless coverage up to ₹5,00,000 for secondary and tertiary inpatient care.",
          actionLabel: "Check Scheme Eligibility",
        });
      }
    }

    // 6. Verified NGO Transport Partners
    if (q.includes("transport") || q.includes("ambulance") || q.includes("ngo") || q.includes("travel") || q.includes("grant") || q.includes("aid")) {
      const ngos = await resourcesService.getNgos({ limit: 2 });
      if (ngos && ngos.length > 0) {
        const cleanNgos = minimizeContextData(ngos);
        contextSections.push(`Verified NGO Patient Assistance Partners:
${cleanNgos.map((n) => `- Name: ${n.name}, Aid Focus: ${Array.isArray(n.aid_focus) ? n.aid_focus.join(", ") : "Patient Transit"}, District: ${n.district}`).join("\n")}`);
        sources.push("Verified NGO Darpan Partners");

        const ngo = ngos[0];
        groundedCards.push({
          type: "transit",
          title: ngo.name,
          detail: `Focus: ${(ngo.aid_focus || []).join(", ")} • District: ${ngo.district} • Subsidized rural transit aid.`,
          actionLabel: "Contact NGO Coordinator",
        });
      }
    }
  } catch (err) {
    console.warn("Context retrieval warning:", err.message);
  }

  const contextText = contextSections.join("\n\n");

  return {
    contextText,
    groundedCards,
    sources,
  };
};

module.exports = {
  minimizeContextData,
  retrieveContextForUser,
};
