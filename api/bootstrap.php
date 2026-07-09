<?php

declare(strict_types=1);

require_once __DIR__ . '/db.php';

function bootstrap(mysqli $conn): void
{
    $conn->query(
        'CREATE TABLE IF NOT EXISTS admins (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(100) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4'
    );

    $conn->query(
        'CREATE TABLE IF NOT EXISTS sapi (
            id INT AUTO_INCREMENT PRIMARY KEY,
            code VARCHAR(100) NOT NULL UNIQUE,
            jenis VARCHAR(150) NOT NULL,
            kelamin VARCHAR(50) NOT NULL,
            umur VARCHAR(50) NOT NULL,
            bobot VARCHAR(50) NOT NULL,
            harga VARCHAR(80) NOT NULL,
            warna VARCHAR(100) NOT NULL,
            status VARCHAR(100) NOT NULL,
            kondisi_kesehatan TEXT NOT NULL,
            image_path VARCHAR(255) DEFAULT NULL,
            detail_file VARCHAR(255) DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4'
    );

    $check = $conn->prepare('SELECT id FROM admins WHERE username = ? LIMIT 1');
    $username = 'admin';
    $check->bind_param('s', $username);
    $check->execute();
    $result = $check->get_result();
    $exists = $result->fetch_assoc();
    $check->close();

    if (!$exists) {
        $passwordHash = password_hash('admin123', PASSWORD_DEFAULT);
        $insert = $conn->prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)');
        $insert->bind_param('ss', $username, $passwordHash);
        $insert->execute();
        $insert->close();
    }
}
