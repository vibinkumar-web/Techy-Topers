<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/db.php';

$database = new Database();
$db = $database->getConnection();

$emp_id = isset($_GET['emp_id']) ? $_GET['emp_id'] : '';
$from_date = isset($_GET['from_date']) ? $_GET['from_date'] : '';
$to_date = isset($_GET['to_date']) ? $_GET['to_date'] : '';

if ($from_date && $to_date) {
    $query = "SELECT * FROM f_login_status WHERE logout_date_new BETWEEN :from_date AND :to_date";
    if ($emp_id && $emp_id !== 'All') {
        $query .= " AND id_emp = :emp_id";
    }
    $query .= " ORDER BY logout_date_new DESC";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(":from_date", $from_date);
    $stmt->bindParam(":to_date", $to_date);
    if ($emp_id && $emp_id !== 'All') {
        $stmt->bindParam(":emp_id", $emp_id);
    }
    
    $stmt->execute();
    
    $data = array();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // Calculate duration if logout exists
        if ($row['logout']) {
             $start = new DateTime($row['login_time']);
             $end = new DateTime($row['logout']);
             $interval = $start->diff($end);
             $row['duration'] = $interval->format('%d days %H:%I');
             $row['duration_hours'] = ($interval->days * 24) + $interval->h + ($interval->i / 60);
        } else {
            $row['duration'] = 'Active';
            $row['duration_hours'] = 0;
        }
        array_push($data, $row);
    }
    echo json_encode($data);

} elseif (isset($_GET['action']) && $_GET['action'] === 'salary_summary') {
    $emp_id = isset($_GET['emp_id']) ? $_GET['emp_id'] : '';
    if (!$emp_id) {
         echo json_encode(['error' => 'Employee ID is required']);
         exit;
    }

    $first_day = date('Y-m-01');
    $last_day = date('Y-m-t');

    // Fetch shifts for the current month
    $query = "SELECT * FROM f_login_status 
              WHERE id_emp = :emp_id 
              AND logout_date_new BETWEEN :from_date AND :to_date 
              ORDER BY login_time DESC";
              
    $stmt = $db->prepare($query);
    $stmt->bindParam(":emp_id", $emp_id);
    $stmt->bindParam(":from_date", $first_day);
    $stmt->bindParam(":to_date", $last_day);
    $stmt->execute();

    $shifts = [];
    $total_ms = 0;

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $duration_str = '-';
        if ($row['logout'] && $row['logout'] !== '0000-00-00 00:00:00') {
             $start = strtotime($row['login_time']);
             $end = strtotime($row['logout']);
             $diff = $end - $start;
             if ($diff > 0) {
                 $total_ms += $diff;
                 $hrs = floor($diff / 3600);
                 $mins = floor(($diff % 3600) / 60);
                 $duration_str = "${hrs}h ${mins}m";
             }
        }
        $row['duration_formatted'] = $duration_str;
        $shifts[] = $row;
    }

    // Calculate total hours exactly
    $total_hrs = floor($total_ms / 3600);
    $total_mins = floor(($total_ms % 3600) / 60);

    echo json_encode([
        'total_duration' => "${total_hrs}h ${total_mins}m",
        'total_decimal' => round($total_hrs + ($total_mins / 60), 2),
        'shifts' => array_slice($shifts, 0, 10) // Only send 10 recent
    ]);

} elseif (isset($_GET['list'])) {
    // Get list of staff IDs present in login status
    $query = "SELECT DISTINCT id_emp FROM f_login_status WHERE v_type IS NULL ORDER BY id_emp";
    $stmt = $db->prepare($query);
    $stmt->execute();
    echo json_encode($stmt->fetchAll(PDO::FETCH_COLUMN));
} else {
     echo json_encode(array());
}
?>

