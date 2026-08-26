const { supabase, isConfigured } = require("../../config/supabase");
const { calculateMedicineForecast } = require("./forecast.utils");
const notificationService = require("../notification.service");
const auditService = require("../audit.service");

// In-Memory mock store for development and testing
const mockForecastStore = new Map();

// Synthetic usage history store for fallback
const mockUsageHistory = [
  // Paracetamol (phc-1, med-1): 14 days of consistent usage ~30-35/day (Pattern A - Stable)
  ...Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (14 - i));
    return {
      phc_id: "phc-1",
      medicine_id: "med-1",
      quantity_consumed: 30 + (i % 5),
      recorded_date: d.toISOString().split("T")[0],
    };
  }),
  // Amlodipine (phc-1, med-2): 10 days of increasing usage ~15 -> 40/day (Pattern B - Increasing)
  ...Array.from({ length: 10 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (10 - i));
    return {
      phc_id: "phc-1",
      medicine_id: "med-2",
      quantity_consumed: 15 + i * 3,
      recorded_date: d.toISOString().split("T")[0],
    };
  }),
  // Amoxicillin (phc-1, med-3): 10 days of decreasing usage ~40 -> 10/day (Pattern C - Decreasing)
  ...Array.from({ length: 10 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (10 - i));
    return {
      phc_id: "phc-1",
      medicine_id: "med-3",
      quantity_consumed: Math.max(5, 40 - i * 3),
      recorded_date: d.toISOString().split("T")[0],
    };
  }),
  // ORS Sachets (phc-1, med-4): High variance spikes (Pattern D - Highly Variable)
  ...Array.from({ length: 8 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (8 - i) * 2);
    return {
      phc_id: "phc-1",
      medicine_id: "med-4",
      quantity_consumed: i % 2 === 0 ? 95 : 5,
      recorded_date: d.toISOString().split("T")[0],
    };
  }),
  // Metformin (phc-1, med-5): Only 1 record (Pattern E - Insufficient Data)
  {
    phc_id: "phc-1",
    medicine_id: "med-5",
    quantity_consumed: 20,
    recorded_date: new Date().toISOString().split("T")[0],
  },
];

class MedicineForecastService {
  /**
   * Calculate forecast for a single inventory item
   */
  async calculateItemForecast(phcId, medicineId, inventoryItem = null) {
    let item = inventoryItem;
    let usageRecords = [];

    if (!isConfigured) {
      if (!item) {
        item = {
          phc_id: phcId,
          medicine_id: medicineId,
          current_quantity: medicineId === "med-2" ? 80 : 350,
          minimum_threshold: 100,
        };
      }
      usageRecords = mockUsageHistory.filter(
        (u) => u.phc_id === phcId && u.medicine_id === medicineId
      );
    } else {
      if (!item) {
        const { data: invData, error: invErr } = await supabase
          .from("medicine_inventory")
          .select("*, medicines(*)")
          .eq("phc_id", phcId)
          .eq("medicine_id", medicineId)
          .single();

        if (invErr || !invData) {
          throw new Error(`Inventory item not found for PHC ${phcId} and medicine ${medicineId}`);
        }
        item = invData;
      }

      // Fetch past 30 days usage
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: usageData } = await supabase
        .from("medicine_usage")
        .select("*")
        .eq("phc_id", phcId)
        .eq("medicine_id", medicineId)
        .gte("recorded_date", thirtyDaysAgo.toISOString().split("T")[0])
        .order("recorded_date", { ascending: true });

      usageRecords = usageData || [];
    }

    const forecast = calculateMedicineForecast({
      currentQuantity: item.current_quantity,
      minimumThreshold: item.minimum_threshold,
      usageRecords,
      calculationDate: new Date(),
    });

    const result = {
      phc_id: phcId,
      medicine_id: medicineId,
      medicine_name: item.medicines?.name || "Essential Medicine",
      generic_name: item.medicines?.generic_name || "Essential Generic",
      standard_unit: item.medicines?.standard_unit || "tablets",
      current_quantity: item.current_quantity,
      minimum_threshold: item.minimum_threshold,
      ...forecast,
      calculated_at: new Date().toISOString(),
    };

    // Save in memory cache
    const cacheKey = `${phcId}_${medicineId}`;
    mockForecastStore.set(cacheKey, result);

