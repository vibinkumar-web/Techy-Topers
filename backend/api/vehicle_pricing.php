<?php
include '../config/db.php';
$database = new Database();
$pdo = $database->getConnection();

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Fetch from enquery_tariff where the true pricing is held
        $stmt = $pdo->query("SELECT id, name as v_name, kmnonac, kmac FROM enquery_tariff ORDER BY id ASC");
        
        $results = [];
        
        while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $results[] = [
                'id' => $row['id'],
                'v_name' => trim($row['v_name']),
                'kmnonac' => $row['kmnonac'],
                'kmac' => $row['kmac']
            ];
        }
        
        echo json_encode($results);
        break;

    case 'POST':
        // Update per km rate
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (isset($data['kmnonac']) && isset($data['kmac'])) {
            if (isset($data['id']) && $data['id']) {
                // Update enquery_tariff
                $sqlLocal = "UPDATE enquery_tariff SET kmnonac = ?, kmac = ? WHERE id = ?";
                $stmtLocal = $pdo->prepare($sqlLocal);
                $success = $stmtLocal->execute([$data['kmnonac'], $data['kmac'], $data['id']]);
                
                if ($success) {
                    echo json_encode(["status" => "success", "message" => "Price updated successfully in Master DB"]);
                } else {
                    http_response_code(500);
                    echo json_encode(["status" => "error", "message" => "Failed to update price"]);
                }
            } else if (isset($data['v_name'])) {
                // Insert new vehicle
                $sqlInsert = "INSERT INTO enquery_tariff (name, kmnonac, kmac) VALUES (?, ?, ?)";
                $stmtInsert = $pdo->prepare($sqlInsert);
                $success = $stmtInsert->execute([$data['v_name'], $data['kmnonac'], $data['kmac']]);
                
                if ($success) {
                    echo json_encode(["status" => "success", "message" => "Vehicle created successfully"]);
                } else {
                    http_response_code(500);
                    echo json_encode(["status" => "error", "message" => "Failed to create vehicle"]);
                }
            } else {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Missing vehicle name for creation"]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Invalid input data"]);
        }
        break;
}
?>
