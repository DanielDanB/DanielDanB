@echo off
chcp 65001 >nul
rem Spustit jako SPRAVCE. Povoli v brane firewall prichozi spojeni pro Node.js (server evidence) z firemni site.
for /f "delims=" %%N in ('where node 2^>nul') do set NODEEXE=%%N
if not defined NODEEXE (
  echo Node.js nebyl nalezen. Nainstalujte ho z https://nodejs.org a spustte znovu.
  pause
  exit /b 1
)
netsh advfirewall firewall delete rule name="Evidence zakazek" >nul 2>nul
netsh advfirewall firewall add rule name="Evidence zakazek" dir=in action=allow program="%NODEEXE%" enable=yes profile=domain,private
if errorlevel 1 (
  echo Nepodarilo se - spustte tento soubor jako spravce.
) else (
  echo Hotovo - Node.js ^(%NODEEXE%^) ma povoleny prichozi pristup v domenove a soukrome siti.
)
pause
