const doctorPresenceService = require("../services/doctorPresence.service");
const aiService = require("../services/ai/ai.service");
const { sendSuccess, sendError } = require("../utils/response");

// 1. Schedules
const createSchedule = async (req, res, next) => {
  try {
    const schedule = await doctorPresenceService.createSchedule(req.body, req.user);
    return sendSuccess(res, {
      statusCode: 201,
      message: "Doctor duty schedule created successfully.",
      data: schedule,
    });
  } catch (err) {
    next(err);
  }
};

const listSchedules = async (req, res, next) => {
  try {
    const { doctorId, phcId, dutyDate, status, limit, offset } = req.query;
    const result = await doctorPresenceService.listSchedules(
      { doctorId, phcId, dutyDate, status, limit, offset },
      req.user
    );
    return sendSuccess(res, {
      statusCode: 200,
      data: result.items,
      total: result.total,
    });
  } catch (err) {
    next(err);
  }
};

const cancelSchedule = async (req, res, next) => {
  try {
    const schedule = await doctorPresenceService.cancelSchedule(req.params.id, req.body, req.user);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Doctor duty schedule cancelled successfully.",
      data: schedule,
    });
  } catch (err) {
    next(err);
  }
};

// 2. Check-In & Check-Out
const checkInDoctor = async (req, res, next) => {
  try {
    const session = await doctorPresenceService.checkIn(req.body, req.user);
    return sendSuccess(res, {
      statusCode: 201,
      message: "Doctor check-in recorded successfully.",
      data: session,
    });
  } catch (err) {
    next(err);
  }
};

const checkOutDoctor = async (req, res, next) => {
  try {
    const session = await doctorPresenceService.checkOut(req.body, req.user);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Doctor check-out completed successfully.",
      data: session,
    });
  } catch (err) {
    next(err);
  }
};

const getCurrentSession = async (req, res, next) => {
  try {
    const session = await doctorPresenceService.getCurrentSession(req.user);
    return sendSuccess(res, {
      statusCode: 200,
      data: session,
    });
  } catch (err) {
    next(err);
  }
};

// 3. Operational Flags & Review
const getOperationalFlags = async (req, res, next) => {
  try {
    const { doctorId, phcId, status, severity, limit, offset } = req.query;
    const result = await doctorPresenceService.getOperationalFlags(
      { doctorId, phcId, status, severity, limit, offset },
      req.user
    );
    return sendSuccess(res, {
      statusCode: 200,
      data: result.items,
      total: result.total,
    });
  } catch (err) {
    next(err);
  }
};

const reviewFlag = async (req, res, next) => {
  try {
    const result = await doctorPresenceService.reviewFlag(req.params.id, req.body, req.user);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Operational review action recorded successfully.",
      data: result.flag,
      review: result.review,
    });
  } catch (err) {
    next(err);
  }
};

const dismissFlag = async (req, res, next) => {
  try {
    const result = await doctorPresenceService.reviewFlag(
      req.params.id,
      { action: "DISMISS", explanationCategory: req.body.explanationCategory, reviewNotes: req.body.reviewNotes },
      req.user
    );
    return sendSuccess(res, {
      statusCode: 200,
      message: "Operational review flag dismissed with legitimate explanation.",
      data: result.flag,
    });
  } catch (err) {
    next(err);
  }
};

const resolveFlag = async (req, res, next) => {
  try {
    const result = await doctorPresenceService.reviewFlag(
      req.params.id,
      { action: "RESOLVE", explanationCategory: req.body.explanationCategory, reviewNotes: req.body.reviewNotes },
      req.user
    );
    return sendSuccess(res, {
      statusCode: 200,
      message: "Operational review flag marked resolved.",
      data: result.flag,
    });
  } catch (err) {
    next(err);
  }
};

const addReviewNote = async (req, res, next) => {
  try {
    const result = await doctorPresenceService.reviewFlag(
      req.params.id,
      { action: "ADD_NOTE", reviewNotes: req.body.notes || req.body.reviewNotes },
      req.user
    );
    return sendSuccess(res, {
      statusCode: 200,
      message: "Review note added successfully.",
      data: result.flag,
    });
  } catch (err) {
    next(err);
  }
};

