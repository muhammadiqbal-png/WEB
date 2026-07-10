# Backend Auth Suaimi Livestock

Backend ini menyediakan API autentikasi untuk halaman login/admin.

## Endpoint

- POST /api/auth/login
- GET /api/auth/me
- POST /api/auth/logout
- GET /api/health

## Menjalankan

1. Pastikan Node.js terpasang.
2. Buka folder backend.
3. Jalankan `npm install`.
4. Jalankan `npm start`.
5. Buka http://localhost:3000/login.html

## Kredensial awal

- username: admin
- password: admin123

## Catatan

- Database SQLite akan dibuat otomatis di `backend/data/app.db` saat server pertama kali dijalankan.
- Ganti `JWT_SECRET` sebelum dipakai produksi.
