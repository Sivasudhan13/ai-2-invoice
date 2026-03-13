# ✅ Production Deployment Checklist

Use this checklist to ensure everything is configured correctly for production.

## 🗄️ Database Setup

- [ ] MongoDB Atlas account created
- [ ] Free tier cluster created
- [ ] Database user created with strong password
- [ ] Network access configured (0.0.0.0/0 for Render)
- [ ] Connection string obtained
- [ ] Database name set (e.g., `invoice-ocr`)
- [ ] Connection string tested

**Connection String Format:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/invoice-ocr?retryWrites=true&w=majority
```

---

## 🔧 Backend Configuration (Render)

- [ ] Backend deployed to Render
- [ ] Service is running (check dashboard)
- [ ] Health endpoint works: `https://ai-invoice-2f1n.onrender.com/health`

### Environment Variables Set:

- [ ] `NODE_ENV=production`
- [ ] `PORT=5000`
- [ ] `MONGODB_URI=mongodb+srv://...` (from MongoDB Atlas)
- [ ] `JWT_SECRET=...` (min 32 characters, randomly generated)
- [ ] `GEMINI_API_KEY=...` (your Google Gemini API key)
- [ ] `FRONTEND_URL=https://...` (your frontend URL after deployment)
- [ ] `MAX_FILE_SIZE=10485760`
- [ ] `ALLOWED_FILE_TYPES=application/pdf,image/jpeg,image/png,image/jpg`

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🌐 Frontend Configuration

- [ ] Frontend built successfully (`npm run build`)
- [ ] `dist` folder created
- [ ] Deployed to Vercel/Netlify/Render

### Environment Variables Set:

- [ ] `VITE_API_URL=https://ai-invoice-2f1n.onrender.com`

### Deployment Platform Specific:

#### Vercel
- [ ] Project imported from Git
- [ ] Root directory set to `frontend`
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Environment variable added

#### Netlify
- [ ] Site created from Git
- [ ] Base directory: `frontend`
- [ ] Build command: `npm run build`
- [ ] Publish directory: `frontend/dist`
- [ ] Environment variable added
- [ ] Redirects configured (netlify.toml)

---

## 🔐 Security Checklist

### Backend Security
- [ ] JWT_SECRET is strong and unique (min 32 chars)
- [ ] Environment variables are not committed to Git
- [ ] CORS is configured with specific frontend URL
- [ ] File upload size limits are set
- [ ] MongoDB connection uses authentication
- [ ] HTTPS is enforced (automatic on Render)

### Frontend Security
- [ ] No API keys in frontend code
- [ ] Environment variables use VITE_ prefix
- [ ] HTTPS is enforced (automatic on Vercel/Netlify)
- [ ] No sensitive data in localStorage

---

## 🧪 Testing Production

### Backend Tests

- [ ] Health check works:
```bash
curl https://ai-invoice-2f1n.onrender.com/health
```

- [ ] CORS headers present:
```bash
curl -I https://ai-invoice-2f1n.onrender.com/health
```

- [ ] API endpoints respond (test with Postman/curl)

### Frontend Tests

- [ ] Frontend loads without errors
- [ ] Can access login page
- [ ] Can access signup page
- [ ] Browser console shows no errors
- [ ] Network tab shows requests to correct backend URL

### Integration Tests

- [ ] User signup works
- [ ] User login works
- [ ] JWT token is stored
- [ ] Protected routes work
- [ ] Invoice upload works
- [ ] OCR extraction works
- [ ] History page loads
- [ ] Dashboard displays data
- [ ] Logout works

---

## 🔄 Post-Deployment Updates

### After Frontend Deployment

- [ ] Copy frontend URL
- [ ] Update `FRONTEND_URL` in Render backend environment
- [ ] Restart backend service on Render
- [ ] Test CORS is working

### After Backend Changes

- [ ] Commit changes to Git
- [ ] Push to main branch
- [ ] Render auto-deploys
- [ ] Verify deployment in Render dashboard
- [ ] Test API endpoints

### After Frontend Changes

- [ ] Commit changes to Git
- [ ] Push to main branch
- [ ] Vercel/Netlify auto-deploys
- [ ] Verify deployment in dashboard
- [ ] Test frontend functionality

---

## 📊 Monitoring

### Backend Monitoring (Render)

- [ ] Check Render dashboard for service status
- [ ] Review deployment logs
- [ ] Monitor error logs
- [ ] Check resource usage

### Frontend Monitoring (Vercel/Netlify)

- [ ] Check deployment status
- [ ] Review build logs
- [ ] Monitor analytics (if enabled)
- [ ] Check error tracking

### Database Monitoring (MongoDB Atlas)

- [ ] Check cluster status
- [ ] Monitor connection count
- [ ] Review slow queries
- [ ] Check storage usage

---

## 🐛 Common Issues & Solutions

### Issue: CORS Error

**Symptoms:** "Access-Control-Allow-Origin" error in browser console

**Solution:**
1. Verify `FRONTEND_URL` is set correctly in backend
2. Ensure no trailing slash in URL
3. Restart backend service
4. Clear browser cache

### Issue: API Connection Failed

**Symptoms:** "Network Error" or "Failed to fetch"

**Solution:**
1. Check `VITE_API_URL` is set in frontend
2. Verify backend is running: test `/health` endpoint
3. Check browser network tab for exact error
4. Verify HTTPS is used (not HTTP)

### Issue: Database Connection Failed

**Symptoms:** "MongooseError" in backend logs

**Solution:**
1. Verify `MONGODB_URI` is correct
2. Check MongoDB Atlas network access
3. Verify database user credentials
4. Test connection string locally

### Issue: JWT Authentication Failed

**Symptoms:** "Invalid token" or "Unauthorized"

**Solution:**
1. Verify `JWT_SECRET` is set in backend
2. Check token is being sent in Authorization header
3. Verify token format: `Bearer <token>`
4. Check token expiration

### Issue: File Upload Failed

**Symptoms:** 413 error or "File too large"

**Solution:**
1. Check `MAX_FILE_SIZE` environment variable
2. Verify hosting platform file size limits
3. Check file type is allowed
4. Test with smaller file

---

## 🎉 Success Criteria

Your deployment is successful when:

- [ ] Backend health check returns 200 OK
- [ ] Frontend loads without errors
- [ ] User can signup and login
- [ ] User can upload invoice
- [ ] OCR extraction works
- [ ] Data is saved to database
- [ ] History page shows uploaded invoices
- [ ] Dashboard displays analytics
- [ ] No CORS errors in console
- [ ] HTTPS is enforced on all pages

---

## 📞 Support Resources

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Netlify Docs**: https://docs.netlify.com
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com
- **Vite Docs**: https://vitejs.dev/guide

---

## 🚀 You're Ready!

Once all items are checked, your Invoice OCR application is production-ready!

**Your Live URLs:**
- Backend: https://ai-invoice-2f1n.onrender.com
- Frontend: https://your-frontend-url.vercel.app
- Database: MongoDB Atlas

Share your app and start processing invoices! 🎊
