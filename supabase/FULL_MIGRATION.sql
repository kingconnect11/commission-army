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
-- Commission Army: Migration 00002
-- Businesses and Offers tables

-- ============================================================
-- BUSINESSES
-- ============================================================

CREATE TABLE businesses (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name            text NOT NULL,
  description     text,
  category        business_category NOT NULL,
  subcategory     text,
  website         text,
  phone           text,
  city            text NOT NULL,
  state           text NOT NULL,
  logo_url        text,
  is_verified     boolean NOT NULL DEFAULT false,
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_businesses_owner ON businesses(owner_id);
CREATE INDEX idx_businesses_category ON businesses(category);
CREATE INDEX idx_businesses_location ON businesses(city, state);
CREATE INDEX idx_businesses_active ON businesses(is_active) WHERE is_active = true;

-- ============================================================
-- OFFERS (what businesses are willing to pay for referrals)
-- ============================================================

CREATE TABLE offers (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id             uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  title                   text NOT NULL,
  description             text NOT NULL,
  what_i_need             text NOT NULL,
  fee_type                fee_type NOT NULL DEFAULT 'flat',
  flat_fee                decimal(10,2),
  percentage_fee          decimal(5,2),
  percentage_description  text,
  min_fee                 decimal(10,2) DEFAULT 10.00,
  max_fee                 decimal(10,2),
  qualification_criteria  text,
  is_active               boolean NOT NULL DEFAULT true,
  views_count             integer NOT NULL DEFAULT 0,
  referrals_count         integer NOT NULL DEFAULT 0,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now(),

  -- Validation
  CONSTRAINT offers_flat_fee_check
    CHECK (fee_type = 'percentage' OR flat_fee IS NOT NULL),
  CONSTRAINT offers_percentage_fee_check
    CHECK (fee_type = 'flat' OR percentage_fee IS NOT NULL),
  CONSTRAINT offers_min_fee_check
    CHECK (flat_fee IS NULL OR flat_fee >= 10.00)
);

CREATE TRIGGER offers_updated_at
  BEFORE UPDATE ON offers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_offers_business ON offers(business_id);
CREATE INDEX idx_offers_active ON offers(is_active) WHERE is_active = true;
CREATE INDEX idx_offers_created ON offers(created_at DESC);

-- Full text search on offers
ALTER TABLE offers ADD COLUMN fts tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(what_i_need, '')), 'B')
  ) STORED;

CREATE INDEX idx_offers_fts ON offers USING gin(fts);
-- Commission Army: Migration 00003
-- Referrals table (the core transaction)

