const { supabase, isConfigured } = require("../config/supabase");
const notificationService = require("../services/notification.service");

/**
 * Job: Sweep inventory to detect unalerted low stock
 */
const runInventoryAlertSweep = async () => {
  if (!isConfigured) return;

  try {
    const { data: lowStockItems, error } = await supabase
      .from("medicine_inventory")
      .select("*, medicines(name)")
      .filter("current_quantity", "lte", "minimum_threshold");

    if (error || !lowStockItems) return;

    for (const item of lowStockItems) {
      await notificationService.notifyMedicineLowStock({
        phc_id: item.phc_id,
        medicine_id: item.medicine_id,
        medicine_name: item.medicines?.name,
        current_qty: item.current_quantity,
        threshold: item.minimum_threshold,
      });
    }
  } catch (err) {
    console.error("[Job:InventorySweep] Error running inventory alert sweep:", err.message);
  }
};

/**
 * Job: Dispatcher stub for future external delivery channels (SMS, Webhooks, n8n)
 */
const runPendingNotificationsDispatcher = async () => {
  // In Phase 6, in-app notifications are delivered immediately via database insert.
  // This background worker exists as the abstraction boundary for future SMS / Webhook queue workers.
};

module.exports = {
  runInventoryAlertSweep,
  runPendingNotificationsDispatcher,
};
