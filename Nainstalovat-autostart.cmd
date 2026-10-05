@echo off
chcp 65001 >nul
rem Spustit jako SPRAVCE (pravym tlacitkem - Spustit jako spravce).
rem Server evidence se bude spoustet sam pri kazdem zapnuti pocitace (bez prihlaseni, bez okna) a po padu se sam znovu spusti.
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server\ovladani.ps1" install
echo.
echo Adresu a port najdete v souboru server\server.log
echo Ikonu "Evidence zakazek.url" pro kolegy vytvori server vedle teto slozky.
echo.
pause
