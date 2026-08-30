# 🚑 JeevanSetu — Real-Time Ambulance Access & Tracking Module

## Overview
The **"Ambulance Near Me"** module (`/ambulance`) enables citizens, rural patients, and Primary Health Centre (PHC) staff across Maharashtra to discover nearby available ambulances, view verified capability/tariff information, submit dispatch requests, and monitor real-time telematics with strict data-staleness detection.

---

## 🔒 Strict Real-Data & Environment Policy
1. **Never Fake GPS Coordinates in Production:** JeevanSetu will never present fabricated GPS coordinates or fake driver numbers as live.
2. **Provider Connection Transparency:**
   - In production environments without active telematics credentials, the system displays: `Live provider connection required`. Direct 1-tap connection to Maharashtra 108/102 Emergency Dispatch is provided.
   - For local development/testing, a controlled simulator is active when `NODE_ENV !== 'production'` and `MOCK_AMBULANCE_PROVIDER=true`, displaying a prominent `⚠️ DEVELOPMENT SIMULATION` badge.
3. **101% Real Maharashtra Registry:** Pre-configured with authentic district emergency response hubs and nodal centers across all 36 districts of Maharashtra (e.g., GMC Trauma Care Nagpur, Sassoon Hospital Pune, District Civil Hospital Gadchiroli).

---

## 🏛️ System Architecture

```
                               ┌─────────────────────────────────────────────────────────────┐
                               │                    Citizen Web Interface                    │
                               │                      (/ambulance Page)                      │
                               └──────────────────────────────┬──────────────────────────────┘
                                                              │
                                       ┌──────────────────────┴──────────────────────┐
                                       │                                             │
                        [Browser Geolocation / Manual District]        [Interactive Live Vector Map]
                                       │                                             ▲
                                       ▼                                             │
                      ┌─────────────────────────────────┐                            │
                      │     JeevanSetu API Gateway      │                            │
                      │    (/api/ambulances/* routes)   │                            │
                      └────────────────┬────────────────┘                            │
                                       │                                             │
                      ┌────────────────┴────────────────┐                            │
                      │    Ambulance Provider Service   │                            │
                      └────────────────┬────────────────┘                            │
                                       │                                             │
           ┌───────────────────────────┼───────────────────────────┐                 │
           ▼                           ▼                           ▼                 │
┌───────────────────────┐ ┌─────────────────────────┐ ┌─────────────────────────┐   │
│  Maharashtra 108/102  │ │     Authorized GPS      │ │  Controlled Development  │   │
│  Govt Dispatch API    │ │   Telematics Webhook    │ │     Simulator (Dev)     │   │
└───────────────────────┘ └─────────────────────────┘ └─────────────────────────┘   │
           │                           │                           │                 │
           └───────────────────────────┼───────────────────────────┘                 │
                                       ▼                                             │
                      ┌─────────────────────────────────┐                            │
                      │    Supabase PostgreSQL + RLS    │                            │
                      │  (ambulances, requests, trips)  │                            │
                      └────────────────┬────────────────┘                            │
                                       │                                             │
                                       └─────────── Realtime / Polling ──────────────┘
```

---

## 🗄️ Database Tables & RLS Policies

| Table Name | Description | RLS Policy |
| :--- | :--- | :--- |
| `ambulance_providers` | Registry of government (MEMS 108/102) and accredited private/NGO ambulance networks. | Public read for active verified providers. |
| `ambulances` | Individual vehicles (ALS, BLS, Patient Transport) with equipment checklist and status. | Public read for available active units. |
| `ambulance_requests` | Patient booking requests with pickup/destination coordinates, severity, and status. | Patient read/write isolation via `auth.uid()`. |
| `ambulance_trips` | Active trip lifecycle linking request to vehicle with masked driver contact. | Restricted to assigned patient, provider, and district admin. |
| `ambulance_locations` | Ephemeral high-frequency tracking pings with TTL data minimization. | Read only during active authorized trip (`ASSIGNED`, `EN_ROUTE`, `ARRIVED`). |

---

## 🌐 API Endpoints

- `GET /api/ambulances/nearby?lat=...&lng=...&district=...&type=...` — Discover nearby ambulances.
- `GET /api/ambulances/fare-estimate?type=...` — Retrieve tariff policy (100% Free under NHM for Emergency ALS/BLS).
- `POST /api/ambulances/requests` — Submit ambulance dispatch request.
- `POST /api/ambulances/requests/:id/cancel` — Cancel active dispatch request with reason.
- `GET /api/ambulances/trips/:id/location` — Retrieve real-time vehicle location and staleness status.

---

## 📱 Navigation & Emergency Integration
1. **Topbar Emergency Button:** Clicking `#emergency-ambulance-trigger` routes directly to `/ambulance`, with instant `tel:108` direct dial beside it.
2. **Sidebar Menu:** Added `Ambulance Near Me` with `Siren` icon under Patient and PHC Staff navigation.
3. **Multilingual Localization:** Native English, Hindi, and Marathi translations for all ambulance interface elements.
