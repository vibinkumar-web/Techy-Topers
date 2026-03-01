<?php
session_start();
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/db.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    // New logic: Only fetch bookings where the exact pickup datetime is strictly > 24 hours from NOW().
    $query = "SELECT * FROM f_ft_booking WHERE pickup > NOW() + INTERVAL 24 HOUR AND assign = '0' ORDER BY pickup ASC";
    $stmt = $db->prepare($query);
    $stmt->execute();

    $bookings = array();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        array_push($bookings, $row);
    }
    echo json_encode($bookings);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(array("message" => "Database error: " . $e->getMessage()));
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array("message" => "General error: " . $e->getMessage()));
}
?>

