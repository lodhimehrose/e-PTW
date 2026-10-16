# Initialize git and push to GitHub (lodhimehrose/e-PTW). Uses E:\temp for git/npm temp files.
$ErrorActionPreference = "Stop"
$env:TEMP = "E:\temp"
$env:TMP = "E:\temp"
New-Item -ItemType Directory -Force -Path $env:TEMP | Out-Null
Set-Location "E:\e-PTW"

if (-not (Test-Path ".git")) {
  git init -b main
}

git add -A
$status = git status --porcelain
if ($status) {
  git commit -m "SMA e-Permit Portal — phases 2-6"
}

$remote = "https://github.com/lodhimehrose/e-PTW.git"
$hasOrigin = git remote | Select-String -Pattern "^origin$" -Quiet
if (-not $hasOrigin) {
  git remote add origin $remote
} else {
  git remote set-url origin $remote
}

git push -u origin main
