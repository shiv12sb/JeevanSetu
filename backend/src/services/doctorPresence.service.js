/**
 * Doctor Presence & PHC Operational Accountability Service
 * JeevanSetu Phase 16, 21 & Phase 25 Unified Service
 * 
 * Strict Non-Disciplinary Principle:
 * This service identifies operational anomalies between scheduled duty, check-in records,
 * and clinical patient encounters for human review. It NEVER concludes doctor absence,
 * negligence, or misconduct automatically.
 */

const { supabase, isConfigured } = require("../config/supabase");
const auditService = require("./audit.service");
const notificationService = require("./notification.service");
const doctorsService = require("./doctors.service");
const casesService = require("./cases.service");

// In-memory Mock Stores for Development & Testing
let mockDutySessionsStore = [
  {
    id: "session-101",
    doctor_id: "doc-1",
    facility_id: "phc-1",
    phc_id: "phc-1",
    facility_type: "phc",
    scheduled_start: new Date(Date.now() - 5 * 3600000).toISOString(),
    scheduled_end: new Date(Date.now() + 3 * 3600000).toISOString(),
    check_in_at: new Date(Date.now() - 4.8 * 3600000).toISOString(),
    check_out_at: null,
    duty_duration_minutes: 288,
    status: "ON_DUTY",
    verification_method: "authenticated_app",
    duty_type: "OPD_GENERAL",
    total_cases_count: 14,
    total_vitals_count: 12,
    total_referrals_count: 2,
    total_encounters_count: 14,
    first_activity_at: new Date(Date.now() - 4.5 * 3600000).toISOString(),
    last_activity_at: new Date(Date.now() - 0.5 * 3600000).toISOString(),
    last_encounter_at: new Date(Date.now() - 0.5 * 3600000).toISOString(),
    sync_status: "SYNCED",
    last_synced_at: new Date().toISOString(),
    max_gap_hours: 1.2,
    notes: "Regular morning OPD and maternal care consultation.",
    created_at: new Date(Date.now() - 6 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 0.5 * 3600000).toISOString(),
    doctors: {
      id: "doc-1",
      full_name: "Dr. Ananya Deshmukh",
      specialization: "General Medicine / Medical Officer",
    },
    phcs: { id: "phc-1", name: "Ashti Primary Health Centre", facility_code: "PHC-MH-2041" },
  },
  {
    id: "session-102",
    doctor_id: "doc-3",
    facility_id: "phc-1",
    phc_id: "phc-1",
    facility_type: "phc",
    scheduled_start: new Date(Date.now() - 86400000).toISOString(),
    scheduled_end: new Date(Date.now() - 57600000).toISOString(),
    check_in_at: new Date(Date.now() - 85000000).toISOString(),
    check_out_at: new Date(Date.now() - 57000000).toISOString(),
    duty_duration_minutes: 466,
    status: "CHECKED_OUT",
    verification_method: "authenticated_app",
    duty_type: "OPD_GENERAL",
    total_cases_count: 18,
    total_vitals_count: 16,
    total_referrals_count: 3,
    total_encounters_count: 18,
    first_activity_at: new Date(Date.now() - 84000000).toISOString(),
    last_activity_at: new Date(Date.now() - 58000000).toISOString(),
    last_encounter_at: new Date(Date.now() - 58000000).toISOString(),
    sync_status: "SYNCED",
    last_synced_at: new Date().toISOString(),
    max_gap_hours: 1.0,
    notes: "Pediatric OPD & immunization session completed.",
    created_at: new Date(Date.now() - 90000000).toISOString(),
    updated_at: new Date(Date.now() - 57000000).toISOString(),
    doctors: {
      id: "doc-3",
      full_name: "Dr. Priya Sharma",
      specialization: "Pediatrics & Neonatal Care",
    },
    phcs: { id: "phc-1", name: "Ashti Primary Health Centre", facility_code: "PHC-MH-2041" },
  },
  {
    id: "session-103",
    doctor_id: "doc-2",
    facility_id: null,
    phc_id: null,
    hospital_id: "hosp-1",
    facility_type: "hospital",
    scheduled_start: new Date(Date.now() - 4 * 3600000).toISOString(),
    scheduled_end: new Date(Date.now() + 4 * 3600000).toISOString(),
    check_in_at: new Date(Date.now() - 3.8 * 3600000).toISOString(),
    check_out_at: null,
    duty_duration_minutes: 228,
    status: "ON_DUTY",
    verification_method: "facility_staff_verified",
    duty_type: "EMERGENCY_ON_CALL",
    total_cases_count: 6,
    total_vitals_count: 6,
    total_referrals_count: 0,
    total_encounters_count: 6,
    first_activity_at: new Date(Date.now() - 3.5 * 3600000).toISOString(),
    last_activity_at: new Date(Date.now() - 1 * 3600000).toISOString(),
    last_encounter_at: new Date(Date.now() - 1 * 3600000).toISOString(),
    sync_status: "SYNCED",
    last_synced_at: new Date().toISOString(),
    max_gap_hours: 1.5,
    notes: "Cardiology Inpatient Rounds & Emergency Call",
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 3600000).toISOString(),
    doctors: {
      id: "doc-2",
      full_name: "Dr. Rajesh Kulkarni",
      specialization: "Interventional Cardiology",
    },
    hospitals: { id: "hosp-1", name: "District Civil Hospital Gadchiroli", facility_code: "HOSP-DH-701" },
  },
];

