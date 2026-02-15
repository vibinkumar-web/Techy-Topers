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

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->b_id) || !isset($data->v_id) || !isset($data->reason)) {
    http_response_code(400);
    echo json_encode(array("message" => "Booking ID, Vehicle ID, and Reason are required."));
    exit;
}

// 1. Update f_ft_booking (Unassign)
// Legacy: UPDATE `f_ft_booking` SET `q`='', `v_no`='', `v_types`='', `d_mobile`='', b_now='0', `assign`= '0' WHERE b_id = '".$id."'
// Note: Legacy used 'id' (primary key) but here we might use 'b_id'. Let's check logic. API should accept primary key ID or b_id.
// Assuming we pass the primary key `id` as `booking_ref_id` or just verify `b_id`. 
// Let's use `b_id` from input, but best to update by `b_id`.
$query_booking = "UPDATE f_ft_booking SET q='', v_no='', v_types='', d_mobile='', b_now='0', assign='0' WHERE b_id = :b_id";
$stmt_booking = $db->prepare($query_booking);
$stmt_booking->bindParam(":b_id", $data->b_id);

if ($stmt_booking->execute()) {
    
    // 2. Update f_login_status (Free up driver)
    $query_login = "UPDATE f_login_status SET ontrip_status='0', status_assign='0' WHERE id_emp = :v_id AND login_status='1'";
    $stmt_login = $db->prepare($query_login);
    $stmt_login->bindParam(":v_id", $data->v_id);
    $stmt_login->execute();

    // 3. Update f_ontrip (Mark as not assigned/cancelled?)
    // Legacy: UPDATE `f_ontrip` SET `bookin_time`='".$pickup."', assign_time='".$assigning."', `already_assign`='0' where b_id ='".$id."'
    // Assuming 'already_assign' = 0 means refused/cancelled in OnTrip view.
    $query_ontrip = "UPDATE f_ontrip SET already_assign='0' WHERE b_id = :b_id";
    $stmt_ontrip = $db->prepare($query_ontrip);
    $stmt_ontrip->bindParam(":b_id", $data->b_id);
    $stmt_ontrip->execute();

    // 4. Insert into f_refused_ontrip
    $query_refuse = "INSERT INTO f_refused_ontrip (b_id, v_id, reason_for, date_refused, user_id) VALUES (:b_id, :v_id, :reason, NOW(), :user_id)";
    $stmt_refuse = $db->prepare($query_refuse);
    $stmt_refuse->bindParam(":b_id", $data->b_id);
    $stmt_refuse->bindParam(":v_id", $data->v_id);
    $stmt_refuse->bindParam(":reason", $data->reason);
    $stmt_refuse->bindParam(":user_id", $data->user_id);
    
    if ($stmt_refuse->execute()) {
        echo json_encode(array("message" => "Trip Refusal Processed Successfully."));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Refusal recorded partially (Error inserting into f_refused_ontrip)."));
    }

} else {
    http_response_code(503);
    echo json_encode(array("message" => "Unable to process refusal (Booking update failed)."));
}
?>
