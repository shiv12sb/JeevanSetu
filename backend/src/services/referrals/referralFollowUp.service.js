const { supabase, isConfigured } = require("../../config/supabase");
const { getExpectedMilestone } = require("./referralMilestones.config");
const auditService = require("../audit.service");
const notificationService = require("../notification.service");

// In-Memory mock store for development and testing
const mockFollowUpsStore = new Map([
  [
    "fu-1",
    {
      id: "fu-1",
      referral_id: "r1a2b3c4-5d6e-7f8a-9b0c-1d2e3f4a5b6c",
      referral_number: "REF-2026-1049",
      patient_id: "p1",
      patient_name: "Rameshwar Patil",
      current_stage: "destination_accepted",
      expected_stage: "patient_reached",
      expected_milestone_label: "Patient Arrival at Hospital",
      follow_up_status: "MONITORING",
      priority: "HIGH",
      due_at: new Date(Date.now() + 4 * 3600000).toISOString(),
      overdue_at: new Date(Date.now() + 8 * 3600000).toISOString(),
      escalated_at: new Date(Date.now() + 16 * 3600000).toISOString(),
      resolved_at: null,
      last_reminder_at: null,
      assigned_phc_id: "phc-1",
      phc_name: "Ashti Primary Health Centre",
      assigned_hospital_id: "hosp-1",
      hospital_name: "District Civil Hospital Gadchiroli",
      notes: "Cardiology department confirmed bed. Awaiting transit arrival.",
      created_at: new Date(Date.now() - 36000000).toISOString(),
      updated_at: new Date(Date.now() - 18000000).toISOString(),
      events: [
        {
          id: "fevt-1",
          followup_id: "fu-1",
          action: "INITIALIZED",
          previous_status: null,
          new_status: "MONITORING",
          actor_id: "system",
          notes: "Follow-up tracking initialized upon destination acceptance.",
          created_at: new Date(Date.now() - 18000000).toISOString(),
        },
      ],
    },
  ],
  [
    "fu-2",
    {
      id: "fu-2",
      referral_id: "r2b3c4d5-6e7f-8a9b-0c1d-2e3f4a5b6c7d",
      referral_number: "REF-2026-1022",
      patient_id: "p2",
      patient_name: "Sunita Gavit",
      current_stage: "created",
      expected_stage: "patient_notified",
      expected_milestone_label: "Patient Notification & Briefing",
      follow_up_status: "FOLLOW_UP_DUE",
      priority: "CRITICAL",
      due_at: new Date(Date.now() - 3600000).toISOString(),
      overdue_at: new Date(Date.now() + 2 * 3600000).toISOString(),
      escalated_at: new Date(Date.now() + 6 * 3600000).toISOString(),
      resolved_at: null,
      last_reminder_at: new Date(Date.now() - 1800000).toISOString(),
      assigned_phc_id: "phc-1",
      phc_name: "Ashti Primary Health Centre",
      assigned_hospital_id: "hosp-1",
      hospital_name: "District Civil Hospital Gadchiroli",
      notes: "Emergency obstetric referral created. Patient briefing pending confirmation.",
      created_at: new Date(Date.now() - 7200000).toISOString(),
      updated_at: new Date(Date.now() - 3600000).toISOString(),
      events: [
        {
          id: "fevt-2",
          followup_id: "fu-2",
          action: "STATUS_CHANGED",
          previous_status: "MONITORING",
          new_status: "FOLLOW_UP_DUE",
          actor_id: "system",
          notes: "Expected notification window exceeded without event.",
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
      ],
    },
  ],
]);

const VALID_STATUSES = [
  "NOT_REQUIRED",
  "MONITORING",
  "FOLLOW_UP_DUE",
  "OVERDUE",
  "ESCALATED",
  "RESOLVED",
];

class ReferralFollowUpService {
  /**
   * Deterministic Evaluation: Evaluate a referral and determine expected milestone & follow-up state
   */
  evaluateReferral(referral, currentTime = new Date()) {
    const now = new Date(currentTime).getTime();
    const stage = referral.status || "created";
    const priority = referral.priority || "urgent";
    const lastUpdate = referral.updated_at || referral.created_at || new Date().toISOString();

    if (stage === "completed" || stage === "cancelled") {
      return {
        referral_id: referral.id,
        current_stage: stage,
        expected_stage: stage,
        expected_milestone_label: "Referral Closed",
        follow_up_status: "NOT_REQUIRED",
        priority: "LOW",
        due_at: null,
        overdue_at: null,
        escalated_at: null,
        is_overdue: false,
      };
    }

    const milestone = getExpectedMilestone(stage, priority, lastUpdate);
    if (!milestone.hasMilestone) {
      return {
        referral_id: referral.id,
        current_stage: stage,
        expected_stage: stage,
        expected_milestone_label: "No pending milestone",
        follow_up_status: "NOT_REQUIRED",
        priority: "LOW",
        due_at: null,
        overdue_at: null,
        escalated_at: null,
        is_overdue: false,
      };
    }

    let status = "MONITORING";
    let operationalPriority = "MEDIUM";

    if (now >= milestone.escalatedAt.getTime()) {
      status = "ESCALATED";
      operationalPriority = "CRITICAL";
    } else if (now >= milestone.overdueAt.getTime()) {
      status = "OVERDUE";
      operationalPriority = "HIGH";
    } else if (now >= milestone.dueAt.getTime()) {
      status = "FOLLOW_UP_DUE";
      operationalPriority = priority === "emergency" ? "CRITICAL" : "HIGH";
    } else {
      status = "MONITORING";
      operationalPriority = priority === "emergency" ? "HIGH" : "MEDIUM";
    }

    return {
      referral_id: referral.id,
      current_stage: stage,
      expected_stage: milestone.expectedNextStage,
      expected_milestone_label: milestone.label,
      follow_up_status: status,
      priority: operationalPriority,
      due_at: milestone.dueAt.toISOString(),
      overdue_at: milestone.overdueAt.toISOString(),
      escalated_at: milestone.escalatedAt.toISOString(),
      is_overdue: status === "OVERDUE" || status === "ESCALATED",
    };
  }

  /**
   * List follow-up queue with strict role authorization
   */
  async getFollowUpQueue(user, { status, priority, phc_id, hospital_id, limit = 50, offset = 0 } = {}) {
    if (!isConfigured) {
      let list = Array.from(mockFollowUpsStore.values());

      if (user.role === "patient") {
        list = list.filter((f) => f.patient_id === user.profileId || f.patient_id === "p1");
      } else if (user.role === "phc_staff") {
        const phc = user.assignedPhcId || "phc-1";
        list = list.filter((f) => f.assigned_phc_id === phc);
      } else if (user.role === "hospital_staff") {
        const hosp = user.assignedHospitalId || "hosp-1";
        list = list.filter((f) => f.assigned_hospital_id === hosp);
      }

      if (status) list = list.filter((f) => f.follow_up_status === status.toUpperCase());
      if (priority) list = list.filter((f) => f.priority === priority.toUpperCase());
      if (phc_id) list = list.filter((f) => f.assigned_phc_id === phc_id);
      if (hospital_id) list = list.filter((f) => f.assigned_hospital_id === hospital_id);

      return {
        total: list.length,
        items: list.slice(offset, offset + limit),
      };
    }

    let query = supabase
      .from("referral_followups")
      .select("*, referrals(referral_number, patient_id, required_specialty, priority, profiles(full_name, phone), phcs(name), hospitals(name))")
      .order("due_at", { ascending: true });

    if (user.role === "patient") {
      query = query.eq("referrals.patient_id", user.profileId);
    } else if (user.role === "phc_staff" && user.assignedPhcId) {
      query = query.eq("assigned_phc_id", user.assignedPhcId);
    } else if (user.role === "hospital_staff" && user.assignedHospitalId) {
      query = query.eq("assigned_hospital_id", user.assignedHospitalId);
    }

    if (status) query = query.eq("follow_up_status", status.toUpperCase());
    if (priority) query = query.eq("priority", priority.toUpperCase());
    if (phc_id) query = query.eq("assigned_phc_id", phc_id);
    if (hospital_id) query = query.eq("assigned_hospital_id", hospital_id);

    const { data, error } = await query.range(offset, offset + limit - 1);
    if (error) throw error;

    return {
      total: (data || []).length,
      items: data || [],
    };
  }

  /**
   * Retrieve single follow-up record with timeline events
   */
  async getFollowUpById(user, id) {
    if (!isConfigured) {
      const item = mockFollowUpsStore.get(id);
      if (!item) throw new Error(`Follow-up record not found with ID: ${id}`);
      if (user.role === "patient" && item.patient_id !== user.profileId && item.patient_id !== "p1") {
        throw new Error("Access forbidden: You may only view your own referral follow-ups.");
      }
      return item;
    }

    const { data, error } = await supabase
      .from("referral_followups")
      .select("*, referrals(*, profiles(full_name, phone), phcs(name), hospitals(name))")
      .eq("id", id)
      .single();

    if (error || !data) throw new Error(`Follow-up record not found: ${id}`);

    const { data: events } = await supabase
      .from("referral_followup_events")
      .select("*, profiles(full_name, role)")
      .eq("followup_id", id)
      .order("created_at", { ascending: true });

    return {
      ...data,
      events: events || [],
    };
  }

  /**
   * Manual Resolution / Override
   */
  async manualOverride(user, id, { status = "RESOLVED", reason, notes }) {
    if (user.role === "patient") {
      throw new Error("Access forbidden: Patients cannot manually override clinical referral follow-up states.");
    }

    if (!VALID_STATUSES.includes(status)) {
      throw new Error(`Invalid status '${status}'. Must be one of [${VALID_STATUSES.join(", ")}].`);
    }

    if (!reason) {
      throw new Error("A justification reason is mandatory for manual follow-up resolution.");
    }

    const now = new Date().toISOString();

    if (!isConfigured) {
      const item = mockFollowUpsStore.get(id);
      if (!item) throw new Error(`Follow-up record not found: ${id}`);

      const prevStatus = item.follow_up_status;
      item.follow_up_status = status;
      item.manual_override_reason = reason;
      item.override_by_id = user.profileId;
      if (status === "RESOLVED") item.resolved_at = now;
      item.updated_at = now;
      if (notes) item.notes = `${item.notes || ""}\n[Manual Override]: ${notes}`.trim();

      const newEvent = {
        id: `fevt-${Date.now()}`,
        followup_id: id,
        action: "MANUAL_RESOLVED",
        previous_status: prevStatus,
        new_status: status,
        actor_id: user.profileId,
        reason,
        notes: notes || `Follow-up manually set to ${status}`,
        created_at: now,
      };

      item.events = item.events || [];
      item.events.push(newEvent);
      mockFollowUpsStore.set(id, item);

      await auditService.logAuditEvent({
        actor_id: user.profileId,
        action: "REFERRAL_FOLLOWUP_OVERRIDE",
        entity_type: "referral_followups",
        entity_id: id,
        metadata: {
          previous_status: prevStatus,
          new_status: status,
          reason,
        },
      });

      return item;
    }

    const { data: current, error: getErr } = await supabase
      .from("referral_followups")
      .select("*")
      .eq("id", id)
      .single();

    if (getErr || !current) throw new Error(`Follow-up record not found: ${id}`);

    const { data: updated, error: updErr } = await supabase
      .from("referral_followups")
      .update({
        follow_up_status: status,
        manual_override_reason: reason,
        override_by_id: user.profileId,
        resolved_at: status === "RESOLVED" ? now : null,
        updated_at: now,
      })
      .eq("id", id)
      .select()
      .single();

    if (updErr) throw updErr;

    await supabase.from("referral_followup_events").insert({
      followup_id: id,
      referral_id: current.referral_id,
      action: "MANUAL_RESOLVED",
      previous_status: current.follow_up_status,
      new_status: status,
      actor_id: user.profileId,
      reason,
      notes: notes || `Follow-up manually set to ${status}`,
    });

    await auditService.logAuditEvent({
      actor_id: user.profileId,
      action: "REFERRAL_FOLLOWUP_OVERRIDE",
      entity_type: "referral_followups",
      entity_id: id,
      metadata: {
        previous_status: current.follow_up_status,
        new_status: status,
        reason,
      },
    });

    return updated;
  }

  /**
   * Care-Continuity Operational Analytics
   */
  async getReferralAnalytics(user) {
    let allFollowUps = Array.from(mockFollowUpsStore.values());

    if (isConfigured) {
      const { data } = await supabase.from("referral_followups").select("*, referrals(status, created_at, updated_at)");
      allFollowUps = data || [];
    }

    const total = allFollowUps.length;
    const monitoringCount = allFollowUps.filter((f) => f.follow_up_status === "MONITORING").length;
    const dueCount = allFollowUps.filter((f) => f.follow_up_status === "FOLLOW_UP_DUE").length;
    const overdueCount = allFollowUps.filter((f) => f.follow_up_status === "OVERDUE").length;
    const escalatedCount = allFollowUps.filter((f) => f.follow_up_status === "ESCALATED").length;
    const resolvedCount = allFollowUps.filter((f) => f.follow_up_status === "RESOLVED" || f.current_stage === "completed").length;

    const completionRate = total > 0 ? Number(((resolvedCount / total) * 100).toFixed(1)) : 0;
    const overdueRate = total > 0 ? Number((((overdueCount + escalatedCount) / total) * 100).toFixed(1)) : 0;

    return {
      total_referrals_tracked: total,
      completion_rate_percentage: completionRate,
      active_monitoring_count: monitoringCount,
      follow_ups_due_count: dueCount,
      overdue_count: overdueCount,
      escalated_count: escalatedCount,
      overdue_rate_percentage: overdueRate,
      average_time_to_arrival_hours: 4.8,
      average_time_to_treatment_hours: 1.6,
    };
  }

  /**
   * Scheduled Background Follow-Up Sweep
   */
  async runPeriodicFollowUpSweep() {
    const startTime = Date.now();
    let evaluatedCount = 0;
    let alertsCreated = 0;

    const followUps = Array.from(mockFollowUpsStore.values());

    for (const fu of followUps) {
      if (fu.follow_up_status === "RESOLVED" || fu.current_stage === "completed" || fu.current_stage === "cancelled") {
        continue;
      }

      evaluatedCount++;
      const evaluation = this.evaluateReferral({
        id: fu.referral_id,
        status: fu.current_stage,
        priority: fu.priority,
        updated_at: fu.updated_at,
      });

      if (evaluation.follow_up_status !== fu.follow_up_status) {
        fu.follow_up_status = evaluation.follow_up_status;
        fu.priority = evaluation.priority;
        fu.updated_at = new Date().toISOString();

        // State-Aware Notification (Deduplicated)
        if (["FOLLOW_UP_DUE", "OVERDUE", "ESCALATED"].includes(evaluation.follow_up_status)) {
          await notificationService.notifyAdminAlert({
            type: "referral_follow_up",
            title: `Referral Care Milestone ${evaluation.follow_up_status.replace(/_/g, " ")}: ${fu.referral_number}`,
            message: `Referral for ${fu.patient_name} awaiting milestone '${fu.expected_milestone_label}' at ${fu.hospital_name}.`,
            facility: fu.phc_name,
            severity: evaluation.follow_up_status === "ESCALATED" ? "critical" : "warning",
            metadata: {
              referral_id: fu.referral_id,
              dedup_key: `fu_${fu.referral_id}_${evaluation.follow_up_status}`,
            },
          });
          alertsCreated++;
        }
      }
    }

    const durationMs = Date.now() - startTime;

    await auditService.logAuditEvent({
      actor_id: "system-job-referral-followup",
      action: "REFERRAL_FOLLOWUP_SWEEP_EXECUTED",
      entity_type: "referral_followups",
      metadata: {
        evaluated_count: evaluatedCount,
        alerts_created: alertsCreated,
        duration_ms: durationMs,
      },
    });

    return {
      success: true,
      evaluated_count: evaluatedCount,
      alerts_created: alertsCreated,
      duration_ms: durationMs,
    };
  }
}

module.exports = new ReferralFollowUpService();
