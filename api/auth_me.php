<?php

declare(strict_types=1);

require_once __DIR__ . '/helpers.php';

require_method('GET');

if (!isset($_SESSION['admin'])) {
    json_response(['message' => 'Belum login'], 401);
}

json_response(['admin' => $_SESSION['admin']]);
