const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_DIR = path.join(__dirname, '../../data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.join(DB_DIR, 'carepal.db');

const sqliteDb = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', DB_PATH);
  }
});

// Promise wrapper for db operations
const db = {
  get: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      sqliteDb.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },
  all: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      sqliteDb.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },
  run: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      sqliteDb.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  },
  exec: (sql) => {
    return new Promise((resolve, reject) => {
      sqliteDb.exec(sql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  },
  close: () => {
    return new Promise((resolve, reject) => {
      sqliteDb.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
};

async function initSchema() {
  await db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS nurses (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      specialization TEXT NOT NULL,
      phone TEXT,
      experience_years INTEGER DEFAULT 3,
      avatar_seed TEXT,
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS visits (
      id TEXT PRIMARY KEY,
      token TEXT UNIQUE NOT NULL,
      nurse_id TEXT NOT NULL,
      patient_name TEXT NOT NULL,
      family_contact_name TEXT,
      family_phone TEXT,
      service_type TEXT NOT NULL,
      visit_date DATE NOT NULL,
      city TEXT DEFAULT 'Bangalore',
      status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'submitted', 'expired'
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (nurse_id) REFERENCES nurses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS feedback (
      id TEXT PRIMARY KEY,
      visit_id TEXT UNIQUE NOT NULL,
      nurse_id TEXT NOT NULL,
      rating_punctuality INTEGER NOT NULL,
      rating_care_quality INTEGER NOT NULL,
      rating_hygiene INTEGER NOT NULL,
      rating_behaviour INTEGER NOT NULL,
      rating_overall REAL NOT NULL,
      nps_score INTEGER NOT NULL, -- 0 to 10
      comment TEXT,
      comment_censored TEXT,
      has_abusive_language INTEGER DEFAULT 0,
      flagged_words TEXT, -- comma-separated
      sentiment TEXT NOT NULL, -- 'positive', 'neutral', 'negative'
      sentiment_score REAL DEFAULT 0,
      requires_followup INTEGER DEFAULT 0,
      followup_status TEXT DEFAULT 'unassigned', -- 'unassigned', 'in_progress', 'resolved', 'no_action_needed'
      followup_notes TEXT,
      followup_updated_at DATETIME,
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (visit_id) REFERENCES visits(id) ON DELETE CASCADE,
      FOREIGN KEY (nurse_id) REFERENCES nurses(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_visits_token ON visits(token);
    CREATE INDEX IF NOT EXISTS idx_visits_status ON visits(status);
    CREATE INDEX IF NOT EXISTS idx_feedback_nurse ON feedback(nurse_id);
    CREATE INDEX IF NOT EXISTS idx_feedback_followup ON feedback(requires_followup, followup_status);
    CREATE INDEX IF NOT EXISTS idx_feedback_submitted ON feedback(submitted_at);
  `);
}

module.exports = {
  db,
  initSchema,
  DB_PATH
};
