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
