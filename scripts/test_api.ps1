$base = 'http://localhost:5173/api'
Write-Host '1/3 - Servico API' -ForegroundColor Cyan
Invoke-RestMethod "$base/health" | ConvertTo-Json
Write-Host '2/3 - Catalogo publico' -ForegroundColor Cyan
try { $c = Invoke-RestMethod "$base/livros"; Write-Host "Quantidade: $($c.total)" } catch { Write-Host "Falha no banco: $($_.Exception.Message)" -ForegroundColor Yellow }
Write-Host '3/3 - Sessao sem login (401 esperado)' -ForegroundColor Cyan
try { Invoke-WebRequest "$base/auth/me" -UseBasicParsing | Out-Null; Write-Host 'ATENCAO: rota autenticada retornou 200!' } catch { Write-Host "Requisicao de sessao recusada sem login, conforme esperado." }
