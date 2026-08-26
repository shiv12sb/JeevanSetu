const { supabase, isConfigured } = require("../config/supabase");

// Transient in-memory notification store for development/preview when Supabase is offline
let mockNotificationsStore = [
  {
    id: "notif-1",
    recipient_id: "mock-profile-id",
    type: "referral_update",
    title: "Referral Accepted",
    message: "Your referral to District Civil Hospital Gadchiroli has been accepted.",
    channel: "in_app",
    is_read: false,
    delivery_status: "delivered",
    metadata: { referral_number: "REF-2026-1049", stage: "destination_accepted" },
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "notif-2",
    recipient_id: "mock-profile-id",
    type: "medicine_stock_alert",
    title: "Low Stock Alert: Atorvastatin 10mg",
    message: "Atorvastatin 10mg stock at Ashti PHC is below safety threshold (120 units left).",
    channel: "in_app",
    is_read: false,
    delivery_status: "delivered",
    metadata: { medicine_name: "Atorvastatin 10mg", phc_id: "phc-1" },
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
];

/**
 * Create a single notification with duplicate protection (Idempotent)
 */
const createNotification = async ({
  recipient_id,
  type = "system_alert",
  title,
  message,
  channel = "in_app",
  metadata = {},
}) => {
  if (!recipient_id) return null;

  // Duplicate check: Prevent duplicate unread notifications for the same entity event within active window
  if (isConfigured) {
    let duplicateQuery = supabase
      .from("notifications")
      .select("id, created_at")
      .eq("recipient_id", recipient_id)
      .eq("type", type)
      .eq("is_read", false);

    if (metadata.dedup_key) {
      duplicateQuery = duplicateQuery.contains("metadata", { dedup_key: metadata.dedup_key });
    }

    const { data: existing } = await duplicateQuery.limit(1);
    if (existing && existing.length > 0) {
      return existing[0];
    }
  } else {
    const isDuplicate = mockNotificationsStore.some(
      (n) =>
        n.recipient_id === recipient_id &&
        n.type === type &&
        !n.is_read &&
        ((metadata.dedup_key && n.metadata?.dedup_key === metadata.dedup_key) ||
          n.title === title)
    );
    if (isDuplicate) {
      return mockNotificationsStore.find((n) => n.recipient_id === recipient_id && n.type === type);
    }
  }

  const payload = {
    recipient_id,
    type,
    title,
    message,
    channel,
    is_read: false,
    delivery_status: "sent",
    metadata: metadata || {},
  };

  if (!isConfigured) {
    const fakeNotif = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...payload,
      created_at: new Date().toISOString(),
    };
    mockNotificationsStore.unshift(fakeNotif);

    // Record outbox event asynchronously
    try {
      const eventService = require("./automation/event.service");
      eventService.createEvent({
        event_type: `NOTIFICATION_${type.toUpperCase()}`,
        aggregate_type: "notification",
        aggregate_id: fakeNotif.id,
        payload: {
          recipient_id,
          type,
          title,
          message,
          channel,
        },
        idempotency_key: metadata.dedup_key || `dedup_notif_${fakeNotif.id}`,
      }).catch(() => {});
    } catch (e) {}

    return fakeNotif;
  }

  const { data, error } = await supabase
    .from("notifications")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("Failed to insert notification:", error);
    return null;
  }

  // Record outbox event asynchronously
  try {
    const eventService = require("./automation/event.service");
    eventService.createEvent({
      event_type: `NOTIFICATION_${type.toUpperCase()}`,
      aggregate_type: "notification",
      aggregate_id: data.id,
      payload: {
        recipient_id,
        type,
        title,
        message,
        channel,
      },
      idempotency_key: metadata.dedup_key || `dedup_notif_${data.id}`,
    }).catch(() => {});
  } catch (e) {}

  return data;
};

/**
 * Event Trigger: Health Case Created
 */
const notifyCaseCreated = async (healthCase) => {
  if (!healthCase || !healthCase.patient_id) return null;

  // 1. Notify Patient
  await createNotification({
    recipient_id: healthCase.patient_id,
    type: "system_alert",
    title: "Health Case Registered",
    message: `Your health case (${healthCase.case_number}) has been created and assigned for primary clinical review.`,
    channel: "in_app",
    metadata: {
      case_id: healthCase.id,
      case_number: healthCase.case_number,
      dedup_key: `case_created_${healthCase.id}`,
    },
  });

  // 2. Notify assigned PHC staff if initial_phc_id present
  if (healthCase.initial_phc_id) {
    let staffProfiles = [];
    if (isConfigured) {
      const { data } = await supabase
        .from("profiles")
        .select("id")
        .eq("assigned_phc_id", healthCase.initial_phc_id)
        .in("role", ["phc_staff", "doctor"]);
      staffProfiles = data || [];
    }
    for (const staff of staffProfiles) {
      await createNotification({
        recipient_id: staff.id,
        type: "system_alert",
        title: "New Incoming Patient Case",
        message: `New case ${healthCase.case_number} (${healthCase.category} - ${healthCase.urgency}) received for clinical evaluation.`,
        channel: "in_app",
        metadata: {
          case_id: healthCase.id,
          case_number: healthCase.case_number,
          dedup_key: `incoming_case_${healthCase.id}_${staff.id}`,
        },
      });
    }
  }
};

