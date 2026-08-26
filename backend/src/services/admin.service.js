const { supabase, isConfigured } = require("../config/supabase");
const casesService = require("./cases.service");
const referralsService = require("./referrals.service");
const inventoryService = require("./inventory.service");
const doctorsService = require("./doctors.service");
const auditService = require("./audit.service");

/**
 * Service: Comprehensive Admin Monitoring Overview
 */
const getAdminMonitoringOverview = async (user, { district = "Gadchiroli" } = {}) => {
  // 1. Unresolved Health Cases
  const casesResult = await casesService.getCases(user, { limit: 50 });
  const unresolvedCases = (casesResult.items || []).filter(
    (c) => c.status === "open" || c.status === "referred" || c.status === "in_treatment"
  );
  const urgentCases = unresolvedCases.filter((c) => c.urgency === "urgent" || c.urgency === "emergency");

  // 2. Referral Follow-up Queue
  const referralsResult = await referralsService.getReferrals(user, { limit: 50 });
  const activeReferrals = (referralsResult.items || []).filter((r) => r.status !== "completed" && r.status !== "cancelled");
  const followUpQueue = (referralsResult.items || []).filter(
    (r) => r.requires_follow_up || r.status === "destination_accepted" || r.status === "created"
  );

  // 3. Low-Stock PHC Surveillance
  const inventoryResult = await inventoryService.getInventory(user, { limit: 100 });
  const lowStockItems = (inventoryResult.items || []).filter((i) => i.current_quantity <= i.minimum_threshold);

  // Group low stock by PHC
  const lowStockByPhc = {};
  for (const item of lowStockItems) {
    const phcName = item.phcs?.name || "Ashti Primary Health Centre";
    if (!lowStockByPhc[phcName]) {
      lowStockByPhc[phcName] = [];
    }
    lowStockByPhc[phcName].push({
      medicine_name: item.medicines?.name || "Essential Drug",
      current_quantity: item.current_quantity,
      minimum_threshold: item.minimum_threshold,
      deficit: item.minimum_threshold - item.current_quantity,
    });
  }

  // 4. Doctor Duty & Clinical Availability
  const doctors = await doctorsService.getDoctors();
  const onDutyCount = doctors.filter((d) => d.is_on_duty).length;
  const offDutyCount = doctors.length - onDutyCount;

  // Review flags (strictly neutral terminology)
  const dutyReviewFlags = doctors
    .filter((d) => d.review_status === "requires_review")
    .map((d) => ({
      doctor_id: d.id,
      doctor_name: d.full_name,
      facility: d.phcs?.name || d.hospitals?.name || "PHC",
      flag_reason: "Shift schedule variance — requires administrative review",
    }));

  return {
    district,
    timestamp: new Date().toISOString(),
    metrics: {
      total_unresolved_cases: unresolvedCases.length,
      urgent_cases_count: urgentCases.length,
      active_referrals_count: activeReferrals.length,
      referral_follow_up_count: followUpQueue.length,
      low_stock_items_count: lowStockItems.length,
      low_stock_phc_count: Object.keys(lowStockByPhc).length,
      doctors_on_duty: onDutyCount,
      doctors_total: doctors.length,
      duty_review_flags_count: dutyReviewFlags.length,
    },
    unresolved_cases: unresolvedCases.slice(0, 10),
    referral_follow_up_queue: followUpQueue.slice(0, 10),
    low_stock_phcs: lowStockByPhc,
    doctor_duty_status: {
      on_duty_count: onDutyCount,
      off_duty_count: offDutyCount,
      roster: doctors.slice(0, 10),
      review_flags: dutyReviewFlags,
    },
  };
};

/**
 * Service: Get System Audit Trail (Restricted to District Admin)
 */
const getSystemAuditLogs = async (user, filters = {}) => {
  return auditService.getAuditLogs(filters);
};

module.exports = {
  getAdminMonitoringOverview,
  getSystemAuditLogs,
};
