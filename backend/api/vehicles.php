<?php
session_start();
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/db.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        $v_id = isset($_GET['v_id']) ? $_GET['v_id'] : '';

        if ($v_id) {
            $query = "SELECT * FROM f_v_attach WHERE v_id = :v_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":v_id", $v_id);
            $stmt->execute();
            $data = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode($data ? $data : new stdClass());
        } else {
            $query = "SELECT * FROM f_v_attach ORDER BY joining DESC";
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
        
        if (!$data) {
             throw new Exception("Invalid JSON input");
        }

        // Check if v_id already exists
        $check_query = "SELECT v_id FROM f_v_attach WHERE v_id = :v_id";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->bindParam(":v_id", $data->v_id);
        $check_stmt->execute();

        if ($check_stmt->rowCount() > 0) {
            http_response_code(400);
            echo json_encode(array("message" => "Vehicle ID already exists."));
            exit;
        }

        $query = "INSERT INTO f_v_attach (
            v_cat, v_brand, v_model, v_no, joining, ie_date, fc_date, pe_date, puc_date, rt_date, 
            v_id, v_own, seat_a, att_type, d_mobile, o_mobile, adv_amt, y_model, d_name, o_name, vacant_place
        ) VALUES (
            :v_cat, :v_brand, :v_model, :v_no, :joining, :ie_date, :fc_date, :pe_date, :puc_date, :rt_date, 
            :v_id, :v_own, :seat_a, :att_type, :d_mobile, :o_mobile, :adv_amt, :y_model, :d_name, :o_name, :vacant_place
        )";

        $stmt = $db->prepare($query);

        // Bind parameters
        $stmt->bindParam(":v_cat", $data->v_cat);
        $stmt->bindParam(":v_brand", $data->v_brand);
        $stmt->bindParam(":v_model", $data->v_model);
        $stmt->bindParam(":v_no", $data->v_no);
        $stmt->bindParam(":joining", $data->joining);
        $stmt->bindParam(":ie_date", $data->ie_date);
        $stmt->bindParam(":fc_date", $data->fc_date);
        $stmt->bindParam(":pe_date", $data->pe_date);
        $stmt->bindParam(":puc_date", $data->puc_date);
        $stmt->bindParam(":rt_date", $data->rt_date);
        $stmt->bindParam(":v_id", $data->v_id);
        $stmt->bindParam(":v_own", $data->v_own);
        $stmt->bindParam(":seat_a", $data->seat_a);
        $stmt->bindParam(":att_type", $data->att_type);
        $stmt->bindParam(":d_mobile", $data->d_mobile);
        $stmt->bindParam(":o_mobile", $data->o_mobile);
        $stmt->bindParam(":adv_amt", $data->adv_amt);
        $stmt->bindParam(":y_model", $data->y_model);
        $stmt->bindParam(":d_name", $data->d_name);
        $stmt->bindParam(":o_name", $data->o_name);
        $stmt->bindParam(":vacant_place", $data->vacant_place);

        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(array("message" => "Vehicle attached successfully."));
        } else {
            throw new Exception("Unable to attach vehicle.");
        }

    } elseif ($method === 'PUT') {
        $data = json_decode(file_get_contents("php://input"));
         if (!$data) {
             throw new Exception("Invalid JSON input");
        }

        $query = "UPDATE f_v_attach SET 
            v_cat=:v_cat, v_brand=:v_brand, v_model=:v_model, v_no=:v_no, joining=:joining, 
            ie_date=:ie_date, fc_date=:fc_date, pe_date=:pe_date, puc_date=:puc_date, rt_date=:rt_date, 
            v_own=:v_own, seat_a=:seat_a, att_type=:att_type, d_mobile=:d_mobile, o_mobile=:o_mobile, 
            adv_amt=:adv_amt, y_model=:y_model, d_name=:d_name, o_name=:o_name, vacant_place=:vacant_place
            WHERE v_id=:v_id";

        $stmt = $db->prepare($query);
        
        $stmt->bindParam(":v_cat", $data->v_cat);
        $stmt->bindParam(":v_brand", $data->v_brand);
        $stmt->bindParam(":v_model", $data->v_model);
        $stmt->bindParam(":v_no", $data->v_no);
        $stmt->bindParam(":joining", $data->joining);
        $stmt->bindParam(":ie_date", $data->ie_date);
        $stmt->bindParam(":fc_date", $data->fc_date);
        $stmt->bindParam(":pe_date", $data->pe_date);
        $stmt->bindParam(":puc_date", $data->puc_date);
        $stmt->bindParam(":rt_date", $data->rt_date);
        $stmt->bindParam(":v_id", $data->v_id);
        $stmt->bindParam(":v_own", $data->v_own);
        $stmt->bindParam(":seat_a", $data->seat_a);
        $stmt->bindParam(":att_type", $data->att_type);
        $stmt->bindParam(":d_mobile", $data->d_mobile);
        $stmt->bindParam(":o_mobile", $data->o_mobile);
        $stmt->bindParam(":adv_amt", $data->adv_amt);
        $stmt->bindParam(":y_model", $data->y_model);
        $stmt->bindParam(":d_name", $data->d_name);
        $stmt->bindParam(":o_name", $data->o_name);
        $stmt->bindParam(":vacant_place", $data->vacant_place);

        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(array("message" => "Vehicle updated successfully."));
        } else {
            throw new Exception("Unable to update vehicle.");
        }
    } elseif ($method === 'DELETE') {
        $v_id = isset($_GET['v_id']) ? $_GET['v_id'] : '';
        if (!$v_id) {
            http_response_code(400);
            echo json_encode(array("message" => "Missing vehicle ID."));
            exit;
        }

        $query = "DELETE FROM f_v_attach WHERE v_id = :v_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":v_id", $v_id);
        
        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(array("message" => "Vehicle deleted successfully."));
        } else {
            throw new Exception("Unable to delete vehicle.");
        }
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(array("message" => "Database error: " . $e->getMessage()));
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array("message" => "General error: " . $e->getMessage()));
}
?>

