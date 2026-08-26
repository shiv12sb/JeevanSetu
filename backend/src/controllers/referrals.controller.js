/**
 * Closed-Loop Referrals Controller
 */

const referralsService = require("../services/referrals.service");
const { sendSuccess } = require("../utils/response");

const getReferrals = async (req, res, next) => {
  try {
    const { status, priority, stage } = req.query;
    const pagination = req.pagination || { limit: 20, offset: 0 };
    const result = await referralsService.getReferrals(req.user, {
      status,
      priority,
      stage,
      limit: pagination.limit,
      offset: pagination.offset,
    });
    return sendSuccess(res, {
      statusCode: 200,
      data: result.items,
      pagination: {
        total: result.total,
        page: req.pagination?.page || 1,
        limit: pagination.limit,
      },
    });
  } catch (err) {
    next(err);
  }
};

const getReferralById = async (req, res, next) => {
  try {
    const referral = await referralsService.getReferralById(req.user, req.params.id);
    return sendSuccess(res, {
      statusCode: 200,
      data: referral,
    });
  } catch (err) {
    next(err);
  }
};

const createReferral = async (req, res, next) => {
  try {
    const referral = await referralsService.createReferral(req.user, req.body);
    return sendSuccess(res, {
      statusCode: 201,
      message: "Referral created successfully",
      data: referral,
    });
  } catch (err) {
    next(err);
  }
};

const updateReferralStatus = async (req, res, next) => {
  try {
    const result = await referralsService.updateReferralStatus(req.user, req.params.id, req.body);
    return sendSuccess(res, {
      statusCode: 200,
      message: `Referral status updated to ${result.referral.status}`,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const assignTransport = async (req, res, next) => {
  try {
    const result = await referralsService.assignTransport(req.user, req.params.id, req.body);
    return sendSuccess(res, {
      statusCode: 200,
      message: "NGO transport assigned successfully.",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const scheduleFollowUp = async (req, res, next) => {
  try {
    const result = await referralsService.scheduleFollowUp(req.user, req.params.id, req.body);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Post-discharge follow-up scheduled successfully.",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const completeFollowUp = async (req, res, next) => {
  try {
    const result = await referralsService.completeFollowUp(req.user, req.params.id, req.body);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Follow-up completed and referral closed loop achieved.",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const getClosedLoopAnalytics = async (req, res, next) => {
  try {
    const result = await referralsService.getClosedLoopAnalytics(req.user);
    return sendSuccess(res, {
      statusCode: 200,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const acknowledgeReferral = async (req, res, next) => {
  try {
    const result = await referralsService.acknowledgeReferralByPatient(req.user, req.params.id, req.body);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Referral receipt acknowledged by patient.",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const confirmArrival = async (req, res, next) => {
  try {
    const result = await referralsService.confirmHospitalArrival(req.user, req.params.id, req.body);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Patient arrival confirmed at hospital.",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const acceptReferral = async (req, res, next) => {
  try {
    const result = await referralsService.acceptReferral(req.user, req.params.id, req.body);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Referral accepted by destination hospital.",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const recordTreatment = async (req, res, next) => {
  try {
    const result = await referralsService.recordHospitalTreatment(req.user, req.params.id, req.body);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Hospital treatment recorded successfully.",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const transferReferral = async (req, res, next) => {
  try {
    const result = await referralsService.transferReferral(req.user, req.params.id, req.body);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Referral transferred to new destination hospital.",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const cancelReferral = async (req, res, next) => {
  try {
    const result = await referralsService.cancelReferral(req.user, req.params.id, req.body);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Referral cancelled with audit trail.",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getReferrals,
  getReferralById,
  createReferral,
  updateReferralStatus,
  assignTransport,
  scheduleFollowUp,
  completeFollowUp,
  getClosedLoopAnalytics,
  acknowledgeReferral,
  confirmArrival,
  acceptReferral,
  recordTreatment,
  transferReferral,
  cancelReferral,
};
