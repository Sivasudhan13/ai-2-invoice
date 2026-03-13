@echo off
title Invoice AI - Complete Fix and Startup
color 0B

echo ============================================================
echo    INVOICE AI SYSTEM - COMPLETE FIX AND STARTUP
echo ============================================================
echo.

REM Step 1: Check MongoDB Installation
echo [STEP 1] Checking MongoDB installation...
where mongod >nul 2>&1
if %errorLevel% == 0 (
    echo [OK] MongoDB is installed
) else (
    echo [ERROR] MongoDB is not installed!
    echo.
    echo Please install MongoDB:
    echo 1. Download from: https://www.mongodb.com/try/download/community
    echo 2. Run installer with default settings
    echo 3. Run this script again
    echo.
    pause
    exit /b 1
)

echo.

REM Step 2: Create MongoDB data directory
echo [STEP 2] Setting up MongoDB data directory...
if not exist "C:\data\db" (
    echo Creating C:\data\db directory...
    mkdir "C:\data\db" 2>nul
    if %errorLevel% == 0 (
        echo [OK] Data directory created
    ) else (
        echo [WARNING] Could not create directory (may need admin rights)
    )
) else (
    echo [OK] Data directory exists
)

echo.

REM Step 3: Start MongoDB
echo [STEP 3] Starting MongoDB...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [OK] MongoDB is already running
) else (
    echo Starting MongoDB server...
    start "MongoDB Server" /MIN mongod --dbpath="C:\data\db"
    timeout /t 5 /nobreak >nul
    
    REM Verify MongoDB started
    tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
    if "%ERRORLEVEL%"=="0" (
        echo [OK] MongoDB started successfully
    ) else (
        echo [ERROR] Failed to start MongoDB
        echo.
        echo Try running as Administrator:
        echo Right-click this file and select "Run as Administrator"
        echo.
        pause
        exit /b 1
    )
)

echo.

REM Step 4: Test MongoDB connection
echo [STEP 4] Testing MongoDB connection...
cd backend
node quick-fix-db.js >nul 2>&1
if %errorLevel% == 0 (
    echo [OK] MongoDB connection successful
) else (
    echo [WARNING] MongoDB connection test failed
    echo Continuing anyway...
)

echo.

REM Step 5: Start Backend Server
echo [STEP 5] Starting Backend Server...
echo This will open in a new window...
start "Backend Server - Port 5000" cmd /k "npm start"
timeout /t 3 /nobreak >nul
echo [OK] Backend server starting...

echo.

REM Step 6: Start Frontend
echo [STEP 6] Starting Frontend...
cd ..\frontend
echo This will open in a new window...
start "Frontend Server - Port 3000" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul
echo [OK] Frontend server starting...

cd ..

echo.
echo ============================================================
echo    STARTUP COMPLETE!
echo ============================================================
echo.
echo All services are starting up...
echo.
echo IMPORTANT: Keep these windows open:
echo   1. MongoDB Server (minimized)
echo   2. Backend Server (port 5000)
echo   3. Frontend Server (port 3000)
echo.
echo Waiting 15 seconds for services to initialize...
echo.

timeout /t 15 /nobreak

echo ============================================================
echo    OPENING BROWSER
echo ============================================================
echo.
echo Your browser will open to: http://localhost:3000
echo.
echo If the page doesn't load:
echo   1. Wait another 10 seconds
echo   2. Refresh the page (F5)
echo   3. Check the Backend Server window for errors
echo.

start http://localhost:3000

echo.
echo ============================================================
echo    SYSTEM STATUS
echo ============================================================
echo.
echo MongoDB:  Running (minimized window)
echo Backend:  http://localhost:5000 (check window)
echo Frontend: http://localhost:3000 (check window)
echo.
echo To stop all services:
echo   - Close all terminal windows
echo   - Or press Ctrl+C in each window
echo.
echo ============================================================
echo.
echo Press any key to close this window...
echo (Services will continue running)
echo.
pause >nul
