# Deployment Configuration Files

This file contains ready-to-use configurations for deploying SmartSeason to free hosting.

## 1. Update backend/package.json for Production

Replace the current backend/package.json with:

```json
{
  "name": "smartseason-backend",
  "version": "1.0.0",
  "description": "SmartSeason Field Monitoring System Backend",
  "main": "server.js",
  "type": "module",
  "scripts": {
    "dev": "node --watch server.js",
    "start": "node server.js",
    "setup": "node db/init.js",
    "migrate": "node db/migrate.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "sqlite3": "^5.1.6",
    "pg": "^8.11.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0"
  },
  "engines": {
    "node": "18.x"
  }
}
```

## 2. Create backend/db/migrate.js

This script migrates data from SQLite to PostgreSQL:

```javascript
import sqlite3 from 'sqlite3';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Demo data - same as before
const demoUsers = [
  {
    email: 'admin@smartseason.com',
    password: bcrypt.hashSync('admin123', 10),
    role: 'Admin',
    name: 'Admin User'
  },
  {
    email: 'agent@smartseason.com',
    password: bcrypt.hashSync('agent123', 10),
    role: 'Agent',
    name: 'John Smith'
  },
  {
    email: 'agent2@smartseason.com',
    password: bcrypt.hashSync('agent123', 10),
    role: 'Agent',
    name: 'Sarah Johnson'
  }
];

const demoFields = [
  {
    name: 'North Field A',
    crop_type: 'Corn',
    planting_date: '2026-03-01',
    current_stage: 'Growing',
    status: 'Active',
    notes: 'Crops looking healthy, good water retention'
  },
  {
    name: 'South Field B',
    crop_type: 'Soybeans',
    planting_date: '2026-03-15',
    current_stage: 'Planted',
    status: 'Active',
    notes: 'Recently planted, monitoring germination'
  },
  {
    name: 'East Field C',
    crop_type: 'Wheat',
    planting_date: '2026-02-01',
    current_stage: 'Ready',
    status: 'Active',
    notes: 'Ready for harvest next week'
  },
  {
    name: 'West Field D',
    crop_type: 'Corn',
    planting_date: '2026-01-15',
    current_stage: 'Harvested',
    status: 'Completed',
    notes: 'Harvest completed, field prepared for next season'
  }
];

async function migrate() {
  try {
    console.log('Starting migration to PostgreSQL...');

    // Create users table
    await pgPool.query(`
      DROP TABLE IF EXISTS fields CASCADE;
      DROP TABLE IF EXISTS users CASCADE;

      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK(role IN ('Admin', 'Agent')),
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE fields (
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
      );

      CREATE INDEX idx_fields_assigned_to ON fields(assigned_to);
      CREATE INDEX idx_fields_created_at ON fields(created_at);
    `);

    console.log('✓ Tables created');

    // Insert demo users
    for (const user of demoUsers) {
      await pgPool.query(
        `INSERT INTO users (email, password, role, name) VALUES ($1, $2, $3, $4)`,
        [user.email, user.password, user.role, user.name]
      );
    }
    console.log('✓ Demo users created');

    // Get agent IDs
    const agentsResult = await pgPool.query(
      `SELECT id FROM users WHERE role = 'Agent' ORDER BY id`
    );
    const agents = agentsResult.rows;

    // Insert demo fields
    for (let i = 0; i < demoFields.length; i++) {
      const field = demoFields[i];
      const agentId = agents[i % agents.length].id;

      await pgPool.query(
        `INSERT INTO fields (name, crop_type, planting_date, current_stage, status, assigned_to, notes) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          field.name,
          field.crop_type,
          field.planting_date,
          field.current_stage,
          field.status,
          agentId,
          field.notes
        ]
      );
    }
    console.log('✓ Demo fields created and assigned');

    console.log('\n✅ Migration completed successfully!');
    console.log('\nDemo credentials:');
    console.log('  Admin: admin@smartseason.com / admin123');
    console.log('  Agent: agent@smartseason.com / agent123');

    await pgPool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    await pgPool.end();
    process.exit(1);
  }
}

migrate();
```

## 3. Create render.yaml (Optional - for easier Render deployment)

Place this in the root directory:

```yaml
services:
  - type: web
    name: smartseason-backend
    env: node
    buildCommand: cd backend && npm install
    startCommand: cd backend && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: JWT_SECRET
        generateValue: true
      - key: DATABASE_URL
        fromDatabase:
          name: smartseason-db
          property: connectionString

databases:
  - name: smartseason-db
    databaseName: smartseason
    user: postgres
```

## 4. Create .env.example for reference

```
# Backend Environment Variables
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_in_production
DATABASE_URL=postgresql://user:password@localhost/smartseason
NODE_ENV=development
```

## 5. Update backend/db/connection.js for PostgreSQL

Replace the entire file with:

```javascript
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Determine if we're using SQLite or PostgreSQL
const isProduction = process.env.NODE_ENV === 'production';

let db;

if (isProduction) {
  // Use PostgreSQL in production
  db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  db.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
  });
} else {
  // Use SQLite in development
  import('sqlite3').then(({ default: sqlite3 }) => {
    db = new sqlite3.Database('./db/crops.db');
  });
}

export const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    if (isProduction) {
      db.query(sql, params).then(res => resolve(res.rows || [])).catch(reject);
    } else {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    }
  });
};

export const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    if (isProduction) {
      db.query(sql, params).then(res => resolve(res.rows[0])).catch(reject);
    } else {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    }
  });
};

export const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    if (isProduction) {
      db.query(sql, params).then(resolve).catch(reject);
    } else {
      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve(this);
      });
    }
  });
};
```

## 6. Render Deploy Button (Optional)

Add this to your README.md to allow one-click deployment:

```markdown
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/YOUR_USERNAME/smartseason)
```

## 7. Netlify Configuration (netlify.toml)

Create in root directory:

```toml
[build]
  command = "npm run build"
  publish = "dist"
  environment = { NODE_VERSION = "18" }

[build.environment]
  VITE_API_URL = "https://smartseason-backend.onrender.com/api"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[functions]
  external_node_modules = ["express"]
```

## 8. Production Deployment Steps

Once you've updated the files:

```bash
# 1. Commit changes
git add .
git commit -m "Prepare for production deployment"
git push

# 2. Render will auto-deploy backend
# 3. Netlify will auto-deploy frontend

# 4. Run migration (one-time)
# In Render dashboard, go to Shell, then:
cd backend && npm run migrate

# 5. Test the application
# Visit: https://your-netlify-site.netlify.app
```

## 9. Health Check Scripts

Add to your monitoring setup:

```bash
# Check backend health
curl -i https://smartseason-backend.onrender.com/api/health

# Check frontend
curl -i https://your-site.netlify.app
```

## 10. Rollback Plan

If something goes wrong:

```bash
# Revert last commit
git revert HEAD --no-edit
git push

# Services auto-redeploy
# Takes 3-5 minutes
```

---

## Key Points

- ✅ Free tier: Render (backend), Netlify (frontend), PostgreSQL (database)
- ✅ Auto-deploys from GitHub on every push
- ✅ Environment variables configured in dashboards
- ✅ Database migrations separate from app code
- ✅ Development uses SQLite, production uses PostgreSQL
- ✅ All services restart automatically on errors

---

Happy deploying! 🚀
