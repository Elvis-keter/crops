# SmartSeason - Complete Documentation

Welcome to the SmartSeason Field Monitoring System! This folder contains comprehensive documentation for development, deployment, and maintenance.

## 📚 Documentation Files

### Getting Started
- **[README.md](./README.md)** - Main documentation with features, tech stack, and design decisions
- **[QUICKSTART.md](./QUICKSTART.md)** - Fast setup guide (5 minutes to running locally)

### Development
- **Running Locally**
  ```bash
  # Terminal 1 - Backend
  cd backend && npm run dev
  
  # Terminal 2 - Frontend
  npm run dev
  ```
- **Default URLs**
  - Frontend: http://localhost:5173
  - Backend: http://localhost:5000
  - API: http://localhost:5000/api

### Deployment (Free Hosting)
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment guide for Netlify + Render
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Step-by-step checklist format
- **[DEPLOYMENT_CONFIG.md](./DEPLOYMENT_CONFIG.md)** - Ready-to-use configuration files

### Demo Credentials
```
Admin Account:
  Email: admin@smartseason.com
  Password: admin123

Field Agent:
  Email: agent@smartseason.com
  Password: agent123
```

---

## 🚀 Quick Start Options

### Option 1: Run Locally (Recommended for Development)
```bash
cd backend && npm install && npm run setup && npm run dev
# In another terminal:
npm run dev
# Visit http://localhost:5173
```

