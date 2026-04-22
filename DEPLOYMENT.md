# SmartSeason - Deployment Guide (Free Hosting)

This guide covers deploying the SmartSeason Field Monitoring System to free hosting services.

## Overview

The application has two parts to deploy:
- **Frontend** (React/Vite) → Netlify or Vercel
- **Backend** (Node.js/Express) → Render, Railway, or Heroku
- **Database** (SQLite → MongoDB Atlas)

---

## Part 1: Prepare for Deployment

### Step 1: Install Git
```bash
# Download and install from: https://git-scm.com/download/win
```

### Step 2: Initialize Git Repository
```bash
cd c:\Users\keter\Documents\crops
git init
git add .
git commit -m "Initial commit - SmartSeason application"
```

### Step 3: Create GitHub Account
1. Go to https://github.com/signup
2. Create a free account
3. Create a new repository named `smartseason`
4. Don't initialize with README (we already have one)

### Step 4: Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/smartseason.git
git branch -M main
git push -u origin main
```

---

## Part 2: Backend Deployment (Using Render - Recommended for Free Tier)

### Why Render?
- Free tier with 0.5GB RAM
- Auto-deploys from GitHub
- Built-in environment variables
- PostgreSQL database available

### Step 1: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub account
3. Authorize Render

### Step 2: Create PostgreSQL Database
1. Click "New" → "PostgreSQL"
2. Name: `smartseason-db`
3. Select free tier
4. Click "Create Database"
5. Note the **Internal Database URL** (will look like: `postgresql://...`)

### Step 3: Deploy Backend Service
1. Click "New" → "Web Service"
2. Connect to your GitHub repository
3. Fill in:
   - **Name:** `smartseason-backend`
   - **Runtime:** Node
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
4. Click "Advanced"
5. Add Environment Variables:
   ```
   PORT=10000
   JWT_SECRET=your_production_secret_key_12345
   DATABASE_URL=<paste PostgreSQL URL from step 2>
   NODE_ENV=production
   ```
6. Click "Create Web Service"
7. Wait for deployment (2-3 minutes)
8. Note the backend URL (will be like: `https://smartseason-backend.onrender.com`)

### Step 4: Update Backend for PostgreSQL

Since we're using PostgreSQL instead of SQLite, update `backend/db/connection.js`:

```javascript
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export const dbAll = (sql, params = []) => {
  return pool.query(sql, params).then(res => res.rows);
};

export const dbGet = (sql, params = []) => {
  return pool.query(sql, params).then(res => res.rows[0]);
};

export const dbRun = (sql, params = []) => {
  return pool.query(sql, params);
};
```

Add to `backend/package.json` dependencies:
```json
"pg": "^8.11.0"
```

Commit and push:
```bash
git add .
git commit -m "Configure for PostgreSQL deployment"
git push
```

Render will automatically redeploy.

---

## Part 3: Frontend Deployment (Using Netlify)

### Step 1: Create Netlify Account
1. Go to https://netlify.com
2. Click "Sign up"
3. Choose "GitHub" and authorize
4. Skip team creation

### Step 2: Deploy Frontend
1. Click "Add new site" → "Import an existing project"
2. Select GitHub provider
3. Select your `smartseason` repository
4. Fill in build settings:
   - **Base directory:** (leave empty)
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Click "Advanced" → "New variable"
6. Add variable:
   ```
   VITE_API_URL=https://smartseason-backend.onrender.com/api
   ```
   (Replace with your actual Render backend URL)
7. Click "Deploy site"
8. Wait for build (2-3 minutes)
9. Your site URL will be: `https://your-site-name.netlify.app`

### Step 3: Configure Custom Domain (Optional)
1. In Netlify dashboard, click "Site settings"
2. Click "Domain management"
3. Add your custom domain
4. Update DNS records as instructed

---

## Part 4: Database Migration

### Migrate Data from SQLite to PostgreSQL

Create migration script `backend/migrate.js`:

```javascript
import sqlite3 from 'sqlite3';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Pool } = pg;

const sqliteDb = new sqlite3.Database('./db/crops.db');
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Run migrations
async function migrate() {
  try {
    // Create tables in PostgreSQL
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK(role IN ('Admin', 'Agent')),
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS fields (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        crop_type VARCHAR(255) NOT NULL,
        planting_date DATE NOT NULL,
        current_stage VARCHAR(50) NOT NULL CHECK(current_stage IN ('Planted', 'Growing', 'Ready', 'Harvested')) DEFAULT 'Planted',
        status VARCHAR(50) NOT NULL CHECK(status IN ('Active', 'At Risk', 'Completed')) DEFAULT 'Active',
        assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Tables created successfully');
    await pgPool.end();
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

migrate();
```

