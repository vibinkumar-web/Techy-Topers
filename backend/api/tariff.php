<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");



include_once '../config/db.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $v_id = isset($_GET['v_id']) ? $_GET['v_id'] : '';
    
    if ($v_id === 'list') {
        // Return list of available vehicle types in tariff table
        $query = "SELECT v_id, CONCAT('Type ', v_id) as name FROM out_tariff"; 
        // Note: The legacy code uses 1=Indica, 2=Xcent mapping in HTML, but DB stores 1, 2...
        // We'll just return the IDs for now, frontend can map names.
        
        $stmt = $db->prepare($query);
        $stmt->execute();
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($data);
        
    } elseif (!empty($v_id)) {
        // Get specific tariff
        $query = "SELECT * FROM out_tariff WHERE v_id = :v_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":v_id", $v_id);
        $stmt->execute();
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($data) {
            echo json_encode($data);
        } else {
             http_response_code(404);
             echo json_encode(array("message" => "Tariff not found."));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Missing v_id."));
    }

} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true); // Decode as array

    if (!empty($data['v_id'])) {
        $v_id = $data['v_id'];
        
        // Build Dynamic Update Query
        // We expect data keys like 'a1', 'a2', ... 'a104'
        $setClauses = [];
        $params = [];
        
        // Loop a1 to a104
        for ($i = 1; $i <= 104; $i++) {
            $key = "a$i";
            if (isset($data[$key])) {
                $setClauses[] = "$key = :$key";
                $params[":$key"] = $data[$key];
            }
        }
        
        if (count($setClauses) > 0) {
            $query = "UPDATE out_tariff SET " . implode(", ", $setClauses) . " WHERE v_id = :v_id";
            $stmt = $db->prepare($query);
            
            // Bind params
            $stmt->bindParam(":v_id", $v_id);
            foreach ($params as $param => $value) {
                 $stmt->bindValue($param, $value);
            }
            
            if ($stmt->execute()) {
                http_response_code(200);
                echo json_encode(array("message" => "Tariff updated successfully."));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to update tariff."));
            }
        } else {
            http_response_code(200);
            echo json_encode(array("message" => "No changes to save."));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Missing v_id."));
    }
}
?>


