# JeevanSetu Change Management & Engineering Governance Policy

## 1. Purpose & Core Principles
This policy defines the change management processes, risk classification matrix, database change policies, API evolution standards, and frontend governance for all future engineering work on JeevanSetu.

---

## 2. Change Classification & Review Matrix

| Change Class | Definition & Examples | Required Reviews | Required Tests | Required Documentation | Rollback Strategy |
|---|---|---|---|---|---|
| **Class 1: Small / Patch** | Typo fixes, CSS layout adjustments, localized string additions. | 1 Peer Review (Frontend or Backend Owner) | Unit test + Component smoke test | PR description with screenshot | Immediate Vercel revert or git commit revert. |
| **Class 2: Normal Feature** | Adding a new non-critical report, new dashboard metric, or localized audio prompt. | 2 Reviews (Domain Owner + QA Owner) | Full backend suite (`npm test`) + Next.js build | Update [`docs/memory.md`](file:///c:/Users/shivb/OneDrive/Desktop/JeevanSetu/docs/memory.md) and [`CHANGELOG.md`](file:///c:/Users/shivb/OneDrive/Desktop/JeevanSetu/CHANGELOG.md) | Standard container / frontend deployment rollback ($< 5$m RTO). |
| **Class 3: High-Risk Infrastructure** | Modifying background scheduler, rate limiters, or health probes. | 3 Reviews (Backend Owner, Operations Owner, System Owner) | Full regression harness + Staging soak test | Update [`docs/operations.md`](file:///c:/Users/shivb/OneDrive/Desktop/JeevanSetu/docs/operations.md) & [`docs/monitoring.md`](file:///c:/Users/shivb/OneDrive/Desktop/JeevanSetu/docs/monitoring.md) | Rollback to previous container image tag. |
| **Class 4: Security & Auth** | Updating JWT handling, role middleware, or webhook verification. | Security Owner + System Owner | Security test suite + IDOR & RBAC regression | Update [`docs/security.md`](file:///c:/Users/shivb/OneDrive/Desktop/JeevanSetu/docs/security.md) & security audit logs | Immediate token rollback and secret rotation runbook. |
| **Class 5: Database Schema** | New migration, table, index, or foreign key constraint. | Database Owner + Backend Owner | Staging migration test + schema validation | Update [`docs/database.md`](file:///c:/Users/shivb/OneDrive/Desktop/JeevanSetu/docs/database.md) | Forward-fix migration (strictly NO destructive rollbacks). |
| **Class 6: Clinical Safety & AI** | Modifying AI prompt templates, output schema, or IVR 108 triage. | AI/ML Safety Owner + System Owner | AI & IVR regression test suites | Update [`docs/ai-governance.md`](file:///c:/Users/shivb/OneDrive/Desktop/JeevanSetu/docs/ai-governance.md) | Revert prompt template to previous validated version. |

---

## 3. Database Change Policy (Forward-Fix Principle)

### Non-Negotiable Database Rules:
1. **Additive Forward-Fix Only**:
   - Production databases must NEVER be modified using destructive rollback commands (`DROP TABLE`, `DROP COLUMN`, `TRUNCATE`).
   - If a migration contains a defect or incompatibility, deploy a new forward-fix migration (e.g. `20260822000023_fix_column_compatibility.sql`).
2. **Sequential Naming**:
   - All migrations in `supabase/migrations/` must follow strict chronological ordering (`YYYYMMDD0000XX_description.sql`).
3. **Zero Untested Foreign Key Cascades**:
   - `ON DELETE CASCADE` must be avoided on clinical records (`cases`, `referrals`, `vitals`). Use soft-deletion or explicit status transitions (`status = 'archived'`).
4. **RLS Policy Mandatory**:
   - Every new table in the `public` schema MUST have Row-Level Security explicitly enabled (`ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`) along with role-scoped policies before merging to main.
5. **Pre-Migration Snapshot**:
   - Prior to executing migrations against staging or production, verify that an on-demand logical backup (`pg_dump`) has been captured.

---

## 4. API Evolution & Versioning Strategy

### Current API Conventions:
- **Base Route**: All API endpoints reside under `/api/` (e.g., `/api/cases`, `/api/referrals`, `/api/inventory`).
- **Standard Response Envelope**:
  ```json
  {
    "success": true,
    "message": "Operation description",
    "data": { ... }
  }
  ```
- **Standard Error Envelope**:
  ```json
  {
    "success": false,
    "message": "User-safe sanitized error message",
    "error": {
      "code": "VALIDATION_ERROR",
      "status": 400,
      "request_id": "req-1771934400-a1b2c3d4"
    }
  }
  ```

### Future API Versioning Strategy:
- When breaking API changes become unavoidable, introduce path-based versioning (e.g. `/api/v2/referrals`).
- Deprecated endpoints must remain active and emit a `Sunset: <date>` HTTP header for at least 90 days before decommission.
- Do NOT introduce `/api/v1/` prefixing retroactively to stable endpoints to avoid breaking mobile/tablet clients.

---

## 5. Frontend Component & Design System Governance

### Component Structure & Reusability:
- **UI Primitives** (`frontend/components/ui/`): Button, Card, Badge, Modal, Tabs, Input, Select.
- **Domain Components** (`frontend/components/domain/`): SchemeCard, CaseItem, VitalsEntry, StockBadge.
- **Shared Layouts** (`frontend/components/shared/`): Header, Sidebar, StatusTimeline, OfflineIndicator.
- **Rule**: Never duplicate UI primitives; extend existing components using props (`variant`, `size`, `className`).

### Design Tokens & Responsive Guidelines:
- **Typography**: Google Fonts Inter / Outfit with fallback system fonts.
- **Color Palette**: High-contrast, tailored clinical tokens (Emerald `#10B981`, Amber `#F59E0B`, Crimson `#EF4444`, Slate `#0F172A`).
- **Breakpoints**: Mobile (`< 640px`), Tablet (`640px - 1024px`), Desktop (`> 1024px`).
- **Touch Targets**: All interactive elements must maintain a minimum bounding box of $44 \times 44$px for mobile usability.
- **Multilingual Support**: All user-facing strings must use translation keys from `frontend/lib/translations.js` supporting English, Hindi (`hi`), and Marathi (`mr`).
