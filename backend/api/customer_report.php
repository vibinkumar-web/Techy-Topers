<?php
session_start();
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
    try {
        $query = "SELECT c.b_id as bid, c.p_date, c.customer, c.m_no, c.picup_place, c.drop_place 
                  FROM f_closing c 
                  WHERE c.p_date BETWEEN :d1 AND :d2 
                  ORDER BY c.p_date DESC, c.id DESC";

        $stmt = $db->prepare($query);
        $stmt->bindParam(":d1", $from_date);
        $stmt->bindParam(":d2", $to_date);
        $stmt->execute();
        
        $records = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($records);
    } catch (Exception $e) {
        echo json_encode(array("message" => "Error processing report", "error" => $e->getMessage()));
    }
} else {
    echo json_encode(array("message" => "Date parameters required"));
}
?>

