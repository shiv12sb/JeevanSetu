/**
 * User Roles in JeevanSetu
 */
export const USER_ROLES = {
  PATIENT: "patient",
  PHC_STAFF: "phc_staff",
  DOCTOR: "doctor",
  HOSPITAL: "hospital_staff",
  NGO: "ngo_staff",
  ADMIN: "district_admin",
  // Aliases for compatibility
  HOSPITAL_SHORT: "hospital",
  NGO_SHORT: "ngo",
  ADMIN_SHORT: "admin",
};

export const ROLE_LABELS = {
  [USER_ROLES.PATIENT]: "Patient / Citizen",
  [USER_ROLES.PHC_STAFF]: "PHC Staff / ASHA",
  [USER_ROLES.DOCTOR]: "Doctor / Specialist",
  [USER_ROLES.HOSPITAL]: "Hospital Administrator",
  [USER_ROLES.NGO]: "NGO / Aid Worker",
  [USER_ROLES.ADMIN]: "District Health Admin",
  // Aliases
  hospital: "Hospital Administrator",
  ngo: "NGO / Aid Worker",
  admin: "District Health Admin",
};

/**
 * 6-Stage Referral Workflow Statuses
 */
export const REFERRAL_STAGES = [
  { key: "created", label: "Created", description: "Referral initiated by PHC" },
  { key: "notified", label: "Notified", description: "Destination facility alerted" },
  { key: "accepted", label: "Accepted", description: "Bed/Specialist confirmed" },
  { key: "hospital_reached", label: "Hospital Reached", description: "Patient arrived at facility" },
  { key: "treatment_started", label: "Treatment Started", description: "Consultation/care active" },
  { key: "completed", label: "Completed", description: "Care finalized & follow-up noted" },
];

/**
 * Medicine Inventory Depletion Risk Thresholds
 */
export const INVENTORY_STATUS = {
  SUFFICIENT: "sufficient",
  DEPLETING: "depleting",
  CRITICAL: "critical",
  OUT_OF_STOCK: "out_of_stock",
};

/**
 * Resource Directory Categories
 */
export const RESOURCE_CATEGORIES = [
  { id: "all", label: "All Resources" },
  { id: "hospitals", label: "Verified Hospitals" },
  { id: "schemes", label: "Government Schemes" },
  { id: "ngos", label: "NGOs & Financial Aid" },
];

/**
 * Supported Languages
 */
export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी (Hindi)" },
  { code: "mr", label: "मराठी (Marathi)" },
];
