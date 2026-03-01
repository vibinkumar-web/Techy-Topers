<?php
session_start();
include_once '../config/db.php';


$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (isset($_GET['mobile'])) {
        $mobile = $_GET['mobile'];
        $query = "SELECT * FROM ft_cus_master WHERE m_no = :mobile";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":mobile", $mobile);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $row['found'] = true;
            echo json_encode($row);
        } else {
            http_response_code(200);
            echo json_encode(array("found" => false, "message" => "Customer not found."));
        }
    } else {
         $query = "SELECT * FROM ft_cus_master LIMIT 50"; // Limit to prevent overload
         $stmt = $db->prepare($query);
         $stmt->execute();
         $customers = array();
         while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
             array_push($customers, $row);
         }
         echo json_encode($customers);
    }
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    if (
        !empty($data->m_no) &&
        !empty($data->b_name)
    ) {
        // Check if customer exists
        $checkQuery = "SELECT * FROM ft_cus_master WHERE m_no = :mobile";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(":mobile", $data->m_no);
        $checkStmt->execute();

        if ($checkStmt->rowCount() > 0) {
            // Update existing
            $query = "UPDATE ft_cus_master SET b_name = :name WHERE m_no = :mobile";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":name", $data->b_name);
            $stmt->bindParam(":mobile", $data->m_no);
            
            if($stmt->execute()){
                http_response_code(200);
                echo json_encode(array("message" => "Customer updated.", "m_no" => $data->m_no, "b_name" => $data->b_name));
            } else {
                 http_response_code(503);
                 echo json_encode(array("message" => "Unable to update customer."));
            }

        } else {
             // Create new
            $query = "INSERT INTO ft_cus_master SET b_name = :name, m_no = :mobile";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":name", $data->b_name);
            $stmt->bindParam(":mobile", $data->m_no);
            
            if($stmt->execute()){
                http_response_code(201);
                echo json_encode(array("message" => "Customer created.", "m_no" => $data->m_no, "b_name" => $data->b_name));
            } else {
                 http_response_code(503);
                 echo json_encode(array("message" => "Unable to create customer."));
            }
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Unable to create/update customer. Data is incomplete."));
    }
}
?>
