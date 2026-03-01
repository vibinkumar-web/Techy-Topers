<?php
session_start();
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/db.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    $from_date = isset($_GET['from_date']) ? $_GET['from_date'] : '';
    $to_date = isset($_GET['to_date']) ? $_GET['to_date'] : '';

    if ($from_date && $to_date) {
        
        // Join with ft_staff to get entry by name
        // Ensuring table name is enqury_table (as per schema check)
        $query = "SELECT e.*, s.name as entry_by
                  FROM enqury_table e
                  LEFT JOIN ft_staff s ON e.user_id = s.emp_id
                  WHERE e.b_date BETWEEN :from_date AND :to_date
                  ORDER BY e.b_date DESC";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(":from_date", $from_date);
        $stmt->bindParam(":to_date", $to_date);
        
        $stmt->execute();
        
        $data = array();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            array_push($data, $row);
        }
        echo json_encode($data);

    } else {
         echo json_encode(array());
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(array("message" => "Database error: " . $e->getMessage()));
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array("message" => "General error: " . $e->getMessage()));
}
?>

