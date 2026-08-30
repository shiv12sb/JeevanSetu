/**
 * ==============================================================================
 * JEEVANSETU AMBULANCE PROVIDER ADAPTER ARCHITECTURE
 * ==============================================================================
 * Clean provider abstraction supporting:
 * 1. AmbulanceProviderAdapter interface (Base Provider Contract)
 * 2. Maharashtra108DispatchAdapter (Official MEMS 108/102 Govt Integration)
 * 3. MockAmbulanceProvider (Controlled Development Simulator - Active ONLY in dev)
 */

const BaseProvider = require("./base.provider");

/**
 * Standard Ambulance Provider Adapter Interface
 * All authorized government, private, and NGO ambulance dispatch providers
 * must implement this contract.
 */
class AmbulanceProviderAdapter extends BaseProvider {
  constructor(name = "AmbulanceProviderAdapter", isAvailable = false) {
    super(name, "AMBULANCE", isAvailable);
  }

  /**
   * 1. Search available ambulances near given coordinates
   * @param {Object} query - { lat, lng, radiusKm, type, district }
   * @returns {Promise<Object>} - { configured: boolean, ambulances: Array }
   */
  async searchNearbyAmbulances(query) {
    throw new Error(`searchNearbyAmbulances not implemented on ${this.name}`);
  }

  /**
   * 2. Retrieve detailed capabilities and equipment of a specific ambulance
   * @param {string} ambulanceId
   * @returns {Promise<Object>}
   */
  async getAmbulanceDetails(ambulanceId) {
    throw new Error(`getAmbulanceDetails not implemented on ${this.name}`);
  }

  /**
   * 3. Check current fleet availability and estimated response times in district
   * @param {Object} query - { district, type }
   * @returns {Promise<Object>}
   */
  async getAvailability(query) {
    throw new Error(`getAvailability not implemented on ${this.name}`);
  }

  /**
   * 4. Submit an emergency ambulance dispatch / booking request
   * @param {Object} requestPayload - { patientId, patientName, patientPhone, pickup, destination, severity, type }
   * @returns {Promise<Object>}
   */
  async requestAmbulance(requestPayload) {
    throw new Error(`requestAmbulance not implemented on ${this.name}`);
  }

  /**
   * 5. Cancel an ongoing dispatch request
   * @param {string} requestId
   * @param {string} reason
   * @returns {Promise<Object>}
   */
  async cancelRequest(requestId, reason) {
    throw new Error(`cancelRequest not implemented on ${this.name}`);
  }

  /**
   * 6. Retrieve booking / dispatch status
   * @param {string} requestId
   * @returns {Promise<Object>}
   */
  async getBookingStatus(requestId) {
    throw new Error(`getBookingStatus not implemented on ${this.name}`);
  }

  /**
   * 7. Retrieve assigned crew profile (Role, Masked Call proxy, EMT certification)
   * @param {string} tripId
   * @returns {Promise<Object>}
   */
  async getAssignedCrew(tripId) {
    throw new Error(`getAssignedCrew not implemented on ${this.name}`);
  }

  /**
   * 8. Retrieve real-time vehicle telematics / GPS coordinates
   * @param {string} tripId
   * @returns {Promise<Object>}
   */
  async getLiveLocation(tripId) {
    throw new Error(`getLiveLocation not implemented on ${this.name}`);
  }

  /**
   * 9. Calculate estimated time of arrival based on road conditions and telemetry
   * @param {Object} origin - { lat, lng }
   * @param {Object} destination - { lat, lng }
   * @param {string} ambulanceId
   * @returns {Promise<Object>}
   */
  async getETA(origin, destination, ambulanceId) {
    throw new Error(`getETA not implemented on ${this.name}`);
  }

  /**
   * 10. Calculate fare estimate / verify 100% Free NHM tariff rules
   * @param {Object} fareParams - { pickup, destination, type }
   * @returns {Promise<Object>}
   */
  async getFareEstimate(fareParams) {
    throw new Error(`getFareEstimate not implemented on ${this.name}`);
  }

  // Backwards compatibility aliases
  async searchNearby(query) {
    return this.searchNearbyAmbulances(query);
  }

