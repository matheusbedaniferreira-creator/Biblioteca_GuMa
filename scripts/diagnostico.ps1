$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
Write-Host "=== Diagnostico Folha Biblioteca ===" -ForegroundColor Cyan
if (!(Get-Command docker -ErrorAction SilentlyContinue)) { Write-Host "Docker nao encontrado" -ForegroundColor Red; exit 1 }
if (!(Test-Path "backend/.env")) { Write-Host "Falta backend/.env (rode .\scripts\setup.ps1)" -ForegroundColor Yellow }
docker compose ps
try {
    $response = Invoke-RestMethod 'http://localhost:5173/api/health' -TimeoutSec 8
    Write-Host "API responde: $($response.ok)" -ForegroundColor Green
} catch {
    Write-Host "API indisponivel: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "Examine: docker compose logs --tail=100 api"
}
