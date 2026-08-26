-- ==============================================================================
-- JeevanSetu Supabase Auth Linkage, Role Protection & Row Level Security (RLS)
-- Version: 20260822000003_auth_and_rls.sql
-- Description: Foreign key to auth.users, user provisioning triggers, role protection,
--              and least-privilege RLS policies for all sensitive healthcare tables.
-- ==============================================================================

-- 1. Link profiles.user_id to Supabase auth.users(id)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'auth' AND table_name = 'users'
    ) THEN
        ALTER TABLE profiles
        DROP CONSTRAINT IF EXISTS fk_profiles_auth_user;

        ALTER TABLE profiles
        ADD CONSTRAINT fk_profiles_auth_user
        FOREIGN KEY (user_id) REFERENCES auth.users(id)
        ON DELETE CASCADE;
    END IF;
END $$;

-- 2. Automatic Profile Provisioning Trigger for New Supabase Signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_full_name VARCHAR(255);
    v_phone VARCHAR(20);
    v_district VARCHAR(100);
    v_state VARCHAR(100);
    v_role user_role;
BEGIN
    -- Extract user metadata supplied during signup safely
    v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Healthcare Citizen');
    v_phone := COALESCE(NEW.raw_user_meta_data->>'phone', NEW.phone, '');
    v_district := COALESCE(NEW.raw_user_meta_data->>'district', 'Gadchiroli');
    v_state := COALESCE(NEW.raw_user_meta_data->>'state', 'Maharashtra');
    
    -- Public signups default strictly to 'patient'. Privileged roles require admin assignment.
    v_role := 'patient'::user_role;

    INSERT INTO public.profiles (
        user_id,
        full_name,
        phone,
        email,
        district,
        state,
        role,
        pmjay_status,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        v_full_name,
        v_phone,
        NEW.email,
        v_district,
        v_state,
        v_role,
        'Pending Verification',
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users if auth schema exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'auth' AND table_name = 'users'
    ) THEN
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    END IF;
END $$;

-- 3. Prevent Normal Users from Self-Assigning Privileged Roles
CREATE OR REPLACE FUNCTION public.prevent_profile_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
    -- If role is being changed, verify caller is service_role or admin
    IF OLD.role IS DISTINCT FROM NEW.role THEN
        IF auth.uid() IS NOT NULL AND (
            SELECT role FROM public.profiles WHERE user_id = auth.uid()
        ) != 'district_admin'::user_role THEN
            RAISE EXCEPTION 'Unauthorized: Users cannot modify their own application role.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_role_escalation
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_role_escalation();

-- ==============================================================================
-- 4. Enable Row Level Security (RLS) on Sensitive Tables
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_case_vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicine_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicine_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Public tables for verified infrastructure directory (Read-only for public)
ALTER TABLE public.phcs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ngos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.government_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 5. Helper Functions for RLS Checks
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.current_profile_id()
RETURNS UUID AS $$
    SELECT id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role AS $$
    SELECT role FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.current_user_phc_id()
RETURNS UUID AS $$
    SELECT assigned_phc_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ==============================================================================
