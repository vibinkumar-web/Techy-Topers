<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
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

if ($method === 'GET') {
    $v_id = isset($_GET['v_id']) ? $_GET['v_id'] : '';

    if ($v_id) {
        // Fetch trip details
        $query = "SELECT * FROM f_ontrip WHERE v_id = :v_id AND already_assign = '1'";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":v_id", $v_id);
        $stmt->execute();
        $trip = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($trip) {
            // Fetch local tariff for this vehicle type
            // Legacy uses 'v_name' in local_tariff which corresponds to 'v_type' (e.g., 'Indica')
            $v_type = $trip['v_type'];
            $tariffVal = 0;
            
            $query_tariff = "SELECT * FROM local_tariff WHERE v_name = :v_type";
            $stmt_tariff = $db->prepare($query_tariff);
            $stmt_tariff->bindParam(":v_type", $v_type);
            $stmt_tariff->execute();
            $tariff = $stmt_tariff->fetch(PDO::FETCH_ASSOC);

            // Combine data
            $response = array(
                "trip" => $trip,
                "tariff" => $tariff
            );
            echo json_encode($response);
        } else {
             http_response_code(404);
             echo json_encode(array("message" => "Trip not found."));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Vehicle ID required."));
    }

} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    // Insert into f_closing
    $query = "INSERT INTO f_closing (
        b_id, v_id, opening_km, closing_km, remarks, pickup_time, p_date, drop_time, d_date,
        ac_type, t_type, v_type, picup_place, drop_place, rwards_point, packagename, other_charge,
        net_total, paid_amount, discount, dis_reason, to_whom, customer, m_no, d_mobile, pending, user_id
    ) VALUES (
        :b_id, :v_id, :opening_km, :closing_km, :remarks, :pickup_time, :p_date, :drop_time, :d_date,
        :ac_type, :t_type, :v_type, :picup_place, :drop_place, :rwards_point, :packagename, :other_charge,
        :net_total, :paid_amount, :discount, :dis_reason, :to_whom, :customer, :m_no, :d_mobile, :pending, :user_id
    )";

    $stmt = $db->prepare($query);
    
    // Bind logic
    $stmt->bindParam(":b_id", $data->b_id);
    $stmt->bindParam(":v_id", $data->v_id);
    $stmt->bindParam(":opening_km", $data->opening_km);
    $stmt->bindParam(":closing_km", $data->closing_km);
    $stmt->bindParam(":remarks", $data->remarks);
    $stmt->bindParam(":pickup_time", $data->pickup_time);
    $stmt->bindParam(":p_date", $data->p_date);
    $stmt->bindParam(":drop_time", $data->drop_time);
    $stmt->bindParam(":d_date", $data->d_date);
    $stmt->bindParam(":ac_type", $data->ac_type);
    $stmt->bindParam(":t_type", $data->t_type);
    $stmt->bindParam(":v_type", $data->v_type);
    $stmt->bindParam(":picup_place", $data->picup_place);
    $stmt->bindParam(":drop_place", $data->drop_place);
    $stmt->bindParam(":rwards_point", $data->rwards_point);
    $stmt->bindParam(":packagename", $data->packagename);
    $stmt->bindParam(":other_charge", $data->other_charge);
    $stmt->bindParam(":net_total", $data->net_total);
    $stmt->bindParam(":paid_amount", $data->paid_amount);
    $stmt->bindParam(":discount", $data->discount);
    $stmt->bindParam(":dis_reason", $data->dis_reason);
    $stmt->bindParam(":to_whom", $data->to_whom);
    $stmt->bindParam(":customer", $data->customer);
    $stmt->bindParam(":m_no", $data->m_no);
    $stmt->bindParam(":d_mobile", $data->d_mobile);
    $stmt->bindParam(":pending", $data->pending);
    $stmt->bindParam(":user_id", $data->user_id);

    if ($stmt->execute()) {
        // Update f_login_status
        $query_login = "UPDATE f_login_status SET ontrip_status='0', status_assign='0', trip_amount=:trip_amount WHERE id_emp=:v_id AND login_status='1'";
        $stmt_login = $db->prepare($query_login);
        $stmt_login->bindParam(":trip_amount", $data->paid_amount);
        $stmt_login->bindParam(":v_id", $data->v_id);
        $stmt_login->execute();

        // Update f_ontrip
        $query_ontrip = "UPDATE f_ontrip SET already_assign='0' WHERE b_id=:b_id";
        $stmt_ontrip = $db->prepare($query_ontrip);
        $stmt_ontrip->bindParam(":b_id", $data->b_id);
        $stmt_ontrip->execute();

        // Update f_refused (missed opportunity tracking?)
        $query_ref = "UPDATE f_refused SET miss_amount=:trip_amount WHERE b_id=:b_id";
        $stmt_ref = $db->prepare($query_ref);
        $stmt_ref->bindParam(":trip_amount", $data->paid_amount);
        $stmt_ref->bindParam(":b_id", $data->b_id);
        $stmt_ref->execute();

        echo json_encode(array("message" => "Local Trip Closed Successfully."));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to close trip."));
    }
}
?>
