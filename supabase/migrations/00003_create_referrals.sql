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
