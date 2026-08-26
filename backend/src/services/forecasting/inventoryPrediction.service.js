/**
 * JeevanSetu AI-Assisted Medicine Stockout Prediction & Supply Intelligence Service
 * Pure Deterministic Calculation Core with Proactive Alerting & Role-based Scoping
 */

const { supabase, isConfigured } = require("../../config/supabase");
const { calculateMedicineForecast } = require("./forecast.utils");
const notificationService = require("../notification.service");
const auditService = require("../audit.service");

// In-Memory mock store for alerts
const mockAlertsStore = new Map();

// Synthetic usage history store for development/preview
const mockPredictionUsageHistory = [
  // Paracetamol (phc-1, med-1): 14 days of consistent usage ~30-35/day (Stable)
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
  // Amlodipine (phc-1, med-2): 10 days of increasing usage ~15 -> 40/day (Increasing)
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
  // ORS (phc-1, med-3): High consumption spike
  ...Array.from({ length: 10 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (10 - i));
    return {
      phc_id: "phc-1",
      medicine_id: "med-3",
      quantity_consumed: i >= 7 ? 80 : 20,
      recorded_date: d.toISOString().split("T")[0],
    };
  }),
];

class InventoryPredictionService {
  /**
   * Calculate deterministic prediction for a single inventory item
   */
  async calculateItemPrediction(phcId, medicineId, inventoryItem = null, customUsage = null) {
    let item = inventoryItem;
    let usageRecords = customUsage || [];

    if (!isConfigured) {
      if (!item) {
        item = {
          phc_id: phcId,
          medicine_id: medicineId,
          current_quantity: 120,
          minimum_threshold: 100,
          replenishment_lead_time_days: 5,
          safety_stock_quantity: 50,
          medicines: {
            id: medicineId,
            name: "Paracetamol 500mg",
            generic_name: "Acetaminophen",
            dosage_form: "Tablet",
            standard_unit: "tablets",
          },
          phcs: {
            id: phcId,
            name: "Ashti Primary Health Centre",
            facility_code: "PHC-MH-2041",
          },
        };
      }
      if (!customUsage) {
        usageRecords = mockPredictionUsageHistory.filter(
          (u) => u.phc_id === phcId && u.medicine_id === medicineId
        );
      }
    } else {
      if (!item) {
        const { data: invData, error: invErr } = await supabase
          .from("medicine_inventory")
          .select("*, medicines(*), phcs(*)")
          .eq("phc_id", phcId)
          .eq("medicine_id", medicineId)
          .single();

        if (invErr || !invData) {
          throw new Error(`Inventory item not found for PHC ${phcId} and medicine ${medicineId}`);
        }
        item = invData;
      }

      if (!customUsage) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: usageData, error: usageErr } = await supabase
          .from("medicine_usage")
          .select("quantity_consumed, recorded_date")
          .eq("phc_id", phcId)
          .eq("medicine_id", medicineId)
          .gte("recorded_date", thirtyDaysAgo.toISOString().split("T")[0])
          .order("recorded_date", { ascending: true });

        if (usageErr) {
          console.error(`Error fetching usage for PHC ${phcId} Med ${medicineId}:`, usageErr);
          usageRecords = [];
        } else {
          usageRecords = usageData || [];
        }
      }
    }

    const forecast = calculateMedicineForecast({
      currentQuantity: item.current_quantity,
      minimumThreshold: item.minimum_threshold || 100,
      usageRecords,
      replenishmentLeadTimeDays: item.replenishment_lead_time_days || 5,
      safetyStockQuantity: item.safety_stock_quantity || 50,
      calculationDate: new Date(),
    });

    return {
      phc_id: phcId,
      medicine_id: medicineId,
      medicine_name: item.medicines?.name || "Medicine",
      standard_unit: item.medicines?.standard_unit || "units",
      ...forecast,
    };
  }

  /**
   * Create or update a deduplicated inventory alert
   */
  async createInventoryAlert({
    phcId,
    medicineId,
    alertType,
    riskLevel,
    currentQuantity,
    daysRemaining,
    metadata = {},
  }) {
    const todayStr = new Date().toISOString().split("T")[0];
    const dedupKey = `inv_alert_${phcId}_${medicineId}_${riskLevel}_${todayStr}`;

    const alertRecord = {
      id: `alert-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      phc_id: phcId,
      medicine_id: medicineId,
      alert_type: alertType || "LOW_STOCK",
      risk_level: riskLevel || "HIGH",
      current_quantity: currentQuantity,
      days_remaining: daysRemaining,
      status: "NEW",
      dedup_key: dedupKey,
      metadata,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (!isConfigured) {
      if (mockAlertsStore.has(dedupKey)) {
        return { isDuplicate: true, alert: mockAlertsStore.get(dedupKey) };
      }
      mockAlertsStore.set(dedupKey, alertRecord);
      return { isDuplicate: false, alert: alertRecord };
    }

    // Check existing in Supabase
    const { data: existing } = await supabase
      .from("medicine_inventory_alerts")
      .select("*")
      .eq("dedup_key", dedupKey)
      .maybeSingle();

    if (existing) {
      return { isDuplicate: true, alert: existing };
    }

    const { data: created, error } = await supabase
      .from("medicine_inventory_alerts")
      .insert([alertRecord])
      .select()
      .single();

    if (error) {
      console.error("Error creating inventory alert:", error);
      throw new Error(`Failed to create inventory alert: ${error.message}`);
    }

    return { isDuplicate: false, alert: created };
  }

  /**
   * Acknowledge an inventory alert (Staff reviewed)
   */
  async acknowledgeAlert(user, alertId, { note } = {}) {
    if (!user) throw new Error("Authentication required");

    let alertObj = null;

    if (!isConfigured) {
      for (const val of mockAlertsStore.values()) {
        if (val.id === alertId) {
          alertObj = val;
          break;
        }
      }
      if (!alertObj) {
        // Create mock for test if not present
        alertObj = {
          id: alertId,
          phc_id: user.assigned_phc_id || "phc-1",
          medicine_id: "med-1",
          status: "NEW",
          risk_level: "HIGH",
        };
        mockAlertsStore.set(`alert-${alertId}`, alertObj);
      }
    } else {
      const { data, error } = await supabase
        .from("medicine_inventory_alerts")
        .select("*")
        .eq("id", alertId)
        .single();

      if (error || !data) {
        throw new Error("Inventory alert not found");
      }
      alertObj = data;
    }

    // Authorization check
    const userPhc = user.assigned_phc_id || user.assignedPhcId;
    if (
      user.role !== "district_admin" &&
      user.role !== "doctor" &&
      userPhc !== alertObj.phc_id
    ) {
      const err = new Error("Forbidden: Not authorized to acknowledge alerts for this facility");
      err.statusCode = 403;
      throw err;
    }

    const updatedData = {
      status: "ACKNOWLEDGED",
      acknowledged_by: user.id,
      acknowledged_at: new Date().toISOString(),
      metadata: {
        ...(alertObj.metadata || {}),
        acknowledgement_note: note || "Reviewed by staff",
      },
      updated_at: new Date().toISOString(),
    };

    Object.assign(alertObj, updatedData);

    if (isConfigured) {
      await supabase
        .from("medicine_inventory_alerts")
        .update(updatedData)
        .eq("id", alertId);
    }

    // Audit log
    await auditService.logAuditEvent({
      actor_id: user.id,
      action: "INVENTORY_ALERT_ACKNOWLEDGED",
      entity_type: "medicine_inventory_alerts",
      entity_id: alertId,
      metadata: { note: note || "Reviewed by staff", previous_status: "NEW", new_status: "ACKNOWLEDGED", phc_id: alertObj.phc_id },
    });

    return alertObj;
  }

  /**
   * Resolve an inventory alert (e.g. stock replenished)
   */
  async resolveAlert(user, alertId, { note, resolution } = {}) {
    if (!user) throw new Error("Authentication required");

    let alertObj = null;

    if (!isConfigured) {
      for (const val of mockAlertsStore.values()) {
        if (val.id === alertId) {
          alertObj = val;
          break;
        }
      }
      if (!alertObj) {
        alertObj = {
          id: alertId,
          phc_id: user.assigned_phc_id || user.assignedPhcId || "phc-1",
          medicine_id: "med-1",
          status: "ACKNOWLEDGED",
          risk_level: "HIGH",
        };
        mockAlertsStore.set(`alert-${alertId}`, alertObj);
      }
    } else {
      const { data, error } = await supabase
        .from("medicine_inventory_alerts")
        .select("*")
        .eq("id", alertId)
        .single();

      if (error || !data) {
        throw new Error("Inventory alert not found");
      }
      alertObj = data;
    }

    // Authorization check
    const userPhc = user.assigned_phc_id || user.assignedPhcId;
    if (
      user.role !== "district_admin" &&
      user.role !== "doctor" &&
      userPhc !== alertObj.phc_id
    ) {
      const err = new Error("Forbidden: Not authorized to resolve alerts for this facility");
      err.statusCode = 403;
      throw err;
    }

    const updatedData = {
      status: "RESOLVED",
      resolved_by: user.id,
      resolved_at: new Date().toISOString(),
      resolution_notes: note || resolution || "Stock replenished and verified",
      updated_at: new Date().toISOString(),
    };

    Object.assign(alertObj, updatedData);

    if (isConfigured) {
      await supabase
        .from("medicine_inventory_alerts")
        .update(updatedData)
        .eq("id", alertId);
    }

    // Audit log
    await auditService.logAuditEvent({
      actor_id: user.id,
      action: "INVENTORY_ALERT_RESOLVED",
      entity_type: "medicine_inventory_alerts",
      entity_id: alertId,
      metadata: { resolution_notes: updatedData.resolution_notes, new_status: "RESOLVED", phc_id: alertObj.phc_id },
    });

    return alertObj;
  }

  /**
   * Query inventory alerts with scoping and filters
   */
  async getInventoryAlerts(user, { phcId, status, riskLevel, limit = 50, offset = 0 } = {}) {
    if (!user) throw new Error("Authentication required");

    let scopedPhcId = phcId;
    if (user.role === "phc_staff") {
      scopedPhcId = user.assigned_phc_id || user.assignedPhcId;
    }

    if (!isConfigured) {
      let list = Array.from(mockAlertsStore.values());
      if (scopedPhcId) {
        list = list.filter((a) => a.phc_id === scopedPhcId);
      }
      if (status) {
        list = list.filter((a) => a.status === status);
      }
      if (riskLevel) {
        list = list.filter((a) => a.risk_level === riskLevel);
      }
      return {
        total: list.length,
        alerts: list.slice(offset, offset + limit),
      };
    }

    let query = supabase
      .from("medicine_inventory_alerts")
      .select("*, medicines(*), phcs(*)", { count: "exact" });

    if (scopedPhcId) {
      query = query.eq("phc_id", scopedPhcId);
    }
    if (status) {
      query = query.eq("status", status);
    }
    if (riskLevel) {
      query = query.eq("risk_level", riskLevel);
    }

    query = query.order("created_at", { ascending: false }).range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) {
      console.error("Error querying inventory alerts:", error);
      throw new Error(`Failed to query inventory alerts: ${error.message}`);
    }

    return {
      total: count || 0,
      alerts: data || [],
    };
  }

  /**
   * Background sweep execution: calculates predictions across all PHCs and creates alerts
   */
  async runScheduledStockoutSweep() {
    let itemsToProcess = [];

    if (!isConfigured) {
      itemsToProcess = [
        {
          phc_id: "phc-1",
          medicine_id: "med-1",
          current_quantity: 450,
          minimum_threshold: 200,
          replenishment_lead_time_days: 5,
          safety_stock_quantity: 50,
        },
        {
          phc_id: "phc-1",
          medicine_id: "med-2",
          current_quantity: 80,
          minimum_threshold: 150,
          replenishment_lead_time_days: 5,
          safety_stock_quantity: 50,
        },
        {
          phc_id: "phc-1",
          medicine_id: "med-3",
          current_quantity: 0,
          minimum_threshold: 100,
          replenishment_lead_time_days: 5,
          safety_stock_quantity: 50,
        },
      ];
    } else {
      const { data, error } = await supabase
        .from("medicine_inventory")
        .select("*, medicines(*), phcs(*)")
        .limit(200);

      if (error) {
        console.error("Error fetching inventory for sweep:", error);
        return { success: false, processedCount: 0, alertsCreated: 0 };
      }
      itemsToProcess = data || [];
    }

    let processedCount = 0;
    let alertsCreated = 0;

    for (const item of itemsToProcess) {
      try {
        const prediction = await this.calculateItemPrediction(item.phc_id, item.medicine_id, item);
        processedCount++;

        // If risk is CRITICAL, HIGH, OUT_OF_STOCK, or reorder recommended, generate alert
        if (
          prediction.risk_level === "CRITICAL" ||
          prediction.risk_level === "HIGH" ||
          prediction.risk_level === "OUT_OF_STOCK" ||
          prediction.reorder_recommended
        ) {
          const alertType =
            prediction.current_quantity === 0
              ? "OUT_OF_STOCK"
              : prediction.risk_level === "CRITICAL"
              ? "CRITICAL_STOCKOUT"
              : "LOW_STOCK";

          const alertResult = await this.createInventoryAlert({
            phcId: item.phc_id,
            medicineId: item.medicine_id,
            alertType,
            riskLevel: prediction.risk_level,
            currentQuantity: prediction.current_quantity,
            daysRemaining: prediction.estimated_days_remaining,
            metadata: {
              reorder_recommended: prediction.reorder_recommended,
              estimated_stockout_date: prediction.estimated_stockout_date,
              estimated_threshold_date: prediction.estimated_threshold_date,
            },
          });

          if (!alertResult.isDuplicate) {
            alertsCreated++;
            // Dispatch notification to PHC staff
            await notificationService.createNotification({
              userId: null,
              phcId: item.phc_id,
              title: `Medicine Stockout Warning: ${prediction.medicine_name || "Essential Drug"}`,
              message: `Stock level for ${prediction.medicine_name || "Medicine"} is ${prediction.risk_level} (${prediction.current_quantity} remaining, ~${prediction.estimated_days_remaining || 0} days).`,
              type: "ALERT",
              priority: prediction.risk_level === "CRITICAL" || prediction.risk_level === "OUT_OF_STOCK" ? "URGENT" : "ROUTINE",
              dedupKey: alertResult.alert.dedup_key,
            });
          }
        }
      } catch (err) {
        console.error(`Error predicting for PHC ${item.phc_id} Med ${item.medicine_id}:`, err);
      }
    }

    return {
      success: true,
      processedCount,
      alertsCreated,
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = new InventoryPredictionService();
