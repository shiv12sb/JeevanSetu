const { supabase, isConfigured } = require("../config/supabase");

/**
 * Service: Fetch aggregate verified resources directory
 */
const getDirectory = async ({ district, search } = {}) => {
  if (!isConfigured) {
    return {
      hospitals: [
        {
          id: "hosp-1",
          name: "District Civil Hospital Gadchiroli",
          hospital_type: "District Civil Hospital",
          district: "Gadchiroli",
          contact_phone: "+91 7132 222155",
          total_beds: 300,
          icu_beds: 24,
          empanelled_schemes: ["PM-JAY", "MJPJAY"],
          services: ["24x7 Emergency", "Cardiology Unit", "Dialysis Unit"],
        },
      ],
      phcs: [
        {
          id: "phc-1",
          facility_code: "PHC-101-GAD",
          name: "Ashti Primary Health Centre",
          taluka: "Chamorshi",
          district: "Gadchiroli",
          contact_phone: "+91 94231 09844",
        },
      ],
      ngos: [
        {
          id: "ngo-1",
          name: "Gramin Arogya Sahayog Trust",
          aid_focus: ["Patient Transit", "Emergency Cashless Grants"],
          contact_phone: "+91 98230 77112",
          district: "Gadchiroli",
        },
      ],
      schemes: [
        {
          id: "sch-1",
          scheme_code: "PMJAY",
          name: "Ayushman Bharat PM-JAY",
          benefits_summary: "Up to ₹5,00,000 cashless secondary and tertiary hospitalization.",
        },
      ],
    };
  }

  const [hospitalsRes, phcsRes, ngosRes, schemesRes] = await Promise.all([
    supabase.from("hospitals").select("*, hospital_services(service_name, doctor_on_duty_status)").eq("is_verified", true),
    supabase.from("phcs").select("*").eq("is_verified", true),
    supabase.from("ngos").select("*").eq("is_verified", true),
    supabase.from("government_schemes").select("*").eq("is_active", true),
  ]);

  return {
    hospitals: hospitalsRes.data || [],
    phcs: phcsRes.data || [],
    ngos: ngosRes.data || [],
    schemes: schemesRes.data || [],
  };
};

const getHospitals = async ({ district, search } = {}) => {
  if (!isConfigured) {
    return [
      {
        id: "hosp-1",
        name: "District Civil Hospital Gadchiroli",
        hospital_type: "District Civil Hospital",
        district: "Gadchiroli",
        contact_phone: "+91 7132 222155",
        total_beds: 300,
        icu_beds: 24,
        empanelled_schemes: ["PM-JAY", "MJPJAY"],
      },
    ];
  }

  let query = supabase.from("hospitals").select("*, hospital_services(*)").eq("is_verified", true);
  if (district && district !== "all") query = query.ilike("district", `%${district}%`);
  if (search) query = query.ilike("name", `%${search}%`);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

const getPhcs = async ({ district, search } = {}) => {
  if (!isConfigured) {
    return [
      {
        id: "phc-1",
        facility_code: "PHC-101-GAD",
        name: "Ashti Primary Health Centre",
        taluka: "Chamorshi",
        district: "Gadchiroli",
        contact_phone: "+91 94231 09844",
      },
    ];
  }

  let query = supabase.from("phcs").select("*").eq("is_verified", true);
  if (district && district !== "all") query = query.ilike("district", `%${district}%`);
  if (search) query = query.ilike("name", `%${search}%`);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

const getNgos = async ({ district } = {}) => {
  if (!isConfigured) {
    return [
      {
        id: "ngo-1",
        name: "Gramin Arogya Sahayog Trust",
        aid_focus: ["Patient Transit", "Emergency Cashless Grants"],
        contact_phone: "+91 98230 77112",
        district: "Gadchiroli",
      },
    ];
  }

  let query = supabase.from("ngos").select("*").eq("is_verified", true);
  if (district && district !== "all") query = query.ilike("district", `%${district}%`);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

const getSchemes = async () => {
  if (!isConfigured) {
    return [
      {
        id: "sch-1",
        scheme_code: "PMJAY",
        name: "Ayushman Bharat PM-JAY",
        benefits_summary: "Up to ₹5,00,000 cashless secondary and tertiary hospitalization.",
        eligibility_criteria: ["Rural SECC Deprived Household", "BPL Ration Card Holder"],
      },
    ];
  }

  const { data, error } = await supabase.from("government_schemes").select("*").eq("is_active", true);
  if (error) throw error;
  return data || [];
};

module.exports = {
  getDirectory,
  getHospitals,
  getPhcs,
  getNgos,
  getSchemes,
  getGovernmentSchemes: getSchemes,
};
