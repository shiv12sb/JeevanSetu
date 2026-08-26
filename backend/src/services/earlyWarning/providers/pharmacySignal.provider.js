const BaseSignalProvider = require("./baseSignal.provider");

class PharmacySignalProvider extends BaseSignalProvider {
  constructor(isLiveConfigured = false, customAdapter = null) {
    super("Retail Pharmacy Consumption Surveillance", "PHARMACY", isLiveConfigured);
    this.adapter = customAdapter;
    this.statusMessage = isLiveConfigured
      ? "Live retail pharmacy aggregate feed connected"
      : "NOT_AVAILABLE";
  }

  isConfigured() {
    return Boolean(this.isAvailable || process.env.PHARMACY_INTEGRATION_KEY || this.adapter);
  }

  /**
   * Fetch aggregated retail pharmacy consumption indices
   */
  async fetchAggregatedSignal({ phcId, district = "Gadchiroli", days = 28, simulateSpike = false, mockObservations = null } = {}) {
    if (Array.isArray(mockObservations)) {
      return {
        status: "calculated",
        is_available: true,
        data_quality: "HIGH",
        metricType: "pharmacy_otc_consumption",
        sourceStatus: "Test retail pharmacy stream active",
        observations: mockObservations,
      };
    }

    if (simulateSpike) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const obs = Array.from({ length: days }, (_, i) => {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        let count = 12 + (i % 4);
        if (i >= days - 4) {
          count = 34 + (i % 3); // simulated OTC paracetamol/ORS purchase surge
        }
        return {
          date: d.toISOString().split("T")[0],
          count,
          metricType: "pharmacy_otc_consumption",
          sourceStatus: "Simulated retail pharmacy surveillance",
        };
      });
      return {
        status: "calculated",
        is_available: true,
        data_quality: "MEDIUM",
        metricType: "pharmacy_otc_consumption",
        sourceStatus: "Simulated retail pharmacy stream",
        observations: obs,
      };
    }

    // If external pharmacy integration is not configured, do not fabricate OTC data
    if (!this.isConfigured()) {
      return {
        status: "NOT_AVAILABLE",
        is_available: false,
        data_quality: "UNAVAILABLE",
        metricType: "pharmacy_otc_consumption",
        sourceStatus: "PHARMACY_SIGNAL = NOT_AVAILABLE",
        observations: [],
        notes: "No external pharmacy network integration configured.",
      };
    }

    if (this.adapter && typeof this.adapter.fetchConsumption === "function") {
      const liveData = await this.adapter.fetchConsumption({ district, days });
      return {
        status: "calculated",
        is_available: true,
        data_quality: "HIGH",
        metricType: "pharmacy_otc_consumption",
        sourceStatus: "Live retail pharmacy aggregate feed connected",
        observations: liveData,
      };
    }

    return {
      status: "NOT_AVAILABLE",
      is_available: false,
      data_quality: "UNAVAILABLE",
      metricType: "pharmacy_otc_consumption",
      sourceStatus: "PHARMACY_SIGNAL = NOT_AVAILABLE",
      observations: [],
      notes: "External pharmacy data provider not available.",
    };
  }
}

module.exports = PharmacySignalProvider;