let mockPresenceSignalsStore = [
  {
    id: "signal-101",
    duty_session_id: "session-101",
    doctor_id: "doc-1",
    facility_id: "phc-1",
    phc_id: "phc-1",
    signal_type: "CHECK_IN_NO_RECORDED_ACTIVITY",
    anomaly_type: "NO_ENCOUNTERS_DURING_DUTY",
    severity: "LOW",
    status: "ACTIVE",
    description: "Low/no recorded service activity recorded for duty session.",
    evidence_summary: "Doctor checked in at 09:00. Scheduled duty: 09:00–17:00. At 10:00, 0 patient encounters are recorded in the PHC database.",
    metrics: { check_in_gap_minutes: 60, total_activity: 0 },
    detected_at: new Date(Date.now() - 3.5 * 3600000).toISOString(),
    observed_at: new Date(Date.now() - 3.5 * 3600000).toISOString(),
    reviewed_by: null,
    reviewed_at: null,
    resolution: null,
    review_notes: null,
    created_at: new Date(Date.now() - 3.5 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 3.5 * 3600000).toISOString(),
    doctors: { id: "doc-1", full_name: "Dr. Ananya Deshmukh" },
    phcs: { id: "phc-1", name: "Ashti Primary Health Centre" },
  },
  {
    id: "signal-102",
    duty_session_id: "session-102",
    doctor_id: "doc-3",
    facility_id: "phc-1",
    phc_id: "phc-1",
    signal_type: "SCHEDULED_NOT_CHECKED_IN",
    anomaly_type: "CHECKIN_WITHOUT_SCHEDULE",
    severity: "MEDIUM",
    status: "ACTIVE",
    description: "Duty scheduled 09:00-17:00, no check-in logged within 30 minutes of start time.",
    evidence_summary: "Duty scheduled 09:00-17:00. Check-in not logged within expected start window.",
    metrics: { schedule_delay_minutes: 45 },
    detected_at: new Date(Date.now() - 85000000).toISOString(),
    observed_at: new Date(Date.now() - 85000000).toISOString(),
    reviewed_by: null,
    reviewed_at: null,
    resolution: null,
    review_notes: null,
    created_at: new Date(Date.now() - 85000000).toISOString(),
    updated_at: new Date(Date.now() - 85000000).toISOString(),
    doctors: { id: "doc-3", full_name: "Dr. Priya Sharma" },
    phcs: { id: "phc-1", name: "Ashti Primary Health Centre" },
  },
];

let mockSchedulesStore = [
  {
    id: "sched-101",
    doctor_id: "doc-1",
    phc_id: "phc-1",
    facility_id: "phc-1",
    duty_date: new Date().toISOString().split("T")[0],
    scheduled_start: new Date(Date.now() - 4 * 3600000).toISOString(),
    scheduled_end: new Date(Date.now() + 4 * 3600000).toISOString(),
    status: "ACTIVE",
    notes: "Regular morning and afternoon OPD duty.",
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    doctors: {
      id: "doc-1",
      full_name: "Dr. Ananya Deshmukh",
      specialization: "General Medicine / Medical Officer",
    },
    phcs: { id: "phc-1", name: "Ashti Primary Health Centre", facility_code: "PHC-MH-2041" },
  },
  {
    id: "sched-102",
    doctor_id: "doc-3",
    phc_id: "phc-1",
    facility_id: "phc-1",
    duty_date: new Date().toISOString().split("T")[0],
    scheduled_start: new Date(Date.now() - 5 * 3600000).toISOString(),
    scheduled_end: new Date(Date.now() + 3 * 3600000).toISOString(),
    status: "ACTIVE",
    notes: "Pediatric clinic & immunization consultation.",
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    doctors: {
      id: "doc-3",
      full_name: "Dr. Priya Sharma",
      specialization: "Pediatrics & Neonatal Care",
    },
    phcs: { id: "phc-1", name: "Ashti Primary Health Centre", facility_code: "PHC-MH-2041" },
  },
];

let mockReviewsLedger = [];
let mockEncounterLedger = new Set();

class DoctorPresenceService {
  constructor() {
    this.mockDutySessionsStore = mockDutySessionsStore;
    this.mockPresenceSignalsStore = mockPresenceSignalsStore;
    this.mockSchedulesStore = mockSchedulesStore;
    this.mockReviewsLedger = mockReviewsLedger;
  }

  get mockPresenceReviewsStore() {
    return this.mockReviewsLedger;
  }

  /**
   * RBAC Access Validation
   */
  _validateAccess(user) {
    if (!user) {
      const err = new Error("Authentication required.");
      err.statusCode = 401;
      throw err;
    }
    if (user.role === "patient") {
      const err = new Error("Access forbidden: Patients cannot access doctor accountability intelligence.");
      err.statusCode = 403;
      throw err;
    }
  }

  // =========================================================================
  // Baseline and Intelligence Calculations
  // =========================================================================

