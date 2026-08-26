const env = require("../config/env");

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const currentLevel = env.isProduction
  ? LOG_LEVELS[process.env.LOG_LEVEL || "INFO"] || LOG_LEVELS.INFO
  : LOG_LEVELS[process.env.LOG_LEVEL || "DEBUG"] || LOG_LEVELS.DEBUG;

// Redact secrets, passwords, tokens, full phone numbers, and ABHA IDs
const redactSensitiveData = (data) => {
  if (!data) return data;
  if (typeof data === "string") {
    return data
      .replace(/(password|token|secret|api_key|apikey)=([^\s&]+)/gi, "$1=[REDACTED]")
      .replace(/(\+?\d{2,4})?(\d{2})\d{4,6}(\d{2})/g, "$1 $2XXX XX$3");
  }
  if (typeof data === "object") {
    try {
      const cloned = JSON.parse(JSON.stringify(data));
      const redactKeys = ["password", "token", "secret", "api_key", "apikey", "authorization", "abha_id", "aadhaar"];
      
      const maskPhone = (ph) => {
        if (typeof ph !== "string") return "+91 98XXX XX04";
        const cleaned = ph.replace(/\s+/g, "");
        if (cleaned.length < 8) return "+91 98XXX XX04";
        const prefix = cleaned.startsWith("+91") ? "+91 " : "";
        const digits = cleaned.replace(/^\+91/, "");
        if (digits.length >= 4) {
          return `${prefix}${digits.slice(0, 2)}XXX XX${digits.slice(-2)}`;
        }
        return "+91 98XXX XX04";
      };

      const traverse = (obj) => {
        for (const k of Object.keys(obj)) {
          const lower = k.toLowerCase();
          if (redactKeys.some((rk) => lower.includes(rk))) {
            obj[k] = "[REDACTED]";
          } else if (lower.includes("phone") && typeof obj[k] === "string") {
            obj[k] = maskPhone(obj[k]);
          } else if (typeof obj[k] === "object" && obj[k] !== null) {
            traverse(obj[k]);
          }
        }
      };

      traverse(cloned);
      return cloned;
    } catch (e) {
      return "[OBJECT_REDACTED]";
    }
  }
  return data;
};

const formatStructuredLog = (level, message, metadata = {}) => {
  const sanitizedMeta = redactSensitiveData(metadata);
  const logObj = {
    timestamp: new Date().toISOString(),
    level,
    service: "jeevansetu-api",
    environment: env.NODE_ENV || "development",
    message,
    ...(typeof sanitizedMeta === "object" && sanitizedMeta !== null ? sanitizedMeta : { details: sanitizedMeta }),
  };
  return JSON.stringify(logObj);
};

const logger = {
  debug: (message, metadata = {}) => {
    if (currentLevel <= LOG_LEVELS.DEBUG) {
      console.log(formatStructuredLog("DEBUG", message, metadata));
    }
  },
  info: (message, metadata = {}) => {
    if (currentLevel <= LOG_LEVELS.INFO) {
      console.log(formatStructuredLog("INFO", message, metadata));
    }
  },
  warn: (message, metadata = {}) => {
    if (currentLevel <= LOG_LEVELS.WARN) {
      console.warn(formatStructuredLog("WARN", message, metadata));
    }
  },
  error: (message, metadata = {}) => {
    if (currentLevel <= LOG_LEVELS.ERROR) {
      console.error(formatStructuredLog("ERROR", message, metadata));
    }
  },
  redactSensitiveData,
};

module.exports = logger;
