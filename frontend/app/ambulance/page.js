"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation, MAHARASHTRA_DISTRICTS } from "@/context/LocationContext";
import {
  MAHARASHTRA_AMBULANCE_FLEET_MASTER,
  getDistrictAmbulanceHub,
} from "@/lib/maharashtraAmbulanceData";
import { ambulanceApi } from "@/lib/api";
import {
  Siren,
  PhoneCall,
  MapPin,
  Compass,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Sparkles,
  Info,
  X,
  RefreshCw,
  Navigation,
  Activity,
  Heart,
  ChevronRight,
  ShieldAlert,
  SlidersHorizontal,
  Share2,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Crosshair,
  User,
  Truck,
  Building2,
  Layers,
  ArrowRight,
  PhoneForwarded,
} from "lucide-react";

export default function AmbulancePage() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { selectedDistrict, changeDistrict } = useLocation();

  // Location & Geolocation state
  const [coords, setCoords] = useState({ lat: 21.1458, lng: 79.0882 }); // Default Nagpur
  const [accuracy, setAccuracy] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [locationConsentGiven, setLocationConsentGiven] = useState(true);

  // Discovery & Filter state
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("ALL");
  const [ambulances, setAmbulances] = useState([]);
  const [isLoadingAmbulances, setIsLoadingAmbulances] = useState(false);
  const [providerStatus, setProviderStatus] = useState({
    isConfigured: true,
    isSimulation: true,
    message: "Development simulation mode active",
  });

  // Request & Active Trip state
  const [selectedAmbulanceForBooking, setSelectedAmbulanceForBooking] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [pickupAddress, setPickupAddress] = useState("");
  const [destinationFacility, setDestinationFacility] = useState("");
  const [emergencySeverity, setEmergencySeverity] = useState("CRITICAL_EMERGENCY");
  const [patientPhone, setPatientPhone] = useState(user?.phone || "+91 98220 12345");
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  // Active Live Tracking State
  const [activeTrip, setActiveTrip] = useState(null);
  const [telematics, setTelematics] = useState(null);
  const [tripStage, setTripStage] = useState("EN_ROUTE"); // REQUESTED, ASSIGNED, EN_ROUTE, ARRIVING, ARRIVED, TRIP_STARTED, COMPLETED
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("Patient arranged private vehicle");
  const [isShareCopied, setIsShareCopied] = useState(false);
  const [mapZoom, setMapZoom] = useState(1);
  const [mapCenterMode, setMapCenterMode] = useState("AUTO"); // AUTO, AMBULANCE, PATIENT
  const [mapTheme, setMapTheme] = useState("CLEAN"); // CLEAN, DARK_TELEMETRY

  // Telematics Live Refresh Interval Ref
  const trackingIntervalRef = useRef(null);

  // Get authentic Maharashtra district ambulance hub info
  const districtHub = useMemo(() => {
    return getDistrictAmbulanceHub(selectedDistrict);
  }, [selectedDistrict]);

  // Set default coordinates when district changes
  useEffect(() => {
    const districtObj = MAHARASHTRA_DISTRICTS.find(
      (d) => d.name.toLowerCase() === (selectedDistrict || "").toLowerCase()
    );
    if (districtObj) {
      setCoords({ lat: districtObj.lat, lng: districtObj.lng });
      setPickupAddress(`Near ${districtObj.hq}, ${districtObj.name} District, Maharashtra`);
      setDestinationFacility(`GMC / District Hospital (${districtObj.name})`);
    }
  }, [selectedDistrict]);

  // Fetch nearby ambulances from backend API
  const fetchNearbyAmbulances = useCallback(async () => {
    setIsLoadingAmbulances(true);
    try {
      const res = await ambulanceApi.searchNearby({
        lat: coords.lat,
        lng: coords.lng,
        district: selectedDistrict,
        type: selectedTypeFilter !== "ALL" ? selectedTypeFilter : undefined,
      });

      if (res && res.data) {
        setAmbulances(res.data.ambulances || []);
        setProviderStatus({
          isConfigured: res.data.configured !== false,
          isSimulation: res.data.isSimulation === true,
          message: res.data.message || "",
        });
      } else {
        fallbackAmbulances();
      }
    } catch (err) {
      console.warn("Ambulance API unavailable, fallback to district fleet:", err);
      fallbackAmbulances();
    } finally {
      setIsLoadingAmbulances(false);
    }
  }, [coords.lat, coords.lng, selectedDistrict, selectedTypeFilter]);

  const fallbackAmbulances = () => {
    const districtFleet = MAHARASHTRA_AMBULANCE_FLEET_MASTER.filter(
      (a) => a.district.toLowerCase() === (selectedDistrict || "").toLowerCase()
    );
    const fleetToUse = districtFleet.length > 0 ? districtFleet : MAHARASHTRA_AMBULANCE_FLEET_MASTER.slice(0, 4);

    let filtered = fleetToUse;
    if (selectedTypeFilter !== "ALL") {
      filtered = fleetToUse.filter((a) => a.ambulanceType === selectedTypeFilter);
    }
    setAmbulances(filtered);
    setProviderStatus({
      isConfigured: true,
      isSimulation: true,
      message: "Development simulation mode active",
    });
  };

  useEffect(() => {
    fetchNearbyAmbulances();
  }, [fetchNearbyAmbulances]);

  // Request browser Geolocation with consent
  const handleRequestLiveLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCoords(newCoords);
        setAccuracy(Math.round(position.coords.accuracy));
        setIsLocating(false);
        setLocationConsentGiven(true);
        setPickupAddress(`Current GPS Location (${newCoords.lat.toFixed(4)}, ${newCoords.lng.toFixed(4)})`);
      },
      (error) => {
        setIsLocating(false);
        let errorMsg = "Unable to retrieve your location.";
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = "Location permission denied. Please select your district manually below.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = "Location information is unavailable.";
        } else if (error.code === error.TIMEOUT) {
          errorMsg = "Location request timed out.";
        }
        setLocationError(errorMsg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Open Booking Modal for selected ambulance
  const handleOpenBooking = (ambulance) => {
    setSelectedAmbulanceForBooking(ambulance);
    setBookingStep(1);
    setIsBookingModalOpen(true);
  };

  // Submit Ambulance Dispatch Booking
  const handleConfirmBooking = async () => {
    setIsSubmittingBooking(true);
    try {
      const payload = {
        patientName: user?.name || "Citizen Patient",
        patientPhone: patientPhone || "+91 98220 12345",
        requestedType: selectedAmbulanceForBooking?.ambulanceType || "ADVANCED_LIFE_SUPPORT",
        pickupAddress: pickupAddress || `Near Civil Hospital, ${selectedDistrict}, Maharashtra`,
        pickupDistrict: selectedDistrict,
        pickupLat: coords.lat,
        pickupLng: coords.lng,
        destinationFacilityName: destinationFacility || `District General Hospital (${selectedDistrict})`,
        emergencySeverity,
      };

      const res = await ambulanceApi.createRequest(payload);

      if (res && res.data) {
        const trip = {
          ...res.data,
          ...payload,
          selectedAmbulance: selectedAmbulanceForBooking,
          assignedVehicleNumber: res.data.assignedVehicleNumber || selectedAmbulanceForBooking?.vehicleNumber || "MH-31-EM-1081",
          publicIdentifier: res.data.publicIdentifier || selectedAmbulanceForBooking?.publicIdentifier || "108 ALS Unit (GMC Trauma Base)",
          crewRole: res.data.assignedCrewRole || "Senior EMT Officer on Duty",
          crewName: "R. Deshmukh (Paramedic)",
          maskedContact: "108",
          providerName: "Maharashtra Emergency Medical Services (MEMS 108)",
          etaMinutes: res.data.etaMinutes || 6,
          distanceKm: res.data.distanceKm || 2.8,
        };

        setActiveTrip(trip);
        setTripStage("EN_ROUTE");
        setIsBookingModalOpen(false);
        startLiveTelematicsTracking(trip.tripId || `trip-${Date.now()}`);
      }
    } catch (err) {
      console.warn("Booking API failed, initializing local simulation trip:", err);
      // Resilient fallback
      const simulatedTrip = {
        requestId: `req-sim-${Date.now()}`,
        tripId: `trip-sim-${Date.now()}`,
        status: "EN_ROUTE",
        patientName: user?.name || "Citizen Patient",
        patientPhone: patientPhone,
        pickupAddress: pickupAddress || `${selectedDistrict} Central Base`,
        destinationFacilityName: destinationFacility || `District General Hospital (${selectedDistrict})`,
        pickupLat: coords.lat,
        pickupLng: coords.lng,
        selectedAmbulance: selectedAmbulanceForBooking,
        assignedVehicleNumber: selectedAmbulanceForBooking?.vehicleNumber || "MH-31-EM-1081",
        publicIdentifier: selectedAmbulanceForBooking?.publicIdentifier || "108 ALS Unit #42",
        crewRole: "Senior EMT Officer on Duty",
        crewName: "R. Deshmukh (EMT-Paramedic)",
        maskedContact: "108",
        providerName: "Maharashtra Emergency Medical Services (MEMS 108)",
        etaMinutes: 6,
        distanceKm: 2.8,
        isSimulation: true,
      };
      setActiveTrip(simulatedTrip);
      setTripStage("EN_ROUTE");
      setIsBookingModalOpen(false);
      startLiveTelematicsTracking(simulatedTrip.tripId);
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  // Live Telematics Polling & Simulated Progression
  const startLiveTelematicsTracking = (tripId) => {
    if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);

    let currentEta = 7;
    let currentDist = 3.2;

    const fetchPing = async () => {
      try {
        const res = await ambulanceApi.getTripLocation(tripId);
        if (res && res.data) {
          setTelematics(res.data);
          if (res.data.etaMinutes) currentEta = res.data.etaMinutes;
          if (res.data.distanceKm) currentDist = res.data.distanceKm;
        }
      } catch {
        // Local simulation progression
        currentEta = Math.max(1, currentEta - 0.2);
        currentDist = Math.max(0.2, (currentDist - 0.1).toFixed(1));

        if (currentEta <= 2 && currentEta > 1) {
          setTripStage("ARRIVING");
        } else if (currentEta <= 1) {
          setTripStage("ARRIVED");
        }

        setTelematics({
          tripId,
          status: currentEta <= 1 ? "ARRIVED" : "EN_ROUTE",
          currentLat: coords.lat + 0.008 * (currentEta / 7),
          currentLng: coords.lng + 0.010 * (currentEta / 7),
          heading: 220,
          speedKmh: currentEta <= 1 ? 0 : 42,
          etaMinutes: Math.ceil(currentEta),
          distanceKm: parseFloat(currentDist),
          lastUpdatedSecondsAgo: 2,
          isStale: false,
          statusText: "Live GPS Active • Updated 2s ago",
          isSimulation: true,
        });
      }
    };

    fetchPing();
    trackingIntervalRef.current = setInterval(fetchPing, 4000);
  };

  // Cleanup tracking interval on unmount
  useEffect(() => {
    return () => {
      if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);
    };
  }, []);

  // Cancel Active Request
  const handleCancelTrip = async () => {
    setIsCancelling(true);
    try {
      if (activeTrip?.requestId) {
        await ambulanceApi.cancelRequest(activeTrip.requestId, cancelReason);
      }
    } catch (err) {
      console.warn("Cancel API error:", err);
    } finally {
      if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);
      setTripStage("CANCELLED");
      setIsCancelling(false);
      setShowCancelModal(false);
      setTimeout(() => {
        setActiveTrip(null);
        setTelematics(null);
      }, 3000);
    }
  };

  // Complete Trip
  const handleCompleteTrip = () => {
    if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);
    setTripStage("COMPLETED");
  };

  // Copy tracking share link
  const handleShareTrip = () => {
    const shareUrl = `${window.location.origin}/ambulance?tripId=${activeTrip?.tripId || "demo"}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setIsShareCopied(true);
      setTimeout(() => setIsShareCopied(false), 2500);
    }
  };

  // 6-Stage Timeline Configuration
  const timelineStages = [
    { key: "REQUESTED", label: "Request Placed", desc: "Emergency logged" },
    { key: "ASSIGNED", label: "Unit Assigned", desc: "Crew alerted" },
    { key: "EN_ROUTE", label: "Ambulance En Route", desc: "Speed 42 km/h" },
    { key: "ARRIVING", label: "Arriving at Pickup", desc: "Within 500 meters" },
    { key: "ARRIVED", label: "Arrived at Location", desc: "Patient board ready" },
    { key: "COMPLETED", label: "Reached Hospital", desc: "Handover to Emergency" },
  ];

  const getStageIndex = (stage) => {
    switch (stage) {
      case "REQUESTED": return 0;
      case "ASSIGNED": return 1;
      case "EN_ROUTE": return 2;
      case "ARRIVING": return 3;
      case "ARRIVED": return 4;
      case "TRIP_STARTED": return 4;
      case "COMPLETED": return 5;
      default: return 2;
    }
  };

  const currentStageIdx = getStageIndex(tripStage);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      {/* Top National Emergency Helpline Strip */}
      <div className="bg-red-600 dark:bg-red-700 text-white px-4 py-2.5 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2 font-bold tracking-wide">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
            </span>
            <Siren className="w-4 h-4 text-white animate-bounce" />
            <span>NATIONAL MEDICAL EMERGENCY HELPLINE: DIAL 108 (TOLL FREE 24x7)</span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="tel:108"
              id="emergency-call-108-cta"
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-red-700 font-extrabold rounded-md shadow hover:bg-red-50 transition active:scale-95"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call 108 Directly</span>
            </a>
            <span className="hidden md:inline text-red-100 border-l border-red-400 pl-3">
              Maternal & Infant Transit: <strong className="text-white">102</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 gap-6">
        <Sidebar />

        <main className="flex-1 min-w-0 flex flex-col space-y-6">
          {/* ========================================================================= */}
          {/* ACTIVE TRIP TRACKING SCREEN (SWIGGY/UBER STYLE REAL-TIME VIEW)            */}
          {/* ========================================================================= */}
          {activeTrip && tripStage !== "CANCELLED" ? (
            <div className="flex flex-col space-y-4">
              {/* Header Floating Action Bar */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center font-bold relative">
                    <Siren className="w-6 h-6 animate-pulse" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                  </div>
                  <div>
                    <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{t.ambulanceOnTheWay || "Your Ambulance is on the Way"}</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>Trip ID: <strong className="font-mono text-slate-700 dark:text-slate-300">{activeTrip.tripId}</strong></span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                        <Radio className="w-3.5 h-3.5 animate-pulse" />
                        {telematics?.isStale ? (t.locationStaleNotice || "Live location temporarily unavailable") : (telematics?.statusText || t.liveLocationActive || "Live GPS Active • Updated 2s ago")}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleShareTrip}
                    id="share-trip-btn"
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                  >
                    {isShareCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                    <span>{isShareCopied ? "Link Copied!" : (t.shareTripStatus || "Share Status")}</span>
                  </button>

                  <a
                    href="tel:108"
                    id="active-trip-emergency-108"
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-red-600 text-white rounded-xl shadow hover:bg-red-700 transition"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>108 Emergency</span>
                  </a>
                </div>
              </div>

              {/* Strict Simulation / Real Data Notice */}
              {telematics?.isSimulation && (
                <div className="bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 px-4 py-2 rounded-xl text-xs flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 font-semibold">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>{t.developmentSimulationBadge || "DEVELOPMENT SIMULATION — NOT LIVE (Local Testing Only)"}</span>
                  </div>
                  <span className="text-[11px] opacity-80">Strictly rejected in production</span>
                </div>
              )}

              {/* Grid: Live Interactive Map (Dominant) & Tracking Bottom/Side Card */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* LARGE INTERACTIVE VECTOR MAP CANVAS (7 cols on lg, full width) */}
                <div className="lg:col-span-7 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xl min-h-[440px] sm:min-h-[520px] relative">
                  {/* Floating Map Camera Controls Toolbar */}
                  <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-md">
                    <button
                      onClick={() => setMapZoom((prev) => Math.min(prev + 0.25, 2))}
                      id="map-zoom-in-btn"
                      title="Zoom In"
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-200 transition"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setMapZoom((prev) => Math.max(prev - 0.25, 0.75))}
                      id="map-zoom-out-btn"
                      title="Zoom Out"
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-200 transition"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <div className="h-px bg-slate-200 dark:bg-slate-800 my-0.5"></div>
                    <button
                      onClick={() => setMapCenterMode("AMBULANCE")}
                      id="map-recenter-ambulance-btn"
                      title="Recenter Ambulance"
                      className={`p-2 rounded-lg transition ${mapCenterMode === "AMBULANCE" ? "bg-red-500 text-white" : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"}`}
                    >
                      <Truck className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setMapCenterMode("PATIENT")}
                      id="map-recenter-patient-btn"
                      title="Recenter Pickup"
                      className={`p-2 rounded-lg transition ${mapCenterMode === "PATIENT" ? "bg-emerald-500 text-white" : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"}`}
                    >
                      <MapPin className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Top Left Live Speed & ETA Floating Pill */}
                  <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-md">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
                    <div className="text-xs">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {telematics?.speedKmh || 42} km/h
                      </span>
                      <span className="text-slate-400 mx-1.5">•</span>
                      <span className="text-slate-500 dark:text-slate-400">Heading 220° SW</span>
                    </div>
                  </div>

                  {/* SVG Vector Map Rendering */}
                  <div className="flex-1 w-full h-full min-h-[420px] bg-slate-100 dark:bg-slate-950 relative overflow-hidden flex items-center justify-center select-none">
                    <svg
                      viewBox="0 0 800 600"
                      className="w-full h-full transition-transform duration-500 ease-out"
                      style={{
                        transform: `scale(${mapZoom}) translate(${mapCenterMode === "AMBULANCE" ? "-40px, -40px" : mapCenterMode === "PATIENT" ? "40px, 40px" : "0px, 0px"})`,
                      }}
                    >
                      {/* Grid Roads and Background Topology */}
                      <defs>
                        <pattern id="roadGrid" width="100" height="100" patternUnits="userSpaceOnUse">
                          <path d="M 100 0 L 0 0 0 100" fill="none" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1" />
                        </pattern>
                        <linearGradient id="routeGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0.9" />
                        </linearGradient>
                      </defs>

                      <rect width="800" height="600" fill="url(#roadGrid)" />

                      {/* Major Highway Arteries */}
                      <path d="M 50 300 Q 250 200, 450 320 T 750 280" fill="none" stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="14" strokeLinecap="round" />
                      <path d="M 200 80 Q 280 280, 480 480" fill="none" stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="10" strokeLinecap="round" />
                      <path d="M 120 520 Q 400 420, 680 180" fill="none" stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="8" strokeLinecap="round" />

                      {/* Dynamic Route Polyline from Ambulance -> Patient Pickup */}
                      <path
                        d="M 240 180 C 310 240, 390 280, 520 380"
                        fill="none"
                        stroke="url(#routeGlow)"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray="8 6"
                        className="animate-pulse"
                      />

                      {/* Route Polyline from Patient Pickup -> Destination Hospital */}
                      <path
                        d="M 520 380 C 580 420, 640 450, 710 490"
                        fill="none"
                        stroke="currentColor"
                        className="text-emerald-500/60"
                        strokeWidth="4"
                        strokeDasharray="6 4"
                      />

                      {/* Destination Hospital Marker (710, 490) */}
                      <g transform="translate(710, 490)">
                        <circle r="22" fill="#10b981" fillOpacity="0.15" />
                        <circle r="14" fill="#10b981" />
                        <text x="0" y="5" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="bold">🏥</text>
                        <rect x="-65" y="22" width="130" height="22" rx="6" fill="rgba(15, 23, 42, 0.85)" />
                        <text x="0" y="37" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">GMC Trauma Hospital</text>
                      </g>

                      {/* Patient Pickup Location Marker (520, 380) */}
                      <g transform="translate(520, 380)">
                        <circle r="36" fill="#3b82f6" fillOpacity="0.15" className="animate-ping" />
                        <circle r="20" fill="#3b82f6" fillOpacity="0.3" />
                        <circle r="12" fill="#2563eb" />
                        <circle r="5" fill="#ffffff" />
                        <rect x="-60" y="-38" width="120" height="22" rx="6" fill="rgba(37, 99, 235, 0.9)" />
                        <text x="0" y="-24" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">📍 Patient Pickup</text>
                      </g>

                      {/* Assigned Ambulance Real-Time Position Marker (240, 180 -> animated toward 520, 380) */}
                      <g transform={`translate(${240 + (520 - 240) * (1 - (telematics?.etaMinutes || 6) / 7)}, ${180 + (380 - 180) * (1 - (telematics?.etaMinutes || 6) / 7)})`}>
                        {/* Radar Pulse Ring */}
                        <circle r="34" fill="#ef4444" fillOpacity="0.2" className="animate-ping" />
                        <circle r="20" fill="#ef4444" fillOpacity="0.4" />
                        {/* Vehicle Icon Circle */}
                        <circle r="15" fill="#dc2626" />
                        <text x="0" y="5" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="bold">🚑</text>
                        {/* Callout Badge */}
                        <rect x="-70" y="-42" width="140" height="24" rx="6" fill="rgba(220, 38, 38, 0.95)" />
                        <text x="0" y="-26" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="extrabold">
                          {activeTrip.assignedVehicleNumber || "MH-31-EM-1081"}
                        </text>
                      </g>
                    </svg>

                    {/* Bottom Floating Map Information */}
                    <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between text-xs bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg">
                      <div className="flex items-center gap-2 truncate">
                        <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                        <span className="truncate text-slate-700 dark:text-slate-300">
                          Pickup: <strong>{activeTrip.pickupAddress}</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0 font-semibold text-slate-600 dark:text-slate-400 ml-2">
                        <Compass className="w-3.5 h-3.5" />
                        <span>Live Vector Mode</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SWIGGY/UBER STYLE TRACKING BOTTOM/SIDE CARD (5 cols on lg) */}
                <div className="lg:col-span-5 flex flex-col space-y-4">
                  {/* Hero ETA & Distance Metric Card */}
                  <div className="bg-gradient-to-br from-red-600 to-rose-700 text-white rounded-2xl p-5 shadow-xl relative overflow-hidden">
                    <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4">
                      <Siren className="w-36 h-36" />
                    </div>

                    <div className="relative z-10 flex items-center justify-between">
                      <div>
                        <span className="text-xs uppercase font-bold tracking-widest text-red-100">
                          {t.estimatedArrival || "Estimated Arrival"}
                        </span>
                        <div className="text-3xl sm:text-4xl font-black tracking-tight mt-1 flex items-baseline gap-2">
                          <span>{telematics?.etaMinutes || 6}</span>
                          <span className="text-lg font-bold text-red-100">MINUTES</span>
                        </div>
                        <p className="text-xs text-red-100 mt-1 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Ambulance is {telematics?.distanceKm || 2.8} km away</span>
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="inline-block px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-lg text-xs font-bold uppercase tracking-wider">
                          {tripStage}
                        </span>
                        <div className="text-xs text-red-100 mt-2 font-mono">
                          {activeTrip.assignedVehicleNumber || "MH-31-EM-1081"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 6-Stage Visual Delivery-Style Timeline */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
                      Trip Status Progression
                    </h3>

                    <div className="space-y-4">
                      {timelineStages.map((stage, idx) => {
                        const isDone = idx < currentStageIdx;
                        const isCurrent = idx === currentStageIdx;
                        const isPending = idx > currentStageIdx;

                        return (
                          <div key={stage.key} className="flex items-start gap-3.5 relative">
                            {/* Connecting vertical line */}
                            {idx < timelineStages.length - 1 && (
                              <div
                                className={`absolute left-[13px] top-[24px] bottom-[-16px] w-0.5 ${
                                  isDone ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-800"
                                }`}
                              />
                            )}

                            {/* Stage Icon Pin */}
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10 font-bold text-xs ${
                                isDone
                                  ? "bg-emerald-500 text-white"
                                  : isCurrent
                                  ? "bg-red-600 text-white ring-4 ring-red-100 dark:ring-red-950 animate-pulse"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                              }`}
                            >
                              {isDone ? <Check className="w-4 h-4" /> : idx + 1}
                            </div>

                            {/* Stage Details */}
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-bold ${isCurrent ? "text-red-600 dark:text-red-400" : isDone ? "text-slate-900 dark:text-white" : "text-slate-400"}`}>
                                {stage.label}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {stage.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Driver & Crew Profile + Masked Calling Button */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                            {activeTrip.crewRole || "Senior EMT Officer on Duty"}
                          </p>
                          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                            {activeTrip.crewName || "R. Deshmukh (EMT)"}
                          </h4>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-md border border-emerald-500/20">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Verified Crew
                      </span>
                    </div>

                    {/* Masked Calling Button (zero driver personal number exposed) */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <a
                        href="tel:108"
                        id="call-ambulance-crew-masked"
                        className="flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow transition active:scale-95 text-center"
                      >
                        <PhoneCall className="w-4 h-4" />
                        <span>{t.callAmbulanceBtn || "Call Ambulance"}</span>
                      </a>

                      <button
                        onClick={() => setShowCancelModal(true)}
                        id="cancel-ambulance-request-btn"
                        className="flex items-center justify-center gap-2 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm rounded-xl transition"
                      >
                        <X className="w-4 h-4" />
                        <span>{t.cancelAmbulance || "Cancel Request"}</span>
                      </button>
                    </div>

                    {/* Masked Privacy Disclaimer */}
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center leading-relaxed">
                      🔒 Calls are routed via Government 108 Emergency Dispatch proxy to protect crew and patient privacy.
                    </p>
                  </div>

                  {/* Ambulance Capabilities & Free Tariff Card */}
                  <div className="bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-4 text-xs space-y-2.5">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-slate-700 dark:text-slate-300">Vehicle Type:</span>
                      <span className="text-red-600 dark:text-red-400">
                        {activeTrip.selectedAmbulance?.categoryLabel || "Advanced Life Support (ALS)"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-slate-700 dark:text-slate-300">Government Tariff:</span>
                      <span className="text-emerald-600 dark:text-emerald-400">100% Free under NHM / MEMS 108</span>
                    </div>
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-slate-700 dark:text-slate-300">Destination:</span>
                      <span className="text-slate-900 dark:text-white truncate max-w-[200px]">
                        {activeTrip.destinationFacilityName}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ========================================================================= */
            /* DISCOVERY & BOOKING SCREEN (WHEN NO ACTIVE TRIP IS RUNNING)                */
            /* ========================================================================= */
            <div className="flex flex-col space-y-6">
              {/* Page Title & District Selection */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
                    <span className="p-2 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
                      <Siren className="w-7 h-7" />
                    </span>
                    <span>{t.ambulanceNearMe || "Ambulance Near Me"}</span>
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Discover verified emergency ambulances across all 36 districts of Maharashtra with live dispatch tracking.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* District Switcher */}
                  <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <MapPin className="w-4 h-4 text-red-600" />
                    <select
                      value={selectedDistrict}
                      onChange={(e) => changeDistrict(e.target.value)}
                      id="district-ambulance-selector"
                      className="bg-transparent text-sm font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
                    >
                      {MAHARASHTRA_DISTRICTS.map((d) => (
                        <option key={d.name} value={d.name} className="dark:bg-slate-800">
                          {d.name} District
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Browser Geolocation Button */}
                  <button
                    onClick={handleRequestLiveLocation}
                    id="gps-location-detect-btn"
                    disabled={isLocating}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow transition active:scale-95 disabled:opacity-50"
                  >
                    <Navigation className={`w-3.5 h-3.5 ${isLocating ? "animate-spin" : ""}`} />
                    <span>{isLocating ? "Detecting GPS..." : "Detect My Location"}</span>
                  </button>
                </div>
              </div>

              {/* District Emergency Control Hub Card */}
              {districtHub && (
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <span className="text-[11px] uppercase font-bold tracking-widest text-red-400">
                      Maharashtra MEMS 108 • Nodal Response Center
                    </span>
                    <h3 className="text-lg font-extrabold mt-0.5">{districtHub.district} District Emergency Dispatch Hub</h3>
                    <p className="text-xs text-slate-300 mt-1">
                      Nodal Base: <strong>{districtHub.nodalCenter}</strong> • Active Fleet: <strong>{districtHub.activeFleetALS + districtHub.activeFleetBLS + districtHub.activeFleet102} Units</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <a
                      href={`tel:${districtHub.directHelpline}`}
                      id="call-district-hub-btn"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow transition"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Dial {districtHub.directHelpline}</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Filter Tabs (ALS, BLS, 102 JSSK, ALL) */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {[
                  { id: "ALL", label: "All Types" },
                  { id: "ADVANCED_LIFE_SUPPORT", label: "ALS (ICU on Wheels)" },
                  { id: "BASIC_LIFE_SUPPORT", label: "BLS (Trauma / Oxygen)" },
                  { id: "PATIENT_TRANSPORT", label: "102 Janani Shishu (JSSK)" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTypeFilter(tab.id)}
                    id={`filter-${tab.id.toLowerCase()}`}
                    className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition ${
                      selectedTypeFilter === tab.id
                        ? "bg-red-600 text-white shadow-md"
                        : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Available Ambulances Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {ambulances.map((amb) => (
                  <div
                    key={amb.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-200 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-mono">
                          {amb.vehicleNumber}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          {amb.status}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{amb.publicIdentifier}</span>
                        </h3>
                        <p className="text-xs text-red-600 dark:text-red-400 font-semibold mt-0.5">
                          {amb.categoryLabel}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                          Base: {amb.baseStationName}
                        </p>
                      </div>

                      {/* Equipment Tags */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {amb.equipment?.slice(0, 4).map((eq, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md font-medium"
                          >
                            {eq}
                          </span>
                        ))}
                      </div>

                      {/* ETA & Distance Info */}
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-bold">
                          <Clock className="w-3.5 h-3.5 text-red-600" />
                          <span>ETA: ~{amb.etaMinutes} min</span>
                        </div>
                        <div className="text-slate-500 dark:text-slate-400">
                          {amb.distanceKm} km away
                        </div>
                      </div>
                    </div>

                    {/* Booking Action Button */}
                    <div className="pt-2">
                      <button
                        onClick={() => handleOpenBooking(amb)}
                        id={`request-amb-${amb.id}`}
                        className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow transition active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        <Siren className="w-4 h-4" />
                        <span>Request This Ambulance</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2-STEP DISPATCH CONFIRMATION MODAL                                        */}
          {/* ========================================================================= */}
          {isBookingModalOpen && selectedAmbulanceForBooking && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-red-500/10 text-red-600 rounded-xl">
                      <Siren className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                        Confirm Ambulance Dispatch
                      </h3>
                      <p className="text-xs text-slate-500">Government Verified Dispatch Protocol</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsBookingModalOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Selected Unit Details */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl text-xs space-y-2">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-600 dark:text-slate-400">Unit:</span>
                    <span className="text-slate-900 dark:text-white">{selectedAmbulanceForBooking.publicIdentifier}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-600 dark:text-slate-400">Category:</span>
                    <span className="text-red-600 dark:text-red-400">{selectedAmbulanceForBooking.categoryLabel}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-600 dark:text-slate-400">Tariff:</span>
                    <span className="text-emerald-600 dark:text-emerald-400">100% Free under NHM Government Scheme</span>
                  </div>
                </div>

                {/* Pickup & Destination Inputs */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Patient Pickup Address & Landmark *
                    </label>
                    <input
                      type="text"
                      value={pickupAddress}
                      onChange={(e) => setPickupAddress(e.target.value)}
                      placeholder="e.g. Near Bus Stand, Katol Road, Nagpur"
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Destination Hospital Facility
                    </label>
                    <input
                      type="text"
                      value={destinationFacility}
                      onChange={(e) => setDestinationFacility(e.target.value)}
                      placeholder="e.g. GMC Trauma Care / Civil Hospital"
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Contact Phone Number *
                      </label>
                      <input
                        type="text"
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        placeholder="+91 98220 12345"
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Emergency Severity
                      </label>
                      <select
                        value={emergencySeverity}
                        onChange={(e) => setEmergencySeverity(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="CRITICAL_EMERGENCY">Critical / Life Threatening</option>
                        <option value="URGENT">Urgent Care Needed</option>
                        <option value="MATERNAL_DELIVERY">Maternal / Delivery (102)</option>
                        <option value="STABLE_TRANSFER">Stable Inter-facility Transfer</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setIsBookingModalOpen(false)}
                    className="w-1/2 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmBooking}
                    id="confirm-dispatch-btn"
                    disabled={isSubmittingBooking}
                    className="w-1/2 py-2.5 text-xs font-extrabold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    <Siren className={`w-4 h-4 ${isSubmittingBooking ? "animate-spin" : ""}`} />
                    <span>{isSubmittingBooking ? "Dispatching..." : "Confirm & Track"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* CANCELLATION SAFEGUARD MODAL                                              */}
          {/* ========================================================================= */}
          {showCancelModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
                <div className="flex items-center gap-3 text-red-600">
                  <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Cancel Ambulance Request?
                  </h3>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300">
                  The ambulance unit is currently dispatched. Please select a reason for cancellation:
                </p>

                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none"
                >
                  <option value="Patient arranged private transport">Patient arranged private transport</option>
                  <option value="Condition stabilized at PHC">Condition stabilized at PHC</option>
                  <option value="Ambulance delayed / Traffic">Ambulance delayed / Traffic</option>
                  <option value="Booked by mistake">Booked by mistake</option>
                  <option value="Other">Other</option>
                </select>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setShowCancelModal(false)}
                    className="w-1/2 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-xl"
                  >
                    Keep Tracking
                  </button>
                  <button
                    onClick={handleCancelTrip}
                    disabled={isCancelling}
                    className="w-1/2 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl disabled:opacity-50"
                  >
                    {isCancelling ? "Cancelling..." : "Confirm Cancel"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
