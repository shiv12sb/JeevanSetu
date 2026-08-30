/**
 * ==============================================================================
 * JEEVANSETU AMBULANCE SERVICE
 * ==============================================================================
 * Core business logic and safety coordinator for Ambulance Access & Tracking.
 */

const {
  Maharashtra108DispatchAdapter,
  MockAmbulanceProvider,
} = require("./providers/ambulance.provider");
const env = require("../config/env");

class AmbulanceService {
  constructor() {
    this.gov108Adapter = new Maharashtra108DispatchAdapter();
    this.mockSimulator = new MockAmbulanceProvider();
  }

  /**
   * Determine active provider adapter based on environment and configuration
   */
  getProvider() {
    if (this.gov108Adapter.isConfigured()) {
      return this.gov108Adapter;
    }
    if (process.env.NODE_ENV !== "production" && (env.MOCK_PROVIDERS || process.env.MOCK_AMBULANCE_PROVIDER === "true")) {
      return this.mockSimulator;
    }
    return this.gov108Adapter; // In production without credentials, returns unconfigured adapter
  }

  /**
   * 1. Discover nearby available ambulances
   */
  async searchNearbyAmbulances({ lat, lng, radiusKm = 25, type, district = "Nagpur" }) {
    const provider = this.getProvider();
    
    // In production without live provider credentials, do not fabricate fake vehicles
    if (!provider.isConfigured() && process.env.NODE_ENV === "production") {
      return {
        configured: false,
        isLive: false,
        message: "Live ambulance tracking requires an authorized ambulance provider connection.",
        providerNotice: "Provider integration not configured. Please dial 108 directly for immediate emergency dispatch.",
        directHelpline: "108",
        maternalHelpline: "102",
        emergencyNotice: "For immediate life-threatening medical emergencies, dial 108 immediately.",
        district,
        ambulances: [],
      };
    }

    return await provider.searchNearbyAmbulances({
      lat: parseFloat(lat) || 21.1458,
      lng: parseFloat(lng) || 79.0882,
      radiusKm: parseInt(radiusKm, 10) || 25,
      type,
      district,
    });
  }

  /**
   * 2. Retrieve detailed capabilities of a specific ambulance
   */
  async getAmbulanceDetails(ambulanceId) {
    const provider = this.getProvider();
    return await provider.getAmbulanceDetails(ambulanceId);
  }

  /**
   * 3. Submit an ambulance dispatch request
   */
  async createRequest(patientId, requestData) {
    const {
      patientName,
      patientPhone,
      requestedType = "BASIC_LIFE_SUPPORT",
      pickupAddress,
      pickupLat,
      pickupLng,
      pickupDistrict = "Nagpur",
      destinationFacilityName,
      destinationLat,
      destinationLng,
      emergencySeverity = "URGENT",
    } = requestData;

    if (!pickupAddress || !patientPhone) {
      const err = new Error("Pickup address and contact phone number are required.");
      err.statusCode = 400;
      throw err;
    }

    const provider = this.getProvider();

    if (!provider.isConfigured() && process.env.NODE_ENV === "production") {
      const err = new Error("Live ambulance tracking requires an authorized ambulance provider connection. Please call 108 directly.");
      err.statusCode = 503;
      err.directCallUrl = "tel:108";
      throw err;
    }

    return await provider.requestAmbulance({
      patientId,
      patientName,
      patientPhone,
      requestedType,
      pickupAddress,
      pickupLat,
      pickupLng,
      pickupDistrict,
      destinationFacilityName,
      destinationLat,
      destinationLng,
      emergencySeverity,
    });
  }

  /**
   * 4. Cancel an active ambulance request
   */
  async cancelRequest(requestId, reason, userId) {
    const provider = this.getProvider();
    return await provider.cancelRequest(requestId, reason);
  }

  /**
   * 5. Get status of a request
   */
  async getRequestStatus(requestId) {
    const provider = this.getProvider();
    return await provider.getBookingStatus(requestId);
  }

  /**
   * 6. Retrieve assigned crew details
   */
  async getTripCrew(tripId) {
    const provider = this.getProvider();
    return await provider.getAssignedCrew(tripId);
  }

  /**
   * 7. Get real-time location stream for an active trip
   */
  async getTripLocation(tripId) {
    const provider = this.getProvider();
    const locationData = await provider.getLiveLocation(tripId);

    // Staleness Evaluation
    if (locationData && locationData.lastLocationUpdate) {
      const diffSeconds = Math.round((Date.now() - new Date(locationData.lastLocationUpdate).getTime()) / 1000);
      locationData.lastUpdatedSecondsAgo = Math.max(0, diffSeconds);
      locationData.isStale = diffSeconds > 60; // Flag as stale if no GPS ping for over 60 seconds
      if (diffSeconds > 180) {
        locationData.statusText = "Location signal temporarily unavailable / Last received " + Math.round(diffSeconds / 60) + " min ago";
      } else {
        locationData.statusText = "Live GPS Active • Updated " + locationData.lastUpdatedSecondsAgo + "s ago";
      }
    }

    return locationData;
  }

  /**
   * 8. Calculate ETA
   */
  async calculateETA(origin, destination, ambulanceId) {
    const provider = this.getProvider();
    return await provider.getETA(origin, destination, ambulanceId);
  }

  /**
   * 9. Get fare estimates
   */
  async getFareEstimate(params) {
    const provider = this.getProvider();
    return await provider.getFareEstimate(params);
  }

  /**
   * 10. Complete Trip
   */
  async completeTrip(tripId, closureData = {}) {
    return {
      success: true,
      tripId,
      status: "COMPLETED",
      completedAt: new Date().toISOString(),
      destinationHospital: closureData.destinationHospital || "District Medical Center",
      message: "Ambulance trip completed successfully.",
    };
  }
}

module.exports = new AmbulanceService();
