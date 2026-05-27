@echo off
title Astroteca Dev Server
cd /d "%~dp0"

echo.
echo  Iniciando Astroteca...
echo.

:: Abre o browser apos 4 segundos (tempo para o servidor subir)
start "" cmd /c "timeout /t 4 /nobreak >nul && start http://localhost:4321/admin/extract"

:: Inicia o servidor (fica rodando nessa janela)
npm run dev

pause