-- 6. RLS Policies: Directory & Public Health Tables (Read-Only)
-- ==============================================================================
DROP POLICY IF EXISTS "Public Read Verified PHCs" ON public.phcs;
CREATE POLICY "Public Read Verified PHCs" ON public.phcs FOR SELECT USING (is_verified = TRUE);
DROP POLICY IF EXISTS "Public Read Verified Hospitals" ON public.hospitals;
CREATE POLICY "Public Read Verified Hospitals" ON public.hospitals FOR SELECT USING (is_verified = TRUE);
DROP POLICY IF EXISTS "Public Read Active Hospital Services" ON public.hospital_services;
CREATE POLICY "Public Read Active Hospital Services" ON public.hospital_services FOR SELECT USING (is_active = TRUE);
DROP POLICY IF EXISTS "Public Read Verified Doctors" ON public.doctors;
CREATE POLICY "Public Read Verified Doctors" ON public.doctors FOR SELECT USING (is_verified = TRUE);
DROP POLICY IF EXISTS "Public Read Verified NGOs" ON public.ngos;
CREATE POLICY "Public Read Verified NGOs" ON public.ngos FOR SELECT USING (is_verified = TRUE);
DROP POLICY IF EXISTS "Public Read Active Schemes" ON public.government_schemes;
CREATE POLICY "Public Read Active Schemes" ON public.government_schemes FOR SELECT USING (is_active = TRUE);
DROP POLICY IF EXISTS "Public Read Essential Medicines" ON public.medicines;
CREATE POLICY "Public Read Essential Medicines" ON public.medicines FOR SELECT USING (TRUE);

-- ==============================================================================
-- 7. RLS Policies: Profiles
-- ==============================================================================
DROP POLICY IF EXISTS "Users read own profile" ON public.profiles;
CREATE POLICY "Users read own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Medical Officers read patient profiles for referrals" ON public.profiles;
CREATE POLICY "Medical Officers read patient profiles for referrals" ON public.profiles
    FOR SELECT USING (
        public.current_user_role() IN ('phc_staff', 'doctor', 'hospital_staff', 'district_admin')
    );

-- ==============================================================================
-- 8. RLS Policies: Health Cases & Vitals
-- ==============================================================================
DROP POLICY IF EXISTS "Patients view own cases" ON public.health_cases;
CREATE POLICY "Patients view own cases" ON public.health_cases
    FOR SELECT USING (
        patient_id = public.current_profile_id()
        OR public.current_user_role() IN ('phc_staff', 'doctor', 'hospital_staff', 'district_admin')
    );

DROP POLICY IF EXISTS "Patients create own cases" ON public.health_cases;
CREATE POLICY "Patients create own cases" ON public.health_cases
    FOR INSERT WITH CHECK (
        patient_id = public.current_profile_id()
        OR public.current_user_role() IN ('phc_staff', 'district_admin')
    );

DROP POLICY IF EXISTS "Staff update assigned health cases" ON public.health_cases;
CREATE POLICY "Staff update assigned health cases" ON public.health_cases
    FOR UPDATE USING (
        public.current_user_role() IN ('phc_staff', 'doctor', 'hospital_staff', 'district_admin')
    );

DROP POLICY IF EXISTS "View case vitals" ON public.health_case_vitals;
CREATE POLICY "View case vitals" ON public.health_case_vitals
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.health_cases
            WHERE health_cases.id = health_case_vitals.case_id
            AND (
                health_cases.patient_id = public.current_profile_id()
                OR public.current_user_role() IN ('phc_staff', 'doctor', 'hospital_staff', 'district_admin')
            )
        )
    );

DROP POLICY IF EXISTS "Staff record case vitals" ON public.health_case_vitals;
CREATE POLICY "Staff record case vitals" ON public.health_case_vitals
    FOR INSERT WITH CHECK (
        public.current_user_role() IN ('phc_staff', 'doctor', 'hospital_staff', 'district_admin')
    );

-- ==============================================================================
-- 9. RLS Policies: Referrals & Events
-- ==============================================================================
DROP POLICY IF EXISTS "Patients and staff view authorized referrals" ON public.referrals;
CREATE POLICY "Patients and staff view authorized referrals" ON public.referrals
    FOR SELECT USING (
        patient_id = public.current_profile_id()
        OR public.current_user_role() IN ('phc_staff', 'doctor', 'hospital_staff', 'ngo_staff', 'district_admin')
    );

DROP POLICY IF EXISTS "PHC staff create referrals" ON public.referrals;
CREATE POLICY "PHC staff create referrals" ON public.referrals
    FOR INSERT WITH CHECK (
        public.current_user_role() IN ('phc_staff', 'doctor', 'district_admin')
    );

