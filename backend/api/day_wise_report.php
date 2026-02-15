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
    
    $query = "SELECT * FROM f_trip_sheet_entry WHERE date BETWEEN :from_date AND :to_date ORDER BY date DESC, trip_id DESC";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(":from_date", $from_date);
    $stmt->bindParam(":to_date", $to_date);
    
    $stmt->execute();
    
    $data = array();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        array_push($data, $row);
    }
    echo json_encode($data);

} else {
     echo json_encode(array());
}
?>
