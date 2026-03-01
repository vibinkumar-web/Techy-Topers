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

$data = json_decode(file_get_contents("php://input"));

try {
    // $conn comes from db.php include
    if (!$conn) {
        throw new Exception("Database connection failed.");
    }

    if (isset($data->username) && isset($data->password)) {
        $username  = trim($data->username);
        $password  = trim($data->password);
        $pwd_hash  = md5($password);

        $query = "SELECT * FROM tms_admins 
                  WHERE (username = :u OR email = :u OR mobile = :u) 
                    AND (pwd = :p OR pwd = :ph)
                  LIMIT 1";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':u',  $username);
        $stmt->bindParam(':p',  $password);
        $stmt->bindParam(':ph', $pwd_hash);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $_SESSION['admin_id']   = $row['id'];
            $_SESSION['admin_name'] = $row['name'];
            $_SESSION['role']       = 'admin';

            echo json_encode([
                "message" => "Admin login successful.",
                "user" => [
                    "id"    => $row['id'],
                    "name"  => $row['name'],
                    "email" => $row['email'],
                    "mobile"=> $row['mobile'],
                    "role"  => "admin"
                ]
            ]);
        } else {
            http_response_code(401);
            echo json_encode(["message" => "Invalid admin credentials."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Username and password are required."]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Server error: " . $e->getMessage()]);
}
?>

