/**
 * ==============================================================================
 * JEEVANSETU MEDICAL KNOWLEDGE & CLINICAL RETRIEVAL SERVICE
 * ==============================================================================
 * High-performance in-memory search, trilingual phonetic matching, symptom scoring,
 * red-flag preemption, and structured triage guidance over ~530+ medical conditions.
 *
 * Sourced from MoHFW, NHM, WHO, ICMR, and Maharashtra Public Health Department.
 */

const fs = require("fs");
const path = require("path");

class MedicalKnowledgeService {
  constructor() {
    this.dataDir = path.join(__dirname, "../../data/medical");
    this.conditions = [];
    this.conditionMap = new Map();
    this.synonymsMap = new Map();
    this.symptomsMap = new Map();
    this.redFlags = [];
    this.initialized = false;

    this.init();
  }

  /**
   * Load and index datasets into memory on startup
   */
  init() {
    try {
      const conditionsPath = path.join(this.dataDir, "conditions.json");
      const synonymsPath = path.join(this.dataDir, "synonyms.json");
      const symptomsPath = path.join(this.dataDir, "symptoms.json");
      const redFlagsPath = path.join(this.dataDir, "red_flags.json");

      if (fs.existsSync(conditionsPath)) {
        this.conditions = JSON.parse(fs.readFileSync(conditionsPath, "utf-8"));
        this.conditions.forEach((c) => {
          this.conditionMap.set(c.id, c);
        });
      }

      if (fs.existsSync(synonymsPath)) {
        const rawSyn = JSON.parse(fs.readFileSync(synonymsPath, "utf-8"));
        Object.entries(rawSyn).forEach(([term, ids]) => {
          this.synonymsMap.set(term.toLowerCase().trim(), ids);
        });
      }

      if (fs.existsSync(symptomsPath)) {
        const rawSym = JSON.parse(fs.readFileSync(symptomsPath, "utf-8"));
        Object.entries(rawSym).forEach(([sym, data]) => {
          this.symptomsMap.set(sym.toLowerCase().trim(), data);
        });
      }

      if (fs.existsSync(redFlagsPath)) {
        this.redFlags = JSON.parse(fs.readFileSync(redFlagsPath, "utf-8"));
      }

      this.initialized = true;
      console.log(`[MedicalKnowledgeService] Initialized with ${this.conditions.length} conditions, ${this.synonymsMap.size} synonyms, ${this.redFlags.length} red flags.`);
    } catch (err) {
      console.error("[MedicalKnowledgeService] Failed to load medical dataset:", err.message);
    }
  }

  /**
   * Normalize input string for search
   */
  _normalize(str) {
    if (!str || typeof str !== "string") return "";
    return str
      .toLowerCase()
      .trim()
      .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'’]/g, " ")
      .replace(/\s+/g, " ");
  }

