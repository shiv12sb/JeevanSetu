# Contributing to JeevanSetu

Thank you for contributing to the JeevanSetu Healthcare Platform! To ensure the highest standards of clinical safety, data privacy, and architectural stability, please adhere to the following contribution guidelines.

---

## 1. Branch Strategy & Workflow
- **`main`**: Production-ready branch. Protected against direct pushes.
- **`staging`**: Pre-release integration and validation branch.
- **Feature / Fix Branches**: Branch from `main` using standard naming conventions:
  - `feat/feature-name` (e.g. `feat/gondi-language-support`)
  - `fix/bug-description` (e.g. `fix/ivr-timeout-handling`)
  - `docs/doc-update` (e.g. `docs/update-runbook-step`)
  - `chore/dependency-upgrade` (e.g. `chore/bump-lucide-icons`)

---

## 2. Commit Message Conventions
We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:
- `feat:` New features or enhancements
- `fix:` Bug fixes or defect patches
- `docs:` Documentation additions or updates
- `test:` Adding or refining automated tests
- `refactor:` Code refactoring without changing observable behavior
- `sec:` Security hardening or credential rotation

*Example:* `feat(ivr): add Marathi audio prompt for referral status lookup`

---

## 3. Pull Request (PR) Requirements
Every pull request must fulfill the following quality gates before merging:
1. **Automated Tests**: All backend tests must pass (`npm test` in `backend/` $\rightarrow$ 100% pass rate).
2. **Frontend Build**: Production build must compile cleanly (`npm run build` in `frontend/` $\rightarrow$ 0 errors).
3. **Database Rules**: Any database change must deploy a new, additive migration file in `supabase/migrations/`. Modifying existing migrations is strictly forbidden.
4. **Secret Isolation**: PR diffs must be verified to contain zero API keys, passwords, or service-role secrets.
5. **Peer Review**: Minimum of 1 approved review from the designated Subsystem Owner (see [`docs/codebase-guide.md`](file:///c:/Users/shivb/OneDrive/Desktop/JeevanSetu/docs/codebase-guide.md)).

---

## 4. Code & Architecture Invariants
- **Non-Diagnostic AI**: Never introduce prescriptive medical outputs.
- **Deterministic 108 Bypass**: Preserve immediate emergency telephony and chat preemption.
- **Server-Side RBAC**: Verify role access on backend controllers using `requireRole`.
- **Data Minimization**: Mask phone numbers (`+91 98XXX XX04`) and strip credentials in logs.