CREATE TABLE referrals (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id                uuid NOT NULL REFERENCES offers(id) ON DELETE RESTRICT,
  referrer_id             uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  business_id             uuid NOT NULL REFERENCES businesses(id) ON DELETE RESTRICT,

  -- Lead info
  lead_name               text NOT NULL,
  lead_email              text,
  lead_phone              text,
  lead_context            text NOT NULL,
  relationship            text,

  -- Status
  status                  referral_status NOT NULL DEFAULT 'submitted',

  -- Fee snapshot (locked at submission time from the offer)
  fee_type                fee_type NOT NULL,
  flat_fee_amount         decimal(10,2),
  percentage_fee          decimal(5,2),

  -- Calculated payment amounts (set when accepted)
  platform_fee            decimal(10,2),
  referrer_payout         decimal(10,2),

  -- Success bonus (set when deal closes)
  deal_value              decimal(12,2),
  success_bonus           decimal(10,2),
  platform_bonus_fee      decimal(10,2),
  referrer_bonus_payout   decimal(10,2),

  -- Stripe
  stripe_payment_intent_id  text,
  stripe_transfer_id        text,
  escrow_released_at        timestamptz,

  -- Timestamps
  submitted_at            timestamptz NOT NULL DEFAULT now(),
  accepted_at             timestamptz,
  rejected_at             timestamptz,
  completed_at            timestamptz,
  expires_at              timestamptz NOT NULL DEFAULT (now() + interval '7 days'),

  -- Reviews (mutual)
  business_rating_of_referrer   smallint CHECK (business_rating_of_referrer BETWEEN 1 AND 5),
  business_review_of_referrer   text,
  referrer_rating_of_business   smallint CHECK (referrer_rating_of_business BETWEEN 1 AND 5),
  referrer_review_of_business   text,

  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER referrals_updated_at
  BEFORE UPDATE ON referrals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Indexes
CREATE INDEX idx_referrals_offer ON referrals(offer_id);
CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_referrals_business ON referrals(business_id);
CREATE INDEX idx_referrals_status ON referrals(status);
CREATE INDEX idx_referrals_expires ON referrals(expires_at) WHERE status = 'submitted';

-- Function to auto-expire old referrals (called by cron)
CREATE OR REPLACE FUNCTION expire_stale_referrals()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  expired_count integer;
BEGIN
  UPDATE referrals
  SET status = 'expired', updated_at = now()
  WHERE status = 'submitted'
    AND expires_at < now();
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$;

-- Function to calculate and lock fees when a referral is submitted
CREATE OR REPLACE FUNCTION lock_referral_fees()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  offer_record offers%ROWTYPE;
BEGIN
  SELECT * INTO offer_record FROM offers WHERE id = NEW.offer_id;

  -- Lock fee structure from the offer
  NEW.fee_type := offer_record.fee_type;
  NEW.flat_fee_amount := offer_record.flat_fee;
  NEW.percentage_fee := offer_record.percentage_fee;

  -- Calculate platform fee and referrer payout for flat fee
  IF NEW.flat_fee_amount IS NOT NULL THEN
    NEW.platform_fee := ROUND(NEW.flat_fee_amount * 0.20, 2);
    NEW.referrer_payout := NEW.flat_fee_amount - NEW.platform_fee;
  END IF;

  -- Increment referrals_count on the offer
  UPDATE offers SET referrals_count = referrals_count + 1 WHERE id = NEW.offer_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER referrals_lock_fees
  BEFORE INSERT ON referrals
  FOR EACH ROW EXECUTE FUNCTION lock_referral_fees();

-- Function to calculate success bonus when deal_value is set
CREATE OR REPLACE FUNCTION calculate_success_bonus()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.deal_value IS NOT NULL
    AND OLD.deal_value IS NULL
    AND NEW.percentage_fee IS NOT NULL
  THEN
    NEW.success_bonus := ROUND(NEW.deal_value * (NEW.percentage_fee / 100), 2);
    NEW.platform_bonus_fee := ROUND(NEW.success_bonus * 0.20, 2);
    NEW.referrer_bonus_payout := NEW.success_bonus - NEW.platform_bonus_fee;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER referrals_calculate_bonus
  BEFORE UPDATE ON referrals
  FOR EACH ROW EXECUTE FUNCTION calculate_success_bonus();
-- Commission Army: Migration 00004
-- Notifications, Messaging, and Fraud Detection

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE notifications (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type            notification_type NOT NULL,
  title           text NOT NULL,
  body            text NOT NULL,
  data            jsonb DEFAULT '{}',
  read            boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, read) WHERE read = false;
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- Function to create a notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id uuid,
  p_type notification_type,
  p_title text,
  p_body text,
  p_data jsonb DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notif_id uuid;
BEGIN
  INSERT INTO notifications (user_id, type, title, body, data)
  VALUES (p_user_id, p_type, p_title, p_body, p_data)
  RETURNING id INTO notif_id;
  RETURN notif_id;
END;
$$;

-- Auto-notify business when a referral is submitted
CREATE OR REPLACE FUNCTION notify_on_referral_submitted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  biz businesses%ROWTYPE;
  referrer profiles%ROWTYPE;
  offer offers%ROWTYPE;
BEGIN
  IF NEW.status = 'submitted' THEN
    SELECT * INTO biz FROM businesses WHERE id = NEW.business_id;
    SELECT * INTO referrer FROM profiles WHERE id = NEW.referrer_id;
    SELECT * INTO offer FROM offers WHERE id = NEW.offer_id;

    PERFORM create_notification(
      biz.owner_id,
      'new_referral',
      'New Referral Received',
      referrer.full_name || ' submitted a referral for "' || offer.title || '"',
      jsonb_build_object('referral_id', NEW.id, 'offer_id', NEW.offer_id)
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER referrals_notify_submitted
  AFTER INSERT ON referrals
  FOR EACH ROW EXECUTE FUNCTION notify_on_referral_submitted();

-- Auto-notify referrer when status changes
CREATE OR REPLACE FUNCTION notify_on_referral_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  offer offers%ROWTYPE;
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    SELECT * INTO offer FROM offers WHERE id = NEW.offer_id;

    IF NEW.status = 'accepted' THEN
      PERFORM create_notification(
        NEW.referrer_id,
        'referral_accepted',
        'Referral Accepted!',
        'Your referral for "' || offer.title || '" was accepted.',
        jsonb_build_object('referral_id', NEW.id)
      );
    ELSIF NEW.status = 'rejected' THEN
      PERFORM create_notification(
        NEW.referrer_id,
        'referral_rejected',
        'Referral Not Accepted',
        'Your referral for "' || offer.title || '" was not accepted.',
        jsonb_build_object('referral_id', NEW.id)
      );
    ELSIF NEW.status = 'completed' THEN
      PERFORM create_notification(
        NEW.referrer_id,
        'referral_completed',
        'Referral Completed!',
        'Your referral for "' || offer.title || '" is complete. Check your earnings!',
        jsonb_build_object('referral_id', NEW.id)
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER referrals_notify_status_change
  AFTER UPDATE ON referrals
  FOR EACH ROW EXECUTE FUNCTION notify_on_referral_status_change();

-- ============================================================
-- CONVERSATIONS & MESSAGES
-- ============================================================

CREATE TABLE conversations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id     uuid NOT NULL UNIQUE REFERENCES referrals(id) ON DELETE CASCADE,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE messages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content         text NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created ON messages(conversation_id, created_at);

-- Auto-create conversation when referral is submitted
CREATE OR REPLACE FUNCTION create_conversation_on_referral()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO conversations (referral_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER referrals_create_conversation
  AFTER INSERT ON referrals
  FOR EACH ROW EXECUTE FUNCTION create_conversation_on_referral();

-- ============================================================
-- FRAUD SIGNALS
-- ============================================================

CREATE TABLE fraud_signals (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES profiles(id) ON DELETE SET NULL,
  referral_id     uuid REFERENCES referrals(id) ON DELETE SET NULL,
  signal_type     fraud_signal_type NOT NULL,
  details         jsonb NOT NULL DEFAULT '{}',
  severity        fraud_severity NOT NULL DEFAULT 'low',
  resolved        boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_fraud_unresolved ON fraud_signals(resolved) WHERE resolved = false;
CREATE INDEX idx_fraud_user ON fraud_signals(user_id);
CREATE INDEX idx_fraud_severity ON fraud_signals(severity);
-- Commission Army: Migration 00005
-- Row-Level Security Policies

-- ============================================================
-- Enable RLS on all tables
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_signals ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PROFILES
-- ============================================================

-- Anyone authenticated can read any profile (marketplace is public)
CREATE POLICY "profiles_select_authenticated"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Users can only update their own profile
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- BUSINESSES
-- ============================================================

-- Anyone authenticated can read active businesses
CREATE POLICY "businesses_select_active"
  ON businesses FOR SELECT
  TO authenticated
  USING (is_active = true OR owner_id = auth.uid());

-- Business owners can create businesses
CREATE POLICY "businesses_insert_own"
  ON businesses FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

-- Business owners can update their own businesses
CREATE POLICY "businesses_update_own"
  ON businesses FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Business owners can delete their own businesses
CREATE POLICY "businesses_delete_own"
  ON businesses FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- ============================================================
-- OFFERS
-- ============================================================

-- Anyone authenticated can read active offers
CREATE POLICY "offers_select_active"
  ON offers FOR SELECT
  TO authenticated
  USING (
    is_active = true
    OR business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

-- Business owners can create offers for their businesses
CREATE POLICY "offers_insert_own"
  ON offers FOR INSERT
  TO authenticated
  WITH CHECK (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

-- Business owners can update their own offers
CREATE POLICY "offers_update_own"
  ON offers FOR UPDATE
  TO authenticated
  USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()))
  WITH CHECK (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

-- Business owners can delete their own offers
CREATE POLICY "offers_delete_own"
  ON offers FOR DELETE
  TO authenticated
  USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

-- ============================================================
-- REFERRALS
-- ============================================================

-- Referrers can see their own submitted referrals
CREATE POLICY "referrals_select_referrer"
  ON referrals FOR SELECT
  TO authenticated
  USING (referrer_id = auth.uid());

-- Business owners can see referrals sent to their businesses
CREATE POLICY "referrals_select_business"
  ON referrals FOR SELECT
  TO authenticated
  USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

-- Authenticated users can submit referrals
CREATE POLICY "referrals_insert"
  ON referrals FOR INSERT
  TO authenticated
  WITH CHECK (
    referrer_id = auth.uid()
    -- Cannot refer to your own business
    AND business_id NOT IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

-- Business owners can update referral status (accept/reject/complete)
CREATE POLICY "referrals_update_business"
  ON referrals FOR UPDATE
  TO authenticated
  USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

-- Referrers can update their own referrals (add review)
CREATE POLICY "referrals_update_referrer"
  ON referrals FOR UPDATE
  TO authenticated
  USING (referrer_id = auth.uid());

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

-- Users can only read their own notifications
CREATE POLICY "notifications_select_own"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can update (mark read) their own notifications
CREATE POLICY "notifications_update_own"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- CONVERSATIONS
-- ============================================================

-- Participants (referrer or business owner) can see the conversation
CREATE POLICY "conversations_select_participant"
  ON conversations FOR SELECT
  TO authenticated
  USING (
    referral_id IN (
      SELECT r.id FROM referrals r
      WHERE r.referrer_id = auth.uid()
         OR r.business_id IN (SELECT b.id FROM businesses b WHERE b.owner_id = auth.uid())
    )
  );

-- ============================================================
-- MESSAGES
-- ============================================================

-- Conversation participants can read messages
CREATE POLICY "messages_select_participant"
  ON messages FOR SELECT
  TO authenticated
  USING (
    conversation_id IN (
      SELECT c.id FROM conversations c
      JOIN referrals r ON r.id = c.referral_id
      WHERE r.referrer_id = auth.uid()
         OR r.business_id IN (SELECT b.id FROM businesses b WHERE b.owner_id = auth.uid())
    )
  );

-- Conversation participants can send messages
CREATE POLICY "messages_insert_participant"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND conversation_id IN (
      SELECT c.id FROM conversations c
      JOIN referrals r ON r.id = c.referral_id
      WHERE r.referrer_id = auth.uid()
         OR r.business_id IN (SELECT b.id FROM businesses b WHERE b.owner_id = auth.uid())
    )
  );

-- ============================================================
-- FRAUD SIGNALS (admin only - no public access)
-- ============================================================

-- No policies = no access via client. Only service_role key or Edge Functions
-- with SECURITY DEFINER can read/write fraud_signals.
