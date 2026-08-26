const referralFollowUpService = require("../services/referrals/referralFollowUp.service");
const { sendSuccess, sendError } = require("../utils/response");

const getFollowUpQueue = async (req, res, next) => {
  try {
    const { status, priority, phc_id, hospital_id, limit, offset } = req.query;

    const result = await referralFollowUpService.getFollowUpQueue(req.user, {
      status,
      priority,
      phc_id,
      hospital_id,
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
    });

    return sendSuccess(res, {
      statusCode: 200,
      data: result.items,
      metadata: {
        total: result.total,
      },
    });
  } catch (err) {
    next(err);
  }
};

const getFollowUpById = async (req, res, next) => {
  try {
    const item = await referralFollowUpService.getFollowUpById(req.user, req.params.id);

    return sendSuccess(res, {
      statusCode: 200,
      data: item,
    });
  } catch (err) {
    next(err);
  }
};

const manualOverride = async (req, res, next) => {
  try {
    const updated = await referralFollowUpService.manualOverride(
      req.user,
      req.params.id,
      req.body
    );

    return sendSuccess(res, {
      statusCode: 200,
      message: "Referral follow-up status updated with audited manual justification.",
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

const getAnalytics = async (req, res, next) => {
  try {
    const analytics = await referralFollowUpService.getReferralAnalytics(req.user);

    return sendSuccess(res, {
      statusCode: 200,
      data: analytics,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getFollowUpQueue,
  getFollowUpById,
  manualOverride,
  getAnalytics,
};
