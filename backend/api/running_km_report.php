<?php
session_start();
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/db.php';

$database = new Database();
$db = $database->getConnection();

$v_id = isset($_GET['v_id']) ? $_GET['v_id'] : '';
$from_date = isset($_GET['from_date']) ? $_GET['from_date'] : '';
$to_date = isset($_GET['to_date']) ? $_GET['to_date'] : '';

if (isset($_GET['list'])) {
    // Get list of vehicle IDs from f_closing
    $query = "SELECT DISTINCT v_id FROM f_closing ORDER BY v_id";
    $stmt = $db->prepare($query);
    $stmt->execute();
    echo json_encode($stmt->fetchAll(PDO::FETCH_COLUMN));
    exit;
}

if ($from_date && $to_date) {
    
    $query = "SELECT * FROM f_closing WHERE p_date BETWEEN :from_date AND :to_date";
    if ($v_id && $v_id !== 'All') {
        $query .= " AND v_id = :v_id";
    }
    $query .= " ORDER BY v_id, p_date ASC, id ASC"; // Sort by V_ID then Date to calc diff correctly
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(":from_date", $from_date);
    $stmt->bindParam(":to_date", $to_date);
    if ($v_id && $v_id !== 'All') {
        $stmt->bindParam(":v_id", $v_id);
    }
    
    $stmt->execute();
    
    $data = array();
    $prevClosingKm = 0;
    $currentVehicle = '';

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // Reset prevClosing if vehicle changes
        if ($currentVehicle !== $row['v_id']) {
            $prevClosingKm = 0;
            $currentVehicle = $row['v_id'];
        }

        $row['opening_km'] = floatval($row['opening_km']);
        $row['closing_km'] = floatval($row['closing_km']);
        $row['running_km'] = $row['closing_km'] - $row['opening_km'];
        
        $row['diff_km'] = ($prevClosingKm > 0) ? ($row['opening_km'] - $prevClosingKm) : 0;
        
        $prevClosingKm = $row['closing_km'];
        
        array_push($data, $row);
    }
    echo json_encode($data);

} else {
     echo json_encode(array());
}
?>

