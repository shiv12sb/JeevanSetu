const { supabase, isConfigured } = require("../config/supabase");

/**
 * Job: Safe Non-Destructive Maintenance
 * Prunes only read system/transient notifications older than 60 days.
 * IMPORTANT: Strictly NO deletion of clinical records, cases, referrals, or vitals.
 */
const runSafeNotificationCleanup = async () => {
  if (!isConfigured) return;

  try {
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();

    const { error, count } = await supabase
      .from("notifications")
      .delete({ count: "exact" })
      .eq("is_read", true)
      .eq("type", "system_alert")
      .lt("created_at", sixtyDaysAgo);

    if (error) {
      console.error("[Job:Cleanup] Error in safe notification cleanup:", error.message);
    } else if (count && count > 0) {
      console.log(`[Job:Cleanup] Cleaned up ${count} stale read system notifications.`);
    }
  } catch (err) {
    console.error("[Job:Cleanup] Unhandled exception:", err.message);
  }
};

module.exports = {
  runSafeNotificationCleanup,
};
