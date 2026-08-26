const BaseSignalProvider = require("./baseSignal.provider");

class WeatherEnvironmentSignalProvider extends BaseSignalProvider {
  constructor(isLiveConfigured = false, customAdapter = null) {
    super("Weather & Environmental Signal Provider", "WEATHER", isLiveConfigured);
    this.adapter = customAdapter;
    this.statusMessage = isLiveConfigured
      ? "Live meteorological and environmental feed connected"
      : "WEATHER_DATA_UNAVAILABLE";
  }

  /**
   * Check if weather data is configured and live
   */
  isConfigured() {
    return Boolean(this.isAvailable || process.env.WEATHER_API_KEY || this.adapter);
  }

  /**
   * Fetch aggregated weather anomaly observations
   */
  async fetchAggregatedSignal({ phcId, district = "Gadchiroli", days = 28, simulateSpike = false, mockObservations = null } = {}) {
    // If mock observations explicitly injected for testing:
    if (Array.isArray(mockObservations)) {
      return {
        status: "calculated",
        is_available: true,
        data_quality: "HIGH",
        metricType: "environmental_index",
        sourceStatus: "Test calibration stream active",
        observations: mockObservations,
      };
    }

    if (simulateSpike) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const obs = Array.from({ length: days }, (_, i) => {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        let count = 22 + (i % 4);
        if (i >= days - 4) {
          count = 45 + (i % 3); // simulated heat/monsoon extreme anomaly
        }
        return {
          date: d.toISOString().split("T")[0],
          count,
          metricType: "environmental_index",
          sourceStatus: "Simulated environmental anomaly stream",
        };
      });
      return {
        status: "calculated",
        is_available: true,
        data_quality: "MEDIUM",
        metricType: "environmental_index",
        sourceStatus: "Simulated environmental anomaly stream",
        observations: obs,
      };
    }

    // If no provider is configured, do not fabricate weather values
    if (!this.isConfigured()) {
      return {
        status: "WEATHER_DATA_UNAVAILABLE",
        is_available: false,
        data_quality: "UNAVAILABLE",
        metricType: "environmental_index",
        sourceStatus: "WEATHER_DATA_UNAVAILABLE",
        observations: [],
        notes: "No live weather provider configured for district.",
      };
    }

    // Live adapter path
    if (this.adapter && typeof this.adapter.fetchMetrics === "function") {
      const liveData = await this.adapter.fetchMetrics({ district, days });
      return {
        status: "calculated",
        is_available: true,
        data_quality: "HIGH",
        metricType: "environmental_index",
        sourceStatus: "Live meteorological feed connected",
        observations: liveData,
      };
    }

    return {
      status: "WEATHER_DATA_UNAVAILABLE",
      is_available: false,
      data_quality: "UNAVAILABLE",
      metricType: "environmental_index",
      sourceStatus: "WEATHER_DATA_UNAVAILABLE",
      observations: [],
      notes: "Weather data source unconfigured.",
    };
  }
}

module.exports = WeatherEnvironmentSignalProvider;
