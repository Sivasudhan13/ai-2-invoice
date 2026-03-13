# 🚀 Quick Start Guide - Invoice AI System

## ✅ Prerequisites Check

Your system has:
- ✅ MongoDB v8.0.13 installed
- ✅ Node.js installed
- ✅ Backend and Frontend code ready

## 🎯 Start the System (3 Steps)

### Step 1: Start MongoDB

Open **Command Prompt as Administrator** and run:
```cmd
net start MongoDB
```

Or if that doesn't work, start MongoDB directly:
```cmd
mongod --dbpath="C:\data\db"
```

Keep this window open!

### Step 2: Start Backend Server

Open a **new terminal** in the project folder:
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

### Step 3: Start Frontend

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

## 🎉 Access the Application

Open your browser and go to:
**http://localhost:3000**

## 📝 Test Login/Signup

### Create a New Account
1. Click "Create One" or go to http://localhost:3000/signup
2. Fill in:
   - Name: Test User
   - Email: test@example.com
   - Password: test123
   - Account Type: Personal
3. Click "Create Account"
4. You'll be redirected to the dashboard

### Login
1. Go to http://localhost:3000/login
2. Enter:
   - Email: test@example.com
   - Password: test123
3. Click "Sign In"
4. You'll be redirected based on your role

## 🔧 Troubleshooting

### Problem: "MongoDB is not running"

**Solution 1** - Start as Service (Requires Admin):
```cmd
net start MongoDB
```

**Solution 2** - Start Directly:
```cmd
mongod --dbpath="C:\data\db"
```

**Solution 3** - Create data directory if missing:
```cmd
mkdir C:\data\db
mongod --dbpath="C:\data\db"
```

### Problem: "Port 5000 already in use"

**Solution**:
```cmd
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F
```

### Problem: "Cannot connect to backend"

**Check**:
1. Backend server is running on port 5000
2. MongoDB is running
3. No firewall blocking localhost connections

### Problem: "Login/Signup not working"

**Check**:
1. MongoDB is running: `mongosh` (should connect)
2. Backend shows "Database ready"
3. Check browser console for errors (F12)
4. Verify API endpoint: http://localhost:5000/health

## 📊 System Status Check

### Check MongoDB:
```bash
mongosh
# Should connect successfully
```

### Check Backend:
```bash
curl http://localhost:5000/health
# Should return: {"status":"ok","message":"Invoice OCR API is running","database":"connected"}
```

### Check Frontend:
Open http://localhost:3000 in browser

## 🎯 Quick Commands

### Start Everything (Windows):
```cmd
# Terminal 1 (Admin)
net start MongoDB

# Terminal 2
cd backend && npm start

# Terminal 3
cd frontend && npm run dev
```

### Stop Everything:
```cmd
# Press Ctrl+C in each terminal
# Then stop MongoDB:
net stop MongoDB
```

## 📱 Features to Test

After logging in, test these features:

1. **Invoice Upload** (/extractor)
   - Upload a PDF/JPG/PNG invoice
   - See AI extraction with OCR + Gemini
   - View confidence scores
   - Check fraud detection
   - Check anomaly detection
   - View quality evaluation

2. **Dashboard** (/dashboard)
   - View your uploaded invoices
   - See statistics
   - Export data

3. **History** (/history)
   - View all past extractions
   - Filter and search

## 🆘 Still Having Issues?

### Run Diagnostic:
```bash
cd backend
node quick-fix-db.js
```

This will:
- Check MongoDB connection
- Verify configuration
- Provide specific solutions

### Check Logs:
- Backend: Look at terminal output
- Frontend: Press F12 → Console tab
- MongoDB: Check mongod terminal

### Common Fixes:

1. **Restart Everything**:
   - Stop all terminals (Ctrl+C)
   - Close MongoDB
   - Start fresh following Step 1-3

2. **Clear Browser Cache**:
   - Press Ctrl+Shift+Delete
   - Clear cache and cookies
   - Refresh page

3. **Reinstall Dependencies**:
   ```bash
   cd backend
   rm -rf node_modules
   npm install
   
   cd ../frontend
   rm -rf node_modules
   npm install
   ```

## ✅ Success Indicators

You know everything is working when:

- ✅ MongoDB shows "waiting for connections"
- ✅ Backend shows "Server is ready to accept requests"
- ✅ Frontend shows "VITE ready"
- ✅ Can access http://localhost:3000
- ✅ Can login/signup successfully
- ✅ Can upload and extract invoices

## 🎉 You're All Set!

Your Invoice AI system is now running with:
- Real OCR extraction (Tesseract.js)
- AI processing (Google Gemini)
- Fraud detection
- Anomaly detection
- Quality evaluation
- All bonus features

Enjoy! 🚀
