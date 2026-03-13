@echo off
echo ========================================
echo Starting MongoDB and Backend Server
echo ========================================
echo.

REM Check if MongoDB is already running
echo Checking if MongoDB is running...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [OK] MongoDB is already running
) else (
    echo [INFO] Starting MongoDB...
    start "MongoDB" mongod --dbpath="C:\data\db"
    timeout /t 3 /nobreak >nul
    echo [OK] MongoDB started
)

echo.
echo ========================================
echo Starting Backend Server
echo ========================================
echo.

REM Start the Node.js server
npm start

pause
