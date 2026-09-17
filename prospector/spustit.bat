@echo off
rem Spusti aplikaci a otevre ji v prohlizeci. Ukoncite klavesami Ctrl+C.
cd /d "%~dp0"
set PORT=8000

where python >nul 2>nul
if errorlevel 1 goto chybipython

if not exist .venv (
  echo Pripravuji prostredi ^(jen pri prvnim spusteni^)...
  python -m venv .venv
)
.venv\Scripts\python.exe -m pip install -q --disable-pip-version-check -r requirements.txt
if errorlevel 1 goto chybainstalace

start "" http://127.0.0.1:%PORT%
echo.
echo   Aplikace bezi na http://127.0.0.1:%PORT%
echo   Ukoncite ji klavesami Ctrl+C.
echo.
.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port %PORT%
goto konec

:chybipython
echo.
echo   Python neni nainstalovany nebo neni v PATH.
echo   Stahnete ho z https://www.python.org/downloads/
echo   a pri instalaci ZASKRTNETE "Add python.exe to PATH".
echo.
goto konec

:chybainstalace
echo.
echo   Nepodarilo se doinstalovat zavislosti. Zkontrolujte pripojeni k internetu.
echo.

:konec
pause
