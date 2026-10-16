# SMA e-Permit Portal — setup from scratch (everything on **E:** drive)

This guide assumes:

- Your project folder is **`E:\e-PTW`** (not C:).
- Admin email: **`lodhimehrose@gmail.com`**
- GitHub for this project: account **lodhimehrose** only (not your personal “muhammad shaheer lodhi” account).

---

## Which E: folder to keep?

| Folder | Action |
|--------|--------|
| **`E:\e-PTW`** | **Use this one** — complete app |
| **`E:\e-PTA`** | **Delete** after you open e-PTW and confirm it has `app\admin` (old copy, incomplete) |

Both names exist because work started in **e-PTA** and the full build was finished in **e-PTW**. There is nothing important left only in e-PTA.

---

## Part A — Open the project in Cursor

1. Open **Cursor**.
2. **File → Open Folder**.
3. Choose **`E:\e-PTW`** (not e-PTA).
4. You should see folders like `app`, `components`, `supabase`, `scripts`, and file **`SETUP_FROM_SCRATCH.md`** (this file).

If you only see 2 files and no `app\admin`, you opened the wrong folder — use **`E:\e-PTW`**.

---

## Part B — C: drive full: move TEMP/TMP to E: (do this first)

### What are TEMP and TMP?

Windows, **npm**, **git**, and **Cursor** write short-lived files to folders named **TEMP** and **TMP**. By default those point to something like:

`C:\Users\YourName\AppData\Local\Temp`

If **C: is full**, installs fail with errors like **“no space left on device”** or **ENOSPC** — even when your project is on **E:\e-PTW**.

**Fix:** tell Windows to use **`E:\temp`** instead of C: for those temp files. Your project and `node_modules` can stay on E:; only scratch files move.

### Step 1 — Create the folder on E:

1. Open **File Explorer** (folder icon on taskbar).
2. Click **This PC** → open drive **E:**
3. Right-click empty space → **New** → **Folder**.
4. Name it exactly: **`temp`**
5. Full path should be: **`E:\temp`**

### Step 2 — Change TEMP and TMP (User variables)

1. Press **Windows key**, type **`environment`**, open **“Edit environment variables for your account”**  
   *(Or: **Win + R** → type `sysdm.cpl` → Enter → tab **Advanced** → button **Environment Variables**.)*
2. In the **top** box (**User variables for …**), look for **TEMP** and **TMP**.
3. **TEMP**
   - If it exists: select **TEMP** → **Edit** → **New value** (or replace): **`E:\temp`** → OK  
   - If it does **not** exist: **New** → Variable name: **`TEMP`** → Variable value: **`E:\temp`** → OK
4. **TMP** — same as TEMP: value **`E:\temp`**
5. Click **OK** on all windows to save.

You do **not** need to change **System variables** (bottom box) unless IT locked your user settings.

### Step 3 — Restart programs

1. **Close Cursor completely** (File → Exit, or quit from system tray).
2. Close any open **PowerShell** windows.
3. Open **Cursor** again and open folder **`E:\e-PTW`**.

### Step 4 — Optional: npm cache on E: (recommended)

When you run **`.\scripts\setup.ps1`**, it already sets npm cache to **`E:\npm-cache`** for that session. After TEMP/TMP are fixed, always install from:

```powershell
cd E:\e-PTW
.\scripts\setup.ps1
```

### Step 5 — Still failing?

Free a **little** space on C: if you can (does not have to be huge):

- Empty **Recycle Bin**
- **Settings → Storage** → Temporary files → remove safe items
- Move large downloads off C:

Even **300–500 MB** free on C: sometimes helps Windows itself.

### Quick test (after restart)

New **PowerShell**:

```powershell
echo $env:TEMP
echo $env:TMP
```

