-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('Admin', 'Agent')),
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Fields table
CREATE TABLE IF NOT EXISTS fields (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  crop_type TEXT NOT NULL,
  planting_date DATE NOT NULL,
  current_stage TEXT NOT NULL CHECK(current_stage IN ('Planted', 'Growing', 'Ready', 'Harvested')) DEFAULT 'Planted',
  status TEXT NOT NULL CHECK(status IN ('Active', 'At Risk', 'Completed')) DEFAULT 'Active',
  assigned_to INTEGER,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_fields_assigned_to ON fields(assigned_to);
CREATE INDEX IF NOT EXISTS idx_fields_created_at ON fields(created_at);
