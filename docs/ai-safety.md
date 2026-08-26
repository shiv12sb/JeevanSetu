# JeevanSetu Healthcare AI Safety & Governance Protocol

## 1. Safety Principles & Ethical Boundaries

JeevanSetu AI is an informational coordination, scheme guidance, and facility navigation tool. It operates under strict healthcare guardrails:

1. **Non-Diagnostic Constraint**: The AI must NEVER provide medical diagnosis, declare diseases, or claim clinical certainty.
2. **No Prescription / Dosage Determination**: The AI must NEVER prescribe pharmaceutical drugs, suggest antibiotic regimens, or alter clinical dosages.
3. **Deterministic Emergency Escalation**: Life-threatening red flags (severe chest pain, breathing collapse, loss of consciousness, heavy trauma, snake bites) must NEVER be left to probabilistic model interpretation. They immediately trigger deterministic 108 emergency ambulance guidance.
4. **Zero Fabrication / Hallucination Protection**: Facility beds, medicine inventory, doctor presence, and referral statuses are grounded exclusively in verified database records.
5. **No Autonomous Clinical Decisions**: All clinical recommendations must route through registered Medical Officers at Primary Health Centres (PHCs) or District Hospitals.

---

## 2. Prompt Injection & Adversarial Boundary Defense

JeevanSetu implements multi-layer defense against prompt injection and jailbreak attempts:

- **Regex Boundary Interceptors**: Input text is evaluated against adversarial patterns (e.g. `ignore previous instructions`, `system prompt`, `disable safety`, `dump database`).
- **Safe Refusal Envelopes**: Injection attempts are rejected with standard policy responses without executing model generation or revealing system prompts.
- **Backend Isolation**: AI prompts never have direct database query access. Database context is pre-filtered and minimized by `context.service.js` before prompt injection.
- **API Key Confidentiality**: All AI provider API keys (`GEMINI_API_KEY`, `ANTHROPIC_API_KEY`) reside exclusively in backend environment variables and are never transmitted to client bundles or browser storage.

---

## 3. PII & Sensitive Health Data Protection

- **Automated Masking**: Phone numbers are masked (`+91 98XXX XX04`), ABHA IDs and auth tokens are replaced with `[REDACTED]`.
- **Session Memory Boundary**: Conversation history is maintained only within active browser memory for multi-turn context (max 4 turns) and is not permanently logged with sensitive clinical contents.
- **Audit Trails**: Operational logs record metadata (latency, token usage, grounded sources count) with actor IDs (`user.profileId` or `"guest"`), preserving full patient anonymity.
