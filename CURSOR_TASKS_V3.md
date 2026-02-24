# Commission Army - Cursor Tasks v3 (Recalibrated)

## What Changed Since v2

Claude Opus built the **entire frontend** — all dashboard pages, components, auth pages, onboarding, and landing page. The previous task list (v2) had Tasks 1-11. Claude completed all of them. This new task list covers what Cursor needs to do **next**: polish, integrate, test, and prepare for production.

## Current Project State

- **Build status:** `next build` passes with 0 errors, 19 routes
- **Database:** Supabase migration has been run (8 tables, RLS, triggers)
- **Auth:** Email + Google OAuth configured
- **Stripe:** Account exists but not yet live-configured (test keys in .env.local)
- **Frontend:** All pages built with dark theme (navy/crimson/forest palette)

## Tech Stack Quick Reference

- Next.js 16 (App Router, Turbopack)
- Supabase (Auth, PostgreSQL, Realtime, RLS)
- Stripe Connect Express (marketplace payments)
- Tailwind CSS v4 (using `@theme inline` for custom tokens)
- lucide-react for icons
- No component library — all custom CSS classes in `globals.css`

## Available Server Actions

All in `src/lib/actions/`. Import from `@/lib/actions`:

```
Auth: signUpWithEmail, signInWithEmail, signInWithOAuth, signOut, updateProfile, getProfile
Businesses: createBusiness, getMyBusinesses, getBusinessById, updateBusiness
Offers: createOffer, getActiveOffers, getOfferById, getMyOffers, toggleOfferActive
Referrals: submitReferral, getMyReferrals, updateReferralStatus, reportDealClosure, submitReview
Notifications: getNotifications, markNotificationRead, markAllNotificationsRead
Messages: getConversation, sendMessage, getMyConversations
Stripe: startStripeOnboarding, getStripeStatus (from @/lib/actions/stripe-connect)
Dashboard: getDashboardStats (from @/lib/actions/dashboard)
Admin: getPlatformMetrics, getRecentReferrals (from @/lib/actions/admin)
Fraud: runFraudChecks, logFraudSignals, getUnresolvedFraudSignals, resolveFraudSignal (from @/lib/actions/fraud)
```

## Types

Import from `@/types`:
```
Profile, Business, Offer, Referral, Notification, Message, Conversation, FraudSignal
OfferWithBusiness, ReferralWithDetails, ConversationWithMessages
UserRole, BusinessCategory, FeeType, ReferralStatus, NotificationType
ProfileUpdate, BusinessInsert, OfferInsert, ReferralInsert
```

## Utility Functions

Import from `@/lib/utils`:
```
cn(...classes) — Tailwind class merging
formatCurrency(amount) — "$1,234.56"
formatDate(isoString) — "Feb 23, 2026"
formatRelativeTime(isoString) — "5m ago", "2d ago"
getInitials(name) — "PK"
feeDisplay(feeType, flatFee, percentageFee) — "$50" or "5% of deal" or "$50 + 5%"
```

## Design System

All custom CSS classes are in `src/app/globals.css`. Key classes:
- `.btn-primary`, `.btn-secondary`, `.btn-ghost` — Button variants
- `.input-field`, `.select-field`, `.textarea-field` — Form inputs
- `.badge-submitted`, `.badge-accepted`, `.badge-rejected`, `.badge-completed`, `.badge-expired` — Status badges
- `.card-hover` — Card hover effect (translateY + shadow)
- `.glass-card` — Frosted glass card
- `.animate-fade-in`, `.animate-slide-left`, `.animate-scale-in` — Entrance animations
- `.stagger-1` through `.stagger-6` — Animation delay classes

Color tokens (use with Tailwind): `navy-{50-950}`, `crimson-{50-900}`, `forest-{50-900}`, `slate-{50-950}`, `surface`, `surface-raised`, `surface-overlay`, `border`, `border-subtle`, `text-primary`, `text-secondary`, `text-muted`, `accent`, `success`, `warning`, `danger`

Fonts: `font-[family-name:var(--font-display)]` for headings (Syne), body text uses DM Sans by default.

---

## NEW TASK LIST

### Task 1: End-to-End Testing & Bug Fixes

**Priority:** CRITICAL
**Estimate:** 2-3 hours

Start the dev server (`npm run dev`) and test every user flow end-to-end. Fix all bugs found.

**Test Flows:**
1. Sign up with email → confirm email → redirected to onboarding
2. Onboarding step 1 (role selection) → step 2 (profile) → step 3 (business, if applicable) → redirected to dashboard
3. Dashboard loads with correct stats for role
4. Browse offers page loads, search works, filters work, pagination works
5. Click an offer → detail page loads → submit a referral → success message → appears in My Referrals
6. Create an offer → appears in My Offers → toggle active/inactive works
7. Incoming referrals page: accept a referral → status changes → report deal closure works
8. Messages: select a conversation → send a message → appears in chat
9. Settings: edit profile → save → reload → changes persisted
10. Settings: Stripe Connect button initiates onboarding flow (test mode)
11. Notifications: bell shows unread count, clicking marks as read
12. Sign out → redirected to landing page

