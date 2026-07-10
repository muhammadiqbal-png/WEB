const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const bcrypt = require('bcryptjs');
const { dbPath } = require('./config');

async function initDb() {
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  await db.exec('PRAGMA foreign_keys = ON;');

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS cattle (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      breed TEXT NOT NULL,
      gender TEXT NOT NULL,
      weight_kg INTEGER NOT NULL,
      price INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'Tersedia',
      image_url TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const existing = await db.get('SELECT id FROM users WHERE username = ?', ['admin']);
  if (!existing) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    await db.run(
      'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
      ['admin', 'admin@suaimi.farm', passwordHash, 'admin']
    );
  }

  const cattleCountRow = await db.get('SELECT COUNT(*) as total FROM cattle');
  if (!cattleCountRow || cattleCountRow.total === 0) {
    const seedItems = [
      ['SP-002', 'Sapi Bali Jantan', 'Sapi Bali', 'Jantan', 220, 17000000, 'Tersedia', 'image/sapi1.jpg'],
      ['SP-001', 'Sapi Bali Betina', 'Sapi Bali', 'Betina', 250, 18500000, 'Tersedia', 'image/sapi2.jpg'],
      ['SP-003', 'Sapi Bali Betina', 'Sapi Bali', 'Betina', 230, 18000000, 'Tersedia', 'image/sapi3.jpg']
    ];

    for (const item of seedItems) {
      await db.run(
        `INSERT INTO cattle (code, name, breed, gender, weight_kg, price, status, image_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        item
      );
    }
  }

  return db;
}

module.exports = { initDb };
