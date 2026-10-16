# GitHub & Vercel (lodhimehrose account only)

Do **not** use your personal GitHub (**muhammad shaheer lodhi**) for this repo. Use **lodhimehrose@gmail.com** only.

## 1. Create the repo (once)

1. Sign in to GitHub as **lodhimehrose**.
2. New repository → name **`e-PTW`** → Private or Public → **no** README (code is already on E:).
3. URL: `https://github.com/lodhimehrose/e-PTW`

## 2. Push from your PC

Free a little space on **C:** or set Windows **TEMP** / **TMP** to `E:\temp`, then:

```powershell
powershell -File E:\e-PTW\scripts\git-init-push.ps1
```

When prompted for credentials, use **lodhimehrose** (Personal Access Token with `repo` scope, not your main account).

## 3. Vercel

1. Log in to [vercel.com](https://vercel.com) with the same GitHub account that owns **lodhimehrose/e-PTW** (or import that repo from a Vercel team linked to lodhimehrose).
2. **Import** `lodhimehrose/e-PTW`.
3. Root directory: `.` (default).
4. Add **all** variables from `.env.example` (especially `ADMIN_EMAIL`, `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`).
5. Deploy. Set `NEXT_PUBLIC_SITE_URL` to your production URL and redeploy once.

## 4. Supabase ↔ GitHub

If Supabase GitHub integration is enabled, it only syncs migrations — you still need to run SQL in the Supabase dashboard for the linked project:

- `001_initial_schema.sql`
- `002_storage_bucket.sql`
- optional `seed.sql`

Create auth user **lodhimehrose@gmail.com** in Supabase Authentication.

## 5. Resend

- Verify domain at resend.com.
- Set `EMAIL_FROM` to that domain.
- Approval and submission emails go to contractors and **lodhimehrose@gmail.com** (`ADMIN_EMAIL`).
