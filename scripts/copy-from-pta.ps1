# One-time: copy Phase 1 base from E:\e-PTA if it exists
$src = "E:\e-PTA"
$dst = "E:\e-PTW"
if (-not (Test-Path $src)) { Write-Host "No $src"; exit 0 }
robocopy $src $dst /E /XD node_modules .next .git /XF .env /NFL /NDL /NJH /NJS /nc /ns /np
Write-Host "Copy done."
