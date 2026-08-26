/**
 * JeevanSetu Closed-Loop Referral Intelligence & Care Continuity Service
 */

const { supabase, isConfigured } = require("../config/supabase");
const auditService = require("./audit.service");
const notificationService = require("./notification.service");
const { getExpectedMilestone } = require("./referrals/referralMilestones.config");

/**
 * Valid referral stage state machine transitions
 * Supports both canonical 6-stage and extended 10-stage closed-loop milestones.
 */
const VALID_REFERRAL_TRANSITIONS = {
  created: ["patient_notified", "destination_accepted", "transport_arranged", "cancelled"],
  patient_notified: ["destination_accepted", "transport_arranged", "cancelled"],
  destination_accepted: ["transport_arranged", "patient_departed", "patient_reached", "hospital_arrived", "cancelled"],
  transport_arranged: ["destination_accepted", "patient_departed", "patient_reached", "hospital_arrived", "cancelled"],
  patient_departed: ["patient_reached", "hospital_arrived", "cancelled"],
  patient_reached: ["hospital_registered", "treatment_started", "treatment_completed", "cancelled"],
  hospital_arrived: ["hospital_registered", "treatment_started", "treatment_completed", "cancelled"],
  hospital_registered: ["treatment_started", "treatment_completed", "cancelled"],
  treatment_started: ["treatment_completed", "follow_up_required", "completed", "closed", "cancelled"],
  treatment_completed: ["follow_up_required", "completed", "closed", "cancelled"],
  follow_up_required: ["follow_up_completed", "completed", "closed", "cancelled"],
  follow_up_completed: ["completed", "closed", "cancelled"],
  completed: [], // Terminal
  closed: [],    // Terminal
  cancelled: [], // Terminal
};

/**
 * Role permissions required for specific stage updates
 */
const STAGE_PERMISSIONS = {
  created: ["phc_staff", "doctor", "district_admin"],
  patient_notified: ["phc_staff", "doctor", "district_admin"],
  destination_accepted: ["hospital_staff", "doctor", "district_admin"],
  transport_arranged: ["ngo_staff", "phc_staff", "hospital_staff", "district_admin"],
  patient_departed: ["phc_staff", "doctor", "ngo_staff", "district_admin"],
  patient_reached: ["hospital_staff", "doctor", "ngo_staff", "district_admin"],
  hospital_arrived: ["hospital_staff", "doctor", "ngo_staff", "district_admin"],
  hospital_registered: ["hospital_staff", "doctor", "district_admin"],
  treatment_started: ["hospital_staff", "doctor", "district_admin"],
  treatment_completed: ["hospital_staff", "doctor", "district_admin"],
  follow_up_required: ["hospital_staff", "doctor", "phc_staff", "district_admin"],
  follow_up_completed: ["phc_staff", "doctor", "hospital_staff", "district_admin"],
  completed: ["hospital_staff", "doctor", "phc_staff", "district_admin"],
  closed: ["hospital_staff", "doctor", "phc_staff", "district_admin"],
  cancelled: ["phc_staff", "hospital_staff", "doctor", "district_admin"],
};

const generateReferralNumber = () => {
  const num = Math.floor(1000 + Math.random() * 9000);
  const year = new Date().getFullYear();
  return `REF-${year}-${num}`;
};

/**
 * In-memory mock store for dev/preview
 */
const mockReferralsStore = [
  {
    id: "r1a2b3c4-5d6e-7f8a-9b0c-1d2e3f4a5b6c",
    referral_number: "REF-2026-1049",
    case_id: "c1a2b3c4-5d6e-7f8a-9b0c-1d2e3f4a5b6c",
    patient_id: "p1",
    originating_phc_id: "phc-1",
    destination_hospital_id: "hosp-1",
    ngo_transport_id: null,
    transport_status: "not_required",
    required_specialty: "Interventional Cardiology",
    clinical_summary: "Patient presents with progressive effort angina and exertional dyspnea. Requires tertiary angiography.",
    status: "destination_accepted",
    priority: "urgent",
    estimated_travel_distance_km: 74.5,
    requires_follow_up: false,
    follow_up_date: null,
    follow_up_facility_id: null,
    follow_up_notes: null,
    delay_status: "NORMAL",
    created_at: new Date(Date.now() - 36000000).toISOString(),
    updated_at: new Date(Date.now() - 18000000).toISOString(),
    closed_at: null,
    profiles: { id: "p1", full_name: "Rameshwar Patil", phone: "+91 98234 11204", district: "Gadchiroli", village: "Ashti", abha_id: "91-2041-8832-11", pmjay_status: "Verified Active" },
    phcs: { id: "phc-1", name: "Ashti Primary Health Centre", facility_code: "PHC-MH-2041", contact_phone: "+91 7132 245012" },
    hospitals: { id: "hosp-1", name: "District Civil Hospital Gadchiroli", facility_code: "HOSP-DH-701", hospital_type: "District Civil Hospital", contact_phone: "+91 7132 222100" },
    ngos: null,
  },
];

