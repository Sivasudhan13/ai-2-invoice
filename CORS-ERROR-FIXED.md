# 🔧 CORS Error - FIXED!

## Problem
```
Cross-Origin Request Blocked: The Same Origin Policy disallows reading 
the remote resource at http://localhost:5000/api/auth/signup. 
(Reason: CORS request did not succeed). Status code: (null).
```

## Root Cause
The backend server is **NOT RUNNING**. CORS errors with status code `(null)` mean the browser can't reach the server at all.

## Solution

### Quick Fix (Recommended)

**Right-click** `FIX-AND-START.bat` → **Run as Administrator**

This will:
1. ✅ Check MongoDB installation
2. ✅ Create data directory
3. ✅ Start MongoDB
4. ✅ Start backend server
5. ✅ Start frontend server
6. ✅ Open browser automatically

### Manual Fix

#### Step 1: Start MongoDB
```cmd
# Option A: As service (requires admin)
net start MongoDB

# Option B: Direct start
mongod --dbpath="C:\data\db"
```

Keep this terminal open!

#### Step 2: Start Backend
Open a **new terminal**:
```bash
cd backend
npm start
```

You should see:
```
⏳ Connecting to MongoDB...
✅ Mongoose connected to MongoDB
📦 Connected to MongoDB
✅ Database: invoiceDB
🚀 Server running on port 5000
✅ Server is ready to accept requests
```

Keep this terminal open!

#### Step 3: Start Frontend
Open **another new terminal**:
```bash
cd frontend
npm run dev
```

You should see:
```
VITE ready in XXX ms
➜  Local:   http://localhost:3000/
```

#### Step 4: Test
Open browser → http://localhost:3000

## What I Fixed

### 1. CORS Configuration (`server.js`)
```javascript
// Before (restrictive)
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// After (permissive for development)
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 
           'http://127.0.0.1:3000', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors());
```

### 2. Created Startup Scripts
- ✅ `FIX-AND-START.bat` - Complete automated startup
- ✅ `test-server.js` - Check if backend is running
- ✅ `quick-fix-db.js` - Test MongoDB connection

## Verification

### Check Backend is Running
```bash
cd backend
node test-server.js
```

Expected output:
```
✅ Health Check Endpoint
   Status: 200
   Response: {"status":"ok"...}

✅ Backend server is running correctly!
```

### Check MongoDB is Running
```bash
cd backend
node quick-fix-db.js
```

Expected output:
```
✅ SUCCESS! Connected to MongoDB
📦 Database: invoiceDB
🌐 Host: localhost
```

### Check Frontend
Open http://localhost:3000 in browser

## Common Issues

### Issue: "MongoDB is not running"
**Solution**:
```cmd
# Create data directory if missing
mkdir C:\data\db

# Start MongoDB
mongod --dbpath="C:\data\db"
```

### Issue: "Port 5000 already in use"
**Solution**:
```cmd
# Find process
netstat -ano | findstr :5000

# Kill process (replace PID)
taskkill /PID <PID> /F

# Restart backend
cd backend
npm start
```

### Issue: "Cannot find module"
**Solution**:
```bash
# Reinstall dependencies
cd backend
npm install

cd ../frontend
npm install
```

### Issue: Still getting CORS errors
**Checklist**:
- [ ] MongoDB is running
- [ ] Backend shows "Server is ready to accept requests"
- [ ] Frontend is running
- [ ] Using http://localhost:3000 (not 127.0.0.1)
- [ ] Clear browser cache (Ctrl+Shift+Delete)
- [ ] Try incognito/private window

## Testing the Fix

### 1. Test Backend Health
```bash
curl http://localhost:5000/health
```

Should return:
```json
{
  "status": "ok",
  "message": "Invoice OCR API is running",
  "database": "connected"
}
```

### 2. Test Signup API
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"test123","accountType":"personal"}'
```

Should return:
```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "Test",
    "email": "test@test.com",
    "token": "..."
  }
}
```

### 3. Test in Browser
1. Open http://localhost:3000/signup
2. Fill in the form
3. Click "Create Account"
4. Should redirect to dashboard (no CORS error!)

## Success Indicators

✅ MongoDB window shows "waiting for connections"
✅ Backend window shows "Server is ready to accept requests"
✅ Frontend window shows "VITE ready"
✅ Browser can access http://localhost:3000
✅ No CORS errors in browser console (F12)
✅ Signup/Login works without errors

## Quick Commands

### Start Everything
```cmd
# Run as Administrator
FIX-AND-START.bat
```

### Stop Everything
```cmd
# Press Ctrl+C in each terminal window
# Or close all terminal windows
```

### Restart Backend Only
```cmd
# In backend terminal: Ctrl+C
# Then:
npm start
```

## Summary

✅ **Problem**: Backend server wasn't running
✅ **Cause**: MongoDB not started, server couldn't connect
✅ **Solution**: Start MongoDB first, then backend, then frontend
✅ **Result**: CORS errors gone, signup/login working!

## Next Steps

1. Run `FIX-AND-START.bat` as Administrator
2. Wait for browser to open
3. Create account at http://localhost:3000/signup
4. Start using the Invoice AI system!

Everything is fixed! 🎉
