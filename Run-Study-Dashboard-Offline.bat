@echo off
title Alim Study Dashboard (100% Offline Mode)
chcp 65001 >nul
cls

echo ===================================================================
echo               ALIM STUDY TRACKING DASHBOARD (OFFLINE)
echo ===================================================================
echo  - Internet Connection: NOT REQUIRED (100% Offline)
echo  - Local Database: Embedded PGlite (stored on your computer)
echo ===================================================================
echo.

cd /d "c:\Users\Administrator\Downloads\alim-study-tracking-dashboard"

set USE_PGLITE=true
set PORT=3000

echo Starting local offline server...
echo.
echo [*] PC Access URL:       http://localhost:3000
echo [*] Mobile Access URL:   Connect your phone to same Wi-Fi / Hotspot and open:
for /f "tokens=4" %%a in ('route print 0.0.0.0 ^| find " 0.0.0.0 "') do (
    echo                      http://%%a:3000
)
echo ===================================================================
echo.

:: Automatically open default browser after 3 seconds
start "" cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:3000"

:: Run local Next.js server
call npm run start

pause
