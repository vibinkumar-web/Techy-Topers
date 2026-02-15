<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/db.php';

$database = new Database();
$db = $database->getConnection();

$from_date = isset($_GET['from_date']) ? $_GET['from_date'] : '';
$to_date = isset($_GET['to_date']) ? $_GET['to_date'] : '';

if ($from_date && $to_date) {
    
    $stats = array();

    // Total Bookings
    $q1 = "SELECT COUNT(*) as count FROM ft_booking WHERE b_date BETWEEN :d1 AND :d2";
    $s1 = $db->prepare($q1);
    $s1->bindParam(":d1", $from_date);
    $s1->bindParam(":d2", $to_date);
    $s1->execute();
    $stats['total'] = $s1->fetch(PDO::FETCH_ASSOC)['count'];

    // Cancelled
    $q2 = "SELECT COUNT(*) as count FROM f_calcel_booking WHERE b_date BETWEEN :d1 AND :d2"; // Note: table name seems to be f_calcel_booking
    $s2 = $db->prepare($q2);
    $s2->bindParam(":d1", $from_date);
    $s2->bindParam(":d2", $to_date);
    $s2->execute();
    $stats['cancelled'] = $s2->fetch(PDO::FETCH_ASSOC)['count'];

    // Closed/Completed
    $q3 = "SELECT COUNT(*) as count FROM f_closing WHERE p_date BETWEEN :d1 AND :d2";
    $s3 = $db->prepare($q3);
    $s3->bindParam(":d1", $from_date);
    $s3->bindParam(":d2", $to_date);
    $s3->execute();
    $stats['closed'] = $s3->fetch(PDO::FETCH_ASSOC)['count'];
    
     // On Trip
    $q4 = "SELECT COUNT(*) as count FROM f_ontrip WHERE p_date BETWEEN :d1 AND :d2";
    $s4 = $db->prepare($q4);
    $s4->bindParam(":d1", $from_date);
    $s4->bindParam(":d2", $to_date);
    $s4->execute();
    $stats['ontrip'] = $s4->fetch(PDO::FETCH_ASSOC)['count'];

    echo json_encode($stats);

} else {
     echo json_encode(array("message" => "Date range required"));
}
?>
