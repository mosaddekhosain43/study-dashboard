@echo off
REM ──────────────────────────────────────────────────────────────
REM  Alim Study Dashboard — one-click local launcher (Windows)
REM ──────────────────────────────────────────────────────────────
title Alim Study Dashboard
cd /d %~dp0

where node >nul 2>nul
if errorlevel 1 (
  if exist "C:\Program Files\nodejs\node.exe" (
    set "PATH=%PATH%;C:\Program Files\nodejs"
  ) else (
    echo [ERROR] Node.js is not installed. Please install Node.js from https://nodejs.org and re-run.
    pause
    exit /b 1
  )
)

if not exist node_modules (
  echo Installing dependencies ^(first time only^)...
  call npm install
)

if not exist .next (
  echo Building the app ^(first time only^)...
  call npm run build
)

echo Starting Alim Study Dashboard...
start "" http://localhost:3000
call npm run start -- -p 3000
pause
