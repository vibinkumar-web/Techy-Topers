<?php
session_start();
include_once '../config/db.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Fetch all tariff data with optional KM-based price calculation
    $km = isset($_GET['km']) ? intval($_GET['km']) : 0;

    $query = "SELECT id, name, hrs, kmeter, nonac, withac, kmnonac, kmac, belowhun, abovehun, plus_amt FROM enquery_tariff ORDER BY id";
    $stmt = $db->prepare($query);
    $stmt->execute();

    $tariffs = array();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // Calculate price based on KM if provided
        if ($km > 0) {
            $km_nonac = floatval($row['kmnonac']);
            $km_ac = floatval($row['kmac']);
            $below = floatval($row['belowhun']);
            $above = floatval($row['abovehun']);

            if ($km <= 100) {
                $row['price_nonac'] = round($km * $km_nonac);
                $row['price_ac'] = round($km * $km_ac);
            } else {
                $row['price_nonac'] = round(100 * $km_nonac + ($km - 100) * $km_nonac);
                $row['price_ac'] = round(100 * $km_ac + ($km - 100) * $km_ac);
            }
            // Batta (driver allowance) 
            $row['batta'] = $km <= 100 ? $below : $above;
        }
        $tariffs[] = $row;
    }

    echo json_encode($tariffs);
}
?>