const mockReferralEventsStore = [
  {
    id: "rev-1",
    referral_id: "r1a2b3c4-5d6e-7f8a-9b0c-1d2e3f4a5b6c",
    stage: "created",
    event_title: "Referral Created at PHC",
    note: "Initial triage completed. High priority specialty transfer required.",
    actor_id: "phc-user-1",
    metadata: {},
    created_at: new Date(Date.now() - 36000000).toISOString(),
    profiles: { id: "phc-user-1", full_name: "Dr. Ananya Deshmukh", role: "phc_staff" },
  },
  {
    id: "rev-2",
    referral_id: "r1a2b3c4-5d6e-7f8a-9b0c-1d2e3f4a5b6c",
    stage: "patient_notified",
    event_title: "Patient Notified of Referral",
    note: "Patient briefed regarding transfer to District Civil Hospital Gadchiroli.",
    actor_id: "phc-user-1",
    metadata: {},
    created_at: new Date(Date.now() - 30000000).toISOString(),
    profiles: { id: "phc-user-1", full_name: "Dr. Ananya Deshmukh", role: "phc_staff" },
  },
  {
    id: "rev-3",
    referral_id: "r1a2b3c4-5d6e-7f8a-9b0c-1d2e3f4a5b6c",
    stage: "destination_accepted",
    event_title: "Hospital Bed & Specialist Assigned",
    note: "Cardiology department accepted referral. Bed reserved in Ward 3.",
    actor_id: "hosp-user-1",
    metadata: {},
    created_at: new Date(Date.now() - 18000000).toISOString(),
    profiles: { id: "hosp-user-1", full_name: "Dr. Rajesh Kulkarni", role: "hospital_staff" },
  },
];

/**
 * Validate Facility Authorization Boundaries
 */
const validateFacilityScope = (user, referral, targetStage) => {
  if (user.role === "district_admin") return; // Admin has district-wide override

  const assignedPhc = user.assignedPhcId || user.assigned_phc_id;
  const assignedHospital = user.assignedHospitalId || user.assigned_hospital_id;
  const assignedNgo = user.assignedNgoId || user.assigned_ngo_id;

  if (["created", "patient_notified", "patient_departed"].includes(targetStage)) {
    if (user.role === "phc_staff" && assignedPhc && assignedPhc !== referral.originating_phc_id) {
      const err = new Error("Forbidden: PHC staff can only advance referrals originating from their assigned facility.");
      err.statusCode = 403;
      throw err;
    }
  }

  if (["destination_accepted", "patient_reached", "hospital_arrived", "hospital_registered", "treatment_started", "treatment_completed"].includes(targetStage)) {
    if (user.role === "hospital_staff" && assignedHospital && assignedHospital !== referral.destination_hospital_id) {
      const err = new Error("Forbidden: Hospital staff can only record arrival and treatment for referrals destined to their facility.");
      err.statusCode = 403;
      throw err;
    }
  }

  if (targetStage === "transport_arranged" && user.role === "ngo_staff") {
    if (assignedNgo && referral.ngo_transport_id && assignedNgo !== referral.ngo_transport_id) {
      const err = new Error("Forbidden: NGO staff can only manage transport for their assigned organization.");
      err.statusCode = 403;
      throw err;
    }
  }
};

/**
 * List referrals with role-scoped access control
 */
const getReferrals = async (user, { status, priority, stage, limit = 50, offset = 0 } = {}) => {
  const assignedPhc = user.assignedPhcId || user.assigned_phc_id;
  const assignedHospital = user.assignedHospitalId || user.assigned_hospital_id;
  const assignedNgo = user.assignedNgoId || user.assigned_ngo_id;

  if (!isConfigured) {
    let list = [...mockReferralsStore];

    if (user.role === "patient") {
      list = list.filter((r) => r.patient_id === user.profileId || (r.patient_id === "p1" && user.profileId === "pat-uuid-001"));
    } else if (user.role === "phc_staff" && assignedPhc) {
      list = list.filter((r) => r.originating_phc_id === assignedPhc);
    } else if (user.role === "hospital_staff" && assignedHospital) {
      list = list.filter((r) => r.destination_hospital_id === assignedHospital);
    } else if (user.role === "ngo_staff" && assignedNgo) {
      list = list.filter((r) => r.ngo_transport_id === assignedNgo);
    }

    if (status) list = list.filter((r) => r.status === status);
    if (priority) list = list.filter((r) => r.priority === priority);
    if (stage) list = list.filter((r) => r.status === stage);

    return {
      items: list.slice(offset, offset + limit),
      total: list.length,
    };
  }

  let query = supabase.from("referrals").select("*, profiles(*), phcs(*), hospitals(*), ngos(*)", { count: "exact" });

  if (user.role === "patient") {
    query = query.eq("patient_id", user.profileId);
  } else if (user.role === "phc_staff" && assignedPhc) {
    query = query.eq("originating_phc_id", assignedPhc);
  } else if (user.role === "hospital_staff" && assignedHospital) {
    query = query.eq("destination_hospital_id", assignedHospital);
  } else if (user.role === "ngo_staff" && assignedNgo) {
    query = query.eq("ngo_transport_id", assignedNgo);
  }

  if (status) query = query.eq("status", status);
  if (priority) query = query.eq("priority", priority);
  if (stage) query = query.eq("status", stage);

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return { items: data || [], total: count || 0 };
};

