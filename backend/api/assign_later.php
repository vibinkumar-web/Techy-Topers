<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/db.php';

$database = new Database();
$db = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $action = isset($_GET['action']) ? $_GET['action'] : '';

    if ($action == 'drivers') {
        // Fetch available drivers (login_status=1, ontrip_status=0, status_assign=0)
        // Adjusting logic based on legacy `assign_later.php`
        $query = "SELECT * FROM f_login_status WHERE login_status = '1' AND ontrip_status = '0' AND status_assign = '0' ORDER BY id_emp";
        $stmt = $db->prepare($query);
        $stmt->execute();
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } else {
         // Fetch unassigned bookings
         // Legacy `assign.php` uses `assign='0'` or `b_now='1'`?
         // Let's assume bookings that need assignment.
         // For "Assign Later", maybe it's bookings with `assign='0'`?
        $query = "SELECT * FROM f_ft_booking WHERE assign = '0' AND b_now = '0' ORDER BY pickup DESC"; # Adjust logic as needed
        $stmt = $db->prepare($query);
        $stmt->execute();
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    
    // Assignment Logic
    // Update booking AND login_status
    if (isset($data->b_id) && isset($data->driver_id)) {
        
        $db->beginTransaction();
        try {
            // 1. Update Booking
            $query1 = "UPDATE f_ft_booking SET 
                       b_now='1', 
                       q=:driver_id, 
                       v_no=:v_no, 
                       v_types=:v_type, 
                       d_mobile=:d_mobile, 
                       assign='1' 
                       WHERE id=:id";
            
            $stmt1 = $db->prepare($query1);
            $stmt1->bindParam(":driver_id", $data->driver_id); // q
             $stmt1->bindParam(":v_no", $data->v_no);
             $stmt1->bindParam(":v_type", $data->v_type);
             $stmt1->bindParam(":d_mobile", $data->d_mobile);
             $stmt1->bindParam(":id", $data->id);
             
             if (!$stmt1->execute()) throw new Exception("Booking update failed");

             // 2. Insert into f_ontrip
             // (Simplified for now, legacy inserts into f_ontrip immediately?)
             // Legacy `assign_later.php` does INSERT INTO `f_ontrip`
             
             $query2 = "INSERT INTO f_ontrip 
                        (b_id, bookin_time, p_date, assign_time, p_city, d_place, v_id, v_type, v_no, d_mobile, b_name, m_no, t_type, ac_type, already_assign, to_whom, user_id, r_status)
                        VALUES 
                        (:b_id, :pickup, CURDATE(), NOW(), :p_city, :d_place, :driver_id, :v_type, :v_no, :d_mobile, :b_name, :m_no, :t_type, :ac_type, '1', :to_whom, :user_id, :r_status)";
             
             $stmt2 = $db->prepare($query2);
             $stmt2->bindParam(":b_id", $data->b_id);
             $stmt2->bindParam(":pickup", $data->pickup);
             $stmt2->bindParam(":p_city", $data->p_city);
             $stmt2->bindParam(":d_place", $data->d_place);
             $stmt2->bindParam(":driver_id", $data->driver_id);
             $stmt2->bindParam(":v_type", $data->v_type);
             $stmt2->bindParam(":v_no", $data->v_no);
             $stmt2->bindParam(":d_mobile", $data->d_mobile);
             $stmt2->bindParam(":b_name", $data->b_name);
             $stmt2->bindParam(":m_no", $data->m_no);
             $stmt2->bindParam(":t_type", $data->t_type);
             $stmt2->bindParam(":ac_type", $data->ac_type);
             $stmt2->bindParam(":to_whom", $data->to_whom);
             $stmt2->bindParam(":user_id", $data->user_id);
             $stmt2->bindParam(":r_status", $data->r_status);
             
             if (!$stmt2->execute()) throw new Exception("OnTrip insert failed");

             // 3. Update Login Status
             $query3 = "UPDATE f_login_status SET status_assign='1', ontrip_status='1' WHERE id_emp=:driver_id AND login_status='1'";
             $stmt3 = $db->prepare($query3);
             $stmt3->bindParam(":driver_id", $data->driver_id);
             
             if (!$stmt3->execute()) throw new Exception("Login status update failed");

             $db->commit();
             echo json_encode(array("message" => "Assignment successful."));

        } catch (Exception $e) {
            $db->rollBack();
            http_response_code(503);
            echo json_encode(array("message" => "Assignment failed: " . $e->getMessage()));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Incomplete data."));
    }
}
?>
