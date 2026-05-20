# FitQuest

FitQuest is a full-stack MVP for private fitness, running, and lifestyle tracking with light RPG-style motivation. It supports individual accounts, onboarding, strength logs, running logs, daily lifestyle logs, XP, levels, coins, streaks, badges, rewards, rule-based coaching, and a family partner dashboard.

The partner dashboard is intentionally privacy-limited. Partners can see XP, level, badges, streaks, weekly completion, encouragements, and milestone summaries. They cannot see exact weights, detailed workout logs, calories, protein totals, alcohol logs, body metrics, or direct raw performance comparisons.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth and Postgres
- Supabase row-level security
- Recharts
- Lucide icons

## Local Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

If Supabase environment variables are not configured, FitQuest runs in local demo mode with seeded father-son demo data stored in browser local storage.

## Put It Online

The simplest MVP hosting setup is Vercel + Supabase.

1. Push this `fitquest` folder to a GitHub repository.
2. Create a Supabase project.
3. Run the full contents of `supabase/schema.sql` in the Supabase SQL editor. If you already ran an older version, run the latest file again so the onboarding and invite-code changes are added.
4. Optional: run `supabase/seed.sql` for demo baseline data. The seed starts both users at 0 XP, level 1, 0 coins, and no earned badges.
5. In Supabase Auth settings, add your deployed Vercel URL to the allowed redirect URLs.
6. Create a Vercel project from the GitHub repository.
7. Add these Vercel environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

8. Deploy. Share the Vercel URL with your father.
9. Each of you creates an account, completes onboarding, and connects through the family invite-code flow.

For a real shared account setup, do not rely on local demo mode. Demo mode is only for previewing the product on one browser.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase project values:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Supabase Configuration

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Run `supabase/seed.sql` if you want demo rows in the database.
4. Add the Supabase URL and anon key to `.env.local`.
5. Restart the Next.js dev server.

If the app was already connected to Supabase before the invite-code update, rerun the latest `supabase/schema.sql`. The current schema adds:

- `profiles.onboarding_completed`
- nullable pending invite receivers in `partner_connections`
- `accept_partner_invite(...)`
- the privacy-safe partner summary RPC used by the family dashboard
- explicit API grants for authenticated Supabase users

The schema creates these MVP tables:

- `profiles`
- `partner_connections`
- `strength_workouts`
- `strength_exercises`
- `running_workouts`
- `daily_lifestyle_logs`
- `tasks`
- `badges`
- `user_badges`
- `rewards`
- `reward_purchases`
- `xp_transactions`
- `encouragements`

It also creates `get_partner_summaries()`, a safe summary RPC for partner dashboards, and `accept_partner_invite(...)`, which lets a logged-in user accept a pending invite code.

## Database Privacy Rules

RLS is enabled across the app tables.

- Users can read and write their own profile and detailed records.
- Partners can read connection records involving themselves.
- Detailed strength, running, nutrition, and alcohol logs are not exposed to partners.
- Partner summaries are served through `get_partner_summaries()`, which returns only gamified summary fields.
- Relative strength is shown as a normalized age/bodyweight score, not as exact partner workout logs.

## MVP Features

- Signup and login with Supabase Auth when configured
- Local demo mode when Supabase is not configured
- Mandatory onboarding for real accounts before entering the app
- Invite-code family connection flow for real accounts
- Onboarding for name, nickname, goals, gym level, running level, targets, alcohol goal, and workout split
- Dashboard with tasks, XP, level, streak, coins, badges, PRs, charts, lifestyle summary, partner summary, and coaching
- Strength logging with volume, estimated 1RM, and PR calculations
- Running logs with pace, best 5K estimate, weekly volume, and 5K progress
- Lifestyle logs for calories, protein, water, and alcohol-free days
- Dynamic daily tasks based on user profile and recent history
- XP, levels, coins, streaks, badges, and a custom rewards shop
- Family dashboard with safe gamified comparisons only
- Family relative strength graph using age and bodyweight class normalization
- Rule-based weekly coaching

## Demo Accounts

Local demo mode includes:

- Max: advanced gym level, can run 5K slowly
- Peter: beginner gym level

Use `/auth` or `/settings` to switch between demo users. Demo users start with no XP, no coins, no streak, and no earned badges. Baseline workout logs remain so analytics and the relative strength chart have data to display.

## MVP Limitations

- Demo mode persists in browser local storage only.
- Supabase writes are implemented for the core MVP tables, but production-grade conflict handling and offline sync are not included.
- Partner summaries are privacy-safe in the UI and backed by a safe SQL RPC, but the app currently uses local demo state unless Supabase is configured.
- Coaching is rule-based and does not call a paid AI API.
- Workout progression is simple and should be reviewed before using for injury-sensitive training.

## Future Feature Ideas

- Real AI coaching API
- Strava integration
- Apple Health integration
- Garmin integration
- More family members
- Shared family challenges
- More advanced progression algorithms
- Nutrition detail tracking
- Mobile app version
