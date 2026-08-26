const referralFollowUpService = require("../services/referrals/referralFollowUp.service");

/**
 * Scheduled background worker: Run periodic referral care-continuity milestone sweep
 */
const runReferralFollowUpSweep = async () => {
  try {
    const result = await referralFollowUpService.runPeriodicFollowUpSweep();
    return result;
  } catch (err) {
    console.error("[BackgroundJobs] Referral follow-up sweep worker error:", err.message);
    return { success: false, error: err.message };
  }
};

module.exports = {
  runReferralFollowUpSweep,
};
