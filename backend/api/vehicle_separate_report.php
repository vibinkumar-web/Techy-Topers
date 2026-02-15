<?php
header("Access-Control-Allow-Origin: *");
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

if ($v_id && $from_date && $to_date) {
    
    // Fetch trips
    $query = "SELECT c.*, v.v_no, v.v_name 
              FROM f_closing c 
              LEFT JOIN f_vehicle_register v ON c.v_id = v.v_id 
              WHERE c.v_id = :v_id AND c.p_date BETWEEN :d1 AND :d2 
              ORDER BY c.p_date ASC";
              
    $stmt = $db->prepare($query);
    $stmt->bindParam(":v_id", $v_id);
    $stmt->bindParam(":d1", $from_date);
    $stmt->bindParam(":d2", $to_date);
    $stmt->execute();
    
    $trips = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Calculate Totals
    $totals = [
        'running_km' => 0,
        'net_total' => 0,
        'paid_amount' => 0,
        'discount' => 0,
        'pending_amount' => 0
    ];
    
    foreach ($trips as $trip) {
        $running = $trip['closing_km'] - $trip['opening_km'];
        $totals['running_km'] += $running;
        $totals['net_total'] += $trip['net_total'];
        $totals['paid_amount'] += $trip['paid_amount'];
        $totals['discount'] += $trip['discount'];
        
        if ($trip['net_total'] > $trip['paid_amount']) {
             $totals['pending_amount'] += ($trip['net_total'] - $trip['paid_amount']);
        }
    }

    echo json_encode(['trips' => $trips, 'totals' => $totals]);

} else {
     echo json_encode(array("message" => "Parameters required"));
}
?>
