<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include_once '../config/db.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    if (!empty($data->b_id) && !empty($data->reason)) {
        
        // 1. Fetch booking details
        $query = "SELECT * FROM f_ft_booking WHERE b_id = :b_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":b_id", $data->b_id);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // 2. Insert into f_calcel_booking (Archiving)
            // Note: f_calcel_booking (sic) table structure assumed from legacy code
            $insertQuery = "INSERT INTO f_calcel_booking SET
                b_id = :b_id,
                pickup = :pickup,
                d_place = :d_place,
                to_whom = :to_whom,
                a_no = :a_no,
                cus_count = :cus_count,
                p_city = :p_city,
                r_status = :r_status,
                m_no = :m_no,
                v_type = :v_type,
                st = :st,
                t_type = :t_type,
                b_name = :b_name,
                ac_type = :ac_type,
                b_type = :b_type,
                remarks = :remarks,
                q = :q,
                v_types = :v_types,
                v_no = :v_no,
                d_mobile = :d_mobile,
                user_id = :user_id,
                reason = :reason";
            
            $insStmt = $db->prepare($insertQuery);
            $insStmt->bindParam(":b_id", $row['b_id']);
            $insStmt->bindParam(":pickup", $row['pickup']);
            $insStmt->bindParam(":d_place", $row['d_place']);
            $insStmt->bindParam(":to_whom", $row['to_whom']);
            $insStmt->bindParam(":a_no", $row['a_no']);
            $insStmt->bindParam(":cus_count", $row['cus_count']);
            $insStmt->bindParam(":p_city", $row['p_city']);
            $insStmt->bindParam(":r_status", $row['r_status']);
            $insStmt->bindParam(":m_no", $row['m_no']);
            $insStmt->bindParam(":v_type", $row['v_type']);
            $insStmt->bindParam(":st", $row['st']);
            $insStmt->bindParam(":t_type", $row['t_type']);
            $insStmt->bindParam(":b_name", $row['b_name']);
            $insStmt->bindParam(":ac_type", $row['ac_type']);
            $insStmt->bindParam(":b_type", $row['b_type']);
            $insStmt->bindParam(":remarks", $row['remarks']);
            $insStmt->bindParam(":q", $row['q']);
            $insStmt->bindParam(":v_types", $row['v_types']);
            $insStmt->bindParam(":v_no", $row['v_no']);
            $insStmt->bindParam(":d_mobile", $row['d_mobile']);
            $insStmt->bindParam(":user_id", $data->user_id); // User performing cancel
            $insStmt->bindParam(":reason", $data->reason);
            
            if ($insStmt->execute()) {
                // 3. Mark as cancelled in original table
                // Legacy sets booking_status='1'
                $updateQuery = "UPDATE f_ft_booking SET booking_status = '1' WHERE b_id = :b_id";
                $updStmt = $db->prepare($updateQuery);
                $updStmt->bindParam(":b_id", $data->b_id);
                
                if ($updStmt->execute()) {
                    http_response_code(200);
                    echo json_encode(array("message" => "Booking cancelled successfully."));
                } else {
                    http_response_code(503);
                    echo json_encode(array("message" => "Failed to update booking status."));
                }
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Failed to archive booking."));
            }
            
        } else {
            http_response_code(404);
            echo json_encode(array("message" => "Booking not found."));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Incomplete data."));
    }
}
?>
