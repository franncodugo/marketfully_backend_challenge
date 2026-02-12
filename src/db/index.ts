import Database from 'better-sqlite3';
import path from 'path';

// db file creation.
const dbPath = path.resolve(__dirname, '../../houses.db');
const db = new Database(dbPath);

// opt.
db.pragma('journal_mode = WAL');

export default db;

export const initDb = () => {
  // Propierties table
  db.exec(`
    CREATE TABLE IF NOT EXISTS properties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      status TEXT,
      price REAL,
      bed INTEGER,
      bath INTEGER,
      acre_lot REAL,
      full_address TEXT,
      street TEXT,
      city TEXT,
      state TEXT,
      zip_code TEXT,
      house_size REAL,
      sold_date TEXT,
      state_code TEXT,
      price_per_sq_ft REAL,
      price_per_acre REAL
    );
    
    CREATE INDEX IF NOT EXISTS idx_zip ON properties(zip_code);
  `);

  // Cache table for zip codes
  db.exec(`
    CREATE TABLE IF NOT EXISTS zip_cache (
      zip_code TEXT PRIMARY KEY,
      data TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('DB initialized.');
};