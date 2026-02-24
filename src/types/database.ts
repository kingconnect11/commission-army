/**
 * Commission Army - Database Types
 *
 * These types mirror the Supabase schema exactly.
 * In production, generate these with: npx supabase gen types typescript
 * For now, hand-maintained to match our migrations.
 */

// ============================================================
// Enums
// ============================================================

export type UserRole = "referrer" | "business" | "both";

export type BusinessCategory =
  | "trades"
  | "professional_services"
  | "creative_services"
  | "wedding"
  | "automotive"
  | "recruiting"
  | "other";

export type FeeType = "flat" | "percentage" | "flat_plus_percentage";

export type ReferralStatus =
  | "submitted"
  | "accepted"
  | "rejected"
  | "completed"
  | "disputed"
  | "expired";

export type NotificationType =
  | "new_referral"
  | "referral_accepted"
  | "referral_rejected"
  | "referral_completed"
  | "payment_received"
  | "payment_sent"
  | "review_received"
  | "offer_match"
  | "system";

export type FraudSignalType =
  | "self_referral"
  | "velocity"
  | "duplicate_lead"
  | "ip_match"
  | "device_match"
  | "suspicious_pattern";

export type FraudSeverity = "low" | "medium" | "high";

// ============================================================
// Row Types
// ============================================================

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: UserRole | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  bio: string | null;
  linkedin_url: string | null;
  stripe_account_id: string | null;
  stripe_onboarding_complete: boolean;
  rating_avg: number;
  rating_count: number;
  is_verified: boolean;
  onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  category: BusinessCategory;
  subcategory: string | null;
  website: string | null;
  phone: string | null;
  city: string;
  state: string;
  logo_url: string | null;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Offer {
  id: string;
  business_id: string;
  title: string;
  description: string;
  what_i_need: string;
  fee_type: FeeType;
  flat_fee: number | null;
  percentage_fee: number | null;
  percentage_description: string | null;
  min_fee: number;
  max_fee: number | null;
  qualification_criteria: string | null;
  is_active: boolean;
  views_count: number;
  referrals_count: number;
  created_at: string;
  updated_at: string;
}

export interface Referral {
  id: string;
  offer_id: string;
  referrer_id: string;
  business_id: string;

  // Lead info
  lead_name: string;
  lead_email: string | null;
  lead_phone: string | null;
  lead_context: string;
  relationship: string | null;

  // Status
  status: ReferralStatus;

  // Fee snapshot
  fee_type: FeeType;
  flat_fee_amount: number | null;
  percentage_fee: number | null;

  // Payment
  platform_fee: number | null;
  referrer_payout: number | null;

  // Success bonus
  deal_value: number | null;
  success_bonus: number | null;
  platform_bonus_fee: number | null;
  referrer_bonus_payout: number | null;

  // Stripe
  stripe_payment_intent_id: string | null;
  stripe_transfer_id: string | null;
  escrow_released_at: string | null;

  // Timestamps
  submitted_at: string;
  accepted_at: string | null;
  rejected_at: string | null;
  completed_at: string | null;
  expires_at: string;

  // Reviews
  business_rating_of_referrer: number | null;
  business_review_of_referrer: string | null;
  referrer_rating_of_business: number | null;
  referrer_review_of_business: string | null;

  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown>;
  read: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  referral_id: string;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export interface FraudSignal {
  id: string;
  user_id: string | null;
  referral_id: string | null;
  signal_type: FraudSignalType;
  details: Record<string, unknown>;
  severity: FraudSeverity;
  resolved: boolean;
  created_at: string;
}

// ============================================================
// Joined / View Types (for common queries)
// ============================================================

export interface OfferWithBusiness extends Offer {
  business: Pick<Business, "id" | "name" | "category" | "city" | "state" | "logo_url">;
}

export interface ReferralWithDetails extends Referral {
  offer: Pick<Offer, "id" | "title" | "fee_type" | "flat_fee" | "percentage_fee">;
  business: Pick<Business, "id" | "name" | "category" | "city" | "state">;
  referrer: Pick<Profile, "id" | "full_name" | "avatar_url" | "rating_avg">;
}

export interface ConversationWithMessages extends Conversation {
  messages: Message[];
  referral: Pick<Referral, "id" | "status" | "lead_name">;
}

// ============================================================
// Insert / Update Types
// ============================================================

export type ProfileUpdate = Partial<
  Pick<
    Profile,
    | "full_name"
    | "avatar_url"
    | "role"
    | "phone"
    | "city"
    | "state"
    | "bio"
    | "linkedin_url"
    | "onboarding_complete"
  >
>;

export type BusinessInsert = Pick<
  Business,
  "name" | "category" | "city" | "state"
> &
  Partial<Pick<Business, "description" | "subcategory" | "website" | "phone" | "logo_url">>;

export type OfferInsert = Pick<
  Offer,
  "business_id" | "title" | "description" | "what_i_need" | "fee_type"
> &
  Partial<
    Pick<
      Offer,
      | "flat_fee"
      | "percentage_fee"
      | "percentage_description"
      | "min_fee"
      | "max_fee"
      | "qualification_criteria"
    >
  >;

export type ReferralInsert = Pick<
  Referral,
  "offer_id" | "business_id" | "lead_name" | "lead_context"
> &
  Partial<Pick<Referral, "lead_email" | "lead_phone" | "relationship">>;

// ============================================================
// Supabase Database type (for createClient<Database>)
// ============================================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at" | "rating_avg" | "rating_count">;
        Update: ProfileUpdate;
      };
      businesses: {
        Row: Business;
        Insert: BusinessInsert & { owner_id: string };
        Update: Partial<BusinessInsert>;
      };
      offers: {
        Row: Offer;
        Insert: OfferInsert;
        Update: Partial<OfferInsert> & { is_active?: boolean };
      };
      referrals: {
        Row: Referral;
        Insert: ReferralInsert & { referrer_id: string };
        Update: Partial<Pick<Referral, "status" | "deal_value" | "business_rating_of_referrer" | "business_review_of_referrer" | "referrer_rating_of_business" | "referrer_review_of_business">>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, "id" | "created_at">;
        Update: Pick<Notification, "read">;
      };
      conversations: {
        Row: Conversation;
        Insert: Pick<Conversation, "referral_id">;
        Update: never;
      };
      messages: {
        Row: Message;
        Insert: Omit<Message, "id" | "created_at">;
        Update: never;
      };
      fraud_signals: {
        Row: FraudSignal;
        Insert: Omit<FraudSignal, "id" | "created_at">;
        Update: Pick<FraudSignal, "resolved">;
      };
    };
    Enums: {
      user_role: UserRole;
      business_category: BusinessCategory;
      fee_type: FeeType;
      referral_status: ReferralStatus;
      notification_type: NotificationType;
      fraud_signal_type: FraudSignalType;
      fraud_severity: FraudSeverity;
    };
  };
}
