<?php
session_start();
include_once '../config/db.php';


// $conn is created in db.php

$data = json_decode(file_get_contents("php://input"));

if(isset($data->name) && isset($data->email) && isset($data->password) && isset($data->mobile)){
    
    $name = $data->name;
    $email = $data->email;
    $mobile = $data->mobile;
    $password = md5($data->password);
    $r_date = date("Y-m-d H:i:s");

    $query = "INSERT INTO ft_register SET name=:name, email=:email, mobile=:mobile, pwd=:password, r_date=:r_date";
    
    $stmt = $conn->prepare($query);
    
    $stmt->bindParam(":name", $name);
    $stmt->bindParam(":email", $email);
    $stmt->bindParam(":mobile", $mobile);
    $stmt->bindParam(":password", $password);
    $stmt->bindParam(":r_date", $r_date);
    
    if($stmt->execute()){
        http_response_code(201);
        echo json_encode(array("message" => "User was registered."));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to register user."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Unable to register user. Data is incomplete."));
}
?>