### Option 2: Deploy to Free Hosting
1. Follow [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
2. Push to GitHub → Auto-deploy on Render/Netlify
3. Takes ~15 minutes total

### Option 3: Docker (For Production)
```bash
docker-compose up
```

---

## 📋 Project Structure

```
crops/
├── README.md                          # Main docs
├── QUICKSTART.md                      # 5-minute setup
├── DEPLOYMENT.md                      # Full deployment guide
├── DEPLOYMENT_CHECKLIST.md            # Step-by-step checklist
├── DEPLOYMENT_CONFIG.md               # Config file templates
│
├── backend/                           # Node.js/Express API
│   ├── server.js                      # Main server file
│   ├── package.json                   # Dependencies
│   ├── controllers/
│   │   ├── authController.js
│   │   └── fieldController.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── fields.js
│   ├── middleware/
│   │   └── auth.js                    # JWT authentication
│   └── db/
│       ├── schema.sql
│       ├── init.js                    # Database seed
│       ├── connection.js              # DB wrapper
│       └── crops.db                   # SQLite database
│
├── src/                               # React frontend
│   ├── App.jsx                        # Main app + routing
│   ├── main.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── AgentDashboard.jsx
│   │   ├── FieldDetail.jsx
│   │   └── CreateField.jsx
│   ├── services/
│   │   ├── api.js                     # API client
│   │   └── authContext.jsx            # Auth state
│   ├── index.css                      # Tailwind
│   └── App.css
│
├── package.json                       # Frontend deps
├── vite.config.js                     # Vite config
├── tailwind.config.js                 # Tailwind config
└── index.html
```

---

## 🎯 Key Features

### User Management
- ✅ Two roles: Admin and Field Agent
- ✅ JWT token authentication
- ✅ Secure password hashing (bcryptjs)
- ✅ Role-based access control

### Field Management
- ✅ Create new fields
- ✅ Track field information (name, crop type, planting date)
- ✅ Assign fields to agents
- ✅ Update field stage (Planted → Growing → Ready → Harvested)
- ✅ Add observation notes

### Status Tracking
- ✅ Automatic status calculation
- ✅ Status types: Active, At Risk, Completed
- ✅ Real-time status updates
- ✅ Dashboard statistics

### User Interfaces
- ✅ Admin Dashboard - all fields overview
- ✅ Agent Dashboard - assigned fields only
- ✅ Field Detail page - full field management
- ✅ Create Field form - new field registration
- ✅ Responsive Tailwind CSS design

---

## 🔧 Configuration

### Environment Variables

**Development (.env)**
```
PORT=5000
JWT_SECRET=your_development_secret_key
NODE_ENV=development
```

**Production (Render/Railway)**
```
PORT=10000
JWT_SECRET=production_random_secret_key_here
DATABASE_URL=postgresql://...
NODE_ENV=production
```

### Database

**Development:** SQLite (automatic with npm run setup)
**Production:** PostgreSQL (free tier on Render)

---

## 📊 API Documentation

### Authentication Endpoints
```
POST   /api/auth/login        - Login user
GET    /api/auth/me           - Get current user (requires token)
GET    /api/auth/agents       - Get all agents (admin only)
```

### Field Endpoints
```
GET    /api/fields            - Get fields (filtered by role)
POST   /api/fields            - Create field (admin only)
GET    /api/fields/:id        - Get field details
PUT    /api/fields/:id        - Update field
PUT    /api/fields/:id/assign - Assign field to agent (admin only)
GET    /api/fields/agent/assigned - Get assigned fields for agent
```

---

## 🧪 Testing

### Local Testing
1. Login with admin credentials
2. Create a new field
3. Assign to an agent
4. Logout and login as agent
5. Update the field stage
6. Verify changes on admin dashboard

### Production Testing
1. Visit: https://your-netlify-site.netlify.app
2. Login with demo credentials
3. Test all CRUD operations
4. Check API responses in browser console

---

## 🐛 Troubleshooting

### Local Issues
| Problem | Solution |
|---------|----------|
| Port already in use | Kill process: `taskkill /PID <pid> /F` |
| Module not found | Run: `npm install` in both root and backend |
| Database error | Delete `backend/db/crops.db` and run `npm run setup` |
| CORS error | Ensure backend is running on port 5000 |

### Deployment Issues
| Problem | Solution |
|---------|----------|
| Frontend won't connect | Check VITE_API_URL in Netlify env vars |
| Backend won't start | Check DATABASE_URL and JWT_SECRET on Render |
| Slow first load | Free tier hibernates - normal, takes 30 seconds |
| Build fails | Run `npm install` locally, commit, and push again |

---

## 📈 Performance

### Local Development
- Frontend: Vite dev server with HMR - near-instant updates
- Backend: Node --watch auto-restart on file changes
- Database: SQLite in-memory caching

### Production (Free Tier)
- Frontend: Static files on Netlify CDN
- Backend: Node.js on Render with 0.5GB RAM
- Database: PostgreSQL with free tier limits
- Performance: Adequate for 50-100 concurrent users

---

## 🔒 Security

### Implemented
- ✅ JWT token authentication (24-hour expiration)
- ✅ Password hashing with bcryptjs (10 rounds)
- ✅ CORS configuration
- ✅ Environment variable protection
- ✅ SQL injection protection (parameterized queries)
- ✅ Role-based access control

### Not Implemented (Production Enhancement)
- ⚠️ HTTPS enforcement (auto on Netlify/Render)
- ⚠️ Rate limiting
- ⚠️ Request validation middleware
- ⚠️ Audit logging
- ⚠️ 2FA authentication

---

## 📱 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## 🌍 Deployment Options

### Recommended (What's Configured)
- **Frontend:** Netlify (free tier)
- **Backend:** Render (free tier)
- **Database:** PostgreSQL on Render

### Alternatives
- Frontend: Vercel, GitHub Pages
- Backend: Railway, Heroku (paid), Fly.io
- Database: MongoDB Atlas, Supabase, Neon

---

## 📞 Support

### Documentation
- React: https://react.dev
- Express: https://expressjs.com
- Tailwind: https://tailwindcss.com
- Render: https://render.com/docs
- Netlify: https://docs.netlify.com

### Community
- GitHub Issues: Report bugs and request features
- Stack Overflow: Tag questions with react, express, node

---

## 📄 License

This project is provided as-is for educational and commercial use.

---

## ✨ Next Steps

1. **Local Development**
   - Follow [QUICKSTART.md](./QUICKSTART.md)
   - Make code changes
   - Test locally

2. **Deployment**
   - Follow [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
   - Push to GitHub
   - Auto-deploy on Render/Netlify

3. **Production Monitoring**
   - Set up uptime monitoring
   - Monitor error logs
   - Track user feedback

4. **Enhancements**
   - Add features based on feedback
   - Improve UI/UX
   - Scale infrastructure as needed

---

## 🎉 You're All Set!

Your SmartSeason Field Monitoring System is ready to:
- ✅ Track crop fields in real-time
- ✅ Manage field agents and assignments
- ✅ Monitor field progress through growth stages
- ✅ Generate status reports and insights
- ✅ Scale to production workloads

Happy farming! 🚜
