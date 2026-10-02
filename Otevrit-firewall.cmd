@echo off
chcp 65001 >nul
rem Spustit jako SPRAVCE (pravym tlacitkem - Spustit jako spravce).
rem Povoli v brane firewall prichozi spojeni pro server evidence ve VSECH typech siti (domenova, soukroma i verejna).
cd /d "%~dp0"
set NODEEXE=
for /f "delims=" %%N in ('where node 2^>nul') do set NODEEXE=%%N
set PORT=
if exist "%~dp0server\port.txt" set /p PORT=<"%~dp0server\port.txt"
netsh advfirewall firewall delete rule name="Evidence zakazek" >nul 2>nul
netsh advfirewall firewall delete rule name="Evidence zakazek port" >nul 2>nul
if defined NODEEXE (
  netsh advfirewall firewall add rule name="Evidence zakazek" dir=in action=allow program="%NODEEXE%" enable=yes profile=any
  echo Povolen prichozi pristup pro program: %NODEEXE%
) else (
  echo Node.js nebyl nalezen - preskakuji pravidlo pro program.
)
if defined PORT (
  netsh advfirewall firewall add rule name="Evidence zakazek port" dir=in action=allow protocol=TCP localport=%PORT% profile=any
  echo Povolen prichozi port: %PORT%
) else (
  echo Soubor server\port.txt zatim neexistuje - spustte nejdriv server a potom tento soubor znovu.
)
echo.
echo Hotovo. Kolegove by se nyní meli pripojit.
pause
