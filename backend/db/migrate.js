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