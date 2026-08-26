# JeevanSetu Cost Controls, Quotas & Resource Safety

## 1. Operating Principle
> **"Development, staging, and preview environments must operate at zero/minimal cost without activating unexpected paid usage tiers."**

---

## 2. Service Tier & Quota Matrix

| Subsystem / Service | Provider | Free / Community Tier Limit | Production Quota Threshold | Hard Spend Limit Guard |
|---|---|---|---|---|
| **Database & Auth** | Supabase | Free Tier (500MB DB, 50k MAU) | Set budget alert at $25/mo | Auto-pause non-essential services |
| **API Backend** | Render / Fly.io | Free Tier (750 compute hours/mo) | Standard 1 vCPU / 1GB RAM | Set maximum 2 auto-scale instances |
| **Frontend CDN** | Vercel / Netlify | Free Hobby Tier (100GB bandwidth) | Custom Domain with Edge Cache | Alert at 80% bandwidth quota |
| **AI LLM Inference** | Google Gemini / OpenAI | Free Developer Tier (15 RPM) | Rate limit: 20 req/min per user | Hard monthly quota cap: $50 |
| **SMS Gateway** | Fast2SMS / MSG91 | Free Sandbox (50 test SMS) | Production: Pay-as-you-go | Pre-funded balance cap: ₹1,000 |
| **Telephony / IVR** | Twilio / Exotel | Free Trial Sandbox | Production: Metered minutes | Pre-funded balance cap: ₹2,000 |
| **Automation** | Self-Hosted n8n | Community Open-Source (Free) | Embedded single-node instance | 0 External SaaS cost |

---

## 3. Cost-Safety Invariants & Safeguards

1. **Development Mock Fallbacks**: When API keys for paid external gateways (AI, SMS, Telephony) are absent, the application automatically activates local mock providers without failing startup or incurring billing.
2. **Aggressive Sliding-Window Rate Limiting**: Prevents accidental cost runaway or denial-of-wallet attacks by restricting AI chat requests to 20 calls/minute and SMS dispatches to 15 submissions/minute.
3. **Static Prerendering**: The Next.js frontend prerenders 32 routes statically, reducing server compute costs to near-zero for public educational and resource pages.
