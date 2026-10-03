@echo off
setlocal enabledelayedexpansion
title AlgoViz Platform Launcher
cd /d "%~dp0"

echo ======================================================
echo           ALGOVIZ - DSA Code Visualizer
echo ======================================================
echo.

:: 1. Check Python
where python >nul 2>nul
if %errorlevel% neq 0 (
    where py >nul 2>nul
    if %errorlevel% neq 0 (
        echo [ERROR] Python is not installed or not in PATH!
        echo Please install Python 3.10+ from https://www.python.org/
        echo.
        pause
        exit /b 1
    ) else (
        set PYTHON_CMD=py
    )
) else (
    set PYTHON_CMD=python
)

for /f "delims=" %%v in ('%PYTHON_CMD% --version 2^>^&1') do echo [OK] Found %%v

:: 2. Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js 18+ from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

for /f "delims=" %%v in ('node -v 2^>^&1') do echo [OK] Found Node.js %%v

:: 3. Check pnpm
where pnpm >nul 2>nul
if %errorlevel% equ 0 (
    set PNPM_CMD=pnpm
    for /f "delims=" %%v in ('pnpm -v 2^>^&1') do echo [OK] Found pnpm %%v
) else (
    where npx >nul 2>nul
    if %errorlevel% equ 0 (
        echo [INFO] pnpm not found globally, using 'npx pnpm'...
        set PNPM_CMD=npx pnpm
    ) else (
        echo [ERROR] Neither pnpm nor npx was found.
        echo Please install pnpm: npm install -g pnpm
        echo.
        pause
        exit /b 1
    )
)

:: 4. Ensure .env exists in apps/api
if not exist "apps\api\.env" (
    if exist "apps\api\.env.example" (
        echo [INFO] Creating apps\api\.env from .env.example...
        copy "apps\api\.env.example" "apps\api\.env" >nul
    )
)

:: Check for optional command line arguments (e.g., start.bat 1 or start.bat 2)
if "%~1"=="1" goto INSTALL_DEPS
if "%~1"=="2" goto START_PROJECT

:MENU
echo.
echo ======================================================
echo                  Select an Option
echo ======================================================
echo  [1] Install all requirements and dependencies
echo  [2] Start project
echo  [3] Exit
echo ======================================================
choice /C 123 /N /M "Enter your choice (1, 2, or 3): "

if errorlevel 3 goto EXIT_SCRIPT
if errorlevel 2 goto START_PROJECT
if errorlevel 1 goto INSTALL_DEPS

:INSTALL_DEPS
echo.
echo ======================================================
echo  [Option 1] Installing Requirements and Dependencies
echo ======================================================
echo.
echo [1/2] Installing Python dependencies (apps/api/requirements.txt)...
%PYTHON_CMD% -m pip install -r apps\api\requirements.txt
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to install Python dependencies.
    pause
    goto MENU
)
echo [OK] Python dependencies installed successfully.
echo.
echo [2/2] Installing Node.js packages via %PNPM_CMD%...
call %PNPM_CMD% install
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to install Node.js dependencies.
    pause
    goto MENU
)
echo [OK] Node.js packages installed successfully.
echo.
echo ======================================================
echo  All requirements and dependencies installed!
echo ======================================================
echo.
echo  [1] Start project now
echo  [2] Return to main menu
echo  [3] Exit
echo ======================================================
choice /C 123 /N /M "Enter your choice (1, 2, or 3): "

if errorlevel 3 goto EXIT_SCRIPT
if errorlevel 2 goto MENU
if errorlevel 1 goto START_PROJECT

:START_PROJECT
echo.
echo ======================================================
echo  [Option 2] Starting AlgoViz Project
echo ======================================================
echo.

:: Check Python packages
%PYTHON_CMD% -c "import fastapi, uvicorn, sqlalchemy" >nul 2>nul
if %errorlevel% neq 0 (
    echo [WARNING] Python dependencies missing or incomplete.
    echo Running automatic installation of Python dependencies...
    %PYTHON_CMD% -m pip install -r apps\api\requirements.txt
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install Python dependencies.
        pause
        goto MENU
    )
)

:: Check node_modules
if not exist "node_modules" (
    echo [WARNING] node_modules not found.
    echo Running automatic installation of Node packages...
    call %PNPM_CMD% install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install Node.js dependencies.
        pause
        goto MENU
    )
)

echo.
echo ======================================================
echo  Starting all AlgoViz services:
echo    - Web Frontend:  http://localhost:3000
echo    - API Backend:   http://localhost:8000
echo    - API Docs:      http://localhost:8000/docs
echo ======================================================
echo.
echo Opening browser in 4 seconds...
echo Press Ctrl+C in this window to stop all services.
echo.

:: Open browser in background after short delay
start /b "" powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 4; Start-Process 'http://localhost:3000'" >nul 2>&1

:: Run dev services via pnpm
call %PNPM_CMD% dev

echo.
echo [INFO] AlgoViz services stopped.
pause
goto MENU

:EXIT_SCRIPT
echo.
echo Goodbye!
exit /b 0
