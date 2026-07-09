<?php

declare(strict_types=1);

require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/bootstrap.php';

require_method('POST');

$conn = db();
bootstrap($conn);

$body = read_json_body();
$username = trim((string)($body['username'] ?? ''));
$password = (string)($body['password'] ?? '');

if ($username === '' || $password === '') {
    json_response(['message' => 'Username dan password wajib diisi.'], 400);
}

$stmt = $conn->prepare('SELECT id, username, password_hash FROM admins WHERE username = ? LIMIT 1');
$stmt->bind_param('s', $username);
$stmt->execute();
$result = $stmt->get_result();
$admin = $result->fetch_assoc();
$stmt->close();

if (!$admin || !password_verify($password, (string)$admin['password_hash'])) {
    json_response(['message' => 'Username atau password salah.'], 401);
}

$_SESSION['admin'] = [
    'id' => (int)$admin['id'],
    'username' => (string)$admin['username'],
];

json_response([
    'message' => 'Login berhasil',
    'admin' => $_SESSION['admin'],
]);
