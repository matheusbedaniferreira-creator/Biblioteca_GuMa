# Publica exclusivamente o codigo-fonte da Biblioteca Folha no repositorio escolhido.
# Execute no PowerShell: powershell -ExecutionPolicy Bypass -File .\publicar-github.ps1
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
$repository = 'https://github.com/matheusbedaniferreira-creator/Biblioteca_GuMa.git'

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Error 'Git nao encontrado. Instale o Git for Windows: https://git-scm.com/downloads/win'
    exit 1
}
if (-not (Test-Path '.git')) {
    & git init
    if ($LASTEXITCODE -ne 0) { throw 'Nao foi possivel iniciar o repositorio Git.' }
}
& git branch -M main
if ($LASTEXITCODE -ne 0) { throw 'Nao foi possivel configurar a branch main.' }

& git add -A
if ($LASTEXITCODE -ne 0) { throw 'Falha no git add.' }

$paths = @(& git ls-files --cached)
foreach ($path in $paths) {
    $normalized = ($path -replace '\\', '/')
    if (($normalized -match '(^|/)\.env(\..+)?$' -and $normalized -notmatch '\.env\.example$') -or
        $normalized -match '(?i)(^|/)(id_rsa|id_ed25519|[^/]+\.(pem|p12|pfx|key))$' -or
        $normalized -match '(^|/)(node_modules|vendor|dist)(/|$)') {
        throw "Arquivo potencialmente sensivel identificado no indice do Git: $path. Remova-o do indice antes de publicar."
    }
}

$origin = & git remote get-url origin 2>$null
if ($LASTEXITCODE -ne 0) {
    & git remote add origin $repository
    if ($LASTEXITCODE -ne 0) { throw 'Falha ao adicionar remote origin.' }
} elseif (($origin -ne $repository) -and ($origin -ne 'git@github.com:matheusbedaniferreira-creator/Biblioteca_GuMa.git')) {
    throw "O remote 'origin' aponta para outro endereco ($origin). Verifique antes de publicar."
}

& git diff --cached --quiet
if ($LASTEXITCODE -eq 1) {
    & git commit -m 'feat: biblioteca Folha com React Laravel Supabase e Google Books'
    if ($LASTEXITCODE -ne 0) {
        throw 'Nao foi possivel criar o commit. Configure seu nome/e-mail no Git e execute novamente.'
    }
} elseif ($LASTEXITCODE -ne 0) {
    throw 'Falha ao verificar alteracoes pendentes.'
}

Write-Host "Publicando em $repository" -ForegroundColor Cyan
& git push -u origin main
if ($LASTEXITCODE -ne 0) {
    throw 'Push nao autorizado. Autentique-se na janela do Git Credential Manager ou confira sua permissao de escrita.'
}
Write-Host 'Publicacao concluida. Revise os arquivos no GitHub e verifique o Secret Scanning.' -ForegroundColor Green
