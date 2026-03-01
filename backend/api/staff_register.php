<?php
session_start();
include_once '../config/db.php';

$data = json_decode(file_get_contents("php://input"));

try {
    if (!$conn) {
        throw new Exception("Database connection failed.");
    }

    if (isset($data->name) && isset($data->email) && isset($data->mobile) && isset($data->password)) {
        $name       = trim($data->name);
        $email      = trim($data->email);
        $mobile     = trim($data->mobile);
        $department = trim($data->department ?? '');
        $username   = trim($data->username ?? $mobile);
        $pwd_hash   = md5(trim($data->password));

        // Check duplicate
        $check = $conn->prepare("SELECT id FROM tms_staff WHERE email = :e OR mobile = :m OR username = :u");
        $check->execute([':e' => $email, ':m' => $mobile, ':u' => $username]);
        if ($check->rowCount() > 0) {
            http_response_code(409);
            echo json_encode(["message" => "Staff with this email, mobile, or username already exists."]);
            exit;
        }

        $stmt = $conn->prepare(
            "INSERT INTO tms_staff (name, email, mobile, username, department, pwd, created_at) 
             VALUES (:name, :email, :mobile, :username, :dept, :pwd, NOW())"
        );
        $stmt->execute([
            ':name'     => $name,
            ':email'    => $email,
            ':mobile'   => $mobile,
            ':username' => $username,
            ':dept'     => $department,
            ':pwd'      => $pwd_hash,
        ]);

        echo json_encode(["message" => "Staff registered successfully."]);
    } else {
        http_response_code(400);
        echo json_encode(["message" => "All fields are required."]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Server error: " . $e->getMessage()]);
}
?>
