<?php
session_start();
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/db.php';

$database = new Database();
$db = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $b_id = isset($_GET['b_id']) ? $_GET['b_id'] : '';
    
    if ($b_id) {
        $query = "SELECT * FROM f_closing WHERE b_id = :b_id LIMIT 1";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":b_id", $b_id);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($row) {
            echo json_encode($row);
        } else {
             http_response_code(404);
             echo json_encode(array("message" => "Trip not found."));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Booking ID required."));
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    
    // Update Logic
    if (isset($data->b_id)) {
        
        $query = "UPDATE f_closing SET 
                  opening_km = :opening_km,
                  closing_km = :closing_km,
                  remarks = :remarks,
                  net_total = :net_total,
                  paid_amount = :paid_amount,
                  discount = :discount,
                  dis_reason = :dis_reason,
                  pending = :pending
                  WHERE b_id = :b_id";
        
        // We can add all fields, but these are the main editable ones usually.
        // Legacy updates everything.
        
        $pending = ($data->net_total > $data->paid_amount) ? '1' : '0';

        $stmt = $db->prepare($query);
        $stmt->bindParam(":opening_km", $data->opening_km);
        $stmt->bindParam(":closing_km", $data->closing_km);
        $stmt->bindParam(":remarks", $data->remarks);
        $stmt->bindParam(":net_total", $data->net_total);
        $stmt->bindParam(":paid_amount", $data->paid_amount);
        $stmt->bindParam(":discount", $data->discount);
        $stmt->bindParam(":dis_reason", $data->dis_reason);
        $stmt->bindParam(":pending", $pending);
        $stmt->bindParam(":b_id", $data->b_id);
        
        if ($stmt->execute()) {
             echo json_encode(array("message" => "Trip details updated successfully."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to update trip."));
        }

    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Incomplete data."));
    }
}
?>

