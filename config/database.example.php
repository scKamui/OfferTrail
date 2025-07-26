<?php
// Example database configuration template for OfferTrail

$host = 'localhost';
$dbname = 'your_database_name';
$username = 'your_username';
$password = 'your_password';

// Example connection using PDO
try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}
?>