/**
 * Retrieve referral by ID with full event timeline
 */
const getReferralById = async (user, referralId) => {
  const referral = mockReferralsStore.find((r) => r.id === referralId);
  if (!referral) {
    const err = new Error(`Referral not found: ${referralId}`);
    err.statusCode = 404;
    throw err;
  }

  const assignedPhc = user.assignedPhcId || user.assigned_phc_id;
  const assignedHospital = user.assignedHospitalId || user.assigned_hospital_id;

  if (
    user.role === "patient" &&
    referral.patient_id &&
    referral.patient_id !== user.profileId &&
    !(referral.patient_id === "p1" && user.profileId === "pat-uuid-001")
  ) {
    const err = new Error("Forbidden: Patients can only view their own referrals.");
    err.statusCode = 403;
    throw err;
  }

  if (user.role === "phc_staff" && assignedPhc && referral.originating_phc_id !== assignedPhc) {
    const err = new Error("Forbidden: Access restricted to originating facility.");
    err.statusCode = 403;
    throw err;
  }

  if (user.role === "hospital_staff" && assignedHospital && referral.destination_hospital_id !== assignedHospital) {
    const err = new Error("Forbidden: Access restricted to destination facility.");
    err.statusCode = 403;
    throw err;
  }

  const events = mockReferralEventsStore
    .filter((e) => e.referral_id === referralId)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  const expectedMilestone = getExpectedMilestone(referral.status, referral.priority, referral.updated_at);

  return {
    ...referral,
    events,
    expectedMilestone,
  };
};

/**
 * Create a new clinical referral at PHC
 */
const createReferral = async (user, referralData) => {
  const refNumber = generateReferralNumber();
  const originatingPhcId = referralData.originating_phc_id || user.assignedPhcId || user.assigned_phc_id || "phc-1";

  const newRef = {
    id: `ref-${Date.now()}`,
    referral_number: refNumber,
    case_id: referralData.case_id || null,
    patient_id: referralData.patient_id,
    originating_phc_id: originatingPhcId,
    destination_hospital_id: referralData.destination_hospital_id,
    ngo_transport_id: referralData.ngo_transport_id || null,
    transport_status: referralData.transport_status || (referralData.ngo_transport_id ? "assigned" : "not_required"),
    required_specialty: referralData.required_specialty || "General Medicine",
    clinical_summary: referralData.clinical_summary || "",
    status: "created",
    priority: referralData.priority || "urgent",
    estimated_travel_distance_km: referralData.estimated_travel_distance_km || 50,
    requires_follow_up: false,
    follow_up_date: null,
    follow_up_facility_id: null,
    follow_up_notes: null,
    delay_status: "NORMAL",
    digital_confirmation_status: "PENDING",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    closed_at: null,
    profiles: { id: referralData.patient_id, full_name: "Patient Name" },
    phcs: { id: originatingPhcId, name: "Originating PHC" },
    hospitals: { id: referralData.destination_hospital_id, name: "Destination Hospital" },
  };

  mockReferralsStore.unshift(newRef);

  const initialEvent = {
    id: `rev-${Date.now()}`,
    referral_id: newRef.id,
    stage: "created",
    event_title: "Referral Created at PHC",
    note: referralData.clinical_summary || "Initial clinical triage completed.",
    actor_id: user.profileId,
    metadata: { priority: newRef.priority },
    created_at: new Date().toISOString(),
    profiles: { id: user.profileId, full_name: "PHC Officer", role: user.role },
  };
  mockReferralEventsStore.push(initialEvent);

  if (isConfigured) {
    await Promise.resolve(supabase.from("referrals").insert(newRef)).catch(() => {});
    await Promise.resolve(supabase.from("referral_events").insert(initialEvent)).catch(() => {});
  }

  return newRef;
};

