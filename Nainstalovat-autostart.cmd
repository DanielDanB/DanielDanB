@echo off
chcp 65001 >nul
rem Spustit jako SPRAVCE (pravym tlacitkem - Spustit jako spravce).
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Neni nainstalovan Node.js - nainstalujte ho z https://nodejs.org a spustte znovu.
  pause
  exit /b 1
)
schtasks /Create /TN "Evidence zakazek server" /TR "wscript.exe \"%~dp0Spustit-server-skryte.vbs\"" /SC ONSTART /RU SYSTEM /RL HIGHEST /F
if errorlevel 1 (
  echo.
  echo Nepodarilo se vytvorit ulohu. Spustte tento soubor jako spravce.
  pause
  exit /b 1
)
(echo [InternetShortcut]& echo URL=http://%COMPUTERNAME%:3000/)>"Evidence zakazek.url"
schtasks /Run /TN "Evidence zakazek server" >nul
echo.
echo Hotovo. Server se nyni spousti automaticky pri zapnuti tohoto pocitace a uz bezi na pozadi.
echo Adresa pro kolegy: http://%COMPUTERNAME%:3000/   (ikona "Evidence zakazek.url" je vedle teto slozky)
echo.
pause
