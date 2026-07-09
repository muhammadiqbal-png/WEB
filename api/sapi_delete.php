<?php

declare(strict_types=1);

require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/bootstrap.php';

require_method('POST');
require_login();

$conn = db();
bootstrap($conn);

$body = read_json_body();
$id = (int)($body['id'] ?? 0);

if ($id <= 0) {
    json_response(['message' => 'ID tidak valid.'], 400);
}

$check = $conn->prepare('SELECT id FROM sapi WHERE id = ? LIMIT 1');
$check->bind_param('i', $id);
$check->execute();
$exists = $check->get_result()->fetch_assoc();
$check->close();

if (!$exists) {
    json_response(['message' => 'Data sapi tidak ditemukan.'], 404);
}

$del = $conn->prepare('DELETE FROM sapi WHERE id = ?');
$del->bind_param('i', $id);
$del->execute();
$del->close();

json_response(['message' => 'Data berhasil dihapus.']);
