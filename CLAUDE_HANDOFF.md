# Commission Army — Claude Handoff Document

## READ THIS FIRST

You are picking up a project called **Commission Army**, a two-sided referral marketplace. This document tells you everything about the project, its current state, what's been built, what works, what doesn't, and what you need to do next.

Your first task is to familiarize yourself with the codebase by reading key files. Your second task is to review Cursor's work (Philip will share Cursor's progress). Your ongoing role is architect, backend engineer, code reviewer, and technical lead.

---

## 1. WHAT IS COMMISSION ARMY?

A marketplace where **businesses** post referral offers ("I'll pay $50 for anyone who sends me a customer who needs kitchen remodeling") and **referrers** (regular people) submit leads from their personal networks and earn commissions.

**Business model:**
- Business pays the full referral fee
- Platform takes 20% → referrer gets 80%
- Payments through Stripe Connect (business pays → held in escrow → released to referrer after 7 days)

**Key people:**
- **Philip King** (`kingconnection@icloud.com`) — CTO, technical lead, the person you're talking to
- **Roger King** — Philip's father, founder/CEO, originated the idea
- **Mike King** — Philip's brother, partner

**Target:** Small business owners (trades, professional services, creative services, etc.)
**Funding:** Bootstrapped (no investors)
**Excluded verticals:** Real estate, insurance, legal, healthcare, financial services (regulatory reasons)

---

## 2. TECH STACK

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js 16.1.6 | App Router, Turbopack, Server Actions |
| Database | Supabase PostgreSQL | Row-Level Security, Realtime, Edge Functions |
| Auth | Supabase Auth | Email/password + Google OAuth |
| Payments | Stripe Connect Express | Marketplace split payments, KYC, 1099 |
| Styling | Tailwind CSS v4 | Custom `@theme inline` tokens, no component library |
| Icons | lucide-react | |
| Email | Resend | Not yet implemented — package installed |
| Validation | Zod | Installed but not yet used in forms |
| Hosting | Vercel (planned) | Not yet deployed |
| Mobile | React Native/Expo (planned) | Not started |

**Supabase project URL:** `https://lhubrufdaqkzbnsfntea.supabase.co`

---

## 3. PROJECT STRUCTURE

