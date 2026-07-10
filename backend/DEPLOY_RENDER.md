# Deploy Backend ke Render (Pelan-Pelan)

## 1) Push project ke GitHub

Pastikan folder project ini sudah ada di repository GitHub.

## 2) Buat service di Render

1. Login ke https://render.com
2. Klik New + -> Blueprint
3. Pilih repository project yang berisi file `render.yaml`
4. Klik Apply

Render akan membuat web service `suaimi-backend` dari folder `backend/`.

## 3) Ambil URL backend

Contoh URL hasil deploy:

`https://suaimi-backend.onrender.com`

Cek endpoint health:

`https://suaimi-backend.onrender.com/api/health`

## 4) Arahkan frontend InfinityFree ke backend Render

Edit file `auth-config.js` di hosting InfinityFree (atau dari lokal lalu upload ulang), isi:

`BACKEND_BASE_URL: 'https://suaimi-backend.onrender.com'`

## 5) Uji login

- Buka `https://suhaimi-farm.infinityfreeapp.com/login.html`
- Login dengan user seed yang ada di backend.

## Catatan penting

Karena menggunakan SQLite file lokal, data bisa reset saat redeploy/restart environment cloud.
Untuk produksi, sebaiknya migrasi ke database managed (PostgreSQL/MySQL).