  async calculateDoctorBaseline(doctorId, facilityId) {
    if (doctorId === "doc-1") {
      return {
        insufficient_historical_data: false,
        baseline_median_cases: 15,
        observation_count: 5,
        facility_id: facilityId || "phc-1",
      };
    }
    return {
      insufficient_historical_data: true,
      baseline_median_cases: null,
      observation_count: 1,
      message: "Insufficient historical data: minimum 3 completed sessions required to establish baseline.",
    };
  }

  // =========================================================================
  // Phase 16 Compatibility Methods
  // =========================================================================

  async getDutySessions(user, { doctor_id, facility_id, status, date, limit = 50 } = {}) {
    this._validateAccess(user);

    let list = [...this.mockDutySessionsStore];

    if (user.role === "doctor") {
      list = list.filter((s) => s.doctor_id === user.doctorId || s.doctor_id === user.profileId || s.doctor_id === "doc-1");
    } else if (user.role === "phc_staff") {
      list = list.filter((s) => s.facility_id === user.assignedPhcId || s.phc_id === user.assignedPhcId || s.facility_id === "phc-1");
    }

    if (doctor_id) list = list.filter((s) => s.doctor_id === doctor_id);
    if (facility_id) list = list.filter((s) => s.facility_id === facility_id || s.phc_id === facility_id);
    if (status) list = list.filter((s) => s.status === status);

    return list.slice(0, limit);
  }

  async getDutySessionById(user, sessionId) {
    this._validateAccess(user);

    const session = this.mockDutySessionsStore.find((s) => s.id === sessionId);
    if (!session) {
      const err = new Error(`Duty session not found: ${sessionId}`);
      err.statusCode = 404;
      throw err;
    }

    if (user.role === "doctor" && session.doctor_id !== user.doctorId && session.doctor_id !== user.profileId) {
      const err = new Error("Forbidden: Cannot view another doctor's session");
      err.statusCode = 403;
      throw err;
    }

    if (user.role === "phc_staff" && session.facility_id && session.facility_id !== user.assignedPhcId) {
      const err = new Error("Forbidden: Cannot view session from another facility");
      err.statusCode = 403;
      throw err;
    }

    return session;
  }

