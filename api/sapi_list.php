<?php

declare(strict_types=1);

require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/bootstrap.php';

require_method('GET');
require_login();

$conn = db();
bootstrap($conn);

$result = $conn->query('SELECT * FROM sapi ORDER BY id ASC');
$rows = [];

while ($row = $result->fetch_assoc()) {
    $rows[] = $row;
}

json_response($rows);
