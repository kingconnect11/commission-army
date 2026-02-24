# Commission Army - Cursor Frontend Tasks (Phase 1)

## Project Context

Commission Army is a two-sided referral marketplace. The backend (Supabase schema, RLS policies, server actions, Stripe integration, API routes) is COMPLETE. Your job is to build the frontend UI.

**Tech stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
**State:** Server actions in `src/lib/actions/` — call these directly from components
**Types:** `src/types/database.ts` — import all types from `@/types`
**Constants:** `src/config/constants.ts` — labels, categories, validation rules
**Auth:** Supabase SSR via `src/lib/supabase/client.ts` (browser) and `src/lib/supabase/server.ts` (server)

## Setup First

```bash
npx shadcn@latest init
# Choose: New York style, Zinc color, CSS variables: yes
npx shadcn@latest add button input label card dialog select textarea badge avatar dropdown-menu separator tabs sheet toast form
```

---

## Task 1: Auth Pages

**Files:**
- `src/app/auth/login/page.tsx`
- `src/app/auth/signup/page.tsx`

**Requirements:**
- Clean, centered card layout
- Email + password fields with validation
- "Sign up" / "Log in" toggle between pages
- Google OAuth button (calls `signInWithOAuth("google")` from `@/lib/actions/auth`)
- LinkedIn OAuth button (calls `signInWithOAuth("linkedin_oidc")`)
- Error display from server action responses
- "Forgot password" link (can be placeholder for now)
- Import actions from `@/lib/actions/auth`: `signUpWithEmail`, `signInWithEmail`, `signInWithOAuth`

---

## Task 2: Onboarding Flow

**Files:**
- `src/app/onboarding/page.tsx`
- `src/app/onboarding/components/RoleSelect.tsx`
- `src/app/onboarding/components/ProfileForm.tsx`
- `src/app/onboarding/components/BusinessForm.tsx`

**Requirements:**
- Multi-step form (Step 1: Choose Role, Step 2: Profile Details, Step 3: Business Details if role is "business" or "both")
- Step 1: Three cards — "I want to refer leads" (referrer), "I want to receive leads" (business), "Both"
- Step 2: Full name, phone, city, state (dropdown from `US_STATES`), bio, LinkedIn URL
- Step 3 (if business/both): Business name, category (dropdown from `BUSINESS_CATEGORIES`), description, website, phone, city, state
- On final submit: calls `updateProfile()` then `createBusiness()` if applicable, then redirects to `/dashboard`
- Uses `updateProfile({ onboarding_complete: true })` on completion
- Progress indicator at top showing current step

---

## Task 3: Dashboard Layout

**Files:**
- `src/app/dashboard/layout.tsx`
- `src/components/Sidebar.tsx`
- `src/components/Topbar.tsx`
- `src/components/NotificationBell.tsx`

**Requirements:**
- Responsive sidebar (collapsible on mobile via Sheet)
- Sidebar nav items based on user role:
  - **Referrer:** Browse Offers, My Referrals, Earnings, Settings
  - **Business:** My Offers, Incoming Referrals, Create Offer, Settings
  - **Both:** All of the above
- Topbar with user avatar, name, notification bell
- NotificationBell: shows unread count badge, dropdown with recent notifications
  - Uses `getNotifications()` and `markNotificationRead()` from `@/lib/actions/notifications`
- Active nav item highlighted
- Sign out button in sidebar footer (calls `signOut()`)
- Fetch user profile in layout server component via `getProfile()` and pass to children

---

## Task 4: Browse Offers Page (Referrer View)

**Files:**
- `src/app/dashboard/offers/page.tsx`
- `src/components/OfferCard.tsx`
- `src/components/OfferFilters.tsx`

**Requirements:**
- Grid of OfferCards showing: business name, offer title, fee amount, category badge, location
- Filter bar: Category dropdown, State dropdown, Search text input
- OfferCard shows:
  - Business logo or initial avatar
  - Offer title (bold)
  - Fee display: "$100 flat" or "10% of deal" or "$100 + 10% bonus"
  - Business category badge (use `BUSINESS_CATEGORIES` labels)
  - City, State
  - "Submit Referral" button → links to `/dashboard/offers/[id]`
- Uses `getActiveOffers()` from `@/lib/actions/offers`
- Pagination (load more button or infinite scroll)
- Empty state: "No offers match your filters" with illustration

---

## Task 5: Offer Detail + Referral Submission

**Files:**
- `src/app/dashboard/offers/[id]/page.tsx`
- `src/components/ReferralForm.tsx`

**Requirements:**
- Full offer details: title, description, what they need, fee structure, qualification criteria
- Business profile sidebar: name, category, location, rating
- "Submit a Referral" form:
  - Lead name (required)
  - Lead email (optional)
  - Lead phone (optional)
  - Context/why this is a good lead (required, textarea, min 10 chars)
  - Your relationship to this person (optional: friend, neighbor, colleague, etc.)
  - Submit button
- Uses `submitReferral()` from `@/lib/actions/referrals`
- Success toast + redirect back to offers list
- Error handling with inline messages

---

## Task 6: My Referrals Page (Referrer View)

**Files:**
- `src/app/dashboard/referrals/page.tsx`
- `src/components/ReferralCard.tsx`
- `src/components/StatusBadge.tsx`

**Requirements:**
- List of referrals the user has submitted
- Each card shows: offer title, business name, lead name, status badge, fee amount, date
- StatusBadge: colored badge using `REFERRAL_STATUS_LABELS` and `REFERRAL_STATUS_COLORS`
- Tabs: "All", "Pending", "Accepted", "Completed"
- Click to expand: shows full details, review form (if completed)
- Uses `getMyReferrals("referrer")` from `@/lib/actions/referrals`