/**
 * Event Trigger: Health Case Status Changed
 */
const notifyCaseStatusChanged = async (healthCase, previousStatus, newStatus) => {
  if (!healthCase || !healthCase.patient_id || previousStatus === newStatus) return null;

  const formattedStatus = newStatus.replace(/_/g, " ").toUpperCase();

  return createNotification({
    recipient_id: healthCase.patient_id,
    type: "system_alert",
    title: `Case Status Update: ${formattedStatus}`,
    message: `Your health case (${healthCase.case_number}) status has been updated to: ${formattedStatus}.`,
    channel: "in_app",
    metadata: {
      case_id: healthCase.id,
      case_number: healthCase.case_number,
      previous_status: previousStatus,
      new_status: newStatus,
      dedup_key: `case_status_${healthCase.id}_${newStatus}`,
    },
  });
};

/**
 * Event Trigger: Referral Created
 */
const notifyReferralCreated = async (referral) => {
  if (!referral || !referral.patient_id) return null;

  // 1. Notify Patient
  await createNotification({
    recipient_id: referral.patient_id,
    type: "referral_update",
    title: "New Clinical Referral Initiated",
    message: `Your referral (${referral.referral_number}) to the specialty facility has been created and transmitted.`,
    channel: "in_app",
    metadata: {
      referral_id: referral.id,
      referral_number: referral.referral_number,
      stage: "created",
      dedup_key: `ref_created_${referral.id}`,
    },
  });

  // 2. Notify Destination Hospital Staff
  if (referral.destination_hospital_id && isConfigured) {
    const { data: hospitalStaff } = await supabase
      .from("profiles")
      .select("id")
      .in("role", ["hospital_staff", "doctor"]);
    
    for (const staff of (hospitalStaff || [])) {
      await createNotification({
        recipient_id: staff.id,
        type: "referral_update",
        title: "Incoming Specialty Referral",
        message: `New referral ${referral.referral_number} (${referral.required_specialty}, ${referral.priority} priority) received.`,
        channel: "in_app",
        metadata: {
          referral_id: referral.id,
          referral_number: referral.referral_number,
          dedup_key: `hosp_ref_${referral.id}_${staff.id}`,
        },
      });
    }
  }
};

/**
 * Event Trigger: Referral Status Changed
 */
const notifyReferralStatusChanged = async (referral, previousStatus, newStatus) => {
  if (!referral || !referral.patient_id || previousStatus === newStatus) return null;

  const formattedStage = newStatus.replace(/_/g, " ").toUpperCase();

  return createNotification({
    recipient_id: referral.patient_id,
    type: "referral_update",
    title: `Referral Status: ${formattedStage}`,
    message: `Your referral (${referral.referral_number}) progress has advanced to: ${formattedStage}.`,
    channel: "in_app",
    metadata: {
      referral_id: referral.id,
      referral_number: referral.referral_number,
      previous_status: previousStatus,
      new_status: newStatus,
      dedup_key: `ref_status_${referral.id}_${newStatus}`,
    },
  });
};

/**
 * Event Trigger: Referral Follow-Up Required
 */
const notifyReferralFollowUpRequired = async (referral, reason = "Stage progression threshold reached") => {
  if (!referral) return null;

  const results = [];

  // Notify PHC staff assigned to originating facility
  if (referral.originating_phc_id && isConfigured) {
    const { data: phcStaff } = await supabase
      .from("profiles")
      .select("id")
      .eq("assigned_phc_id", referral.originating_phc_id)
      .in("role", ["phc_staff", "doctor", "district_admin"]);

    for (const staff of (phcStaff || [])) {
      const notif = await createNotification({
        recipient_id: staff.id,
        type: "referral_update",
        title: `Follow-up Required: ${referral.referral_number}`,
        message: `Referral for patient requires clinical follow-up coordination (${reason}). Current status: ${referral.status}.`,
        channel: "in_app",
        metadata: {
          referral_id: referral.id,
          referral_number: referral.referral_number,
          follow_up_reason: reason,
          dedup_key: `ref_followup_${referral.id}_${staff.id}`,
        },
      });
      if (notif) results.push(notif);
    }
  } else if (!isConfigured) {
    const notif = await createNotification({
      recipient_id: "mock-profile-id",
      type: "referral_update",
      title: `Follow-up Required: ${referral.referral_number}`,
      message: `Referral for patient requires follow-up coordination (${reason}). Current status: ${referral.status}.`,
      channel: "in_app",
      metadata: {
        referral_id: referral.id,
        referral_number: referral.referral_number,
        follow_up_reason: reason,
        dedup_key: `ref_followup_${referral.id}`,
      },
    });
    if (notif) results.push(notif);
  }

  return results;
};

