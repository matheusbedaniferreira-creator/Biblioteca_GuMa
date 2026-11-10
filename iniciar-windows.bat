@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ==============================================
echo    FOLHA BIBLIOTECA - WINDOWS
 echo ==============================================
where docker >nul 2>nul
if errorlevel 1 (
  echo ERRO: Docker nao instalado. Abra o tutorial TUTORIAL_WINDOWS.md
  pause
  exit /b 1
)
if not exist "backend\.env" copy "backend\.env.example" "backend\.env" >nul
if not exist "frontend\.env" copy "frontend\.env.example" "frontend\.env" >nul
findstr /c:"SEU_PROJECT_REF" "backend\.env" >nul
if not errorlevel 1 (
  echo ATENCAO: backend\.env ainda tem valores de exemplo.
  echo Configure suas credenciais Supabase antes de testar cadastro e catalogo.
  echo.
)
echo Iniciando containers. Acesse http://localhost:5173
 echo.
docker compose up --build
if errorlevel 1 (
 echo.
 echo Erro ao iniciar. Abra Docker Desktop e consulte TUTORIAL_WINDOWS.md
 pause
 exit /b 1
)
