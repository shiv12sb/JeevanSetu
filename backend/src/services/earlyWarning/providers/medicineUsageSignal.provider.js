const BaseSignalProvider = require("./baseSignal.provider");
const { supabase, isConfigured } = require("../../../config/supabase");

class MedicineUsageSignalProvider extends BaseSignalProvider {
  constructor() {
    super("Medicine Usage Signal Provider", "medicine_usage", true);
  }

  /**
   * Fetch aggregated medicine dispensation consumption volume across essential classes
   */
  async fetchAggregatedSignal({ phcId, medicineId, days = 28 } = {}) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split("T")[0];

    if (!isConfigured) {
      return Array.from({ length: days }, (_, i) => {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        let count = 25 + (i % 6);
        if (i >= days - 4 && phcId === "phc-surge") {
          count = 65 + (i % 5);
        }
        return {
          date: d.toISOString().split("T")[0],
          count,
          metricType: "medicine_consumption_units",
        };
      });
    }

    let query = supabase
      .from("medicine_usage")
      .select("phc_id, medicine_id, quantity_consumed, recorded_date")
      .gte("recorded_date", startDateStr);

    if (phcId) query = query.eq("phc_id", phcId);
    if (medicineId) query = query.eq("medicine_id", medicineId);

    const { data, error } = await query;
    if (error) throw error;

    const countMap = new Map();
    for (const row of data || []) {
      const dateStr = row.recorded_date;
      const qty = parseInt(row.quantity_consumed, 10) || 0;
      countMap.set(dateStr, (countMap.get(dateStr) || 0) + qty);
    }

    const results = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dStr = d.toISOString().split("T")[0];
      results.push({
        date: dStr,
        count: countMap.get(dStr) || 0,
        metricType: "medicine_consumption_units",
      });
    }

    return results;
  }
}

module.exports = MedicineUsageSignalProvider;
