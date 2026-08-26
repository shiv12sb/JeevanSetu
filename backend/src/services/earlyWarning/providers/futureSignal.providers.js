const BaseSignalProvider = require("./baseSignal.provider");

/**
 * Future Integration: Community / ASHA Worker Health Reports
 */
class CommunityAshaSignalProvider extends BaseSignalProvider {
  constructor() {
    super("Community / ASHA Reporting Provider", "community_asha", false);
  }

  async fetchAggregatedSignal(params) {
    // Currently inactive - returns empty array with source unconfigured indicator
    return [];
  }
}

/**
 * Future Integration: Retail Pharmacy Aggregated Consumption Stream
 */
class PharmacySignalProvider extends BaseSignalProvider {
  constructor() {
    super("Retail Pharmacy Surveillance Provider", "pharmacy_sales", false);
  }

  async fetchAggregatedSignal(params) {
    return [];
  }
}

/**
 * Future Integration: Environmental & Weather Station Feed
 */
class WeatherEnvironmentSignalProvider extends BaseSignalProvider {
  constructor() {
    super("Weather & Environmental Feed Provider", "weather_environmental", false);
  }

  async fetchAggregatedSignal(params) {
    return [];
  }
}

module.exports = {
  CommunityAshaSignalProvider,
  PharmacySignalProvider,
  WeatherEnvironmentSignalProvider,
};
