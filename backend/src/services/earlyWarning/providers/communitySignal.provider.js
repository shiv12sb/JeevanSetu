const BaseSignalProvider = require("./baseSignal.provider");
const { supabase, isConfigured } = require("../../../config/supabase");

const mockCommunityReportsStore = [
  {
    id: "asha-rep-001",
    phc_id: "phc-1",
    area_name: "Ashti North Village",
    village: "Ashti",
    taluka: "Chamorshi",
    district: "Gadchiroli",
    observation_type: "FEVER_CLUSTER",
    reported_count: 5,
    report_date: new Date(Date.now() - 86400000 * 2).toISOString().split("T")[0],
    source_role: "ASHA",
    reporter_name: "Sunita Bai (ASHA Worker)",
    notes: "5 households in ward 2 reported high seasonal fever.",
    is_verified: false,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "asha-rep-002",
    phc_id: "phc-1",
    area_name: "Ashti Riverbank Ward",
    village: "Ashti",
    taluka: "Chamorshi",
    district: "Gadchiroli",
    observation_type: "DIARRHEA_CASES",
    reported_count: 4,
    report_date: new Date(Date.now() - 86400000 * 1).toISOString().split("T")[0],
    source_role: "ASHA",
    reporter_name: "Rekha Tembhurne (ASHA Worker)",
    notes: "Mild acute watery diarrhea reported following borewell repair.",
    is_verified: false,
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

class CommunitySignalProvider extends BaseSignalProvider {
  constructor() {
    super("Community & ASHA Surveillance Provider", "ASHA_REPORT", true);
  }

  /**
   * Ingest structured community observation from ASHA / Community Health Worker
   */
  async submitCommunityReport(reportData) {
    const payload = {
      id: `asha-rep-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      phc_id: reportData.phc_id || "phc-1",
      area_name: reportData.area_name || "Community Area",
      village: reportData.village || reportData.area_name || "Village",
      taluka: reportData.taluka || "Chamorshi",
      district: reportData.district || "Gadchiroli",
      observation_type: reportData.observation_type || "FEVER_CLUSTER",
      reported_count: Math.max(1, parseInt(reportData.reported_count || 1, 10)),
      report_date: reportData.report_date || new Date().toISOString().split("T")[0],
      source_role: reportData.source_role || "ASHA",
      reporter_name: reportData.reporter_name || "ASHA Worker",
      notes: reportData.notes || "Community field observation recorded.",
      is_verified: false,
      created_at: new Date().toISOString(),
    };

    mockCommunityReportsStore.unshift(payload);

    if (isConfigured) {
      await Promise.resolve(supabase.from("community_asha_reports").insert(payload)).catch((err) => {
        console.warn("Supabase community report insert fallback:", err.message);
      });
    }

    return payload;
  }

  /**
   * Retrieve community reports
   */
  async getCommunityReports({ phc_id, district = "Gadchiroli", limit = 50 } = {}) {
    let list = [...mockCommunityReportsStore];
    if (phc_id) {
      list = list.filter((r) => r.phc_id === phc_id);
    }
    if (district) {
      list = list.filter((r) => r.district === district);
    }
    return list.slice(0, limit);
  }

  /**
   * Fetch aggregated community observation signal series
   */
  async fetchAggregatedSignal({ phcId, district = "Gadchiroli", days = 28, simulateSpike = false, mockObservations = null } = {}) {
    if (Array.isArray(mockObservations)) {
      return {
        status: "calculated",
        is_available: true,
        data_quality: "HIGH",
        metricType: "community_reports",
        sourceStatus: "Community observation stream active",
        observations: mockObservations,
      };
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Map existing in-memory/DB reports
    const reportMap = new Map();
    const relevantReports = mockCommunityReportsStore.filter(
      (r) => (!phcId || r.phc_id === phcId) && (!district || r.district === district)
    );

    for (const rep of relevantReports) {
      const dStr = rep.report_date;
      reportMap.set(dStr, (reportMap.get(dStr) || 0) + rep.reported_count);
    }

    const observations = Array.from({ length: days }, (_, i) => {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dStr = d.toISOString().split("T")[0];

      let count = reportMap.get(dStr) || 0;
      if (simulateSpike && i >= days - 4) {
        count += 7 + (i % 3);
      }

      return {
        date: dStr,
        count,
        metricType: "community_reports",
        sourceStatus: "Community observation feed active",
      };
    });

    return {
      status: "calculated",
      is_available: true,
      data_quality: observations.some((o) => o.count > 0) ? "HIGH" : "MEDIUM",
      metricType: "community_reports",
      sourceStatus: "Community observation feed active",
      observations,
    };
  }
}

module.exports = CommunitySignalProvider;
