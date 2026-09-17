@echo off
rem Spusti aplikaci a otevre ji v prohlizeci. Ukoncite klavesami Ctrl+C.
cd /d "%~dp0"
set PORT=8000

where python >nul 2>nul
if errorlevel 1 goto chybipython

if not exist .venv (
  echo Pripravuji prostredi ^(jen pri prvnim spusteni, muze to trvat i dve minuty^)...
  python -m venv .venv
)

.venv\Scripts\python.exe -m pip install -q --disable-pip-version-check -r requirements.txt
if not errorlevel 1 goto spustit

rem Prvni pokus selhal. Casto za to muze rozdelana slozka .venv z drivejska,
rem tak ji zahodime a zkusime to jeste jednou od zacatku.
echo.
echo Prvni pokus nevysel, zkousim prostredi postavit znovu od zacatku...
rmdir /s /q .venv
python -m venv .venv
.venv\Scripts\python.exe -m pip install --disable-pip-version-check -r requirements.txt
if errorlevel 1 goto chybainstalace

:spustit
start "" http://127.0.0.1:%PORT%
echo.
echo   Aplikace bezi na http://127.0.0.1:%PORT%
echo   Ukoncite ji klavesami Ctrl+C nebo zavrenim tohoto okna.
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
echo   Nepodarilo se pripravit prostredi. Vypis je cely vyse.
echo.
echo   Nejcastejsi priciny:
echo     - vypadek internetu behem stahovani balicku
echo     - firemni sit nebo antivirus blokuje pristup na pypi.org
echo     - nektery balicek nema hotovou verzi pro vasi verzi Pythonu
echo       ^(ve vypisu je pak veta o "Microsoft Visual C++"^)
echo.
echo   Vyfotte tohle okno a poslete mi to - podle vypisu se to da opravit.
echo.

:konec
pause
