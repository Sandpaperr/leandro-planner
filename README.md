# Leandro's Planner

A personal planning system with Quarterly, Weekly and Daily tabs, plus a Report
tab showing Wheel of Life trends and an archive of every past entry.

## Running it

```bash
npm install
npm run dev      # local dev server
npm run build    # type-check + production build
npm run lint
```

## How storage works

Everything you type is saved automatically (debounced, no save button) to
`localStorage` in your browser, keyed by period:

- `daily-2026-08-14` — one doc per day
- `weekly-2026-W33` — one doc per ISO week
- `quarterly-2026-Q3` — one doc per quarter

The **Report** tab reads these docs and renders trends and archives, and has
**Export / Import JSON** buttons for backups. With no further setup the app is
fully functional, local-only.

## Optional: sync across devices (Supabase, free tier)

1. Create a free project at [supabase.com](https://supabase.com) (any name/region).
2. In the project: **SQL Editor → New query**, paste the contents of
   [`supabase/schema.sql`](supabase/schema.sql), and run it. This creates the
   `entries` table with row-level security (each user can only read/write
   their own rows).
3. In **Authentication → Sign In / Up**, make sure the Email provider is enabled
   (it is by default). In **Authentication → URL Configuration**, set the Site URL
   to wherever you host the app (or `http://localhost:5173` for dev).
4. Copy `.env.example` to `.env` and fill in the two values from
   **Project Settings → API**: the project URL and the `anon` public key.
   (The anon key is safe to expose in the client — row-level security is what
   protects the data.)
5. Restart the dev server / rebuild. A sync bar appears under the header:
   enter your email, click the magic link it sends you, and you're synced.

Sync is local-first: every edit is written to `localStorage` immediately and
mirrored to Supabase in the background. On sign-in, local and remote entries
are merged with newest-wins per entry, so you can work offline and sync later.

Note: on the Supabase free tier a project pauses after about a week with no
API activity; using the planner (or opening the dashboard) keeps it active,
and a paused project can be resumed from the dashboard without data loss.
