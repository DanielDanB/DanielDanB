@echo off
chcp 65001 >nul
rem Spustit jako SPRAVCE. Povoli v brane firewall pristup ke serveru z firemni site (port 3000).
netsh advfirewall firewall add rule name="Evidence zakazek" dir=in action=allow protocol=TCP localport=3000 profile=domain,private
if errorlevel 1 (
  echo Nepodarilo se - spustte tento soubor jako spravce.
) else (
  echo Hotovo - port 3000 je povolen pro domenovou a soukromou sit.
)
pause