---

## Task 7: Business Dashboard - Incoming Referrals

**Files:**
- `src/app/dashboard/business/referrals/page.tsx`
- `src/components/IncomingReferralCard.tsx`

**Requirements:**
- List of referrals sent to the user's businesses
- Each card shows: referrer name + avatar + rating, lead name, lead context, fee amount, status
- Action buttons:
  - "Accept" (calls `updateReferralStatus(id, "accepted")`) — green button
  - "Reject" (calls `updateReferralStatus(id, "rejected")`) — red outline button
  - "Report Deal Closed" (only if accepted + has percentage fee) — opens modal for deal value input, calls `reportDealClosure()`
- Uses `getMyReferrals("business")` from `@/lib/actions/referrals`
- Confirmation dialog before accept/reject

---

## Task 8: Create/Edit Offer Page

**Files:**
- `src/app/dashboard/business/offers/new/page.tsx`
- `src/components/OfferForm.tsx`

**Requirements:**
- Form fields:
  - Select business (dropdown of user's businesses from `getMyBusinesses()`)
  - Offer title
  - Description (what you do)
  - What I need (describe your ideal referral)
  - Fee type (radio: Flat Fee / Percentage / Both)
  - Flat fee amount (if flat or both) — minimum $10
  - Percentage fee (if percentage or both) — with description field
  - Max fee cap (optional, for percentage)
  - Qualification criteria (optional textarea)
- Real-time fee preview: "Referrer earns $80 (you pay $100, platform gets $20)"
- Uses `createOffer()` from `@/lib/actions/offers`
- Validation using constants from `VALIDATION`

---

## Task 9: Landing Page

**Files:**
- `src/app/page.tsx`
- `src/components/landing/Hero.tsx`
- `src/components/landing/HowItWorks.tsx`
- `src/components/landing/ForBusinesses.tsx`
- `src/components/landing/ForReferrers.tsx`
- `src/components/landing/CTA.tsx`

**Requirements:**
- Hero: "Stop Paying for Leads. Start Getting Referrals." + "Join Free" CTA button
- How It Works: 4-step visual (post offer → referrer finds lead → submit → get paid)
- For Businesses section: value props (free to join, set your own fees, pay for results only)
- For Referrers section: value props (earn money from your network, 80% of every fee)
- Stats section: "83% willing to refer, only 29% do" — the gap we close
- Bottom CTA: "Join the Beta — It's Free" → links to /auth/signup
- Responsive, modern design. Dark navy (#1a2332) + green (#22c55e) accent
- No auth required to view

---

## Design Guidelines

- **Colors:** Primary: green-600 (#16a34a), Dark: slate-900 (#0f172a), Accent: emerald-500
- **Typography:** Use default Tailwind font stack. Headings bold, body regular.
- **Spacing:** Generous padding. Cards with rounded-lg, subtle shadows.
- **Components:** Use shadcn/ui components wherever possible.
- **Loading:** Show skeleton loaders during data fetches (use Suspense where possible).
- **Empty states:** Always have a message + illustration/icon for empty lists.
- **Responsive:** Mobile-first. Sidebar collapses to hamburger menu on mobile.
- **Toasts:** Use shadcn toast for success/error feedback on actions.

---

## File Tree (what you're building)

```
src/
├── app/
│   ├── page.tsx                          # Landing page
│   ├── layout.tsx                        # Root layout (existing)
│   ├── auth/
│   │   ├── login/page.tsx                # Login page
│   │   ├── signup/page.tsx               # Signup page
│   │   └── callback/route.ts             # ✅ DONE (OAuth callback)
│   ├── onboarding/
│   │   └── page.tsx                      # Onboarding flow
│   ├── dashboard/
│   │   ├── layout.tsx                    # Dashboard shell (sidebar + topbar)
│   │   ├── page.tsx                      # Dashboard home (redirect to offers or referrals)
│   │   ├── offers/
│   │   │   ├── page.tsx                  # Browse offers (referrer)
│   │   │   └── [id]/page.tsx             # Offer detail + submit referral
│   │   ├── referrals/
│   │   │   └── page.tsx                  # My referrals (referrer)
│   │   ├── business/
│   │   │   ├── referrals/page.tsx        # Incoming referrals (business)
│   │   │   └── offers/
│   │   │       └── new/page.tsx          # Create offer
│   │   └── settings/
│   │       └── page.tsx                  # Profile + Stripe Connect settings
│   └── api/
│       ├── stripe/
│       │   ├── connect/route.ts          # ✅ DONE
│       │   └── create-payment/route.ts   # ✅ DONE
│       └── webhooks/
│           └── stripe/route.ts           # ✅ DONE
├── components/
│   ├── Sidebar.tsx
│   ├── Topbar.tsx
│   ├── NotificationBell.tsx
│   ├── OfferCard.tsx
│   ├── OfferFilters.tsx
│   ├── OfferForm.tsx
│   ├── ReferralCard.tsx
│   ├── ReferralForm.tsx
│   ├── IncomingReferralCard.tsx
│   ├── StatusBadge.tsx
│   └── landing/
│       ├── Hero.tsx
│       ├── HowItWorks.tsx
│       ├── ForBusinesses.tsx
│       ├── ForReferrers.tsx
│       └── CTA.tsx
├── lib/                                  # ✅ ALL DONE
│   ├── supabase/
│   ├── stripe.ts
│   └── actions/
├── types/                                # ✅ ALL DONE
├── config/                               # ✅ ALL DONE
└── middleware.ts                          # ✅ DONE
```

Items marked ✅ DONE are already built. Build everything else.
