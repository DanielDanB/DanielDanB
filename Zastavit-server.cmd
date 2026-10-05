@echo off
chcp 65001 >nul
rem Spustit jako SPRAVCE (pravym tlacitkem - Spustit jako spravce).
rem Zastavi jen server evidence (jine aplikace na serveru nechava byt).
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server\ovladani.ps1" stop
echo.
pause
