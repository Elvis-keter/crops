import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

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