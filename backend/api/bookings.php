<?php
session_start();
include_once '../config/db.php';


$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
     // Fetch bookings. Can add filters later.
    $query = "SELECT * FROM f_ft_booking ORDER BY b_id DESC";
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
        !empty($data->pickup) &&
        !empty($data->m_no)
    ) {
        // Calculate b_id
        $queryMax = "SELECT MAX(b_id) as max_id FROM f_ft_booking";
        $stmtMax = $db->prepare($queryMax);
        $stmtMax->execute();
        $rowMax = $stmtMax->fetch(PDO::FETCH_ASSOC);
        $b_id = $rowMax['max_id'] + 1;

        $query = "INSERT INTO f_ft_booking SET
            b_id = :b_id,
            pickup = :pickup,
            b_date = :b_date,
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
            b_now = '0',
            assign = '0',
            user_id = :user_id";

        $stmt = $db->prepare($query);

        $stmt->bindParam(":b_id", $b_id);
        $stmt->bindParam(":pickup", $data->pickup);
        
        // Handle dates
        $timestamp = strtotime($data->pickup);
        $b_date = date('Y-m-d', $timestamp); // Or however legacy system handles it
        // Note: legacy uses $date_only_new = date('Y-m-d',$timestampss); which is b_date
        
        $stmt->bindParam(":b_date", $b_date);
        $stmt->bindParam(":d_place", $data->d_place);
        $stmt->bindParam(":to_whom", $data->to_whom);
        $stmt->bindParam(":a_no", $data->a_no);
        $stmt->bindParam(":cus_count", $data->cus_count);
        $stmt->bindParam(":p_city", $data->p_city);
        $stmt->bindParam(":r_status", $data->r_status);
        $stmt->bindParam(":m_no", $data->m_no);
        $stmt->bindParam(":v_type", $data->v_type);
        $stmt->bindParam(":st", $data->st);
        $stmt->bindParam(":t_type", $data->t_type);
        $stmt->bindParam(":b_name", $data->b_name);
        $stmt->bindParam(":ac_type", $data->ac_type);
        $stmt->bindParam(":b_type", $data->b_type);
        $stmt->bindParam(":remarks", $data->remarks);
        $stmt->bindParam(":user_id", $data->user_id);

        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(array("message" => "Booking created.", "b_id" => $b_id));
        } else {
            http_response_code(503);
             echo json_encode(array("message" => "Unable to create booking."));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Unable to create booking. Data is incomplete."));
    }
}
?>
