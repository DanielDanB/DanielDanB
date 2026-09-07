@echo off
chcp 437 >nul
setlocal EnableDelayedExpansion
title Prehled zakazek - zastupce na sdileny disk
cd /d "%~dp0"

rem  Vytvori spousteci zastupce, ktery jen otevre aplikaci v prohlizeci.
rem  Polozte ho na sdileny disk (S:) a kolegove ho maji jako kazdou
rem  jinou spousteci aplikaci.
rem
rem     vytvorit-zastupce.bat                -> vedle tohoto souboru
rem     vytvorit-zastupce.bat "S:\Vyroba"    -> rovnou na sdileny disk

if exist "nastaveni.bat" call "nastaveni.bat"
if "%PORT%"=="" set PORT=8080

set KAM=%~1
if defined KAM if "%KAM:~-1%"=="\" set KAM=%KAM:~0,-1%
if "%KAM%"=="" (
  echo   Kam zastupce polozit? Napriklad  S:\Vyroba
  echo   Enter = vedle tohoto souboru
  echo.
  set /p KAM=  Slozka: 
  if defined KAM set KAM=!KAM:"=!
  if defined KAM if "!KAM:~-1!"=="\" set KAM=!KAM:~0,-1!
)
if "%KAM%"=="" set KAM=%~dp0

rem ---- adresa serveru: prvni IPv4 tohoto pocitace
set ADRESA=
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
  if not defined ADRESA (
    set ADRESA=%%a
    set ADRESA=!ADRESA: =!
  )
)
if not defined ADRESA set ADRESA=localhost

set URL=http://!ADRESA!:%PORT%
set SOUBOR=%KAM%\Prehled zakazek.url

echo.
echo   Vytvarim zastupce
echo   =================
echo.
echo   Adresa serveru : !URL!
echo   Zastupce       : !SOUBOR!
echo.

if not exist "%KAM%" (
  echo   [!] Slozka %KAM% neexistuje nebo na ni nevidite.
  echo       Zkontrolujte, ze je sdileny disk pripojeny.
  echo.
  pause
  exit /b 1
)

> "!SOUBOR!" echo [InternetShortcut]
>>"!SOUBOR!" echo URL=!URL!
>>"!SOUBOR!" echo IconIndex=0

if exist "!SOUBOR!" (
  echo   Hotovo.
  echo.
  echo   Kolegove ted jen poklepou na "Prehled zakazek" a aplikace
  echo   se jim otevre v prohlizeci. Nic si neinstaluji.
  echo.
  echo   Zastupce si mohou pretahnout i na plochu.
) else (
  echo   [!] Zastupce se nepodarilo vytvorit - nemate pravo zapisu do %KAM% ?
)
echo.
pause
