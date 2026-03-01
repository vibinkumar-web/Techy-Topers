<?php
session_start();
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");



include_once '../config/db.php';

$database = new Database();
$db = $database->getConnection();

$v_id = isset($_GET['v_id']) ? $_GET['v_id'] : '';
$from_date = isset($_GET['from_date']) ? $_GET['from_date'] : '';
$to_date = isset($_GET['to_date']) ? $_GET['to_date'] : '';

if ($v_id && $from_date && $to_date) {
    // Fetch attendance history for vehicle
    // Legacy logic: Select * from f_login_status where id_emp='".$id_emp."' and logout_date_new BETWEEN '$date1' AND '$date2' ORDER BY logout_date_new
    $query = "SELECT * FROM f_login_status 
              WHERE id_emp = :v_id 
              AND logout_date_new BETWEEN :from_date AND :to_date 
              ORDER BY logout_date_new DESC";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(":v_id", $v_id);
    $stmt->bindParam(":from_date", $from_date);
    $stmt->bindParam(":to_date", $to_date);
    $stmt->execute();
    
    $attendance = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Calculate hours diff for display (though legacy stores it in hrsp_day)
    // We can rely on stored values or recalc if needed. 
    // Legacy shows: S.No, Login Date, Logout Date, Login Hrs
    
    echo json_encode($attendance);

} elseif ($v_id === 'list') { 
    // Fetch unique vehicles that have attendance records
    // Legacy: SELECT id_emp FROM f_login_status where v_type IS NOT NULL GROUP BY id_emp HAVING count(id_emp) > 0
    $query = "SELECT id_emp FROM f_login_status WHERE v_type IS NOT NULL GROUP BY id_emp HAVING count(id_emp) > 0";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $vehicles = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($vehicles);

} else {
     echo json_encode(array("message" => "Please provide vehicle ID and date range or use 'list'."));
}
?>


