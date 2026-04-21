# Quick Start Guide

This guide will help you get the SmartSeason Field Monitoring System up and running quickly.

## Prerequisites
- Node.js v16 or higher
- npm 

## One-Step Setup (Automated)

From the root directory of the project:

```bash
# Install frontend dependencies
npm install

# Navigate to backend and install dependencies
cd backend
npm install

# Initialize database with demo data
npm run setup

# Start backend server (in backend directory)
npm run dev

# In a new terminal, go back to root and start frontend
cd ..
npm run dev
```

## Manual Setup

### Step 1: Backend Setup
```bash
cd backend
npm install
npm run setup  # Initialize SQLite database with demo data
npm run dev    # Start server on http://localhost:5000
```

### Step 2: Frontend Setup (in new terminal)
```bash
npm install
npm run dev    # Start frontend on http://localhost:5173
```

## Test Credentials

**Admin User:**
- Email: `admin@smartseason.com`
- Password: `admin123`

**Field Agent User:**
- Email: `agent@smartseason.com`
- Password: `agent123`

## First Steps After Login

### As Admin:
1. View the dashboard - see all fields and their statuses
2. Click "Create Field" to add a new field
3. Fill in: Field Name, Crop Type, and Planting Date
4. Click on a field to view details
5. Click "Assign Agent" to assign the field to an agent

### As Agent:
1. View your assigned fields on the dashboard
2. Click on a field to open its details
3. Update the field stage as the crop progresses (Planted → Growing → Ready → Harvested)
4. Add notes about field conditions
5. Click "Save Update" to record your changes

## Common Issues & Solutions

### Backend won't start
- Check if port 5000 is already in use
- Ensure Node.js is installed: `node --version`
- Delete `backend/db/crops.db` and run `npm run setup` again

### Frontend won't connect to backend
- Check CORS: Backend should be running on localhost:5000
- Check frontend is trying to connect to `http://localhost:5000/api`
- Verify backend is actually running (should see logs in terminal)

### Database issues
- Reinitialize: `rm backend/db/crops.db && cd backend && npm run setup`
- Check SQLite is installed: `npm list sqlite3`

### Login not working
- Verify you're using the correct demo credentials
- Check backend server is running
- Clear browser localStorage and try again

## Build for Production

### Frontend Build
```bash
npm run build
# Creates optimized build in dist/ folder
```

### Backend Production
```bash
# Set environment variables
export NODE_ENV=production
export JWT_SECRET=your_production_secret_key

# Start server
npm start
```

## Project Structure

- **Frontend** (root): React/Vite app
  - `src/pages/` - Page components
  - `src/services/` - API and auth utilities
  - `src/App.jsx` - Main routing component

- **Backend** (backend/): Node.js/Express API
  - `routes/` - API endpoint definitions
  - `controllers/` - Business logic
  - `db/` - Database setup and schema
  - `middleware/` - Authentication/authorization

## Features Overview

✅ User authentication (Admin & Agent roles)
✅ Create and manage fields
✅ Assign fields to agents
✅ Track field progress through growth stages
✅ Automatic status calculation
✅ Role-based dashboards
✅ Real-time field updates

## Need Help?

Refer to the main [README.md](./README.md) for:
- Detailed API documentation
- Design decisions and rationale
- Database schema information
- Future enhancement ideas
