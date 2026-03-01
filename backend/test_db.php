<?php
header('Content-Type: application/json');

$host = '127.0.0.1';
$db_name = 'ft_welcome';
$username = 'root';
$password = '';

$response = [];

try {
    $conn = new PDO("mysql:host=$host;dbname=$db_name", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $response['status'] = 'success';
    $response['message'] = "Connected successfully to database: $db_name";
    
    // Check tables
    $stmt = $conn->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    $response['tables_count'] = count($tables);
    $response['tables'] = $tables;
    
} catch(PDOException $e) {
    $response['status'] = 'error';
    $response['message'] = "Connection failed: " . $e->getMessage();
}

echo json_encode($response, JSON_PRETTY_PRINT);
?>