Run locally:
```bash
VITE_API_URL=http://localhost:5000/api node backend/migrate.js
```

---

## Part 5: Update Environment Variables

### Frontend (.env.production)
```
VITE_API_URL=https://smartseason-backend.onrender.com/api
```

### Backend (Render Dashboard)
```
PORT=10000
JWT_SECRET=your_production_secret_key_12345
DATABASE_URL=postgresql://...
NODE_ENV=production
```

---

## Part 6: Testing the Deployment

### Test Backend API
```bash
# Replace with your Render URL
curl https://smartseason-backend.onrender.com/api/health
```

Expected response:
```json
{"status": "ok"}
```

### Test Login
```bash
curl -X POST https://smartseason-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@smartseason.com",
    "password": "admin123"
  }'
```

### Access Frontend
Open: `https://your-site-name.netlify.app`

---

## Alternative Hosting Options

### Backend Alternatives:

**Heroku** (deprecated free tier - use paid minimum)
- https://www.heroku.com

**Railway** (Free $5/month credit)
- https://railway.app
- Steps: Sign up → New Project → Deploy from GitHub → Add PostgreSQL

**Vercel** (Can host Node.js with serverless functions)
- https://vercel.com
- Steps: Import project → Configure → Deploy

### Database Alternatives:

**MongoDB Atlas** (Free 512MB)
- https://www.mongodb.com/cloud/atlas
- Steps: Sign up → Create cluster → Get connection string

**Supabase** (Free PostgreSQL 500MB)
- https://supabase.com
- Steps: Sign up → Create project → Copy connection string

**Neon** (Free PostgreSQL)
- https://neon.tech
- Steps: Sign up → Create project → Copy connection string

---

## Troubleshooting

### Frontend Won't Connect to Backend
1. Check `VITE_API_URL` environment variable
2. Verify backend service is running (check Render/Railway dashboard)
3. Clear browser cache and reload

### Backend Errors
1. Check logs in deployment dashboard
2. Verify database is running
3. Check environment variables are set correctly
4. Ensure JWT_SECRET has a value

### Database Connection Issues
1. Verify DATABASE_URL is correct
2. Check if tables were created
3. For PostgreSQL, ensure SSL is configured

### Slow Initial Load (Cold Start)
- Free tier services hibernate after 15 minutes of inactivity
- First request after hibernation takes 30 seconds
- This is normal for free hosting

---

## Deployment Checklist

- [ ] GitHub account created and repository pushed
- [ ] Backend deployed to Render/Railway
- [ ] Frontend deployed to Netlify/Vercel
- [ ] PostgreSQL database created
- [ ] Environment variables configured
- [ ] Backend migrations run
- [ ] Database populated with seed data
- [ ] API endpoints tested
- [ ] Frontend can login and access dashboard
- [ ] Demo credentials work on production

---

## Monitoring & Maintenance

### Keep Services Running
- Render: Free tier sleeps after inactivity - use uptime monitor
- Netlify: Always available
- Database: Always available (unless exceeding free tier limits)

### Uptime Monitoring (Free)
Use a service to ping your backend every 15 minutes:
- https://uptimerobot.com (free tier)
- https://healthchecks.io (free tier)

### Environment Updates
To update production:
```bash
git add .
git commit -m "Production update"
git push origin main
```
Services will auto-redeploy from GitHub.

---

## Cost Breakdown (Monthly)

| Service | Free Tier | Cost |
|---------|-----------|------|
| Netlify | 100GB bandwidth | Free |
| Render | 0.5GB RAM + 5GB storage | Free |
| PostgreSQL (Render) | 90 hours/month | Free |
| GitHub | Unlimited public repos | Free |
| Domain (Optional) | - | $1-15 |
| **Total** | - | **Free** |

---

## Quick Deploy Summary

```bash
# 1. Initialize Git
git init && git add . && git commit -m "Initial"

# 2. Push to GitHub
git remote add origin https://github.com/user/smartseason.git
git push -u origin main

# 3. Render (Backend)
# - Connect GitHub repo
# - Add PostgreSQL
# - Deploy with env vars

# 4. Netlify (Frontend)
# - Connect GitHub repo
# - Set build: npm run build, publish: dist
# - Add VITE_API_URL env var
# - Deploy

# 5. Test
# - Login at netlify-url
# - Create field
# - Verify in dashboard
```

Done! Your app is now live! 🚀
