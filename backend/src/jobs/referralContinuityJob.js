const referralsService = require("../services/referrals.service");

/**
 * Scheduled background worker: Monitor referral milestones, evaluate stuck stages and follow-up deadlines
 */
const runReferralContinuitySweep = async () => {
  try {
    const result = await referralsService.evaluateStuckReferrals();
    return { success: true, ...result };
  } catch (err) {
    console.error("[BackgroundJobs] Referral continuity sweep error:", err.message);
    return { success: false, error: err.message };
  }
};

module.exports = {
  runReferralContinuitySweep,
};
