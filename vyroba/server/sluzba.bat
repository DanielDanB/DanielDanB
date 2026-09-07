@echo off
rem ---------------------------------------------------------------
rem  Vnitrni soubor sluzby. Nespoustejte ho rucne - spousti ho
rem  naplanovana uloha "PrehledZakazek" po zapnuti serveru.
rem  Server drzi nastartovany; kdyby spadl, za 10 s ho zvedne znovu.
rem ---------------------------------------------------------------
cd /d "%~dp0"

if exist "nastaveni.bat" call "nastaveni.bat"
if "%PORT%"=="" set PORT=8080
if "%NODEEXE%"=="" set NODEEXE=node

if not exist "data" mkdir "data"
set LOG=data\server.log

rem log vetsi nez 5 MB odlozime stranou
for %%F in ("%LOG%") do if %%~zF GTR 5242880 move /y "%LOG%" "%LOG%.1" >nul 2>&1

:smycka
echo. >> "%LOG%"
echo [%date% %time%] server startuje, port %PORT% >> "%LOG%"
"%NODEEXE%" server.js >> "%LOG%" 2>&1
echo [%date% %time%] server skoncil, za 10 s znovu >> "%LOG%"
timeout /t 10 /nobreak >nul
goto smycka
