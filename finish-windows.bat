@echo off
setlocal
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel% neq 0 (echo Install Python 3.10+ from python.org & pause & exit /b 1)
py -3 -m venv .venv
if %errorlevel% neq 0 (echo Cannot create virtual environment & pause & exit /b 1)
.venv\Scripts\python.exe -m pip install -r requirements-local.txt
if %errorlevel% neq 0 (echo Cannot install Pillow & pause & exit /b 1)
.venv\Scripts\python.exe tools\finish_local.py --strict --standalone
if %errorlevel% neq 0 (echo Read docs\LOCAL_ASSET_PIPELINE.md & pause & exit /b 1)
.venv\Scripts\python.exe tools\create_contact_sheet.py
if %errorlevel% neq 0 exit /b 1
where node >nul 2>nul
if %errorlevel% neq 0 (echo Node.js 18+ is required & pause & exit /b 1)
call npm test
if %errorlevel% neq 0 (echo Tests failed & pause & exit /b 1)
echo Finished. Run start-windows.bat to play.
pause