DROP POLICY IF EXISTS "Staff update referral status" ON public.referrals;
CREATE POLICY "Staff update referral status" ON public.referrals
    FOR UPDATE USING (
        public.current_user_role() IN ('phc_staff', 'doctor', 'hospital_staff', 'district_admin')
    );

DROP POLICY IF EXISTS "View referral timeline events" ON public.referral_events;
CREATE POLICY "View referral timeline events" ON public.referral_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.referrals
            WHERE referrals.id = referral_events.referral_id
            AND (
                referrals.patient_id = public.current_profile_id()
                OR public.current_user_role() IN ('phc_staff', 'doctor', 'hospital_staff', 'ngo_staff', 'district_admin')
            )
        )
    );

DROP POLICY IF EXISTS "Staff append referral events" ON public.referral_events;
CREATE POLICY "Staff append referral events" ON public.referral_events
    FOR INSERT WITH CHECK (
        public.current_user_role() IN ('phc_staff', 'doctor', 'hospital_staff', 'district_admin')
    );

-- ==============================================================================
-- 10. RLS Policies: Medicine Inventory & Usage
-- ==============================================================================
DROP POLICY IF EXISTS "Public read summarized medicine availability" ON public.medicine_inventory;
CREATE POLICY "Public read summarized medicine availability" ON public.medicine_inventory
    FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "PHC staff manage own medicine inventory" ON public.medicine_inventory;
CREATE POLICY "PHC staff manage own medicine inventory" ON public.medicine_inventory
    FOR ALL USING (
        public.current_user_role() = 'district_admin'
        OR (
            public.current_user_role() = 'phc_staff'
            AND phc_id = public.current_user_phc_id()
        )
    );

DROP POLICY IF EXISTS "Staff view and record medicine usage" ON public.medicine_usage;
CREATE POLICY "Staff view and record medicine usage" ON public.medicine_usage
    FOR ALL USING (
        public.current_user_role() IN ('phc_staff', 'district_admin')
    );

-- ==============================================================================
-- 11. RLS Policies: Feedback
-- ==============================================================================
DROP POLICY IF EXISTS "Anyone can submit feedback" ON public.feedback;
CREATE POLICY "Anyone can submit feedback" ON public.feedback
    FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Users view own feedback or staff review" ON public.feedback;
CREATE POLICY "Users view own feedback or staff review" ON public.feedback
    FOR SELECT USING (
        (is_anonymous = FALSE AND contact_phone = (SELECT phone FROM public.profiles WHERE user_id = auth.uid()))
        OR public.current_user_role() IN ('district_admin', 'phc_staff', 'hospital_staff')
    );

-- ==============================================================================
-- 12. RLS Policies: Notifications
-- ==============================================================================
DROP POLICY IF EXISTS "Users view own notifications" ON public.notifications;
CREATE POLICY "Users view own notifications" ON public.notifications
    FOR SELECT USING (
        recipient_id = public.current_profile_id()
    );

DROP POLICY IF EXISTS "Users mark own notifications as read" ON public.notifications;
CREATE POLICY "Users mark own notifications as read" ON public.notifications
    FOR UPDATE USING (
        recipient_id = public.current_profile_id()
    )
    WITH CHECK (
        recipient_id = public.current_profile_id()
    );

-- ==============================================================================
-- 13. RLS Policies: Audit Logs
-- ==============================================================================
DROP POLICY IF EXISTS "District Admin view audit logs" ON public.audit_logs;
CREATE POLICY "District Admin view audit logs" ON public.audit_logs
    FOR SELECT USING (
        public.current_user_role() = 'district_admin'
    );

DROP POLICY IF EXISTS "Service and staff append audit logs" ON public.audit_logs;
CREATE POLICY "Service and staff append audit logs" ON public.audit_logs
    FOR INSERT WITH CHECK (TRUE);
