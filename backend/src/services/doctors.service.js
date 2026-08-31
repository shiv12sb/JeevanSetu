const { supabase, isConfigured } = require("../config/supabase");
const auditService = require("./audit.service");
const notificationService = require("./notification.service");

/**
 * In-memory mock doctors store
 */
const mockDoctorsStore = [
  {
    id: "doc-1",
    profile_id: "p-doc-1",
    medical_council_id: "MCI-2014-98124",
    full_name: "Dr. Ananya Deshmukh",
    specialization: "General Medicine / Medical Officer",
    phone: "+91 98230 44551",
    email: "ananya.deshmukh@jeevansetu.gov.in",
    facility_type: "phc",
    phc_id: "phc-1",
    hospital_id: null,
    is_on_duty: true,
    last_check_in: new Date(Date.now() - 14400000).toISOString(),
    last_check_out: null,
    duty_status_note: "Morning OPD Session Active",
    review_status: "normal", // 'normal', 'requires_review'
    is_verified: true,
    phcs: { id: "phc-1", name: "Ashti Primary Health Centre", facility_code: "PHC-MH-2041" },
    hospitals: null,
  },
  {
    id: "doc-2",
    profile_id: "p-doc-2",
    medical_council_id: "MCI-2010-44912",
    full_name: "Dr. Rajesh Kulkarni",
    specialization: "Interventional Cardiology",
    phone: "+91 94221 88390",
    email: "rajesh.kulkarni@jeevansetu.gov.in",
    facility_type: "hospital",
    phc_id: null,
    hospital_id: "hosp-1",
    is_on_duty: true,
    last_check_in: new Date(Date.now() - 21600000).toISOString(),
    last_check_out: null,
    duty_status_note: "Cardiac Cath Lab & Inpatient Rounds",
    review_status: "normal",
    is_verified: true,
    phcs: null,
    hospitals: { id: "hosp-1", name: "District Civil Hospital Gadchiroli", facility_code: "HOSP-DH-701" },
  },
  {
    id: "doc-3",
    profile_id: "p-doc-3",
    medical_council_id: "MCI-2018-77123",
    full_name: "Dr. Priya Sharma",
    specialization: "Pediatrics & Neonatal Care",
    phone: "+91 98220 12345",
    email: "priya.sharma@jeevansetu.gov.in",
    facility_type: "phc",
    phc_id: "phc-1",
    hospital_id: null,
    is_on_duty: false,
    last_check_in: new Date(Date.now() - 86400000).toISOString(),
    last_check_out: new Date(Date.now() - 57600000).toISOString(),
    duty_status_note: "Shift Completed",
    review_status: "normal",
    is_verified: true,
    phcs: { id: "phc-1", name: "Ashti Primary Health Centre", facility_code: "PHC-MH-2041" },
    hospitals: null,
  },
];

/**
 * Service: List doctors with live duty status
 */
