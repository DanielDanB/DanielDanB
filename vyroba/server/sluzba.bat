@echo off
rem ---------------------------------------------------------------
rem  Vnitrni soubor sluzby. Nespoustejte ho rucne - spousti ho
rem  naplanovana uloha "PrehledZakazek" po zapnuti serveru.
rem  Server drzi nastartovany; kdyby spadl, za 10 s ho zvedne znovu.
rem ---------------------------------------------------------------
cd /d "%~dp0"

if not exist "data" mkdir "data"
set LOG=data\server.log

rem port zvoleny pri instalaci
if exist "port.txt" (
  for /f "usebackq tokens=* delims=" %%p in ("port.txt") do set PORT=%%p
)
if "%PORT%"=="" set PORT=8080

rem log vetsi nez 5 MB odlozime stranou
for %%F in ("%LOG%") do if %%~zF GTR 5242880 move /y "%LOG%" "%LOG%.1" >nul 2>&1

:smycka
echo. >> "%LOG%"
echo [%date% %time%] server startuje >> "%LOG%"
node server.js >> "%LOG%" 2>&1
echo [%date% %time%] server skoncil, za 10 s znovu >> "%LOG%"
timeout /t 10 /nobreak >nul
goto smycka
