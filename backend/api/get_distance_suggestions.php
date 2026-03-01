<?php
// CORS headers must be first — before session_start and any other output
$allowed_origins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
header("Access-Control-Allow-Origin: " . (in_array($origin, $allowed_origins) ? $origin : 'http://localhost:5173'));
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");



session_start();
include_once '../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $km = isset($_GET['km']) ? floatval($_GET['km']) : 0;

    if ($km <= 0) {
        echo json_encode(['staff' => []]);
        exit;
    }

    try {
        $database = new Database();
        $db = $database->getConnection();

        if (!$db) {
            echo json_encode(['staff' => []]);
            exit;
        }

        // +/- 20% distance range
        $min_km = $km * 0.8;
        $max_km = $km * 1.2;

        $query = "SELECT v_id, COUNT(id) as trip_count
                  FROM f_closing
                  WHERE (closing_km - opening_km) >= :min_km
                  AND (closing_km - opening_km) <= :max_km
                  AND v_id IS NOT NULL AND v_id != ''
                  GROUP BY v_id
                  ORDER BY trip_count DESC
                  LIMIT 10";

        $stmt = $db->prepare($query);
        $stmt->bindParam(':min_km', $min_km);
        $stmt->bindParam(':max_km', $max_km);
        $stmt->execute();
        $frequent_drivers = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $suggestions = [];
        foreach ($frequent_drivers as $driver) {
            $staff_stmt = $db->prepare("SELECT name, mobile FROM f_staff WHERE id = :id");
            $staff_stmt->bindParam(':id', $driver['v_id']);
            $staff_stmt->execute();
            $staff_info = $staff_stmt->fetch(PDO::FETCH_ASSOC);

            $v_stmt = $db->prepare("SELECT v_name FROM f_attached_veh WHERE d_name = :id LIMIT 1");
            $v_stmt->bindParam(':id', $driver['v_id']);
            $v_stmt->execute();
            $v_info = $v_stmt->fetch(PDO::FETCH_ASSOC);

            if ($staff_info) {
                $driver['name']    = $staff_info['name'];
                $driver['mobile']  = $staff_info['mobile'];
                $driver['vehicle'] = $v_info ? $v_info['v_name'] : 'Unknown Vehicle';
                $suggestions[]     = $driver;
            }
        }

        echo json_encode(['staff' => $suggestions]);

    } catch (Exception $e) {
        // Return empty suggestions on any DB error — don't expose internals
        echo json_encode(['staff' => []]);
    }
} else {
    echo json_encode(['staff' => []]);
}
?>

