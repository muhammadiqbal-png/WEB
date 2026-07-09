<?php

declare(strict_types=1);

require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/bootstrap.php';

require_method('POST');
require_login();

$conn = db();
bootstrap($conn);

$body = read_json_body();
$currentPassword = (string)($body['current_password'] ?? '');
$newPassword = (string)($body['new_password'] ?? '');
$confirmPassword = (string)($body['confirm_password'] ?? '');

if ($currentPassword === '' || $newPassword === '' || $confirmPassword === '') {
    json_response(['message' => 'Semua field password wajib diisi.'], 400);
}

if (strlen($newPassword) < 8) {
    json_response(['message' => 'Password baru minimal 8 karakter.'], 400);
}

if ($newPassword !== $confirmPassword) {
    json_response(['message' => 'Konfirmasi password baru tidak cocok.'], 400);
}

$adminId = (int)($_SESSION['admin']['id'] ?? 0);
if ($adminId <= 0) {
    json_response(['message' => 'Sesi admin tidak valid.'], 401);
}

$pick = $conn->prepare('SELECT id, password_hash FROM admins WHERE id = ? LIMIT 1');
$pick->bind_param('i', $adminId);
$pick->execute();
$admin = $pick->get_result()->fetch_assoc();
$pick->close();

if (!$admin) {
    json_response(['message' => 'Akun admin tidak ditemukan.'], 404);
}

if (!password_verify($currentPassword, (string)$admin['password_hash'])) {
    json_response(['message' => 'Password lama salah.'], 401);
}

$newHash = password_hash($newPassword, PASSWORD_DEFAULT);
$update = $conn->prepare('UPDATE admins SET password_hash = ? WHERE id = ?');
$update->bind_param('si', $newHash, $adminId);
$update->execute();
$update->close();

json_response(['message' => 'Password berhasil diperbarui.']);