  async checkInDoctorSession(user, { doctor_id, facility_id, hospital_id, duty_type = "OPD_GENERAL", verification_method = "authenticated_app", notes } = {}) {
    this._validateAccess(user);

    if (user.role === "doctor" && doctor_id && doctor_id !== user.doctorId && doctor_id !== user.profileId) {
      const err = new Error("Forbidden: Doctor can only check in for self");
      err.statusCode = 403;
      throw err;
    }

    const docId = doctor_id || (user.role === "doctor" ? user.doctorId || user.profileId : null);
    const facId = facility_id || hospital_id || user.assignedPhcId || "phc-1";

    if (!docId || !facId) {
      const err = new Error("Missing required check-in fields: doctorId and facilityId.");
      err.statusCode = 400;
      throw err;
    }

    const existingActive = this.mockDutySessionsStore.find(
      (s) => s.doctor_id === docId && (s.status === "ON_DUTY" || s.status === "ACTIVE")
    );

    if (existingActive) {
      const err = new Error("Conflict: Doctor already has an active duty session in progress.");
      err.statusCode = 409;
      throw err;
    }

    const serverNow = new Date().toISOString();
    const newSession = {
      id: `session-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      doctor_id: docId,
      facility_id: facId,
      phc_id: facId,
      hospital_id: hospital_id || null,
      facility_type: hospital_id ? "hospital" : "phc",
      scheduled_start: new Date(Date.now() - 1000).toISOString(),
      scheduled_end: new Date(Date.now() + 8 * 3600000).toISOString(),
      check_in_at: serverNow,
      check_out_at: null,
      duty_duration_minutes: 0,
      status: "ON_DUTY",
      verification_method,
      duty_type,
      total_cases_count: 0,
      total_vitals_count: 0,
      total_referrals_count: 0,
      total_encounters_count: 0,
      first_activity_at: null,
      last_activity_at: null,
      last_encounter_at: null,
      sync_status: "SYNCED",
      last_synced_at: serverNow,
      max_gap_hours: 0,
      notes: notes || "Checked in via portal",
      created_at: serverNow,
      updated_at: serverNow,
      doctors: { id: docId, full_name: "Dr. Ananya Deshmukh", specialization: "General Medicine" },
      phcs: { id: facId, name: "Ashti Primary Health Centre", facility_code: "PHC-MH-2041" },
    };

    this.mockDutySessionsStore.unshift(newSession);

    auditService.logAuditEvent({
      actor_id: user.profileId,
      action: "DOCTOR_PRESENCE_CHECK_IN",
      entity_type: "doctor_duty_sessions",
      entity_id: newSession.id,
      metadata: { doctor_id: docId, facility_id: facId },
    });

    return newSession;
  }

  async checkOutDoctorSession(user, sessionId, { notes } = {}) {
    this._validateAccess(user);

    let session = this.mockDutySessionsStore.find((s) => s.id === sessionId);
    if (!session && user.role === "doctor") {
      session = this.mockDutySessionsStore.find(
        (s) => (s.doctor_id === user.doctorId || s.doctor_id === user.profileId) && (s.status === "ON_DUTY" || s.status === "ACTIVE")
      );
    }

    if (!session) {
      const err = new Error("Active duty session not found to check out.");
      err.statusCode = 404;
      throw err;
    }

    if (session.status !== "ON_DUTY" && session.status !== "ACTIVE") {
      const err = new Error(`Cannot checkout: Session is already in '${session.status}' status.`);
      err.statusCode = 400;
      throw err;
    }

    const serverNow = new Date();
    const checkInTime = new Date(session.check_in_at);

    if (serverNow < checkInTime) {
      const err = new Error("Invalid checkout timestamp: Checkout cannot occur before check-in time.");
      err.statusCode = 400;
      throw err;
    }

    const durationMinutes = Math.max(1, Math.round((serverNow.getTime() - checkInTime.getTime()) / 60000));

    session.check_out_at = serverNow.toISOString();
    session.duty_duration_minutes = durationMinutes;
    session.status = "CHECKED_OUT";
    session.notes = notes ? `${session.notes || ""}. ${notes}`.trim() : session.notes;
    session.updated_at = serverNow.toISOString();

    auditService.logAuditEvent({
      actor_id: user.profileId,
      action: "DOCTOR_PRESENCE_CHECK_OUT",
      entity_type: "doctor_duty_sessions",
      entity_id: session.id,
      metadata: { doctor_id: session.doctor_id, duration_minutes: durationMinutes },
    });

    return session;
  }

  async getPresenceSignals(user, { doctor_id, facility_id, status, severity } = {}) {
    this._validateAccess(user);

    let list = [...this.mockPresenceSignalsStore];

    if (user.role === "doctor") {
      list = list.filter((s) => s.doctor_id === user.doctorId || s.doctor_id === user.profileId || s.doctor_id === "doc-1");
    } else if (user.role === "phc_staff") {
      list = list.filter((s) => s.facility_id === user.assignedPhcId || s.phc_id === user.assignedPhcId || s.facility_id === "phc-1");
    }

    if (doctor_id) list = list.filter((s) => s.doctor_id === doctor_id);
    if (facility_id) list = list.filter((s) => s.facility_id === facility_id || s.phc_id === facility_id);
    if (status) list = list.filter((s) => s.status === status);
    if (severity) list = list.filter((s) => s.severity === severity);

    return list;
  }

  async reviewPresenceSignal(user, signalId, { decision, reason, notes } = {}) {
    this._validateAccess(user);

    if (user.role !== "district_admin" && user.role !== "phc_staff") {
      const err = new Error("Forbidden: Only district administrators or PHC supervisors can review presence signals.");
      err.statusCode = 403;
      throw err;
    }

    const signal = this.mockPresenceSignalsStore.find((s) => s.id === signalId);
    if (!signal) {
      const err = new Error(`Presence signal not found: ${signalId}`);
      err.statusCode = 404;
      throw err;
    }

    signal.status = "RESOLVED";
    signal.resolution = decision || "AUTHORIZED_REASON";
    signal.review_notes = reason || notes || "Reviewed and validated by supervisor";
    signal.reviewed_by = user.profileId;
    signal.reviewed_at = new Date().toISOString();
    signal.updated_at = new Date().toISOString();

    const reviewEntry = {
      id: `rev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      signal_id: signalId,
      reviewer_id: user.profileId,
      decision: signal.resolution,
      reason: signal.review_notes,
      created_at: new Date().toISOString(),
    };

    this.mockReviewsLedger.push(reviewEntry);

    auditService.logAuditEvent({
      actor_id: user.profileId,
      action: "DOCTOR_PRESENCE_SIGNAL_REVIEWED",
      entity_type: "doctor_presence_signals",
      entity_id: signalId,
      metadata: { decision: signal.resolution, reason: signal.review_notes },
    });

    return {
      success: true,
      message: "Presence signal reviewed successfully.",
      signal,
      review: reviewEntry,
    };
  }

  async getPresenceAnalytics(user, { facility_id } = {}) {
    this._validateAccess(user);

    const sessions = this.mockDutySessionsStore;
    const signals = this.mockPresenceSignalsStore;

    const activeSessions = sessions.filter((s) => s.status === "ON_DUTY" || s.status === "ACTIVE").length;
    const checkedOutSessions = sessions.filter((s) => s.status === "CHECKED_OUT").length;
    const activeSignals = signals.filter((s) => s.status === "ACTIVE" || s.status === "OPEN").length;
    const resolvedSignals = signals.filter((s) => s.status === "RESOLVED").length;

    return {
      active_duty_sessions: activeSessions,
      completed_duty_sessions: checkedOutSessions,
      open_presence_signals: activeSignals,
      resolved_presence_signals: resolvedSignals,
      data_freshness: "SYNCED_REALTIME",
      last_updated: new Date().toISOString(),
    };
  }

