<?php
session_start();
include_once '../config/db.php';


$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $emp_id = isset($_GET['emp_id']) ? $_GET['emp_id'] : '';

    if ($emp_id) {
        $query = "SELECT * FROM ft_staff WHERE emp_id = :emp_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":emp_id", $emp_id);
        $stmt->execute();
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode($data);
    } else {
        $query = "SELECT * FROM ft_staff ORDER BY emp_id DESC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $data = array();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            array_push($data, $row);
        }
        echo json_encode($data);
    }
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    // Auto-generate emp_id logic from legacy
    $query_id = "SELECT emp_id FROM ft_staff ORDER BY emp_id DESC LIMIT 1";
    $stmt_id = $db->prepare($query_id);
    $stmt_id->execute();
    $last_id_row = $stmt_id->fetch(PDO::FETCH_ASSOC);
    $new_emp_id = isset($last_id_row['emp_id']) ? $last_id_row['emp_id'] + 1 : 1;

    $query = "INSERT INTO ft_staff (
        emp_id, name, u_type, mobile, pwd, address, dob, email, j_date, 
        salary, per_month, hrsp_day, hrs_day, hrs_night, emp_status, r_date
    ) VALUES (
        :emp_id, :name, :u_type, :mobile, :pwd, :address, :dob, :email, :j_date, 
        :salary, :per_month, :hrsp_day, :hrs_day, :hrs_night, :emp_status, :r_date
    )";

    $stmt = $db->prepare($query);

    // Bind parameters
    $stmt->bindParam(":emp_id", $new_emp_id);
    $stmt->bindParam(":name", $data->name);
    $stmt->bindParam(":u_type", $data->u_type);
    $stmt->bindParam(":mobile", $data->mobile);
    $stmt->bindParam(":pwd", $data->pwd);
    $stmt->bindParam(":address", $data->address);
    $stmt->bindParam(":dob", $data->dob);
    $stmt->bindParam(":email", $data->email);
    $stmt->bindParam(":j_date", $data->j_date);
    $stmt->bindParam(":salary", $data->salary);
    $stmt->bindParam(":per_month", $data->per_month);
    $stmt->bindParam(":hrsp_day", $data->hrsp_day);
    $stmt->bindParam(":hrs_day", $data->hrs_day);
    $stmt->bindParam(":hrs_night", $data->hrs_night);
    $stmt->bindParam(":emp_status", $data->emp_status); // 0 for Working, 1 for Resigned usually
    $stmt->bindParam(":r_date", $data->r_date);

    if ($stmt->execute()) {
        http_response_code(201);
        echo json_encode(array("message" => "Staff created successfully.", "emp_id" => $new_emp_id));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to create staff."));
    }

} elseif ($method === 'PUT') {
    $data = json_decode(file_get_contents("php://input"));

    $query = "UPDATE ft_staff SET 
        name=:name, u_type=:u_type, mobile=:mobile, pwd=:pwd, address=:address, 
        dob=:dob, email=:email, j_date=:j_date, salary=:salary, per_month=:per_month, 
        hrsp_day=:hrsp_day, hrs_day=:hrs_day, hrs_night=:hrs_night, emp_status=:emp_status, r_date=:r_date
        WHERE emp_id=:emp_id";

    $stmt = $db->prepare($query);

    $stmt->bindParam(":emp_id", $data->emp_id);
    $stmt->bindParam(":name", $data->name);
    $stmt->bindParam(":u_type", $data->u_type);
    $stmt->bindParam(":mobile", $data->mobile);
    $stmt->bindParam(":pwd", $data->pwd);
    $stmt->bindParam(":address", $data->address);
    $stmt->bindParam(":dob", $data->dob);
    $stmt->bindParam(":email", $data->email);
    $stmt->bindParam(":j_date", $data->j_date);
    $stmt->bindParam(":salary", $data->salary);
    $stmt->bindParam(":per_month", $data->per_month);
    $stmt->bindParam(":hrsp_day", $data->hrsp_day);
    $stmt->bindParam(":hrs_day", $data->hrs_day);
    $stmt->bindParam(":hrs_night", $data->hrs_night);
    $stmt->bindParam(":emp_status", $data->emp_status);
    $stmt->bindParam(":r_date", $data->r_date);

    if ($stmt->execute()) {
        http_response_code(200);
        echo json_encode(array("message" => "Staff updated successfully."));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to update staff."));
    }
}
?>
