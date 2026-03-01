<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");



include_once '../config/db.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Fetch assigned trips
    // Legacy: SELECT * FROM f_ontrip where already_assign='1'
    
    $query = "SELECT * FROM f_ontrip WHERE already_assign = '1' ORDER BY bookin_time DESC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $data = array();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        array_push($data, $row);
    }
    echo json_encode($data);

} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    $action = isset($data->action) ? $data->action : '';

    if ($action === 'start_trip') {
        // Update login_status to 1 (Legacy: btnsubmit for status)
        $v_id = $data->v_id;
        $query = "UPDATE f_login_status SET login_status = '1' WHERE v_id = :v_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":v_id", $v_id);
        
        if ($stmt->execute()) {
            echo json_encode(array("message" => "Trip status updated."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Failed to update trip status."));
        }

    } elseif ($action === 'save_opening_km') {
        // Update Opening KM
        $v_id = $data->v_id;
        $opening_km = $data->opening_km;
        
        // Validation: Check against last closing KM
        $query_check = "SELECT MAX(closing_km) AS max_km FROM f_closing WHERE v_id = :v_id";
        $stmt_check = $db->prepare($query_check);
        $stmt_check->bindParam(":v_id", $v_id);
        $stmt_check->execute();
        $row_check = $stmt_check->fetch(PDO::FETCH_ASSOC);
        $last_closing_km = $row_check['max_km'] ? $row_check['max_km'] : 0;
        
        // Validation disabled to allow manual overrides for mismatched odometer readouts as requested by user.
        // if ($last_closing_km > 0 && $opening_km < $last_closing_km) {
        //      http_response_code(400);
        //      echo json_encode(array("message" => "Opening KM cannot be less than last Closing KM ($last_closing_km)."));
        //      exit;
        // }
        
        date_default_timezone_set("Asia/Calcutta");  
        $current_time = date("Y-m-d H:i");
        $new_opening = ($last_closing_km > 0) ? ($last_closing_km - $opening_km) : 0; // Legacy logic seems to be last - open? Wait, legacy: $new_one = $last_ckm - $opening_km; 
        // Actually legacy logic $old_km < $opening_km check implies Opening should be GREATER.
        // Legacy: if ( $old_km < $opening_km) -> OK. 
        // My check above: if ($opening_km < $last_closing_km) -> Error. So Opening must be >= Last Closing. Correct.
        // Legacy $new_one calculation: $last_ckm - $opening_km. If Opening > Last, this is negative? 
        // Let's look at legacy: $new_one = $last_ckm - $opening_km; 
        // This likely tracks the 'gap' or dead mileage if any, but usually Opening == Last Closing.
        // If Opening > Last Closing, there is a gap. 
        // If I strictly follow legacy:
        if ($opening_km < $last_closing_km) {
             $new_opening = 0; // Negative distance is invalid, so gap is 0
        } else {
             $new_opening = $opening_km - $last_closing_km; // Corrected math: diff is Current (Opening) - Previous (Closing)
        }

        $query = "UPDATE f_ontrip SET open_km = :opening_km, new_opening = :new_opening, bookin_time = :bookin_time WHERE already_assign = '1' AND v_id = :v_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":opening_km", $opening_km);
        $stmt->bindParam(":new_opening", $new_opening);
        $stmt->bindParam(":bookin_time", $current_time);
        $stmt->bindParam(":v_id", $v_id);
        
        if ($stmt->execute()) {
             echo json_encode(array("message" => "Opening KM saved successfully."));
        } else {
             http_response_code(503);
             echo json_encode(array("message" => "Failed to save Opening KM."));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Invalid action."));
    }
}
?>


