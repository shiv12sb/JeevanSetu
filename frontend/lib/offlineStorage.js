/**
 * ==============================================================================
 * JEEVANSETU — OFFLINE EMERGENCY STORAGE & LOW-BANDWIDTH CACHE UTILITY
 * ==============================================================================
 * Enables rural citizens, ASHA workers, and caregivers to access critical 
 * emergency hotlines, PHC directories, and first-aid protocols without active internet.
 */

const OFFLINE_STORAGE_KEY = "jeevansetu_offline_emergency_cache";
const OFFLINE_SYNC_TIMESTAMP_KEY = "jeevansetu_offline_last_synced";

export const DEFAULT_OFFLINE_EMERGENCY_DATA = {
  version: "2026.08.31",
  state: "Maharashtra",
  hotlines: [
    {
      code: "108",
      title: "MEMS Emergency Ambulance (Free 24x7)",
      desc: "Accidents, polytrauma, cardiac arrest, respiratory distress, acute labor",
      category: "emergency",
      action: "tel:108",
    },
    {
      code: "102",
      title: "JSSK Maternal & Infant Transport",
      desc: "Free pregnant mother & newborn transit under Janani Shishu Suraksha",
      category: "maternal",
      action: "tel:102",
    },
    {
      code: "104",
      title: "Maharashtra Arogya Sahayyata Helpline",
      desc: "Free health advice, blood unit availability, and scheme grievance",
      category: "helpline",
      action: "tel:104",
    },
    {
      code: "112",
      title: "All-India Emergency Response (ERSS)",
      desc: "Police, fire, and national unified emergency dispatch",
      category: "emergency",
      action: "tel:112",
    },
    {
      code: "1077",
      title: "District Disaster Management Control Room",
      desc: "Flood, landslide, heatwave, and natural disaster medical response",
      category: "disaster",
      action: "tel:1077",
    },
  ],
  districtControlRooms: [
    { district: "Nagpur", phone: "+91 712 2562668", facility: "Nagpur Collectorate & DHO Office" },
    { district: "Gadchiroli", phone: "+91 7132 222108", facility: "District Civil Hospital & Tribal Health Cell" },
    { district: "Wardha", phone: "+91 7152 245220", facility: "Civil Hospital & MGIMS Sevagram Control" },
    { district: "Amravati", phone: "+91 721 2662828", facility: "District General Hospital Irwin Desk" },
    { district: "Chandrapur", phone: "+91 7172 255240", facility: "Government Medical College & Civil Hospital" },
    { district: "Pune", phone: "+91 20 26128000", facility: "Sassoon General Hospital Emergency Desk" },
    { district: "Mumbai", phone: "+91 22 24107000", facility: "KEM Hospital Emergency Control" },
  ],
  essentialPhcs: [
    {
      id: "phc-gdc-ashti",
      name: "Ashti Primary Health Centre (Tribal Cluster Hub)",
      district: "Gadchiroli",
      taluka: "Ashti",
      phone: "+91 7132 222108",
      services: "24x7 Delivery, Anti-Snake Venom, Malaria RDT, Stabilization",
      inCharge: "Dr. Pravin Madavi / Sister Rekha",
    },
    {
      id: "phc-gdc-bhamragad",
      name: "Bhamragad Tribal Health Sub-Centre",
      district: "Gadchiroli",
      taluka: "Bhamragad",
      phone: "+91 7132 222108",
      services: "Emergency Stabilization, Blood Pressure, Antenatal Triage",
      inCharge: "Sister Sunita Halami (ASHA In-charge)",
    },
    {
      id: "phc-ngp-ramtek",
      name: "Ramtek Rural Health Hub & Sub-District Hospital",
      district: "Nagpur",
      taluka: "Ramtek",
      phone: "+91 712 291042",
      services: "X-Ray, Minor OT, Pediatric Ward, Normal Delivery",
      inCharge: "Dr. S. Kulkarni / Sister Meena",
    },
    {
      id: "phc-ngp-umred",
      name: "Umred Rural Hospital & Trauma Unit",
      district: "Nagpur",
      taluka: "Umred",
      phone: "+91 712 244550",
      services: "Casualty, Highway Trauma Stabilization, Oxygen Bed",
      inCharge: "Dr. V. Meshram",
    },
    {
      id: "phc-wrd-karanja",
      name: "Karanja (Ghadge) Primary Health Centre",
      district: "Wardha",
      taluka: "Karanja",
      phone: "+91 7152 245220",
      services: "First-Aid, Snakebite Protocol, Maternal Care",
      inCharge: "Dr. A. Deshpande",
    },
  ],
  firstAidProtocols: [
    {
      id: "proto-snakebite",
      title: "Snake Bite First-Aid (सर्पदंश प्रथमोपचार)",
      doList: [
        "Keep victim calm and completely still to slow venom spread.",
        "Immobilize the bitten limb with a splint or sling at heart level.",
        "Remove rings, tight bracelets, or shoes before swelling begins.",
        "Call 108 or transport immediately to nearest PHC with Anti-Snake Venom (ASV).",
      ],
      dontList: [
        "DO NOT tie a tight tourniquet (can cause gangrene).",
        "DO NOT cut, slash, or attempt to suck venom from wound.",
        "DO NOT apply ice, potassium permanganate, or herbal pastes.",
        "DO NOT waste critical golden-hour time visiting quacks/tantriks.",
      ],
    },
    {
      id: "proto-heatstroke",
      title: "Heat Stroke & Dehydration (उष्माघात प्रथमोपचार)",
      doList: [
        "Move patient to a cool, shaded, or ventilated area immediately.",
        "Loosen tight clothing and apply cool wet cloths to neck, armpits, and groin.",
        "Give oral rehydration solution (ORS), coconut water, or salted buttermilk if conscious.",
        "Fan the patient continuously and seek medical help if body temp > 103°F.",
      ],
      dontList: [
        "DO NOT give hot caffeinated drinks or heavy meals.",
        "DO NOT force fluids if the person is unconscious or vomiting.",
      ],
    },
    {
      id: "proto-cpr",
      title: "Adult Hands-Only CPR (छातीचे आकुंचन - CPR)",
      doList: [
        "Check responsiveness and call 108 immediately.",
        "Place heel of one hand in the centre of the chest, interlock other hand on top.",
        "Push hard and fast in the centre of chest at 100-120 beats per minute (e.g. rhythm of Stayin' Alive).",
        "Allow chest to rise completely between compressions until medical help arrives.",
      ],
      dontList: [
        "DO NOT stop compressions unless victim wakes up or medical personnel take over.",
      ],
    },
  ],
};

