@echo off
echo ========================================
echo CREATE SUPPLIER - DIAGNOSTIC TEST
echo ========================================
echo.

cd backend

echo Step 1: Testing direct database operations...
echo.
node quick-test-supplier.js
echo.

echo ========================================
echo.
echo Step 2: Testing API endpoint...
echo.
echo IMPORTANT: Update email/password in test-create-supplier-detailed.js
echo Press any key to continue or Ctrl+C to cancel...
pause > nul
echo.
node test-create-supplier-detailed.js
echo.

echo ========================================
echo TEST COMPLETE
echo ========================================
echo.
echo Check the output above for any errors.
echo.
echo If both tests pass:
echo   - The backend is working correctly
echo   - Try creating supplier from frontend
echo.
echo If tests fail:
echo   - Check MongoDB is running
echo   - Check backend server is running
echo   - See CREATE-SUPPLIER-DEBUG-GUIDE.md
echo.
pause
