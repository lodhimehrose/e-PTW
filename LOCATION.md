# Project location: E:\e-PTW

This is the **only** folder you need. Full app (phases 1–6): ~87 files.

## e-PTA vs e-PTW

| Folder | What it is |
|--------|------------|
| **`E:\e-PTW`** | **KEEP** — full portal (forms, admin, PDF, email, uploads, setup docs) |
| **`E:\e-PTA`** | **DELETE** — old Phase 1 scaffold (~46 files); safe to remove after checking e-PTW |
| **`C:\Users\...\projects\e-PTW`** | **DELETE or ignore** — Cursor stub, not the real project |

## Before you delete e-PTA

1. In Cursor: **File → Open Folder → `E:\e-PTW`**
2. Confirm you see: `app\admin`, `SETUP_FROM_SCRATCH.md`, `supabase\PASTE_THIS_IN_SUPABASE.sql`
3. Then delete **`E:\e-PTA`** in File Explorer (optional: empty Recycle Bin)

## npm / temp on E:

Run `.\scripts\setup.ps1` so npm and Windows temp use **`E:\temp`** and **`E:\npm-cache`**, not C:.
