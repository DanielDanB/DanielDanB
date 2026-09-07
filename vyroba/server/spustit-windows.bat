@echo off
chcp 65001 >nul
title Prehled zakazek - server
cd /d "%~dp0"

echo.
echo   Prehled zakazek - server
echo   ========================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo   [!] Node.js neni nainstalovany.
  echo.
  echo   Stahnete si ho z https://nodejs.org - staci verze LTS,
  echo   pri instalaci nechte vse predvyplnene. Pak spustte tento
  echo   soubor znovu.
  echo.
  pause
  exit /b 1
)

if "%PORT%"=="" set PORT=8080

echo   Server startuje na portu %PORT% ...
echo   Aplikaci otevrete v prohlizeci na  http://localhost:%PORT%
echo   Kolegove v siti pouziji misto localhost adresu tohoto pocitace.
echo.
echo   Okno nechte otevrene. Zavrenim okna server skonci.
echo.

node server.js
if errorlevel 1 (
  echo.
  echo   [!] Server skoncil s chybou. Vypis je vyse.
  pause
)