**Common Issues to Watch For:**
- RLS policies blocking queries (check Supabase logs)
- `null` values causing crashes in components that expect data
- Form validation messages not showing properly
- Mobile responsive layout issues (test at 375px width)
- Sidebar navigation highlighting wrong route
- Google OAuth redirect not configured in Supabase dashboard

**Files Most Likely to Need Fixes:**
- `src/app/dashboard/messages/page.tsx` — Realtime subscription edge cases
- `src/app/dashboard/incoming/page.tsx` — Action button state management
- `src/app/dashboard/settings/page.tsx` — Stripe redirect handling
- `src/middleware.ts` — Route protection edge cases

---

### Task 2: Loading States, Error Boundaries & Toast Notifications

**Priority:** HIGH
**Estimate:** 2-3 hours

**Requirements:**

1. **Create `src/components/Toast.tsx`:**
   - Simple toast notification component
   - Success (forest green), error (crimson), info (navy) variants
   - Auto-dismiss after 4 seconds
   - Positioned bottom-right, stacked
   - Use CSS animations (already defined in globals.css)

2. **Create `src/app/dashboard/loading.tsx`:**
   - Skeleton loading page for dashboard (use existing animate-pulse patterns)
   - Apply same pattern for each dashboard sub-route:
     - `src/app/dashboard/offers/loading.tsx`
     - `src/app/dashboard/my-referrals/loading.tsx`
     - `src/app/dashboard/incoming/loading.tsx`
     - `src/app/dashboard/messages/loading.tsx`
     - `src/app/dashboard/settings/loading.tsx`

3. **Create `src/app/dashboard/error.tsx`:**
   - Error boundary for dashboard routes
   - "Something went wrong" message with retry button
   - Use crimson accent styling
   - Log error to console for debugging

4. **Add toast notifications to all form submissions:**
   - Create Offer → success toast
   - Submit Referral → success toast
   - Accept/Reject Referral → success toast
   - Save Profile → success toast (replace current inline "Saved!" text)
   - All error states → error toast

---

### Task 3: Review Submission Flows

**Priority:** HIGH
**Estimate:** 1-2 hours

The `submitReview()` action exists but no UI calls it yet.

**Files to Create:**
- `src/components/ReviewModal.tsx`

**Requirements:**
- Modal overlay with star rating (1-5) and text review textarea
- Used from both My Referrals page (referrer reviewing business) and Incoming Referrals page (business reviewing referrer)
- Only show review button on referrals with status "completed"
- Only show if the user hasn't already left a review (check `business_rating_of_referrer` or `referrer_rating_of_business` being null)
- Star rating: use filled/empty star icons from lucide-react
- Submit calls `submitReview(referralId, role, rating, review)`
- On success, update the referral in local state to show "Review submitted" instead of the button
- Star display styling: use `text-warning` (gold) for filled, `text-slate-600` for empty

**Integration Points:**
- `src/app/dashboard/my-referrals/page.tsx` — Add "Leave Review" button to completed referrals
- `src/app/dashboard/incoming/page.tsx` — Add "Leave Review" button to completed referrals

---

### Task 4: Admin Dashboard

**Priority:** MEDIUM
**Estimate:** 2-3 hours

The admin server actions exist (`getPlatformMetrics`, `getRecentReferrals` in `src/lib/actions/admin.ts`) but no UI exists.

**Files to Create:**
- `src/app/dashboard/admin/page.tsx`

**Requirements:**
- Only accessible to admin users (admin check is hardcoded in `admin.ts` — currently checks email against a list)
- Add "Admin" nav item to sidebar for admin users
  - Modify `src/components/Sidebar.tsx` to accept `isAdmin` prop
  - Modify `src/app/dashboard/layout.tsx` to detect admin status and pass it
- Platform-wide metrics: total users, total businesses, total referrals, total commissions, platform revenue
- Recent referrals table with: referrer name, business name, offer title, status, submitted date, fee amount
- Fraud signals section: show unresolved fraud signals from `getUnresolvedFraudSignals()` with resolve button
- Use the existing StatCard component for metrics
- Table styling: use `bg-surface` rows with `border-border-subtle` separators

**Admin Detection:**
In `admin.ts`, the admin emails are hardcoded. For now, pass this as a flag from the layout:
```ts
const ADMIN_EMAILS = ["kingconnection@icloud.com"]; // Philip's email
const isAdmin = ADMIN_EMAILS.includes(profile.email);
```

---

### Task 5: Responsive Polish & Mobile Optimization

**Priority:** MEDIUM
**Estimate:** 2-3 hours

Test every page at these breakpoints: 375px (mobile), 768px (tablet), 1024px (small desktop), 1440px (desktop).

**Known Mobile Issues to Fix:**
1. Messages page: conversation list and chat panel need clean mobile toggle (code exists but needs testing)
2. Sidebar: mobile sheet overlay should close on nav link click (handler exists, verify it works)
3. Offer cards: ensure text doesn't overflow on small screens
4. Incoming referrals: action buttons should stack vertically on mobile
5. Create Offer form: fee structure section needs better mobile layout
6. Landing page hero: text sizing may need adjustment on very small screens

