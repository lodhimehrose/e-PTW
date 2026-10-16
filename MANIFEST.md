# E:\e-PTW — project manifest

Canonical SMA e-Permit Portal (phases 1–6). Timezone: **Asia/Dubai** (`lib/constants.ts`).

## App routes

| Path | Purpose |
|------|---------|
| `/` | Landing |
| `/gate-pass`, `/ptw/standard`, `/ptw/emergency` | Public forms |
| `/submitted/[ref]` | Thank-you |
| `/status` | Status lookup |
| `/verify/[token]` | Public permit verification + masked EID |
| `/admin/login` | Supabase auth (ADMIN_EMAIL only via middleware) |
| `/admin` | Dashboard |
| `/admin/submissions`, `/admin/submissions/[id]` | List, filters, Excel export, approve/reject, audit |
| `/admin/qr` | QR posters for forms |
| `/admin/settings` | Recipients, buildings, permit limits |

## API

| Route | Purpose |
|-------|---------|
| `/api/status` | POST status check |
| `/api/admin/export` | Excel export |
| `/api/cron/daily` | Vercel cron — expire overdue, email ADMIN_EMAIL |

## Server actions

- `app/actions/submissions.ts` — submit, uploads, PDF, Resend (contractor + admin)
- `app/actions/admin.ts` — decisions, approved PDF + QR, revalidation, gate log, settings

## Lib

- `lib/pdf/` — `@react-pdf/renderer` documents + render
- `lib/storage.ts` — Supabase `submissions` bucket
- `lib/email/send.ts` — Resend
- `lib/working-days.ts` — Dubai timezone helpers

## Supabase

- `migrations/001_initial_schema.sql`
- `migrations/002_storage_bucket.sql`
- `seed.sql`

## Scripts (E: drive temp/npm)

- `scripts/setup.ps1` — main setup
- `scripts/sync-missing-from-pta.ps1` — copy missing files from `E:\e-PTA`
- `scripts/git-init-push.ps1` — git init + push to GitHub
