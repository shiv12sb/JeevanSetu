/**
 * Doctor Presence & PHC Attendance Integrity Service
 * JeevanSetu Phase 21
 */

const { supabase, isConfigured } = require("../config/supabase");
const auditService = require("./audit.service");
const notificationService = require("./notification.service");

// In-memory Mock Store for Doctor Attendance when running tests or local preview
let mockAttendanceStore = [
  {
    id: "att-101",
    doctor_id: "doc-1",
    phc_id: "phc-1",
    attendance_date: new Date().toISOString().split("T")[0],
    scheduled_start: new Date(Date.now() - 4 * 3600000).toISOString(),
    scheduled_end: new Date(Date.now() + 4 * 3600000).toISOString(),
    check_in_at: null,
    check_out_at: null,
    status: "SCHEDULED",
    check_in_method: "AUTHENTICATED_APP",
    duty_duration_minutes: 228,
    cases_created: 8,
    cases_triaged: 8,
    vitals_recorded: 7,
    referrals_created: 1,
    clinical_activity_count: 16,
    mismatch_status: "NORMAL_ACTIVITY",
    explanation_category: null,
    explanation_notes: null,
    review_status: "NORMAL",
    review_notes: null,
    reviewed_by: null,
    reviewed_at: null,
    is_retroactive: false,
    retroactive_reason: null,
    notes: "Regular morning and afternoon OPD session",
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    doctors: {
      id: "doc-1",
      full_name: "Dr. Ananya Deshmukh",
      specialization: "General Medicine / Medical Officer",
    },
    phcs: { id: "phc-1", name: "Ashti Primary Health Centre", facility_code: "PHC-MH-2041" },
  },
  {
    id: "att-102",
    doctor_id: "doc-3",
    phc_id: "phc-1",
    attendance_date: new Date().toISOString().split("T")[0],
    scheduled_start: new Date(Date.now() - 5 * 3600000).toISOString(),
    scheduled_end: new Date(Date.now() + 3 * 3600000).toISOString(),
    check_in_at: new Date(Date.now() - 4.9 * 3600000).toISOString(),
    check_out_at: null,
    status: "CHECKED_IN",
    check_in_method: "AUTHENTICATED_APP",
    duty_duration_minutes: 294,
    cases_created: 0,
    cases_triaged: 0,
    vitals_recorded: 0,
    referrals_created: 0,
    clinical_activity_count: 0,
    mismatch_status: "LOW_RECORDED_ACTIVITY",
    explanation_category: null,
    explanation_notes: null,
    review_status: "FLAGGED",
    review_notes: null,
    reviewed_by: null,
    reviewed_at: null,
    is_retroactive: false,
    retroactive_reason: null,
    notes: "No recorded clinical activity during duty window",
    created_at: new Date(Date.now() - 6 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    doctors: {
      id: "doc-3",
      full_name: "Dr. Priya Sharma",
      specialization: "Pediatrics & Neonatal Care",
    },
    phcs: { id: "phc-1", name: "Ashti Primary Health Centre", facility_code: "PHC-MH-2041" },
  },
];

let mockReviewsStore = [];

class AttendanceService {
  /**
   * Helper to verify user role and scope
   */
  _validateAccess(user) {
    if (!user) {
      const err = new Error("Authentication required");
      err.statusCode = 401;
      throw err;
    }
    if (user.role === "patient") {
      const err = new Error("Access forbidden: Patients cannot access doctor attendance data.");
      err.statusCode = 403;
      throw err;
    }
  }

  /**
   * Record Doctor Check-In with verified server timestamp
   */
  async recordCheckIn(user, { doctor_id, phc_id, scheduled_start, scheduled_end, method = "AUTHENTICATED_APP", notes }) {
    this._validateAccess(user);

    // If doctor role, ensure they are checking in for themselves
    if (user.role === "doctor") {
      if (user.doctor_id && user.doctor_id !== doctor_id) {
        const err = new Error("Forbidden: Doctors can only record check-in for their own schedule.");
        err.statusCode = 403;
        throw err;
      }
    }

    // If PHC staff, ensure it is their facility
    if (user.role === "phc_staff") {
      const userPhc = user.assigned_phc_id || user.assignedPhcId;
      if (userPhc && phc_id && userPhc !== phc_id) {
        const err = new Error("Forbidden: Not authorized to record check-in for another facility.");
        err.statusCode = 403;
        throw err;
      }
    }

    const todayDate = new Date().toISOString().split("T")[0];
    const serverTimestamp = new Date().toISOString();

    // Prevent duplicate active check-ins for the same doctor today
    let existing = null;
    if (!isConfigured) {
      existing = mockAttendanceStore.find(
        (a) => a.doctor_id === doctor_id && a.attendance_date === todayDate && a.check_in_at && !a.check_out_at
      );
    } else {
      const { data } = await supabase
        .from("doctor_attendance")
        .select("*")
        .eq("doctor_id", doctor_id)
        .eq("attendance_date", todayDate)
        .not("check_in_at", "is", null)
        .is("check_out_at", null)
        .single();
      existing = data;
    }

    if (existing) {
      const err = new Error("Conflict: Doctor is already checked in for today's duty session.");
      err.statusCode = 409;
      throw err;
    }

    // Default scheduled times if not provided
    const schedStart = scheduled_start ? new Date(scheduled_start) : new Date(Date.now() - 30 * 60000);
    const schedEnd = scheduled_end ? new Date(scheduled_end) : new Date(schedStart.getTime() + 8 * 3600000);

    // Server-side Late Detection: > 15 minutes past scheduled start
    const isLate = new Date(serverTimestamp).getTime() - schedStart.getTime() > 15 * 60000;
    const status = isLate ? "LATE" : "CHECKED_IN";
    const mismatch_status = isLate ? "LATE_CHECK_IN" : "NORMAL_ACTIVITY";

    const attendanceRecord = {
      id: `att-${Date.now()}`,
      doctor_id: doctor_id || "doc-1",
      phc_id: phc_id || "phc-1",
      attendance_date: todayDate,
      scheduled_start: schedStart.toISOString(),
      scheduled_end: schedEnd.toISOString(),
      check_in_at: serverTimestamp,
      check_out_at: null,
      status,
      check_in_method: method || "AUTHENTICATED_APP",
      duty_duration_minutes: 0,
      cases_created: 0,
      cases_triaged: 0,
      vitals_recorded: 0,
      referrals_created: 0,
      clinical_activity_count: 0,
      mismatch_status,
      explanation_category: null,
      explanation_notes: null,
      review_status: "NORMAL",
      review_notes: null,
      reviewed_by: null,
      reviewed_at: null,
      is_retroactive: false,
      retroactive_reason: null,
      notes: notes || null,
      created_at: serverTimestamp,
      updated_at: serverTimestamp,
    };

    if (!isConfigured) {
      mockAttendanceStore.unshift(attendanceRecord);
    } else {
      const { data, error } = await supabase
        .from("doctor_attendance")
        .insert(attendanceRecord)
        .select()
        .single();
      if (error) throw error;
      Object.assign(attendanceRecord, data);
    }

    // Audit log
    await auditService.logAuditEvent({
      actor_id: user.id || user.profileId || "system",
      action: "DOCTOR_CHECK_IN",
      entity_type: "doctor_attendance",
      entity_id: attendanceRecord.id,
      metadata: {
        doctor_id,
        phc_id,
        status,
        check_in_at: serverTimestamp,
        is_late: isLate,
      },
    });

    return attendanceRecord;
  }

  /**
   * Record Doctor Check-Out with server-side duration calculation and activity correlation
   */
  async recordCheckOut(user, { attendance_id, notes }) {
    this._validateAccess(user);

    let record = null;
    if (!isConfigured) {
      record = mockAttendanceStore.find((a) => a.id === attendance_id);
    } else {
      const { data, error } = await supabase
        .from("doctor_attendance")
        .select("*")
        .eq("id", attendance_id)
        .single();
      if (error || !data) {
        const err = new Error("Attendance record not found");
        err.statusCode = 404;
        throw err;
      }
      record = data;
    }

    if (!record) {
      const err = new Error("Attendance record not found");
      err.statusCode = 404;
      throw err;
    }

    // Validation: Checkout without check-in is rejected
    if (!record.check_in_at) {
      const err = new Error("Invalid operation: Cannot checkout without prior check-in.");
      err.statusCode = 400;
      throw err;
    }

    if (record.check_out_at) {
      const err = new Error("Invalid operation: Duty session is already checked out.");
      err.statusCode = 400;
      throw err;
    }

    const serverTimestamp = new Date().toISOString();
    const checkInTime = new Date(record.check_in_at).getTime();
    const checkOutTime = new Date(serverTimestamp).getTime();

    // Impossible timestamp check
    if (checkOutTime < checkInTime) {
      const err = new Error("Invalid timestamps: Checkout time cannot precede check-in time.");
      err.statusCode = 400;
      throw err;
    }

    const dutyDurationMinutes = Math.max(0, Math.round((checkOutTime - checkInTime) / 60000));
    const schedEnd = new Date(record.scheduled_end).getTime();

    // Early checkout detection: > 30 minutes before scheduled end
    const isEarly = schedEnd - checkOutTime > 30 * 60000;
    const status = isEarly ? "EARLY_CHECKOUT" : "CHECKED_OUT";

    // Correlate clinical activity during duty window
    const activity = await this.correlateClinicalActivity(record);
    const { mismatch_status, review_status } = this.evaluateMismatch({
      ...record,
      status,
      check_out_at: serverTimestamp,
    }, activity);

    const updatePayload = {
      check_out_at: serverTimestamp,
      status,
      duty_duration_minutes: dutyDurationMinutes,
      cases_created: activity.cases_created,
      cases_triaged: activity.cases_triaged,
      vitals_recorded: activity.vitals_recorded,
      referrals_created: activity.referrals_created,
      clinical_activity_count: activity.clinical_activity_count,
      mismatch_status,
      review_status,
      notes: notes || record.notes,
      updated_at: serverTimestamp,
    };

    Object.assign(record, updatePayload);

    if (isConfigured) {
      await supabase
        .from("doctor_attendance")
        .update(updatePayload)
        .eq("id", attendance_id);
    }

    // Audit log
    await auditService.logAuditEvent({
      actor_id: user.id || user.profileId || "system",
      action: "DOCTOR_CHECK_OUT",
      entity_type: "doctor_attendance",
      entity_id: attendance_id,
      metadata: {
        doctor_id: record.doctor_id,
        duty_duration_minutes: dutyDurationMinutes,
        clinical_activity_count: activity.clinical_activity_count,
        mismatch_status,
        review_status,
      },
    });

    return record;
  }

  /**
   * Correlate clinical activity (cases, vitals, referrals) strictly within the duty window
   */
  async correlateClinicalActivity(record) {
    if (!record) return { cases_created: 0, cases_triaged: 0, vitals_recorded: 0, referrals_created: 0, clinical_activity_count: 0 };

    const startTime = new Date(record.check_in_at || record.scheduled_start);
    const endTime = record.check_out_at ? new Date(record.check_out_at) : new Date();

    if (!isConfigured) {
      // In mock/test environment, return realistic counts
      const hasMockActivity = record.clinical_activity_count > 0 || (record.cases_created || 0) > 0;
      if (hasMockActivity) {
        return {
          cases_created: record.cases_created || 6,
          cases_triaged: record.cases_triaged || 6,
          vitals_recorded: record.vitals_recorded || 5,
          referrals_created: record.referrals_created || 1,
          clinical_activity_count: (record.cases_created || 6) + (record.vitals_recorded || 5),
        };
      }
      return {
        cases_created: record.cases_created || 0,
        cases_triaged: record.cases_triaged || 0,
        vitals_recorded: record.vitals_recorded || 0,
        referrals_created: record.referrals_created || 0,
        clinical_activity_count: record.clinical_activity_count || 0,
      };
    }

    try {
      // Query health_cases for this facility within window
      const { data: casesData } = await supabase
        .from("health_cases")
        .select("id, created_at")
        .eq("phc_id", record.phc_id)
        .gte("created_at", startTime.toISOString())
        .lte("created_at", endTime.toISOString());

      const cases_created = casesData ? casesData.length : 0;

      // Query health_case_vitals within window
      const { data: vitalsData } = await supabase
        .from("health_case_vitals")
        .select("id, recorded_at")
        .gte("recorded_at", startTime.toISOString())
        .lte("recorded_at", endTime.toISOString());

      const vitals_recorded = vitalsData ? vitalsData.length : 0;

      // Query referrals from facility within window
      const { data: refData } = await supabase
        .from("referrals")
        .select("id, created_at")
        .eq("originating_phc_id", record.phc_id)
        .gte("created_at", startTime.toISOString())
        .lte("created_at", endTime.toISOString());

      const referrals_created = refData ? refData.length : 0;
      const clinical_activity_count = cases_created + vitals_recorded + referrals_created;

      return {
        cases_created,
        cases_triaged: cases_created,
        vitals_recorded,
        referrals_created,
        clinical_activity_count,
      };
    } catch (e) {
      console.warn("[AttendanceService] Activity correlation fallback:", e.message);
      return {
        cases_created: record.cases_created || 0,
        cases_triaged: record.cases_triaged || 0,
        vitals_recorded: record.vitals_recorded || 0,
        referrals_created: record.referrals_created || 0,
        clinical_activity_count: 0,
        mismatch_status: "ACTIVITY_ASSOCIATION_UNAVAILABLE",
      };
    }
  }

  /**
   * Deterministic Mismatch Engine: Evaluates operational signals without accusations
   */
  evaluateMismatch(record, activity = {}) {
    const actCount = activity.clinical_activity_count || 0;

    // CASE 1: Checked in + activity = 0 -> LOW_RECORDED_ACTIVITY, FLAGGED
    if ((record.status === "CHECKED_IN" || record.status === "CHECKED_OUT" || record.status === "LATE") && actCount === 0) {
      return {
        mismatch_status: "LOW_RECORDED_ACTIVITY",
        review_status: record.review_status === "EXPLAINED" ? "EXPLAINED" : "FLAGGED",
      };
    }

    // CASE 3: Scheduled duty but missing check-in past start
    if (record.status === "SCHEDULED" && !record.check_in_at) {
      const isOverdue = Date.now() - new Date(record.scheduled_start).getTime() > 30 * 60000;
      if (isOverdue) {
        return {
          mismatch_status: "ATTENDANCE_NOT_RECORDED",
          review_status: "FLAGGED",
        };
      }
    }

    // CASE 4: Late check-in
    if (record.status === "LATE") {
      return {
        mismatch_status: "LATE_CHECK_IN",
        review_status: record.review_status || "NORMAL",
      };
    }

    // CASE 5: Early checkout
    if (record.status === "EARLY_CHECKOUT") {
      return {
        mismatch_status: "EARLY_CHECKOUT",
        review_status: record.review_status || "NORMAL",
      };
    }

    // CASE 2: Checked in + activity > 0
    if (actCount > 0) {
      return {
        mismatch_status: "NORMAL_ACTIVITY",
        review_status: record.review_status === "FLAGGED" ? "NORMAL" : (record.review_status || "NORMAL"),
      };
    }

    return {
      mismatch_status: "NORMAL_ACTIVITY",
      review_status: record.review_status || "NORMAL",
    };
  }

  /**
   * Submit legitimate explanation for operational mismatch
   */
  async submitExplanation(user, attendance_id, { category = "OUTREACH", notes }) {
    this._validateAccess(user);

    const validCategories = [
      "OUTREACH",
      "ADMINISTRATIVE_DUTY",
      "EMERGENCY_DUTY",
      "TRAINING",
      "LEAVE",
      "SYSTEM_ISSUE",
      "OTHER",
    ];

    if (!validCategories.includes(category)) {
      const err = new Error(`Invalid explanation category. Must be one of: ${validCategories.join(", ")}`);
      err.statusCode = 400;
      throw err;
    }

    let record = null;
    if (!isConfigured) {
      record = mockAttendanceStore.find((a) => a.id === attendance_id);
    } else {
      const { data, error } = await supabase
        .from("doctor_attendance")
        .select("*")
        .eq("id", attendance_id)
        .single();
      if (error || !data) {
        const err = new Error("Attendance record not found");
        err.statusCode = 404;
        throw err;
      }
      record = data;
    }

    if (!record) {
      const err = new Error("Attendance record not found");
      err.statusCode = 404;
      throw err;
    }

    // Scope check: Doctor or PHC staff or Admin
    if (user.role === "phc_staff") {
      const userPhc = user.assigned_phc_id || user.assignedPhcId;
      if (userPhc && record.phc_id && userPhc !== record.phc_id) {
        const err = new Error("Forbidden: Not authorized for another facility.");
        err.statusCode = 403;
        throw err;
      }
    }

    const updatedData = {
      explanation_category: category,
      explanation_notes: notes || `Operational duty: ${category}`,
      review_status: "EXPLAINED",
      updated_at: new Date().toISOString(),
    };

    Object.assign(record, updatedData);

    if (isConfigured) {
      await supabase
        .from("doctor_attendance")
        .update(updatedData)
        .eq("id", attendance_id);
    }

    // Record review ledger
    const reviewLog = {
      id: `rev-${Date.now()}`,
      attendance_id,
      reviewer_id: user.id || user.profileId || "system",
      previous_review_status: record.review_status,
      new_review_status: "EXPLAINED",
      review_decision: "EXPLAINED",
      reason: notes || `Duty explanation submitted: ${category}`,
      created_at: new Date().toISOString(),
    };
    mockReviewsStore.push(reviewLog);

    if (isConfigured) {
      await supabase.from("doctor_attendance_reviews").insert(reviewLog);
    }

    // Audit log
    await auditService.logAuditEvent({
      actor_id: user.id || user.profileId || "system",
      action: "ATTENDANCE_EXPLANATION_SUBMITTED",
      entity_type: "doctor_attendance",
      entity_id: attendance_id,
      metadata: { category, notes, new_review_status: "EXPLAINED" },
    });

    return record;
  }

  /**
   * Human Administrative Review Workflow (UNDER_REVIEW, CONFIRMED, DISMISSED)
   */
  async reviewAttendance(user, attendance_id, { status = "UNDER_REVIEW", decision, notes }) {
    this._validateAccess(user);

    if (user.role !== "district_admin" && user.role !== "phc_staff") {
      const err = new Error("Forbidden: Only authorized administrators or supervisors can review attendance.");
      err.statusCode = 403;
      throw err;
    }

    const validStatuses = ["UNDER_REVIEW", "EXPLAINED", "CONFIRMED", "DISMISSED"];
    if (!validStatuses.includes(status)) {
      const err = new Error(`Invalid review status. Must be one of: ${validStatuses.join(", ")}`);
      err.statusCode = 400;
      throw err;
    }

    // Only District Admin can CONFIRM an operational gap
    if (status === "CONFIRMED" && user.role !== "district_admin") {
      const err = new Error("Forbidden: Only District Administrators can confirm operational attendance issues.");
      err.statusCode = 403;
      throw err;
    }

    let record = null;
    if (!isConfigured) {
      record = mockAttendanceStore.find((a) => a.id === attendance_id);
    } else {
      const { data, error } = await supabase
        .from("doctor_attendance")
        .select("*")
        .eq("id", attendance_id)
        .single();
      if (error || !data) {
        const err = new Error("Attendance record not found");
        err.statusCode = 404;
        throw err;
      }
      record = data;
    }

    if (!record) {
      const err = new Error("Attendance record not found");
      err.statusCode = 404;
      throw err;
    }

    const previousStatus = record.review_status;
    const updatedData = {
      review_status: status,
      review_notes: notes || `Reviewed by ${user.role}: ${status}`,
      reviewed_by: user.id || user.profileId || null,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    Object.assign(record, updatedData);

    if (isConfigured) {
      await supabase
        .from("doctor_attendance")
        .update(updatedData)
        .eq("id", attendance_id);
    }

    // Review audit trail
    const reviewLog = {
      id: `rev-${Date.now()}`,
      attendance_id,
      reviewer_id: user.id || user.profileId || "admin",
      previous_review_status: previousStatus,
      new_review_status: status,
      review_decision: decision || status,
      reason: notes || `Status changed to ${status}`,
      created_at: new Date().toISOString(),
    };
    mockReviewsStore.push(reviewLog);

    if (isConfigured) {
      await supabase.from("doctor_attendance_reviews").insert(reviewLog);
    }

    // Audit log
    await auditService.logAuditEvent({
      actor_id: user.id || user.profileId || "system",
      action: "ATTENDANCE_REVIEW_UPDATED",
      entity_type: "doctor_attendance",
      entity_id: attendance_id,
      metadata: { previous_status: previousStatus, new_status: status, notes },
    });

    return record;
  }

  /**
   * Retroactive Attendance Entry (Audited Manual Past-Date Entry)
   */
  async recordRetroactiveAttendance(user, { doctor_id, phc_id, attendance_date, scheduled_start, scheduled_end, check_in_at, check_out_at, reason, notes }) {
    this._validateAccess(user);

    if (user.role !== "district_admin" && user.role !== "phc_staff") {
      const err = new Error("Forbidden: Only PHC staff or District Admins can record retroactive attendance.");
      err.statusCode = 403;
      throw err;
    }

    if (!reason || !reason.trim()) {
      const err = new Error("Validation Error: Mandatory reason required for retroactive attendance.");
      err.statusCode = 400;
      throw err;
    }

    if (!attendance_date || new Date(attendance_date) > new Date()) {
      const err = new Error("Validation Error: Retroactive attendance must be for a past date.");
      err.statusCode = 400;
      throw err;
    }

    const checkInTime = check_in_at ? new Date(check_in_at).getTime() : new Date(scheduled_start).getTime();
    const checkOutTime = check_out_at ? new Date(check_out_at).getTime() : new Date(scheduled_end).getTime();

    if (checkOutTime < checkInTime) {
      const err = new Error("Invalid timestamps: Checkout time cannot precede check-in time.");
      err.statusCode = 400;
      throw err;
    }

    const dutyDurationMinutes = Math.max(0, Math.round((checkOutTime - checkInTime) / 60000));

    const attendanceRecord = {
      id: `att-retro-${Date.now()}`,
      doctor_id: doctor_id || "doc-1",
      phc_id: phc_id || "phc-1",
      attendance_date,
      scheduled_start: new Date(scheduled_start).toISOString(),
      scheduled_end: new Date(scheduled_end).toISOString(),
      check_in_at: new Date(checkInTime).toISOString(),
      check_out_at: new Date(checkOutTime).toISOString(),
      status: "CHECKED_OUT",
      check_in_method: "MANUAL",
      duty_duration_minutes: dutyDurationMinutes,
      cases_created: 0,
      cases_triaged: 0,
      vitals_recorded: 0,
      referrals_created: 0,
      clinical_activity_count: 0,
      mismatch_status: "NORMAL_ACTIVITY",
      explanation_category: "ADMINISTRATIVE_DUTY",
      explanation_notes: reason,
      review_status: "EXPLAINED",
      review_notes: `Retroactive entry: ${reason}`,
      reviewed_by: user.id || null,
      reviewed_at: new Date().toISOString(),
      is_retroactive: true,
      retroactive_reason: reason,
      notes: notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (!isConfigured) {
      mockAttendanceStore.unshift(attendanceRecord);
    } else {
      const { data, error } = await supabase
        .from("doctor_attendance")
        .insert(attendanceRecord)
        .select()
        .single();
      if (error) throw error;
      Object.assign(attendanceRecord, data);
    }

    // Audit log
    await auditService.logAuditEvent({
      actor_id: user.id || user.profileId || "system",
      action: "RETROACTIVE_ATTENDANCE_CREATED",
      entity_type: "doctor_attendance",
      entity_id: attendanceRecord.id,
      metadata: { doctor_id, phc_id, attendance_date, reason, is_retroactive: true },
    });

    return attendanceRecord;
  }

  /**
   * Query Attendance Records with Scoping and Filtering
   */
  async getAttendanceRecords(user, { doctor_id, phc_id, date, status, review_status, mismatch_status, limit = 50, offset = 0 } = {}) {
    this._validateAccess(user);

    let scopedDoctorId = doctor_id;
    let scopedPhcId = phc_id;

    if (user.role === "doctor") {
      scopedDoctorId = user.doctor_id || "doc-1";
    } else if (user.role === "phc_staff") {
      scopedPhcId = user.assigned_phc_id || user.assignedPhcId || "phc-1";
    }

    if (!isConfigured) {
      let filtered = [...mockAttendanceStore];
      if (scopedDoctorId) filtered = filtered.filter((a) => a.doctor_id === scopedDoctorId);
      if (scopedPhcId) filtered = filtered.filter((a) => a.phc_id === scopedPhcId);
      if (date) filtered = filtered.filter((a) => a.attendance_date === date);
      if (status) filtered = filtered.filter((a) => a.status === status);
      if (review_status) filtered = filtered.filter((a) => a.review_status === review_status);
      if (mismatch_status) filtered = filtered.filter((a) => a.mismatch_status === mismatch_status);

      return {
        data: filtered.slice(offset, offset + limit),
        total: filtered.length,
        limit,
        offset,
      };
    }

    let query = supabase.from("doctor_attendance").select("*, doctors(id, full_name, specialization), phcs(id, name, facility_code)", { count: "exact" });
    if (scopedDoctorId) query = query.eq("doctor_id", scopedDoctorId);
    if (scopedPhcId) query = query.eq("phc_id", scopedPhcId);
    if (date) query = query.eq("attendance_date", date);
    if (status) query = query.eq("status", status);
    if (review_status) query = query.eq("review_status", review_status);
    if (mismatch_status) query = query.eq("mismatch_status", mismatch_status);

    query = query.order("scheduled_start", { ascending: false }).range(offset, offset + limit - 1);
    const { data, count, error } = await query;
    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
      limit,
      offset,
    };
  }

  /**
   * Get single attendance record by ID
   */
  async getAttendanceById(user, id) {
    this._validateAccess(user);

    let record = null;
    if (!isConfigured) {
      record = mockAttendanceStore.find((a) => a.id === id);
    } else {
      const { data, error } = await supabase
        .from("doctor_attendance")
        .select("*, doctors(id, full_name, specialization), phcs(id, name, facility_code)")
        .eq("id", id)
        .single();
      if (error || !data) {
        const err = new Error("Attendance record not found");
        err.statusCode = 404;
        throw err;
      }
      record = data;
    }

    if (!record) {
      const err = new Error("Attendance record not found");
      err.statusCode = 404;
      throw err;
    }

    // Role-scoping check
    if (user.role === "doctor" && user.doctor_id && record.doctor_id !== user.doctor_id) {
      const err = new Error("Forbidden: Not authorized to view another doctor's attendance record.");
      err.statusCode = 403;
      throw err;
    }
    if (user.role === "phc_staff") {
      const userPhc = user.assigned_phc_id || user.assignedPhcId;
      if (userPhc && record.phc_id && userPhc !== record.phc_id) {
        const err = new Error("Forbidden: Not authorized to view attendance for another facility.");
        err.statusCode = 403;
        throw err;
      }
    }

    return record;
  }

  /**
   * Aggregate Attendance Analytics
   */
  async getAttendanceAnalytics(user, { phc_id, date } = {}) {
    this._validateAccess(user);

    const recordsRes = await this.getAttendanceRecords(user, { phc_id, date, limit: 500 });
    const records = recordsRes.data || [];

    const total_scheduled = records.length;
    const checked_in = records.filter((r) => r.status === "CHECKED_IN" || r.status === "LATE").length;
    const checked_out = records.filter((r) => r.status === "CHECKED_OUT" || r.status === "EARLY_CHECKOUT").length;
    const late_checkins = records.filter((r) => r.status === "LATE" || r.mismatch_status === "LATE_CHECK_IN").length;
    const early_checkouts = records.filter((r) => r.status === "EARLY_CHECKOUT" || r.mismatch_status === "EARLY_CHECKOUT").length;
    const not_checked_in = records.filter((r) => r.status === "SCHEDULED" && !r.check_in_at).length;
    const review_required = records.filter((r) => r.review_status === "FLAGGED" || r.review_status === "UNDER_REVIEW").length;
    const explained = records.filter((r) => r.review_status === "EXPLAINED").length;
    const confirmed_issues = records.filter((r) => r.review_status === "CONFIRMED").length;
    const dismissed = records.filter((r) => r.review_status === "DISMISSED").length;
    const total_clinical_activity = records.reduce((acc, r) => acc + (r.clinical_activity_count || 0), 0);

    return {
      total_scheduled,
      checked_in,
      checked_out,
      not_checked_in,
      late_checkins,
      early_checkouts,
      review_required,
      explained,
      confirmed_issues,
      dismissed,
      total_clinical_activity,
      summary_date: date || new Date().toISOString().split("T")[0],
    };
  }

  /**
   * Automated Scheduled Attendance Monitoring Sweep
   */
  async runScheduledAttendanceSweep() {
    try {
      const today = new Date().toISOString().split("T")[0];
      let records = [];

      if (!isConfigured) {
        records = mockAttendanceStore.filter((a) => a.attendance_date === today);
      } else {
        const { data } = await supabase
          .from("doctor_attendance")
          .select("*")
          .eq("attendance_date", today);
        records = data || [];
      }

      let alertsGenerated = 0;
      for (const rec of records) {
        // Missing Check-in check (> 30 mins past scheduled start)
        if (rec.status === "SCHEDULED" && !rec.check_in_at) {
          const isOverdue = Date.now() - new Date(rec.scheduled_start).getTime() > 30 * 60000;
          if (isOverdue && rec.review_status !== "FLAGGED") {
            rec.mismatch_status = "ATTENDANCE_NOT_RECORDED";
            rec.review_status = "FLAGGED";
            alertsGenerated++;

            // Dispatch deduplicated notification to PHC staff
            await notificationService.createNotification({
              recipient_id: rec.phc_id,
              title: "Attendance Record Requires Review",
              message: "Scheduled doctor duty has no check-in recorded past the grace window. Please verify duty roster.",
              type: "ATTENDANCE_REVIEW_REQUIRED",
              priority: "MEDIUM",
              dedup_key: `att_missing_${rec.id}_${today}`,
            });
          }
        }
      }

      return {
        success: true,
        sweptCount: records.length,
        alertsGenerated,
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      console.error("[AttendanceService] Scheduled sweep error:", err.message);
      return { success: false, error: err.message };
    }
  }
}

module.exports = new AttendanceService();
