<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: PUT, OPTIONS");
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

if (!isset($data->b_id)) {
    http_response_code(400);
    echo json_encode(array("message" => "Booking ID is required."));
    exit;
}

// Update f_closing
$query = "UPDATE f_closing SET 
            opening_km = :opening_km,
            closing_km = :closing_km,
            remarks = :remarks,
            pickup_time = :pickup_time,
            p_date = :p_date,
            drop_time = :drop_time,
            d_date = :d_date,
            ac_type = :ac_type,
            t_type = :t_type,
            v_type = :v_type,
            picup_place = :p_city,
            drop_place = :d_place,
            rwards_point = :rwards_point,
            packagename = :package_name,
            other_charge = :other_charge,
            net_total = :net_total,
            paid_amount = :paid_amount,
            discount = :discount,
            dis_reason = :dis_reason,
            to_whom = :to_whom,
            customer = :customer,
            m_no = :m_no,
            d_mobile = :d_mobile,
            pending = :pending,
            user_id = :user_id
          WHERE b_id = :b_id";

$stmt = $db->prepare($query);

// Determine pending status
$pending = ($data->net_total > $data->paid_amount) ? '1' : '0';
$p_date = date('Y-m-d'); // Update edit date to today? Or keep original? Legacy uses date('Y-m-d') on edit.
$d_date = date('Y-m-d');

$stmt->bindParam(":opening_km", $data->opening_km);
$stmt->bindParam(":closing_km", $data->closing_km);
$stmt->bindParam(":remarks", $data->remarks);
$stmt->bindParam(":pickup_time", $data->pickup_time);
$stmt->bindParam(":p_date", $p_date);
$stmt->bindParam(":drop_time", $data->drop_time);
$stmt->bindParam(":d_date", $d_date);
$stmt->bindParam(":ac_type", $data->ac_type);
$stmt->bindParam(":t_type", $data->t_type);
$stmt->bindParam(":v_type", $data->v_type);
$stmt->bindParam(":p_city", $data->p_city);
$stmt->bindParam(":d_place", $data->d_place);
$stmt->bindParam(":rwards_point", $data->rwards_point);
$stmt->bindParam(":package_name", $data->package_name);
$stmt->bindParam(":other_charge", $data->other_charge);
$stmt->bindParam(":net_total", $data->net_total);
$stmt->bindParam(":paid_amount", $data->paid_amount);
$stmt->bindParam(":discount", $data->discount);
$stmt->bindParam(":dis_reason", $data->dis_reason);
$stmt->bindParam(":to_whom", $data->to_whom);
$stmt->bindParam(":customer", $data->customer);
$stmt->bindParam(":m_no", $data->m_no);
$stmt->bindParam(":d_mobile", $data->d_mobile);
$stmt->bindParam(":pending", $pending);
$stmt->bindParam(":user_id", $data->user_id);
$stmt->bindParam(":b_id", $data->b_id);

if ($stmt->execute()) {
    // Also update f_ontrip closing_km
    $query_ontrip = "UPDATE f_ontrip SET closing_km = :closing_km WHERE b_id = :b_id";
    $stmt_ontrip = $db->prepare($query_ontrip);
    $stmt_ontrip->bindParam(":closing_km", $data->closing_km);
    $stmt_ontrip->bindParam(":b_id", $data->b_id);
    $stmt_ontrip->execute();

    echo json_encode(array("message" => "Trip Updated Successfully."));
} else {
    http_response_code(503);
    echo json_encode(array("message" => "Unable to update trip."));
}
?>
