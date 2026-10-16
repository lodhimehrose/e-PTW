# Final test checklist (all phases)

Use **E:\e-PTW** and production URL after Vercel deploy.

## Before testing

- [ ] Supabase: `001_initial_schema.sql` + `002_storage_bucket.sql` (+ optional `seed.sql`)
- [ ] Supabase Auth user: `lodhimehrose@gmail.com`
- [ ] Vercel env vars set (see `GITHUB_AND_VERCEL.md`)
- [ ] Resend domain verified

## Public

- [ ] `/` — three form buttons
- [ ] Standard PTW — submit with signature + document upload → ref no. + email
- [ ] Emergency PTW — URGENT in admin list
- [ ] Gate Pass — link PTW ref, workers, signature, upload
- [ ] `/status` — ref + email
- [ ] `/submitted/[ref]` — thank you + gate pass link for PTW

## Admin (`lodhimehrose@gmail.com`)

- [ ] `/admin/login` — wrong email rejected
- [ ] Dashboard counts
- [ ] Submissions — filter, search, Excel export
- [ ] Open submission — PDF link, approve / reject / conditions
- [ ] Approved PDF + `/verify/[token]` VALID
- [ ] Standard PTW — daily revalidation
- [ ] Gate Pass — gate log
- [ ] `/admin/qr` — copy links, download QR
- [ ] `/admin/settings` — recipients, admin name, buildings

## Cron

- [ ] Vercel cron hits `/api/cron/daily` with `CRON_SECRET` (see `vercel.json`)
