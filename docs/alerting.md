# JeevanSetu Alerting Framework & SRE Thresholds

## 1. SRE Alert Severity Classification

| Alert Level | Definition & Operational Impact | Notification Channel | Response SLA | Target On-Call Role |
|---|---|---|---|---|
| **CRITICAL** | Core platform unavailable (DB down, primary auth offline, total API failure). | PagerDuty / SMS / Call | $< 15$ Minutes | System Owner & Backend Owner |
| **HIGH** | Auxiliary provider outage (AI timeout, IVR gateway down, SMS credit exhaustion). | Slack / Email High-Priority | $< 30$ Minutes | Subsystem Owner (AI / Telephony) |
| **MEDIUM** | Elevated 4xx/5xx API errors ($> 5\%$ for 5m), outbox retry backlog ($> 50$ events). | Slack Ops Channel | $< 2$ Hours | Backend Owner |
| **LOW** | Background worker slow execution ($> 60$s), non-critical cache miss. | Daily Summary Digest | Next Business Day | Operations Owner |
| **INFO** | Successful deployment, routine backup snapshot completed, maintenance sweep done. | Operational Event Log | Informational | N/A |

---

## 2. Alert Fatigue Prevention & Deduplication

To eliminate on-call alert storms:
1. **60-Minute Deduplication Window**: The alert dispatcher (`jobMonitor.service.js`) suppresses duplicate alarms with identical alert signatures within a 60-minute sliding window.
2. **Exponential Cooldown**: Flapping services (repeated recovery/failure cycles within 10 minutes) trigger a single consolidated flapping alert.
3. **Threshold Calibration**: Numerical alert thresholds require operational baseline calibration over the first 30 days of live pilot deployment.
