<?php
session_start();
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/db.php';

$database = new Database();
$db = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Fetch all staff users
    $query = "SELECT * FROM ft_staff"; // Or login table? Legacy uses `ft_staff` joined with login? 
    // Let's assume we manage permissions on `ft_staff` or a dedicated table.
    // Legacy `user_rights.php` implies managing rights for... users.
    // Let's stick to `ft_staff` as the user base.
    
    $query = "SELECT * FROM ft_staff";
    $stmt = $db->prepare($query);
    $stmt->execute();
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    
    // Update Permissions
    // Expecting: emp_id, permissions object { booking: 1, assigning: 0 ... }
    
    if (isset($data->emp_id) && isset($data->permissions)) {
        
        // We'll update specific columns. 
        // Note: You might need to ADD these columns to `ft_staff` if they don't exist, 
        // or create a `user_permissions` table.
        // For now, I'll assume they exist or we use a JSON column or separate table.
        // Validating legacy: `user_rights.php` doesn't seem to save?
        // It just shows labels.
        // I will Implement a robust `permissions` column in `ft_staff` (as JSON) or individual columns if preferred.
        // Let's go with updating `ft_staff` columns directly assuming they exist or we create them.
        // Actually, to be safe and "Zero Error", I will create a separate `user_permissions` table if it doesn't exist.
        // But to keep it simple and consistent with PHP patterns, I'll update `ft_staff` and handle errors if columns miss.
        
        $perms = $data->permissions;
        
        // Dynamic update based on keys provided
        // This is risky if columns don't exist.
        // I'll stick to a fixed set of likely permissions.
        
        $query = "UPDATE ft_staff SET 
                  p_booking = :p_booking,
                  p_assign = :p_assign,
                  p_ontrip = :p_ontrip,
                  p_closing = :p_closing,
                  p_accounts = :p_accounts
                  WHERE emp_id = :emp_id"; // prefixed with p_ to avoid reserved words conflicts if any
        
        // I'll assume these columns need to assume existence or I fail gracefully.
        // "Zero Error" request implies I should probably check/create columns.
        // But I can't easily alter schema blindly.
        // I will just save to a new table `user_permissions` to be safe and clean.
        
        // Check if row exists in permissions table
        $check = "SELECT id FROM user_permissions WHERE emp_id = :emp_id";
        $stmtCheck = $db->prepare($check);
        $stmtCheck->bindParam(":emp_id", $data->emp_id);
        $stmtCheck->execute();
        
        if ($stmtCheck->rowCount() > 0) {
            $query = "UPDATE user_permissions SET 
                      can_book = :can_book,
                      can_assign = :can_assign,
                      can_close = :can_close,
                      can_report = :can_report
                      WHERE emp_id = :emp_id";
        } else {
             $query = "INSERT INTO user_permissions (emp_id, can_book, can_assign, can_close, can_report) 
                       VALUES (:emp_id, :can_book, :can_assign, :can_close, :can_report)";
        }
        
        $stmt = $db->prepare($query);
        $one = 1; $zero = 0;
        
        $can_book = !empty($perms->booking) ? 1 : 0;
        $can_assign = !empty($perms->assigning) ? 1 : 0;
        $can_close = !empty($perms->closing) ? 1 : 0;
        $can_report = !empty($perms->reports) ? 1 : 0;

        $stmt->bindParam(":can_book", $can_book);
        $stmt->bindParam(":can_assign", $can_assign);
        $stmt->bindParam(":can_close", $can_close);
        $stmt->bindParam(":can_report", $can_report);
        $stmt->bindParam(":emp_id", $data->emp_id);
        
        try {
             $stmt->execute();
             echo json_encode(array("message" => "Permissions updated."));
        } catch (Exception $e) {
            // If table doesn't exist, create it?
             $createTable = "CREATE TABLE IF NOT EXISTS user_permissions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                emp_id VARCHAR(50) NOT NULL,
                can_book TINYINT DEFAULT 0,
                can_assign TINYINT DEFAULT 0,
                can_close TINYINT DEFAULT 0,
                can_report TINYINT DEFAULT 0
            )";
            $db->prepare($createTable)->execute();
            $stmt->execute(); // Retry
            echo json_encode(array("message" => "Permissions updated (Table created)."));
        }

    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Incomplete data."));
    }
}
?>

