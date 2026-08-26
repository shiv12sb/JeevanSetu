const { MockSMSProvider, ProductionSMSAdapter } = require("./sms.provider");
const { MockEmailProvider, ProductionEmailAdapter } = require("./email.provider");
const { MockTelephonyProvider, ProductionTelephonyAdapter } = require("./telephony.provider");
const { MockWeatherProvider, ProductionWeatherAdapter } = require("./weather.provider");
const { MockPharmacyProvider, ProductionPharmacyAdapter } = require("./pharmacy.provider");
const N8NOrchestrationAdapter = require("./n8n.provider");

// Active provider instances based on environment
const smsProvider = process.env.MOCK_PROVIDERS === "false" && process.env.SMS_PROVIDER_API_KEY
  ? new ProductionSMSAdapter()
  : new MockSMSProvider();

const emailProvider = process.env.MOCK_PROVIDERS === "false" && process.env.EMAIL_API_KEY
  ? new ProductionEmailAdapter()
  : new MockEmailProvider();

const telephonyProvider = process.env.MOCK_PROVIDERS === "false" && process.env.IVR_PROVIDER_AUTH_TOKEN
  ? new ProductionTelephonyAdapter()
  : new MockTelephonyProvider();

const weatherProvider = process.env.MOCK_PROVIDERS === "false" && process.env.WEATHER_API_KEY
  ? new ProductionWeatherAdapter()
  : new MockWeatherProvider();

const pharmacyProvider = process.env.MOCK_PROVIDERS === "false" && process.env.PHARMACY_INTEGRATION_KEY
  ? new ProductionPharmacyAdapter()
  : new MockPharmacyProvider();

const n8nAdapter = new N8NOrchestrationAdapter();

/**
 * Get comprehensive health and configuration status of all external providers
 * Guaranteed to never expose secrets, keys, or passwords.
 */
const getAllProvidersHealth = () => {
  return {
    n8n: n8nAdapter.getHealthStatus(),
    sms: smsProvider.getHealthStatus(),
    email: emailProvider.getHealthStatus(),
    telephony: telephonyProvider.getHealthStatus(),
    weather: weatherProvider.getHealthStatus(),
    pharmacy: pharmacyProvider.getHealthStatus(),
    isMockEnvironment: process.env.MOCK_PROVIDERS !== "false",
    timestamp: new Date().toISOString(),
  };
};

module.exports = {
  smsProvider,
  emailProvider,
  telephonyProvider,
  weatherProvider,
  pharmacyProvider,
  n8nAdapter,
  getAllProvidersHealth,
};
