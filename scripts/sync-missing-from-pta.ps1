# Copy files from E:\e-PTA to E:\e-PTW only when the destination does not exist.
$ErrorActionPreference = "Stop"
$srcRoot = "E:\e-PTA"
$dstRoot = "E:\e-PTW"

if (-not (Test-Path $srcRoot)) {
  Write-Host "Source $srcRoot not found — skip sync."
  exit 0
}

$skipPattern = '(\\node_modules\\|\\\.next\\|\\\.git\\)'

$copied = 0
Get-ChildItem -Path $srcRoot -Recurse -File | ForEach-Object {
  if ($_.FullName -match $skipPattern) { return }
  $rel = $_.FullName.Substring($srcRoot.Length).TrimStart('\')
  $dest = Join-Path $dstRoot $rel
  if (-not (Test-Path $dest)) {
    $dir = Split-Path $dest -Parent
    if (-not (Test-Path $dir)) {
      New-Item -ItemType Directory -Force -Path $dir | Out-Null
    }
    Copy-Item -LiteralPath $_.FullName -Destination $dest
    $copied++
    Write-Host "  + $rel"
  }
}

Write-Host "Copied $copied missing file(s) from e-PTA to e-PTW."
