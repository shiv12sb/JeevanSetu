-- Migration 20260822000024_rural_health_access.sql
-- JeevanSetu: Rural Health Access Expansion

-- 1. Doctor Facilities Junction Table (Doctors can work at multiple facilities)
CREATE TABLE IF NOT EXISTS doctor_facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    phc_id UUID REFERENCES phcs(id) ON DELETE CASCADE,
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE', -- 'ON_DUTY', 'AVAILABLE', 'IN_CONSULTATION', 'OFF_DUTY', 'NOT_VERIFIED', 'UNKNOWN', 'UNAVAILABLE'
    next_available_time TIMESTAMPTZ,
    last_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_at_least_one_facility CHECK (
        (phc_id IS NOT NULL AND hospital_id IS NULL) OR 
        (phc_id IS NULL AND hospital_id IS NOT NULL)
    )
);

-- 2. Health Campaigns Table (Community Health Awareness)
CREATE TABLE IF NOT EXISTS health_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    image_url VARCHAR(500),
    language VARCHAR(50) NOT NULL DEFAULT 'en', -- 'en', 'hi', 'mr'
    publish_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    official_source VARCHAR(255) NOT NULL,
    emergency_contact VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Campaign Targets Table (Targeting campaigns to specific geographic divisions)
CREATE TABLE IF NOT EXISTS campaign_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES health_campaigns(id) ON DELETE CASCADE,
    state VARCHAR(100) NOT NULL DEFAULT 'Maharashtra',
    district VARCHAR(100),
    taluka VARCHAR(100),
    village VARCHAR(100),
    phc_id UUID REFERENCES phcs(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Assisted Access Requests Table (Track actions taken by ASHA on behalf of patients)
CREATE TABLE IF NOT EXISTS assisted_access_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asha_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    citizen_name VARCHAR(255) NOT NULL,
    citizen_phone VARCHAR(50),
    citizen_consent_given BOOLEAN NOT NULL DEFAULT TRUE,
    service_requested VARCHAR(100) NOT NULL, -- 'referral_status', 'facility_lookup', 'scheme_details', 'medicine_info'
    details TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'COMPLETED', -- 'PENDING', 'COMPLETED', 'FAILED'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_doctor_facilities_doc ON doctor_facilities(doctor_id);
CREATE INDEX IF NOT EXISTS idx_health_campaigns_lang ON health_campaigns(language, valid_until);
CREATE INDEX IF NOT EXISTS idx_campaign_targets_camp ON campaign_targets(campaign_id);
CREATE INDEX IF NOT EXISTS idx_assisted_access_asha ON assisted_access_requests(asha_id);

-- 6. Enable RLS
ALTER TABLE doctor_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE assisted_access_requests ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies
-- Doctor Facilities: Anyone can view, only authorized staff or admins can manage
CREATE POLICY "Anyone can view doctor facilities" ON doctor_facilities
    FOR SELECT USING (true);

CREATE POLICY "Admins and doctors manage doctor facilities" ON doctor_facilities
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('district_admin', 'phc_staff', 'hospital_staff', 'doctor')
        )
    );

-- Health Campaigns: Anyone can view active campaigns
CREATE POLICY "Anyone can view campaigns" ON health_campaigns
    FOR SELECT USING (
        valid_until IS NULL OR valid_until > NOW()
    );

CREATE POLICY "Admins manage campaigns" ON health_campaigns
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'district_admin'
        )
    );

-- Campaign Targets: Anyone can view
CREATE POLICY "Anyone can view campaign targets" ON campaign_targets
    FOR SELECT USING (true);

CREATE POLICY "Admins manage campaign targets" ON campaign_targets
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'district_admin'
        )
    );

-- Assisted Access Requests: ASHA workers can create/view their own requests. Admins view all.
CREATE POLICY "ASHA workers view own assisted requests" ON assisted_access_requests
    FOR SELECT USING (
        asha_id = auth.uid() OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'district_admin')
    );

CREATE POLICY "ASHA workers create own assisted requests" ON assisted_access_requests
    FOR INSERT WITH CHECK (
        asha_id = auth.uid()
    );
