@echo off
chcp 65001 >nul
rem Spustit jako SPRAVCE (pravym tlacitkem - Spustit jako spravce).
rem Restartuje jen server evidence (jine aplikace na serveru, napr. Prehled vyroby, nechava byt). Pouzijte po nahrani nove verze server\server.js.
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server\ovladani.ps1" restart
echo.
pause