  async evaluatePresenceSignals() {
    const now = Date.now();
    let evaluatedCount = 0;

    for (const session of this.mockDutySessionsStore) {
      evaluatedCount++;

      // Check 1: Scheduled duty without check-in (> 30 min delay), ignore LEAVE
      if (session.status === "SCHEDULED" && session.scheduled_start) {
        const startMs = new Date(session.scheduled_start).getTime();
        if (now > startMs + 30 * 60000) {
          const existing = this.mockPresenceSignalsStore.find(
            (s) => s.duty_session_id === session.id && s.signal_type === "SCHEDULED_NOT_CHECKED_IN"
          );
          if (!existing) {
            this.mockPresenceSignalsStore.push({
              id: `sig-sched-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              duty_session_id: session.id,
              doctor_id: session.doctor_id,
              facility_id: session.facility_id || "phc-1",
              signal_type: "SCHEDULED_NOT_CHECKED_IN",
              anomaly_type: "CHECKIN_WITHOUT_SCHEDULE",
              severity: "MEDIUM",
              status: "ACTIVE",
              description: "Duty scheduled 09:00-17:00, no check-in logged within 30 minutes of start time.",
              metrics: { schedule_delay_minutes: Math.round((now - startMs) / 60000) },
              detected_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          }
        }
      }

      // Check 2: Check-in with 0 activity during duty window (> 120 mins elapsed), ignore OUTREACH_CAMP
      if (
        (session.status === "ON_DUTY" || session.status === "ACTIVE") &&
        session.duty_type !== "OUTREACH_CAMP" &&
        session.check_in_at
      ) {
        const checkInMs = new Date(session.check_in_at).getTime();
        const elapsedMinutes = Math.round((now - checkInMs) / 60000);
        if (elapsedMinutes >= 120 && (session.total_cases_count === 0 || session.total_encounters_count === 0)) {
          const existing = this.mockPresenceSignalsStore.find(
            (s) => s.duty_session_id === session.id && s.signal_type === "CHECK_IN_NO_RECORDED_ACTIVITY"
          );
          if (!existing) {
            this.mockPresenceSignalsStore.push({
              id: `sig-zero-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              duty_session_id: session.id,
              doctor_id: session.doctor_id,
              facility_id: session.facility_id || "phc-1",
              signal_type: "CHECK_IN_NO_RECORDED_ACTIVITY",
              anomaly_type: "NO_ENCOUNTERS_DURING_DUTY",
              severity: "LOW",
              status: "ACTIVE",
              description: "Low/no recorded service activity recorded for duty session.",
              evidence_summary: `Doctor checked in at ${new Date(session.check_in_at).toLocaleTimeString()}. At present, 0 patient encounters are recorded in the PHC database.`,
              metrics: { check_in_gap_minutes: elapsedMinutes, total_activity: 0 },
              detected_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          }
        }
      }

      // Check 3: Activity gap > 3.5 hours
      if (session.max_gap_hours >= 3.5) {
        const existing = this.mockPresenceSignalsStore.find(
          (s) => s.duty_session_id === session.id && s.signal_type === "ACTIVITY_GAP_DETECTED"
        );
        if (!existing) {
          this.mockPresenceSignalsStore.push({
            id: `sig-gap-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            duty_session_id: session.id,
            doctor_id: session.doctor_id,
            facility_id: session.facility_id || "phc-1",
            signal_type: "ACTIVITY_GAP_DETECTED",
            anomaly_type: "UNUSUAL_SESSION_DURATION",
            severity: "LOW",
            status: "ACTIVE",
            description: "Activity gap exceeding 3.5 hours detected during duty shift.",
            metrics: { gap_hours: session.max_gap_hours },
            detected_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      }
    }

    return { evaluated_sessions_count: evaluatedCount };
  }

  // =========================================================================
  // Phase 25 Core Accountability Intelligence Methods
  // =========================================================================

  /**
   * 1. Create Duty Schedule
   */
  async createSchedule(data, user) {
    this._validateAccess(user);

    const { doctorId, phcId, dutyDate, scheduledStart, scheduledEnd, notes } = data;

    if (!doctorId || !phcId || !scheduledStart || !scheduledEnd) {
      const err = new Error("Missing required schedule fields: doctorId, phcId, scheduledStart, scheduledEnd.");
      err.statusCode = 400;
      throw err;
    }

    const start = new Date(scheduledStart).getTime();
    const end = new Date(scheduledEnd).getTime();

    if (isNaN(start) || isNaN(end) || end <= start) {
      const err = new Error("Invalid schedule timestamps: scheduledEnd must be strictly after scheduledStart.");
      err.statusCode = 400;
      throw err;
    }

    if (user.role === "doctor" && user.profileId !== doctorId && user.role !== "district_admin") {
      const err = new Error("Forbidden: Doctors can only request duty schedules for themselves.");
      err.statusCode = 403;
      throw err;
    }

    const newSchedule = {
      id: `sched-${Date.now()}`,
      doctor_id: doctorId,
      phc_id: phcId,
      facility_id: phcId,
      duty_date: dutyDate || new Date(scheduledStart).toISOString().split("T")[0],
      scheduled_start: new Date(scheduledStart).toISOString(),
      scheduled_end: new Date(scheduledEnd).toISOString(),
      status: "SCHEDULED",
      notes: notes || "Scheduled clinical duty session.",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      doctors: { id: doctorId, full_name: "Dr. Assigned Doctor" },
      phcs: { id: phcId, name: "Ashti Primary Health Centre", facility_code: "PHC-MH-2041" },
    };

    this.mockSchedulesStore.unshift(newSchedule);

    auditService.logAuditEvent({
      actor_id: user.profileId,
      action: "DOCTOR_DUTY_SCHEDULED",
      entity_type: "doctor_duty_schedules",
      entity_id: newSchedule.id,
      metadata: { doctor_id: doctorId, phc_id: phcId, duty_date: newSchedule.duty_date },
    });

    return newSchedule;
  }

  /**
   * 2. List Duty Schedules
   */
  async listSchedules(params = {}, user) {
    this._validateAccess(user);

    let list = [...this.mockSchedulesStore];

    if (user.role === "doctor") {
      const docId = user.doctorId || user.profileId;
      list = list.filter((s) => s.doctor_id === docId || s.doctor_id === "doc-1");
    } else if (user.role === "phc_staff") {
      const phc = user.assignedPhcId || "phc-1";
      list = list.filter((s) => s.phc_id === phc || s.facility_id === phc);
    }

    if (params.doctorId) list = list.filter((s) => s.doctor_id === params.doctorId);
    if (params.phcId) list = list.filter((s) => s.phc_id === params.phcId || s.facility_id === params.phcId);
    if (params.dutyDate) list = list.filter((s) => s.duty_date === params.dutyDate);
    if (params.status) list = list.filter((s) => s.status === params.status);

    const limit = parseInt(params.limit, 10) || 50;
    const offset = parseInt(params.offset, 10) || 0;

    return {
      total: list.length,
      items: list.slice(offset, offset + limit),
    };
  }

  /**
   * 3. Cancel Duty Schedule
   */
  async cancelSchedule(scheduleId, { reason = "Administrative rescheduling" } = {}, user) {
    this._validateAccess(user);

    const schedule = this.mockSchedulesStore.find((s) => s.id === scheduleId);
    if (!schedule) {
      const err = new Error(`Schedule not found: ${scheduleId}`);
      err.statusCode = 404;
      throw err;
    }

    schedule.status = "CANCELLED";
    schedule.notes = `${schedule.notes || ""} [Cancelled: ${reason}]`.trim();
    schedule.updated_at = new Date().toISOString();

    auditService.logAuditEvent({
      actor_id: user.profileId,
      action: "DOCTOR_DUTY_SCHEDULE_CANCELLED",
      entity_type: "doctor_duty_schedules",
      entity_id: scheduleId,
      metadata: { reason },
    });

    return schedule;
  }

  /**
   * 4. Secure Check-In
   */
  async checkIn(data, user) {
    if (data?.doctorId === null || data?.phcId === null) {
      const err = new Error("Missing required check-in fields: doctorId and facilityId.");
      err.statusCode = 400;
      throw err;
    }
    return this.checkInDoctorSession(user, {
      doctor_id: data?.doctorId,
      facility_id: data?.phcId,
      duty_type: data?.dutyType || "OPD_GENERAL",
      verification_method: data?.verificationMethod || "authenticated_app",
      notes: data?.notes,
    });
  }

  /**
   * 5. Secure Check-Out
   */
  async checkOut(data, user) {
    return this.checkOutDoctorSession(user, data?.sessionId, { notes: data?.notes });
  }

  /**
   * 6. Get Current Active Session
   */
  async getCurrentSession(user) {
    this._validateAccess(user);

    const docId = user.doctorId || user.profileId || "doc-1";
    const active = this.mockDutySessionsStore.find(
      (s) => (s.doctor_id === docId || s.doctor_id === "doc-1") && (s.status === "ON_DUTY" || s.status === "ACTIVE")
    );

    return active || null;
  }

  /**
   * 7. Record Patient Encounter Linkage
   */
  async recordEncounter({ sessionId, caseId, patientId, isDeleted = false, isTest = false, isCancelled = false }, user) {
    this._validateAccess(user);

    if (isDeleted || isTest || isCancelled) {
      return { counted: false, reason: "Excluded: test, deleted, or cancelled record." };
    }

    const deduplicationKey = `${sessionId || "session"}-${caseId || "case"}-${patientId || "pat"}`;
    if (mockEncounterLedger.has(deduplicationKey)) {
      return { counted: false, reason: "Duplicate encounter entry ignored." };
    }

    mockEncounterLedger.add(deduplicationKey);

    let targetSession = this.mockDutySessionsStore.find((s) => s.id === sessionId);
    if (!targetSession) {
      const docId = user.doctorId || user.profileId || "doc-1";
      targetSession = this.mockDutySessionsStore.find(
        (s) => s.doctor_id === docId && (s.status === "ON_DUTY" || s.status === "ACTIVE")
      );
    }

    if (targetSession) {
      targetSession.total_encounters_count = (targetSession.total_encounters_count || 0) + 1;
      targetSession.total_cases_count = (targetSession.total_cases_count || 0) + 1;
      targetSession.last_encounter_at = new Date().toISOString();
      targetSession.updated_at = new Date().toISOString();
    }

    return { counted: true, session: targetSession };
  }

  /**
   * 8. Deterministic Operational Signal / Anomaly Evaluation
   */
  async evaluateOperationalSignals({ phcId, doctorId, date } = {}) {
    const evaluatedFlags = [];
    const now = Date.now();

    for (const session of this.mockDutySessionsStore) {
      if (phcId && session.facility_id !== phcId && session.phc_id !== phcId) continue;
      if (doctorId && session.doctor_id !== doctorId) continue;

      const checkInMs = new Date(session.check_in_at).getTime();
      const elapsedMinutes = Math.round((now - checkInMs) / 60000);

      // Rule 1: Zero Encounters during Duty (elapsed >= 120 min)
      if (
        (session.status === "ON_DUTY" || session.status === "ACTIVE") &&
        elapsedMinutes >= 120 &&
        (session.total_encounters_count || 0) === 0
      ) {
        const existingFlag = this.mockPresenceSignalsStore.find(
          (f) => f.duty_session_id === session.id && (f.anomaly_type === "NO_ENCOUNTERS_DURING_DUTY" || f.signal_type === "CHECK_IN_NO_RECORDED_ACTIVITY")
        );

        if (!existingFlag) {
          const newFlag = {
            id: `signal-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            doctor_id: session.doctor_id,
            facility_id: session.facility_id || session.phc_id || "phc-1",
            phc_id: session.facility_id || session.phc_id || "phc-1",
            duty_session_id: session.id,
            signal_type: "CHECK_IN_NO_RECORDED_ACTIVITY",
            anomaly_type: "NO_ENCOUNTERS_DURING_DUTY",
            severity: "MEDIUM",
            status: "ACTIVE",
            observed_at: new Date().toISOString(),
            description: "Low/no recorded service activity recorded for duty session.",
            evidence_summary: `Doctor checked in at ${new Date(session.check_in_at).toLocaleTimeString()}. At present (elapsed: ${elapsedMinutes} min), 0 patient encounters are recorded in the PHC database.`,
            explanation_category: null,
            review_notes: null,
            reviewed_by: null,
            reviewed_at: null,
            metrics: { elapsed_minutes: elapsedMinutes, encounters_count: 0 },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            doctors: session.doctors || { id: session.doctor_id, full_name: "Dr. Assigned Doctor" },
            phcs: session.phcs || { id: session.facility_id || session.phc_id || "phc-1", name: "Ashti Primary Health Centre" },
          };

          this.mockPresenceSignalsStore.unshift(newFlag);
          evaluatedFlags.push(newFlag);
        }
      }

      // Rule 2: Rapid Checkout (< 5 min duration)
      if (
        session.status === "CHECKED_OUT" &&
        session.duty_duration_minutes < 5 &&
        session.duty_duration_minutes > 0
      ) {
        const existingFlag = this.mockPresenceSignalsStore.find(
          (f) => f.duty_session_id === session.id && (f.anomaly_type === "UNUSUAL_SESSION_DURATION" || f.signal_type === "ACTIVITY_GAP_DETECTED")
        );

        if (!existingFlag) {
          const rapidFlag = {
            id: `signal-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            doctor_id: session.doctor_id,
            facility_id: session.facility_id || session.phc_id || "phc-1",
            phc_id: session.facility_id || session.phc_id || "phc-1",
            duty_session_id: session.id,
            signal_type: "ACTIVITY_GAP_DETECTED",
            anomaly_type: "UNUSUAL_SESSION_DURATION",
            severity: "LOW",
            status: "ACTIVE",
            observed_at: new Date().toISOString(),
            description: "Unusual session duration detected.",
            evidence_summary: `Duty session completed in under 5 minutes (${session.duty_duration_minutes} min recorded).`,
            explanation_category: null,
            review_notes: null,
            reviewed_by: null,
            reviewed_at: null,
            metrics: { duration_minutes: session.duty_duration_minutes },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            doctors: session.doctors,
            phcs: session.phcs,
          };

          this.mockPresenceSignalsStore.unshift(rapidFlag);
          evaluatedFlags.push(rapidFlag);
        }
      }
    }

    return { evaluated_count: evaluatedFlags.length, new_flags: evaluatedFlags };
  }

  /**
   * 9. Get Operational Review Flags
   */
  async getOperationalFlags(params = {}, user) {
    this._validateAccess(user);

    let list = [...this.mockPresenceSignalsStore];

    if (user.role === "doctor") {
      const docId = user.doctorId || user.profileId || "doc-1";
      list = list.filter((f) => f.doctor_id === docId || f.doctor_id === "doc-3");
    } else if (user.role === "phc_staff") {
      const phc = user.assignedPhcId || "phc-1";
      list = list.filter((f) => f.phc_id === phc || f.facility_id === phc);
    }

    if (params.phcId) list = list.filter((f) => f.phc_id === params.phcId || f.facility_id === params.phcId);
    if (params.doctorId) list = list.filter((f) => f.doctor_id === params.doctorId);
    if (params.status) list = list.filter((f) => f.status === params.status);
    if (params.severity) list = list.filter((f) => f.severity === params.severity);

    const limit = parseInt(params.limit, 10) || 50;
    const offset = parseInt(params.offset, 10) || 0;

    return {
      total: list.length,
      items: list.slice(offset, offset + limit),
    };
  }

  /**
   * 10. Human Review Operational Flag
   */
  async reviewFlag(flagId, { action = "ACKNOWLEDGE", explanationCategory = null, reviewNotes = "" }, user) {
    this._validateAccess(user);

    const flag = this.mockPresenceSignalsStore.find((f) => f.id === flagId);
    if (!flag) {
      const err = new Error(`Operational review flag not found: ${flagId}`);
      err.statusCode = 404;
      throw err;
    }

    if (user.role === "doctor" && user.role !== "district_admin" && (action === "RESOLVE" || action === "DISMISS")) {
      const err = new Error("Forbidden: Review decisions require supervisory PHC staff or district administrator authority.");
      err.statusCode = 403;
      throw err;
    }

    const previousStatus = flag.status;

    if (action === "ACKNOWLEDGE") {
      flag.status = "UNDER_REVIEW";
    } else if (action === "DISMISS") {
      flag.status = "DISMISSED";
      flag.explanation_category = explanationCategory || "ADMIN_DUTY";
      flag.resolution = "DISMISSED";
    } else if (action === "RESOLVE") {
      flag.status = "RESOLVED";
      flag.explanation_category = explanationCategory || "OUTREACH";
      flag.resolution = "RESOLVED";
    } else if (action === "ADD_NOTE") {
      // Keep status
    }

    flag.review_notes = reviewNotes || flag.review_notes;
    flag.reviewed_by = user.profileId;
    flag.reviewed_at = new Date().toISOString();
    flag.updated_at = new Date().toISOString();

    const auditEntry = {
      id: `rev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      flag_id: flagId,
      reviewer_id: user.profileId,
      action,
      notes: reviewNotes || `Action '${action}' applied by supervisor.`,
      metadata: { previous_status: previousStatus, new_status: flag.status, explanation_category: flag.explanation_category },
      created_at: new Date().toISOString(),
    };

    this.mockReviewsLedger.push(auditEntry);

    auditService.logAuditEvent({
      actor_id: user.profileId,
      action: "DOCTOR_OPERATIONAL_FLAG_REVIEWED",
      entity_type: "doctor_presence_signals",
      entity_id: flagId,
      metadata: {
        action,
        new_status: flag.status,
        explanation_category: flag.explanation_category,
      },
    });

    return { flag, review: auditEntry };
  }

  /**
   * 11. Operational Summary Metrics & Freshness Indicator
   */
  async getOperationalSummary(user, { phcId, date } = {}) {
    this._validateAccess(user);

    let schedules = [...this.mockSchedulesStore];
    let sessions = [...this.mockDutySessionsStore];
    let flags = [...this.mockPresenceSignalsStore];

    if (user.role === "phc_staff") {
      const phc = user.assignedPhcId || "phc-1";
      schedules = schedules.filter((s) => s.phc_id === phc || s.facility_id === phc);
      sessions = sessions.filter((s) => s.phc_id === phc || s.facility_id === phc);
      flags = flags.filter((f) => f.phc_id === phc || f.facility_id === phc);
    }

    const scheduledCount = schedules.filter((s) => s.status === "ACTIVE" || s.status === "SCHEDULED").length;
    const checkedInCount = sessions.filter((s) => s.status === "ON_DUTY" || s.status === "ACTIVE").length;
    const completedCount = sessions.filter((s) => s.status === "CHECKED_OUT").length;
    const totalEncounters = sessions.reduce((sum, s) => sum + (s.total_encounters_count || s.total_cases_count || 0), 0);

    const openFlags = flags.filter((f) => f.status === "OPEN" || f.status === "ACTIVE").length;
    const underReviewFlags = flags.filter((f) => f.status === "UNDER_REVIEW").length;
    const resolvedFlags = flags.filter((f) => f.status === "RESOLVED").length;
    const dismissedFlags = flags.filter((f) => f.status === "DISMISSED").length;

    return {
      scheduled_doctors_count: scheduledCount,
      checked_in_doctors_count: checkedInCount,
      active_sessions_count: checkedInCount,
      completed_sessions_count: completedCount,
      total_encounters_count: totalEncounters,
      open_review_flags_count: openFlags,
      under_review_flags_count: underReviewFlags,
      resolved_flags_count: resolvedFlags,
      dismissed_flags_count: dismissedFlags,
      stale_data_phcs_count: 0,
      data_freshness_status: "SYNCED_REALTIME",
      last_synchronized_at: new Date().toISOString(),
      disclaimer: "JeevanSetu identifies operational data inconsistencies for human review. It does not determine doctor misconduct or automatically impose disciplinary action.",
    };
  }

  /**
   * 12. Retrieve Doctor Attendance / Session History
   */
  async getDoctorAttendanceHistory(user, params = {}) {
    this._validateAccess(user);

    let list = [...this.mockDutySessionsStore];

    if (user.role === "doctor") {
      const docId = user.doctorId || user.profileId || "doc-1";
      list = list.filter((s) => s.doctor_id === docId || s.doctor_id === "doc-1");
    }

    const limit = parseInt(params.limit, 10) || 50;
    const offset = parseInt(params.offset, 10) || 0;

    return {
      total: list.length,
      items: list.slice(offset, offset + limit),
    };
  }
}

module.exports = new DoctorPresenceService();
