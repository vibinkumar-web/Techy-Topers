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

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $action = isset($_GET['action']) ? $_GET['action'] : '';
    $v_cat = isset($_GET['v_cat']) ? trim($_GET['v_cat']) : '';
    $v_model = isset($_GET['v_model']) ? trim($_GET['v_model']) : '';

    if ($action === 'get_models') {
        // Fetch distinct models for a selected category
        $query = "SELECT DISTINCT v_model FROM f_v_attach WHERE v_model IS NOT NULL AND v_model != ''";
        if (!empty($v_cat)) {
            $query .= " AND v_cat = :v_cat";
        }
        $query .= " ORDER BY v_model ASC";
        
        $stmt = $db->prepare($query);
        if (!empty($v_cat)) {
            $stmt->bindParam(":v_cat", $v_cat);
        }
        $stmt->execute();
        
        $models = array();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            if (!empty($row['v_model'])) {
                $models[] = $row['v_model'];
            }
        }
        
        echo json_encode($models);
        exit;
    }

    // Main fetch for available vehicles
    $query = "SELECT f.id, f.v_cat, f.v_brand, f.v_model, f.v_no, f.d_name, f.d_mobile, f.vacant_place
              FROM f_v_attach f
              WHERE f.v_no NOT IN (
                  SELECT v_no FROM f_ontrip WHERE on_trip_status = '1'
              )";

    if (!empty($v_cat)) {
        $query .= " AND f.v_cat = :v_cat";
    } else {
        $query .= " AND f.v_cat IN ('Mini', 'Sedan', 'SUV')";
    }

    if (!empty($v_model)) {
        $query .= " AND f.v_model = :v_model";
    }

    $query .= " ORDER BY f.v_cat, f.v_model, f.v_brand";

    $stmt = $db->prepare($query);
    if (!empty($v_cat)) {
        $stmt->bindParam(":v_cat", $v_cat);
    }
    if (!empty($v_model)) {
        $stmt->bindParam(":v_model", $v_model);
    }
    $stmt->execute();

    $vehicles = array();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        array_push($vehicles, $row);
    }

    echo json_encode($vehicles);
}
?>

