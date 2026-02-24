-- Commission Army: Migration 00001
-- Enums and core profiles table

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('referrer', 'business', 'both');
CREATE TYPE business_category AS ENUM (
  'trades',
  'professional_services',
  'creative_services',
  'wedding',
  'automotive',
  'recruiting',
  'other'
);
CREATE TYPE fee_type AS ENUM ('flat', 'percentage', 'flat_plus_percentage');
CREATE TYPE referral_status AS ENUM (
  'submitted',
  'accepted',
  'rejected',
  'completed',
  'disputed',
  'expired'
);
CREATE TYPE notification_type AS ENUM (
  'new_referral',
  'referral_accepted',
  'referral_rejected',
  'referral_completed',
  'payment_received',
  'payment_sent',
  'review_received',
  'offer_match',
  'system'
);
CREATE TYPE fraud_signal_type AS ENUM (
  'self_referral',
  'velocity',
  'duplicate_lead',
  'ip_match',
  'device_match',
  'suspicious_pattern'
);
CREATE TYPE fraud_severity AS ENUM ('low', 'medium', 'high');

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================

CREATE TABLE profiles (
  id                          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                       text NOT NULL,
  full_name                   text NOT NULL DEFAULT '',
  avatar_url                  text,
  role                        user_role,
  phone                       text,
  city                        text,
  state                       text,
  bio                         text,
  linkedin_url                text,
  stripe_account_id           text,
  stripe_onboarding_complete  boolean NOT NULL DEFAULT false,
  rating_avg                  decimal(3,2) NOT NULL DEFAULT 0,
  rating_count                integer NOT NULL DEFAULT 0,
  is_verified                 boolean NOT NULL DEFAULT false,
  onboarding_complete         boolean NOT NULL DEFAULT false,
  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Indexes
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_city_state ON profiles(city, state);
