# JeevanSetu AI Assistant Architecture & Specification

## 1. Overview

The **JeevanSetu Grounded Healthcare AI Assistant** provides rural citizens, patients, Primary Health Centre (PHC) staff, doctors, and health administrators with accessible, grounded public health coordination, scheme navigation (Ayushman Bharat PM-JAY and MJPJAY), hospital facility matching, and referral status insights.

---

## 2. Architecture & Request Pipeline

```
[ Citizen / Patient / Health Worker ]
            │
    (Text / Voice STT)
            ▼
   Next.js Frontend (/assistant & FloatingAssistantButton)
            │
     POST /api/ai/chat (x-request-id, optionalAuth)
            ▼
    Node.js Express Backend
            │
   ┌────────┴────────────────────────────────────────┐
   │ 1. Rate Limiting (20 req/min per IP/user)      │
   │ 2. Pre-Execution Emergency Triage (108 Bypass) │
   │ 3. Non-Diagnostic / Prescription Guardrails    │
   │ 4. Prompt Injection Defense                    │
   │ 5. Scoped Grounded Context Retrieval           │
   │ 6. LLM Generation (Gemini / Claude / Fallback) │
   │ 7. Redacted Audit Logging                      │
   └────────┬────────────────────────────────────────┘
            ▼
   Standardized Safe Response Envelopes
            │
    (Text / Voice TTS)
            ▼
   Rendered Markdown Cards + Audio Playback
```

---

## 3. Public Guest & Role-Scoped Access

- **Public / Unauthenticated Citizens**: Can query public health schemes, hospital facilities, PHC schedules, medicine availability, and symptom guidance without requiring login credentials (`optionalAuth`).
- **Authenticated Users**: Access role-scoped data:
  - *Patients*: Own active referral milestones and follow-ups.
  - *PHC Staff*: Assigned facility medicine forecasts, stock alerts, and ASHA queues.
  - *Doctors*: Assigned clinical schedules, referral transfers, and triage desks.
  - *District Administrators*: Aggregate early-warning signals and district KPIs.

---

## 4. Multi-Language Support & Auto-Detection

- **Supported Languages**:
  - English (`en`)
  - Hindi (`hi`) — *हिंदी*
  - Marathi (`mr`) — *मराठी*
- **Automatic Language Detection**: Inspects Devanagari vocabulary to distinguish Marathi (`आहे`, `नाही`, `झाले`, `औषध`, `रुग्णालय`, `करावे`) from Hindi (`है`, `नहीं`, `बुखार`, `दवा`, `अस्पताल`). Also recognizes Hinglish / Marathi transliteration keywords.

---

## 5. Structured Response Contract

Every AI response adheres to the following structured contract:

```json
{
  "success": true,
  "answer": "Grounded response text...",
  "language": "hi",
  "groundedCards": [
    {
      "type": "hospital",
      "title": "District Civil Hospital Gadchiroli",
      "detail": "24x7 Emergency Casualty Triage & ICU resuscitation beds.",
      "actionLabel": "View Emergency Desk"
    }
  ],
  "safetyLevel": "safe",
  "safety": {
    "isMedicalEmergency": false,
    "requiresHumanCare": false,
    "safetyLevel": "safe"
  },
  "sources": ["JeevanSetu Verified Registry"],
  "requiresHumanReview": false
}
```

---

## 6. Safety & Non-Diagnostic Guardrails

- **Zero Autonomous Medical Diagnosis**: The assistant never diagnoses illnesses or claims clinical certainty.
- **Zero Drug Prescriptions or Dosage Adjustments**: Refuses prescription requests and directs citizens to visit the local Primary Health Centre (PHC) doctor.
- **Deterministic 108 Emergency Escalation**: Acute symptoms (severe chest pain, breathing collapse, heavy bleeding, stroke symptoms) immediately trigger emergency ambulance guidance without relying on AI reasoning.
- **PII Minimization**: ABHA IDs, passwords, and phone numbers are automatically redacted (`[REDACTED]`, `+91 98XXX XX04`) before context grounding.
