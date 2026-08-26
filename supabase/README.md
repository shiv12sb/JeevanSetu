# JeevanSetu Supabase Migrations & Database Setup

This directory contains the reproducible SQL migrations and synthetic development seed data for the **JeevanSetu** healthcare platform.

---

## Directory Structure

```
supabase/
├── migrations/
│   ├── 20260822000001_initial_schema.sql  # 17 core tables, ENUM types, triggers, foreign keys
│   └── 20260822000002_indexes.sql         # High-performance indexes for lookups & joins
├── seed.sql                               # Synthetic demo data for development
└── README.md                              # Migration documentation
```

---

## Running Migrations

### Using Supabase CLI (Local Development)
```bash
# 1. Start local Supabase instance
supabase start

# 2. Apply migrations automatically
supabase db reset
```

### Using Supabase SQL Editor (Remote Project)
1. Open your Supabase Dashboard -> **SQL Editor**.
2. Run `migrations/20260822000001_initial_schema.sql`.
3. Run `migrations/20260822000002_indexes.sql`.
4. (Optional for Dev/Demo) Run `seed.sql`.