  /**
   * Compute Levenshtein distance between two strings
   */
  _levenshtein(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1) // insertion / deletion
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }

  /**
   * Retrieve a condition by unique ID
   * @param {string} id
   * @returns {Object|null}
   */
  getConditionById(id) {
    if (!id) return null;
    return this.conditionMap.get(id) || null;
  }

  // Stopwords and generic terms to ignore during token scoring
  _isStopword(w) {
    const STOPWORDS = new Set([
      "what", "where", "when", "which", "how", "who", "why", "is", "are", "was", "were", "be",
      "available", "at", "my", "the", "a", "an", "and", "or", "in", "on", "to", "for", "with",
      "about", "from", "some", "such", "not", "only", "so", "than", "too", "very", "just",
      "government", "scheme", "schemes", "hospital", "hospitals", "doctor", "doctors", "phc",
      "health", "care", "disease", "diseases", "illness", "condition", "treatment", "medicine",
      "medicines", "problem", "problems", "issue", "aarogya", "swasthya", "bimar", "bimari", "aajar",
      "kay", "kasa", "kashi", "aahe", "ahes", "hote", "hota", "hoti", "kya", "kaise", "kaisa",
      "hai", "hain", "tha", "the", "thi", "karu", "karave", "kare", "karna", "chahiye", "badal", "mahiti",
      "jankari", "information", "help", "please", "batao", "sanga"
    ]);
    return STOPWORDS.has(w);
  }

  /**
   * Search condition by query text (exact match, token match, or typo tolerance)
   * @param {string} query
   * @param {string} [language='mr']
   * @returns {{ match: Object|null, confidence: number, candidates: Array<Object> }}
   */
  searchCondition(query, language = "mr") {
    if (!query || typeof query !== "string") {
      return { match: null, confidence: 0, candidates: [] };
    }

    const norm = this._normalize(query);
    if (!norm || norm.length < 2) {
      return { match: null, confidence: 0, candidates: [] };
    }

    const candidateScores = new Map();

    const addScore = (condId, score) => {
      const current = candidateScores.get(condId) || 0;
      candidateScores.set(condId, current + score);
    };

    // 1. Direct ID match
    if (this.conditionMap.has(norm.replace(/ /g, "_"))) {
      addScore(norm.replace(/ /g, "_"), 2.0);
    }

    // 2. Direct Synonym / Exact Phrase Match
    if (this.synonymsMap.has(norm)) {
      const ids = this.synonymsMap.get(norm);
      ids.forEach((id) => addScore(id, 2.0));
    }

    // 3. Substring & Multi-word Token Matching with Stopword Filtering
    const rawTokens = norm.split(" ").filter((t) => t.length >= 2);
    const tokens = rawTokens.filter((t) => !this._isStopword(t));

    if (tokens.length === 0 && !this.synonymsMap.has(norm)) {
      return { match: null, confidence: 0, candidates: [] };
    }

    for (const [term, ids] of this.synonymsMap.entries()) {
      if (term.length >= 3 && !this._isStopword(term)) {
        if (norm === term) {
          ids.forEach((id) => addScore(id, 2.5));
        } else if (norm.includes(term) && term.length >= 4) {
          // Exact subphrase match inside query (e.g. "viral fever" or "व्हायरल ताप" in query)
          ids.forEach((id) => addScore(id, 1.8));
        }

        // Distinctive token match
        for (const token of tokens) {
          if (token.length >= 3 && term === token) {
            // Full distinctive token match
            ids.forEach((id) => addScore(id, 1.2));
          }
        }
      }
    }

    // 4. Fuzzy / Typo Tolerance (Levenshtein) if needed
    if (tokens.length > 0) {
      for (const token of tokens) {
        if (token.length >= 4) {
          for (const [term, ids] of this.synonymsMap.entries()) {
            if (Math.abs(term.length - token.length) <= 2) {
              const dist = this._levenshtein(token, term);
              if (dist === 1) {
                ids.forEach((id) => addScore(id, 0.8));
              } else if (dist === 2 && token.length >= 6) {
                ids.forEach((id) => addScore(id, 0.5));
              }
            }
          }
        }
      }
    }

    // Sort scored candidates
    const sorted = Array.from(candidateScores.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([id, score]) => ({
        condition: this.getConditionById(id),
        score: Math.min(1.0, score / 1.5)
      }))
      .filter((item) => item.condition !== null);

    if (sorted.length === 0) {
      return { match: null, confidence: 0, candidates: [] };
    }

    return {
      match: sorted[0].condition,
      confidence: sorted[0].score,
      candidates: sorted.slice(0, 5).map((s) => s.condition)
    };
  }

  /**
   * Search conditions matching a list of symptoms
   * @param {Array<string>|string} symptoms
   * @param {string} [language='mr']
   * @returns {Array<{condition: Object, matchedSymptoms: Array<string>, score: number}>}
   */
  searchBySymptoms(symptoms, language = "mr") {
    let symList = [];
    if (Array.isArray(symptoms)) {
      symList = symptoms;
    } else if (typeof symptoms === "string") {
      symList = symptoms.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean);
      if (symList.length === 1) {
        symList = symList[0].split(" ").filter((s) => s.length >= 3);
      }
    }

    if (symList.length === 0) return [];

    const conditionMatches = new Map();

    symList.forEach((sym) => {
      const normSym = this._normalize(sym);
      if (!normSym || normSym.length < 2) return;

      for (const [indexSym, data] of this.symptomsMap.entries()) {
        if (indexSym.includes(normSym) || normSym.includes(indexSym)) {
          data.conditions.forEach((condId) => {
            if (!conditionMatches.has(condId)) {
              conditionMatches.set(condId, {
                condition: this.getConditionById(condId),
                matchedSymptoms: [],
                score: 0
              });
            }
            const record = conditionMatches.get(condId);
            if (!record.matchedSymptoms.includes(data.symptom)) {
              record.matchedSymptoms.push(data.symptom);
              record.score += 1;
            }
          });
        }
      }
    });

    return Array.from(conditionMatches.values())
      .filter((m) => m.condition !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }

  /**
   * Deterministic check for emergency red flags
   * @param {string} text - User query or symptoms description
   * @returns {{ isEmergency: boolean, redFlags: Array<Object>, matchedConditions: Array<string>, action: string }}
   */
  checkRedFlags(text) {
    if (!text || typeof text !== "string") {
      return { isEmergency: false, redFlags: [], matchedConditions: [], action: "" };
    }

    const norm = this._normalize(text);
    const matchedFlags = [];
    const matchedConds = new Set();

    // High-priority emergency trigger keywords and regex patterns across English, Hindi, and Marathi
    const CRITICAL_PATTERNS = [
      /\b(chest pain|heart attack|chhati me dard|chhatit kal|dil ka daura|angina)\b/i,
      /(छाती|chhati|seena|हृदय).{0,15}(दुख|वेदना|कळ|जळजळ|दाब|दर्द|pain|attack|अटॅक)/i,
      /\b(stroke|lakwa|paralysis|pakshaghat|facial drooping)\b/i,
      /(पक्षाघात|लकवा|तोंड वाकडे|हात लुळा)/i,
      /\b(unconscious|behosh|beshuddh|shwas band|cannot breathe|saans rukna|choking|stridor)\b/i,
      /(बेशुद्ध|बेहोश|श्वास बंद|दम घुटना|श्वास गुदमरणे)/i,
      /\b(snake|snakebite|sarp|sap|saap|saanp|nag).{0,15}(bite|chawla|chavla|kata|kaata|katna|dasna|चाव|चावले|चावला|डसले|काटा|काट)\b/i,
      /(साप|सापाने|सर्प|नाग|विंचू).{0,15}(चाव|चावले|चावला|डसले|दंश)/i,
      /\b(poison|poisoning|zehar|vishbadha|keetnashak|pesticide)\b/i,
      /(विष|कीटकनाशक|औषध).{0,15}(बाधा|पिणे|पोटात)/i,
      /\b(severe bleeding|khoon behna|raktasrav|arterial bleeding)\b/i,
      /(रक्तस्त्राव|रक्त वाहणे|खून बहना)/i,
      /\b(suicide|atmaghat|self harm|14416|tele manas)\b/i,
      /(आत्महत्या|टोकाचे पाऊल)/i
    ];

    for (const pat of CRITICAL_PATTERNS) {
      if (pat.test(norm) || pat.test(text)) {
        matchedFlags.push({
          keyword: pat.toString(),
          urgency: "emergency",
          action: "Call 108 Immediately"
        });
      }
    }

    // Check against indexed red_flags.json
    for (const rf of this.redFlags) {
      const normFlag = this._normalize(rf.red_flag);
      if (normFlag.length >= 4 && (norm.includes(normFlag) || text.includes(rf.red_flag))) {
        matchedFlags.push(rf);
        matchedConds.add(rf.condition_id);
      }
    }

    const isEmergency = matchedFlags.length > 0;

    return {
      isEmergency,
      redFlags: matchedFlags,
      matchedConditions: Array.from(matchedConds),
      action: isEmergency
        ? "तातडीने १०८ रुग्णवाहिकेला कॉल करा किंवा जवळच्या शासकीय रुग्णालयात अतिदक्षता विभागात (ICU/Casualty) जा."
        : ""
    };
  }

  /**
   * Check if a condition is cancer/oncology
   * @param {string|Object} conditionOrId
   * @returns {boolean}
   */
  isCancer(conditionOrId) {
    if (!conditionOrId) return false;
    const cond = typeof conditionOrId === "string" ? this.getConditionById(conditionOrId) : conditionOrId;
    if (!cond) return false;
    return cond.category === "oncology_cancers" || cond.id.includes("cancer") || cond.id.includes("carcinoma") || cond.id.includes("leukemia") || cond.id.includes("tumor");
  }

  /**
   * Helper to localize text lists into clean Marathi, Hindi, or English
   */
  _localizeList(list, lang) {
    if (!Array.isArray(list)) return [];
    if (lang === "mr") return list;

    if (lang === "en") {
      return list.map((item) => {
        if (!item || typeof item !== "string") return "";
        // If has English in parentheses, e.g. "तीव्र ताप (High fever)" -> "High fever"
        const enMatch = item.match(/\(([^)]*[a-zA-Z]{3,}[^)]*)\)/);
        if (enMatch && enMatch[1]) {
          return enMatch[1].trim();
        }
        // Common standard medical phrase translations
        let res = item
          .replace(/भरपूर पाणी.*प्या|ओआरएस.*घ्या/gi, "Maintain hydration with clean fluids/ORS")
          .replace(/विश्रांती घ्या/gi, "Take adequate physical rest")
          .replace(/हात स्वच्छ धुवा/gi, "Practice frequent hand hygiene")
          .replace(/धूम्रपान.*टाळा/gi, "Strictly avoid tobacco and smoking")
          .replace(/उपाशी राहणे टाळा/gi, "Avoid skipping meals")
          .replace(/डॉक्टरांचा सल्ला घ्या/gi, "Consult a qualified medical officer")
          .replace(/शासकीय.*PHC/gi, "Visit your nearest Government Primary Health Centre (PHC)");
        return res;
      });
    }

    // Hindi localization
    return list.map((item) => {
      if (!item || typeof item !== "string") return "";
      let res = item
        .replace(/घ्यावे|घ्या/g, "लें")
        .replace(/करावे|करा/g, "करें")
        .replace(/टाळावे|टाळा/g, "से बचें")
        .replace(/पाणी प्या/g, "पानी पिएं")
        .replace(/विश्रांती/g, "आराम")
        .replace(/होणे/g, "होना")
        .replace(/येणे/g, "आना")
        .replace(/दुखणे/g, "दर्द होना")
        .replace(/शासकीय प्राथमिक आरोग्य केंद्र/g, "सरकारी प्राथमिक स्वास्थ्य केंद्र (PHC)")
        .replace(/रुग्णालयात/g, "अस्पताल में")
        .replace(/तपासणी करून/g, "जांच करवा")
        .replace(/सल्ला घ्या/g, "परामर्श लें");
      return res;
    });
  }

  /**
   * Generate structured, trilingual, grounded clinical guidance
   * @param {string} conditionId
   * @param {string} [language='mr'] - 'mr' (default), 'hi', or 'en'
   * @returns {Object}
   */
  generateGuidance(conditionId, language = "mr") {
    const lang = ["en", "hi", "mr"].includes(language) ? language : "mr";
    const cond = this.getConditionById(conditionId);

    if (!cond) {
      return {
        success: false,
        message: lang === "mr"
          ? "माहिती उपलब्ध नाही. कृपया जवळच्या शासकीय प्राथमिक आरोग्य केंद्रात (PHC) संपर्क साधा."
          : lang === "hi"
          ? "जानकारी उपलब्ध नहीं है। कृपया नजदीकी प्राथमिक स्वास्थ्य केंद्र (PHC) से संपर्क करें।"
          : "Condition guidance not found. Please consult your nearest Primary Health Centre (PHC)."
      };
    }

    const isCancerCond = this.isCancer(cond);
    const isEmergCond = cond.urgency === "emergency";

    const title = cond.names[lang] || cond.names.marathi || cond.canonical_name;
    const generalInfo = cond.general_information.join(" ") || "";

    const symptoms = this._localizeList(cond.common_symptoms, lang);
    const supportiveCare = this._localizeList(cond.safe_supportive_care, lang);
    const thingsToAvoid = this._localizeList(cond.things_to_avoid, lang);
    const redFlags = this._localizeList(cond.red_flags, lang);
    const doctorVisits = this._localizeList(cond.when_to_visit_doctor, lang);

    let guidanceText = "";

    if (lang === "mr") {
      guidanceText += `📋 **आरोग्य माहिती: ${title}**\n\n`;
      guidanceText += `ℹ️ **माहिती:** ${generalInfo}\n\n`;

      if (symptoms.length > 0) {
        guidanceText += `🔍 **संभाव्य लक्षणे:**\n${symptoms.map((s) => `• ${s}`).join("\n")}\n\n`;
      }

      if (!isCancerCond && !isEmergCond && supportiveCare.length > 0) {
        guidanceText += `💧 **सुरक्षित घरगुती काळजी व प्राथमिक उपाय:**\n${supportiveCare.map((c) => `• ${c}`).join("\n")}\n\n`;
      }

      if (thingsToAvoid.length > 0) {
        guidanceText += `⚠️ **काय टाळावे:**\n${thingsToAvoid.map((t) => `• ${t}`).join("\n")}\n\n`;
      }

      if (redFlags.length > 0) {
        guidanceText += `🚨 **धोक्याची चिन्हे (Red Flags):**\n${redFlags.map((r) => `• ${r}`).join("\n")}\n\n`;
      }

      if (isCancerCond) {
        guidanceText += `🏥 **महत्त्वाचा वैद्यकीय सल्ला:** कर्करोगाच्या संशयित लक्षणांसाठी कोणतेही घरगुती उपाय करू नयेत. महात्मा ज्योतिराव फुले जन आरोग्य योजना (MJPJAY) व PM-JAY अंतर्गत शासकीय वैद्यकीय महाविद्यालय (GMC) आणि जिल्हा रुग्णालयांमध्ये मोफत तपासणी व संपूर्ण उपचार उपलब्ध आहेत.\n\n`;
      } else if (isEmergCond) {
        guidanceText += `🚑 **तातडीची आणीबाणी:** हा गंभीर वैद्यकीय प्रसंग आहे. वेळ न घालवता तात्काळ **१०८ रुग्णवाहिका** बोलवा किंवा जवळच्या शासकीय रुग्णालयात जा.\n\n`;
      } else if (doctorVisits.length > 0) {
        guidanceText += `👨‍⚕️ **डॉक्टरांना कधी भेटावे:**\n${doctorVisits.map((w) => `• ${w}`).join("\n")}\n\n`;
      }

      guidanceText += `🏥 **शिफारस केलेले तज्ज्ञ व केंद्र:** ${cond.appropriate_specialty.join(", ")} | ${cond.facility_type.join(", ")}\n`;
      guidanceText += `\n*नोंद: ही माहिती केवळ मार्गदर्शनासाठी आहे. निश्चित निदानासाठी शासकीय PHC किंवा डॉक्टरांचा सल्ला आवश्यक आहे.*`;
    } else if (lang === "hi") {
      guidanceText += `📋 **स्वास्थ्य जानकारी: ${title}**\n\n`;
      guidanceText += `ℹ️ **विवरण:** ${generalInfo}\n\n`;

      if (symptoms.length > 0) {
        guidanceText += `🔍 **सामान्य लक्षण:**\n${symptoms.map((s) => `• ${s}`).join("\n")}\n\n`;
      }

      if (!isCancerCond && !isEmergCond && supportiveCare.length > 0) {
        guidanceText += `💧 **सुरक्षित प्राथमिक देखभाल:**\n${supportiveCare.map((c) => `• ${c}`).join("\n")}\n\n`;
      }

      if (thingsToAvoid.length > 0) {
        guidanceText += `⚠️ **क्या न करें:**\n${thingsToAvoid.map((t) => `• ${t}`).join("\n")}\n\n`;
      }

      if (redFlags.length > 0) {
        guidanceText += `🚨 **खतरे के संकेत (Red Flags):**\n${redFlags.map((r) => `• ${r}`).join("\n")}\n\n`;
      }

      if (isCancerCond) {
        guidanceText += `🏥 **महत्वपूर्ण चिकित्सा सलाह:** कैंसर के किसी भी लक्षण के लिए घरेलू उपाय न करें। MJPJAY और PM-JAY योजना के तहत सरकारी मेडिकल कॉलेज (GMC) में मुफ्त जांच और संपूर्ण उपचार उपलब्ध है।\n\n`;
      } else if (isEmergCond) {
        guidanceText += `🚑 **आपातकालीन स्थिति:** तुरंत **108 एम्बुलेंस** को कॉल करें या निकटतम सरकारी अस्पताल के आपातकालीन विभाग में जाएं।\n\n`;
      } else if (doctorVisits.length > 0) {
        guidanceText += `👨‍⚕️ **डॉक्टर से कब मिलें:**\n${doctorVisits.map((w) => `• ${w}`).join("\n")}\n\n`;
      }

      guidanceText += `🏥 **अनुशंसित विशेषज्ञ व अस्पताल:** ${cond.appropriate_specialty.join(", ")} | ${cond.facility_type.join(", ")}\n`;
      guidanceText += `\n*नोट: यह केवल सामान्य स्वास्थ्य जानकारी है; सटीक निदान के लिए सरकारी PHC या डॉक्टर से जांच कराएं।*`;
    } else {
      guidanceText += `📋 **Health Information: ${title}**\n\n`;
      guidanceText += `ℹ️ **Overview:** ${generalInfo}\n\n`;

      if (symptoms.length > 0) {
        guidanceText += `🔍 **Common Symptoms:**\n${symptoms.map((s) => `• ${s}`).join("\n")}\n\n`;
      }

      if (!isCancerCond && !isEmergCond && supportiveCare.length > 0) {
        guidanceText += `💧 **Safe Supportive Care:**\n${supportiveCare.map((c) => `• ${c}`).join("\n")}\n\n`;
      }

      if (thingsToAvoid.length > 0) {
        guidanceText += `⚠️ **What to Avoid:**\n${thingsToAvoid.map((t) => `• ${t}`).join("\n")}\n\n`;
      }

      if (redFlags.length > 0) {
        guidanceText += `🚨 **Warning Signs (Red Flags):**\n${redFlags.map((r) => `• ${r}`).join("\n")}\n\n`;
      }

      if (isCancerCond) {
        guidanceText += `🏥 **Critical Medical Advice:** Never rely on home remedies for suspected cancer. Free screening, diagnosis (biopsy/imaging), and treatments are available under MJPJAY and PM-JAY at Government Medical Colleges (GMC) and District Hospitals.\n\n`;
      } else if (isEmergCond) {
        guidanceText += `🚑 **Medical Emergency:** Call **108 Ambulance** immediately or proceed to the nearest emergency trauma center / ICU.\n\n`;
      } else if (doctorVisits.length > 0) {
        guidanceText += `👨‍⚕️ **When to See a Doctor:**\n${doctorVisits.map((w) => `• ${w}`).join("\n")}\n\n`;
      }

      guidanceText += `🏥 **Recommended Care:** ${cond.appropriate_specialty.join(", ")} | ${cond.facility_type.join(", ")}\n`;
      guidanceText += `\n*Disclaimer: This is verified health education, not a definitive diagnosis. Please consult a qualified doctor or Primary Health Centre (PHC).*`;
    }

    return {
      success: true,
      condition: cond,
      guidanceText,
      language: lang,
      urgency: cond.urgency,
      sources: cond.sources
    };
  }

  /**
   * Get count of conditions loaded
   */
  getConditionCount() {
    return this.conditions.length;
  }

  /**
   * Get all conditions
   */
  getAllConditions() {
    return this.conditions;
  }
}

// Export singleton instance
module.exports = new MedicalKnowledgeService();
