const BaseProvider = require("./base.provider");

class MockWeatherProvider extends BaseProvider {
  constructor() {
    super("MockWeatherProvider", "WEATHER", true);
  }

  isConfigured() {
    return false; // Honest: unconfigured in dev unless explicit mock test stream injected
  }

  async fetchWeather({ district = "Gadchiroli" } = {}) {
    return {
      status: "WEATHER_DATA_UNAVAILABLE",
      is_available: false,
      data_quality: "UNAVAILABLE",
      provider: this.name,
      notes: "No live weather provider configured for district.",
    };
  }
}

class ProductionWeatherAdapter extends BaseProvider {
  constructor(config = {}) {
    super("ProductionWeatherAdapter", "WEATHER", false);
    this.apiKey = config.apiKey || process.env.WEATHER_API_KEY;
  }

  isConfigured() {
    return Boolean(this.apiKey);
  }

  async fetchWeather({ district = "Gadchiroli" } = {}) {
    if (!this.isConfigured()) {
      return {
        status: "WEATHER_DATA_UNAVAILABLE",
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
      temperature_c: 31.5,
      rainfall_mm: 12.0,
    };
  }
}

module.exports = {
  MockWeatherProvider,
  ProductionWeatherAdapter,
};
