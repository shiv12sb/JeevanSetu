# JeevanSetu Development Rules

## General
- Read PRD, architecture, phases, design and memory before major changes.
- Use the existing architecture.
- Do not introduce technologies without a reason.
- Do not rewrite working modules unnecessarily.
- Prefer simple maintainable solutions.

## Coding
- Use JavaScript, not TypeScript, unless explicitly approved.
- Next.js is the frontend.
- Node.js + Express is the main backend.
- Controllers stay thin; business logic belongs in services.
- Validate all external input.
- Avoid giant files.
- Reuse components and utilities.

## Frontend
- Reusable components and consistent design.
- Handle loading, empty, error and success states.
- Never expose secrets.
- Protected AI APIs are called through the backend.
- Keep responsive and accessible.

## Backend
Protected request flow:
Authentication → Authorization → Validation → Business logic → Database → Response.

Use consistent status codes and error handling.

## Database
- PostgreSQL through Supabase.
- Foreign keys and appropriate indexes.
- RLS for protected data.
- Never expose another patient's private data.
- Version schema changes with migrations.

## Security
- Never commit secrets.
- API keys only in environment variables.
- Medical documents use private storage.
- Least privilege.
- Log security-relevant events.
- Do not trust client-provided roles.

## AI
- AI is an assistant, not a medical authority.
- No diagnosis or prescription.
- No fabricated hospitals, schemes, NGOs or statistics.
- Ground recommendations in verified application data.
- Prefer structured outputs.
- Validate model output.
- Keep prompts versioned.
- Minimize sensitive data sent to external models.
- Provide safe fallbacks.

## ML
- Start with a baseline.
- Do not claim accuracy without evaluation.
- Store model version and prediction time.
- Do not present predictions as certainty.

## Healthcare safety
- Emergency indicators require escalation guidance.
- Automated anomaly detection is for human review.
- Never label a doctor fraudulent from an automated signal.

## n8n
- Automation only, not core business logic.
- Workflows should be idempotent where possible.
- Avoid duplicate notifications.
- Credentials stay out of source code.

## Git
- Small meaningful commits.
- No secrets.
- No unrelated changes.
- Test before commit.
- Keep main stable.

## AI coding agents
- One focused task at a time.
- Inspect before editing.
- Do not rewrite the whole project.
- Report changed files and tests.
- One coding agent modifies the working tree at a time.

## Definition of done
UI works, API works, database integration works, validation exists, authorization exists, errors are handled, tests/verification pass, secrets are protected, and documentation is updated when architecture changes.
