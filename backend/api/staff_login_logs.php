<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");



session_start();
include_once '../config/db.php';

try {
    if (!$conn) throw new Exception("Database connection failed.");

    $conn->exec("CREATE TABLE IF NOT EXISTS tms_staff_login_logs (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        staff_id   INT NOT NULL,
        staff_name VARCHAR(100) NOT NULL,
        ip_address VARCHAR(45),
        page_url   VARCHAR(255),
        user_agent TEXT,
        login_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_login_at (login_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $staff_id  = $_GET['staff_id'] ?? '';
    $from_date = $_GET['from_date'] ?? '';
    $to_date   = $_GET['to_date'] ?? '';

    $query = "SELECT id, staff_id, staff_name, ip_address, page_url, user_agent, login_at
              FROM tms_staff_login_logs
              WHERE 1=1";
    $params = [];

    if (!empty($staff_id)) {
        $query .= " AND staff_id = :sid";
        $params[':sid'] = $staff_id;
    }
    if (!empty($from_date)) {
        $query .= " AND DATE(login_at) >= :fdate";
        $params[':fdate'] = $from_date;
    }
    if (!empty($to_date)) {
        $query .= " AND DATE(login_at) <= :tdate";
        $params[':tdate'] = $to_date;
    }

    $query .= " ORDER BY login_at DESC LIMIT 100";
    
    $stmt = $conn->prepare($query);
    foreach ($params as $key => $val) {
        $stmt->bindValue($key, $val);
    }
    $stmt->execute();
    $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["logs" => $logs]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Error: " . $e->getMessage(), "logs" => []]);
}
?>