const getDoctors = async ({ phc_id, hospital_id, specialization, is_on_duty } = {}) => {
  if (!isConfigured) {
    let list = [...mockDoctorsStore];
    if (phc_id) list = list.filter((d) => d.phc_id === phc_id);
    if (hospital_id) list = list.filter((d) => d.hospital_id === hospital_id);
    if (specialization) list = list.filter((d) => d.specialization.toLowerCase().includes(specialization.toLowerCase()));
    if (is_on_duty !== undefined) {
      const onDuty = is_on_duty === "true" || is_on_duty === true;
      list = list.filter((d) => Boolean(d.is_on_duty) === onDuty);
    }
    return list;
  }

  let query = supabase
    .from("doctors")
    .select("*, phcs(id, name, facility_code), hospitals(id, name, facility_code)")
    .eq("is_verified", true)
    .order("full_name", { ascending: true });

  if (phc_id) query = query.eq("phc_id", phc_id);
  if (hospital_id) query = query.eq("hospital_id", hospital_id);
  if (specialization) query = query.ilike("specialization", `%${specialization}%`);
  if (is_on_duty !== undefined) query = query.eq("is_on_duty", is_on_duty === "true" || is_on_duty === true);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

/**
 * Service: Retrieve single doctor by ID
 */
const getDoctorById = async (id) => {
  if (!isConfigured) {
    return mockDoctorsStore.find((d) => d.id === id) || mockDoctorsStore[0];
  }

  const { data, error } = await supabase
    .from("doctors")
    .select("*, phcs(*), hospitals(*)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Service: Doctor Check-In for Duty
 */
const checkInDoctor = async (user, doctorId, { note = "Checked in for clinical session" } = {}) => {
  const targetId = doctorId || user.doctorId;

  let doctor = null;

  if (!isConfigured) {
    doctor = mockDoctorsStore.find((d) => d.id === targetId || d.profile_id === user.profileId) || mockDoctorsStore[0];
    doctor.is_on_duty = true;
    doctor.last_check_in = new Date().toISOString();
    doctor.duty_status_note = note;
    doctor.updated_at = new Date().toISOString();
  } else {
    const { data, error } = await supabase
      .from("doctors")
      .update({
        is_on_duty: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", targetId)
      .select("*, phcs(name), hospitals(name)")
      .single();

    if (error) throw error;
    doctor = data;
  }

  // 1. Audit Log
  await auditService.logAuditEvent({
    actor_id: user.profileId,
    action: "DOCTOR_CHECKED_IN",
    entity_type: "doctor_duty",
    entity_id: doctor.id,
    metadata: {
      doctor_name: doctor.full_name,
      check_in_time: new Date().toISOString(),
      facility: doctor.phcs?.name || doctor.hospitals?.name || "Assigned Facility",
      note,
    },
  });

  // 2. Notification
  await notificationService.notifyDoctorDutyEvent(
    doctor,
    "check_in",
    doctor.phcs?.name || doctor.hospitals?.name
  ).catch(() => {});

  return {
    success: true,
    message: `${doctor.full_name} is now marked ON DUTY.`,
    doctor,
  };
};

/**
 * Service: Doctor Check-Out from Duty
 */
const checkOutDoctor = async (user, doctorId, { note = "Duty shift completed" } = {}) => {
  const targetId = doctorId || user.doctorId;

  let doctor = null;

  if (!isConfigured) {
    doctor = mockDoctorsStore.find((d) => d.id === targetId || d.profile_id === user.profileId) || mockDoctorsStore[0];
    doctor.is_on_duty = false;
    doctor.last_check_out = new Date().toISOString();
    doctor.duty_status_note = note;
    doctor.updated_at = new Date().toISOString();
  } else {
    const { data, error } = await supabase
      .from("doctors")
      .update({
        is_on_duty: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", targetId)
      .select("*, phcs(name), hospitals(name)")
      .single();

    if (error) throw error;
    doctor = data;
  }

  // 1. Audit Log
  await auditService.logAuditEvent({
    actor_id: user.profileId,
    action: "DOCTOR_CHECKED_OUT",
    entity_type: "doctor_duty",
    entity_id: doctor.id,
    metadata: {
      doctor_name: doctor.full_name,
      check_out_time: new Date().toISOString(),
      facility: doctor.phcs?.name || doctor.hospitals?.name || "Assigned Facility",
      note,
    },
  });

  // 2. Notification
  await notificationService.notifyDoctorDutyEvent(
    doctor,
    "check_out",
    doctor.phcs?.name || doctor.hospitals?.name
  ).catch(() => {});

  return {
    success: true,
    message: `${doctor.full_name} is now marked OFF DUTY.`,
    doctor,
  };
};

/**
 * Service: Get Doctor Duty Roster / Schedule
 */
const getDutySchedule = async ({ phc_id, hospital_id } = {}) => {
  const doctors = await getDoctors({ phc_id, hospital_id });

  return doctors.map((doc) => ({
    doctor_id: doc.id,
    full_name: doc.full_name,
    specialization: doc.specialization,
    is_on_duty: doc.is_on_duty,
    facility: doc.phcs?.name || doc.hospitals?.name || "Primary Healthcare Facility",
    last_check_in: doc.last_check_in || "08:30 AM",
    scheduled_shift: "09:00 AM - 05:00 PM (OPD & Emergency Coverage)",
    review_status: doc.review_status || "normal",
  }));
};

/**
 * Service: Get facilities mapped to a doctor and their status
 */
const getDoctorFacilities = async (doctorId) => {
  if (!isConfigured) {
    const doc = mockDoctorsStore.find((d) => d.id === doctorId);
    if (!doc) return [];
    if (doctorId === "doc-1") {
      return [
        {
          id: "df-1-1",
          doctor_id: doctorId,
          phc_id: "phc-1",
          hospital_id: null,
          status: doc.is_on_duty ? "ON_DUTY" : "OFF_DUTY",
          next_available_time: null,
          last_updated_at: new Date(Date.now() - 3600000).toISOString(),
          facility_name: "Ashti Primary Health Centre",
          facility_type: "phc",
          location: "Ashti, Wardha District, Maharashtra",
        },
        {
          id: "df-1-2",
          doctor_id: doctorId,
          phc_id: null,
          hospital_id: "hosp-1",
          status: "AVAILABLE",
          next_available_time: null,
          last_updated_at: new Date(Date.now() - 14400000).toISOString(),
          facility_name: "District Civil Hospital Gadchiroli",
          facility_type: "hospital",
          location: "Complex Area, Gadchiroli, Maharashtra",
        }
      ];
    } else if (doctorId === "doc-2") {
      return [
        {
          id: "df-2-1",
          doctor_id: doctorId,
          phc_id: null,
          hospital_id: "hosp-1",
          status: doc.is_on_duty ? "ON_DUTY" : "AVAILABLE",
          next_available_time: null,
          last_updated_at: new Date(Date.now() - 7200000).toISOString(),
          facility_name: "District Civil Hospital Gadchiroli",
          facility_type: "hospital",
          location: "Complex Area, Gadchiroli, Maharashtra",
        },
        {
          id: "df-2-2",
          doctor_id: doctorId,
          phc_id: null,
          hospital_id: "hosp-2",
          status: "IN_CONSULTATION",
          next_available_time: new Date(Date.now() + 7200000).toISOString(),
          last_updated_at: new Date(Date.now() - 3600000).toISOString(),
          facility_name: "Sub-District Hospital Aheri Base",
          facility_type: "hospital",
          location: "Allapalli-Aheri Road, Maharashtra",
        }
      ];
    } else {
      return [
        {
          id: "df-3-1",
          doctor_id: doctorId,
          phc_id: "phc-1",
          hospital_id: null,
          status: doc.is_on_duty ? "ON_DUTY" : "OFF_DUTY",
          next_available_time: new Date(Date.now() + 86400000).toISOString(),
          last_updated_at: new Date(Date.now() - 28800000).toISOString(),
          facility_name: "Ashti Primary Health Centre",
          facility_type: "phc",
          location: "Ashti, Wardha District, Maharashtra",
        }
      ];
    }
  }

  const { data, error } = await supabase
    .from("doctor_facilities")
    .select("*, phcs(id, name, address, taluka, district), hospitals(id, name, address, district)")
    .eq("doctor_id", doctorId);

  if (error) throw error;
  
  return (data || []).map(item => ({
    ...item,
    facility_name: item.phcs?.name || item.hospitals?.name,
    facility_type: item.phc_id ? "phc" : "hospital",
    location: item.phcs?.address || item.hospitals?.address,
  }));
};

/**
 * Service: Update doctor facility status
 */
const updateDoctorFacilityStatus = async (user, doctorId, facilityId, { status, next_available_time }) => {
  if (!["district_admin", "phc_staff", "hospital_staff", "doctor"].includes(user.role)) {
    throw new Error("Unauthorized to update doctor status");
  }

  if (!isConfigured) {
    const doc = mockDoctorsStore.find((d) => d.id === doctorId);
    if (!doc) throw new Error("Doctor not found");
    const isOnDuty = ["ON_DUTY", "AVAILABLE", "IN_CONSULTATION"].includes(status);
    doc.is_on_duty = isOnDuty;
    return { success: true, message: `Status updated to ${status} for Dr. ${doc.full_name}` };
  }

  const { data: mapping, error: findError } = await supabase
    .from("doctor_facilities")
    .select("*")
    .eq("doctor_id", doctorId)
    .or(`phc_id.eq.${facilityId},hospital_id.eq.${facilityId}`)
    .maybeSingle();

  if (findError) throw findError;

  if (!mapping) {
    const insertPayload = {
      doctor_id: doctorId,
      status,
      next_available_time: next_available_time || null,
      last_updated_at: new Date().toISOString(),
    };
    if (facilityId.includes("-") || facilityId.startsWith("phc")) {
      insertPayload.phc_id = facilityId;
    } else {
      insertPayload.hospital_id = facilityId;
    }
    const { error: insertError } = await supabase
      .from("doctor_facilities")
      .insert(insertPayload);
    if (insertError) throw insertError;
  } else {
    const { error: updateError } = await supabase
      .from("doctor_facilities")
      .update({
        status,
        next_available_time: next_available_time || null,
        last_updated_at: new Date().toISOString(),
      })
      .eq("id", mapping.id);
    if (updateError) throw updateError;
  }

  const isOnDuty = ["ON_DUTY", "AVAILABLE", "IN_CONSULTATION"].includes(status);
  await supabase
    .from("doctors")
    .update({ is_on_duty: isOnDuty, updated_at: new Date().toISOString() })
    .eq("id", doctorId);

  return { success: true, message: "Status updated successfully" };
};

module.exports = {
  getDoctors,
  getDoctorById,
  checkInDoctor,
  checkOutDoctor,
  getDutySchedule,
  getDoctorFacilities,
  updateDoctorFacilityStatus,
};
