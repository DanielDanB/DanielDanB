@echo off
chcp 65001 >nul
title Prehled zakazek - odinstalace sluzby
cd /d "%~dp0"

net session >nul 2>&1
if errorlevel 1 (
  echo   [!] Spustte jako spravce ^(prave tlacitko - Spustit jako spravce^).
  pause
  exit /b 1
)

echo.
echo   Zastavuji a rusim sluzbu ...
schtasks /end /tn "PrehledZakazek" >nul 2>&1
schtasks /delete /tn "PrehledZakazek" /f >nul 2>&1
taskkill /f /im node.exe >nul 2>&1
netsh advfirewall firewall delete rule name="Prehled zakazek" >nul 2>&1

echo.
echo   Sluzba zrusena. Data zustavaji ve slozce data\ - smazte ji rucne,
echo   pokud je uz nepotrebujete.
echo.
pause
