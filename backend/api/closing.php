<?php
session_start();
include_once '../config/db.php';


$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

// Ensure app_config table exists
$db->exec("CREATE TABLE IF NOT EXISTS app_config (
    config_key VARCHAR(100) PRIMARY KEY,
    config_value VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)");

if ($method === 'GET') {
    // Fetch trip details by b_id
    if(isset($_GET['b_id'])) {
        $b_id = $_GET['b_id'];
        $query = "SELECT f.*,
                    COALESCE(fva.v_model, f.v_type) as matched_vehicle,
                    COALESCE(et.kmnonac, 0) as kmnonac,
                    COALESCE(et.kmac, 0) as kmac,
                    COALESCE(ac.config_value, '190') as base_fare
                  FROM f_ontrip f
                  LEFT JOIN f_v_attach fva ON fva.v_id = f.v_id
                  LEFT JOIN enquery_tariff et ON et.id = (
                      SELECT id FROM enquery_tariff
                      WHERE LOWER(TRIM(name)) LIKE CONCAT(LOWER(TRIM(COALESCE(fva.v_model, f.v_type))), '%')
                         OR LOWER(TRIM(COALESCE(fva.v_model, f.v_type))) LIKE CONCAT(LOWER(TRIM(name)), '%')
                      ORDER BY
                        CASE WHEN LOWER(TRIM(name)) LIKE CONCAT(LOWER(TRIM(COALESCE(fva.v_model, f.v_type))), '%') THEN 0 ELSE 1 END,
                        LENGTH(name) ASC
                      LIMIT 1
                  )
                  LEFT JOIN app_config ac ON ac.config_key = 'base_fare'
                  WHERE f.b_id = :b_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":b_id", $b_id);
        $stmt->execute();

        if($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            echo json_encode($row);
        } else {
             http_response_code(404);
             echo json_encode(array("message" => "Trip not found."));
        }
    } else {
        // If no b_id is provided, list all active trips that can be closed
        $query = "SELECT * FROM f_ontrip WHERE already_assign = '1' ORDER BY assign_time DESC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        $trips = array();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            array_push($trips, $row);
        }
        echo json_encode($trips);
    }

} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    
    // Validate required fields (simplified for now)
    if (!empty($data->b_id) && isset($data->closing_km)) {
        
        // Prepare data matching legacy Insert
        $b_id = $data->b_id;
        $v_id = $data->v_id;
        $opening_km = $data->opening_km;
        $closing_km = $data->closing_km;
        $remarks = $data->remarks;
        $p_date = date('Y-m-d'); // Current date
        $d_date = date('Y-m-d');
        $ac_type = $data->ac_value_new ?? $data->ac_type ?? ''; // Fallback for dynamic payloads
        $t_type = $data->t_type;
        $v_type = $data->v_type;
        $p_city = $data->p_city;
        $d_place = $data->d_place;
        $rwads_point = $data->rwads_point ?? 0;
        $package_name = $data->package_name ?? '';
        $pack_charges = $data->pack_charges ?? 0;
        $waiting_charges = $data->waiting_charges ?? 0;
        $ex_km = $data->ex_km ?? 0;
        $ex_km_charges = $data->ex_km_charges ?? 0;
        $wait_hrs = $data->wait_hrs ?? 0;
        $wait_min = $data->wait_min ?? 0;
        $other_charge = $data->other_charge ?? 0;
        $net_total = $data->net_total;
        $paid_amount = $data->paid_amount;
        $discount = $data->discount ?? 0;
        $dis_reason = $data->dis_reason ?? '';
        $to_whom = $data->company ?? $data->to_whom ?? '';
        $customer = $data->b_name ?? $data->customer ?? '';
        $m_no = $data->m_no;
        $d_mobile = $data->d_mobile;
        $user_id = $data->user_id;
        $pending = ($net_total > $paid_amount) ? '1' : '0';
        
        // Legacy fetches pickup/drop time from data or f_ontrip, using defaults here
        // Assuming passed or fetched. Legacy uses $first and $second
        $pickup_time = $data->pickup_time ?? date('Y-m-d H:i');
        $drop_time = date('Y-m-d H:i');

        $query = "INSERT INTO f_closing SET
            b_id = :b_id,
            bid = :b_id,
            v_id = :v_id,
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
            rwards_point = :rwads_point,
            packagename = :package_name,
            pack_charges = :pack_charges,
            waiting_charges = :waiting_charges,
            ex_km = :ex_km,
            ex_km_charges = :ex_km_charges,
            wait_hrs = :wait_hrs,
            wait_min = :wait_min,
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
            user_id = :user_id";

        $stmt = $db->prepare($query);
        $stmt->bindParam(":b_id", $b_id);
        $stmt->bindParam(":v_id", $v_id);
        $stmt->bindParam(":opening_km", $opening_km);
        $stmt->bindParam(":closing_km", $closing_km);
        $stmt->bindParam(":remarks", $remarks);
        $stmt->bindParam(":pickup_time", $pickup_time);
        $stmt->bindParam(":p_date", $p_date);
        $stmt->bindParam(":drop_time", $drop_time);
        $stmt->bindParam(":d_date", $d_date);
        $stmt->bindParam(":ac_type", $ac_type);
        $stmt->bindParam(":t_type", $t_type);
        $stmt->bindParam(":v_type", $v_type);
        $stmt->bindParam(":p_city", $p_city);
        $stmt->bindParam(":d_place", $d_place);
        $stmt->bindParam(":rwads_point", $rwads_point);
        $stmt->bindParam(":package_name", $package_name);
        $stmt->bindParam(":pack_charges", $pack_charges);
        $stmt->bindParam(":waiting_charges", $waiting_charges);
        $stmt->bindParam(":ex_km", $ex_km);
        $stmt->bindParam(":ex_km_charges", $ex_km_charges);
        $stmt->bindParam(":wait_hrs", $wait_hrs);
        $stmt->bindParam(":wait_min", $wait_min);
        $stmt->bindParam(":other_charge", $other_charge);
        $stmt->bindParam(":net_total", $net_total);
        $stmt->bindParam(":paid_amount", $paid_amount);
        $stmt->bindParam(":discount", $discount);
        $stmt->bindParam(":dis_reason", $dis_reason);
        $stmt->bindParam(":to_whom", $to_whom);
        $stmt->bindParam(":customer", $customer);
        $stmt->bindParam(":m_no", $m_no);
        $stmt->bindParam(":d_mobile", $d_mobile);
        $stmt->bindParam(":pending", $pending);
        $stmt->bindParam(":user_id", $user_id);

        if ($stmt->execute()) {
             // Update f_login_status (Free Driver)
             $loginQuery = "UPDATE f_login_status SET ontrip_status='0' , status_assign='0', trip_amount=:paid_amount WHERE id_emp=:v_id AND login_status='1'";
             $lStmt = $db->prepare($loginQuery);
             $lStmt->bindParam(":paid_amount", $paid_amount);
             $lStmt->bindParam(":v_id", $v_id);
             $lStmt->execute();

             // Update f_ontrip (Mark as closed/processed)
             $tripQuery = "UPDATE f_ontrip SET already_assign='0', closing_km=:closing_km WHERE b_id = :b_id";
             $tStmt = $db->prepare($tripQuery);
             $tStmt->bindParam(":closing_km", $closing_km);
             $tStmt->bindParam(":b_id", $b_id);
             $tStmt->execute();

             // Mark booking as completed
             $bkQuery = "UPDATE f_ft_booking SET booking_status='1' WHERE b_id = :b_id";
             $bkStmt = $db->prepare($bkQuery);
             $bkStmt->bindParam(":b_id", $b_id);
             $bkStmt->execute();
             
             http_response_code(200);
             echo json_encode(array("message" => "Trip closed successfully."));
        } else {
             http_response_code(503);
             echo json_encode(array("message" => "Unable to close trip."));
        }
    } else {
         http_response_code(400);
         echo json_encode(array("message" => "Incomplete data."));
    }
}
?>
