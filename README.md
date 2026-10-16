# SMA e-Permit Portal

Sharjah Maritime Academy (SMA) — contractor Gate Pass & Permit to Work (e-PTW).

**Project folder:** `E:\e-PTW`  
**Admin email:** `lodhimehrose@gmail.com` (set in `ADMIN_EMAIL`)

> **New to setup?** Start here: **[SETUP_FROM_SCRATCH.md](./SETUP_FROM_SCRATCH.md)**  
> **Database:** copy **`supabase/PASTE_THIS_IN_SUPABASE.sql`** into Supabase SQL Editor and click Run (one time).

## 1. Supabase

1. Create a project (or use your linked org).
2. SQL Editor → run in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_storage_bucket.sql`
   - Optional: `supabase/seed.sql`
3. **Authentication → Users → Add user**  
   - Email: `lodhimehrose@gmail.com`  
   - Password: (your choice)  
   Only this email can access `/admin` (enforced in `middleware.ts`).
4. **Settings → API** — copy URL, anon key, service role key.

## 2. Environment variables

Copy `.env.example` → `.env` locally. On **Vercel**, add the same variables:

| Variable | Notes |
|----------|--------|
| `NEXT_PUBLIC_SITE_URL` | Vercel production URL |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only — never expose to client |
| `RESEND_API_KEY` | From [resend.com](https://resend.com) |
| `EMAIL_FROM` | Verified sender in Resend |
| `ADMIN_EMAIL` | `lodhimehrose@gmail.com` — receives new submissions & daily summary |
| `NEXT_PUBLIC_ADMIN_EMAIL` | Same email — blocks other logins on `/admin/login` |
| `CRON_SECRET` | Random string; set in Vercel for cron |

See **[GITHUB_AND_VERCEL.md](./GITHUB_AND_VERCEL.md)** for push/deploy using the **lodhimehrose** GitHub account only.

## 3. Local run (uses E: drive for npm cache)

```powershell
cd E:\e-PTW
.\scripts\setup.ps1
npm run dev
```

## 4. GitHub (lodhimehrose — not your personal account)

Use the **lodhimehrose** GitHub account in browser / `gh auth login` for this repo only.

```powershell
cd E:\e-PTW
.\scripts\git-init-push.ps1
```

Create the empty repo `e-PTW` on GitHub under **lodhimehrose** if it does not exist.

## 5. Vercel

- Import `lodhimehrose/e-PTW` from GitHub.
- Add all env vars.
- Cron: `vercel.json` runs daily at 03:00 UTC (07:00 Dubai).

## 6. Resend

Verify your sending domain; set `EMAIL_FROM` to an address on that domain.

## Features

- Public forms: Gate Pass, Standard PTW, Emergency PTW (drafts, validation, signature, uploads)
- Emails + PDF on submit; admin notification to `ADMIN_EMAIL`
- Admin: login, dashboard, submissions, approve/reject, revalidation, gate log, QR links, settings, Excel export
- `/verify/[token]` public permit check with masked Emirates ID
- Daily cron: expire overdue permits + email summary

Place your logo at `public/sma-logo.png` (or keep `public/sma-logo.svg`).
