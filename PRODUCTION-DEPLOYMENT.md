# Production Deployment Guide

Complete guide for deploying the Invoice OCR application to production.

## 🎯 Overview

- **Backend**: Node.js/Express API (Deploy to Render/Railway/Heroku)
- **Frontend**: React/Vite SPA (Deploy to Vercel/Netlify/Render)
- **Database**: MongoDB Atlas (Cloud Database)

---

## 📦 Backend Deployment (Render)

### Step 1: Prepare Backend

Your backend is already configured at: `https://ai-invoice-2f1n.onrender.com`

### Step 2: Environment Variables on Render

Go to your Render dashboard → Your service → Environment and add:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
GEMINI_API_KEY=AIzaSyBd0072TDEOoriFDZDzBo_O41lPTVDDUFc
FRONTEND_URL=https://your-frontend-domain.vercel.app
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=application/pdf,image/jpeg,image/png,image/jpg
```

### Step 3: Build Command on Render

```bash
npm install
```

### Step 4: Start Command on Render

```bash
npm start
```

### Step 5: Verify Backend

Test your backend:
```bash
curl https://ai-invoice-2f1n.onrender.com/health
```

---

## 🌐 Frontend Deployment (Vercel)

### Step 1: Build Frontend Locally (Test)

```bash
cd frontend
npm install
npm run build
```

This creates a `dist` folder with production files.

### Step 2: Deploy to Vercel

#### Option A: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from frontend directory
cd frontend
vercel --prod
```

#### Option B: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your Git repository
4. Set Root Directory: `frontend`
5. Framework Preset: `Vite`
6. Build Command: `npm run build`
7. Output Directory: `dist`
8. Add Environment Variable:
   ```
   VITE_API_URL=https://ai-invoice-2f1n.onrender.com
   ```
9. Click "Deploy"

### Step 3: Environment Variables on Vercel

In Vercel Dashboard → Your Project → Settings → Environment Variables:

```
VITE_API_URL=https://ai-invoice-2f1n.onrender.com
```

---

## 🌐 Frontend Deployment (Netlify)

### Step 1: Deploy to Netlify

#### Option A: Using Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy from frontend directory
cd frontend
netlify deploy --prod
```

#### Option B: Using Netlify Dashboard

1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect your Git repository
4. Configure build settings:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
5. Add Environment Variable:
   ```
   VITE_API_URL=https://ai-invoice-2f1n.onrender.com
   ```
6. Click "Deploy site"

### Step 2: Environment Variables on Netlify

In Netlify Dashboard → Site Settings → Environment Variables:

```
VITE_API_URL=https://ai-invoice-2f1n.onrender.com
```

---

## 🗄️ MongoDB Atlas Setup

### Step 1: Create MongoDB Atlas Account

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for free tier
3. Create a new cluster

### Step 2: Configure Database Access

1. Database Access → Add New Database User
2. Create username and password
3. Set privileges to "Read and write to any database"

### Step 3: Configure Network Access

1. Network Access → Add IP Address
2. Click "Allow Access from Anywhere" (0.0.0.0/0)
3. Or add your Render server IPs

### Step 4: Get Connection String

1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database user password
5. Replace `<dbname>` with your database name (e.g., `invoice-ocr`)

Example:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/invoice-ocr?retryWrites=true&w=majority
```

### Step 5: Add to Backend Environment

Add this to your Render environment variables:
```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/invoice-ocr?retryWrites=true&w=majority
```

---

## 🔐 Security Checklist

### Backend Security

- [x] CORS configured to allow frontend domain
- [ ] JWT_SECRET is strong (min 32 characters)
- [ ] Environment variables are set (not hardcoded)
- [ ] MongoDB connection string is secure
- [ ] File upload limits are set
- [ ] Rate limiting is enabled
- [ ] HTTPS is enforced

### Frontend Security

- [x] API URL uses environment variables
- [x] No sensitive data in frontend code
- [x] HTTPS is enforced by hosting platform

---

## 🧪 Testing Production

### Test Backend

```bash
# Health check
curl https://ai-invoice-2f1n.onrender.com/health

# Test login (replace with your test user)
curl -X POST https://ai-invoice-2f1n.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test Frontend

1. Open your deployed frontend URL
2. Test login/signup
3. Test invoice upload
4. Test OCR extraction
5. Check browser console for errors

---

## 🚀 Quick Deploy Commands

### Deploy Backend to Render (Git-based)

```bash
# Commit your changes
git add .
git commit -m "Production ready"
git push origin main

# Render will auto-deploy from Git
```

### Deploy Frontend to Vercel

```bash
cd frontend
vercel --prod
```

### Deploy Frontend to Netlify

```bash
cd frontend
netlify deploy --prod
```

---

## 📊 Post-Deployment

### Update Frontend URL in Backend

After deploying frontend, update backend environment variable:

```env
FRONTEND_URL=https://your-actual-frontend-url.vercel.app
```

### Monitor Your Application

- **Render**: Check logs in Render dashboard
- **Vercel/Netlify**: Check deployment logs and analytics
- **MongoDB Atlas**: Monitor database performance

---

## 🐛 Troubleshooting

### CORS Errors

**Problem**: "CORS header 'Access-Control-Allow-Origin' missing"

**Solution**: 
1. Verify `FRONTEND_URL` is set in backend environment
2. Check backend CORS configuration in `server.js`
3. Ensure frontend URL matches exactly (no trailing slash)

### API Connection Failed

**Problem**: Frontend can't connect to backend

**Solution**:
1. Verify `VITE_API_URL` is set in frontend environment
2. Check backend is running: `curl https://ai-invoice-2f1n.onrender.com/health`
3. Check browser console for exact error

### Database Connection Failed

**Problem**: "MongooseError: Could not connect to MongoDB"

**Solution**:
1. Verify `MONGODB_URI` is correct in backend environment
2. Check MongoDB Atlas network access allows your server IP
3. Verify database user credentials are correct

### File Upload Fails

**Problem**: "File upload failed" or 413 error

**Solution**:
1. Check `MAX_FILE_SIZE` environment variable
2. Verify hosting platform allows file uploads
3. Check file size limits on hosting platform

---

## 📝 Environment Variables Summary

### Backend (Render)

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret_key_min_32_chars
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=https://your-frontend.vercel.app
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=application/pdf,image/jpeg,image/png,image/jpg
```

### Frontend (Vercel/Netlify)

```env
VITE_API_URL=https://ai-invoice-2f1n.onrender.com
```

---

## ✅ Deployment Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Database user created with password
- [ ] Network access configured
- [ ] Backend deployed to Render
- [ ] Backend environment variables set
- [ ] Backend health check passes
- [ ] Frontend built successfully
- [ ] Frontend deployed to Vercel/Netlify
- [ ] Frontend environment variable set
- [ ] Frontend can connect to backend
- [ ] Test user login works
- [ ] Test invoice upload works
- [ ] Test OCR extraction works
- [ ] CORS is working correctly
- [ ] HTTPS is enforced on both frontend and backend

---

## 🎉 Success!

Your Invoice OCR application is now live in production!

- **Backend**: https://ai-invoice-2f1n.onrender.com
- **Frontend**: https://your-frontend-url.vercel.app (or Netlify)
- **Database**: MongoDB Atlas

Share your application URL and start processing invoices! 🚀
