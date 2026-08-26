# JeevanSetu Project Memory

## Product
Name: JeevanSetu

Identity: AI-powered rural healthcare access, assistance, coordination and service-monitoring platform.

## Core idea
Help a patient move from healthcare need to relevant verified support and, where applicable, referral and follow-up. At facility level, improve visibility into medicine availability and service activity.

## Primary focus
1. Patient healthcare case
2. Verified hospitals/schemes/NGOs
3. AI resource recommendation
4. Referral tracking/follow-up
5. PHC medicine inventory/depletion warning
6. PHC service monitoring
7. Admin alerts/analytics

## Secondary focus
AI assistant, IVR, feedback, organ donation information, advanced outbreak prediction, document extraction.

## Locked technology decisions
Frontend: Next.js + JavaScript.
Backend: Node.js + Express.js + JavaScript.
Database: Supabase PostgreSQL.
Auth: Supabase Auth.
Storage: Supabase Storage.
AI: OpenAI API through backend.
ML: Python + FastAPI.
Automation: n8n.
Version control: Git + GitHub.
Deployment: Vercel, Render/Railway, Supabase, n8n Cloud.

## AI-assisted development workflow
Primary coding agent: Google Antigravity.
Secondary reviewer/debugging agent: Claude.
Architecture/planning/teaching: ChatGPT.
Backup/manual editor: VS Code.

Workflow:
1. ChatGPT plans
2. Antigravity implements one focused task
3. Run/test
4. Git commit
5. Claude reviews
6. Fix
7. Git commit
8. Continue

Only one coding agent should actively modify the working tree at a time.

## Current MVP
Patient login → healthcare case → verified resources → AI recommendation → referral → referral tracking.

PHC login → medicine inventory → depletion warning.

Admin → alerts → service monitoring → resource management.

## Hard constraints
- Do not switch to TypeScript without explicit approval.
- Do not replace Express without explicit approval.
- Do not introduce microservices early.
- Do not expose secrets.
- Do not let AI diagnose or prescribe.
- Do not fabricate healthcare resources.
- Do not accuse healthcare workers from automated flags.
- Do not treat AI predictions as certainty.

## Coding-agent behavior
Before implementation, inspect existing code. Follow architecture. Reuse components. Change only necessary files. Avoid speculative refactors. Test the feature. Report changed files, commands/tests and unresolved issues.