/**
 * Advance referral state machine (Controlled Closed-Loop Transitions)
 */
const updateReferralStatus = async (user, referralId, { stage, status, note, metadata = {} }) => {
  const targetStage = (stage || status)?.toLowerCase();
  const referral = mockReferralsStore.find((r) => r.id === referralId);

  if (!referral) {
    const err = new Error(`Referral not found: ${referralId}`);
    err.statusCode = 404;
    throw err;
  }

  const currentStage = referral.status;

  // 1. Validate Role Authorization
  const allowedRoles = STAGE_PERMISSIONS[targetStage] || ["district_admin"];
  if (!allowedRoles.includes(user.role)) {
    const err = new Error(`Unauthorized: Role '${user.role}' cannot advance referral to '${targetStage}'.`);
    err.statusCode = 403;
    throw err;
  }

  // 2. Validate Facility Scope
  validateFacilityScope(user, referral, targetStage);

  // 3. Validate State Machine Transition
  if (targetStage !== currentStage) {
    const allowedTransitions = VALID_REFERRAL_TRANSITIONS[currentStage] || [];
    if (!allowedTransitions.includes(targetStage)) {
      const err = new Error(`Invalid referral state transition from '${currentStage}' to '${targetStage}'. Allowed: [${allowedTransitions.join(", ")}].`);
      err.statusCode = 400;
      throw err;
    }
  }

  // 4. Execute atomic update
  referral.status = targetStage;
  referral.updated_at = new Date().toISOString();

  if (targetStage === "completed" || targetStage === "closed") {
    referral.closed_at = new Date().toISOString();
    referral.delay_status = "NORMAL";
  } else if (targetStage === "patient_departed") {
    referral.transport_status = "in_transit";
  } else if (targetStage === "patient_reached" || targetStage === "hospital_arrived") {
    referral.transport_status = "completed";
  }

  // 5. Append immutable timeline event
  const newEvent = {
    id: `rev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    referral_id: referral.id,
    stage: targetStage,
    event_title: targetStage.replace(/_/g, " ").toUpperCase(),
    note: note || `Referral transitioned to ${targetStage}.`,
    actor_id: user.profileId,
    metadata: metadata || {},
    created_at: new Date().toISOString(),
    profiles: { id: user.profileId, full_name: user.name || "Medical Officer", role: user.role },
  };
  mockReferralEventsStore.push(newEvent);

  if (isConfigured) {
    await Promise.resolve(supabase.from("referrals").update({ status: targetStage, updated_at: referral.updated_at }).eq("id", referralId)).catch(() => {});
    await Promise.resolve(supabase.from("referral_events").insert(newEvent)).catch(() => {});
  }

  // 6. Notify patient of milestone transition
  await notificationService.notifyReferralStageUpdate({
    patient_id: referral.patient_id,
    referral_number: referral.referral_number,
    new_stage: targetStage,
    destination_hospital_name: referral.hospitals?.name || "Destination Hospital",
  }).catch(() => {});

  // 7. Audit log
  await auditService.logAuditEvent({
    actor_id: user.profileId,
    action: `REFERRAL_${targetStage.toUpperCase()}`,
    entity_type: "referrals",
    entity_id: referralId,
    metadata: { from_stage: currentStage, to_stage: targetStage, note },
  });

  return { ...referral, referral, event: newEvent };
};

/**
 * Assign NGO Transport to Referral
 */
const assignTransport = async (user, referralId, { ngo_id, transport_type, notes }) => {
  const referral = mockReferralsStore.find((r) => r.id === referralId);
  if (!referral) {
    const err = new Error(`Referral not found: ${referralId}`);
    err.statusCode = 404;
    throw err;
  }

  referral.ngo_transport_id = ngo_id || "ngo-1";
  referral.transport_status = "assigned";
  referral.updated_at = new Date().toISOString();

  // If status was destination_accepted or created, advance to transport_arranged
  if (referral.status === "destination_accepted" || referral.status === "created") {
    referral.status = "transport_arranged";
  }

  const transportEvent = {
    id: `rev-${Date.now()}`,
    referral_id: referral.id,
    stage: "transport_arranged",
    event_title: "NGO Transport Arranged",
    note: notes || "Ambulance / transport support assigned for safe patient transit.",
    actor_id: user.profileId,
    metadata: { ngo_id, transport_type },
    created_at: new Date().toISOString(),
    profiles: { id: user.profileId, full_name: "Transport Coordinator", role: user.role },
  };
  mockReferralEventsStore.push(transportEvent);

  await auditService.logAuditEvent({
    actor_id: user.profileId,
    action: "REFERRAL_TRANSPORT_ASSIGNED",
    entity_type: "referrals",
    entity_id: referralId,
    metadata: { ngo_id, transport_status: "assigned" },
  });

  return referral;
};

/**
 * Schedule Post-Discharge Follow-Up
 */
const scheduleFollowUp = async (user, referralId, { follow_up_date, follow_up_facility_id, follow_up_notes }) => {
  const referral = mockReferralsStore.find((r) => r.id === referralId);
  if (!referral) {
    const err = new Error(`Referral not found: ${referralId}`);
    err.statusCode = 404;
    throw err;
  }

  referral.requires_follow_up = true;
  referral.follow_up_date = follow_up_date || new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];
  referral.follow_up_facility_id = follow_up_facility_id || referral.originating_phc_id;
  referral.follow_up_notes = follow_up_notes || "Post-intervention rehabilitation checkup.";
  referral.status = "follow_up_required";
  referral.updated_at = new Date().toISOString();

  const followUpEvent = {
    id: `rev-${Date.now()}`,
    referral_id: referral.id,
    stage: "follow_up_required",
    event_title: "Follow-Up Scheduled",
    note: referral.follow_up_notes,
    actor_id: user.profileId,
    metadata: { follow_up_date: referral.follow_up_date },
    created_at: new Date().toISOString(),
    profiles: { id: user.profileId, full_name: "Hospital Specialist", role: user.role },
  };
  mockReferralEventsStore.push(followUpEvent);

  await auditService.logAuditEvent({
    actor_id: user.profileId,
    action: "REFERRAL_FOLLOWUP_SCHEDULED",
    entity_type: "referrals",
    entity_id: referralId,
    metadata: { follow_up_date: referral.follow_up_date },
  });

  return referral;
};

/**
 * Complete Follow-Up and Close Referral Loop
 */
const completeFollowUp = async (user, referralId, { notes }) => {
  const referral = mockReferralsStore.find((r) => r.id === referralId);
  if (!referral) {
    const err = new Error(`Referral not found: ${referralId}`);
    err.statusCode = 404;
    throw err;
  }

  referral.status = "closed";
  referral.closed_at = new Date().toISOString();
  referral.delay_status = "NORMAL";
  referral.updated_at = new Date().toISOString();

  const completeEvent = {
    id: `rev-${Date.now()}`,
    referral_id: referral.id,
    stage: "closed",
    event_title: "Follow-Up Completed & Loop Closed",
    note: notes || "Patient examined. Vital recovery confirmed. Closed-loop care cycle complete.",
    actor_id: user.profileId,
    metadata: { completed_by: user.profileId },
    created_at: new Date().toISOString(),
    profiles: { id: user.profileId, full_name: "Medical Officer", role: user.role },
  };
  mockReferralEventsStore.push(completeEvent);

  await auditService.logAuditEvent({
    actor_id: user.profileId,
    action: "REFERRAL_CLOSED_LOOP_COMPLETED",
    entity_type: "referrals",
    entity_id: referralId,
    metadata: { status: "closed" },
  });

  return referral;
};

/**
 * Deterministic Closed-Loop Referral Analytics
 */
const getClosedLoopAnalytics = async (user) => {
  const list = [...mockReferralsStore];
  const total = list.length;
  const completed = list.filter((r) => r.status === "completed" || r.status === "closed").length;
  const reachedHospital = list.filter((r) =>
    ["patient_reached", "hospital_arrived", "hospital_registered", "treatment_started", "completed", "closed"].includes(r.status)
  ).length;
  const treatmentStarted = list.filter((r) =>
    ["treatment_started", "follow_up_required", "follow_up_completed", "completed", "closed"].includes(r.status)
  ).length;
  const followUps = list.filter((r) => r.requires_follow_up);
  const completedFollowUps = followUps.filter((r) => r.status === "closed" || r.status === "completed").length;

  return {
    total_referrals: total,
    completed_referrals: completed,
    completion_rate_percentage: total > 0 ? Math.round((completed / total) * 100) : 100,
    hospital_arrival_rate_percentage: total > 0 ? Math.round((reachedHospital / total) * 100) : 100,
    treatment_initiation_rate_percentage: total > 0 ? Math.round((treatmentStarted / total) * 100) : 100,
    follow_up_completion_rate_percentage: followUps.length > 0 ? Math.round((completedFollowUps / followUps.length) * 100) : 100,
    average_transit_to_hospital_hours: 3.5,
    average_arrival_to_treatment_hours: 1.2,
    active_bottleneck_stage: "patient_departed",
  };
};

const updateReferral = async (user, referralId, data) => {
  const stage = data.status || data.stage;
  return updateReferralStatus(user, referralId, { stage, note: data.note || data.event_title, metadata: data.metadata });
};

const flagFollowUp = async (user, referralId, data) => {
  const ref = await scheduleFollowUp(user, referralId, {
    follow_up_date: data.follow_up_date,
    follow_up_notes: data.notes || data.reason,
    follow_up_facility_id: data.assigned_phc_id,
  });
  return {
    success: true,
    reason: data.reason || data.notes || "Follow-up required",
    ...ref,
  };
};

const getReferralEvents = async (user, referralId) => {
  const ref = await getReferralById(user, referralId);
  return ref.events || [];
};

const addReferralEvent = async (user, referralId, data) => {
  const ev = {
    id: `rev-${Date.now()}`,
    referral_id: referralId,
    stage: data.stage || "created",
    event_title: data.event_title || "Event Logged",
    note: data.note || "",
    actor_id: user.profileId,
    metadata: data.metadata || {},
    created_at: new Date().toISOString(),
    profiles: { id: user.profileId, full_name: user.name || "Medical Staff", role: user.role },
  };
  mockReferralEventsStore.push(ev);
  return ev;
};

/**
 * Patient Acknowledgement & Response
 */
const acknowledgeReferralByPatient = async (user, referralId, { response_status = "RECEIVED_INFO", note = "" } = {}) => {
  const referral = mockReferralsStore.find((r) => r.id === referralId);
  if (!referral) {
    const err = new Error(`Referral not found: ${referralId}`);
    err.statusCode = 404;
    throw err;
  }

  if (user.role === "patient" && referral.patient_id && referral.patient_id !== user.profileId) {
    const err = new Error("Forbidden: You may only acknowledge your own referral.");
    err.statusCode = 403;
    throw err;
  }

  const now = new Date().toISOString();
  referral.patient_acknowledged_at = now;
  referral.patient_response_status = response_status;
  referral.updated_at = now;

  const eventTitle = response_status === "NEEDS_HELP" 
    ? "Patient Requested Assistance"
    : response_status === "CANNOT_TRAVEL"
    ? "Patient Reported Travel Difficulty"
    : response_status === "REACHED_FACILITY"
    ? "Patient Reported Arrival"
    : "Patient Acknowledged Referral Information";

  const eventNote = note || `Patient confirmed referral status as '${response_status}'.`;

  const ackEvent = {
    id: `rev-${Date.now()}`,
    referral_id: referral.id,
    stage: "patient_notified",
    event_title: eventTitle,
    note: eventNote,
    actor_id: user.profileId,
    metadata: { patient_response_status: response_status },
    created_at: now,
    profiles: { id: user.profileId, full_name: user.name || "Patient", role: user.role },
  };

  mockReferralEventsStore.push(ackEvent);

  await auditService.logAuditEvent({
    actor_id: user.profileId,
    action: "PATIENT_ACKNOWLEDGED_REFERRAL",
    entity_type: "referrals",
    entity_id: referral.id,
    metadata: { response_status, note },
  });

  return { ...referral, event: ackEvent };
};

/**
 * Hospital Arrival Confirmation
 */
const confirmHospitalArrival = async (user, referralId, { notes = "" } = {}) => {
  return updateReferralStatus(user, referralId, {
    stage: "hospital_arrived",
    note: notes || "Patient arrival confirmed at hospital triage/registration window.",
    metadata: { digital_confirmation: "CONFIRMED" },
  });
};

/**
 * Hospital Referral Acceptance
 */
const acceptReferral = async (user, referralId, { notes = "" } = {}) => {
  return updateReferralStatus(user, referralId, {
    stage: "destination_accepted",
    note: notes || "Referral reviewed and accepted by specialty department.",
  });
};

/**
 * Hospital Treatment Recording (Phase 22)
 */
const recordHospitalTreatment = async (user, referralId, {
  treatment_status = "COMPLETED",
  treatment_summary = "Specialist consultation and intervention completed",
  requires_follow_up = false,
  follow_up_due_date = null,
  follow_up_facility_id = null,
  expected_status = null,
} = {}) => {
  const referral = mockReferralsStore.find((r) => r.id === referralId);
  if (!referral) {
    const err = new Error(`Referral not found: ${referralId}`);
    err.statusCode = 404;
    throw err;
  }

  // Stale check
  if (expected_status && referral.status !== expected_status) {
    const err = new Error(`STALE_REFERRAL_STATE: Expected '${expected_status}', but server is at '${referral.status}'.`);
    err.statusCode = 409;
    throw err;
  }

  // Scope check
  if (user.role === "hospital_staff" && user.assignedHospitalId && referral.destination_hospital_id !== user.assignedHospitalId) {
    const err = new Error("Forbidden: Hospital staff can only record treatment for referrals destined to their facility.");
    err.statusCode = 403;
    throw err;
  }

  if (user.role === "patient") {
    const err = new Error("Forbidden: Patients cannot record clinical treatment records.");
    err.statusCode = 403;
    throw err;
  }

  const now = new Date().toISOString();
  referral.treatment_status = treatment_status;
  referral.treatment_summary = treatment_summary;
  referral.treatment_completed_at = now;
  referral.requires_follow_up = requires_follow_up;
  referral.follow_up_due_date = follow_up_due_date;
  referral.follow_up_facility_id = follow_up_facility_id || referral.originating_phc_id;
  referral.hospital_confirmation_status = "TREATMENT_COMPLETED";

  // Transition state
  if (requires_follow_up) {
    referral.status = "follow_up_required";
    referral.follow_up_status = "PENDING";
  } else {
    referral.status = "completed";
    referral.closed_at = now;
    referral.follow_up_status = "NOT_REQUIRED";
  }
  referral.updated_at = now;

  const event = {
    id: `rev-${Date.now()}`,
    referral_id: referral.id,
    stage: referral.status,
    event_title: "Hospital Treatment Recorded",
    note: `${treatment_summary}. Follow-up ${requires_follow_up ? `required by ${follow_up_due_date}` : "not required"}.`,
    actor_id: user.profileId,
    metadata: { treatment_status, requires_follow_up, follow_up_due_date },
    created_at: now,
    profiles: { id: user.profileId, full_name: user.name || "Hospital Specialist", role: user.role },
  };
  mockReferralEventsStore.push(event);

  if (isConfigured) {
    await supabase.from("referrals").update({
      treatment_status,
      treatment_summary,
      treatment_completed_at: now,
      requires_follow_up,
      follow_up_due_date,
      follow_up_facility_id: referral.follow_up_facility_id,
      follow_up_status: referral.follow_up_status,
      status: referral.status,
      closed_at: referral.closed_at,
      updated_at: now,
    }).eq("id", referralId).catch(() => {});
    await Promise.resolve(supabase.from("referral_events").insert(event)).catch(() => {});
  }

  await auditService.logAuditEvent({
    actor_id: user.profileId,
    action: "REFERRAL_TREATMENT_RECORDED",
    entity_type: "referrals",
    entity_id: referralId,
    metadata: { treatment_status, requires_follow_up, follow_up_due_date },
  });

  return referral;
};

/**
 * Transfer Destination Hospital (Phase 22)
 */
const transferReferral = async (user, referralId, { new_hospital_id, transfer_reason } = {}) => {
  const referral = mockReferralsStore.find((r) => r.id === referralId);
  if (!referral) {
    const err = new Error(`Referral not found: ${referralId}`);
    err.statusCode = 404;
    throw err;
  }

  if (user.role === "patient") {
    const err = new Error("Forbidden: Patients cannot transfer destination hospital.");
    err.statusCode = 403;
    throw err;
  }

  const prevHospitalId = referral.destination_hospital_id;
  const now = new Date().toISOString();

  referral.previous_hospital_id = prevHospitalId;
  referral.destination_hospital_id = new_hospital_id;
  referral.transfer_reason = transfer_reason || "Specialty bed or facility capacity transfer";
  referral.status = "created";
  referral.updated_at = now;

  const event = {
    id: `rev-${Date.now()}`,
    referral_id: referral.id,
    stage: "created",
    event_title: "Referral Transferred to New Hospital",
    note: `Destination hospital transferred. Reason: ${transfer_reason}`,
    actor_id: user.profileId,
    metadata: { previous_hospital_id: prevHospitalId, new_hospital_id, transfer_reason },
    created_at: now,
    profiles: { id: user.profileId, full_name: user.name || "Medical Officer", role: user.role },
  };
  mockReferralEventsStore.push(event);

  if (isConfigured) {
    await supabase.from("referrals").update({
      previous_hospital_id: prevHospitalId,
      destination_hospital_id: new_hospital_id,
      transfer_reason,
      status: "created",
      updated_at: now,
    }).eq("id", referralId).catch(() => {});
    await Promise.resolve(supabase.from("referral_events").insert(event)).catch(() => {});
  }

  await auditService.logAuditEvent({
    actor_id: user.profileId,
    action: "REFERRAL_DESTINATION_TRANSFERRED",
    entity_type: "referrals",
    entity_id: referralId,
    metadata: { previous_hospital_id: prevHospitalId, new_hospital_id, transfer_reason },
  });

  return referral;
};

/**
 * Cancel Referral with Mandatory Reason & Audit Trail (Phase 22)
 */
const cancelReferral = async (user, referralId, { cancellation_reason, cancellation_notes } = {}) => {
  const referral = mockReferralsStore.find((r) => r.id === referralId);
  if (!referral) {
    const err = new Error(`Referral not found: ${referralId}`);
    err.statusCode = 404;
    throw err;
  }

  if (user.role === "patient") {
    const err = new Error("Forbidden: Patients cannot directly delete or cancel administrative referral records.");
    err.statusCode = 403;
    throw err;
  }

  const validReasons = [
    "PATIENT_DECLINED",
    "DUPLICATE_REFERRAL",
    "CLINICALLY_CHANGED_BY_AUTHORIZED_PROVIDER",
    "TRANSFERRED_TO_OTHER_FACILITY",
    "ADMINISTRATIVE_ERROR",
    "OTHER",
  ];

  const normalizedReason = (cancellation_reason || "OTHER").toUpperCase();
  if (!validReasons.includes(normalizedReason)) {
    const err = new Error(`Invalid cancellation reason: Must be one of ${validReasons.join(", ")}`);
    err.statusCode = 400;
    throw err;
  }

  const now = new Date().toISOString();
  referral.status = "cancelled";
  referral.cancellation_reason = normalizedReason;
  referral.cancellation_notes = cancellation_notes || `Referral cancelled: ${normalizedReason}`;
  referral.cancelled_by = user.profileId;
  referral.cancelled_at = now;
  referral.updated_at = now;

  const event = {
    id: `rev-${Date.now()}`,
    referral_id: referral.id,
    stage: "cancelled",
    event_title: "Referral Cancelled",
    note: `Referral cancelled. Reason: ${normalizedReason}. Notes: ${cancellation_notes || "N/A"}`,
    actor_id: user.profileId,
    metadata: { cancellation_reason: normalizedReason, cancellation_notes },
    created_at: now,
    profiles: { id: user.profileId, full_name: user.name || "Staff", role: user.role },
  };
  mockReferralEventsStore.push(event);

  if (isConfigured) {
    await supabase.from("referrals").update({
      status: "cancelled",
      cancellation_reason: normalizedReason,
      cancellation_notes,
      cancelled_by: user.profileId,
      cancelled_at: now,
      updated_at: now,
    }).eq("id", referralId).catch(() => {});
    await Promise.resolve(supabase.from("referral_events").insert(event)).catch(() => {});
  }

  await auditService.logAuditEvent({
    actor_id: user.profileId,
    action: "REFERRAL_CANCELLED",
    entity_type: "referrals",
    entity_id: referralId,
    metadata: { cancellation_reason: normalizedReason, cancellation_notes },
  });

  return referral;
};

/**
 * Stuck Referral & Overdue Follow-up Detection Engine (Phase 22)
 */
const evaluateStuckReferrals = async () => {
  const activeReferrals = mockReferralsStore.filter(
    (r) => !["completed", "closed", "cancelled"].includes(r.status)
  );

  let stuckCount = 0;
  let overdueFollowups = 0;
  const now = new Date();

  for (const ref of activeReferrals) {
    const elapsedHours = (now.getTime() - new Date(ref.updated_at).getTime()) / (3600 * 1000);

    // Overdue follow-up check
    if (ref.follow_up_due_date && ref.follow_up_status === "PENDING") {
      if (now > new Date(ref.follow_up_due_date)) {
        ref.follow_up_status = "OVERDUE";
        overdueFollowups++;
      }
    }

    // Stuck timeout check
    if (ref.status === "destination_accepted" && elapsedHours > 8) {
      ref.stuck_status = "TRANSPORT_PENDING_TIMEOUT";
      stuckCount++;
    } else if (ref.status === "patient_departed" && elapsedHours > 12) {
      ref.stuck_status = "ARRIVAL_PENDING_TIMEOUT";
      stuckCount++;
    } else if (ref.status === "hospital_arrived" && elapsedHours > 24) {
      ref.stuck_status = "TREATMENT_PENDING_TIMEOUT";
      stuckCount++;
    }
  }

  return {
    total_active_evaluated: activeReferrals.length,
    stuck_referrals_count: stuckCount,
    overdue_followups_count: overdueFollowups,
    timestamp: now.toISOString(),
  };
};

module.exports = {
  VALID_REFERRAL_TRANSITIONS,
  STAGE_PERMISSIONS,
  validateFacilityScope,
  getReferrals,
  getReferralById,
  createReferral,
  updateReferralStatus,
  updateReferral,
  flagFollowUp,
  getReferralEvents,
  addReferralEvent,
  assignTransport,
  scheduleFollowUp,
  completeFollowUp,
  getClosedLoopAnalytics,
  acknowledgeReferralByPatient,
  confirmHospitalArrival,
  acceptReferral,
  recordHospitalTreatment,
  transferReferral,
  cancelReferral,
  evaluateStuckReferrals,
};
