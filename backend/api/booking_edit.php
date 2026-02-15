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

// Update f_ft_booking
$query = "UPDATE f_ft_booking SET 
            cus_name = :cus_name,
            cus_mobile = :cus_mobile,
            pickup = :pickup,
            pickup_time = :pickup_time,
            drop_place = :drop_place,
            v_types = :v_types,
            b_type = :b_type,
            ac_type = :ac_type,
            remarks = :remarks
          WHERE b_id = :b_id";

$stmt = $db->prepare($query);

$stmt->bindParam(":cus_name", $data->cus_name);
$stmt->bindParam(":cus_mobile", $data->cus_mobile);
$stmt->bindParam(":pickup", $data->pickup);
$stmt->bindParam(":pickup_time", $data->pickup_time);
$stmt->bindParam(":drop_place", $data->drop_place);
$stmt->bindParam(":v_types", $data->v_types);
$stmt->bindParam(":b_type", $data->b_type);
$stmt->bindParam(":ac_type", $data->ac_type);
$stmt->bindParam(":remarks", $data->remarks);
$stmt->bindParam(":b_id", $data->b_id);

if ($stmt->execute()) {
    echo json_encode(array("message" => "Booking Updated Successfully."));
} else {
    http_response_code(503);
    echo json_encode(array("message" => "Unable to update booking."));
}
?>
