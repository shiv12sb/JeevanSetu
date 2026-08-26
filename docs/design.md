# JeevanSetu UI Design: Phase 21 Attendance Integrity

## 1. PHC & Doctor Dashboard Presence Components
- **Today's Duty Card**: Shows doctor name, scheduled time, check-in timestamp, check-out timestamp, recorded case count, mismatch status, and review state.
- **Doctor Check-In / Check-Out Interface**: Large, accessible action buttons with clear operational state indications.
- **District Admin Attendance Ledger**: Summary counters (`Total Scheduled`, `Checked In`, `Not Checked In`, `Late`, `Early Checkout`, `Review Required`), facility/date filters, and review action modal.
- **Accessibility & Low-Bandwidth**: Status badges with explicit text and icons (`NORMAL ACTIVITY`, `LOW RECORDED ACTIVITY`, `REQUIRES REVIEW`).

## 2. Phase 22 Referral Continuity UI Design
- **Patient "My Referral" Card**: Vertical timeline showing Current stage, Destination hospital, Transport status, Arrival confirmation, Treatment status, and Next action prompt ("Confirm when you reach hospital").
- **Hospital Referral Desk**: Grouped queues for `Awaiting Arrival Confirmation`, `Arrived`, `Treatment in Progress`, `Follow-up Due`, and `Follow-up Overdue`.
- **PHC Continuity Ledger**: Tracks outgoing referrals across transit, arrival, and post-discharge return checkups.
- **Mobile UX & Accessibility**: Large touch target action buttons, high contrast badges, explicit milestone icons and status text.

## 3. Phase 23 Medicine Inventory & Demand Forecasting UI Design
- **PHC Medicine Stock Ledger**: Filterable lists by risk state (`CRITICAL`, `LOW`, `FORECASTED_RISK`, `HEALTHY`, `INSUFFICIENT_DATA`), showing current stock, daily burn rate, estimated days remaining, and one-click replenishment action.
- **Medicine Detail & Forecast Modal (`/inventory/:id`)**: Shows multi-window usage bars (7d, 14d, 30d, 90d), trend badges, estimated stockout date, and audit trail of stock movements.
- **District Supply Analytics**: District overview with shortage KPIs, critical PHC rankings, pending replenishment queue, and AI advisory forecast summaries.
- **Accessibility & Mobile UX**: High contrast risk badges pairing text and icons, large stock metrics, and non-color dependent status indicators.

## 4. Phase 26 Citizen Feedback & Missed-Call UI Design
- **Citizen Feedback Submission Portal (`/feedback`)**:
  - Multilingual support (Hindi, Marathi, English) with instant toggle.
  - 9 standardized category selection tiles (`PHC Service`, `Doctor Availability`, `Staff Behaviour`, `Medicine Availability`, `Waiting Time`, `Cleanliness & Facility`, `Referral Experience`, `Emergency Access`, `Other`).
  - Interactive 1-5 Star rating bar with option to submit unrated feedback.
  - Character counter with 500-char safety boundary.
  - Anonymity toggle with explicit data privacy assurance banner.
  - Instant display of unique Tracking Token (`JS-FB-XXXX-XXXX`) upon submission.
- **Anonymous Feedback Tracking Portal (`/feedback?tab=track`)**:
  - Secure Tracking Token lookup input.
  - Public status tracker (`SUBMITTED`, `ACKNOWLEDGED`, `UNDER_REVIEW`, `RESOLVED`, `DISMISSED`) without exposing PII or private internal supervisor notes.
- **Missed-Call & IVR Simulator (`/feedback` & `/admin/feedback`)**:
  - Realistic feature-phone interactive dialpad simulator.
  - Interactive audio prompt display and DTMF digit navigation for citizen feedback testing.
- **Supervisory Review Desk (`/admin/feedback`)**:
  - District-wide aggregate KPI tiles (`Total Submissions`, `Average Rating`, `Channel Intake`, `Active Signals`, `Open Reviews`) with small-sample privacy protection ($< 3$ responses).
  - Telephony & SMS Gateway status banner with honest mock/provider reflection (`PROVIDER_NOT_CONFIGURED`).
  - AI Service Quality Advisory card (non-punitive summary).
  - Operational Quality Signals feed for medicine shortages, waiting times, and doctor duty hours.
  - Filterable feedback ledger with category, status, and channel filters.
  - Supervisory Action Modal supporting `ACKNOWLEDGE`, `ASSIGN`, `ADD_NOTE`, `RESOLVE`, `DISMISS`, and `MARK_SPAM` with audited supervisor notes.
  - AI Categorization & Translation Assistant modal with prompt injection defense and translation separation.