const evaluatePresenceSignals = async (req, res, next) => {
  try {
    const result = await doctorPresenceService.evaluateOperationalSignals(req.body);
    return sendSuccess(res, {
      statusCode: 200,
      message: "Deterministic operational evaluation sweep completed.",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// 4. Summaries & AI
const getOperationalSummary = async (req, res, next) => {
  try {
    const { phcId, date } = req.query;
    const summary = await doctorPresenceService.getOperationalSummary(req.user, { phcId, date });
    return sendSuccess(res, {
      statusCode: 200,
      data: summary,
    });
  } catch (err) {
    next(err);
  }
};

const getAISummary = async (req, res, next) => {
  try {
    const summary = await aiService.summarizeDoctorPresenceFlag({ user: req.user });
    return sendSuccess(res, {
      statusCode: 200,
      data: summary,
    });
  } catch (err) {
    next(err);
  }
};

const getDoctorAttendance = async (req, res, next) => {
  try {
    const result = await doctorPresenceService.getDoctorAttendanceHistory(req.user, req.query);
    return sendSuccess(res, {
      statusCode: 200,
      data: result.items,
      total: result.total,
    });
  } catch (err) {
    next(err);
  }
};

// Legacy compatibility handlers
const getDutySessions = async (req, res, next) => {
  try {
    const { doctor_id, facility_id, status, date, limit } = req.query;
    const sessions = await doctorPresenceService.getDutySessions(req.user, {
      doctor_id,
      facility_id,
      status,
      date,
      limit: limit ? parseInt(limit, 10) : 50,
    });
    return sendSuccess(res, { statusCode: 200, data: sessions });
  } catch (err) {
    next(err);
  }
};

const getDutySessionById = async (req, res, next) => {
  try {
    const session = await doctorPresenceService.getDutySessionById(req.user, req.params.id);
    return sendSuccess(res, { statusCode: 200, data: session });
  } catch (err) {
    next(err);
  }
};

const checkInDoctorSession = async (req, res, next) => {
  try {
    const session = await doctorPresenceService.checkInDoctorSession(req.user, req.body);
    return sendSuccess(res, { statusCode: 201, message: "Doctor check-in recorded successfully.", data: session });
  } catch (err) {
    next(err);
  }
};

const checkOutDoctorSession = async (req, res, next) => {
  try {
    const session = await doctorPresenceService.checkOutDoctorSession(req.user, req.params.id, req.body);
    return sendSuccess(res, { statusCode: 200, message: "Doctor check-out completed successfully.", data: session });
  } catch (err) {
    next(err);
  }
};

const getPresenceSignals = async (req, res, next) => {
  try {
    const { doctor_id, facility_id, status, severity } = req.query;
    const signals = await doctorPresenceService.getPresenceSignals(req.user, {
      doctor_id,
      facility_id,
      status,
      severity,
    });
    return sendSuccess(res, { statusCode: 200, data: signals });
  } catch (err) {
    next(err);
  }
};

const reviewPresenceSignal = async (req, res, next) => {
  try {
    const result = await doctorPresenceService.reviewPresenceSignal(req.user, req.params.id, req.body);
    return sendSuccess(res, {
      statusCode: 200,
      message: result.message,
      data: result.signal,
      review: result.review,
    });
  } catch (err) {
    next(err);
  }
};

const getPresenceAnalytics = async (req, res, next) => {
  try {
    const { facility_id } = req.query;
    const analytics = await doctorPresenceService.getPresenceAnalytics(req.user, { facility_id });
    return sendSuccess(res, { statusCode: 200, data: analytics });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createSchedule,
  listSchedules,
  cancelSchedule,
  checkInDoctor,
  checkOutDoctor,
  getCurrentSession,
  getOperationalFlags,
  reviewFlag,
  dismissFlag,
  resolveFlag,
  addReviewNote,
  evaluatePresenceSignals,
  getOperationalSummary,
  getAISummary,
  getDoctorAttendance,
  getDutySessions,
  getDutySessionById,
  checkInDoctorSession,
  checkOutDoctorSession,
  getPresenceSignals,
  reviewPresenceSignal,
  getPresenceAnalytics,
};
