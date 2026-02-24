/**
 * Commission Army - Application Constants
 *
 * Central source of truth for all business rules and config.
 */

// --- Platform fees ---
export const PLATFORM_FEE_PERCENT = 0.20; // 20%
export const REFERRER_SHARE_PERCENT = 0.80; // 80%

// --- Referral rules ---
export const MIN_REFERRAL_FEE = 10; // $10 minimum flat fee
export const REFERRAL_EXPIRY_DAYS = 7; // Days before a submitted referral auto-expires
export const ESCROW_HOLD_DAYS = 7; // Days payment is held before release to referrer

// --- Business categories (display labels) ---
export const BUSINESS_CATEGORIES = {
  trades: "Trades & Home Services",
  professional_services: "Professional Services",
  creative_services: "Creative Services",
  wedding: "Wedding & Events",
  automotive: "Automotive",
  recruiting: "Recruiting & Staffing",
  other: "Other",
} as const;

// --- Fee type labels ---
export const FEE_TYPE_LABELS = {
  flat: "Flat Fee",
  percentage: "Percentage of Deal",
  flat_plus_percentage: "Flat Fee + Percentage Bonus",
} as const;

// --- Referral status labels ---
export const REFERRAL_STATUS_LABELS = {
  submitted: "Pending Review",
  accepted: "Accepted",
  rejected: "Not Accepted",
  completed: "Completed",
  disputed: "Under Review",
  expired: "Expired",
} as const;

export const REFERRAL_STATUS_COLORS = {
  submitted: "yellow",
  accepted: "blue",
  rejected: "red",
  completed: "green",
  disputed: "orange",
  expired: "gray",
} as const;

// --- US States (for location dropdowns) ---
export const US_STATES = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
] as const;

// --- Validation ---
export const VALIDATION = {
  fullName: { min: 2, max: 100 },
  businessName: { min: 2, max: 200 },
  offerTitle: { min: 5, max: 200 },
  offerDescription: { min: 20, max: 2000 },
  leadContext: { min: 10, max: 2000 },
  review: { min: 5, max: 1000 },
  bio: { max: 500 },
} as const;
