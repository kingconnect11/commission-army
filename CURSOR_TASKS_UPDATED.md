# Commission Army - Cursor Tasks (Updated)

## Status

- Task 1: Auth Pages — **COMPLETE**
- Task 2: Onboarding Flow — **COMPLETE**
- Task 3: Dashboard Layout — **NEXT**
- Task 4-9: Remaining tasks — QUEUED

## Available Server Actions

All server actions are in `src/lib/actions/`. Import from `@/lib/actions`.

**Auth:** `signUpWithEmail`, `signInWithEmail`, `signInWithOAuth`, `signOut`, `updateProfile`, `getProfile`
**Businesses:** `createBusiness`, `getMyBusinesses`, `getBusinessById`, `updateBusiness`
**Offers:** `createOffer`, `getActiveOffers`, `getOfferById`, `getMyOffers`, `toggleOfferActive`
**Referrals:** `submitReferral`, `getMyReferrals`, `updateReferralStatus`, `reportDealClosure`, `submitReview`
**Notifications:** `getNotifications`, `markNotificationRead`, `markAllNotificationsRead`
**Messages:** `getConversation`, `sendMessage`, `getMyConversations`
**Stripe:** `startStripeOnboarding`, `getStripeStatus` (from `@/lib/actions/stripe-connect`)
**Dashboard:** `getDashboardStats` (from `@/lib/actions/dashboard`)

## Types

Import from `@/types`:
`Profile`, `Business`, `Offer`, `Referral`, `Notification`, `Message`, `Conversation`
`OfferWithBusiness`, `ReferralWithDetails`, `ConversationWithMessages`
`UserRole`, `BusinessCategory`, `FeeType`, `ReferralStatus`
`ProfileUpdate`, `BusinessInsert`, `OfferInsert`, `ReferralInsert`

## Constants

Import from `@/config/constants`:
`BUSINESS_CATEGORIES`, `FEE_TYPE_LABELS`, `REFERRAL_STATUS_LABELS`, `REFERRAL_STATUS_COLORS`, `US_STATES`, `VALIDATION`, `MIN_REFERRAL_FEE`, `PLATFORM_FEE_PERCENT`, `REFERRER_SHARE_PERCENT`

---

## Task 3: Dashboard Layout

**Files:**
- `src/app/dashboard/layout.tsx`
- `src/app/dashboard/page.tsx`
- `src/components/Sidebar.tsx`
- `src/components/Topbar.tsx`
- `src/components/NotificationBell.tsx`

**Requirements:**
- Responsive sidebar (collapsible on mobile via Sheet)
- Sidebar nav items based on user role (get from `getProfile()`):
  - **Referrer:** Browse Offers, My Referrals, Messages, Settings
  - **Business:** My Offers, Incoming Referrals, Create Offer, Messages, Settings
  - **Both:** All of the above
- Topbar with user avatar, name, notification bell
- NotificationBell: shows unread count badge, dropdown with recent notifications
  - Uses `getNotifications()` and `markNotificationRead()`
- Sign out button in sidebar footer (calls `signOut()`)
- Dashboard home page: show stats cards using `getDashboardStats()`
  - Referrer stats: Total referrals sent, Pending, Accepted, Total earned, Pending earnings
  - Business stats: Total referrals received, Active offers, Total spent, Average rating
- Fetch user profile in layout server component via `getProfile()` and pass to children

---

## Task 4: Browse Offers Page (Referrer View)

Same as before — see original CURSOR_TASKS.md Task 4.

Uses: `getActiveOffers(params)` — supports `category`, `city`, `state`, `search`, `limit`, `offset` params.

---

## Task 5: Offer Detail + Referral Submission

Same as before — see original CURSOR_TASKS.md Task 5.

Uses: `getOfferById(id)`, `submitReferral(data)`

Note: `submitReferral` now includes automatic fraud detection. If fraud is detected, it returns `{ error: "This referral could not be submitted..." }`. Display that error to the user.

---

## Task 6: My Referrals Page (Referrer View)

Same as before — see original CURSOR_TASKS.md Task 6.

Uses: `getMyReferrals("referrer")`

**New addition:** Add a "Message" button on each referral card that links to the conversation.

---

## Task 7: Business Dashboard - Incoming Referrals

Same as before — see original CURSOR_TASKS.md Task 7.

Uses: `getMyReferrals("business")`, `updateReferralStatus()`, `reportDealClosure()`

---

## Task 8: Create/Edit Offer Page

Same as before — see original CURSOR_TASKS.md Task 8.

Uses: `createOffer()`, `getMyBusinesses()`

---

## Task 9: Settings Page

**Files:**
- `src/app/dashboard/settings/page.tsx`

**Requirements:**
- Profile editing section (name, phone, city, state, bio, LinkedIn URL)
  - Uses `getProfile()` to load, `updateProfile()` to save
- Stripe Connect section:
  - If not connected: "Set up payments" button → calls `startStripeOnboarding()` and redirects to returned URL
  - If connected: green checkmark, "Payments connected" status
  - Uses `getStripeStatus()` to check
- Shows stripe_onboarding query params (complete/refresh) as toast messages

---

## Task 10: Messages Page

**NEW TASK — not in original list**

**Files:**
- `src/app/dashboard/messages/page.tsx`
- `src/components/ConversationList.tsx`
- `src/components/ChatWindow.tsx`

**Requirements:**
- Left panel: list of conversations using `getMyConversations()`
  - Each shows: other party's name, offer title, last message preview, status badge
- Right panel: selected conversation messages using `getConversation(referralId)`
  - Chat-style layout (own messages right-aligned, theirs left-aligned)
  - Message input at bottom, calls `sendMessage(conversationId, content)`
  - Auto-scroll to newest message
- Responsive: on mobile, show list or chat (not both)
- Uses Supabase Realtime for live message updates (subscribe to messages table):
  ```ts
  import { createClient } from "@/lib/supabase/client";
  const supabase = createClient();
  supabase.channel('messages')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` }, (payload) => {
      // Add new message to state
    })
    .subscribe();
  ```

---

## Task 11: Landing Page

Same as before — see original CURSOR_TASKS.md Task 9.

---

## Build Order

Build these in order, testing each before moving on:

1. **Task 3** — Dashboard Layout (sidebar, topbar, stats)
2. **Task 4** — Browse Offers
3. **Task 5** — Offer Detail + Submit Referral
4. **Task 8** — Create Offer (so we can create test data)
5. **Task 6** — My Referrals (referrer view)
6. **Task 7** — Incoming Referrals (business view)
7. **Task 9** — Settings (profile + Stripe Connect)
8. **Task 10** — Messages
9. **Task 11** — Landing Page (last — least critical for testing)
