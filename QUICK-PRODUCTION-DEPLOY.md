# 🚀 Quick Production Deployment

Fast track guide to get your app live in production.

## ⚡ 5-Minute Deploy

### 1️⃣ Backend (Already Done! ✅)

Your backend is already deployed at:
```
https://ai-invoice-2f1n.onrender.com
```

**Just update these environment variables on Render:**

```env
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=generate_a_strong_32_char_secret
FRONTEND_URL=https://your-frontend-url.vercel.app
```

### 2️⃣ Frontend (Choose One)

#### Option A: Vercel (Recommended - Fastest)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel --prod
```

When prompted:
- Set environment variable: `VITE_API_URL=https://ai-invoice-2f1n.onrender.com`
- Done! Your app is live 🎉

#### Option B: Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
cd frontend
netlify deploy --prod
```

When prompted:
- Set environment variable: `VITE_API_URL=https://ai-invoice-2f1n.onrender.com`
- Done! Your app is live 🎉

#### Option C: Manual Build

```bash
# Windows
deploy-frontend.bat

# Linux/Mac
chmod +x deploy-frontend.sh
./deploy-frontend.sh
```

Then upload the `frontend/dist` folder to any static hosting.

### 3️⃣ Database (MongoDB Atlas)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Create database user
4. Allow access from anywhere (0.0.0.0/0)
5. Get connection string
6. Add to Render backend environment as `MONGODB_URI`

### 4️⃣ Update Backend with Frontend URL

After deploying frontend, update on Render:
```env
FRONTEND_URL=https://your-actual-frontend-url.vercel.app
```

---

## 🎯 That's It!

Your app is now live:
- **Backend**: https://ai-invoice-2f1n.onrender.com
- **Frontend**: https://your-frontend-url.vercel.app
- **Database**: MongoDB Atlas

---

## 🐛 Quick Fixes

### CORS Error?
Update `FRONTEND_URL` in Render backend environment to match your frontend URL exactly.

### Can't Connect to Backend?
Check `VITE_API_URL` is set in Vercel/Netlify environment variables.

### Database Error?
Verify `MONGODB_URI` is correct and MongoDB Atlas allows connections from anywhere.

---

## 📚 Need More Details?

See `PRODUCTION-DEPLOYMENT.md` for comprehensive guide.
