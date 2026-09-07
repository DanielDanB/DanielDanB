@echo off
chcp 437 >nul
setlocal EnableDelayedExpansion
title Prehled zakazek - instalace sluzby
cd /d "%~dp0"

set NAZEV=PrehledZakazek
set PORT=%~1
if "%PORT%"=="" set PORT=8080
rem druhy parametr: kam polozit spousteciho zastupce, napr. S:\Vyroba
set SDILENY=%~2

echo.
echo   Prehled zakazek - instalace sluzby
echo   ==================================
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

rem ---------- Node.js a jeho plna cesta ----------
rem SYSTEM nemusi mit node v PATH, proto si cestu zapamatujeme
set NODEEXE=
for /f "delims=" %%i in ('where node 2^>nul') do (
  if not defined NODEEXE set NODEEXE=%%i
)
if not defined NODEEXE (
  echo   [!] Node.js neni nainstalovany.
  echo       Stahnete verzi LTS z https://nodejs.org, nainstalujte
  echo       a spustte tento soubor znovu.
  echo.
  pause
  exit /b 1
)
for /f "tokens=*" %%v in ('"!NODEEXE!" --version') do set NODEVER=%%v
echo   Node.js !NODEVER!
echo   %NODEEXE%

rem ---------- nastaveni pro sluzbu ----------
> "%~dp0nastaveni.bat" echo @echo off
>>"%~dp0nastaveni.bat" echo set PORT=%PORT%
>>"%~dp0nastaveni.bat" echo set NODEEXE=%NODEEXE%

rem ---------- stara instalace pryc ----------
schtasks /query /tn "%NAZEV%" >nul 2>&1
if not errorlevel 1 (
  echo   Odstranuji predchozi instalaci...
  schtasks /end /tn "%NAZEV%" >nul 2>&1
  schtasks /delete /tn "%NAZEV%" /f >nul 2>&1
)

rem ---------- popis ulohy v XML ----------
rem XML se pouziva schvalne: obchazi potize s uvozovkami v prikazove
rem radce a hlavne umi vypnout tovarni limit, ktery ulohu po 3 dnech
rem sam ukonci.
set XML=%~dp0uloha.xml
> "%XML%" echo ^<?xml version="1.0" encoding="UTF-16"?^>
>>"%XML%" echo ^<Task version="1.2" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task"^>
>>"%XML%" echo   ^<RegistrationInfo^>
>>"%XML%" echo     ^<Description^>Prehled zakazek - evidence zakazek obrobny a svarovny^</Description^>
>>"%XML%" echo   ^</RegistrationInfo^>
>>"%XML%" echo   ^<Triggers^>
>>"%XML%" echo     ^<BootTrigger^>^<Enabled^>true^</Enabled^>^</BootTrigger^>
>>"%XML%" echo   ^</Triggers^>
>>"%XML%" echo   ^<Principals^>
>>"%XML%" echo     ^<Principal id="Author"^>
>>"%XML%" echo       ^<UserId^>S-1-5-18^</UserId^>
>>"%XML%" echo       ^<RunLevel^>HighestAvailable^</RunLevel^>
>>"%XML%" echo     ^</Principal^>
>>"%XML%" echo   ^</Principals^>
>>"%XML%" echo   ^<Settings^>
>>"%XML%" echo     ^<MultipleInstancesPolicy^>IgnoreNew^</MultipleInstancesPolicy^>
>>"%XML%" echo     ^<DisallowStartIfOnBatteries^>false^</DisallowStartIfOnBatteries^>
>>"%XML%" echo     ^<StopIfGoingOnBatteries^>false^</StopIfGoingOnBatteries^>
>>"%XML%" echo     ^<AllowHardTerminate^>true^</AllowHardTerminate^>
>>"%XML%" echo     ^<StartWhenAvailable^>true^</StartWhenAvailable^>
>>"%XML%" echo     ^<RunOnlyIfNetworkAvailable^>false^</RunOnlyIfNetworkAvailable^>
>>"%XML%" echo     ^<IdleSettings^>^<StopOnIdleEnd^>false^</StopOnIdleEnd^>^<RestartOnIdle^>false^</RestartOnIdle^>^</IdleSettings^>
>>"%XML%" echo     ^<AllowStartOnDemand^>true^</AllowStartOnDemand^>
>>"%XML%" echo     ^<Enabled^>true^</Enabled^>
>>"%XML%" echo     ^<Hidden^>false^</Hidden^>
>>"%XML%" echo     ^<RunOnlyIfIdle^>false^</RunOnlyIfIdle^>
>>"%XML%" echo     ^<WakeToRun^>false^</WakeToRun^>
>>"%XML%" echo     ^<ExecutionTimeLimit^>PT0S^</ExecutionTimeLimit^>
>>"%XML%" echo     ^<Priority^>7^</Priority^>
>>"%XML%" echo     ^<RestartOnFailure^>^<Interval^>PT1M^</Interval^>^<Count^>999^</Count^>^</RestartOnFailure^>
>>"%XML%" echo   ^</Settings^>
>>"%XML%" echo   ^<Actions Context="Author"^>
>>"%XML%" echo     ^<Exec^>
>>"%XML%" echo       ^<Command^>%~dp0sluzba.bat^</Command^>
>>"%XML%" echo       ^<WorkingDirectory^>%~dp0^</WorkingDirectory^>
>>"%XML%" echo     ^</Exec^>
>>"%XML%" echo   ^</Actions^>
>>"%XML%" echo ^</Task^>

