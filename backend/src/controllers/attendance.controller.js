/**
 * Doctor Attendance & Integrity Controller
 * JeevanSetu Phase 21
 */

const attendanceService = require("../services/attendance.service");

/**
 * Get Attendance Records (scoped by role)
 */
const getAttendanceRecords = async (req, res) => {
  try {
    const { doctor_id, phc_id, date, status, review_status, mismatch_status, limit, offset } = req.query;
    const result = await attendanceService.getAttendanceRecords(req.user, {
      doctor_id,
      phc_id,
      date,
      status,
      review_status,
      mismatch_status,
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
    });
    return res.json({ success: true, ...result });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({ success: false, error: err.message });
  }
};

/**
 * Get Single Attendance Record
 */
const getAttendanceById = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await attendanceService.getAttendanceById(req.user, id);
    return res.json({ success: true, data: record });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({ success: false, error: err.message });
  }
};

/**
 * Record Doctor Check-In
 */
const recordCheckIn = async (req, res) => {
  try {
    const { doctor_id, phc_id, scheduled_start, scheduled_end, method, notes } = req.body;
    const record = await attendanceService.recordCheckIn(req.user, {
      doctor_id,
      phc_id,
      scheduled_start,
      scheduled_end,
      method,
      notes,
    });
    return res.status(201).json({ success: true, data: record });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({ success: false, error: err.message });
  }
};

/**
 * Record Doctor Check-Out
 */
const recordCheckOut = async (req, res) => {
  try {
    const { attendance_id, notes } = req.body;
    const record = await attendanceService.recordCheckOut(req.user, {
      attendance_id,
      notes,
    });
    return res.json({ success: true, data: record });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({ success: false, error: err.message });
  }
};

/**
 * Submit Explanation for Mismatch / Operational Duty
 */
const submitExplanation = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, notes } = req.body;
    const record = await attendanceService.submitExplanation(req.user, id, {
      category,
      notes,
    });
    return res.json({ success: true, data: record });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({ success: false, error: err.message });
  }
};

/**
 * Administrative Review of Attendance Record
 */
const reviewAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, decision, notes } = req.body;
    const record = await attendanceService.reviewAttendance(req.user, id, {
      status,
      decision,
      notes,
    });
    return res.json({ success: true, data: record });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({ success: false, error: err.message });
  }
};

/**
 * Record Retroactive Attendance Entry (Audited Manual Past Entry)
 */
const recordRetroactiveAttendance = async (req, res) => {
  try {
    const record = await attendanceService.recordRetroactiveAttendance(req.user, req.body);
    return res.status(201).json({ success: true, data: record });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({ success: false, error: err.message });
  }
};

/**
 * Get Attendance Analytics
 */
const getAttendanceAnalytics = async (req, res) => {
  try {
    const { phc_id, date } = req.query;
    const analytics = await attendanceService.getAttendanceAnalytics(req.user, { phc_id, date });
    return res.json({ success: true, data: analytics });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({ success: false, error: err.message });
  }
};

module.exports = {
  getAttendanceRecords,
  getAttendanceById,
  recordCheckIn,
  recordCheckOut,
  submitExplanation,
  reviewAttendance,
  recordRetroactiveAttendance,
  getAttendanceAnalytics,
};
