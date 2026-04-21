import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'crops.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
  console.log('Connected to SQLite database');
});

db.serialize(() => {
  // Read and execute schema
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  const statements = schema.split(';').filter(s => s.trim());
  
  statements.forEach(statement => {
    if (statement.trim()) {
      db.run(statement, (err) => {
        if (err) console.error('Schema error:', err);
      });
    }
  });

  // Seed demo data
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

  demoUsers.forEach(user => {
    db.run(
      `INSERT OR IGNORE INTO users (email, password, role, name) VALUES (?, ?, ?, ?)`,
      [user.email, user.password, user.role, user.name],
      (err) => {
        if (err) console.error('Error inserting user:', err);
      }
    );
  });

  // Seed demo fields
  db.all('SELECT id FROM users WHERE role = ?', ['Agent'], (err, agents) => {
    if (agents && agents.length > 0) {
      const demoFields = [
        {
          name: 'North Field A',
          crop_type: 'Corn',
          planting_date: '2026-03-01',
          current_stage: 'Growing',
          status: 'Active',
          assigned_to: agents[0].id,
          notes: 'Crops looking healthy, good water retention'
        },
        {
          name: 'South Field B',
          crop_type: 'Soybeans',
          planting_date: '2026-03-15',
          current_stage: 'Planted',
          status: 'Active',
          assigned_to: agents[0].id,
          notes: 'Recently planted, monitoring germination'
        },
        {
          name: 'East Field C',
          crop_type: 'Wheat',
          planting_date: '2026-02-01',
          current_stage: 'Ready',
          status: 'Active',
          assigned_to: agents[1].id,
          notes: 'Ready for harvest next week'
        },
        {
          name: 'West Field D',
          crop_type: 'Corn',
          planting_date: '2026-01-15',
          current_stage: 'Harvested',
          status: 'Completed',
          assigned_to: agents[1].id,
          notes: 'Harvest completed, field prepared for next season'
        }
      ];

      demoFields.forEach(field => {
        db.run(
          `INSERT OR IGNORE INTO fields (name, crop_type, planting_date, current_stage, status, assigned_to, notes) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [field.name, field.crop_type, field.planting_date, field.current_stage, field.status, field.assigned_to, field.notes],
          (err) => {
            if (err) console.error('Error inserting field:', err);
          }
        );
      });
    }
  });

  setTimeout(() => {
    console.log('Database initialized successfully with demo data');
    db.close();
  }, 1000);
});

db.on('error', (err) => {
  console.error('Database error:', err);
});