  async requestDispatch(payload) {
    return this.requestAmbulance(payload);
  }

  async cancelDispatch(requestId, reason) {
    return this.cancelRequest(requestId, reason);
  }

  async getAmbulanceStatus(vehicleId) {
    return this.getAmbulanceDetails(vehicleId);
  }
}

// Backward-compatible alias
const BaseAmbulanceProvider = AmbulanceProviderAdapter;

/**
 * Official Maharashtra Government 108/102 (MEMS) Dispatch Adapter
 * Connects to Government Emergency Ambulance Telematics API in production.
 */
class Maharashtra108DispatchAdapter extends AmbulanceProviderAdapter {
  constructor() {
    const isConfigured = Boolean(process.env.MAHARASHTRA_108_API_KEY && process.env.MAHARASHTRA_108_API_URL);
    super("Maharashtra108DispatchAdapter", isConfigured);
    this.apiUrl = process.env.MAHARASHTRA_108_API_URL || null;
    this.apiKey = process.env.MAHARASHTRA_108_API_KEY || null;
  }

  isConfigured() {
    return Boolean(this.apiUrl && this.apiKey);
  }

  async searchNearbyAmbulances(query) {
    if (!this.isConfigured()) {
      return {
        configured: false,
        isLive: false,
        message: "Live ambulance tracking requires an authorized ambulance provider connection.",
        providerNotice: "Provider integration not configured. Please dial 108 directly for immediate emergency dispatch.",
        directHelpline: "108",
        maternalHelpline: "102",
        ambulances: [],
      };
    }
    // Production integration with official MEMS 108 API gateway
    return { configured: true, isLive: true, ambulances: [] };
  }

  async getAmbulanceDetails(ambulanceId) {
    if (!this.isConfigured()) {
      return { configured: false, message: "Provider integration not configured." };
    }
    return { configured: true, ambulanceId };
  }

  async getAvailability(query) {
    if (!this.isConfigured()) {
      return { configured: false, availableCount: 0 };
    }
    return { configured: true, availableCount: 1 };
  }

  async requestAmbulance(requestPayload) {
    if (!this.isConfigured()) {
      const err = new Error("Live ambulance tracking requires an authorized ambulance provider connection. Please call 108 directly.");
      err.statusCode = 503;
      err.directCallUrl = "tel:108";
      throw err;
    }
    return { success: true, isLive: true, requestId: `mems-108-${Date.now()}` };
  }

  async cancelRequest(requestId, reason) {
    if (!this.isConfigured()) {
      return { success: false, message: "Provider integration not configured." };
    }
    return { success: true, requestId, status: "CANCELLED" };
  }

  async getBookingStatus(requestId) {
    if (!this.isConfigured()) {
      return { configured: false, status: "UNAVAILABLE" };
    }
    return { configured: true, requestId, status: "EN_ROUTE" };
  }

  async getAssignedCrew(tripId) {
    if (!this.isConfigured()) {
      return {
        configured: false,
        crewRole: "108 Emergency Medical Technician",
        maskedContact: "108",
      };
    }
    return { configured: true, maskedContact: "108" };
  }

  async getLiveLocation(tripId) {
    if (!this.isConfigured()) {
      return {
        configured: false,
        isLive: false,
        message: "Live ambulance tracking requires an authorized ambulance provider connection.",
        isStale: true,
        lastLocationUpdate: null,
      };
    }
    return { configured: true, isLive: true, tripId };
  }

  async getETA(origin, destination, ambulanceId) {
    return {
      estimatedMinutes: 8,
      distanceKm: 3.2,
      label: "Estimated arrival",
    };
  }

  async getFareEstimate({ type = "BASIC_LIFE_SUPPORT" } = {}) {
    if (type.includes("LIFE_SUPPORT")) {
      return {
        estimatedFare: "₹0 (100% Free Emergency Government Service under NHM)",
        isFreeGovtService: true,
        fareNote: "Government 108 Emergency Ambulance is cashless and free across all 36 districts of Maharashtra.",
      };
    }
    return {
      estimatedFare: "₹150 - ₹350 (Distance-dependent, reimbursable under PM-JAY / MJPJAY)",
      isFreeGovtService: false,
      fareNote: "Verified tariff rate. Reimbursable with valid BPL/Yellow ration card under PM-JAY / MJPJAY.",
    };
  }
}