/**
 * Event Trigger: Medicine Low Stock Alert (Deterministic)
 */
const notifyMedicineLowStock = async ({ phc_id, medicine_id, medicine_name, current_qty, threshold }) => {
  if (!phc_id || !medicine_id) return null;

  let staffProfiles = [];
  if (isConfigured) {
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .or(`assigned_phc_id.eq.${phc_id},role.eq.district_admin`)
      .in("role", ["phc_staff", "doctor", "district_admin"]);
    staffProfiles = data || [];
  } else {
    staffProfiles = [{ id: "mock-profile-id" }];
  }

  const medName = medicine_name || "Essential Drug";
  const results = [];

  for (const staff of staffProfiles) {
    const notif = await createNotification({
      recipient_id: staff.id,
      type: "medicine_stock_alert",
      title: `Low Stock Alert: ${medName}`,
      message: `${medName} stock is critical (${current_qty} units remaining, minimum threshold: ${threshold}). Please arrange restock.`,
      channel: "in_app",
      metadata: {
        phc_id,
        medicine_id,
        current_qty,
        threshold,
        dedup_key: `low_stock_${phc_id}_${medicine_id}`,
      },
    });
    if (notif) results.push(notif);
  }

  return results;
};

/**
 * Event Trigger: Doctor Duty Event (Check-in/Check-out/Status)
 */
const notifyDoctorDutyEvent = async (doctor, eventType, facilityName) => {
  if (!doctor) return null;

  const title = eventType === "check_in" ? "Doctor On Duty" : "Doctor Checked Out";
  const statusMsg = eventType === "check_in" ? "is now on active duty at" : "has completed duty shift at";

  return createNotification({
    recipient_id: doctor.profile_id || "mock-profile-id",
    type: "doctor_duty_alert",
    title,
    message: `${doctor.full_name} (${doctor.specialization}) ${statusMsg} ${facilityName || "assigned facility"}.`,
    channel: "in_app",
    metadata: {
      doctor_id: doctor.id,
      event_type: eventType,
      dedup_key: `doctor_duty_${doctor.id}_${Date.now()}`,
    },
  });
};

/**
 * Event Trigger: Admin Administrative Alert
 */
const notifyAdminAlert = async ({ admin_id, title, message, metadata = {} }) => {
  return createNotification({
    recipient_id: admin_id || "mock-profile-id",
    type: "system_alert",
    title,
    message,
    channel: "in_app",
    metadata,
  });
};

/**
 * Service: List notifications for current authenticated user
 */
const getNotifications = async (user, { unread_only = false, limit = 30, offset = 0 } = {}) => {
  const profileId = user.profileId || "mock-profile-id";

  if (!isConfigured) {
    let list = mockNotificationsStore.filter(
      (n) => n.recipient_id === profileId || n.recipient_id === "mock-profile-id"
    );
    if (unread_only) {
      list = list.filter((n) => !n.is_read);
    }
    return {
      items: list.slice(offset, offset + limit),
      total: list.length,
      unread_count: list.filter((n) => !n.is_read).length,
    };
  }

  let query = supabase
    .from("notifications")
    .select("*", { count: "exact" })
    .eq("recipient_id", profileId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (unread_only) {
    query = query.eq("is_read", false);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  const { count: unreadCount } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("recipient_id", profileId)
    .eq("is_read", false);

  return {
    items: data || [],
    total: count || 0,
    unread_count: unreadCount || 0,
  };
};

/**
 * Service: Mark notification as read
 */
const markRead = async (user, notificationId) => {
  const profileId = user.profileId || "mock-profile-id";

  if (!isConfigured) {
    const index = mockNotificationsStore.findIndex((n) => n.id === notificationId);
    if (index !== -1) {
      mockNotificationsStore[index].is_read = true;
      return mockNotificationsStore[index];
    }
    return { id: notificationId, is_read: true };
  }

  const { data, error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("recipient_id", profileId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Service: Mark all notifications as read for current user
 */
const markAllRead = async (user) => {
  const profileId = user.profileId || "mock-profile-id";

  if (!isConfigured) {
    mockNotificationsStore.forEach((n) => {
      if (n.recipient_id === profileId || n.recipient_id === "mock-profile-id") {
        n.is_read = true;
      }
    });
    return { success: true };
  }

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("recipient_id", profileId)
    .eq("is_read", false);

  if (error) throw error;
  return { success: true };
};

module.exports = {
  createNotification,
  notifyCaseCreated,
  notifyCaseStatusChanged,
  notifyReferralCreated,
  notifyReferralStatusChanged,
  notifyReferralStageUpdate: notifyReferralStatusChanged,
  notifyReferralFollowUpRequired,
  notifyMedicineLowStock,
  notifyDoctorDutyEvent,
  notifyAdminAlert,
  getNotifications,
  markRead,
  markAllRead,
};
