<?php
session_start();
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/db.php';

$database = new Database();
$db = $database->getConnection();

$user_id = isset($_GET['user_id']) ? $_GET['user_id'] : '';
$from_date = isset($_GET['from_date']) ? $_GET['from_date'] : '';
$to_date = isset($_GET['to_date']) ? $_GET['to_date'] : '';

if ($user_id && $from_date && $to_date) {
    
    $stats = array();

    // Bookings
    $q1 = "SELECT COUNT(*) as count FROM ft_booking WHERE user_id = :user_id AND b_date BETWEEN :d1 AND :d2";
    $s1 = $db->prepare($q1);
    $s1->bindParam(":user_id", $user_id);
    $s1->bindParam(":d1", $from_date);
    $s1->bindParam(":d2", $to_date);
    $s1->execute();
    $stats['booking_count'] = $s1->fetch(PDO::FETCH_ASSOC)['count'];

    // Assigns (On Trip)
    $q2 = "SELECT COUNT(*) as count FROM f_ontrip WHERE user_id = :user_id AND p_date BETWEEN :d1 AND :d2";
    $s2 = $db->prepare($q2);
    $s2->bindParam(":user_id", $user_id);
    $s2->bindParam(":d1", $from_date);
    $s2->bindParam(":d2", $to_date);
    $s2->execute();
    $stats['assign_count'] = $s2->fetch(PDO::FETCH_ASSOC)['count'];

    // Closings
    $q3 = "SELECT COUNT(*) as count FROM f_closing WHERE user_id = :user_id AND p_date BETWEEN :d1 AND :d2";
    $s3 = $db->prepare($q3);
    $s3->bindParam(":user_id", $user_id);
    $s3->bindParam(":d1", $from_date);
    $s3->bindParam(":d2", $to_date);
    $s3->execute();
    $stats['closing_count'] = $s3->fetch(PDO::FETCH_ASSOC)['count'];
    
     // Enquiries
    $q4 = "SELECT COUNT(*) as count FROM enqury_table WHERE user_id = :user_id AND b_date BETWEEN :d1 AND :d2";
    $s4 = $db->prepare($q4);
    $s4->bindParam(":user_id", $user_id);
    $s4->bindParam(":d1", $from_date);
    $s4->bindParam(":d2", $to_date);
    $s4->execute();
    $stats['enquiry_count'] = $s4->fetch(PDO::FETCH_ASSOC)['count'];
    
     // Cancellations
    $q5 = "SELECT COUNT(*) as count FROM f_calcel_booking WHERE user_id = :user_id AND b_date BETWEEN :d1 AND :d2";
    $s5 = $db->prepare($q5);
    $s5->bindParam(":user_id", $user_id);
    $s5->bindParam(":d1", $from_date);
    $s5->bindParam(":d2", $to_date);
    $s5->execute();
    $stats['cancel_count'] = $s5->fetch(PDO::FETCH_ASSOC)['count'];

    echo json_encode($stats);

} else {
     echo json_encode(array("message" => "Parameters required"));
}
?>

