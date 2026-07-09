<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';

function db(): mysqli
{
    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, '', DB_PORT);
    $conn->set_charset('utf8mb4');

    $dbNameEscaped = str_replace('`', '``', DB_NAME);
    $conn->query("CREATE DATABASE IF NOT EXISTS `{$dbNameEscaped}` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci");
    $conn->select_db(DB_NAME);

    return $conn;
}