```
commission-army/
├── .env.local                          # Environment variables (keys configured)
├── .env.example                        # Template for version control
├── package.json                        # Dependencies
├── next.config.ts                      # Next.js config
├── tsconfig.json                       # TypeScript config
├── CURSOR_TASKS_V3.md                  # Current Cursor task list
│
├── supabase/
│   ├── FULL_MIGRATION.sql              # Combined migration (already run)
│   └── migrations/
│       ├── 00001_create_enums_and_profiles.sql
│       ├── 00002_create_businesses_and_offers.sql
│       ├── 00003_create_referrals.sql
│       ├── 00004_create_notifications_messages_fraud.sql
│       └── 00005_create_rls_policies.sql
│
└── src/
    ├── middleware.ts                    # Auth middleware (protects /dashboard, /onboarding)
    │
    ├── app/
    │   ├── layout.tsx                  # Root layout (Google Fonts via <link>, dark mode)
    │   ├── globals.css                 # Full design system (colors, animations, components)
    │   ├── page.tsx                    # Landing page (/)
    │   ├── login/page.tsx              # Login page
    │   ├── signup/page.tsx             # Sign up page
    │   ├── onboarding/page.tsx         # 2-3 step onboarding wizard
    │   ├── auth/callback/route.ts      # OAuth callback handler
    │   │
    │   ├── api/
    │   │   ├── stripe/connect/route.ts         # Create Stripe Connect account
    │   │   ├── stripe/create-payment/route.ts  # Create payment intent
    │   │   └── webhooks/stripe/route.ts        # Stripe webhook handler
    │   │
    │   └── dashboard/
    │       ├── layout.tsx              # Dashboard shell (sidebar, topbar, auth check)
    │       ├── page.tsx                # Dashboard home (stats cards)
    │       ├── offers/page.tsx         # Browse offers (search, filter, paginate)
    │       ├── offers/[id]/page.tsx    # Offer detail + referral submission
    │       ├── offers/new/page.tsx     # Create new offer
    │       ├── my-offers/page.tsx      # Business: manage own offers
    │       ├── my-referrals/page.tsx   # Referrer: track submitted referrals
    │       ├── incoming/page.tsx       # Business: accept/reject referrals
    │       ├── messages/page.tsx       # Real-time chat (Supabase Realtime)
    │       └── settings/page.tsx       # Profile editing + Stripe Connect
    │
    ├── components/
    │   ├── DashboardShell.tsx          # Sidebar + Topbar wrapper (client component)
    │   ├── Sidebar.tsx                 # Role-based navigation, collapsible, mobile overlay
    │   ├── Topbar.tsx                  # User avatar, name, notification bell
    │   ├── NotificationBell.tsx        # Dropdown with unread count badge
    │   ├── StatCard.tsx                # Dashboard metric card
    │   ├── StatusBadge.tsx             # Referral status pill
    │   └── EmptyState.tsx              # Empty state with icon, text, CTA
    │
    ├── lib/
    │   ├── utils.ts                    # cn(), formatCurrency(), formatDate(), etc.
    │   ├── stripe.ts                   # Stripe client (lazy singleton), Connect helpers
    │   │
    │   ├── supabase/
    │   │   ├── client.ts              # Browser Supabase client
    │   │   ├── server.ts              # Server Supabase client + admin client
    │   │   └── middleware.ts          # Session refresh middleware helper
    │   │
    │   └── actions/
    │       ├── index.ts               # Re-exports all public actions
    │       ├── auth.ts                # signUp, signIn, signOut, updateProfile, getProfile
    │       ├── businesses.ts          # CRUD for businesses
    │       ├── offers.ts              # CRUD for offers + search
    │       ├── referrals.ts           # Submit, status updates, deal closure, reviews
    │       ├── notifications.ts       # Get, mark read
    │       ├── messages.ts            # Conversations and messages
    │       ├── dashboard.ts           # getDashboardStats (role-aware)
    │       ├── stripe-connect.ts      # Stripe onboarding flow
    │       ├── fraud.ts               # Fraud detection pipeline
    │       └── admin.ts               # Platform metrics (admin-only)
    │
    ├── config/
    │   └── constants.ts               # Business rules, categories, validation, US states
    │
    └── types/
        ├── index.ts                   # Re-exports
        └── database.ts                # All TypeScript types mirroring DB schema
```

---

## 4. DATABASE SCHEMA

8 tables with Row-Level Security on all of them:

| Table | Purpose | Key RLS Rules |
|-------|---------|---------------|
| `profiles` | User profiles (extends auth.users) | Users can read all, update own |
| `businesses` | Registered businesses | Owner can CRUD, all can read active |
| `offers` | Referral offers posted by businesses | Owner can CRUD, all can read active |
| `referrals` | Core transaction table | Referrer can create, business owner can update status, both can read own |
| `notifications` | In-app notifications | Users read/update own only |
| `conversations` | Chat threads (1 per referral) | Auto-created by trigger, accessible to referrer + business owner |
| `messages` | Chat messages | Sender can create, both parties can read |
| `fraud_signals` | Fraud detection logs | Admin only |

**Key database triggers:**
- Auto-create profile on auth.users insert
- Auto-create conversation on referral insert
- Lock referral fees at submission time (snapshot from offer)
- Calculate success bonus when `deal_value` is set
- Auto-notify on referral submission and status change
- Auto-expire stale referrals after 7 days

**Important constraint:** Referrers CANNOT submit referrals to their own businesses (enforced at RLS level).

---

## 5. DESIGN SYSTEM

The app uses a dark theme with these primary colors:
- **Navy blue** (dominant): `--navy-950: #060D1B` through `--navy-50: #EDF2F8`
- **Crimson red** (accent/CTA): `--crimson-700: #8B1A1A` through `--crimson-400: #DC4D4D`
- **Forest green** (success): `--forest-800: #1A4D2E` through `--forest-400: #4CC283`
- **Slate** (neutrals): standard gray scale

Typography: **Syne** for headings (geometric, bold), **DM Sans** for body text. Loaded via Google Fonts `<link>` in layout.tsx (not next/font — that was causing build failures in sandboxed environments).

All custom component classes are in `globals.css`. There is NO shadcn/ui or component library — everything is hand-crafted CSS.

---

## 6. KNOWN ISSUES & TECHNICAL DEBT

### Issues That Need Attention

