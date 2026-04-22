# SmartSeason - Quick Deployment Checklist

Use this checklist to deploy your application step-by-step.

## 📋 Pre-Deployment (5 minutes)

- [ ] **Git installed** → Download from https://git-scm.com/download/win
- [ ] **GitHub account** → Create at https://github.com/signup
- [ ] **Netlify account** → Sign up at https://netlify.com (use GitHub)
- [ ] **Render account** → Sign up at https://render.com (use GitHub)

---

## 🔧 Step 1: Push to GitHub (10 minutes)

Open PowerShell in `C:\Users\keter\Documents\crops`:

```powershell
# Configure Git
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Initialize repository
git init
git add .
git commit -m "SmartSeason - Initial commit"

# Create GitHub repo and get URL, then:
git remote add origin https://github.com/YOUR_USERNAME/smartseason.git
git branch -M main
git push -u origin main
```

✅ **Result:** Your code is now on GitHub

---

## 🌐 Step 2: Deploy Backend on Render (15 minutes)

### 2A: Create Database
1. Go to https://render.com
2. Click **"New"** → **"PostgreSQL"**
3. **Name:** `smartseason-db`
4. Select **Free tier**
5. Click **"Create Database"**
6. **Copy the Internal Database URL** (save it - you'll need it)

### 2B: Deploy Backend Service
1. Click **"New"** → **"Web Service"**
2. Select your `smartseason` GitHub repo
3. **Name:** `smartseason-backend`
4. **Runtime:** Node
5. **Build Command:** `cd backend && npm install`
6. **Start Command:** `cd backend && npm start`
7. Click **"Advanced"**
8. **Add Environment Variables:**
   ```
   PORT=10000
   JWT_SECRET=change_this_to_a_random_string_12345
   DATABASE_URL=postgresql://... (from step 2A)
   NODE_ENV=production
   ```
9. Click **"Create Web Service"**
10. Wait 3-5 minutes for deployment

✅ **Result:** Backend running at `https://smartseason-backend.onrender.com`

---

## 🎨 Step 3: Deploy Frontend on Netlify (10 minutes)

### 3A: Configure Environment
Create file `frontend/.env.production`:
```
VITE_API_URL=https://smartseason-backend.onrender.com/api
```

Push to GitHub:
```powershell
git add .
git commit -m "Add production environment"
git push
```

### 3B: Deploy to Netlify
1. Go to https://netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Select **GitHub** provider
4. Choose your `smartseason` repo
5. **Build settings:**
   - Base directory: (leave empty)
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click **"Advanced"** → **"New variable"**
7. **Add:**
   ```
   VITE_API_URL = https://smartseason-backend.onrender.com/api
   ```
8. Click **"Deploy site"**
9. Wait 2-3 minutes

✅ **Result:** Frontend live at `https://your-site-name.netlify.app`

---

## 🧪 Step 4: Test Everything (5 minutes)

### Test 1: Backend Health
```powershell
# In PowerShell
Invoke-WebRequest -Uri "https://smartseason-backend.onrender.com/api/health"
```
Should return: `{"status":"ok"}`

### Test 2: Login
```powershell
Invoke-WebRequest -Uri "https://smartseason-backend.onrender.com/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"admin@smartseason.com","password":"admin123"}'
```
Should return token and user info

### Test 3: Open Frontend
Visit: `https://your-site-name.netlify.app`

**Login with:**
- Email: `admin@smartseason.com`
- Password: `admin123`

Try:
- [ ] View dashboard
- [ ] Create a new field
- [ ] See fields list update

✅ **Success!** Your app is live!

---

## 📚 Next Steps

1. **Custom Domain** (optional)
   - In Netlify: Settings → Domain management → Add custom domain
   - Follow DNS setup instructions

2. **Update Seed Data**
   - Edit `backend/db/init.js` to customize demo data
   - Run migrations on Render

3. **Monitor Uptime**
   - Go to https://uptimerobot.com
   - Add your backend URL
   - Free monitoring every 5 minutes

4. **Collect Feedback**
   - Share your app URL
   - Test with real users
   - Track issues

---

## 🆘 Common Issues & Fixes

### Frontend blank page or "Cannot reach server"
1. Check VITE_API_URL is correct in Netlify env vars
2. Wait 5 minutes after changing env vars
3. Hard refresh: `Ctrl+Shift+R`

### Backend returns 404
1. Check service is running in Render dashboard
2. Free tier hibernates - first request takes 30 seconds
3. Check DATABASE_URL environment variable

### Login fails
1. Verify backend is responding (test from Step 4)
2. Check credentials: `admin@smartseason.com` / `admin123`
3. Clear browser localStorage: `Ctrl+Shift+Delete` → Cookies/Site Data

### Database connection error
1. Verify DATABASE_URL is copied correctly (no spaces)
2. Ensure PostgreSQL service is running in Render
3. Restart Web Service in Render dashboard

### Build fails on Netlify
1. Check build logs in Netlify dashboard
2. Ensure all dependencies are in package.json
3. Try: `npm audit fix --force` and push again

---

## 📞 Support Resources

- **Netlify Docs:** https://docs.netlify.com
- **Render Docs:** https://render.com/docs
- **React Docs:** https://react.dev
- **Express Docs:** https://expressjs.com

---

## ✨ You're Done!

Your SmartSeason Field Monitoring System is now:
- ✅ Deployed globally
- ✅ Production-ready
- ✅ Using free hosting
- ✅ Auto-updating from GitHub
- ✅ Monitoring real crop fields

Share the URL with your team and start tracking fields! 🚜
