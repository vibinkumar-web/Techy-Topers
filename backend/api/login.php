<?php
session_start();
include_once '../config/db.php';


// $conn is created in db.php

$data = json_decode(file_get_contents("php://input"));

// $data is decoded above

try {
    if (!$conn) {
        throw new Exception("Database connection failed.");
    }

    if(isset($data->username) && isset($data->password)){
        $username = $data->username;
        $password = $data->password; 
        $password_md5 = md5($password);

        // 1. Check ft_staff (Legacy Login - usually mobile number)
        // Schema confirmed 'mobile' column exists.
        $query = "SELECT * FROM ft_staff WHERE mobile = :username AND pwd = :password";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':username', $username);
        $stmt->bindParam(':password', $password); // Legacy check (often plain text)
        
        $stmt->execute();

        if($stmt->rowCount() > 0){
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $_SESSION['user_id'] = $row['emp_id'];
            $_SESSION['name'] = $row['name'];
            
            echo json_encode(array(
                "message" => "Login successful.",
                "user" => array(
                    "id" => $row['emp_id'],
                    "name" => $row['name'],
                    "type" => "staff"
                )
            ));
        } else {
            // 2. Check ft_register (New/App Registration - Name, Email, or Mobile)
            $query = "SELECT * FROM ft_register WHERE (name = :username OR email = :username OR mobile = :username) AND pwd = :password";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':username', $username);
            $stmt->bindParam(':password', $password_md5); // New users use MD5
            
            $stmt->execute();
            
            if($stmt->rowCount() > 0){
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                $_SESSION['user_id'] = $row['id'];
                $_SESSION['name'] = $row['name'];

                echo json_encode(array(
                    "message" => "Login successful.",
                    "user" => array(
                        "id" => $row['id'],
                        "name" => $row['name'],
                        "email" => $row['email'],
                        "type" => "user"
                    )
                ));
            } else {
                http_response_code(401);
                echo json_encode(array("message" => "Login failed. Invalid credentials."));
            }
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Incomplete data."));
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array("message" => "Login error: " . $e->getMessage()));
}
?>
