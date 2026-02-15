<?php
session_start();
include_once '../config/db.php';


$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // List unassigned bookings
    $query = "SELECT * FROM f_ft_booking WHERE assign = '0' AND booking_status != '1' ORDER BY b_date ASC, pickup ASC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $bookings = array();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        array_push($bookings, $row);
    }
    
    echo json_encode($bookings);

} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    if (
        !empty($data->b_id) &&
        !empty($data->v_id) 
    ) {
        // 1. Fetch vehicle details
        $vQuery = "SELECT * FROM f_v_attach WHERE v_id = :v_id";
        $vStmt = $db->prepare($vQuery);
        $vStmt->bindParam(":v_id", $data->v_id);
        $vStmt->execute();
        $vehicle = $vStmt->fetch(PDO::FETCH_ASSOC);

        // 2. Fetch booking details
        $bQuery = "SELECT * FROM f_ft_booking WHERE b_id = :b_id";
        $bStmt = $db->prepare($bQuery);
        $bStmt->bindParam(":b_id", $data->b_id);
        $bStmt->execute();
        $booking = $bStmt->fetch(PDO::FETCH_ASSOC);
        
        if ($vehicle && $booking) {
             date_default_timezone_set('Asia/Kolkata');
             $today_date = date("Y-m-d H:i:s");

             // 3. Insert into f_ontrip
             $ontripQuery = "INSERT INTO f_ontrip SET
                b_id = :b_id,
                bookin_time = :bookin_time,
                assign_time = :assign_time,
                p_city = :p_city,
                d_place = :d_place,
                v_id = :v_id,
                v_type = :v_type,
                d_mobile = :d_mobile,
                b_name = :b_name,
                m_no = :m_no,
                ac_type = :ac_type,
                t_type = :t_type,
                on_trip_status = '0',
                already_assign = '1',
                to_whom = :to_whom,
                user_id = :user_id,
                r_status = :r_status";
            
            $otStmt = $db->prepare($ontripQuery);
            $otStmt->bindParam(":b_id", $booking['b_id']);
            $otStmt->bindParam(":bookin_time", $booking['pickup']);
            $otStmt->bindParam(":assign_time", $today_date);
            $otStmt->bindParam(":p_city", $booking['p_city']);
            $otStmt->bindParam(":d_place", $booking['d_place']);
            $otStmt->bindParam(":v_id", $vehicle['v_id']); // Storing v_id in v_id column
            $otStmt->bindParam(":v_type", $booking['v_type']); // Or vehicle['v_model']? Legacy uses POST['v_types'] which is booking['v_type']? 
                                                               // Legacy assign1.php: $v_types = $_POST['v_types']; which comes from form value echo $row['v_type']; (from booking).
            $otStmt->bindParam(":d_mobile", $vehicle['d_mobile']);
            $otStmt->bindParam(":b_name", $booking['b_name']);
            $otStmt->bindParam(":m_no", $booking['m_no']);
            $otStmt->bindParam(":ac_type", $booking['ac_type']);
            $otStmt->bindParam(":t_type", $booking['t_type']);
            $otStmt->bindParam(":to_whom", $booking['to_whom']);
            $otStmt->bindParam(":user_id", $booking['user_id']); // Or current user? Legacy uses session emp_id.
            $otStmt->bindParam(":r_status", $booking['r_status']);

            if($otStmt->execute()) {
                 // 4. Update f_ft_booking
                $query = "UPDATE f_ft_booking SET 
                    assign = '1',
                    b_now = '1',
                    v_types = :v_types,
                    v_no = :v_no,
                    d_mobile = :d_mobile,
                    q = :q 
                    WHERE b_id = :b_id";

                $stmt = $db->prepare($query);
                $stmt->bindParam(":v_types", $vehicle['v_model']);
                $stmt->bindParam(":v_no", $vehicle['v_no']);
                $stmt->bindParam(":d_mobile", $vehicle['d_mobile']);
                $stmt->bindParam(":q", $vehicle['v_id']);
                $stmt->bindParam(":b_id", $data->b_id);
                $stmt->execute();

                // 5. Update f_login_status (Driver Status)
                $loginQuery = "UPDATE f_login_status SET ontrip_status='1', status_assign='1' WHERE id_emp = :v_id AND login_status='1'";
                $lStmt = $db->prepare($loginQuery);
                $lStmt->bindParam(":v_id", $vehicle['v_id']); 
                $lStmt->execute();

                http_response_code(200);
                echo json_encode(array("message" => "Booking assigned successfully."));
            } else {
                 http_response_code(503);
                 echo json_encode(array("message" => "Unable to insert into On Trip."));
            }
        } else {
             http_response_code(404);
             echo json_encode(array("message" => "Vehicle or Booking not found."));
        }

    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Unable to assign. Data is incomplete."));
    }
}
?>
