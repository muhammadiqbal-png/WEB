<?php

declare(strict_types=1);

require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/bootstrap.php';

require_method('GET');

$conn = db();
bootstrap($conn);

$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
if ($limit <= 0) {
    $limit = 50;
}
if ($limit > 200) {
    $limit = 200;
}

$status = trim((string)($_GET['status'] ?? ''));

if ($status !== '') {
    $stmt = $conn->prepare('SELECT id, code, jenis, kelamin, umur, bobot, harga, warna, status, kondisi_kesehatan, image_path, detail_file, created_at, updated_at FROM sapi WHERE status = ? ORDER BY id DESC LIMIT ?');
    $stmt->bind_param('si', $status, $limit);
    $stmt->execute();
    $result = $stmt->get_result();
} else {
    $stmt = $conn->prepare('SELECT id, code, jenis, kelamin, umur, bobot, harga, warna, status, kondisi_kesehatan, image_path, detail_file, created_at, updated_at FROM sapi ORDER BY id DESC LIMIT ?');
    $stmt->bind_param('i', $limit);
    $stmt->execute();
    $result = $stmt->get_result();
}

$rows = [];
while ($row = $result->fetch_assoc()) {
    $rows[] = $row;
}

$stmt->close();

json_response($rows);
