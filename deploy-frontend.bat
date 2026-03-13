@echo off
REM Frontend Deployment Script for Windows

echo 🚀 Deploying Frontend to Production...
echo.

REM Check if we're in the right directory
if not exist "frontend" (
    echo ❌ Error: frontend directory not found
    echo Please run this script from the project root
    exit /b 1
)

cd frontend

echo 📦 Installing dependencies...
call npm install

echo 🔨 Building production bundle...
call npm run build

if %ERRORLEVEL% EQU 0 (
    echo ✅ Build successful!
    echo.
    echo 📁 Production files are in: frontend\dist
    echo.
    echo Next steps:
    echo 1. Deploy to Vercel: vercel --prod
    echo 2. Deploy to Netlify: netlify deploy --prod
    echo 3. Or upload the 'dist' folder to your hosting provider
    echo.
    echo Don't forget to set environment variable:
    echo VITE_API_URL=https://ai-invoice-2f1n.onrender.com
) else (
    echo ❌ Build failed!
    exit /b 1
)

cd ..
pause
