# SMA e-Permit Portal — local setup (npm/temp on E: drive, not C:)
$ErrorActionPreference = "Stop"

$temp = "E:\temp"
$npmCache = "E:\npm-cache"
New-Item -ItemType Directory -Force -Path $temp, $npmCache | Out-Null

$env:TEMP = $temp
$env:TMP = $temp
$env:TMPDIR = $temp
$env:npm_config_cache = $npmCache

Set-Location "E:\e-PTW"

if (Test-Path "E:\e-PTA") {
  Write-Host "Copying missing source files from E:\e-PTA..."
  & "$PSScriptRoot\sync-missing-from-pta.ps1"
}

if (-not (Test-Path "node_modules")) {
  Write-Host "npm install (cache: $npmCache)..."
  npm install
} else {
  Write-Host "node_modules present — run 'npm install' manually if dependencies changed."
}

Write-Host ""
Write-Host "Done."
Write-Host "  1. Copy .env.example to .env and fill Supabase + Resend keys."
Write-Host "  2. Run SQL migrations in supabase/migrations/ (and optional seed.sql)."
Write-Host "  3. npm run dev"
