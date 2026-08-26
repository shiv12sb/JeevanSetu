# JeevanSetu Developer Onboarding & Engineering Setup Guide

## 1. Welcome to JeevanSetu
This guide is designed to onboard new software engineers to the JeevanSetu codebase quickly and safely. By following these steps, you will be able to configure your environment, run the backend and frontend locally, execute automated test suites, and understand key safety boundaries.

---

## 2. Prerequisites & Toolchain
- **Node.js**: Version `20.x LTS` (Required)
- **npm**: Version `10.x+`
- **Docker & Docker Compose** (Optional, for local multi-service container orchestration)
- **PostgreSQL / Supabase CLI** (Optional, for live database development; mock mode runs with zero external dependencies)

---

## 3. Step-by-Step Local Setup

### Step 1: Clone Repository & Install Dependencies
```bash
# Clone repository
git clone https://github.com/jeevansetu/jeevansetu.git
cd JeevanSetu

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### Step 2: Configure Environment Variables
```bash
# Backend configuration
cd ../backend
cp .env.example .env

# Frontend configuration
cd ../frontend
cp .env.example .env.local
```

> [!CAUTION]
> **Secret Isolation Rule**: Never copy `SUPABASE_SERVICE_ROLE_KEY` or database passwords into `frontend/.env.local`. Client environments must only contain public identifiers (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_API_URL`).

### Step 3: Run Automated Test Suites
```bash
# Run backend unified test suites (11+ test suites, 499+ tests)
cd ../backend
npm test
```

### Step 4: Start Development Servers
In two separate terminal windows:
```bash
# Terminal 1: Start Backend API (Runs on port 5000)
cd backend
npm run dev

# Terminal 2: Start Frontend Next.js App (Runs on port 3000)
cd frontend
npm run dev
```

### Step 5: Test Production Frontend Compilation
```bash
cd frontend
npm run build
```

---

## 4. Key Architectural & Safety Rules for Developers

1. **Non-Diagnostic AI Rule**:
   - Never write prompts that diagnose illnesses or prescribe drugs. All AI responses must include clinical disclaimers.
2. **Deterministic Emergency Bypass**:
   - Red-flag keywords (chest pain, severe dyspnea) must immediately return 108 emergency ambulance advice.
3. **Database Forward-Fix Policy**:
   - Never edit past migrations in `supabase/migrations/`. Always add a new sequentially numbered migration file.
4. **Server-Side Authorization**:
   - Never trust frontend role selectors. Always enforce `requireAuth` and `requireRole(...)` on protected backend routes.
5. **PII Masking**:
   - Never log raw patient phone numbers or passwords. Always use `logger` and `sanitizeEventPayload`.
