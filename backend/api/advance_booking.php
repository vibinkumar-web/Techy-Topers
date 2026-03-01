<?php
include '../config/db.php';
$database = new Database();
$pdo = $database->getConnection();

header("Content-Type: application/json");

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Fetch Advance Bookings (future bookings not yet assigned)
        $date = date('Y-m-d');
        $tomorrow = date('Y-m-d', strtotime($date . ' + 1 days'));
        
        // Query logic from legacy: b_date > tomorrow AND assign = '0' AND b_type = 'Advance Booking'
        // But also, legacy code had `b_date > '$getdate_assign'` where getdate_assign was tomorrow.
        
        $sql = "SELECT * FROM f_ft_booking WHERE b_date >= ? AND assign = '0' AND b_type = 'Advance Booking' ORDER BY b_date ASC, pickup ASC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$tomorrow]);
        $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode($bookings);
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}
?>
