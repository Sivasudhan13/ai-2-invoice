# UI Troubleshooting Guide

## Issue: UI Not Showing Properly

### ✅ Fixed: Missing App.jsx

**Problem**: The main App.jsx file was missing, causing routing issues.

**Solution**: Created `frontend/src/App.jsx` with all routes configured.

---

## Common UI Issues & Solutions

### 1. Blank White Screen

**Symptoms:**
- Browser shows blank white page
- No content visible
- Console may show errors

**Solutions:**

#### A. Check if App.jsx exists
```bash
ls frontend/src/App.jsx
```
✅ **Fixed**: App.jsx has been created

#### B. Check browser console (F12)
Look for errors like:
- "Cannot find module"
- "Unexpected token"
- "Failed to fetch"

#### C. Restart frontend
```bash
cd frontend
npm run dev
```

---

### 2. Routes Not Working

**Symptoms:**
- Clicking links doesn't navigate
- URL changes but page doesn't update
- 404 errors

**Solutions:**

#### A. Verify react-router-dom is installed
```bash
cd frontend
npm list react-router-dom
```
✅ **Installed**: react-router-dom@7.13.1

#### B. Check App.jsx has Router
✅ **Fixed**: BrowserRouter configured in App.jsx

#### C. Clear browser cache
- Press Ctrl+Shift+Delete
- Clear cached images and files
- Reload page

---

### 3. Components Not Rendering

**Symptoms:**
- Some pages work, others don't
- Components show as blank
- Missing content

**Solutions:**

#### A. Check all page files exist
```bash
ls frontend/src/pages/
```

Required pages:
- ✅ Login.jsx
- ✅ Signup.jsx
- ✅ Dashboard.jsx
- ✅ History.jsx
- ✅ InvoiceExtractor.jsx
- ✅ SupplierDashboard.jsx
- ✅ SupplierAnalytics.jsx
- ✅ OrganizationDashboard.jsx
- ✅ OrganizationUsers.jsx
- ✅ OrganizationInvoices.jsx
- ✅ OrganizationAlerts.jsx
- ✅ OrganizationSettings.jsx

#### B. Check component imports
Open browser console and look for:
- "Module not found"
- "Cannot resolve"

#### C. Verify file extensions
All React files should be `.jsx` not `.js`

---

### 4. Styling Issues

**Symptoms:**
- Layout broken
- Colors not showing
- Elements overlapping

**Solutions:**

#### A. Check CSS files are imported
In `main.jsx`:
```javascript
import './index.css';
import './App.css';
```

#### B. Check theme.js exists
```bash
ls frontend/src/theme.js
```
✅ **Exists**: theme.js

#### C. Hard refresh browser
- Windows: Ctrl+F5
- Mac: Cmd+Shift+R

---

### 5. API Not Responding

**Symptoms:**
- Loading forever
- "Network Error"
- No data showing

**Solutions:**

#### A. Check backend is running
```bash
curl http://localhost:5000/health
```

Should return:
```json
{"status":"ok","message":"Invoice OCR API is running","database":"connected"}
```

#### B. Check CORS settings
Backend should allow frontend origin:
```javascript
cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
})
```

#### C. Check API URLs in frontend
All API calls should use:
```javascript
http://localhost:5000/api/...
```

---

### 6. Authentication Issues

**Symptoms:**
- Can't login
- Redirects to login repeatedly
- "Unauthorized" errors

**Solutions:**

#### A. Check token in localStorage
Open browser console:
```javascript
localStorage.getItem('token')
```

#### B. Clear localStorage
```javascript
localStorage.clear()
```
Then login again

#### C. Reset admin password
```bash
cd backend
node reset-admin-password.js
```

---

### 7. Confidence Scores Not Showing

**Symptoms:**
- Extracted data shows but no confidence badges
- No High/Medium/Low labels

**Solutions:**

#### A. Check browser console
Look for:
```javascript
✅ API Response: { ... }
📊 Confidence Scores: { ... }
```

