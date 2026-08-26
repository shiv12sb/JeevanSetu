/**
 * IVR Flow State Machine & DTMF Navigation Engine
 * Manages deterministic menu transitions, retry counters, submenus, and exit triggers.
 * Strictly adheres to safety rules: No autonomous diagnosis or medical decision making.
 */

const { getIvrContent } = require("./ivrContent");

const MAX_FAILED_ATTEMPTS = 3;

/**
 * Handle incoming DTMF input and calculate next menu state
 * @param {Object} session - Active IVR session
 * @param {string} dtmfDigit - Keypress digit ('0'-'9', '*', '#')
 * @returns {Object} { nextMenu, promptText, gather, hangup, isCompleted, action, outcome }
 */
const processMenuTransition = (session, dtmfDigit) => {
  const lang = session.language || "hi";
  const content = getIvrContent(lang);
  const digit = (dtmfDigit || "").trim();

  // Global Key: Exit (0)
  if (digit === "0") {
    return {
      currentMenu: "exit",
      promptText: content.goodbye,
      gather: null,
      hangup: true,
      outcome: "completed",
    };
  }

  // Global Key: Return to Main Menu (#)
  if (digit === "#" && session.current_menu !== "language_select") {
    return {
      currentMenu: "main_menu",
      failedAttempts: 0,
      promptText: content.main_menu,
      gather: { numDigits: 1, timeout: 6 },
      hangup: false,
    };
  }

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

    const updatedContent = getIvrContent(chosenLang);
    return {
      language: chosenLang,
      currentMenu: "main_menu",
      failedAttempts: 0,
      promptText: `${updatedContent.welcome} ${updatedContent.main_menu}`,
      gather: { numDigits: 1, timeout: 6 },
      hangup: false,
    };
  }

  // -------------------------------------------------------------------------
  // 2. Main Menu
  // -------------------------------------------------------------------------
  if (session.current_menu === "main_menu") {
    // 9 or *: Repeat Main Menu
    if (digit === "9" || digit === "*") {
      return {
        currentMenu: "main_menu",
        promptText: content.main_menu,
        gather: { numDigits: 1, timeout: 6 },
        hangup: false,
      };
    }

    // 1: Health Guidance & Education
    if (digit === "1") {
      return {
        currentMenu: "health_education",
        failedAttempts: 0,
        promptText: content.health_education_menu || content.health_guidance_menu,
        gather: { numDigits: 1, timeout: 6 },
        hangup: false,
      };
    }

    // 2: Referral Status Lookup (PIN Auth Prompt)
    if (digit === "2") {
      return {
        currentMenu: "referral_lookup",
        failedAttempts: 0,
        promptText: content.referral_auth_prompt,
        gather: { numDigits: 4, timeout: 8 },
        hangup: false,
      };
    }

    // 3: Facility Lookup
    if (digit === "3") {
      return {
        currentMenu: "facility_lookup",
        failedAttempts: 0,
        promptText: `${content.facility_info} ${content.facility_lookup_menu || content.main_menu}`,
        gather: { numDigits: 1, timeout: 6 },
        hangup: false,
      };
    }

    // 4: Essential Medicine Availability
    if (digit === "4") {
      return {
        currentMenu: "medicine_info",
        failedAttempts: 0,
        promptText: `${content.medicine_info} ${content.medicine_info_menu || content.main_menu}`,
        gather: { numDigits: 1, timeout: 6 },
        hangup: false,
      };
    }

    // 5: Health Worker / ASHA Callback Request
    if (digit === "5") {
      return {
        currentMenu: "callback_request",
        failedAttempts: 0,
        promptText: content.callback_prompt,
        gather: { numDigits: 1, timeout: 6 },
        hangup: false,
      };
    }

    // 6: Government Healthcare Schemes
    if (digit === "6") {
      return {
        currentMenu: "schemes_info",
        failedAttempts: 0,
        promptText: content.schemes_menu,
        gather: { numDigits: 1, timeout: 6 },
        hangup: false,
      };
    }

    return handleInvalidAttempt(session, content, content.main_menu, "main_menu");
  }

  // -------------------------------------------------------------------------
  // 3. Submenu: Health Education / Guidance
  // -------------------------------------------------------------------------
  if (session.current_menu === "health_education" || session.current_menu === "health_guidance") {
    if (digit === "9" || digit === "#") {
      return {
        currentMenu: "main_menu",
        promptText: content.main_menu,
        gather: { numDigits: 1, timeout: 6 },
        hangup: false,
      };
    }

    if (digit === "*") {
      return {
        currentMenu: "health_education",
        promptText: content.health_education_menu || content.health_guidance_menu,
        gather: { numDigits: 1, timeout: 6 },
        hangup: false,
      };
    }

    if (content.health_tips && content.health_tips[digit]) {
      return {
        currentMenu: "health_education",
        failedAttempts: 0,
        promptText: `${content.health_tips[digit]} ${content.health_education_menu || content.health_guidance_menu}`,
        gather: { numDigits: 1, timeout: 6 },
        hangup: false,
      };
    }

    // 4: Emergency Symptoms (Triage Escalation)
    if (digit === "4") {
      return {
        currentMenu: "emergency_symptoms",
        failedAttempts: 0,
        promptText: content.emergency_symptoms_menu,
        gather: { numDigits: 1, timeout: 6 },
        hangup: false,
      };
    }

    return handleInvalidAttempt(
      session,
      content,
      content.health_education_menu || content.health_guidance_menu,
      "health_education"
    );
  }

  // -------------------------------------------------------------------------
  // 4. Submenu: Emergency Symptoms (Immediate 108 Dispatch Guidance)
  // -------------------------------------------------------------------------
  if (session.current_menu === "emergency_symptoms") {
    if (digit === "9" || digit === "#") {
      return {
        currentMenu: "main_menu",
        promptText: content.main_menu,
        gather: { numDigits: 1, timeout: 6 },
        hangup: false,
      };
    }

    if (digit === "*") {
      return {
        currentMenu: "emergency_symptoms",
        promptText: content.emergency_symptoms_menu,
        gather: { numDigits: 1, timeout: 6 },
        hangup: false,
      };
    }

    if (digit === "1" || digit === "2") {
      // Immediate Safe Deterministic Emergency Alert
      return {
        currentMenu: "emergency_exit",
        promptText: content.emergency_alert,
        gather: null,
        hangup: true,
        outcome: "emergency_routed",
      };
    }

    return handleInvalidAttempt(session, content, content.emergency_symptoms_menu, "emergency_symptoms");
  }

  // -------------------------------------------------------------------------
  // 5. Submenu: Facility Lookup
  // -------------------------------------------------------------------------
  if (session.current_menu === "facility_lookup" || session.current_menu === "facility_info") {
    if (digit === "9" || digit === "#") {
      return {
        currentMenu: "main_menu",
        promptText: content.main_menu,
        gather: { numDigits: 1, timeout: 6 },
        hangup: false,
      };
    }

    if (digit === "*") {
      return {
        currentMenu: "facility_lookup",
        promptText: content.facility_lookup_menu || content.facility_info,
        gather: { numDigits: 1, timeout: 6 },
        hangup: false,
      };
    }

    if (content.facility_details && content.facility_details[digit]) {
      return {
        currentMenu: "facility_lookup",
        failedAttempts: 0,
        promptText: `${content.facility_details[digit]} ${content.facility_lookup_menu || content.main_menu}`,
        gather: { numDigits: 1, timeout: 6 },
        hangup: false,
      };
    }

    return handleInvalidAttempt(session, content, content.facility_lookup_menu || content.facility_info, "facility_lookup");
  }

  // -------------------------------------------------------------------------
  // 6. Submenu: Essential Medicine Availability
  // -------------------------------------------------------------------------
  if (session.current_menu === "medicine_info") {
    if (digit === "9" || digit === "#") {
      return {
        currentMenu: "main_menu",
        promptText: content.main_menu,
        gather: { numDigits: 1, timeout: 6 },
        hangup: false,
      };
    }

    if (digit === "*") {
      return {
        currentMenu: "medicine_info",
        promptText: content.medicine_info_menu || content.medicine_info,
        gather: { numDigits: 1, timeout: 6 },
        hangup: false,
      };
    }

    if (content.medicine_details && content.medicine_details[digit]) {
      return {
        currentMenu: "medicine_info",
        failedAttempts: 0,
        promptText: `${content.medicine_details[digit]} ${content.medicine_disclaimer || ""} ${content.medicine_info_menu || content.main_menu}`,
        gather: { numDigits: 1, timeout: 6 },
        hangup: false,
      };
    }

    return handleInvalidAttempt(session, content, content.medicine_info_menu || content.medicine_info, "medicine_info");
  }

  // -------------------------------------------------------------------------
  // 7. Submenu: Callback Request Confirmation
  // -------------------------------------------------------------------------
  if (session.current_menu === "callback_request") {
    if (digit === "9" || digit === "#") {
      return {
        currentMenu: "main_menu",
        promptText: content.main_menu,
        gather: { numDigits: 1, timeout: 6 },
        hangup: false,
      };
    }

    if (digit === "*") {
      return {
        currentMenu: "callback_request",
        promptText: content.callback_prompt,
        gather: { numDigits: 1, timeout: 6 },
        hangup: false,
      };
    }

    if (digit === "1") {
      return {
        currentMenu: "main_menu",
        action: "LOG_CALLBACK_REQUEST",
        promptText: `${content.callback_success} ${content.main_menu}`,
        gather: { numDigits: 1, timeout: 6 },
        hangup: false,
        outcome: "followup_requested",
      };
    }

    return handleInvalidAttempt(session, content, content.callback_prompt, "callback_request");
  }

  // -------------------------------------------------------------------------
  // 8. Submenu: Government Healthcare Schemes
  // -------------------------------------------------------------------------
  if (session.current_menu === "schemes_info") {
    if (digit === "9" || digit === "#") {
      return {
        currentMenu: "main_menu",
        promptText: content.main_menu,
        gather: { numDigits: 1, timeout: 6 },
        hangup: false,
      };
    }

    if (digit === "*") {
      return {
        currentMenu: "schemes_info",
        promptText: content.schemes_menu,
        gather: { numDigits: 1, timeout: 6 },
        hangup: false,
      };
    }

    if (content.scheme_details && content.scheme_details[digit]) {
      return {
        currentMenu: "schemes_info",
        failedAttempts: 0,
        promptText: `${content.scheme_details[digit]} ${content.schemes_menu || content.main_menu}`,
        gather: { numDigits: 1, timeout: 6 },
        hangup: false,
      };
    }

    return handleInvalidAttempt(session, content, content.schemes_menu, "schemes_info");
  }

  // Fallback / Return to main menu
  return {
    currentMenu: "main_menu",
    promptText: content.main_menu,
    gather: { numDigits: 1, timeout: 6 },
    hangup: false,
  };
};

/**
 * Handle invalid input or retries safely without infinite loops
 */
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
  processMenuTransition,
};
