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

$existingStmt = $conn->prepare('SELECT * FROM sapi WHERE id = ? LIMIT 1');
$existingStmt->bind_param('i', $id);
$existingStmt->execute();
$existing = $existingStmt->get_result()->fetch_assoc();
$existingStmt->close();

if (!$existing) {
    json_response(['message' => 'Data sapi tidak ditemukan.'], 404);
}

$code = trim((string)($body['code'] ?? $existing['code']));
$jenis = trim((string)($body['jenis'] ?? $existing['jenis']));
$kelamin = trim((string)($body['kelamin'] ?? $existing['kelamin']));
$umur = trim((string)($body['umur'] ?? $existing['umur']));
$bobot = trim((string)($body['bobot'] ?? $existing['bobot']));
$harga = trim((string)($body['harga'] ?? $existing['harga']));
$warna = trim((string)($body['warna'] ?? $existing['warna']));
$status = trim((string)($body['status'] ?? $existing['status']));
$kondisi = trim((string)($body['kondisi_kesehatan'] ?? $existing['kondisi_kesehatan']));
$imagePath = trim((string)($body['image_path'] ?? $existing['image_path']));
$detailFile = trim((string)($body['detail_file'] ?? $existing['detail_file']));

try {
    $stmt = $conn->prepare('UPDATE sapi SET code = ?, jenis = ?, kelamin = ?, umur = ?, bobot = ?, harga = ?, warna = ?, status = ?, kondisi_kesehatan = ?, image_path = ?, detail_file = ? WHERE id = ?');
    $stmt->bind_param('sssssssssssi', $code, $jenis, $kelamin, $umur, $bobot, $harga, $warna, $status, $kondisi, $imagePath, $detailFile, $id);
    $stmt->execute();
    $stmt->close();

    $pick = $conn->prepare('SELECT * FROM sapi WHERE id = ?');
    $pick->bind_param('i', $id);
    $pick->execute();
    $row = $pick->get_result()->fetch_assoc();
    $pick->close();

    json_response($row ?? []);
} catch (Throwable $e) {
    json_response(['message' => 'Gagal memperbarui data.'], 400);
}
