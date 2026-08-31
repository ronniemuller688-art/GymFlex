# GymFlex — Project Context

GymFlex is a SaaS where gyms offer attendance-based membership pricing: members pay less the more they visit.

## Locked product decisions

- **Tiers (5, based on monthly visit count):**
  | Tier | Visits | Price (CHF) |
  |---|---|---|
  | Starter | 0–2 | 129 |
  | Regular | 3–7 | 109 |
  | Active | 8–12 | 89 |
  | Committed | 13–19 | 69 |
  | Champion | 20+ | 49 |
- Visit counts reset on the 1st of every month.
- A member's new tier price kicks in the **following** month (not the current one).
- Members have a **3-month minimum commitment**.
- Gyms set their own prices within guardrails:
  - Minimum entry (Starter) price: CHF 99
  - Minimum Champion price: CHF 39
  - Minimum gap between adjacent tiers: CHF 15
- Check-in is via **QR code with GPS verification** — member must be within 200m of the gym.
- **No member pause** for MVP.

## Tech stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Supabase (Postgres database + auth)
- Stripe (billing)
- Resend (transactional email)
- Deployment: Vercel

## Database schema

- **gyms**: id, name, email, address, lat, lng, plan (starter/growth/pro), stripe_customer_id, created_at
- **members**: id, gym_id, name, email, stripe_customer_id, stripe_subscription_id, status (active/cancelled), created_at
- **visits**: id, member_id, gym_id, visited_at
- **tiers**: id, gym_id, name, min_visits, max_visits, price_chf
- **member_tiers**: id, member_id, gym_id, month (YYYY-MM), tier_id, price_chf

Migration source of truth: [supabase/migrations/0001_init_schema.sql](supabase/migrations/0001_init_schema.sql). RLS is enabled on all tables.

## Seed data

Seeded via `node scripts/seed.mjs` (requires `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`, since RLS blocks anon inserts):
- 1 test gym: **FitZone Zurich**
- 5 default tiers matching the pricing table above
- 2 test members: Anna Meier, Luca Bernasconi

## Status

Backend/schema only — no UI has been built yet.
