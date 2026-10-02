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
echo.
echo  Evidence zakazek - server. Toto okno nezavirejte.
echo  ^(Adresu a ikonu "Evidence zakazek.url" pro kolegy vypise a vytvori server nize.^)
echo.
node server\server.js
echo.
echo Server se zastavil.
pause
