const { supabase, isConfigured } = require("../config/supabase");

// Curated active health awareness campaigns for fallback/mock mode
const mockCampaignsStore = [
  {
    id: "camp-1",
    title: "Monsoon Disease Prevention Advisory",
    message: "Protect your family from Dengue, Malaria, and Waterborne infections. Keep water storage containers tightly covered, use mosquito nets, discard stagnant water around your premises, and drink boiled water. Seek immediate care at the nearest PHC if fever develops.",
    image_url: "https://images.unsplash.com/photo-1584036561566-baf241883c4e?w=800&auto=format&fit=crop",
    language: "en",
    publish_date: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
    valid_until: new Date(Date.now() + 2592000000).toISOString(), // 30 days remaining
    official_source: "Directorate of Health Services, Government of Maharashtra",
    emergency_contact: "104 (Health Helpline) / 108 (Ambulance)",
    targets: [{ state: "Maharashtra", district: "Nagpur", taluka: null, village: null }]
  },
  {
    id: "camp-2",
    title: "पावसाळी आजार प्रतिबंधक मार्गदर्शक सूचना",
    message: "डेंग्यू, हिवताप आणि गॅस्ट्रोपासून स्वतःचे संरक्षण करा. पाणी साठवलेली भांडी झाकून ठेवा, साचलेले पाणी रिकामे करा, डास प्रतिबंधक जाळ्यांचा वापर करा. ताप आल्यास तात्काळ जवळच्या प्राथमिक आरोग्य केंद्राशी (PHC) संपर्क साधा.",
    image_url: "https://images.unsplash.com/photo-1584036561566-baf241883c4e?w=800&auto=format&fit=crop",
    language: "mr",
    publish_date: new Date(Date.now() - 432000000).toISOString(),
    valid_until: new Date(Date.now() + 2592000000).toISOString(),
    official_source: "सार्वजनिक आरोग्य विभाग, महाराष्ट्र शासन",
    emergency_contact: "१०४ (आरोग्य सल्ला) / १०८ (रुग्णवाहिका)",
    targets: [{ state: "Maharashtra", district: "Nagpur", taluka: null, village: null }]
  },
  {
    id: "camp-3",
    title: "Mission Indradhanush: Child Immunization",
    message: "Ensure full vaccination protection for all infants under 2 years and pregnant women. Vaccines against Polio, Measles, Rubella, and Tetanus are provided 100% free at all sub-centres and PHCs. Contact your village ASHA worker for dynamic schedule details.",
    image_url: "https://images.unsplash.com/photo-1579684389782-64d84b5e901a?w=800&auto=format&fit=crop",
    language: "en",
    publish_date: new Date(Date.now() - 864000000).toISOString(), // 10 days ago
    valid_until: new Date(Date.now() + 1296000000).toISOString(),
    official_source: "National Health Mission, Maharashtra",
    emergency_contact: "108 / 102 (JSSK Helpline)",
    targets: [{ state: "Maharashtra", district: null, taluka: null, village: null }]
  },
  {
    id: "camp-4",
    title: "मिशन इंद्रधनुष: बालकांचे लसीकरण अभियान",
    message: "२ वर्षांखालील सर्व बालकांना आणि गरोदर मातांना पोलिओ, गोवर, आणि धनुर्वात यांसारख्या आजारांपासून संरक्षित करा. सर्व लसीकरण मोफत उपलब्ध आहे. आपल्या गावातील आशा (ASHA) कार्यकर्त्यांशी संपर्क साधा.",
    image_url: "https://images.unsplash.com/photo-1579684389782-64d84b5e901a?w=800&auto=format&fit=crop",
    language: "mr",
    publish_date: new Date(Date.now() - 864000000).toISOString(),
    valid_until: new Date(Date.now() + 1296000000).toISOString(),
    official_source: "राष्ट्रीय आरोग्य अभियान, महाराष्ट्र",
    emergency_contact: "१०८ / १०२",
    targets: [{ state: "Maharashtra", district: null, taluka: null, village: null }]
  }
];

const getCampaigns = async ({ district, taluka, village, phc_id, language } = {}) => {
  if (!isConfigured) {
    let list = [...mockCampaignsStore];
    // Filter by language if specified
    if (language) {
      list = list.filter((c) => c.language === language);
    }
    // Simple filter by district targeting
    if (district) {
      list = list.filter((c) => {
        if (!c.targets || c.targets.length === 0) return true;
        return c.targets.some((t) => !t.district || t.district.toLowerCase() === district.toLowerCase());
      });
    }
    return list;
  }

  // Fetch campaigns from Supabase database
  let query = supabase
    .from("health_campaigns")
    .select("*, campaign_targets(*)")
    .order("publish_date", { ascending: false });

  // Exclude expired campaigns
  query = query.or(`valid_until.is.null,valid_until.gt.${new Date().toISOString()}`);

  if (language) {
    query = query.eq("language", language);
  }

  const { data, error } = await query;
  if (error) throw error;

  let filteredData = data || [];

  // Filter based on geographic target rules
  if (district || taluka || village || phc_id) {
    filteredData = filteredData.filter((c) => {
      const targets = c.campaign_targets || [];
      if (targets.length === 0) return true; // Global campaigns match all
      return targets.some((t) => {
        let match = true;
        if (t.district && district && t.district.toLowerCase() !== district.toLowerCase()) match = false;
        if (t.taluka && taluka && t.taluka.toLowerCase() !== taluka.toLowerCase()) match = false;
        if (t.village && village && t.village.toLowerCase() !== village.toLowerCase()) match = false;
        if (t.phc_id && phc_id && t.phc_id !== phc_id) match = false;
        return match;
      });
    });
  }

  return filteredData;
};

const createCampaign = async (payload) => {
  const { title, message, image_url, language, valid_until, official_source, emergency_contact, targets } = payload;
  
  if (!title || !message || !official_source) {
    throw new Error("Title, Message, and Official Source are required fields");
  }

  if (!isConfigured) {
    const newCamp = {
      id: `camp-${Date.now()}`,
      title,
      message,
      image_url: image_url || "https://images.unsplash.com/photo-1584036561566-baf241883c4e?w=800&auto=format&fit=crop",
      language: language || "en",
      publish_date: new Date().toISOString(),
      valid_until: valid_until || null,
      official_source,
      emergency_contact: emergency_contact || null,
      targets: targets || []
    };
    mockCampaignsStore.unshift(newCamp);
    return newCamp;
  }

  // Insert into DB
  const { data: campaign, error: insertError } = await supabase
    .from("health_campaigns")
    .insert({
      title,
      message,
      image_url,
      language: language || "en",
      valid_until: valid_until || null,
      official_source,
      emergency_contact,
    })
    .select("*")
    .single();

  if (insertError) throw insertError;

  // Insert targets if provided
  if (targets && Array.isArray(targets) && targets.length > 0) {
    const targetPayloads = targets.map((t) => ({
      campaign_id: campaign.id,
      state: t.state || "Maharashtra",
      district: t.district || null,
      taluka: t.taluka || null,
      village: t.village || null,
      phc_id: t.phc_id || null,
    }));

    const { error: targetError } = await supabase
      .from("campaign_targets")
      .insert(targetPayloads);

    if (targetError) console.warn("Failed to insert campaign targets:", targetError);
  }

  return campaign;
};

module.exports = {
  getCampaigns,
  createCampaign,
};
