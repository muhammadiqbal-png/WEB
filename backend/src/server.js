const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const { port } = require('./config');
const { initDb } = require('./db');
const { createToken, requireAuth } = require('./auth');

function normalizeCattlePayload(body) {
  return {
    code: String(body.code || '').trim(),
    name: String(body.name || '').trim(),
    breed: String(body.breed || '').trim(),
    gender: String(body.gender || '').trim(),
    weightKg: Number(body.weightKg ?? body.weight_kg ?? 0),
    price: Number(body.price ?? 0),
    status: String(body.status || 'Tersedia').trim() || 'Tersedia',
    imageUrl: String(body.imageUrl || body.image_url || '').trim()
  };
}

function validateCattleInput(payload) {
  if (!payload.code || !payload.name || !payload.breed || !payload.gender) {
    return 'Kode, nama, ras, dan kelamin wajib diisi';
  }

  if (!Number.isFinite(payload.weightKg) || payload.weightKg <= 0) {
    return 'Berat (kg) harus angka lebih dari 0';
  }

  if (!Number.isFinite(payload.price) || payload.price <= 0) {
    return 'Harga harus angka lebih dari 0';
  }

  return null;
}

async function start() {
  const db = await initDb();
  const app = express();

  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'https://suhaimi-farm.infinityfreeapp.com'
  ];

  app.use(cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Origin tidak diizinkan oleh CORS'));
    }
  }));

  app.use(express.json());

  app.post('/api/auth/login', async (req, res) => {
    const identifier = String(req.body.identifier || req.body.username || req.body.email || '').trim();
    const password = String(req.body.password || '');

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Username/email dan password wajib diisi' });
    }

    try {
      const user = await db.get(
        'SELECT id, username, email, password_hash, role FROM users WHERE username = ? OR email = ? LIMIT 1',
        [identifier, identifier]
      );

      if (!user) {
        return res.status(401).json({ message: 'Kredensial salah' });
      }

      const passwordMatch = await bcrypt.compare(password, user.password_hash);
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Kredensial salah' });
      }

      const token = createToken(user);
      return res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  });

  app.get('/api/auth/me', requireAuth, async (req, res) => {
    try {
      const user = await db.get(
        'SELECT id, username, email, role, created_at FROM users WHERE id = ? LIMIT 1',
        [req.auth.sub]
      );

      if (!user) {
        return res.status(404).json({ message: 'User tidak ditemukan' });
      }

      return res.json({ user });
    } catch (error) {
      console.error('Me error:', error);
      return res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  });

  app.post('/api/auth/logout', requireAuth, (req, res) => {
    return res.json({ message: 'Logout berhasil' });
  });

  app.get('/api/cattle', async (req, res) => {
    try {
      const rows = await db.all(
        `SELECT id, code, name, breed, gender, weight_kg, price, status, image_url, created_at, updated_at
         FROM cattle
         ORDER BY id DESC`
      );
      return res.json({ items: rows });
    } catch (error) {
      console.error('Cattle list error:', error);
      return res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  });

  app.post('/api/admin/cattle', requireAuth, async (req, res) => {
    const payload = normalizeCattlePayload(req.body || {});
    const errorMessage = validateCattleInput(payload);
    if (errorMessage) {
      return res.status(400).json({ message: errorMessage });
    }

    try {
      const result = await db.run(
        `INSERT INTO cattle (code, name, breed, gender, weight_kg, price, status, image_url, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        [
          payload.code,
          payload.name,
          payload.breed,
          payload.gender,
          payload.weightKg,
          payload.price,
          payload.status,
          payload.imageUrl || null
        ]
      );

      const created = await db.get(
        `SELECT id, code, name, breed, gender, weight_kg, price, status, image_url, created_at, updated_at
         FROM cattle WHERE id = ?`,
        [result.lastID]
      );

      return res.status(201).json({ item: created });
    } catch (error) {
      if (String(error.message || '').includes('UNIQUE')) {
        return res.status(409).json({ message: 'Kode sapi sudah dipakai' });
      }

      console.error('Cattle create error:', error);
      return res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  });

  app.put('/api/admin/cattle/:id', requireAuth, async (req, res) => {
    const itemId = Number(req.params.id);
    if (!Number.isInteger(itemId) || itemId <= 0) {
      return res.status(400).json({ message: 'ID tidak valid' });
    }

    const payload = normalizeCattlePayload(req.body || {});
    const errorMessage = validateCattleInput(payload);
    if (errorMessage) {
      return res.status(400).json({ message: errorMessage });
    }

    try {
      const existing = await db.get('SELECT id FROM cattle WHERE id = ?', [itemId]);
      if (!existing) {
        return res.status(404).json({ message: 'Data sapi tidak ditemukan' });
      }

      await db.run(
        `UPDATE cattle
         SET code = ?,
             name = ?,
             breed = ?,
             gender = ?,
             weight_kg = ?,
             price = ?,
             status = ?,
             image_url = ?,
             updated_at = datetime('now')
         WHERE id = ?`,
        [
          payload.code,
          payload.name,
          payload.breed,
          payload.gender,
          payload.weightKg,
          payload.price,
          payload.status,
          payload.imageUrl || null,
          itemId
        ]
      );

      const updated = await db.get(
        `SELECT id, code, name, breed, gender, weight_kg, price, status, image_url, created_at, updated_at
         FROM cattle WHERE id = ?`,
        [itemId]
      );

      return res.json({ item: updated });
    } catch (error) {
      if (String(error.message || '').includes('UNIQUE')) {
        return res.status(409).json({ message: 'Kode sapi sudah dipakai' });
      }

      console.error('Cattle update error:', error);
      return res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  });

  app.delete('/api/admin/cattle/:id', requireAuth, async (req, res) => {
    const itemId = Number(req.params.id);
    if (!Number.isInteger(itemId) || itemId <= 0) {
      return res.status(400).json({ message: 'ID tidak valid' });
    }

    try {
      const result = await db.run('DELETE FROM cattle WHERE id = ?', [itemId]);
      if (!result.changes) {
        return res.status(404).json({ message: 'Data sapi tidak ditemukan' });
      }

      return res.json({ message: 'Data sapi berhasil dihapus' });
    } catch (error) {
      console.error('Cattle delete error:', error);
      return res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  });

  app.get('/api/health', (req, res) => {
    return res.json({ ok: true, uptime: process.uptime() });
  });

  app.get('/', (req, res) => {
    return res.json({
      service: 'suaimi-backend',
      ok: true,
      docs: '/api/health'
    });
  });

  app.listen(port, () => {
    console.log(`Backend running on http://localhost:${port}`);
    console.log('Default admin login: admin / admin123');
  });
}

start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
