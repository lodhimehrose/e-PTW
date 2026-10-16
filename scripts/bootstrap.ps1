$ErrorActionPreference = "Stop"
New-Item -ItemType Directory -Force -Path "E:\temp","E:\npm-cache" | Out-Null
$env:TEMP = "E:\temp"
$env:TMP = "E:\temp"
$env:npm_config_cache = "E:\npm-cache"

Set-Location "E:\e-PTW"

& "$PSScriptRoot\setup.ps1"
