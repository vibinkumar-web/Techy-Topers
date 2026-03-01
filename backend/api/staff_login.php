<?php
session_start();
include_once '../config/db.php';

$data = json_decode(file_get_contents("php://input"));

try {
    if (!$conn) {
        throw new Exception("Database connection failed.");
    }

    if (isset($data->username) && isset($data->password)) {
        $username = trim($data->username);
        $password = trim($data->password);
        $pwd_hash = md5($password);

        $query = "SELECT * FROM tms_staff 
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
            $_SESSION['staff_id']   = $row['id'];
            $_SESSION['staff_name'] = $row['name'];
            $_SESSION['role']       = 'staff';

            // Log the login event for admin notifications
            try {
                $conn->exec("CREATE TABLE IF NOT EXISTS tms_staff_login_logs (
                    id         INT AUTO_INCREMENT PRIMARY KEY,
                    staff_id   INT NOT NULL,
                    staff_name VARCHAR(100) NOT NULL,
                    ip_address VARCHAR(45),
                    page_url   VARCHAR(255),
                    user_agent TEXT,
                    login_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_login_at (login_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

                $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
                $url = $data->current_url ?? ($_SERVER['HTTP_REFERER'] ?? 'unknown');
                $ua = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';

                $logStmt = $conn->prepare(
                    "INSERT INTO tms_staff_login_logs (staff_id, staff_name, ip_address, page_url, user_agent, login_at)
                     VALUES (:sid, :sname, :ip, :url, :ua, NOW())"
                );
                $logStmt->bindParam(':sid',   $row['id']);
                $logStmt->bindParam(':sname', $row['name']);
                $logStmt->bindParam(':ip',    $ip);
                $logStmt->bindParam(':url',   $url);
                $logStmt->bindParam(':ua',    $ua);
                $logStmt->execute();
            } catch (Exception $logEx) {
                // Non-fatal: login still succeeds even if logging fails
            }

            echo json_encode([
                "message" => "Staff login successful.",
                "user" => [
                    "id"         => $row['id'],
                    "name"       => $row['name'],
                    "email"      => $row['email'],
                    "mobile"     => $row['mobile'],
                    "department" => $row['department'],
                    "role"       => "staff"
                ]
            ]);
        } else {
            http_response_code(401);
            echo json_encode(["message" => "Invalid staff credentials."]);
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