1. **Supabase clients are untyped.** We removed the `Database` generic from `createBrowserClient`/`createServerClient` because the hand-written type interface didn't match Supabase's expected format. All queries work but return `any` — results are manually cast with `as unknown as Type`. **Fix:** Run `npx supabase gen types typescript` to generate proper types and re-enable generics.

2. **Stripe is in test mode.** The `.env.local` has placeholder test keys. Philip has a Stripe account but hasn't configured Connect yet. The lazy singleton pattern (`getStripe()`) prevents build-time crashes.

3. **Next.js middleware deprecation warning.** Build shows "The 'middleware' file convention is deprecated. Please use 'proxy' instead." This is a Next.js 16 change — the middleware still works but should eventually be migrated.

4. **No email sending yet.** `resend` package is installed but no email utility exists. The `RESEND_API_KEY` in `.env.local` is a placeholder.

5. **Zod validation not used.** Zod is installed but form validation is all HTML5 `required`/`minLength`/`maxLength`. Should add proper Zod schemas for server-side validation in actions.

6. **No image upload.** Avatar and business logo URLs exist in the schema but there's no upload UI. Needs Supabase Storage integration.

7. **Admin emails are hardcoded.** In `admin.ts`, admin access checks `ADMIN_EMAILS = ["kingconnection@icloud.com"]`. Should move to a DB column or env var.

8. **Messages page conversation loading** uses a two-step approach (find conversation by ID, then load messages by referral_id). This works but is slightly roundabout — could be simplified.

### Decisions That Were Made

- **No Database generic on Supabase clients** — Intentional. The hand-written types don't match Supabase's expected generic shape. Use manual casting until proper types are generated.
- **Lazy Stripe initialization** — Required. `new Stripe()` at module scope crashes during static page generation because env vars aren't available at build time.
- **Fonts loaded via `<link>` not `next/font`** — The sandbox environment can't fetch Google Fonts at build time. On Philip's real machine with internet access, `next/font` could be restored.
- **No component library** — Intentional. All styling is custom CSS classes in globals.css for maximum design control.

---

## 7. WHAT'S BEEN BUILT (COMPLETED)

### Phase 1: Backend Architecture (Claude)
- Database schema (5 migration files + combined file)
- TypeScript types mirroring full schema
- Supabase client configuration (browser, server, admin, middleware)
- Auth middleware with route protection
- OAuth callback handler

### Phase 2: Server Actions (Claude)
- Auth actions (signup, signin, OAuth, signout, profile CRUD)
- Business CRUD
- Offer CRUD with search, filter, pagination, full-text search
- Referral lifecycle (submit → accept/reject → report closure → review)
- Notifications (get, mark read)
- Messages (conversations, send, realtime)
- Stripe Connect (account creation, onboarding link, status check)
- Stripe payments (create payment intent, transfer, webhook handling)
- Fraud detection (self-referral block, velocity check, duplicate lead check)
- Dashboard stats (role-aware metrics)
- Admin metrics (platform-wide stats)

### Phase 3: API Routes (Claude)
- `POST /api/stripe/connect` — Create Connect account + onboarding link
- `POST /api/stripe/create-payment` — Create payment intent for accepted referral
- `POST /api/webhooks/stripe` — Handle payment success, account updates, transfers

### Phase 4: Frontend — All Pages (Claude)
- Landing page with hero, how-it-works, business value prop, categories, CTA, footer
- Login page with email + Google OAuth
- Signup page with email confirmation flow
- Onboarding wizard (role → profile → optional business registration)
- Dashboard home with role-aware stats cards
- Browse offers with search, category/state filters, pagination
- Offer detail with commission display and referral submission form
- Create offer with fee structure builder (flat/percentage/both)
- My Offers with active/pause toggle
- My Referrals with status filters and message links
- Incoming Referrals with accept/reject buttons and deal closure flow
- Settings with profile editing and Stripe Connect integration
- Messages with conversation list, real-time chat, and mobile-responsive layout

### Phase 5: Design System (Claude)
- Full CSS design system in globals.css
- Custom color tokens (navy, crimson, forest, slate)
- Button, input, badge, card component classes
- Entrance animations with stagger delays
- Glass card effects, noise texture overlay
- Custom scrollbar styling

---

## 8. WHAT NEEDS TO BE DONE NEXT

