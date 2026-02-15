<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/db.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    $tomorrow = date('Y-m-d', strtotime('+1 day'));

    // Legacy logic: b_date > tomorrow AND assign = 0.
    // Fixed: 'pickup_time' column does not exist, replaced with 'pickup' which stores the datetime.
    $query = "SELECT * FROM f_ft_booking WHERE b_date >= :tomorrow AND assign = '0' ORDER BY b_date ASC, pickup ASC";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":tomorrow", $tomorrow);
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
