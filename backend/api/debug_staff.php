<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include_once '../config/db.php';

try {
    // $conn is already created in db.php but let's be explicit
    $database = new Database();
    $db = $database->getConnection();

    $query = "DESCRIBE ft_staff";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);

    // converting to string to avoid truncation issues in simple json_encode sometimes if array is large? 
    // actually, let's just print_r or var_dump to be safe
    echo json_encode($columns);
    // echo print_r($columns, true);

} catch (Exception $e) {
    echo json_encode(array("error" => $e->getMessage()));
}
?>
