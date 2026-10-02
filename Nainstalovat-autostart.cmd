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
schtasks /Run /TN "Evidence zakazek server" >nul
echo.
echo Hotovo. Server se nyni spousti automaticky pri zapnuti tohoto pocitace a uz bezi na pozadi.
echo Za par vterin vznikne vedle teto slozky ikona "Evidence zakazek.url" - tu zkopirujte kolegum na S:.
echo Adresu a port najdete v souboru server\server.log
echo.
pause
