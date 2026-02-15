<?php
session_start();
include_once '../config/db.php';


$database = new Database();
$db = $database->getConnection();

$type = isset($_GET['type']) ? $_GET['type'] : '';

if ($type === 'customer') {
    // Customer Booking Report
    $customer_name = isset($_GET['customer']) ? $_GET['customer'] : '';
    
    $query = "SELECT * FROM f_ft_booking";
    if (!empty($customer_name) && $customer_name !== 'All') {
        $query .= " WHERE b_name = :b_name";
    }
    $query .= " ORDER BY b_id DESC";
    
    $stmt = $db->prepare($query);
    if (!empty($customer_name) && $customer_name !== 'All') {
        $stmt->bindParam(":b_name", $customer_name);
    }
    $stmt->execute();
    
    $data = array();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        array_push($data, $row);
    }
    echo json_encode($data);

} elseif ($type === 'vehicle') {
    // Vehicle Trip Report (Income/Expense)
    $v_id = isset($_GET['v_id']) ? $_GET['v_id'] : '';
    $from_date = isset($_GET['from_date']) ? $_GET['from_date'] : '';
    $to_date = isset($_GET['to_date']) ? $_GET['to_date'] : '';
    
    $query = "SELECT * FROM f_closing WHERE 1=1";
    
    if (!empty($v_id) && $v_id !== 'All') {
        $query .= " AND v_id = :v_id";
    }
    
    if (!empty($from_date) && !empty($to_date)) {
        $query .= " AND p_date BETWEEN :from_date AND :to_date";
    }
    
    $query .= " ORDER BY pickup_time DESC";
    
    $stmt = $db->prepare($query);
    if (!empty($v_id) && $v_id !== 'All') {
        $stmt->bindParam(":v_id", $v_id);
    }
    if (!empty($from_date) && !empty($to_date)) {
        $stmt->bindParam(":from_date", $from_date);
        $stmt->bindParam(":to_date", $to_date);
    }
    $stmt->execute();
    
    $data = array();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        array_push($data, $row);
    }
    echo json_encode($data);
    
} elseif ($type === 'company') {
    // Company Report (Income/Expense)
    $company = isset($_GET['company']) ? $_GET['company'] : '';
    $from_date = isset($_GET['from_date']) ? $_GET['from_date'] : '';
    $to_date = isset($_GET['to_date']) ? $_GET['to_date'] : '';
    
    $query = "SELECT * FROM f_closing WHERE 1=1";
    
    if (!empty($company) && $company !== 'All') {
        $query .= " AND to_whom = :company";
    }
    
    if (!empty($from_date) && !empty($to_date)) {
        $query .= " AND p_date BETWEEN :from_date AND :to_date";
    }
    
    $query .= " ORDER BY pickup_time DESC";
    
    $stmt = $db->prepare($query);
    if (!empty($company) && $company !== 'All') {
        $stmt->bindParam(":company", $company);
    }
    if (!empty($from_date) && !empty($to_date)) {
        $stmt->bindParam(":from_date", $from_date);
        $stmt->bindParam(":to_date", $to_date);
    }
    $stmt->execute();
    
    $data = array();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        array_push($data, $row);
    }
    echo json_encode($data);
    
} elseif ($type === 'customers_list') {
    // Helper to get list of unique customers for dropdown
    $query = "SELECT DISTINCT b_name FROM f_ft_booking ORDER BY b_name ASC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $data = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo json_encode($data);

} elseif ($type === 'vehicles_list') {
    // Helper to get list of unique vehicle IDs for dropdown
    $query = "SELECT DISTINCT v_id FROM f_closing ORDER BY v_id ASC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $data = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo json_encode($data);

} elseif ($type === 'company_list') {
    // Helper to get list of unique Companies for dropdown
    $query = "SELECT DISTINCT to_whom FROM f_closing WHERE to_whom IS NOT NULL AND to_whom != '' ORDER BY to_whom ASC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $data = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo json_encode($data);

} else {
    http_response_code(400);
    echo json_encode(array("message" => "Invalid report type specified."));
}
?>