Both should show **`E:\temp`** (not a path under `C:\`).

---

## Part C — Install Node.js (once)

1. Go to [https://nodejs.org](https://nodejs.org).
2. Download the **LTS** version (20.x or 22.x).
3. Install. Default options are fine.
4. Open **PowerShell** and check:

```powershell
node -v
npm -v
```

You should see version numbers.

---

## Part D — Install project dependencies (on E: only)

1. Open **PowerShell**.
2. Run:

```powershell
cd E:\e-PTW
.\scripts\setup.ps1
```

This puts npm cache on **`E:\npm-cache`** and temp on **`E:\temp`**.

Wait until it finishes (may take several minutes).

3. Test locally:

```powershell
npm run dev
```

4. Open browser: **http://localhost:3000**  
   You should see the SMA e-Permit Portal home page.

Press **Ctrl+C** in PowerShell to stop the server when done testing.

---

## Part E — Supabase (database) — step by step

### E1. Create a Supabase project

1. Go to [https://supabase.com](https://supabase.com) and sign in.
2. **New project** (pick your organization).
3. Name: e.g. `sma-e-permit`.
4. Choose a **database password** — save it somewhere safe.
5. Region: choose closest to UAE if available.
6. Wait until the project status is **Healthy** (green).

### E2. Run the database SQL (easiest way)

You do **not** need to open small migration files separately. Use **one** file on your E: drive:

**File location on your PC:**

`E:\e-PTW\supabase\PASTE_THIS_IN_SUPABASE.sql`

**How to open that file:**

1. Press **Win + E** (File Explorer).
2. Go to **`E:\e-PTW\supabase`**.
3. Right-click **`PASTE_THIS_IN_SUPABASE.sql`** → **Open with** → **Notepad** (or Cursor).
4. Press **Ctrl+A** (select all), then **Ctrl+C** (copy).

**In Supabase website:**

1. Open your project.
2. Left menu: **SQL Editor**.
3. Click **New query**.
4. Click in the big text box, press **Ctrl+V** (paste).
5. Click **Run** (or Ctrl+Enter).
6. Bottom should say **Success** (green). If you see errors, copy the error text and fix before continuing.

This creates all tables, reference-number function, and the **submissions** storage bucket.

### E3. Copy Supabase API keys

1. In Supabase: **Project Settings** (gear icon) → **API**.
2. Copy and save in Notepad temporarily:
   - **Project URL** → you will put this in `.env` as `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`  
     ⚠️ **Never** share service_role or put it in GitHub. Server-only.

### E4. Create your admin login user

1. Supabase left menu: **Authentication** → **Users**.
2. **Add user** → **Create new user**.
3. Email: **`lodhimehrose@gmail.com`**
4. Password: choose a strong password (you use this on `/admin/login`).
5. Enable **Auto Confirm User** if you see that option (so you can log in immediately).

Only this email can use the admin panel (enforced by the app).

### E5. (Optional) Check tables exist

1. Supabase → **Table Editor**.
2. You should see tables such as: `submissions`, `workers`, `settings`, `audit_log`.

---

## Part F — Create your `.env` file (on E:)

1. In File Explorer: **`E:\e-PTW`**.
2. Copy file **`.env.example`** → paste in same folder → rename copy to **`.env`**  
   (If you don’t see `.env.example`, in Explorer turn on **View → Show → Hidden items**.)
3. Open **`.env`** in Notepad and fill in:

| Line | What to put |
|------|-------------|
| `NEXT_PUBLIC_SITE_URL` | For local test: `http://localhost:3000`. After Vercel deploy: your `https://….vercel.app` URL |
| `NEXT_PUBLIC_SUPABASE_URL` | From Supabase API page |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key |
| `ADMIN_EMAIL` | `lodhimehrose@gmail.com` |
| `NEXT_PUBLIC_ADMIN_EMAIL` | `lodhimehrose@gmail.com` |
| `RESEND_API_KEY` | From Resend (Part G) — can leave empty for first DB test |
| `EMAIL_FROM` | Your verified sender in Resend — can use Resend test domain while testing |
| `CRON_SECRET` | Any long random string, e.g. `my-secret-cron-8f3k2j9d7s1a` |

4. Save the file.

5. Run again:

```powershell
cd E:\e-PTW
npm run dev
```

6. Submit a test **Emergency PTW** form. If Supabase is correct, you get a reference number like **EPTW-2026-0001**.

---

## Part G — Resend (emails)

1. Go to [https://resend.com](https://resend.com) and sign up / log in.
2. **API Keys** → Create → copy key → paste into `.env` as `RESEND_API_KEY`.
3. **Domains** → add your domain and follow DNS steps (or use Resend’s test sender for early tests).
4. Set `EMAIL_FROM` to an address on that domain (e.g. `permits@yourdomain.com`).

When working:

- Contractor gets email on submit + on approve/reject.
- **lodhimehrose@gmail.com** gets email on every new submission.

---

## Part H — GitHub (lodhimehrose account only)

1. Log out of GitHub in browser if you are on your **personal** account.
2. Log in as **lodhimehrose** (or the account that owns this repo).
3. **New repository** → name: **`e-PTW`** → **do not** add README (empty repo).
4. On your PC:

```powershell
cd E:\e-PTW
powershell -File .\scripts\git-init-push.ps1
```

5. When Git asks for login, use **lodhimehrose** and a **Personal Access Token** (GitHub → Settings → Developer settings → Personal access tokens → Generate, scope **repo**).

Do **not** use your main GitHub account for this repo.

More detail: **`E:\e-PTW\GITHUB_AND_VERCEL.md`**

---

## Part I — Vercel (live website)

1. Go to [https://vercel.com](https://vercel.com) and sign in with **lodhimehrose** GitHub (or import that repo).
2. **Add New Project** → import **`lodhimehrose/e-PTW`**.
3. Framework: **Next.js** (auto-detected).
4. **Environment Variables** — add **every** line from your `.env` (same names and values).
5. Deploy.
6. Copy the production URL (e.g. `https://e-ptw-xxx.vercel.app`).
7. In Vercel → Project → Settings → Environment Variables → set  
   `NEXT_PUBLIC_SITE_URL` = that URL → **Redeploy**.

Cron (daily email at 07:00 Dubai) is already in `vercel.json`; Vercel will call `/api/cron/daily` if `CRON_SECRET` is set.

---

## Part J — Test everything (checklist)

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open `/` | Three form buttons |
| 2 | Submit **Emergency PTW** | Thank-you page + ref number |
| 3 | Check email | Message to contractor + **lodhimehrose@gmail.com** |
| 4 | `/admin/login` | Login with lodhimehrose@gmail.com + Supabase password |
| 5 | Dashboard | Pending submission listed |
| 6 | Open submission → **Approve** | Status approved; contractor emailed |
| 7 | Link on PDF / admin | `/verify/...` shows **VALID** |
| 8 | Submit **Standard PTW** then **Gate Pass** with PTW ref | Gate pass links to permit |
| 9 | `/admin/qr` | QR codes for forms |
| 10 | `/admin/settings` | Notification emails, buildings, your name |

---

## Part K — SMA logo

Replace or add:

- **`E:\e-PTW\public\sma-logo.png`** (your real logo)

The site currently uses `public/sma-logo.svg` as a placeholder.

---

## Quick reference — important paths on E:

| What | Path |
|------|------|
| Project | `E:\e-PTW` |
| SQL to paste in Supabase | `E:\e-PTW\supabase\PASTE_THIS_IN_SUPABASE.sql` |
| Environment template | `E:\e-PTW\.env.example` → copy to `.env` |
| Install script | `E:\e-PTW\scripts\setup.ps1` |
| Git push script | `E:\e-PTW\scripts\git-init-push.ps1` |

---

## If something fails

| Problem | What to try |
|---------|-------------|
| `ENOSPC` / no space | Set TEMP/TMP to `E:\temp`, free C: space, restart Cursor |
| Form submit error | Check `.env` Supabase keys; re-run SQL in Supabase |
| Cannot log in to admin | User must exist in Supabase Auth with **lodhimehrose@gmail.com** |
| No emails | Check `RESEND_API_KEY` and `EMAIL_FROM`; see Resend logs |
| Upload/PDF errors | Confirm SQL created storage bucket `submissions` |

For GitHub/Vercel only: **`GITHUB_AND_VERCEL.md`**.
