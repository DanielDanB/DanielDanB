@echo off
chcp 65001 >nul
rem Spustit jako SPRAVCE. Ukaze, jestli server evidence bezi a na jakem portu.
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server\ovladani.ps1" stav
echo.
pause
