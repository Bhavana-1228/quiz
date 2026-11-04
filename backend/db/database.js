import sqlite3 from 'sqlite3';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { SEED_LANGUAGES, SEED_QUESTIONS } from '../seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '..', 'codequest.db');

sqlite3.verbose();
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err.message);
  } else {
    console.log(`Connected to SQLite database at: ${DB_PATH}`);
  }
});

// Promisified helper methods for clean async/await
export const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const getOne = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

// Password hashing utility using standard Node crypto PBKDF2
export const hashPassword = (password, salt = crypto.randomBytes(16).toString('hex')) => {
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
};

export const verifyPassword = (password, storedHash) => {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, originalHash] = storedHash.split(':');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === originalHash;
};

// Initialize Schema and Seed Data
export const initDb = async () => {
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      google_sub TEXT,
      username TEXT UNIQUE,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      display_name TEXT NOT NULL,
      avatar TEXT,
      created_at TEXT NOT NULL,
      xp INTEGER DEFAULT 0,
      streak INTEGER DEFAULT 1,
      last_active_date TEXT,
      daily_goal INTEGER DEFAULT 10,
      daily_progress INTEGER DEFAULT 0,
      preferred_languages TEXT,
      skill_level TEXT DEFAULT 'Intermediate'
    );
  `);

  try {
    await run('ALTER TABLE users ADD COLUMN username TEXT;');
  } catch (err) {
    // Column already exists, safe to ignore
  }

  await run(`
    CREATE TABLE IF NOT EXISTS languages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL,
      icon TEXT,
      color TEXT,
      description TEXT,
      active INTEGER DEFAULT 1,
      topics TEXT NOT NULL
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      language_id TEXT NOT NULL,
      topic TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      prompt TEXT NOT NULL,
      code TEXT,
      options TEXT NOT NULL,
      answer TEXT NOT NULL,
      explanation TEXT NOT NULL,
      status TEXT DEFAULT 'approved',
      created_by TEXT DEFAULT 'system',
      model_metadata TEXT,
      FOREIGN KEY (language_id) REFERENCES languages(id)
    );
  `);

  // STRICT SQL UNIQUE CONSTRAINT ON (user_id, question_id)
  await run(`
    CREATE TABLE IF NOT EXISTS user_question_history (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      first_seen_at TEXT NOT NULL,
      answered_at TEXT,
      selected_answer TEXT,
      is_correct INTEGER,
      UNIQUE(user_id, question_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (question_id) REFERENCES questions(id)
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS quiz_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      language_id TEXT NOT NULL,
      topic TEXT,
      difficulty TEXT NOT NULL,
      question_count INTEGER NOT NULL,
      question_ids TEXT NOT NULL,
      current_index INTEGER DEFAULT 0,
      score INTEGER DEFAULT 0,
      started_at TEXT NOT NULL,
      completed_at TEXT,
      elapsed_seconds INTEGER DEFAULT 0,
      mode TEXT DEFAULT 'fresh',
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS user_answers (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      selected_answer TEXT NOT NULL,
      is_correct INTEGER NOT NULL,
      answered_at TEXT NOT NULL,
      time_spent_seconds INTEGER DEFAULT 0,
      FOREIGN KEY (session_id) REFERENCES quiz_sessions(id)
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS bookmarks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(user_id, question_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (question_id) REFERENCES questions(id)
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      reason TEXT NOT NULL,
      details TEXT,
      created_at TEXT NOT NULL
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS settings (
      user_id TEXT PRIMARY KEY,
      timer_enabled INTEGER DEFAULT 1,
      explanations_enabled INTEGER DEFAULT 1,
      sound_enabled INTEGER DEFAULT 1,
      theme TEXT DEFAULT 'dark',
      font_size TEXT DEFAULT 'normal',
      gemini_api_key TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Seed Languages if empty
  const langCountRow = await getOne('SELECT COUNT(*) as count FROM languages;');
  if (langCountRow && langCountRow.count === 0) {
    for (const l of SEED_LANGUAGES) {
      await run(
        `INSERT INTO languages (id, name, slug, category, icon, color, description, active, topics)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [l.id, l.name, l.slug, l.category, l.icon, l.color, l.description, l.active ? 1 : 0, JSON.stringify(l.topics)]
      );
    }
    console.log(`Seeded ${SEED_LANGUAGES.length} languages into SQLite database.`);
  }

  // Seed Questions if empty
  const qCountRow = await getOne('SELECT COUNT(*) as count FROM questions;');
  if (qCountRow && qCountRow.count === 0) {
    for (const q of SEED_QUESTIONS) {
      await run(
        `INSERT INTO questions (id, language_id, topic, difficulty, prompt, code, options, answer, explanation, status, created_by, model_metadata)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          q.id,
          q.language_id,
          q.topic,
          q.difficulty,
          q.prompt,
          q.code || null,
          JSON.stringify(q.options),
          q.answer,
          q.explanation,
          q.status || 'approved',
          q.created_by || 'system',
          q.model_metadata ? JSON.stringify(q.model_metadata) : null,
        ]
      );
    }
    console.log(`Seeded ${SEED_QUESTIONS.length} questions into SQLite database.`);
  }
};

