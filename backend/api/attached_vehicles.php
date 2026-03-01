<?php
session_start();
include '../config/db.php';
$database = new Database();
$pdo = $database->getConnection();

header("Content-Type: application/json");

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $sql = "SELECT * FROM f_v_attach";
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        
        $sql = "INSERT INTO f_v_attach (v_cat, v_brand, v_model, v_no, joining, ie_date, fc_date, pe_date, puc_date, rt_date, v_id, v_own, seat_a, att_type, d_mobile, o_mobile, adv_amt, y_model, d_name, o_name, vacant_place) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $pdo->prepare($sql);
        try {
            $stmt->execute([
                $data['v_cat'], $data['v_brand'], $data['v_model'], $data['v_no'], $data['joining'], 
                $data['ie_date'], $data['fc_date'], $data['pe_date'], $data['puc_date'], $data['rt_date'], 
                $data['v_id'], $data['v_own'], $data['seat_a'], $data['att_type'], $data['d_mobile'], 
                $data['o_mobile'], $data['adv_amt'], $data['y_model'], $data['d_name'], $data['o_name'], 
                $data['vacant_place']
            ]);
            echo json_encode(['message' => 'Vehicle Attached Successfully']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        
        $sql = "UPDATE f_v_attach SET v_cat=?, v_brand=?, v_model=?, v_no=?, joining=?, ie_date=?, fc_date=?, pe_date=?, puc_date=?, rt_date=?, v_own=?, seat_a=?, att_type=?, d_mobile=?, o_mobile=?, adv_amt=?, y_model=?, d_name=?, o_name=?, vacant_place=? WHERE v_id=?";
        
         $stmt = $pdo->prepare($sql);
        try {
            $stmt->execute([
                 $data['v_cat'], $data['v_brand'], $data['v_model'], $data['v_no'], $data['joining'], 
                $data['ie_date'], $data['fc_date'], $data['pe_date'], $data['puc_date'], $data['rt_date'], 
                 $data['v_own'], $data['seat_a'], $data['att_type'], $data['d_mobile'], 
                $data['o_mobile'], $data['adv_amt'], $data['y_model'], $data['d_name'], $data['o_name'], 
                $data['vacant_place'], $data['v_id']
            ]);
            echo json_encode(['message' => 'Vehicle Updated Successfully']);
        } catch (PDOException $e) {
             http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    case 'DELETE':
        if (isset($_GET['v_id'])) {
            $sql = "DELETE FROM f_v_attach WHERE v_id = ?";
            $stmt = $pdo->prepare($sql);
            if ($stmt->execute([$_GET['v_id']])) {
                echo json_encode(['message' => 'Vehicle Deleted']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Delete failed']);
            }
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}
?>
