const path = require("path");
const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const { initDatabase } = require("./db");

async function startServer() {
  const app = express();
  const db = await initDatabase();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(
    session({
      secret: "suaimi-livestock-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 8,
      },
    })
  );

  function requireAuth(req, res, next) {
    if (!req.session.admin) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    return next();
  }

  app.post("/api/auth/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username dan password wajib diisi." });
    }

    const admin = await db.get("SELECT * FROM admins WHERE username = ?", username);
    if (!admin) {
      return res.status(401).json({ message: "Username atau password salah." });
    }

    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) {
      return res.status(401).json({ message: "Username atau password salah." });
    }

    req.session.admin = {
      id: admin.id,
      username: admin.username,
    };

    return res.json({ message: "Login berhasil", admin: req.session.admin });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logout berhasil" });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (!req.session.admin) {
      return res.status(401).json({ message: "Belum login" });
    }
    return res.json({ admin: req.session.admin });
  });

  app.get("/api/admin/sapi", requireAuth, async (req, res) => {
    const rows = await db.all("SELECT * FROM sapi ORDER BY id ASC");
    res.json(rows);
  });

  app.post("/api/admin/sapi", requireAuth, async (req, res) => {
    const {
      code,
      jenis,
      kelamin,
      umur,
      bobot,
      harga,
      warna,
      status,
      kondisi_kesehatan,
      image_path,
      detail_file,
    } = req.body;

    if (
      !code ||
      !jenis ||
      !kelamin ||
      !umur ||
      !bobot ||
      !harga ||
      !warna ||
      !status ||
      !kondisi_kesehatan
    ) {
      return res.status(400).json({ message: "Semua field utama wajib diisi." });
    }

    try {
      const result = await db.run(
        `INSERT INTO sapi (
          code, jenis, kelamin, umur, bobot, harga, warna, status,
          kondisi_kesehatan, image_path, detail_file
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        code,
        jenis,
        kelamin,
        umur,
        bobot,
        harga,
        warna,
        status,
        kondisi_kesehatan,
        image_path || "",
        detail_file || ""
      );

      const created = await db.get("SELECT * FROM sapi WHERE id = ?", result.lastID);
      return res.status(201).json(created);
    } catch (error) {
      return res.status(400).json({ message: "Gagal menambah data. Kode sapi mungkin sudah ada." });
    }
  });

  app.put("/api/admin/sapi/:id", requireAuth, async (req, res) => {
    const { id } = req.params;
    const {
      code,
      jenis,
      kelamin,
      umur,
      bobot,
      harga,
      warna,
      status,
      kondisi_kesehatan,
      image_path,
      detail_file,
    } = req.body;

    const existing = await db.get("SELECT * FROM sapi WHERE id = ?", id);
    if (!existing) {
      return res.status(404).json({ message: "Data sapi tidak ditemukan." });
    }

    try {
      await db.run(
        `UPDATE sapi SET
          code = ?, jenis = ?, kelamin = ?, umur = ?, bobot = ?, harga = ?,
          warna = ?, status = ?, kondisi_kesehatan = ?, image_path = ?, detail_file = ?
        WHERE id = ?`,
        code || existing.code,
        jenis || existing.jenis,
        kelamin || existing.kelamin,
        umur || existing.umur,
        bobot || existing.bobot,
        harga || existing.harga,
        warna || existing.warna,
        status || existing.status,
        kondisi_kesehatan || existing.kondisi_kesehatan,
        image_path ?? existing.image_path,
        detail_file ?? existing.detail_file,
        id
      );

      const updated = await db.get("SELECT * FROM sapi WHERE id = ?", id);
      return res.json(updated);
    } catch (error) {
      return res.status(400).json({ message: "Gagal memperbarui data." });
    }
  });

  app.delete("/api/admin/sapi/:id", requireAuth, async (req, res) => {
    const { id } = req.params;
    const existing = await db.get("SELECT id FROM sapi WHERE id = ?", id);
    if (!existing) {
      return res.status(404).json({ message: "Data sapi tidak ditemukan." });
    }

    await db.run("DELETE FROM sapi WHERE id = ?", id);
    return res.json({ message: "Data berhasil dihapus." });
  });

  app.use(express.static(__dirname));

  app.get("/admin", (req, res) => {
    res.sendFile(path.join(__dirname, "admin-login.html"));
  });

  app.get("/admin/dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "admin-dashboard.html"));
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Gagal menjalankan server:", error);
  process.exit(1);
});