## 5. Phase 27 Public Health Early Warning & Outbreak Intelligence UI Design
- **Early-Warning & Outbreak Intelligence Desk (`/admin/early-warning`)**:
  - **Surveillance Header Banner**: Prominent public-health surveillance indicators with live sync trigger and quick "Record ASHA Report" action button.
  - **Core Legal & Clinical Guardrail Banner**: Prominent informational alert stating: *"JeevanSetu provides early-warning signals for human public-health investigation. It does not autonomously diagnose disease or declare outbreaks."* and *"Absence of a signal does not prove absence of disease."*
  - **Surveillance KPI Grid**: Metric cards for `Active Warnings`, `High Severity`, `Multi-Source Correlated`, and `Resolved Reviews`.
  - **AI Surveillance Interpretation Card**: AI summary grounded in deterministic statistical deviations with non-diagnostic boundary badge.
  - **Data Stream Provider Status Cards**: Real-time operational stream status badges (PHC Cases, Medicine Usage, Citizen Feedback, Community/ASHA reports, Retail Pharmacy `NOT_AVAILABLE`, and Weather `WEATHER_DATA_UNAVAILABLE`).
  - **Filterable Early-Warning Ledger**: Filters by Severity (`HIGH`, `MEDIUM`, `LOW`, `INFO`), Status (`DETECTED`, `UNDER_REVIEW`, `VERIFIED`, `DISMISSED`, `RESOLVED`), and Location.
  - **Multi-Signal Evidence Breakdown**: Tabular and card display showing observed vs baseline moving averages, percentage deviation, z-scores, and contributing sources.
  - **Supervisory Action Modal**: Form supporting review actions (`ACKNOWLEDGE`, `REQUEST_INVESTIGATION`, `VERIFY`, `DISMISS`, `RESOLVE`, `ADD_NOTE`) with resolution categories (`SEASONAL_VARIATION`, `OUTREACH_CAMP`, `DATA_ENTRY_CHANGE`, `REPORTING_INCREASE`, `MEDICINE_REDISTRIBUTION`, `TEMPORARY_EVENT`, `NO_ANOMALY`, `OTHER`) and required supervisor notes.
  - **AI Structured Explainer Modal**: Interactive modal displaying validated AI contract: summary, contributing signals, structured evidence cards, possible operational explanations, recommended field investigation questions, and documented data limitations.
  - **ASHA Community Observation Modal**: Form for rapid submission of structured village/hamlet observations (`FEVER_CLUSTER`, `DIARRHEA_CASES`, `WATER_CONTAMINATION`, `RESPIRATORY_CASES`) with estimated affected counts.

## 6. Phase 28 Automation, n8n & Outbox Orchestration UI Design
- **Automation, n8n & Outbox Orchestration Desk (`/admin/automation`)**:
  - **Header Banner**: Observability desk indicators for event outbox throughput, provider adapter status, and worker cycle triggers.
  - **Source-of-Truth Architectural Alert**: Banner enforcing: *"JeevanSetu backend is the single source of truth. n8n is an optional orchestration layer."*
  - **Queue Metrics Cards**: `Total Events`, `Delivered / Sent`, `Retrying / Processing` (in exponential backoff), and `Dead Letter / Abandoned`.
  - **External Integration Provider Cards**: Real-time status indicators for n8n orchestrator, SMS gateway, Email gateway, Telephony/IVR provider, Weather provider, and Pharmacy network.
  - **Filterable Outbox Events Stream Ledger**: Filterable table by status (`ALL`, `PENDING`, `PROCESSING`, `SENT`, `RETRYING`, `ABANDONED`) and event type.
  - **Event Observability & Manual Retry Modal**: Modal displaying sanitized (PII minimized) event payload, retry metrics, error messages, and District Admin manual retry action button.

## 7. Phase 29 Production Observability, Monitoring & Reliability UI Design
- **Admin Operations & Reliability Desk (`/admin/operations`)**:
  - **Header Banner**: Observability desk indicators with real-time sync trigger and "Probe Alert System" action button.
  - **Healthcare Data Privacy Guardrail Banner**: Prominent informational alert stating: *"Strict Safety Rule: Monitoring must NEVER expose sensitive healthcare information. Passwords, JWTs, API secrets, unmasked phone numbers, and ABHA IDs are automatically redacted."*
  - **Primary KPI Grid**: Metric cards for `Total API Traffic`, `Error Rate %`, `Avg Latency (ms)` (with p95 latency), and `System Uptime`.
  - **Infrastructure & Dependencies Health Grid**: Card breakdown for Core Infrastructure Probes (Express API Liveness, PostgreSQL Readiness, Job Scheduler State), External Gateway Adapters (SMS, Email, Telephony, n8n), and AI & Voice Diagnostics (AI Invocations, Fallbacks, IVR Calls, Call Errors).
  - **Background Jobs Execution Table**: Real-time display of job run history, statuses (`COMPLETED`, `RUNNING`, `FAILED`, `STUCK`), durations in ms, completion timestamps, and error traces.
  - **Recent Sanitized Error Ledger**: Filterable table showing Request ID, Error Category (`VALIDATION_ERROR`, `DATABASE_ERROR`, `TIMEOUT`, etc.), HTTP status, Route & Method, Sanitized Message, and Timestamp.
  - **Test Alert Diagnostic Modal**: Modal confirming alert dispatch vs cooldown deduplication state.
