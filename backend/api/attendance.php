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
    // Fetch currently logged-in staff
    $query = "SELECT * FROM f_login_status WHERE emp_login = '1' ORDER BY login_time DESC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $staff = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($staff);

} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    $action = isset($data->action) ? $data->action : '';

    if ($action === 'login') {
        $id_emp = $data->id_emp;
        $emp_mobile = $data->emp_mobile;
        $emp_name = $data->emp_name;
        $login_time = date('Y-m-d H:i:s');
        $login_status = '1';
        $emp_login = '1';

        // Check if already logged in
        $check_query = "SELECT * FROM f_login_status WHERE id_emp = :id_emp AND emp_login = '1'";
        $stmt_check = $db->prepare($check_query);
        $stmt_check->bindParam(":id_emp", $id_emp);
        $stmt_check->execute();

        if ($stmt_check->rowCount() > 0) {
            http_response_code(400);
            echo json_encode(array("message" => "Staff already logged in."));
        } else {
            $query = "INSERT INTO f_login_status (id_emp, emp_mobile, emp_name, login_time, login_status, emp_login) 
                      VALUES (:id_emp, :emp_mobile, :emp_name, :login_time, :login_status, :emp_login)";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":id_emp", $id_emp);
            $stmt->bindParam(":emp_mobile", $emp_mobile);
            $stmt->bindParam(":emp_name", $emp_name);
            $stmt->bindParam(":login_time", $login_time);
            $stmt->bindParam(":login_status", $login_status);
            $stmt->bindParam(":emp_login", $emp_login);

            if ($stmt->execute()) {
                echo json_encode(array("message" => "Staff Logged In Successfully."));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to login staff."));
            }
        }

    } elseif ($action === 'logout') {
        $id_emp = $data->id_emp;
        $logout_date = date('Y-m-d H:i:s');
        $logout_date_new = date('Y-m-d');

        // Logic to calculate hours diff (simplified)
        // Fetch login time first
        $query_login = "SELECT login_time FROM f_login_status WHERE id_emp = :id_emp AND emp_login = '1'";
        $stmt_login = $db->prepare($query_login);
        $stmt_login->bindParam(":id_emp", $id_emp);
        $stmt_login->execute();
        $row = $stmt_login->fetch(PDO::FETCH_ASSOC);
        
        $hrsp_day = 0;
        $minscalc = 0;

        if ($row) {
            $login_time_str = $row['login_time'];
            $login_timestamp = strtotime($login_time_str);
            $logout_timestamp = strtotime($logout_date);
            $diff = $logout_timestamp - $login_timestamp;
            $hrsp_day = floor($diff / 3600);
            $minscalc = floor(($diff % 3600) / 60);
        }

        $query = "UPDATE f_login_status SET 
                    logout_date_new = :logout_date_new, 
                    logout = :logout_date, 
                    login_status = '0', 
                    emp_login = '0',
                    hrsp_day = :hrsp_day,
                    minscalc = :minscalc
                  WHERE id_emp = :id_emp AND emp_login = '1'";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(":logout_date_new", $logout_date_new);
        $stmt->bindParam(":logout_date", $logout_date);
        $stmt->bindParam(":hrsp_day", $hrsp_day);
        $stmt->bindParam(":minscalc", $minscalc);
        $stmt->bindParam(":id_emp", $id_emp);

        if ($stmt->execute()) {
            echo json_encode(array("message" => "Staff Logged Out Successfully."));
        } else {
             http_response_code(503);
             echo json_encode(array("message" => "Unable to logout staff."));
        }
    } else {
         http_response_code(400);
         echo json_encode(array("message" => "Invalid action."));
    }
}
?>