#### B. Check API response structure
Open Network tab (F12) → Find `/api/invoice/extract` request
Response should have `confidenceScores` field

#### C. Check backend logs
Should see:
```
📊 Confidence scores calculated
```

---

## Quick Diagnostic Steps

### Step 1: Check All Services Running

```bash
# Check backend
curl http://localhost:5000/health

# Check frontend
curl http://localhost:3000

# Check MongoDB
mongosh --eval "db.version()"
```

### Step 2: Check Browser Console

1. Open browser (Chrome/Firefox)
2. Press F12
3. Go to Console tab
4. Look for red errors
5. Share error messages

### Step 3: Check Network Tab

1. Press F12
2. Go to Network tab
3. Reload page
4. Look for failed requests (red)
5. Check request/response details

### Step 4: Check File Structure

```bash
frontend/src/
├── App.jsx          ✅ Created
├── main.jsx         ✅ Exists
├── theme.js         ✅ Exists
├── components/      ✅ Exists
├── pages/           ✅ Exists
├── context/         ✅ Exists
└── utils/           ✅ Exists
```

---

## Current Status

### ✅ Fixed Issues
- [x] App.jsx created with all routes
- [x] BrowserRouter configured
- [x] All routes defined
- [x] PrivateRoute component used
- [x] AuthProvider wrapping app

### ✅ Verified Working
- [x] Backend running on port 5000
- [x] Frontend running on port 3000
- [x] MongoDB connected
- [x] react-router-dom installed
- [x] All page files exist

---

## Test the Fix

### 1. Restart Frontend (if needed)
```bash
cd frontend
npm run dev
```

### 2. Open Browser
Navigate to: http://localhost:3000

### 3. Test Routes
- http://localhost:3000/ → Should redirect to /extractor
- http://localhost:3000/login → Login page
- http://localhost:3000/signup → Signup page
- http://localhost:3000/extractor → Invoice extractor

### 4. Test Navigation
- Click links in navbar
- Routes should change
- Pages should load

---

## If Issues Persist

### Collect Information

1. **Browser Console Errors**
   - Press F12
   - Copy all red errors
   - Share the errors

2. **Network Tab**
   - Press F12 → Network
   - Reload page
   - Find failed requests
   - Share request/response

3. **Frontend Terminal Output**
   - Check terminal where `npm run dev` is running
   - Look for errors
   - Share error messages

4. **Backend Terminal Output**
   - Check terminal where `npm start` is running
   - Look for errors
   - Share error messages

---

## Common Error Messages

### "Cannot find module './App'"
**Fix**: App.jsx has been created ✅

### "BrowserRouter is not defined"
**Fix**: Import added in App.jsx ✅

### "Failed to fetch"
**Fix**: Check backend is running on port 5000

### "CORS error"
**Fix**: Backend CORS already configured ✅

### "Unauthorized"
**Fix**: Login with correct credentials or clear localStorage

---

## Quick Commands

### Restart Everything
```bash
# Stop all (Ctrl+C in each terminal)

# Start MongoDB
mongod

# Start Backend
cd backend
npm start

# Start Frontend
cd frontend
npm run dev
```

### Clear Cache
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
cd frontend
rm -rf node_modules
npm install
```

### Reset Database
```bash
cd backend
node reset-admin-password.js
```

---

## Expected Behavior

### After Fix

1. ✅ Frontend loads at http://localhost:3000
2. ✅ Shows invoice extractor by default
3. ✅ Navigation works (login, signup, etc.)
4. ✅ Can upload invoices
5. ✅ Can see extracted data
6. ✅ Confidence scores show
7. ✅ Can login/signup
8. ✅ Protected routes work

---

## Status: FIXED ✅

The main issue (missing App.jsx) has been resolved. The UI should now work properly.

**If you still see issues, please share:**
1. Browser console errors (F12)
2. Network tab errors
3. Specific page/feature not working

I'll help debug further! 🔧
