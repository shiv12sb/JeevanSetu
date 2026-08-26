const BaseSignalProvider = require("./baseSignal.provider");
const { supabase, isConfigured } = require("../../../config/supabase");

class FeedbackSignalProvider extends BaseSignalProvider {
  constructor() {
    super("Citizen Feedback Signal Provider", "feedback", true);
  }

  /**
   * Fetch aggregated daily feedback complaints / service issues count
   */
  async fetchAggregatedSignal({ phcId, district = "Gadchiroli", days = 28 } = {}) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    if (!isConfigured) {
      // Deterministic synthetic baseline for offline dev/test
      return Array.from({ length: days }, (_, i) => {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        let count = (i % 3);
        if (i >= days - 4 && phcId === "phc-surge") {
          count = 8 + (i % 2);
        }
        return {
          date: d.toISOString().split("T")[0],
          count,
          metricType: "feedback_complaints",
        };
      });
    }

    let query = supabase
      .from("feedback")
      .select("id, facility_id, rating, category, created_at")
      .gte("created_at", startDate.toISOString());

    if (phcId) {
      query = query.eq("facility_id", phcId);
    }

    const { data, error } = await query;
    if (error) throw error;

    const countMap = new Map();
    for (const row of data || []) {
      // Low ratings (1-2) or service issues indicate operational friction
      if (row.rating <= 2 || row.category === "MEDICINE_SHORTAGE" || row.category === "STAFF_ATTENDANCE") {
        const dateStr = row.created_at.split("T")[0];
        countMap.set(dateStr, (countMap.get(dateStr) || 0) + 1);
      }
    }

    const results = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dStr = d.toISOString().split("T")[0];
      results.push({
        date: dStr,
        count: countMap.get(dStr) || 0,
        metricType: "feedback_complaints",
      });
    }

    return results;
  }
}

module.exports = FeedbackSignalProvider;
