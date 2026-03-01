<?php
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
        $query = "SELECT cb.b_date, cb.b_id, cb.reason, 
                         b.b_name as customer_name, b.m_no as mobile, 
                         s.name as staff_name
                  FROM f_calcel_booking cb
                  JOIN f_ft_booking b ON cb.b_id = b.b_id
                  LEFT JOIN ft_staff s ON b.user_id = s.emp_id
                  WHERE cb.b_date BETWEEN :from_date AND :to_date
                  ORDER BY cb.b_date DESC";

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

