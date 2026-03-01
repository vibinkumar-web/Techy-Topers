<?php
// CORS headers
$allowed_origins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
header("Access-Control-Allow-Origin: " . (in_array($origin, $allowed_origins) ? $origin : 'http://localhost:5173'));
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");



session_start();
include_once '../config/db.php';

$database = new Database();
$db = $database->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

// Helper to calc timestamp diff
function update_logout($db, $id_emp, $login_time_str) {
    if (!$id_emp || !$login_time_str) return false;
    
    $logout_date = date('Y-m-d H:i:s');
    $logout_date_new = date('Y-m-d');
    
    $login_timestamp = strtotime($login_time_str);
    $logout_timestamp = strtotime($logout_date);
    $diff = $logout_timestamp - $login_timestamp;
    $hrsp_day = floor($diff / 3600);
    $minscalc = floor(($diff % 3600) / 60);

    $query = "UPDATE f_login_status SET 
                logout_date_new = :logout_date_new, 
                logout = :logout_date, 
                login_status = '0', 
                emp_login = '0',
                hrsp_day = :hrsp_day,
                minscalc = :minscalc
              WHERE id_emp = :id_emp AND login_time = :login_time AND login_status = '1'";
              
    $stmt = $db->prepare($query);
    $stmt->bindParam(":logout_date_new", $logout_date_new);
    $stmt->bindParam(":logout_date", $logout_date);
    $stmt->bindParam(":hrsp_day", $hrsp_day);
    $stmt->bindParam(":minscalc", $minscalc);
    $stmt->bindParam(":id_emp", $id_emp);
    $stmt->bindParam(":login_time", $login_time_str);
    
    return $stmt->execute();
}

if ($method === 'GET') {
    // Fetch all currently logged-in vehicles (which act like drivers on the portal, emp_login might be null or 0 compared to staff)
    // For legacy, vehicles are marked by `v_type` OR joining `f_v_attach` to find vehicle IDs
    $query = "SELECT l.id_emp as v_id, l.login_time, v.vacant_place, v.v_no, v.d_name 
              FROM f_login_status l
              JOIN f_v_attach v ON l.id_emp = v.v_id
              WHERE l.login_status = '1'
              ORDER BY l.login_time DESC";
              
    $stmt = $db->prepare($query);
    $stmt->execute();
    $active_vehicles = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($active_vehicles);
    exit;
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    $action = isset($data->action) ? $data->action : '';
    
    if ($action === 'logout_all') {
        // Find all active vehicles
        $query = "SELECT l.id_emp, l.login_time 
                  FROM f_login_status l
                  JOIN f_v_attach v ON l.id_emp = v.v_id
                  WHERE l.login_status = '1'";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $vehicles = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $successCount = 0;
        foreach ($vehicles as $v) {
            if (update_logout($db, $v['id_emp'], $v['login_time'])) {
                $successCount++;
            }
        }
        
        echo json_encode(["message" => "$successCount vehicles logged out successfully.", "status" => "success"]);
        exit;
    }
    
    if ($action === 'logout_single') {
        $v_id = isset($data->v_id) ? $data->v_id : '';
        if (!$v_id) {
            http_response_code(400);
            echo json_encode(["message" => "Vehicle ID is required."]);
            exit;
        }
        
        // Find specific active vehicle
        $query = "SELECT l.id_emp, l.login_time 
                  FROM f_login_status l
                  JOIN f_v_attach v ON l.id_emp = v.v_id
                  WHERE l.login_status = '1' AND l.id_emp = :v_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':v_id', $v_id);
        $stmt->execute();
        $v = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($v) {
            if (update_logout($db, $v['id_emp'], $v['login_time'])) {
                echo json_encode(["message" => "Vehicle $v_id logged out successfully.", "status" => "success"]);
            } else {
                http_response_code(500);
                echo json_encode(["message" => "Failed to update database for $v_id."]);
            }
        } else {
            http_response_code(404);
            echo json_encode(["message" => "Active vehicle not found or already logged out."]);
        }
        exit;
    }

    http_response_code(400);
    echo json_encode(["message" => "Invalid action."]);
    exit;
}
?>

