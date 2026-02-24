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