### For Cursor (see CURSOR_TASKS_V3.md):
1. **E2E Testing & Bug Fixes** — Critical first step
2. **Loading States, Error Boundaries, Toast Notifications**
3. **Review Submission UI** — The `submitReview()` action exists but no UI
4. **Admin Dashboard** — Actions exist, need UI
5. **Responsive Polish & Mobile Optimization**
6. **Email Notifications** (Resend integration)
7. **Search & Discovery Improvements**
8. **Performance & SEO**
9. **Deployment Preparation**

### For Claude (you):
1. **Review Cursor's work** after each task — check for bugs, security issues, and architectural problems
2. **Supabase type generation** — When Philip is ready, generate proper types with `npx supabase gen types typescript` and update the clients to use typed generics
3. **Middleware migration** — Migrate from deprecated `middleware.ts` to Next.js 16 `proxy` convention
4. **Server-side validation** — Add Zod schemas to all server actions
5. **Security audit** — Review RLS policies, check for injection vectors, ensure proper auth checks
6. **Deployment** — Vercel deployment config, environment variable setup, domain configuration
7. **React Native mobile app** — Future phase, not started

### For Philip:
1. **Configure Google OAuth** in Supabase dashboard (Authentication → Providers → Google)
2. **Configure Stripe Connect** — Create Connect platform settings, get webhook secret
3. **Set up Resend** — Create account, verify domain, get API key
4. **Test the app** end-to-end locally
5. **Choose and configure domain** for production deployment

---

## 9. HOW TO GET STARTED

When you start a new session, do this:

1. **Read the codebase.** Start with these files in order:
   - `src/types/database.ts` — Understand the data model
   - `src/config/constants.ts` — Understand business rules
   - `src/app/globals.css` — Understand the design system
   - `src/lib/actions/` — Skim each action file to understand the API surface
   - `src/app/dashboard/layout.tsx` — Understand the dashboard shell
   - `src/components/Sidebar.tsx` — Understand navigation structure

2. **Ask Philip** what Cursor has done since this handoff. He'll share Cursor's progress report.

3. **Review Cursor's changes** by reading the files Cursor modified and checking for:
   - TypeScript errors
   - Broken imports
   - Missing error handling
   - Security issues (auth checks, RLS bypasses)
   - Design consistency (are they using the established CSS classes?)
   - Mobile responsiveness

4. **Refer to CURSOR_TASKS_V3.md** for the current task list and what comes next.

---

## 10. IMPORTANT PATTERNS

### Server Action Pattern
All server actions follow this pattern:
```ts
"use server";
import { createClient } from "@/lib/supabase/server";

export async function doSomething(data: SomeType) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // ... do work ...

  if (error) return { error: error.message };
  return { data: result };
}
```

### Supabase Client Usage
- **Server Components & Server Actions:** `import { createClient } from "@/lib/supabase/server"`
- **Client Components:** `import { createClient } from "@/lib/supabase/client"`
- **Admin operations (bypass RLS):** `import { createAdminClient } from "@/lib/supabase/server"`

### Stripe Lazy Initialization
```ts
let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }
  return _stripe;
}
```
This is REQUIRED — do not change it to top-level initialization.

### CSS Class Convention
Use the pre-built classes from globals.css:
- Buttons: `btn-primary`, `btn-secondary`, `btn-ghost`
- Inputs: `input-field`, `select-field`, `textarea-field`
- Cards: `bg-surface rounded-xl border border-border p-5`
- Hover: add `card-hover` class
- Headings: add `font-[family-name:var(--font-display)]`
- Status: `badge-{status}` where status is submitted/accepted/rejected/completed/expired

---

## 11. ENVIRONMENT VARIABLES

```
NEXT_PUBLIC_SUPABASE_URL=https://lhubrufdaqkzbnsfntea.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<configured>
SUPABASE_SERVICE_ROLE_KEY=<configured>
STRIPE_SECRET_KEY=sk_test_placeholder
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_placeholder
STRIPE_WEBHOOK_SECRET=whsec_placeholder
NEXT_PUBLIC_SITE_URL=http://localhost:3000
RESEND_API_KEY=re_placeholder
```

Supabase keys are configured. Stripe and Resend are still placeholders.

---

## 12. BUILD & RUN

```bash
cd commission-army
npm install
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run lint         # ESLint
```

Build produces 19 routes with 0 errors. The only warning is the middleware deprecation (non-blocking).

---

*This document was created on February 24, 2026 by Claude Opus. The project is in active development. When in doubt, read the source code — it is the ultimate source of truth.*
