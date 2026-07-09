# Setup Login Admin Dengan XAMPP

Ikuti langkah ini setelah Apache dan MySQL berstatus Running di XAMPP.

1. Salin folder project ke:
   - `C:\xampp\htdocs\WEB`

2. Buka phpMyAdmin:
   - `http://localhost/phpmyadmin`

3. Buat user root tanpa password (default XAMPP), atau sesuaikan file berikut bila pakai password:
   - `api/config.php`

4. Tidak perlu membuat tabel manual.
   - Tabel dan akun admin default akan dibuat otomatis saat endpoint pertama dipanggil.

5. Buka halaman login:
   - `http://localhost/WEB/admin-login.html`

6. Login default:
   - Username: `admin`
   - Password: `admin123`

7. Setelah login berhasil, dashboard ada di:
   - `http://localhost/WEB/admin-dashboard.html`

## Endpoint PHP yang dipakai

- `api/auth_login.php`
- `api/auth_logout.php`
- `api/auth_me.php`
- `api/sapi_list.php`
- `api/sapi_create.php`
- `api/sapi_update.php`
- `api/sapi_delete.php`

## Jika login gagal

1. Pastikan membuka URL lewat `http://localhost/WEB/...`, bukan file lokal.
2. Pastikan Apache dan MySQL tetap Running.
3. Cek error di `Apache logs` jika muncul HTTP 500.
4. Cek kredensial DB di `api/config.php`.
