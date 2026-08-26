const path = require("path");
const dotenv = require("dotenv");

// Load .env from backend root if present
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const NODE_ENV = process.env.NODE_ENV || "development";
const isProduction = NODE_ENV === "production";
const isStaging = NODE_ENV === "staging";
const isDevelopment = NODE_ENV === "development" || (!isProduction && !isStaging);

// Core Required vs Optional Configuration
const env = {
  // 1. Process & Versioning
  PORT: parseInt(process.env.PORT || "5000", 10),
  NODE_ENV,
  APP_ENV: process.env.APP_ENV || NODE_ENV,
  APP_VERSION: process.env.APP_VERSION || "1.0.0",
  GIT_COMMIT_SHA: process.env.GIT_COMMIT_SHA || "local-dev",
  isProduction,
  isStaging,
  isDevelopment,
  LOG_LEVEL: process.env.LOG_LEVEL || (isProduction ? "INFO" : "DEBUG"),

  // 2. Client & CORS
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",

  // 3. Database & Auth (Supabase)
  SUPABASE_URL: process.env.SUPABASE_URL || "",
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || "",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  SUPABASE_DB_PASSWORD: process.env.SUPABASE_DB_PASSWORD || "",

  // 4. AI Grounding Services
  AI_PROVIDER: process.env.AI_PROVIDER || (isProduction ? "GEMINI" : "MOCK"),
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",

  // 5. Communication & Telephony Gateways
  MOCK_PROVIDERS: process.env.MOCK_PROVIDERS === "true" || isDevelopment,
  SMS_PROVIDER: process.env.SMS_PROVIDER || "MOCK",
  FAST2SMS_API_KEY: process.env.FAST2SMS_API_KEY || "",
  EMAIL_PROVIDER: process.env.EMAIL_PROVIDER || "MOCK",
  SMTP_HOST: process.env.SMTP_HOST || "",
  TELEPHONY_PROVIDER: process.env.TELEPHONY_PROVIDER || "MOCK",
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || "",
  WEATHER_PROVIDER: process.env.WEATHER_PROVIDER || "MOCK",
  OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY || "",

  // 6. n8n Automation Orchestration
  N8N_ENABLED: process.env.N8N_ENABLED === "true",
  N8N_BASE_URL: process.env.N8N_BASE_URL || "http://localhost:5678",
  N8N_WEBHOOK_URL: process.env.N8N_WEBHOOK_URL || "",
  N8N_WEBHOOK_SECRET: process.env.N8N_WEBHOOK_SECRET || "jeevansetu-n8n-secret-default",

  // 7. Background Jobs & Limits
  ENABLE_BACKGROUND_JOBS: process.env.ENABLE_BACKGROUND_JOBS !== "false",
  BACKGROUND_JOB_INTERVAL_MS: parseInt(process.env.BACKGROUND_JOB_INTERVAL_MS || "300000", 10),
  STUCK_JOB_THRESHOLD_MS: parseInt(process.env.STUCK_JOB_THRESHOLD_MS || "300000", 10),

  /**
   * Validate environment variables at server startup.
   * Throws a safe descriptive error if required production dependencies are absent.
   */
  validateEnvironment() {
    const errors = [];
    const isProd = this.isProduction || this.NODE_ENV === "production";
    const isStg = this.isStaging || this.NODE_ENV === "staging";

    // In production or staging, strictly require core infrastructure secrets
    if (isProd || isStg) {
      if (!this.SUPABASE_URL) {
        errors.push("Missing required variable: SUPABASE_URL");
      }
      if (!this.SUPABASE_SERVICE_ROLE_KEY) {
        errors.push("Missing required variable: SUPABASE_SERVICE_ROLE_KEY");
      }
      if (!this.FRONTEND_URL) {
        errors.push("Missing required variable: FRONTEND_URL");
      }
    }

    if (errors.length > 0) {
      const err = new Error(
        `Production Environment Validation Failed:\n- ${errors.join("\n- ")}\nApplication cannot safely start in ${this.NODE_ENV} mode without required infrastructure configuration.`
      );
      err.validationErrors = errors;
      throw err;
    }

    return {
      isValid: true,
      mode: isProd ? "PRODUCTION" : isStg ? "STAGING" : "DEVELOPMENT",
      degradedProviders: this.getDegradedProvidersList(),
    };
  },

  /**
   * Returns a list of optional providers that are currently unconfigured or running in mock mode
   */
  getDegradedProvidersList() {
    const degraded = [];
    if (!this.GEMINI_API_KEY && !this.OPENAI_API_KEY && this.AI_PROVIDER !== "MOCK") {
      degraded.push("AI_INFERENCE (Deterministic Advisory Fallback)");
    }
    if (!this.FAST2SMS_API_KEY && this.SMS_PROVIDER !== "MOCK") {
      degraded.push("SMS_GATEWAY (Mock Mode)");
    }
    if (!this.OPENWEATHER_API_KEY && this.WEATHER_PROVIDER !== "MOCK") {
      degraded.push("WEATHER_FEED (WEATHER_DATA_UNAVAILABLE)");
    }
    if (!this.N8N_ENABLED) {
      degraded.push("N8N_ORCHESTRATION (Internal Processing Active)");
    }
    return degraded;
  },

  /**
   * Generates a safe, non-sensitive snapshot of operational configuration for health probes
   */
  getSanitizedConfigSummary() {
    return {
      app_version: this.APP_VERSION,
      git_commit_sha: this.GIT_COMMIT_SHA,
      environment: this.NODE_ENV,
      port: this.PORT,
      is_production: this.isProduction,
      is_staging: this.isStaging,
      mock_providers: this.MOCK_PROVIDERS,
      n8n_orchestration_enabled: this.N8N_ENABLED,
      background_jobs_enabled: this.ENABLE_BACKGROUND_JOBS,
      has_supabase_url: Boolean(this.SUPABASE_URL),
      has_service_role_key: Boolean(this.SUPABASE_SERVICE_ROLE_KEY),
      degraded_features: this.getDegradedProvidersList(),
    };
  },
};

module.exports = env;
