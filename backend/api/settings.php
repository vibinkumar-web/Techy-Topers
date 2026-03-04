<?php
session_start();
include_once '../config/db.php';


$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

// Ensure app_config table exists (creates silently if missing)
$db->exec("CREATE TABLE IF NOT EXISTS app_config (
    config_key VARCHAR(100) PRIMARY KEY,
    config_value VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)");

if ($method === 'GET') {

    // If requesting base_fare config
    if (isset($_GET['config']) && $_GET['config'] === 'base_fare') {
        $stmt = $db->query("SELECT config_value FROM app_config WHERE config_key = 'base_fare'");
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode(["base_fare" => $row ? floatval($row['config_value']) : 190]);
        exit;
    }

    // Get SMS settings for current user (or global if designed that way)
    // Legacy code filtered by `update_by`, suggesting per-user settings?
    // "select * from smssetting where update_by='".$user_id."'";
    // We will support user_id if passed, or default to some logic.
    // For now, let's assume global or pass user_id via query param.
    
    $user_id = isset($_GET['user_id']) ? $_GET['user_id'] : '';
    
    $query = "SELECT * FROM smssetting";
    if ($user_id) {
        $query .= " WHERE update_by = :user_id";
    }
    $query .= " ORDER BY update_date DESC LIMIT 1"; // Get latest if multiple
    
    $stmt = $db->prepare($query);
    if ($user_id) {
        $stmt->bindParam(":user_id", $user_id);
    }
    $stmt->execute();
    $data = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($data) {
        echo json_encode($data);
    } else {
        // Return default if no record found
        echo json_encode(array("smsoption" => "0"));
    }

} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    // Handle base_fare save
    if (isset($data->action) && $data->action === 'save_base_fare') {
        $base_fare = floatval($data->base_fare ?? 190);
        $stmt = $db->prepare("INSERT INTO app_config (config_key, config_value) VALUES ('base_fare', :val)
                               ON DUPLICATE KEY UPDATE config_value = :val");
        $stmt->bindParam(':val', $base_fare);
        if ($stmt->execute()) {
            echo json_encode(["message" => "Base fare updated successfully.", "base_fare" => $base_fare]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Failed to update base fare."]);
        }
        exit;
    }

    if (isset($data->smsoption) && isset($data->user_id)) {
        
        // Legacy code effectively does Insert or Update based on existence?
        // Actually it tries UPDATE, if 0 rows effected (or error?), it INSERTS.
        // We will try UPDATE first.
        
        $query = "SELECT id FROM smssetting WHERE update_by = :user_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":user_id", $data->user_id);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $query = "UPDATE smssetting SET smsoption = :smsoption, update_date = NOW() WHERE update_by = :user_id";
        } else {
            $query = "INSERT INTO smssetting (smsoption, update_by, update_date) VALUES (:smsoption, :user_id, NOW())";
        }
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(":smsoption", $data->smsoption);
        $stmt->bindParam(":user_id", $data->user_id);
        
        if ($stmt->execute()) {
             http_response_code(200);
             echo json_encode(array("message" => "Settings updated."));
        } else {
             http_response_code(503);
             echo json_encode(array("message" => "Unable to update settings."));
        }
        
    } else {
         http_response_code(400);
         echo json_encode(array("message" => "Incomplete data."));
    }
}
?>
