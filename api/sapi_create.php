<?php

declare(strict_types=1);

require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/bootstrap.php';

require_method('POST');
require_login();

$conn = db();
bootstrap($conn);

$body = read_json_body();

$required = [
    'code',
    'jenis',
    'kelamin',
    'umur',
    'bobot',
    'harga',
    'warna',
    'status',
    'kondisi_kesehatan',
];

foreach ($required as $field) {
    if (trim((string)($body[$field] ?? '')) === '') {
        json_response(['message' => 'Semua field utama wajib diisi.'], 400);
    }
}

$code = trim((string)$body['code']);
$jenis = trim((string)$body['jenis']);
$kelamin = trim((string)$body['kelamin']);
$umur = trim((string)$body['umur']);
$bobot = trim((string)$body['bobot']);
$harga = trim((string)$body['harga']);
$warna = trim((string)$body['warna']);
$status = trim((string)$body['status']);
$kondisi = trim((string)$body['kondisi_kesehatan']);
$imagePath = trim((string)($body['image_path'] ?? ''));
$detailFile = trim((string)($body['detail_file'] ?? ''));

try {
    $stmt = $conn->prepare('INSERT INTO sapi (code, jenis, kelamin, umur, bobot, harga, warna, status, kondisi_kesehatan, image_path, detail_file) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    $stmt->bind_param('sssssssssss', $code, $jenis, $kelamin, $umur, $bobot, $harga, $warna, $status, $kondisi, $imagePath, $detailFile);
    $stmt->execute();
    $newId = $stmt->insert_id;
    $stmt->close();

    $pick = $conn->prepare('SELECT * FROM sapi WHERE id = ?');
    $pick->bind_param('i', $newId);
    $pick->execute();
    $row = $pick->get_result()->fetch_assoc();
    $pick->close();

    json_response($row ?? [], 201);
} catch (Throwable $e) {
    json_response(['message' => 'Gagal menambah data. Kode sapi mungkin sudah ada.'], 400);
}
