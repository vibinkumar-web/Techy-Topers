<?php
session_start();
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/db.php';

$database = new Database();
$db = $database->getConnection();

$company = isset($_GET['company']) ? $_GET['company'] : '';
$from_date = isset($_GET['from_date']) ? $_GET['from_date'] : '';
$to_date = isset($_GET['to_date']) ? $_GET['to_date'] : '';

if ($from_date && $to_date) {
    
    $query = "SELECT * FROM f_trip_sheet_entry WHERE date BETWEEN :from_date AND :to_date";
    
    if ($company && $company !== 'All') {
        $query .= " AND company_name = :company";
    }
    
    $query .= " ORDER BY date DESC";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(":from_date", $from_date);
    $stmt->bindParam(":to_date", $to_date); // trip sheet date is usually date only
    
    if ($company && $company !== 'All') {
        $stmt->bindParam(":company", $company);
    }
    
    $stmt->execute();
    
    $data = array();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        array_push($data, $row);
    }
    echo json_encode($data);

} elseif (isset($_GET['list'])) {
    // Get list of companies
    $query = "SELECT DISTINCT company_name FROM f_trip_sheet_entry WHERE company_name IS NOT NULL AND company_name != '' ORDER BY company_name";
    $stmt = $db->prepare($query);
    $stmt->execute();
    echo json_encode($stmt->fetchAll(PDO::FETCH_COLUMN));
} else {
     echo json_encode(array());
}
?>

