# JeevanSetu Known Platform Limitations & Boundary Matrix

## 1. Classification Framework
This document provides an honest assessment of platform boundaries, distinguishing between fully implemented capabilities, external dependencies, mocked development adapters, and future enhancements.

---

## 2. Platform Capability & Limitation Matrix

| Subsystem / Feature | Implementation Status | Current Operational Boundary | Dependency / Constraint |
|---|---|---|---|
| **Role-Based Dashboards (6 Roles)** | **Implemented** | Full UI dashboards and backend APIs for Patient, PHC Staff, Doctor, Hospital Staff, NGO Staff, and District Admin. | Next.js 16.3.2 Turbopack, Express 4.21. |
| **Row-Level Security (RLS)** | **Implemented** | Enforced on 100% of sensitive tables in PostgreSQL. | PostgreSQL 15+ / Supabase Auth. |
| **6-Stage Referral Lifecycle** | **Implemented** | Sequential status progression with facility scoping and audit event trails. | Server-side database transactions. |
| **Atomic Medicine Inventory** | **Implemented** | Rejects negative stock balances (`current_quantity >= 0`) and logs ledger transactions. | PostgreSQL concurrency controls. |
| **Non-Diagnostic AI Guidance** | **Implemented** | Generates structured educational guidance; non-diagnostic; prompt injection contained. | LLM Provider API (Gemini / Claude / OpenAI). |
| **Deterministic AI Fallback** | **Implemented** | Serves static, localized guidance cards upon upstream AI timeout or 5xx outage. | In-memory deterministic knowledge base. |
| **IVR Telephony State Machine** | **Implemented** | 6-option DTMF menu navigation, retry caps, language switching, 108 emergency preemption. | Express `/api/ivr/webhook` endpoint. |
| **Live GSM Telephony Carrier** | **External Dependency / Not Verified** | Evaluated via simulated DTMF webhooks; live PSTN hardware calling requires active Twilio/Exotel account. | Telephony Gateway Vendor & SIP Trunking. |
| **Carrier-Level SMS Delivery** | **External Dependency / Not Verified** | Transactional outbox queues SMS events; live carrier delivery requires Fast2SMS / Twilio credits. | External SMS Gateway Provider. |
| **Public Health Surveillance** | **Implemented** | Multi-signal statistical anomaly scoring with small-sample privacy masking ($< 3$ cases). | Internal health cases and dispensation data. |
| **External Pharmacy Sales Feed** | **Partially Implemented** | Architecture and ingestion schema implemented; external pharmacy sync runs in mock mode when unconfigured. | Retail Pharmacy API Integration. |
| **External Meteorological Feed** | **Partially Implemented** | Ingestion provider implemented; reports `WEATHER_DATA_UNAVAILABLE` when OpenWeather API key is unset. | Third-party Weather Service API. |
| **Continuous Database Backups** | **Implemented** | WAL streaming (PITR), daily snapshot runbooks, and verified staging restore simulations. | Managed Cloud PostgreSQL Storage. |
| **Live SaaS Log Drain (Datadog/CloudWatch)** | **Not Verified** | Structured JSON logs emitted to stdout/stderr; SaaS drain unconfigured in isolated test environment. | Cloud Log Aggregator SaaS. |

---

## 3. Guiding Rule on System Capabilities
- The platform never claims capabilities that rely on unconfigured external paid cloud vendors.
- Mock providers are honestly identified as simulation modes without claiming simulated transmissions were live carrier events.
