# Push to GitHub (lodhimehrose only)

Your **personal** GitHub (Muhammad Shaheer Lodhi) is not used. Use the **lodhimehrose** account.

## One-time setup

1. Free **~500 MB on C:** or set Windows **TEMP** / **TMP** to `E:\temp` (required for git/npm on this PC).
2. In PowerShell:

```powershell
cd E:\e-PTW
.\scripts\sync-pta-forms.ps1   # if E:\e-PTA still exists
.\scripts\bootstrap.ps1
```

3. Create repo **e-PTW** on https://github.com/lodhimehrose (empty, no README).

4. Push:

```powershell
cd E:\e-PTW
$env:TEMP="E:\temp"; $env:TMP="E:\temp"
git init -b main
git add -A
git commit -m "SMA e-Permit Portal — admin, emails, PDFs, uploads"
git remote add origin https://github.com/lodhimehrose/e-PTW.git
git push -u origin main
```

When prompted, sign in as **lodhimehrose@gmail.com** (browser or PAT).

## Vercel

- Import **lodhimehrose/e-PTW**
- Environment variables from `.env.example`
- Add `CRON_SECRET` for daily job

## Supabase

- Run both SQL migrations in `supabase/migrations/`
- Auth user: **lodhimehrose@gmail.com** with password you choose
- `ADMIN_EMAIL=lodhimehrose@gmail.com`
