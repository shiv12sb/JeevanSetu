const { supabase, isConfigured } = require("../config/supabase");

/**
 * Service: Facility detail lookups
 */
const getPhcById = async (id) => {
  if (!isConfigured) {
    return {
      id,
      facility_code: "PHC-101-GAD",
      name: "Ashti Primary Health Centre",
      taluka: "Chamorshi",
      district: "Gadchiroli",
      contact_phone: "+91 94231 09844",
      operational_hours: "24x7 Emergency / 09:00 - 17:00 OPD",
    };
  }

  const { data, error } = await supabase
    .from("phcs")
    .select("*, doctors(*)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
};

const getHospitalById = async (id) => {
  if (!isConfigured) {
    return {
      id,
      facility_code: "HOSP-201-GAD",
      name: "District Civil Hospital Gadchiroli",
      hospital_type: "District Civil Hospital",
      district: "Gadchiroli",
      contact_phone: "+91 7132 222155",
      total_beds: 300,
      icu_beds: 24,
      empanelled_schemes: ["PM-JAY", "MJPJAY"],
    };
  }

  const { data, error } = await supabase
    .from("hospitals")
    .select("*, hospital_services(*), doctors(*)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
};

module.exports = {
  getPhcById,
  getHospitalById,
};
