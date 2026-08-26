const { supabase, isConfigured } = require("../config/supabase");
const auditService = require("./audit.service");
const notificationService = require("./notification.service");

/**
 * Valid case status state machine transitions
 */
const VALID_STATUS_TRANSITIONS = {
  open: ["referred", "in_treatment", "resolved", "closed"],
  referred: ["in_treatment", "resolved", "closed"],
  in_treatment: ["resolved", "closed"],
  resolved: ["closed", "in_treatment"],
  closed: [], // Terminal
};

/**
 * Helper to generate unique case numbers
 */
const generateCaseNumber = () => {
  const hex = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `JVS-MH-${hex}`;
};

/**
 * In-memory fallback cases store for dev/preview
 */
const mockCasesStore = [
  {
    id: "c1a2b3c4-5d6e-7f8a-9b0c-1d2e3f4a5b6c",
    case_number: "JVS-MH-7A82K1",
    patient_id: "p1",
    caregiver_mode: "myself",
    primary_concern: "Severe persistent chest tightness on exertion with breathlessness and palpitations.",
    category: "Cardiology",
    urgency: "urgent",
    status: "open",
    initial_phc_id: "phc-1",
    notes: "Referred for tertiary echocardiogram and angiographic workup.",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    profiles: { id: "p1", full_name: "Rameshwar Patil", phone: "+91 98234 11204", village: "Ashti", district: "Gadchiroli", abha_id: "91-2041-8832-11", pmjay_status: "Verified Active" },
    phcs: { id: "phc-1", name: "Ashti Primary Health Centre", facility_code: "PHC-MH-2041" },
  },
];

const mockVitalsStore = [
  {
    id: "v1a2b3c4-5d6e-7f8a-9b0c-1d2e3f4a5b6c",
    case_id: "c1a2b3c4-5d6e-7f8a-9b0c-1d2e3f4a5b6c",
    systolic_bp: 145,
    diastolic_bp: 95,
    pulse_rate: 88,
    blood_sugar: 142.0,
    hemoglobin: 12.8,
    temperature: 98.4,
    notes: "Elevated BP on primary triage, regular pulse rhythm.",
    recorded_by_id: "doc-1",
    recorded_at: new Date(Date.now() - 80000000).toISOString(),
    profiles: { id: "doc-1", full_name: "Dr. Ananya Deshmukh", role: "doctor" },
  },
];

/**
 * Service: List health cases with role-based scoping
 */
