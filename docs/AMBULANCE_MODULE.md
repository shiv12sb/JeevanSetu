# 🚑 JeevanSetu — Real-Time Ambulance Access & Tracking Module

## Overview
The **"Ambulance Near Me"** module (`/ambulance`) delivers a **Swiggy/Uber-style real-time emergency healthcare trip tracking experience** for citizens, patients, and healthcare providers across all 36 districts of Maharashtra.

---

## 🔒 Strict Real-Data & Environment Policy
1. **Zero Fabricated GPS Coordinates in Production:** JeevanSetu will never present fake or artificially moved GPS coordinates in production environments.
2. **Provider Connection Transparency:**
   - In production environments where live telematics credentials (`MAHARASHTRA_108_API_KEY`, `MAHARASHTRA_108_API_URL`) are not configured, the system explicitly displays:
     > *"Live ambulance tracking requires an authorized ambulance provider connection. Please dial 108 directly for immediate emergency dispatch."*
   - For local development and testing, a controlled simulator is available ONLY when `NODE_ENV !== 'production'` and `MOCK_AMBULANCE_PROVIDER=true`, displaying a prominent **`⚠️ DEVELOPMENT SIMULATION — NOT LIVE`** badge. Production environments strictly reject simulation calls.
3. **101% Real Maharashtra Emergency Registry:** Pre-configured with verified MEMS 108/102 dispatch hubs, trauma centers, and taluka bases across all 36 districts of Maharashtra.

---

## 🏛️ Provider Adapter Architecture

All ambulance providers implement the unified `AmbulanceProviderAdapter` interface:

```javascript
class AmbulanceProviderAdapter extends BaseProvider {
  // 1. Discovery
  async searchNearbyAmbulances(query);

  // 2. Unit Capabilities & Equipment
  async getAmbulanceDetails(ambulanceId);

  // 3. District-wide Availability
  async getAvailability(query);

  // 4. Emergency Dispatch Request
  async requestAmbulance(requestPayload);

  // 5. Cancellation
  async cancelRequest(requestId, reason);

  // 6. Booking Status
  async getBookingStatus(requestId);

  // 7. Assigned Crew Profile & Masked Contact
  async getAssignedCrew(tripId);

  // 8. Real-Time Telematics & GPS Ping
  async getLiveLocation(tripId);

  // 9. ETA Calculation
  async getETA(origin, destination, ambulanceId);

  // 10. Tariff Policy & Scheme Coverage
  async getFareEstimate(fareParams);
}
```

---

## 🗺️ Live Tracking UI/UX Features

1. **Dominant Interactive Vector Map:**
   - Vector canvas with road grid topology, dynamic route polyline (Ambulance → Pickup → Destination), custom patient marker (📍), custom ambulance marker (🚑 with bearing heading), and destination trauma hospital (🏥).
   - Floating Map Controls: Zoom In (`+`), Zoom Out (`-`), Recenter on Ambulance (`🚑`), Recenter on Patient (`📍`), and Speedometer HUD (`42 km/h • Heading 220° SW`).
2. **Top Floating Pill Header:**
   - Real-time status: *"Your Ambulance is on the Way"*
   - Signal indicator: `"● LIVE GPS • Updated 2s ago"` (switches to `"Live location temporarily unavailable"` if staleness exceeds 60s).
3. **Swiggy/Uber-Style Bottom Sheet & Tracking Card:**
   - **Hero Metric Card:** Bold ETA countdown (`6 min Estimated Arrival`) and remaining distance (`2.8 km away`).
   - **6-Stage Delivery-Style Visual Timeline:**
     1. ✓ `REQUESTED` (Emergency logged)
     2. ✓ `ASSIGNED` (Unit assigned)
     3. ✓ `EN_ROUTE` (Ambulance en route)
     4. ● `ARRIVING` (Within 500 meters)
     5. ○ `ARRIVED` / `TRIP_STARTED` (Patient board ready)
     6. ○ `COMPLETED` (Reached destination trauma center)
   - **Assigned Driver / Crew Card & Masked Calling:**
     - Displays verified crew role (e.g. *Senior EMT Officer on Duty*) and sanitized name.
     - `[ 📞 Call Ambulance ]` button connects to official provider dispatch proxy / `108` line without exposing driver personal phone numbers.
   - **1-Tap Emergency Bypass:**
     - Direct `[ Call 108 Directly ]` button for life-threatening emergencies.
   - **Family Trip Sharing:**
     - 1-tap WhatsApp share and copyable tracking link with trip token.
   - **Controlled Cancellation Modal:**
     - Safe reason selection dialogue (*Patient arranged private transport*, *Condition stabilized*, etc.).
   - **Trip Completed Summary:**
     - Handover confirmation and feedback review link.

---

## 🌐 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/ambulances/nearby` | Discover nearby ambulances by coordinates and district |
| `GET` | `/api/ambulances/details/:id` | Retrieve equipment and capability of specific vehicle |
| `POST` | `/api/ambulances/requests` | Submit emergency ambulance dispatch request |
| `GET` | `/api/ambulances/requests/:id` | Check request lifecycle and status |
| `POST` | `/api/ambulances/requests/:id/cancel` | Cancel active dispatch request |
| `GET` | `/api/ambulances/trips/:id/crew` | Retrieve verified crew role and masked calling proxy |
| `GET` | `/api/ambulances/trips/:id/location` | Retrieve real-time vehicle GPS, heading, speed, and staleness |
| `GET` | `/api/ambulances/trips/:id/stream` | Server-Sent Events (SSE) live GPS telematics stream |
| `GET` | `/api/ambulances/fare-estimate` | Retrieve NHM 100% Free tariff rules |
| `POST` | `/api/ambulances/trips/:id/complete` | Close active trip |

---

## 🧪 Test Coverage
- **Backend Test Suite:** `backend/tests/phase43_ambulance_tracking.test.js` (14/14 automated assertions passing).
- **Regression Suites:** `run_all.js` (20/20 test suites passing, 100% pass rate).
- **Production Build:** Next.js Turbopack 33/33 static routes compiled cleanly.
