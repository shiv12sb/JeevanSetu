/**
 * ==============================================================================
 * JEEVANSETU PHASE 26 — IVR FEEDBACK STATE MACHINE
 * ==============================================================================
 * Manages deterministic IVR/missed-call DTMF progression:
 * language_select -> facility_select -> category_select -> rating_select -> voice_prompt -> completed
 */

const { getFeedbackContent } = require("./feedbackContent");

const MAX_FAILED_ATTEMPTS = 3;

const CATEGORY_DTMF_MAP = {
  "1": "PHC_SERVICE",
  "2": "DOCTOR_AVAILABILITY",
  "3": "STAFF_BEHAVIOUR",
  "4": "MEDICINE_AVAILABILITY",
  "5": "WAITING_TIME",
  "6": "CLEANLINESS_FACILITY",
  "7": "REFERRAL_EXPERIENCE",
  "8": "EMERGENCY_SERVICE_ACCESS",
  "9": "OTHER",
};

/**
 * Handle incoming DTMF input for missed-call feedback flow
 * @param {Object} session - Active feedback session
 * @param {string} dtmfDigit - Pressed key digit
 * @param {boolean} timeout - True if turn timed out
 * @returns {Object} State transition result
 */
const processFeedbackTransition = (session, dtmfDigit, timeout) => {
  const lang = session.language || "hi";
  const content = getFeedbackContent(lang);

  if (timeout) {
    const attempts = (session.failed_attempts || 0) + 1;
    if (attempts >= MAX_FAILED_ATTEMPTS) {
      return {
        failedAttempts: attempts,
        currentMenu: "exit",
        promptText: `${content.timeout} ${content.max_retries_exceeded}`,
        gather: null,
        hangup: true,
        outcome: "timeout_exceeded",
      };
    }
    return {
      failedAttempts: attempts,
      currentMenu: session.current_menu,
      promptText: `${content.timeout} ${content.language_prompt || content.welcome}`,
      gather: { numDigits: 1, timeout: 6 },
      hangup: false,
    };
  }

  const digit = (dtmfDigit || "").trim();

  // -------------------------------------------------------------------------
  // 1. Language Selection Menu
  // -------------------------------------------------------------------------
  if (session.current_menu === "language_select") {
    let chosenLang = "hi";
    if (digit === "1") chosenLang = "hi";
    else if (digit === "2") chosenLang = "mr";
    else if (digit === "3") chosenLang = "en";
    else {
      return handleInvalidAttempt(session, content, content.language_prompt, "language_select");
    }

    const updatedContent = getFeedbackContent(chosenLang);
    return {
      language: chosenLang,
      currentMenu: "facility_select",
      failedAttempts: 0,
      promptText: `${updatedContent.welcome} ${updatedContent.facility_menu}`,
      gather: { numDigits: 1, timeout: 6 },
      hangup: false,
    };
  }

  // -------------------------------------------------------------------------
  // 2. Facility / Target Selection
  // -------------------------------------------------------------------------
  if (session.current_menu === "facility_select") {
    if (digit === "5") {
      return {
        currentMenu: "exit",
        promptText: content.confirmation,
        gather: null,
        hangup: true,
        outcome: "exited_early",
      };
    }

    let facilityTargetType = "phc";
    let phcId = "phc-1";
    let hospitalId = null;

    if (digit === "1") {
      facilityTargetType = "phc";
      phcId = session.session_data?.phc_id || "phc-1";
    } else if (digit === "2") {
      facilityTargetType = "hospital";
      hospitalId = "hosp-1";
      phcId = null;
    } else if (digit === "3") {
      facilityTargetType = "referral";
      phcId = "phc-1";
    } else if (digit === "4") {
      facilityTargetType = "general";
      phcId = null;
      hospitalId = null;
    } else {
      return handleInvalidAttempt(session, content, content.facility_menu, "facility_select");
    }

    return {
      currentMenu: "category_select",
      failedAttempts: 0,
      sessionDataUpdate: {
        facility_target_type: facilityTargetType,
        phc_id: phcId,
        hospital_id: hospitalId,
      },
      promptText: content.category_prompt,
      gather: { numDigits: 1, timeout: 6 },
      hangup: false,
    };
  }

  // -------------------------------------------------------------------------
  // 3. Category Selection (1 - 9)
  // -------------------------------------------------------------------------
  if (session.current_menu === "category_select") {
    const category = CATEGORY_DTMF_MAP[digit];
    if (!category) {
      return handleInvalidAttempt(session, content, content.category_prompt, "category_select");
    }

    return {
      currentMenu: "rating_select",
      failedAttempts: 0,
      sessionDataUpdate: {
        category,
        service_tag: category.toLowerCase(),
      },
      promptText: content.rating_prompt,
      gather: { numDigits: 1, timeout: 6 },
      hangup: false,
    };
  }

  // -------------------------------------------------------------------------
  // 4. Rating Selection (0 - 5)
  // -------------------------------------------------------------------------
  if (session.current_menu === "rating_select") {
    let ratingNum = parseInt(digit, 10);
    if (isNaN(ratingNum) || ratingNum < 0 || ratingNum > 5) {
      return handleInvalidAttempt(session, content, content.rating_prompt, "rating_select");
    }

    const ratingVal = ratingNum === 0 ? null : ratingNum;

    return {
      currentMenu: "voice_prompt",
      failedAttempts: 0,
      sessionDataUpdate: {
        rating: ratingVal,
      },
      promptText: content.voice_prompt,
      gather: { numDigits: 1, timeout: 6 },
      hangup: false,
    };
  }

  // -------------------------------------------------------------------------
  // 5. Voice Recording Prompt Option
  // -------------------------------------------------------------------------
  if (session.current_menu === "voice_prompt") {
    if (digit === "1") {
      // User opted for optional voice recording
      return {
        currentMenu: "voice_recording",
        failedAttempts: 0,
        promptText: content.voice_recording_start,
        gather: { numDigits: 1, timeout: 8, finishOnKey: "#" },
        hangup: false,
      };
    }

    // Submit directly (digit 2 or anything else)
    return {
      currentMenu: "completed",
      action: "SUBMIT_ANONYMOUS_FEEDBACK",
      promptText: content.confirmation,
      gather: null,
      hangup: true,
      outcome: "submitted",
    };
  }

  // -------------------------------------------------------------------------
  // 6. Voice Recording Completion
  // -------------------------------------------------------------------------
  if (session.current_menu === "voice_recording") {
    return {
      currentMenu: "completed",
      action: "SUBMIT_ANONYMOUS_FEEDBACK",
      sessionDataUpdate: {
        has_voice_recording: true,
        voice_recording_duration_sec: 15,
      },
      promptText: content.confirmation,
      gather: null,
      hangup: true,
      outcome: "submitted_with_voice",
    };
  }

  // Fallback
  return {
    currentMenu: "completed",
    promptText: content.confirmation,
    gather: null,
    hangup: true,
    outcome: "completed",
  };
};

const handleInvalidAttempt = (session, content, menuPrompt, menuName) => {
  const attempts = (session.failed_attempts || 0) + 1;

  if (attempts >= MAX_FAILED_ATTEMPTS) {
    return {
      currentMenu: "exit",
      promptText: `${content.invalid_input} ${content.max_retries_exceeded}`,
      gather: null,
      hangup: true,
      outcome: "invalid_attempts_exceeded",
    };
  }

  return {
    failedAttempts: attempts,
    currentMenu: menuName,
    promptText: `${content.invalid_input} ${menuPrompt}`,
    gather: { numDigits: 1, timeout: 6 },
    hangup: false,
  };
};

module.exports = {
  processFeedbackTransition,
  CATEGORY_DTMF_MAP,
};
