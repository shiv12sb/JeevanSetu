/**
 * Referral Milestone Configuration Matrix & Expected Timings for Closed-Loop Care
 */

const HOURS = 60 * 60 * 1000;
const MINUTES = 60 * 1000;
const DAYS = 24 * HOURS;

/**
 * Expected milestone transition matrix and duration (in milliseconds)
 */
const MILESTONE_TIMINGS = {
  created: {
    expectedNextStage: "patient_notified",
    label: "Patient Notification & Briefing",
    durations: {
      emergency: 30 * MINUTES,
      urgent: 2 * HOURS,
      routine: 6 * HOURS,
    },
  },
  patient_notified: {
    expectedNextStage: "destination_accepted",
    label: "Hospital Bed & Specialist Confirmation",
    durations: {
      emergency: 1 * HOURS,
      urgent: 4 * HOURS,
      routine: 12 * HOURS,
    },
  },
  destination_accepted: {
    expectedNextStage: "patient_reached",
    label: "Patient Transit & Arrival at Hospital",
    durations: {
      emergency: 3 * HOURS,
      urgent: 8 * HOURS,
      routine: 24 * HOURS,
    },
  },
  transport_arranged: {
    expectedNextStage: "patient_departed",
    label: "Patient Departure from PHC",
    durations: {
      emergency: 15 * MINUTES,
      urgent: 1 * HOURS,
      routine: 3 * HOURS,
    },
  },
  patient_departed: {
    expectedNextStage: "patient_reached",
    label: "Patient Transit to Hospital",
    durations: {
      emergency: 2 * HOURS,
      urgent: 6 * HOURS,
      routine: 12 * HOURS,
    },
  },
  patient_reached: {
    expectedNextStage: "treatment_started",
    label: "Triage & Treatment Initiation",
    durations: {
      emergency: 1 * HOURS,
      urgent: 4 * HOURS,
      routine: 12 * HOURS,
    },
  },
  hospital_arrived: {
    expectedNextStage: "hospital_registered",
    label: "Hospital Registration & Triage",
    durations: {
      emergency: 30 * MINUTES,
      urgent: 2 * HOURS,
      routine: 4 * HOURS,
    },
  },
  hospital_registered: {
    expectedNextStage: "treatment_started",
    label: "Specialist Consultation & Treatment Start",
    durations: {
      emergency: 1 * HOURS,
      urgent: 3 * HOURS,
      routine: 8 * HOURS,
    },
  },
  treatment_started: {
    expectedNextStage: "completed",
    label: "Clinical Care & Discharge",
    durations: {
      emergency: 24 * HOURS,
      urgent: 48 * HOURS,
      routine: 72 * HOURS,
    },
  },
  follow_up_required: {
    expectedNextStage: "follow_up_completed",
    label: "Post-Discharge Follow-Up Checkup",
    durations: {
      emergency: 3 * DAYS,
      urgent: 7 * DAYS,
      routine: 14 * DAYS,
    },
  },
  follow_up_completed: {
    expectedNextStage: "closed",
    label: "Referral Case Closure",
    durations: {
      emergency: 24 * HOURS,
      urgent: 48 * HOURS,
      routine: 72 * HOURS,
    },
  },
};

/**
 * Multipliers for milestone state progression
 */
const STATUS_MULTIPLIERS = {
  due: 1.0,        // Elapsed >= 1.0 * duration -> FOLLOW_UP_DUE
  overdue: 1.5,    // Elapsed >= 1.5 * duration -> OVERDUE
  escalate: 2.5,   // Elapsed >= 2.5 * duration -> ESCALATED
};

/**
 * Calculate expected milestone details for a given referral stage, priority, and last update time
 */
const getExpectedMilestone = (stage, priority = "urgent", lastUpdatedAt = new Date()) => {
  const config = MILESTONE_TIMINGS[stage];
  if (!config) {
    return {
      hasMilestone: false,
      expectedNextStage: null,
      label: "Referral Completed or Closed",
      dueAt: null,
      overdueAt: null,
      escalatedAt: null,
    };
  }

  const prioKey = (priority || "urgent").toLowerCase();
  const durationMs = config.durations[prioKey] || config.durations.urgent;
  const baseTime = new Date(lastUpdatedAt).getTime();

  const dueAt = new Date(baseTime + durationMs * STATUS_MULTIPLIERS.due);
  const overdueAt = new Date(baseTime + durationMs * STATUS_MULTIPLIERS.overdue);
  const escalatedAt = new Date(baseTime + durationMs * STATUS_MULTIPLIERS.escalate);

  return {
    hasMilestone: true,
    currentStage: stage,
    expectedNextStage: config.expectedNextStage,
    label: config.label,
    durationMs,
    dueAt,
    overdueAt,
    escalatedAt,
  };
};

module.exports = {
  MILESTONE_TIMINGS,
  STATUS_MULTIPLIERS,
  getExpectedMilestone,
};
