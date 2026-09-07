@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion
title Prehled zakazek - instalace sluzby
cd /d "%~dp0"

set NAZEV=PrehledZakazek
set PORT=%~1
if "%PORT%"=="" set PORT=8080

echo.
echo   Prehled zakazek - instalace sluzby
echo   ==================================
echo.

rem ---- prava spravce
net session >nul 2>&1
if errorlevel 1 (
  echo   [!] Spustte tento soubor jako SPRAVCE.
  echo       Klepnete na nej pravym tlacitkem a zvolte
  echo       "Spustit jako spravce".
  echo.
  pause
  exit /b 1
)

rem ---- Node.js
where node >nul 2>nul
if errorlevel 1 (
  echo   [!] Node.js neni nainstalovany.
  echo       Stahnete verzi LTS z https://nodejs.org, nainstalujte
  echo       a spustte tento soubor znovu.
  echo.
  pause
  exit /b 1
)
for /f "tokens=*" %%v in ('node --version') do set NODEVER=%%v
echo   Node.js !NODEVER! nalezen.

rem ---- stara uloha pryc
schtasks /query /tn "%NAZEV%" >nul 2>&1
if not errorlevel 1 (
  echo   Odstranuji predchozi instalaci...
  schtasks /end /tn "%NAZEV%" >nul 2>&1
  schtasks /delete /tn "%NAZEV%" /f >nul 2>&1
)

rem ---- port do nastaveni sluzby
> "%~dp0port.txt" echo %PORT%

echo   Zakladam sluzbu na portu %PORT% ...
schtasks /create /tn "%NAZEV%" /tr "\"%~dp0sluzba.bat\"" /sc onstart /ru SYSTEM /rl HIGHEST /f >nul
if errorlevel 1 (
  echo   [!] Sluzbu se nepodarilo zalozit.
  pause
  exit /b 1
)

rem ---- povoleni v brane firewall
echo   Povoluji port %PORT% v brane firewall ...
netsh advfirewall firewall delete rule name="Prehled zakazek" >nul 2>&1
netsh advfirewall firewall add rule name="Prehled zakazek" dir=in action=allow protocol=TCP localport=%PORT% profile=domain,private >nul 2>&1

echo   Spoustim ...
schtasks /run /tn "%NAZEV%" >nul

rem ---- overeni, ze server opravdu odpovida
set OK=0
for /l %%i in (1,1,15) do (
  if !OK!==0 (
    timeout /t 2 /nobreak >nul
    powershell -NoProfile -Command "try{ $r=Invoke-WebRequest -UseBasicParsing -TimeoutSec 3 http://localhost:%PORT%/api/zakazky/verze; if($r.StatusCode -eq 200){exit 0} }catch{}; exit 1" >nul 2>&1
    if !errorlevel!==0 set OK=1
  )
)

echo.
if !OK!==1 (
  echo   ==================================================
  echo    HOTOVO - sluzba bezi a startuje sama po zapnuti.
  echo   ==================================================
  echo.
  echo    Na tomto serveru:
  echo      http://localhost:%PORT%
  echo.
  echo    Adresy pro kolegy:
  for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set IP=%%a
    set IP=!IP: =!
    echo      http://!IP!:%PORT%
  )
  echo.
  echo    Data:  %~dp0data
  echo    Log:   %~dp0data\server.log
  echo.
  echo    Sluzbu zrusite souborem odinstalovat-sluzbu.bat
) else (
  echo   [!] Sluzba byla zalozena, ale server na portu %PORT%
  echo       neodpovida. Podivejte se do %~dp0data\server.log
  echo.
  echo       Nejcastejsi pricina: port uz nekdo zabral. Spustte
  echo       instalaci znovu s jinym portem, napriklad:
  echo         nainstalovat-sluzbu.bat 8090
)
echo.
pause
