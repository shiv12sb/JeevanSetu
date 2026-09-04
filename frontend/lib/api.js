import { supabase, isSupabaseConfigured } from "./supabase/client";

const getBaseApiUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl) {
    const clean = envUrl.replace(/\/$/, "");
    return clean.endsWith("/api") ? clean : `${clean}/api`;
  }
  // In production builds, strictly use the verified production HTTPS backend
  if (process.env.NODE_ENV === "production") {
    return "https://jeevansetu-backend.onrender.com/api";
  }
  // In Capacitor Android mobile app or browser non-port-3000
  if (typeof window !== "undefined") {
    const isCapacitor = Boolean(window.Capacitor) || window.location.protocol === "https:";
    const isDesktopDev = window.location.hostname === "localhost" && window.location.port === "3000";
    if (isCapacitor || !isDesktopDev) {
      return "https://jeevansetu-backend.onrender.com/api";
    }
  }
  return "http://localhost:5000/api";
};

const API_BASE_URL = getBaseApiUrl();

/**
 * Retrieve the current Supabase session access token
 */
async function getAuthToken() {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch (err) {
    console.warn("Failed to get Supabase session token:", err);
    return null;
  }
}

/**
 * Standardized HTTP Request Helper
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const token = await getAuthToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutMs = options.timeout || 3500;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const config = {
    ...options,
    headers,
    signal: options.signal || controller.signal,
  };

  try {
    const res = await fetch(url, config);
    clearTimeout(timeoutId);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const error = new Error(data.message || `API Error: ${res.status} ${res.statusText}`);
      error.statusCode = res.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError" || (err.name === "TypeError" && err.message.includes("fetch"))) {
      const netError = new Error("Unable to connect to backend server in time.");
      netError.statusCode = 504;
      throw netError;
    }
    throw err;
  }
}

// 1. Profile API
export const profileApi = {
  get: () => request("/profile"),
  update: (profileData) =>
    request("/profile", {
      method: "PATCH",
      body: JSON.stringify(profileData),
    }),
};

// 2. Health Cases API
export const casesApi = {
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/cases${query ? `?${query}` : ""}`);
  },
  getById: (id) => request(`/cases/${id}`),
  create: (caseData) =>
    request("/cases", {
      method: "POST",
      body: JSON.stringify(caseData),
    }),
  update: (id, caseData) =>
    request(`/cases/${id}`, {
      method: "PATCH",
      body: JSON.stringify(caseData),
    }),
  getVitals: (id) => request(`/cases/${id}/vitals`),
  addVitals: (id, vitalsData) =>
    request(`/cases/${id}/vitals`, {
      method: "POST",
      body: JSON.stringify(vitalsData),
    }),
};

// 3. Referrals & Follow-Up Intelligence API
export const referralsApi = {
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/referrals${query ? `?${query}` : ""}`);
  },
  getById: (id) => request(`/referrals/${id}`),
  create: (referralData) =>
    request("/referrals", {
      method: "POST",
      body: JSON.stringify(referralData),
    }),
  update: (id, referralData) =>
    request(`/referrals/${id}`, {
      method: "PATCH",
      body: JSON.stringify(referralData),
    }),
  flagFollowUp: (id, followUpData = {}) =>
    request(`/referrals/${id}/follow-up`, {
      method: "POST",
      body: JSON.stringify(followUpData),
    }),
  getEvents: (id) => request(`/referrals/${id}/events`),
  addEvent: (id, eventData) =>
    request(`/referrals/${id}/events`, {
      method: "POST",
      body: JSON.stringify(eventData),
    }),
  getFollowUps: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/referrals/follow-ups${query ? `?${query}` : ""}`);
  },
  getFollowUpById: (id) => request(`/referrals/follow-ups/${id}`),
  overrideFollowUp: (id, overrideData) =>
    request(`/referrals/follow-ups/${id}/override`, {
      method: "POST",
      body: JSON.stringify(overrideData),
    }),
  getFollowUpAnalytics: () => request("/referrals/follow-ups/analytics"),
  assignTransport: (id, transportData) =>
    request(`/referrals/${id}/transport`, {
      method: "POST",
      body: JSON.stringify(transportData),
    }),
  scheduleFollowUp: (id, followUpData) =>
    request(`/referrals/${id}/follow-up`, {
      method: "POST",
      body: JSON.stringify(followUpData),
    }),
  completeFollowUp: (id, completeData = {}) =>
    request(`/referrals/${id}/follow-up/complete`, {
      method: "POST",
      body: JSON.stringify(completeData),
    }),
  acknowledge: (id, ackData = {}) =>
    request(`/referrals/${id}/acknowledge`, {
      method: "POST",
      body: JSON.stringify(ackData),
    }),
  confirmArrival: (id, arrivalData = {}) =>
    request(`/referrals/${id}/arrival`, {
      method: "POST",
      body: JSON.stringify(arrivalData),
    }),
  accept: (id, acceptData = {}) =>
    request(`/referrals/${id}/accept`, {
      method: "POST",
      body: JSON.stringify(acceptData),
    }),
  recordTreatment: (id, treatmentData = {}) =>
    request(`/referrals/${id}/treatment`, {
      method: "POST",
      body: JSON.stringify(treatmentData),
    }),
  transfer: (id, transferData = {}) =>
    request(`/referrals/${id}/transfer`, {
      method: "POST",
      body: JSON.stringify(transferData),
    }),
  cancel: (id, cancelData = {}) =>
    request(`/referrals/${id}/cancel`, {
      method: "POST",
      body: JSON.stringify(cancelData),
    }),
  getTimeline: (id) => request(`/referrals/${id}/events`),
  getClosedLoopAnalytics: () => request("/referrals/analytics"),
};

// 4. Medicine Inventory & Depletion Forecasting API
export const inventoryApi = {
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/inventory${query ? `?${query}` : ""}`);
  },
  getById: (id) => request(`/inventory/${id}`),
  create: (itemData) =>
    request("/inventory", {
      method: "POST",
      body: JSON.stringify(itemData),
    }),
  update: (id, itemData) =>
    request(`/inventory/${id}`, {
      method: "PATCH",
      body: JSON.stringify(itemData),
    }),
  restock: (restockData) =>
    request("/inventory/restock", {
      method: "POST",
      body: JSON.stringify(restockData),
    }),
  recordUsage: (usageData) =>
    request("/inventory/usage", {
      method: "POST",
      body: JSON.stringify(usageData),
    }),
  adjustStock: (adjustmentData) =>
    request("/inventory/adjust", {
      method: "POST",
      body: JSON.stringify(adjustmentData),
    }),
  getUsageHistory: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/inventory/usage${query ? `?${query}` : ""}`);
  },
  getMedicines: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/inventory/master/medicines${query ? `?${query}` : ""}`);
  },
  getForecasts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/inventory/forecast${query ? `?${query}` : ""}`);
  },
  getItemForecast: (id) => request(`/inventory/${id}/forecast`),
  getTransactions: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/inventory/transactions${query ? `?${query}` : ""}`);
  },
  getReplenishments: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/inventory/replenishments${query ? `?${query}` : ""}`);
  },
  createReplenishment: (data) =>
    request("/inventory/replenishments", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateReplenishmentStatus: (id, data) =>
    request(`/inventory/replenishments/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  receiveReplenishment: (id, data) =>
    request(`/inventory/replenishments/${id}/receive`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getSupplyAnalytics: () => request("/inventory/supply-analytics"),
  getAnalytics: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/inventory/analytics${query ? `?${query}` : ""}`);
  },
  getPrediction: (id, phc_id) =>
    request(`/inventory/${id}/prediction${phc_id ? `?phc_id=${phc_id}` : ""}`),
  updateThreshold: (id, data) =>
    request(`/inventory/${id}/threshold`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getAlerts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/inventory/alerts${query ? `?${query}` : ""}`);
  },
  acknowledgeAlert: (id, data = {}) =>
    request(`/inventory/alerts/${id}/acknowledge`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  resolveAlert: (id, data = {}) =>
    request(`/inventory/alerts/${id}/resolve`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// 5. Resources Directory API
export const resourcesApi = {
  getDirectory: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/resources${query ? `?${query}` : ""}`);
  },
  getHospitals: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/resources/hospitals${query ? `?${query}` : ""}`);
  },
  getPhcs: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/resources/phcs${query ? `?${query}` : ""}`);
  },
  getNgos: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/resources/ngos${query ? `?${query}` : ""}`);
  },
  getSchemes: () => request("/resources/schemes"),
};

// 6. Notifications API
export const notificationsApi = {
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/notifications${query ? `?${query}` : ""}`);
  },
  markRead: (id) =>
    request(`/notifications/${id}/read`, {
      method: "PATCH",
    }),
  markAllRead: () =>
    request("/notifications/read-all", {
      method: "POST",
    }),
  subscribe: (profileId, onNotification) => {
    if (!isSupabaseConfigured() || !profileId) {
      return () => {};
    }

    try {
      const channel = supabase
        .channel(`public:notifications:recipient=${profileId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `recipient_id=eq.${profileId}`,
          },
          (payload) => {
            if (onNotification && payload.new) {
              onNotification(payload.new);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (err) {
      console.warn("Realtime notification subscription fallback:", err);
      return () => {};
    }
  },
};

// 7. Citizen Feedback & Quality Monitoring API
export const feedbackApi = {
  submit: (feedbackData) =>
    request("/feedback", {
      method: "POST",
      body: JSON.stringify(feedbackData),
    }),
  submitAnonymous: (feedbackData) =>
    request("/feedback/anonymous", {
      method: "POST",
      body: JSON.stringify(feedbackData),
    }),
  track: (trackingToken) => request(`/feedback/track/${trackingToken}`),
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/feedback${query ? `?${query}` : ""}`);
  },
  getById: (id) => request(`/feedback/${id}`),
  review: (id, reviewData) =>
    request(`/feedback/${id}/review`, {
      method: "POST",
      body: JSON.stringify(reviewData),
    }),
  missedCall: (data = {}) =>
    request("/feedback/missed-call", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  ivrInteract: (data) =>
    request("/feedback/ivr", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getAnalytics: () => request("/feedback/analytics"),
  getTrends: () => request("/feedback/trends"),
  getSignals: () => request("/feedback/signals"),
  updateSignal: (id, updateData) =>
    request(`/feedback/signals/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updateData),
    }),
  aiAssist: (data) =>
    request("/feedback/ai-assist", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// 8. Facilities & Doctors API
export const facilitiesApi = {
  getDoctors: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/doctors${query ? `?${query}` : ""}`);
  },
  getDoctor: (id) => request(`/doctors/${id}`),
  getDoctorProvenance: (id) => request(`/doctors/${id}/provenance`),
  checkInDoctor: (id, data = {}) =>
    request(`/doctors/${id}/check-in`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  checkOutDoctor: (id, data = {}) =>
    request(`/doctors/${id}/check-out`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getDoctorSchedule: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/doctors/schedule${query ? `?${query}` : ""}`);
  },
  getDoctorFacilities: (id) => request(`/doctors/${id}/facilities`),
  updateDoctorFacilityStatus: (id, facilityId, data = {}) =>
    request(`/doctors/${id}/facilities/${facilityId}/status`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getHospitals: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/facilities/hospitals${query ? `?${query}` : ""}`);
  },
  getHospital: (id) => request(`/facilities/hospitals/${id}`),
  getHospitalDoctors: (id) => request(`/facilities/hospitals/${id}/doctors`),
  getPhc: (id) => request(`/facilities/phcs/${id}`),
  importDoctors: (records) =>
    request("/doctors/import", {
      method: "POST",
      body: JSON.stringify({ records }),
    }),
};

export const doctorsApi = facilitiesApi;

// 9. Admin Monitoring & Audit API
export const adminApi = {
  getMonitoring: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/monitoring${query ? `?${query}` : ""}`);
  },
  getAuditLogs: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/audit-logs${query ? `?${query}` : ""}`);
  },
};

// 10. AI Assistant API (Safe Grounded Orchestration & OpenAI Realtime Voice)
export const aiApi = {
  chat: (chatData) =>
    request("/ai/chat", {
      method: "POST",
      body: JSON.stringify(chatData),
    }),
  createRealtimeSession: (sessionData = {}) =>
    request("/ai/realtime/session", {
      method: "POST",
      body: JSON.stringify(sessionData),
    }),
  executeRealtimeTool: (toolName, args = {}) =>
    request("/ai/realtime/tool-execute", {
      method: "POST",
      body: JSON.stringify({ toolName, arguments: args }),
    }),
};

// 11. Health Early-Warning Surveillance API (Phase 17 & 27)
export const earlyWarningApi = {
  getSignals: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/early-warning${query ? `?${query}` : ""}`);
  },
  getSignalById: (id) => request(`/early-warning/${id}`),
  updateStatus: (id, updateData) =>
    request(`/early-warning/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(updateData),
    }),
  review: (id, reviewData) =>
    request(`/early-warning/${id}/review`, {
      method: "POST",
      body: JSON.stringify(reviewData),
    }),
  reviewSignal: (id, reviewData) =>
    request(`/early-warning/signals/${id}/review`, {
      method: "POST",
      body: JSON.stringify(reviewData),
    }),
  getAnalytics: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/early-warning/analytics${query ? `?${query}` : ""}`);
  },
  getAiSummary: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/early-warning/ai-summary${query ? `?${query}` : ""}`);
  },
  explainWithAi: (data = {}) =>
    request("/early-warning/ai-explain", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  submitCommunityReport: (data = {}) =>
    request("/early-warning/community-reports", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getCommunityReports: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/early-warning/community-reports${query ? `?${query}` : ""}`);
  },
  evaluateFacility: (phcId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/early-warning/evaluate/${phcId}${query ? `?${query}` : ""}`);
  },
  triggerSweep: () =>
    request("/early-warning/trigger-sweep", {
      method: "POST",
    }),
};

// 12. IVR / No-Smartphone Voice Access API
export const ivrApi = {
  createSession: (data = {}) =>
    request("/ivr/session", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  interact: (data) =>
    request("/ivr/interact", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getContent: (language) => request(`/ivr/content/${language}`),
  getAnalytics: () => request("/ivr/analytics"),
  getFollowUps: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/ivr/followups${query ? `?${query}` : ""}`);
  },
  updateFollowUp: (id, updateData) =>
    request(`/ivr/followups/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updateData),
    }),
};

// 13. Doctor Presence & PHC Operational Accountability API (Phase 16 & 25)
export const doctorPresenceApi = {
  getSessions: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/doctor-presence/sessions${query ? `?${query}` : ""}`);
  },
  getSessionById: (id) => request(`/doctor-presence/sessions/${id}`),
  getSchedules: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/doctor-presence/schedules${query ? `?${query}` : ""}`);
  },
  createSchedule: (data = {}) =>
    request("/doctor-presence/schedules", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  cancelSchedule: (id, data = {}) =>
    request(`/doctor-presence/schedules/${id}/cancel`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  checkIn: (data = {}) =>
    request("/doctor-presence/check-in", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  checkOut: (data = {}) =>
    request("/doctor-presence/check-out", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getCurrentSession: () => request("/doctor-presence/current-session"),
  getSignals: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/doctor-presence/signals${query ? `?${query}` : ""}`);
  },
  getOperationalFlags: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/doctor-presence/flags${query ? `?${query}` : ""}`);
  },
  reviewSignal: (id, reviewData) =>
    request(`/doctor-presence/signals/${id}/review`, {
      method: "POST",
      body: JSON.stringify(reviewData),
    }),
  reviewFlag: (id, reviewData) =>
    request(`/doctor-presence/flags/${id}/review`, {
      method: "POST",
      body: JSON.stringify(reviewData),
    }),
  dismissFlag: (id, data = {}) =>
    request(`/doctor-presence/flags/${id}/dismiss`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  resolveFlag: (id, data = {}) =>
    request(`/doctor-presence/flags/${id}/resolve`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  addReviewNote: (id, data = {}) =>
    request(`/doctor-presence/flags/${id}/notes`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getAnalytics: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/doctor-presence/analytics${query ? `?${query}` : ""}`);
  },
  getOperationalSummary: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/doctor-presence/summary${query ? `?${query}` : ""}`);
  },
  getAISummary: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/doctor-presence/ai-summary${query ? `?${query}` : ""}`);
  },
  getAttendance: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/doctor-presence/attendance${query ? `?${query}` : ""}`);
  },
  evaluate: (data = {}) =>
    request("/doctor-presence/evaluate", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// 14. Doctor Attendance & Integrity API (Phase 21)
export const attendanceApi = {
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/attendance${query ? `?${query}` : ""}`);
  },
  getById: (id) => request(`/attendance/${id}`),
  checkIn: (data = {}) =>
    request("/attendance/check-in", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  checkOut: (data = {}) =>
    request("/attendance/check-out", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  submitExplanation: (id, data = {}) =>
    request(`/attendance/${id}/explanation`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  review: (id, data = {}) =>
    request(`/attendance/${id}/review`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  recordRetroactive: (data = {}) =>
    request("/attendance/retroactive", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getAnalytics: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/attendance/analytics${query ? `?${query}` : ""}`);
  },
};

// 15. Automation, n8n & Outbox Orchestration API (Phase 28)
export const automationApi = {
  getHealth: () => request("/automation/health"),
  getMetrics: () => request("/automation/metrics"),
  getEvents: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/automation/events${query ? `?${query}` : ""}`);
  },
  retryEvent: (id) =>
    request(`/automation/events/${id}/retry`, {
      method: "POST",
    }),
  triggerWorker: () =>
    request("/automation/events/trigger-worker", {
      method: "POST",
    }),
  getPreferences: () => request("/automation/preferences"),
  updatePreferences: (data = {}) =>
    request("/automation/preferences", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};

// 16. Observability, Monitoring & Health Probes API (Phase 29)
export const operationsApi = {
  getOverview: () => request("/operations/overview"),
  getMetrics: () => request("/operations/metrics"),
  getErrors: (limit = 50) => request(`/operations/errors?limit=${limit}`),
  getJobs: () => request("/operations/jobs"),
  getSecurity: (limit = 50) => request(`/operations/security?limit=${limit}`),
  testAlert: (data = {}) =>
    request("/operations/alerts/test", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getHealth: () => request("/health"),
  getLiveness: () => request("/health/live"),
  getReadiness: () => request("/health/ready"),
};

// 17. Real-Time Ambulance Access & Tracking API
export const ambulanceApi = {
  searchNearby: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/ambulances/nearby${query ? `?${query}` : ""}`);
  },
  getDetails: (id) => request(`/ambulances/details/${id}`),
  getFareEstimate: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/ambulances/fare-estimate${query ? `?${query}` : ""}`);
  },
  createRequest: (requestData) =>
    request("/ambulances/requests", {
      method: "POST",
      body: JSON.stringify(requestData),
    }),
  getRequestStatus: (requestId) => request(`/ambulances/requests/${requestId}`),
  cancelRequest: (requestId, reason) =>
    request(`/ambulances/requests/${requestId}/cancel`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),
  getCrew: (tripId) => request(`/ambulances/trips/${tripId}/crew`),
  getTripLocation: (tripId) => request(`/ambulances/trips/${tripId}/location`),
  completeTrip: (tripId, data = {}) =>
    request(`/ambulances/trips/${tripId}/complete`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// 18. Rural Access API
export const ruralAccessApi = {
  getIvrFlow: (lang = "mr") => request(`/rural-access/ivr-flow?lang=${lang}`),
  requestOutboundVoiceCall: (data) =>
    request("/rural-access/outbound-voice-call", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  handleIvrDtmfAction: (data) =>
    request("/rural-access/ivr-webhook", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getAshaQueue: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/rural-access/asha-queue${query ? `?${query}` : ""}`);
  },
  updateAshaQueueStatus: (id, data) =>
    request(`/rural-access/asha-queue/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  submitAssistedRequest: (data) =>
    request("/rural-access/assisted-request", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// 19. Community Health API
export const communityHealthApi = {
  getCampaigns: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/community-health/campaigns${query ? `?${query}` : ""}`);
  },
  createCampaign: (data) =>
    request("/community-health/campaigns", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export default {
  profile: profileApi,
  cases: casesApi,
  referrals: referralsApi,
  inventory: inventoryApi,
  resources: resourcesApi,
  notifications: notificationsApi,
  feedback: feedbackApi,
  facilities: facilitiesApi,
  admin: adminApi,
  ai: aiApi,
  earlyWarning: earlyWarningApi,
  ivr: ivrApi,
  doctorPresence: doctorPresenceApi,
  attendance: attendanceApi,
  automation: automationApi,
  operations: operationsApi,
  ambulance: ambulanceApi,
  ruralAccess: ruralAccessApi,
  communityHealth: communityHealthApi,
};
