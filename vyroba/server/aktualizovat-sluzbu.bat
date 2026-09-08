@echo off
chcp 437 >nul
setlocal EnableDelayedExpansion
title Prehled zakazek - aktualizace
cd /d "%~dp0"

echo.
echo   Prehled zakazek - aktualizace aplikace
echo   =======================================
echo.

rem ---------- prava spravce ----------
net session >nul 2>&1
if errorlevel 1 (
  echo   [!] Spustte tento soubor jako SPRAVCE.
  echo       Pravym tlacitkem na soubor - "Spustit jako spravce".
  echo.
  pause
  exit /b 1
)

if exist "nastaveni.bat" call "nastaveni.bat"
if "%PORT%"=="" set PORT=8080

rem ---------- sluzba musi existovat ----------
schtasks /query /tn "PrehledZakazek" >nul 2>&1
if errorlevel 1 (
  echo   [!] Sluzba PrehledZakazek neni zalozena.
  echo       Nejdriv spustte nainstalovat-sluzbu.bat
  echo.
  pause
  exit /b 1
)

echo   Zastavuji sluzbu, at nova verze nejde prepsat pres bezici ...
schtasks /end /tn "PrehledZakazek" >nul 2>&1
timeout /t 3 /nobreak >nul

echo.
echo   ==================================================
echo    Sluzba je zastavena.
echo.
echo    Ted do slozky vyroba ^(o uroven vys nez tato^)
echo    zkopirujte novy soubor
echo.
echo        prehled-zakazek.html
echo.
echo    a PREPISTE jim ten stavajici. Slozky server ani
echo    server\data se nedotykejte - tam jsou vase data.
echo.
echo    Az bude soubor na miste, stisknete tady libovolnou
echo    klavesu.
echo   ==================================================
echo.
pause >nul

echo.
echo   Spoustim sluzbu znovu ...
schtasks /run /tn "PrehledZakazek" >nul

set OK=0
for /l %%i in (1,1,15) do (
  if !OK!==0 (
    timeout /t 2 /nobreak >nul
    powershell -NoProfile -Command "try{ $r=Invoke-WebRequest -UseBasicParsing -TimeoutSec 3 'http://localhost:%PORT%/api/zakazky/verze'; if($r.StatusCode -eq 200){exit 0} }catch{}; exit 1" >nul 2>&1
    if !errorlevel!==0 set OK=1
  )
)

echo.
if !OK!==1 (
  echo   ==================================================
  echo    HOTOVO - aplikace bezi na nove verzi.
  echo   ==================================================
  echo.
  echo    Na tomto serveru:  http://localhost:%PORT%
  echo.
  echo    Data zustala beze zmeny - lezi ve slozce data,
  echo    aktualizace se jich netyka.
) else (
  echo   [!] Sluzba se po aktualizaci nespustila spravne.
  echo.
  echo       Podivejte se do:  %~dp0data\server.log
  echo.
  echo       Nejcastejsi pricina je, ze se soubor
  echo       prehled-zakazek.html nezkopiroval na spravne
  echo       misto ^(o uroven vys, ne do slozky server^).
)
echo.
pause
