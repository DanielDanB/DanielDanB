@echo off
chcp 437 >nul
title Prehled zakazek - stav
cd /d "%~dp0"

if exist "nastaveni.bat" call "nastaveni.bat"
if "%PORT%"=="" set PORT=8080

echo.
echo   Prehled zakazek - stav sluzby
echo   =============================
echo.
schtasks /query /tn "PrehledZakazek" /fo list 2>nul | findstr /i "TaskName Status Next Last"
echo.
echo   Odpovida server na portu %PORT% ?
powershell -NoProfile -Command "try{ $r=Invoke-WebRequest -UseBasicParsing -TimeoutSec 3 'http://localhost:%PORT%/api/zakazky/verze'; Write-Host '     ANO -' $r.Content }catch{ Write-Host '     NE -' $_.Exception.Message }"
echo.
echo   Poslednich 15 radku vypisu:
echo   ---------------------------
if exist "data\server.log" (
  powershell -NoProfile -Command "Get-Content 'data\server.log' -Tail 15"
) else (
  echo   (zatim zadny vypis)
)
echo.
pause