rem schtasks u XML ocekava UTF-16; echo zapisuje ASCII, prevedeme
powershell -NoProfile -Command "$c=Get-Content -Raw '%XML%'; [IO.File]::WriteAllText('%XML%', $c, [Text.Encoding]::Unicode)" >nul 2>&1

echo   Zakladam sluzbu na portu %PORT% ...
schtasks /create /tn "%NAZEV%" /xml "%XML%" /f >nul
if errorlevel 1 (
  echo   [!] Ulohu se nepodarilo zalozit z XML, zkousim zaloznim zpusobem...
  schtasks /create /tn "%NAZEV%" /tr "'%~dp0sluzba.bat'" /sc onstart /ru SYSTEM /rl HIGHEST /f >nul
  if errorlevel 1 (
    echo   [!] Nepodarilo se. Vypis vyse.
    pause
    exit /b 1
  )
)

rem ---------- firewall ----------
echo   Povoluji port %PORT% v brane firewall ...
netsh advfirewall firewall delete rule name="Prehled zakazek" >nul 2>&1
netsh advfirewall firewall add rule name="Prehled zakazek" dir=in action=allow protocol=TCP localport=%PORT% profile=domain,private >nul 2>&1

echo   Spoustim ...
schtasks /run /tn "%NAZEV%" >nul

rem ---------- overeni, ze server opravdu odpovida ----------
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
  echo    HOTOVO - sluzba bezi a nastartuje sama po zapnuti
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
  echo    Stav:  stav-sluzby.bat
  echo    Zrusit: odinstalovat-sluzbu.bat
  echo.
  if not "%SDILENY%"=="" (
    echo    Zakladam spousteciho zastupce na %SDILENY% ...
    call "%~dp0vytvorit-zastupce.bat" "%SDILENY%" ^< nul
  ) else (
    echo    Chcete spousteciho zastupce na sdilenem disku pro kolegy?
    echo      vytvorit-zastupce.bat "S:\Vyroba"
  )
) else (
  echo   [!] Sluzba byla zalozena, ale na portu %PORT% neodpovida.
  echo.
  echo       Podivejte se do:  %~dp0data\server.log
  echo.
  echo       Nejcastejsi pricina je obsazeny port. Zkuste jiny:
  echo         nainstalovat-sluzbu.bat 8090
  echo.
  echo       Co drzi port %PORT% zjistite prikazem:
  echo         netstat -ano ^| findstr :%PORT%
)
echo.
pause