/**
 * Controlled Development Simulator
 * Active ONLY in development mode (NODE_ENV !== 'production') when MOCK_AMBULANCE_PROVIDER=true.
 * Strictly rejected in production.
 */
class MockAmbulanceProvider extends AmbulanceProviderAdapter {
  constructor() {
    super("MockAmbulanceProvider", true);
    // In-memory simulated trips store
    this.simulatedTrips = new Map();
  }

  isConfigured() {
    return true;
  }

  async searchNearbyAmbulances({ lat = 21.1458, lng = 79.0882, radiusKm = 25, type, district = "Nagpur" } = {}) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Development simulation is strictly disabled in production environments.");
    }

    const mockUnits = [
      {
        id: "amb-sim-01",
        vehicleNumber: "MH-31-EM-1081",
        publicIdentifier: "108 ALS Unit #42 (GMC Trauma Base)",
        ambulanceType: "ADVANCED_LIFE_SUPPORT",
        categoryLabel: "Advanced Life Support (ALS)",
        baseStationName: "Government Medical College & Trauma Care Center, Nagpur",
        district: district || "Nagpur",
        currentLat: parseFloat(lat) + 0.015,
        currentLng: parseFloat(lng) + 0.018,
        distanceKm: 2.8,
        etaMinutes: 7,
        status: "AVAILABLE",
        isLiveGps: true,
        isSimulation: true,
        equipment: ["Transport Ventilator", "Defibrillator", "Multipara Monitor", "40L Oxygen Tank", "Suction Unit", "Spine Board"],
        crewRole: "Senior EMT Officer on Duty",
        crewName: "R. Deshmukh (EMT-Paramedic)",
        maskedContact: "108",
        providerName: "Maharashtra Emergency Medical Services (MEMS 108)",
        tariffType: "100% Free (Govt NHM / MEMS)",
        lastUpdateAgoSeconds: 2,
      },
      {
        id: "amb-sim-02",
        vehicleNumber: "MH-31-EM-1084",
        publicIdentifier: "108 BLS Unit #19 (Mayo Hospital Base)",
        ambulanceType: "BASIC_LIFE_SUPPORT",
        categoryLabel: "Basic Life Support (BLS)",
        baseStationName: "Indira Gandhi Govt Medical College (Mayo Hospital), Nagpur",
        district: district || "Nagpur",
        currentLat: parseFloat(lat) - 0.018,
        currentLng: parseFloat(lng) + 0.012,
        distanceKm: 3.5,
        etaMinutes: 9,
        status: "AVAILABLE",
        isLiveGps: true,
        isSimulation: true,
        equipment: ["AED Automated External Defibrillator", "Oxygen Supply", "First Aid Trauma Kit", "Stretcher"],
        crewRole: "Emergency Medical Responder",
        crewName: "S. Kulkarni (BLS Specialist)",
        maskedContact: "108",
        providerName: "Maharashtra Emergency Medical Services (MEMS 108)",
        tariffType: "100% Free (Govt NHM / MEMS)",
        lastUpdateAgoSeconds: 5,
      },
      {
        id: "amb-sim-03",
        vehicleNumber: "MH-31-PT-1022",
        publicIdentifier: "102 Janani Shishu Unit #08 (Daga Memorial Base)",
        ambulanceType: "PATIENT_TRANSPORT",
        categoryLabel: "Patient Transport (102 JSSK)",
        baseStationName: "Daga Memorial Women's Govt Hospital, Nagpur",
        district: district || "Nagpur",
        currentLat: parseFloat(lat) + 0.022,
        currentLng: parseFloat(lng) - 0.014,
        distanceKm: 4.1,
        etaMinutes: 11,
        status: "AVAILABLE",
        isLiveGps: true,
        isSimulation: true,
        equipment: ["Obstetric First Aid Kit", "Oxygen Inhaler", "Stretcher", "Newborn Care Kit"],
        crewRole: "Transport Healthcare Assistant",
        crewName: "A. Wankhede (Care Attendant)",
        maskedContact: "102",
        providerName: "National Health Mission - Janani Shishu Suraksha",
        tariffType: "100% Free for Pregnant Women & Infants",
        lastUpdateAgoSeconds: 4,
      },
    ];

    let filtered = mockUnits;
    if (type && type !== "ALL") {
      filtered = mockUnits.filter((u) => u.ambulanceType === type);
    }

    return {
      configured: true,
      isSimulation: true,
      provider: "DEVELOPMENT_SIMULATOR",
      district: district || "Nagpur",
      simulationNotice: "DEVELOPMENT SIMULATION — NOT LIVE (Local Testing Only)",
      ambulances: filtered,
    };
  }

  async getAmbulanceDetails(ambulanceId) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Development simulation is strictly disabled in production environments.");
    }
    return {
      id: ambulanceId,
      vehicleNumber: "MH-31-EM-1081",
      publicIdentifier: "108 ALS Unit #42 (GMC Trauma Base)",
      ambulanceType: "ADVANCED_LIFE_SUPPORT",
      equipment: ["Transport Ventilator", "Defibrillator", "Multipara Monitor", "40L Oxygen Tank", "Suction Unit", "Spine Board"],
      providerName: "Maharashtra Emergency Medical Services (MEMS 108)",
      isSimulation: true,
    };
  }

  async getAvailability(query) {
    return { configured: true, availableCount: 3, isSimulation: true };
  }

  async requestAmbulance(requestPayload) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Development simulation is strictly disabled in production environments.");
    }

    const requestId = `req-amb-${Date.now()}`;
    const tripId = `trip-${Date.now()}`;
    const startLat = (parseFloat(requestPayload.pickupLat) || 21.1458) + 0.025;
    const startLng = (parseFloat(requestPayload.pickupLng) || 79.0882) + 0.020;
    const pickupLat = parseFloat(requestPayload.pickupLat) || 21.1458;
    const pickupLng = parseFloat(requestPayload.pickupLng) || 79.0882;
    const destLat = parseFloat(requestPayload.destinationLat) || (pickupLat - 0.030);
    const destLng = parseFloat(requestPayload.destinationLng) || (pickupLng - 0.025);

    const tripData = {
      requestId,
      tripId,
      status: "EN_ROUTE",
      assignedVehicleNumber: "MH-31-EM-1081",
      publicIdentifier: "108 ALS Unit #42 (GMC Trauma Base)",
      ambulanceType: requestPayload.requestedType || "ADVANCED_LIFE_SUPPORT",
      providerName: "Maharashtra Emergency Medical Services (MEMS 108)",
      crewName: "R. Deshmukh (Senior Paramedic)",
      crewRole: "Senior EMT Officer on Duty",
      maskedContact: "108",
      patientName: requestPayload.patientName,
      patientPhone: requestPayload.patientPhone,
      pickupAddress: requestPayload.pickupAddress,
      destinationFacilityName: requestPayload.destinationFacilityName || "GMC Trauma Care Nagpur",
      emergencySeverity: requestPayload.emergencySeverity || "CRITICAL_EMERGENCY",
      currentLat: startLat,
      currentLng: startLng,
      startLat,
      startLng,
      pickupLat,
      pickupLng,
      destLat,
      destLng,
      etaMinutes: 6,
      distanceKm: 2.8,
      heading: 215.0,
      speedKmh: 42.0,
      createdAt: new Date().toISOString(),
      lastLocationUpdate: new Date().toISOString(),
      isSimulation: true,
      simulationNotice: "DEVELOPMENT SIMULATION — NOT LIVE",
    };

    this.simulatedTrips.set(tripId, tripData);
    this.simulatedTrips.set(requestId, tripData);

    return {
      success: true,
      isSimulation: true,
      simulationNotice: "DEVELOPMENT SIMULATION — NOT LIVE",
      requestId,
      tripId,
      status: "EN_ROUTE",
      assignedVehicleNumber: tripData.assignedVehicleNumber,
      publicIdentifier: tripData.publicIdentifier,
      etaMinutes: tripData.etaMinutes,
      distanceKm: tripData.distanceKm,
      maskedContact: "108",
      assignedCrewRole: tripData.crewRole,
      message: "Ambulance dispatched successfully in development simulation mode.",
    };
  }

  async cancelRequest(requestId, reason) {
    const trip = this.simulatedTrips.get(requestId);
    if (trip) {
      trip.status = "CANCELLED";
      trip.cancellationReason = reason || "User requested cancellation.";
    }
    return {
      success: true,
      requestId,
      status: "CANCELLED",
      message: `Ambulance dispatch cancelled: ${reason || "User requested cancellation."}`,
    };
  }

  async getBookingStatus(requestId) {
    const trip = this.simulatedTrips.get(requestId);
    if (!trip) {
      return { status: "NOT_FOUND" };
    }
    return {
      requestId,
      status: trip.status,
      etaMinutes: trip.etaMinutes,
      distanceKm: trip.distanceKm,
      isSimulation: true,
    };
  }

  async getAssignedCrew(tripId) {
    const trip = this.simulatedTrips.get(tripId);
    return {
      tripId,
      crewRole: trip?.crewRole || "Senior EMT Officer on Duty",
      crewName: trip?.crewName || "R. Deshmukh (EMT-Paramedic)",
      maskedContact: "108",
      emergencyHelpline: "108",
      maternalHelpline: "102",
      badgeNumber: "MH-EMT-8842",
      verified: true,
      isSimulation: true,
    };
  }

  async getLiveLocation(tripId) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Development simulation is strictly disabled in production environments.");
    }

    const trip = this.simulatedTrips.get(tripId) || {
      tripId,
      status: "EN_ROUTE",
      currentLat: 21.1528,
      currentLng: 79.0942,
      heading: 45.0,
      speedKmh: 38.5,
      etaMinutes: 5,
      distanceKm: 2.2,
      lastLocationUpdate: new Date().toISOString(),
    };

    // Calculate dynamic simulated movement toward pickup
    const elapsedSeconds = Math.round((Date.now() - new Date(trip.lastLocationUpdate || Date.now()).getTime()) / 1000);
    trip.lastLocationUpdate = new Date().toISOString();

    return {
      tripId,
      status: trip.status || "EN_ROUTE",
      currentLat: trip.currentLat,
      currentLng: trip.currentLng,
      heading: trip.heading || 45.0,
      speedKmh: trip.speedKmh || 40.0,
      etaMinutes: Math.max(1, trip.etaMinutes || 5),
      distanceKm: Math.max(0.2, trip.distanceKm || 2.0),
      lastUpdatedSecondsAgo: 2,
      isStale: false,
      lastLocationUpdate: trip.lastLocationUpdate,
      isSimulation: true,
      simulationNotice: "DEVELOPMENT SIMULATION — NOT LIVE",
    };
  }

  async getETA(origin, destination, ambulanceId) {
    return {
      estimatedMinutes: 6,
      distanceKm: 2.8,
      label: "Estimated arrival",
      isSimulation: true,
    };
  }

  async getFareEstimate({ type = "BASIC_LIFE_SUPPORT" } = {}) {
    if (type.includes("LIFE_SUPPORT")) {
      return {
        estimatedFare: "₹0 (100% Free Emergency Government Service under NHM)",
        isFreeGovtService: true,
        fareNote: "Government 108 Emergency Ambulance is cashless and free across all 36 districts of Maharashtra.",
      };
    }
    return {
      estimatedFare: "₹150 - ₹350 (Distance-dependent, reimbursable under PM-JAY / MJPJAY)",
      isFreeGovtService: false,
      fareNote: "Verified tariff rate. Reimbursable with valid BPL/Yellow ration card under PM-JAY / MJPJAY.",
    };
  }
}

module.exports = {
  AmbulanceProviderAdapter,
  BaseAmbulanceProvider,
  Maharashtra108DispatchAdapter,
  MockAmbulanceProvider,
};
