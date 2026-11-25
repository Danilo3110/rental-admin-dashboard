@echo off
rem Starts the development server and opens the site in the browser (Windows).
setlocal
cd /d "%~dp0"

where node >nul 2>nul || (
  echo Node.js is not installed. Download it from https://nodejs.org and run this file again.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Installing dependencies...
  call npm install --no-fund --no-audit || goto :error
)

call npm run dev -- --open
goto :eof

:error
echo.
echo Something went wrong. See the message above.
pause
exit /b 1