**Additional Polish:**
- Add `<meta name="viewport" content="width=device-width, initial-scale=1" />` if missing
- Touch targets should be minimum 44x44px for mobile
- Forms should have proper `inputMode` attributes (e.g., `inputMode="numeric"` for money fields)
- Test keyboard navigation (Tab order, Enter to submit forms)

---

### Task 6: Email Notifications (Resend Integration)

**Priority:** MEDIUM
**Estimate:** 2-3 hours

The app uses `resend` package (already installed) but no email sending is implemented yet.

**Files to Create:**
- `src/lib/email.ts` — Email sending utility
- `src/lib/email-templates.ts` — HTML email templates

**Email Triggers (implement in existing server actions):**
1. **New Referral Submitted** → Email to business owner
   - Trigger: after successful `submitReferral()` in `referrals.ts`
   - Content: "You received a new referral for [offer title] from [referrer name]"
2. **Referral Accepted** → Email to referrer
   - Trigger: after `updateReferralStatus(id, "accepted")` in `referrals.ts`
   - Content: "[Business name] accepted your referral for [lead name]"
3. **Referral Rejected** → Email to referrer
   - Trigger: after `updateReferralStatus(id, "rejected")`
   - Content: "[Business name] did not accept your referral"
4. **Payment Received** → Email to referrer
   - Trigger: in Stripe webhook after successful transfer
   - Content: "You earned $X from your referral to [business name]"

**Email Template Design:**
- Use inline CSS (email clients don't support external CSS)
- Dark theme matching the app: navy background, white text, crimson accent buttons
- Commission Army logo (CA block) at top
- Minimal, transactional style — not marketing email

**Resend Setup:**
```ts
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);
```

---

### Task 7: Search & Discovery Improvements

**Priority:** LOW
**Estimate:** 1-2 hours

**Requirements:**
1. **Debounced search** on Browse Offers page
   - Currently searches on every keystroke — add 300ms debounce
   - Show a subtle loading spinner in the search input while fetching

2. **URL-based filters** on Browse Offers
   - Sync search, category, state, and page to URL search params
   - Allows bookmarking and sharing filtered views
   - Use `useSearchParams()` and `router.push()` with updated params

3. **Sort options** on Browse Offers
   - Add sort dropdown: "Newest", "Highest Fee", "Most Views"
   - Requires updating `getActiveOffers()` to accept sort parameter
   - Modify the Supabase query's `.order()` call based on sort

4. **"Featured" or "Hot" badge** on offers with high view/referral counts
   - Show a small flame icon badge on offers with >50 views or >5 referrals
   - Use `text-warning` color for the badge

---

### Task 8: Progressive Enhancement & Performance

**Priority:** LOW
**Estimate:** 2-3 hours

1. **Image optimization:**
   - Add default avatar image to `/public/default-avatar.png`
   - Use Next.js `<Image>` component for all avatar renders
   - Add business logo upload capability (Supabase Storage)

2. **SEO improvements:**
   - Add `metadata` exports to all page files
   - Landing page: add Open Graph and Twitter card meta tags
   - Add `robots.txt` and `sitemap.xml` to `/public`

3. **Performance:**
   - Add `Suspense` boundaries around data-fetching components
   - Use `React.memo` on expensive list items (offer cards, referral rows)
   - Dashboard stats: consider caching with `unstable_cache` or SWR

4. **Accessibility:**
   - All interactive elements need `aria-label` where text isn't visible
   - Notification dropdown needs `aria-expanded` and keyboard trap
   - Forms need `aria-describedby` for error messages
   - Color contrast: verify all text/background combos pass WCAG AA

---

### Task 9: Deployment Preparation

**Priority:** LOW (but required before launch)
**Estimate:** 1-2 hours

1. **Environment validation:**
   - Create `src/lib/env.ts` that validates all required env vars at startup
   - Throw clear error messages if any are missing

2. **Vercel deployment config:**
   - Ensure `next.config.ts` has correct settings
   - Add `vercel.json` if needed for custom headers or rewrites
   - Test production build locally: `npm run build && npm start`

3. **Security headers:**
   - Add security headers (CSP, X-Frame-Options, etc.) in `next.config.ts`
   - Ensure Stripe webhook endpoint is excluded from CSRF protection

4. **Rate limiting:**
   - Add basic rate limiting to sensitive actions (signUp, submitReferral)
   - Can use Supabase's built-in rate limiting or implement simple IP-based limiting

---

## Build Order

Execute these in order:

1. **Task 1** — E2E Testing & Bug Fixes (CRITICAL — do this first, everything else depends on it)
2. **Task 2** — Loading States & Toasts
3. **Task 3** — Review Submission UI
4. **Task 4** — Admin Dashboard
5. **Task 5** — Responsive Polish
6. **Task 6** — Email Notifications
7. **Task 7** — Search Improvements
8. **Task 8** — Performance & SEO
9. **Task 9** — Deployment Prep

Tasks 1-3 are essential for MVP. Tasks 4-5 are important. Tasks 6-9 can be done incrementally.
