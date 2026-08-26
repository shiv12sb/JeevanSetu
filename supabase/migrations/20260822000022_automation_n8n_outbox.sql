-- ==============================================================================
-- JEEVANSETU PHASE 28: AUTOMATION, N8N & OUTBOX PATTERN MIGRATION
-- ==============================================================================
-- Creates outbox_events, outbox_event_logs, user_notification_preferences,
-- webhook_replay_nonces, and strict Row Level Security (RLS) policies.
-- Invariant: JeevanSetu backend is the source of truth; n8n is an optional orchestration layer.

-- 1. Outbox Events Table
CREATE TABLE IF NOT EXISTS public.outbox_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    aggregate_type VARCHAR(50) NOT NULL,
    aggregate_id VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'SENT', 'FAILED', 'RETRYING', 'ABANDONED')),
    retry_count INT NOT NULL DEFAULT 0,
    max_retries INT NOT NULL DEFAULT 3,
    backoff_multiplier INT NOT NULL DEFAULT 2,
    last_attempted_at TIMESTAMPTZ,
    next_retry_at TIMESTAMPTZ DEFAULT NOW(),
    error_category VARCHAR(50),
    error_message TEXT,
    idempotency_key VARCHAR(255) UNIQUE NOT NULL,
    n8n_dispatched BOOLEAN NOT NULL DEFAULT FALSE,
    n8n_response_status VARCHAR(50),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Outbox Event Logs Table (Immutable Execution History)
CREATE TABLE IF NOT EXISTS public.outbox_event_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.outbox_events(id) ON DELETE CASCADE,
    attempt_number INT NOT NULL,
    dispatcher VARCHAR(50) NOT NULL, -- 'DIRECT_PROVIDER', 'N8N_ORCHESTRATOR', 'MANUAL_RETRY'
    target_channel VARCHAR(50),      -- 'SMS', 'EMAIL', 'IVR', 'IN_APP', 'WEBHOOK'
    status VARCHAR(30) NOT NULL,     -- 'SUCCESS', 'FAILED', 'PROVIDER_NOT_CONFIGURED', 'TIMEOUT'
    duration_ms INT,
    response_code VARCHAR(50),
    error_details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. User Notification Preferences Table
CREATE TABLE IF NOT EXISTS public.user_notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    enable_sms BOOLEAN NOT NULL DEFAULT TRUE,
    enable_email BOOLEAN NOT NULL DEFAULT TRUE,
    enable_in_app BOOLEAN NOT NULL DEFAULT TRUE,
    enable_ivr_reminders BOOLEAN NOT NULL DEFAULT TRUE,
    enable_referral_updates BOOLEAN NOT NULL DEFAULT TRUE,
    enable_medicine_alerts BOOLEAN NOT NULL DEFAULT TRUE,
    enable_duty_alerts BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_notification_preferences UNIQUE (user_id)
);

-- 4. Webhook Replay Protection Nonces Table
CREATE TABLE IF NOT EXISTS public.webhook_replay_nonces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nonce VARCHAR(255) UNIQUE NOT NULL,
    source VARCHAR(100) NOT NULL DEFAULT 'N8N',
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Composite Indexes for High Performance Outbox Processing
CREATE INDEX IF NOT EXISTS idx_outbox_events_status_next_retry 
    ON public.outbox_events (status, next_retry_at) 
    WHERE status IN ('PENDING', 'RETRYING');

CREATE INDEX IF NOT EXISTS idx_outbox_events_event_type 
    ON public.outbox_events (event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_outbox_events_aggregate 
    ON public.outbox_events (aggregate_type, aggregate_id);

CREATE INDEX IF NOT EXISTS idx_outbox_event_logs_event_id 
    ON public.outbox_event_logs (event_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_webhook_nonces_expiry 
    ON public.webhook_replay_nonces (expires_at);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.outbox_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outbox_event_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_replay_nonces ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies
-- Outbox Events & Logs: Only District Admins and system service role can view
DROP POLICY IF EXISTS "District Admin view outbox events" ON public.outbox_events;
CREATE POLICY "District Admin view outbox events" ON public.outbox_events
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'district_admin'
        )
    );

DROP POLICY IF EXISTS "District Admin view outbox event logs" ON public.outbox_event_logs;
CREATE POLICY "District Admin view outbox event logs" ON public.outbox_event_logs
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'district_admin'
        )
    );

-- User Preferences: Users can manage only their own preferences
DROP POLICY IF EXISTS "Users manage own notification preferences" ON public.user_notification_preferences;
CREATE POLICY "Users manage own notification preferences" ON public.user_notification_preferences
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Webhook nonces: Service role / District Admin read
DROP POLICY IF EXISTS "Admin view webhook nonces" ON public.webhook_replay_nonces;
CREATE POLICY "Admin view webhook nonces" ON public.webhook_replay_nonces
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'district_admin'
        )
    );
