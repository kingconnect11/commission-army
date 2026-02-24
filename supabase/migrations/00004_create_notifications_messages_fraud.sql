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