    return result;
  }

  /**
   * Get forecasts for facility or district with role scoping
   */
  async getForecasts(user, { phc_id, risk_level, medicine_id } = {}) {
    let targetPhcId = phc_id;

    // Role-based facility isolation
    if (user.role === "phc_staff") {
      targetPhcId = user.assignedPhcId || "phc-1";
    }

    let itemsToProcess = [];

    if (!isConfigured) {
      const mockItems = [
        {
          id: "inv-1",
          phc_id: targetPhcId || "phc-1",
          medicine_id: "med-1",
          current_quantity: 350,
          minimum_threshold: 100,
          medicines: { name: "Paracetamol 500mg", generic_name: "Paracetamol", standard_unit: "tablets" },
        },
        {
          id: "inv-2",
          phc_id: targetPhcId || "phc-1",
          medicine_id: "med-2",
          current_quantity: 80,
          minimum_threshold: 150,
          medicines: { name: "Amlodipine 5mg", generic_name: "Amlodipine Besylate", standard_unit: "tablets" },
        },
        {
          id: "inv-3",
          phc_id: targetPhcId || "phc-1",
          medicine_id: "med-3",
          current_quantity: 240,
          minimum_threshold: 100,
          medicines: { name: "Amoxicillin 500mg", generic_name: "Amoxicillin Trihydrate", standard_unit: "capsules" },
        },
        {
          id: "inv-4",
          phc_id: targetPhcId || "phc-1",
          medicine_id: "med-4",
          current_quantity: 120,
          minimum_threshold: 80,
          medicines: { name: "Oral Rehydration Salts (ORS)", generic_name: "WHO Formulation", standard_unit: "sachets" },
        },
        {
          id: "inv-5",
          phc_id: targetPhcId || "phc-1",
          medicine_id: "med-5",
          current_quantity: 500,
          minimum_threshold: 100,
          medicines: { name: "Metformin 500mg", generic_name: "Metformin Hydrochloride", standard_unit: "tablets" },
        },
      ];

      itemsToProcess = mockItems;
    } else {
      let query = supabase.from("medicine_inventory").select("*, medicines(*)");
      if (targetPhcId) query = query.eq("phc_id", targetPhcId);
      if (medicine_id) query = query.eq("medicine_id", medicine_id);

      const { data, error } = await query;
      if (error) throw error;
      itemsToProcess = data || [];
    }

    const forecasts = [];
    for (const item of itemsToProcess) {
      const f = await this.calculateItemForecast(item.phc_id, item.medicine_id, item);
      if (!risk_level || f.risk_level === risk_level.toUpperCase()) {
        forecasts.push(f);
      }
    }

    return {
      facility_id: targetPhcId,
      total: forecasts.length,
      calculated_at: new Date().toISOString(),
      items: forecasts,
    };
  }

  /**
   * Periodic Background Job Sweep: Recalculate & Persist all forecasts & Trigger State-Aware Alerts
   */
  async runPeriodicForecastingSweep() {
    const sweepStartTime = Date.now();
    let calculatedCount = 0;
    let criticalAlertsCount = 0;

    let items = [];
    if (!isConfigured) {
      items = [
        { phc_id: "phc-1", medicine_id: "med-1", current_quantity: 350, minimum_threshold: 100 },
        { phc_id: "phc-1", medicine_id: "med-2", current_quantity: 80, minimum_threshold: 150 },
        { phc_id: "phc-1", medicine_id: "med-3", current_quantity: 240, minimum_threshold: 100 },
      ];
    } else {
      const { data } = await supabase.from("medicine_inventory").select("phc_id, medicine_id, current_quantity, minimum_threshold");
      items = data || [];
    }

    for (const item of items) {
      try {
        const forecast = await this.calculateItemForecast(item.phc_id, item.medicine_id, item);
        calculatedCount++;

        // Persist to Supabase if configured
        if (isConfigured) {
          await supabase.from("medicine_forecasts").upsert(
            {
              phc_id: item.phc_id,
              medicine_id: item.medicine_id,
              current_quantity: forecast.current_quantity,
              estimated_daily_consumption: forecast.estimated_daily_consumption,
              estimated_days_remaining: forecast.estimated_days_remaining,
              projected_depletion_date: forecast.projected_depletion_date,
              consumption_trend: forecast.consumption_trend,
              risk_level: forecast.risk_level,
              data_quality: forecast.data_quality,
              forecast_status: forecast.status,
              calculated_at: new Date().toISOString(),
            },
            { onConflict: "phc_id, medicine_id" }
          );
        }

        // State-Aware Alerting for CRITICAL or HIGH depletion risk
        if (forecast.risk_level === "CRITICAL" || forecast.risk_level === "HIGH") {
          await notificationService.notifyMedicineLowStock({
            phc_id: item.phc_id,
            medicine_id: item.medicine_id,
            medicine_name: forecast.medicine_name,
            current_qty: forecast.current_quantity,
            threshold: item.minimum_threshold,
          });
          criticalAlertsCount++;
        }
      } catch (err) {
        console.warn(`Forecasting sweep item error for ${item.phc_id}/${item.medicine_id}:`, err.message);
      }
    }

    const durationMs = Date.now() - sweepStartTime;

    await auditService.logAuditEvent({
      actor_id: "system-job-forecasting",
      action: "FORECASTING_SWEEP_EXECUTED",
      entity_type: "medicine_forecasts",
      metadata: {
        total_items_processed: calculatedCount,
        critical_alerts_triggered: criticalAlertsCount,
        duration_ms: durationMs,
      },
    });

    return {
      success: true,
      total_items_processed: calculatedCount,
      critical_alerts_triggered: criticalAlertsCount,
      duration_ms: durationMs,
    };
  }
}

module.exports = new MedicineForecastService();
