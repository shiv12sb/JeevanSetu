const BaseSignalProvider = require("./baseSignal.provider");
const { supabase, isConfigured } = require("../../../config/supabase");

class HealthCasesSignalProvider extends BaseSignalProvider {
  constructor() {
    super("Health Cases Signal Provider", "health_cases", true);
  }

  /**
   * Fetch aggregated daily case counts for a facility or district
   */
  async fetchAggregatedSignal({ phcId, district = "Gadchiroli", days = 28 } = {}) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split("T")[0];

    if (!isConfigured) {
      // Deterministic synthetic baseline for offline dev/test
      return Array.from({ length: days }, (_, i) => {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        // Base nominal count ~10-14 cases per day
        let count = 10 + (i % 5);
        // If testing surge at end of window:
        if (i >= days - 4 && phcId === "phc-surge") {
          count = 28 + (i % 4);
        }
        return {
          date: d.toISOString().split("T")[0],
          count,
          metricType: "case_volume",
        };
      });
    }

    let query = supabase
      .from("health_cases")
      .select("id, initial_phc_id, category, urgency, created_at")
      .gte("created_at", startDate.toISOString());

    if (phcId) {
      query = query.eq("initial_phc_id", phcId);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Aggregate counts by date (Privacy-preserving)
    const countMap = new Map();
    for (const row of data || []) {
      const dateStr = row.created_at.split("T")[0];
      countMap.set(dateStr, (countMap.get(dateStr) || 0) + 1);
    }

    const results = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dStr = d.toISOString().split("T")[0];
      results.push({
        date: dStr,
        count: countMap.get(dStr) || 0,
        metricType: "case_volume",
      });
    }

    return results;
  }
}

module.exports = HealthCasesSignalProvider;