/**
 * Initialize / Refresh Offline Storage Cache in Browser
 */
export const initOfflineCache = () => {
  if (typeof window === "undefined") return DEFAULT_OFFLINE_EMERGENCY_DATA;

  try {
    const existing = localStorage.getItem(OFFLINE_STORAGE_KEY);
    if (!existing) {
      localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(DEFAULT_OFFLINE_EMERGENCY_DATA));
      localStorage.setItem(OFFLINE_SYNC_TIMESTAMP_KEY, new Date().toISOString());
      return DEFAULT_OFFLINE_EMERGENCY_DATA;
    }
    return JSON.parse(existing);
  } catch (err) {
    console.warn("Could not access localStorage for offline cache:", err);
    return DEFAULT_OFFLINE_EMERGENCY_DATA;
  }
};

/**
 * Get cached emergency data
 */
export const getOfflineEmergencyData = () => {
  if (typeof window === "undefined") return DEFAULT_OFFLINE_EMERGENCY_DATA;

  try {
    const data = localStorage.getItem(OFFLINE_STORAGE_KEY);
    return data ? JSON.parse(data) : initOfflineCache();
  } catch (err) {
    return DEFAULT_OFFLINE_EMERGENCY_DATA;
  }
};

/**
 * Get last synced timestamp
 */
export const getOfflineSyncTimestamp = () => {
  if (typeof window === "undefined") return "Pre-Cached for Offline Use";
  return localStorage.getItem(OFFLINE_SYNC_TIMESTAMP_KEY) || new Date().toISOString();
};

/**
 * Force manual update of offline cache with latest data
 */
export const syncOfflineCacheNow = (customData = null) => {
  if (typeof window === "undefined") return false;

  try {
    const dataToSave = customData || DEFAULT_OFFLINE_EMERGENCY_DATA;
    localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(dataToSave));
    localStorage.setItem(OFFLINE_SYNC_TIMESTAMP_KEY, new Date().toISOString());
    return true;
  } catch (err) {
    console.error("Failed to sync offline cache:", err);
    return false;
  }
};
