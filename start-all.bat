@echo off
title Invoice AI System Startup
color 0A

echo ========================================
echo    INVOICE AI SYSTEM - STARTUP
echo ========================================
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% == 0 (
    echo [OK] Running as Administrator
) else (
    echo [WARNING] Not running as Administrator
    echo Some features may not work properly
    echo.
    echo Right-click this file and select "Run as Administrator"
    echo.
    pause
)

echo.
echo ========================================
echo STEP 1: Starting MongoDB
echo ========================================
echo.

REM Try to start MongoDB service
echo Attempting to start MongoDB service...
net start MongoDB >nul 2>&1
if %errorLevel% == 0 (
    echo [OK] MongoDB service started successfully
) else (
    echo [INFO] MongoDB service not available or already running
    echo Checking if MongoDB is running...
    
    tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
    if "%ERRORLEVEL%"=="0" (
        echo [OK] MongoDB is already running
    ) else (
        echo [INFO] Starting MongoDB manually...
        if not exist "C:\data\db" (
            echo Creating data directory...
            mkdir "C:\data\db"
        )
        start "MongoDB Server" /MIN mongod --dbpath="C:\data\db"
        timeout /t 3 /nobreak >nul
        echo [OK] MongoDB started
    )
)

echo.
echo ========================================
echo STEP 2: Starting Backend Server
echo ========================================
echo.

cd backend
echo Starting Node.js backend server...
start "Backend Server" cmd /k "npm start"
timeout /t 2 /nobreak >nul
echo [OK] Backend server starting...

echo.
echo ========================================
echo STEP 3: Starting Frontend
echo ========================================
echo.

cd ..\frontend
echo Starting React frontend...
start "Frontend Server" cmd /k "npm run dev"
timeout /t 2 /nobreak >nul
echo [OK] Frontend server starting...

cd ..

echo.
echo ========================================
echo    STARTUP COMPLETE!
echo ========================================
echo.
echo Your Invoice AI System is starting up...
echo.
echo Please wait 10-15 seconds for all services to initialize.
echo.
echo Then open your browser and go to:
echo.
echo    http://localhost:3000
echo.
echo ========================================
echo IMPORTANT WINDOWS:
echo ========================================
echo.
echo 1. MongoDB Server (minimized)
echo 2. Backend Server (port 5000)
echo 3. Frontend Server (port 3000)
echo.
echo Keep all windows open while using the system!
echo.
echo To stop: Close all terminal windows
echo.
echo ========================================
echo.

timeout /t 15 /nobreak
start http://localhost:3000

echo Opening browser...
echo.
echo Press any key to exit this window...
pause >nul
