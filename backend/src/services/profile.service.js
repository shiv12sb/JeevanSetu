const { supabase, isConfigured } = require("../config/supabase");

/**
 * Service: Retrieve user profile
 */
const getProfile = async (userId) => {
  if (!isConfigured) {
    return {
      id: "mock-profile-id",
      user_id: userId,
      full_name: "Rameshwar Patil",
      phone: "+91 98234 11204",
      email: "rameshwar.patil@ruralmail.in",
      role: "patient",
      district: "Gadchiroli",
      state: "Maharashtra",
      abha_id: "91-4821-3902-8172",
      ration_card_number: "RC-MH-2024-81920",
      pmjay_status: "PM-JAY Eligible",
      village: "Ashti",
      taluka: "Chamorshi",
      blood_group: "B+",
      emergency_contact: "+91 94221 88301 (Spouse)",
    };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*, phcs(id, name, facility_code)")
    .eq("user_id", userId)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Service: Update permitted user profile fields
 */
const updateProfile = async (userId, updateFields) => {
  const allowedKeys = [
    "full_name",
    "phone",
    "email",
    "date_of_birth",
    "gender",
    "blood_group",
    "village",
    "taluka",
    "district",
    "state",
    "pincode",
    "abha_id",
    "ration_card_number",
    "emergency_contact",
  ];

  const sanitized = {};
  for (const key of allowedKeys) {
    if (updateFields[key] !== undefined) {
      sanitized[key] = updateFields[key];
    }
  }
  sanitized.updated_at = new Date().toISOString();

  if (!isConfigured) {
    return {
      user_id: userId,
      ...sanitized,
    };
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(sanitized)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

module.exports = {
  getProfile,
  updateProfile,
};
