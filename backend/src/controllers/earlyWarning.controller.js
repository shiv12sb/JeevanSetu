const earlyWarningService = require("../services/earlyWarning/earlyWarning.service");
const aiService = require("../services/ai/ai.service");
const { sendSuccess, sendError } = require("../utils/response");

const getSignals = async (req, res, next) => {
  try {
    const { phc_id, district, severity, signal_level, status } = req.query;

    if (req.user.role === "patient") {
      return sendError(res, {
        statusCode: 403,
        message: "Access forbidden: Patients may not access operational health early-warning surveillance data.",
      });
    }

    const result = await earlyWarningService.getSignals(req.user, {
      phc_id,
      district,
      severity,
      signal_level,
      status,
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

const getSignalById = async (req, res, next) => {
  try {
    if (req.user.role === "patient") {
      return sendError(res, {
        statusCode: 403,
        message: "Access forbidden: Patients may not access operational health early-warning surveillance data.",
      });
    }

    const signal = await earlyWarningService.getSignalById(req.user, req.params.id);

    return sendSuccess(res, {
      statusCode: 200,
      data: signal,
    });
  } catch (err) {
    next(err);
  }
};

const updateSignalStatus = async (req, res, next) => {
  try {
    const updated = await earlyWarningService.updateSignalStatus(
      req.user,
      req.params.id,
      req.body
    );

    return sendSuccess(res, {
      statusCode: 200,
      message: `Early-warning review action '${req.body.action || req.body.status}' recorded successfully.`,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

const evaluateFacility = async (req, res, next) => {
  try {
    const { phcId } = req.params;
    const { district } = req.query;

    const evaluation = await earlyWarningService.evaluateFacility(phcId, district);

    return sendSuccess(res, {
      statusCode: 200,
      data: evaluation,
    });
  } catch (err) {
    next(err);
  }
};

const getAnalytics = async (req, res, next) => {
  try {
    const { district } = req.query;
    const analytics = await earlyWarningService.getAnalytics(req.user, { district });

    return sendSuccess(res, {
      statusCode: 200,
      data: analytics,
    });
  } catch (err) {
    next(err);
  }
};

const getAiSummary = async (req, res, next) => {
  try {
    const { district } = req.query;
    const analytics = await earlyWarningService.getAnalytics(req.user, { district });
    const summary = await aiService.summarizeEarlyWarningSignals(analytics);

    return sendSuccess(res, {
      statusCode: 200,
      data: summary,
    });
  } catch (err) {
    next(err);
  }
};

const explainAlertWithAi = async (req, res, next) => {
  try {
    const { alert, signals, baseline } = req.body;
    const explanation = await aiService.summarizePublicHealthAlert({
      alert: alert || {},
      signals: signals || [],
      baseline: baseline || {},
      user: req.user,
    });

    return sendSuccess(res, {
      statusCode: 200,
      data: explanation,
    });
  } catch (err) {
    next(err);
  }
};

const submitCommunityReport = async (req, res, next) => {
  try {
    const report = await earlyWarningService.submitCommunityReport(req.user, req.body);
    return sendSuccess(res, {
      statusCode: 201,
      message: "Community ASHA report recorded successfully.",
      data: report,
    });
  } catch (err) {
    next(err);
  }
};

const getCommunityReports = async (req, res, next) => {
  try {
    const reports = await earlyWarningService.getCommunityReports(req.user, req.query);
    return sendSuccess(res, {
      statusCode: 200,
      data: reports,
    });
  } catch (err) {
    next(err);
  }
};

const triggerSweep = async (req, res, next) => {
  try {
    const result = await earlyWarningService.runPeriodicEarlyWarningSweep();
    return sendSuccess(res, {
      statusCode: 200,
      message: "Early-warning sweep executed successfully.",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSignals,
  getSignalById,
  updateSignalStatus,
  evaluateFacility,
  getAnalytics,
  getAiSummary,
  explainAlertWithAi,
  submitCommunityReport,
  getCommunityReports,
  triggerSweep,
};
