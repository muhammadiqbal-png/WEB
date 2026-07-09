const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const bcrypt = require("bcryptjs");

const DB_PATH = path.join(__dirname, "database.sqlite");

async function initDatabase() {
  const db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database,
  });

  await db.exec("PRAGMA foreign_keys = ON;");

  await db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS sapi (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      jenis TEXT NOT NULL,
      kelamin TEXT NOT NULL,
      umur TEXT NOT NULL,
      bobot TEXT NOT NULL,
      harga TEXT NOT NULL,
      warna TEXT NOT NULL,
      status TEXT NOT NULL,
      kondisi_kesehatan TEXT NOT NULL,
      image_path TEXT,
      detail_file TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.exec(`
    CREATE TRIGGER IF NOT EXISTS sapi_updated_at
    AFTER UPDATE ON sapi
    FOR EACH ROW
    BEGIN
      UPDATE sapi SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
    END;
  `);

  const admin = await db.get("SELECT id FROM admins WHERE username = ?", "admin");
  if (!admin) {
    const passwordHash = await bcrypt.hash("admin123", 10);
    await db.run(
      "INSERT INTO admins (username, password_hash) VALUES (?, ?)",
      "admin",
      passwordHash
    );
  }

  return db;
}

module.exports = {
  initDatabase,
};