const getCases = async (user, { status, category, urgency, limit = 20, offset = 0 } = {}) => {
  if (!isConfigured) {
    let list = [...mockCasesStore];
    if (user.role === "patient" && user.profileId) {
      list = list.filter((c) => c.patient_id === user.profileId || c.patient_id === "p1");
    } else if (user.role === "phc_staff" && user.assignedPhcId) {
      list = list.filter((c) => c.initial_phc_id === user.assignedPhcId || c.initial_phc_id === "phc-1");
    }

    if (status) list = list.filter((c) => c.status === status);
    if (category) list = list.filter((c) => c.category === category);
    if (urgency) list = list.filter((c) => c.urgency === urgency);

    return {
      items: list.slice(offset, offset + limit),
      total: list.length,
    };
  }

  let query = supabase
    .from("health_cases")
    .select("*, profiles!patient_id(id, full_name, phone, village, district, abha_id, pmjay_status), phcs(id, name, facility_code)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  // Role scoping
  if (user.role === "patient") {
    if (!user.profileId) return { items: [], total: 0 };
    query = query.eq("patient_id", user.profileId);
  } else if (user.role === "phc_staff" && user.assignedPhcId) {
    query = query.eq("initial_phc_id", user.assignedPhcId);
  }

  if (status) query = query.eq("status", status);
  if (category) query = query.eq("category", category);
  if (urgency) query = query.eq("urgency", urgency);

  const { data, error, count } = await query;
  if (error) throw error;
  return { items: data || [], total: count || 0 };
};

/**
 * Service: Retrieve single health case by ID
 */
const getCaseById = async (user, caseId) => {
  if (!isConfigured) {
    const item = mockCasesStore.find((c) => c.id === caseId) || mockCasesStore[0];
    if (user.role === "patient" && user.profileId && item.patient_id !== user.profileId) {
      const forbiddenError = new Error("Access forbidden: You are not authorized to view this health case.");
      forbiddenError.statusCode = 403;
      throw forbiddenError;
    }
    return item;
  }

  let query = supabase
    .from("health_cases")
    .select("*, profiles!patient_id(id, full_name, phone, village, district, abha_id, pmjay_status), phcs(id, name, facility_code), health_case_vitals(*)")
    .eq("id", caseId)
    .single();

  const { data, error } = await query;
  if (error) throw error;

  // Authorization check: patient cannot view another patient's case
  if (user.role === "patient" && data.patient_id !== user.profileId) {
    const forbiddenError = new Error("Access forbidden: You are not authorized to view this health case.");
    forbiddenError.statusCode = 403;
    throw forbiddenError;
  }

  return data;
};

/**
 * Service: Create new health case
 */
const createCase = async (user, caseData) => {
  // If user is a patient, enforce their own profile ID strictly
  const patientId = user.role === "patient" ? user.profileId : (caseData.patient_id || user.profileId);

  const payload = {
    case_number: generateCaseNumber(),
    patient_id: patientId,
    caregiver_mode: caseData.caregiver_mode || "myself",
    primary_concern: caseData.primary_concern,
    category: caseData.category,
    urgency: caseData.urgency || "routine",
    status: "open",
    initial_phc_id: caseData.initial_phc_id || user.assignedPhcId || null,
    notes: caseData.notes || null,
  };

  let newCase = null;

  if (!isConfigured) {
    newCase = {
      id: `case-${Date.now()}`,
      ...payload,
      created_at: new Date().toISOString(),
      profiles: { id: patientId, full_name: "Patient User", phone: "+91 98000 00000" },
    };
    mockCasesStore.unshift(newCase);
  } else {
    const { data, error } = await supabase
      .from("health_cases")
      .insert(payload)
      .select("*, profiles!patient_id(id, full_name, phone, village, district, abha_id, pmjay_status), phcs(id, name, facility_code)")
      .single();

    if (error) throw error;
    newCase = data;
  }

  // 1. Audit Log
  await auditService.logAuditEvent({
    actor_id: user.profileId,
    action: "CASE_CREATED",
    entity_type: "health_case",
    entity_id: newCase.id,
    metadata: {
      case_number: newCase.case_number,
      category: newCase.category,
      urgency: newCase.urgency,
      initial_phc_id: newCase.initial_phc_id,
    },
  });

  // 2. Dispatch In-App Notification
  await notificationService.notifyCaseCreated(newCase).catch((err) => {
    console.warn("Case creation notification warning:", err.message);
  });

  return newCase;
};

/**
 * Service: Update case status or details with state-machine transition validation
 */
const updateCase = async (user, caseId, updateData) => {
  const existing = await getCaseById(user, caseId);

  // Validate status transition if status is being updated
  if (updateData.status && updateData.status !== existing.status) {
    const allowed = VALID_STATUS_TRANSITIONS[existing.status] || [];
    if (!allowed.includes(updateData.status)) {
      const transitionErr = new Error(
        `Invalid case status transition from '${existing.status}' to '${updateData.status}'. Allowed transitions: [${allowed.join(", ") || "none - terminal state"}].`
      );
      transitionErr.statusCode = 400;
      throw transitionErr;
    }
  }

  const allowedUpdates = {};
  if (updateData.status) allowedUpdates.status = updateData.status;
  if (updateData.urgency) allowedUpdates.urgency = updateData.urgency;
  if (updateData.notes !== undefined) allowedUpdates.notes = updateData.notes;
  allowedUpdates.updated_at = new Date().toISOString();

  let updatedCase = null;

  if (!isConfigured) {
    const index = mockCasesStore.findIndex((c) => c.id === caseId);
    updatedCase = {
      ...existing,
      ...allowedUpdates,
    };
    if (index !== -1) mockCasesStore[index] = updatedCase;
  } else {
    const { data, error } = await supabase
      .from("health_cases")
      .update(allowedUpdates)
      .eq("id", caseId)
      .select("*, profiles!patient_id(id, full_name, phone, village, district, abha_id, pmjay_status), phcs(id, name, facility_code)")
      .single();

    if (error) throw error;
    updatedCase = data;
  }

  // 1. Audit Log
  await auditService.logAuditEvent({
    actor_id: user.profileId,
    action: "CASE_UPDATED",
    entity_type: "health_case",
    entity_id: caseId,
    metadata: {
      previous_status: existing.status,
      new_status: updatedCase.status,
      urgency: updatedCase.urgency,
    },
  });

  // 2. Notification on status change
  if (updateData.status && updateData.status !== existing.status) {
    await notificationService.notifyCaseStatusChanged(
      updatedCase,
      existing.status,
      updateData.status
    ).catch((err) => {
      console.warn("Case status change notification warning:", err.message);
    });
  }

  return updatedCase;
};

/**
 * Service: Get case vitals
 */
const getCaseVitals = async (user, caseId) => {
  // Verify access to case first
  await getCaseById(user, caseId);

  if (!isConfigured) {
    return mockVitalsStore.filter((v) => v.case_id === caseId || v.case_id === "c1a2b3c4-5d6e-7f8a-9b0c-1d2e3f4a5b6c");
  }

  const { data, error } = await supabase
    .from("health_case_vitals")
    .select("*, profiles!recorded_by_id(id, full_name, role)")
    .eq("case_id", caseId)
    .order("recorded_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

/**
 * Service: Add case vitals (Clinical observation by medical staff)
 */
const addCaseVitals = async (user, caseId, vitalsData) => {
  // Verify access to case
  const existingCase = await getCaseById(user, caseId);

  const payload = {
    case_id: caseId,
    systolic_bp: vitalsData.systolic_bp || null,
    diastolic_bp: vitalsData.diastolic_bp || null,
    blood_sugar: vitalsData.blood_sugar || null,
    hemoglobin: vitalsData.hemoglobin || null,
    temperature: vitalsData.temperature || null,
    pulse_rate: vitalsData.pulse_rate || null,
    notes: vitalsData.notes || null,
    recorded_by_id: user.profileId || null,
  };

  let newVitals = null;

  if (!isConfigured) {
    newVitals = {
      id: `vit-${Date.now()}`,
      ...payload,
      recorded_at: new Date().toISOString(),
      profiles: { id: user.profileId, full_name: "Clinical Staff", role: user.role },
    };
    mockVitalsStore.unshift(newVitals);
  } else {
    const { data, error } = await supabase
      .from("health_case_vitals")
      .insert(payload)
      .select("*, profiles!recorded_by_id(id, full_name, role)")
      .single();

    if (error) throw error;
    newVitals = data;
  }

  // Audit Log
  await auditService.logAuditEvent({
    actor_id: user.profileId,
    action: "VITALS_RECORDED",
    entity_type: "health_case_vitals",
    entity_id: newVitals.id,
    metadata: {
      case_id: caseId,
      case_number: existingCase.case_number,
      systolic_bp: payload.systolic_bp,
      diastolic_bp: payload.diastolic_bp,
      blood_sugar: payload.blood_sugar,
      hemoglobin: payload.hemoglobin,
      temperature: payload.temperature,
      pulse_rate: payload.pulse_rate,
    },
  });

  return newVitals;
};

module.exports = {
  getCases,
  getCaseById,
  createCase,
  updateCase,
  getCaseVitals,
  addCaseVitals,
};