- **Global Error Boundary (`frontend/components/ErrorBoundary.js`)**:
  - Catches unexpected client rendering errors.
  - Displays user-friendly, non-technical recovery UI: *"Service Temporarily Unavailable. Your data remains completely safe. Please try refreshing the page."* with Reload and Go to Home action buttons.

## 8. Phase 30 Production Security & Privacy UX Design
- **Server-Side Security Invariant UX**:
  - Role selection or alteration via client UI elements is disabled; role display reflects only authoritative session tokens from the backend.
  - Permission denials render clear, friendly, non-technical error cards (*"Access Denied: You do not have permission to access this resource"*) without exposing system route internals or stack traces.
- **Privacy & Anonymity Indicator Components**:
  - Anonymous feedback portal prominently displays privacy badges: *"Anonymous Mode Active: Your phone number and name are never stored."*
  - Generated Tracking Token displays with one-click copy and a clear notice that tokens are the only way to track progress anonymously.
- **Masked PII Presentation**:
  - All phone numbers rendered on staff and administrative screens follow the masked format (`+91 98XXX XX04`) to protect rural patient confidentiality while preserving sufficient digits for operational disambiguation.
- **Rate-Limiting User Feedback**:
  - Exceeded rate limit responses display user-friendly cooldown banners: *"Request limit reached. Please wait a few moments before trying again."*

## 9. Phase 31 Deployment & Release UX Design
- **Release Version Metadata Presentation**:
  - System settings and operations pages display the clean, human-readable release identifier (`Version 1.0.0`) without exposing internal server paths or environment secrets.
- **Maintenance State Display**:
  - During scheduled maintenance or platform updates, the edge layer serves a pre-rendered, lightweight static maintenance notice with emergency 108 contact details.
- **Viewport & Device Responsiveness**:
  - All public citizen pages (`/`, `/feedback`, `/health-awareness`, `/cases`, `/navigate`) are optimized across mobile (320px+), tablet (768px), and desktop (1024px+) viewports for field workers and rural users on low-resolution displays.
- **Static Asset Optimization**:
  - SVGs, Lucide icons, and web-optimized images are bundled with preloading headers to ensure fast first-contentful-paint (FCP) on 2G/3G mobile networks.

## 10. Global Theme Architecture (Light Default & Persistent Dark Mode)
- **Single Source of Truth**:
  - Global theme state is managed via `frontend/context/ThemeContext.js`.
  - Allowed values are strictly `"light"` and `"dark"`.
  - Default is ALWAYS `"light"` for all new visitors or uninitialized browser sessions. Operating system dark mode media query does NOT automatically force dark mode.
- **Storage Contract**:
  - Key: `localStorage.getItem("jeevansetu_theme")`.
  - Corrupted, missing, or unexpected values automatically sanitize to `"light"`.
- **Root DOM Synchronization**:
  - Active theme applies directly to `document.documentElement` (`<html class="dark" data-theme="dark">` or `<html class="light" data-theme="light">`).
  - `style.colorScheme` synchronizes to `"light"` or `"dark"`.
- **Zero-Flicker Pre-Paint Script**:
  - `frontend/app/layout.js` injects a synchronous `<script>` in `<head>` to read `jeevansetu_theme` and apply the `.dark` class before DOM paint, eliminating flash of unstyled content (FOUC).
  - `<html suppressHydrationWarning>` prevents React hydration mismatch warnings.
- **Tailwind CSS v4 Isolation**:
  - `@custom-variant dark (&:where(.dark, .dark *));` in `frontend/app/globals.css` binds dark utilities exclusively to the root `.dark` class, preventing unintended system media query overrides.
- **Settings & Quick Toggle**:
  - Settings page (`/settings`) provides dedicated Light Mode (Default) and Dark Mode visual cards with instant preview and persistence.
  - Navbar & Sidebar contain dynamic Sun/Moon icon toggle buttons for rapid switching.
- **Universal Component Coverage**:
  - All shared UI primitives (`Card`, `Modal`, `Input`, `Table`, `Tabs`, `Alert`, `Badge`, `Button`), layout structures (`Navbar`, `Sidebar`, `Topbar`, `Footer`), and domain components (`NeedsNavigator`, `ReferralCard`, `HospitalCard`, `CaseSummaryCard`, `MedicineStockRow`, `DashboardMetricCard`) feature dedicated dark mode styling.









