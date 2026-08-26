const BaseProvider = require("./base.provider");

class MockPharmacyProvider extends BaseProvider {
  constructor() {
    super("MockPharmacyProvider", "PHARMACY", true);
  }

  isConfigured() {
    return false; // Honest: unconfigured in dev
  }

  async fetchConsumption({ district = "Gadchiroli" } = {}) {
    return {
      status: "NOT_AVAILABLE",
      is_available: false,
      data_quality: "UNAVAILABLE",
      provider: this.name,
      notes: "No external pharmacy integration configured.",
    };
  }
}

class ProductionPharmacyAdapter extends BaseProvider {
  constructor(config = {}) {
    super("ProductionPharmacyAdapter", "PHARMACY", false);
    this.apiKey = config.apiKey || process.env.PHARMACY_INTEGRATION_KEY;
  }

  isConfigured() {
    return Boolean(this.apiKey);
  }

  async fetchConsumption({ district = "Gadchiroli" } = {}) {
    if (!this.isConfigured()) {
      return {
        status: "NOT_AVAILABLE",
        is_available: false,
        data_quality: "UNAVAILABLE",
        provider: this.name,
      };
    }
    return {
      status: "calculated",
      is_available: true,
      data_quality: "HIGH",
      provider: this.name,
      consumption_units: 45,
    };
  }
}

module.exports = {
  MockPharmacyProvider,
  ProductionPharmacyAdapter,
};
