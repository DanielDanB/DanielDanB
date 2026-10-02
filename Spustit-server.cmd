@echo off
chcp 65001 >nul
title Evidence zakazek - server
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo Neni nainstalovan Node.js. Stahnete ho z https://nodejs.org ^(verze LTS^), nainstalujte a spustte tento soubor znovu.
  echo.
  pause
  exit /b 1
)
rem ikona pro kolegy: odkaz na tento server (vytvori se vedle aplikace)
(echo [InternetShortcut]& echo URL=http://%COMPUTERNAME%:3000/)>"Evidence zakazek.url"
echo.
echo  Evidence zakazek - server bezi. Toto okno nezavirejte.
echo  Kolegove otevrou aplikaci dvojklikem na "Evidence zakazek.url" nebo v prohlizeci na http://%COMPUTERNAME%:3000/
echo.
node server\server.js
echo.
echo Server se zastavil.
pause
