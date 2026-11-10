$root = Split-Path -Parent $PSScriptRoot
if (!(Test-Path "$root\backend\.env")) { Copy-Item "$root\backend\.env.example" "$root\backend\.env" }
if (!(Test-Path "$root\frontend\.env")) { Copy-Item "$root\frontend\.env.example" "$root\frontend\.env" }
Write-Host "Arquivos .env preparados. Preencha suas credenciais Supabase e execute: docker compose up --build"
