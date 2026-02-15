<?php
include 'db.php';

header("Content-Type: application/json");

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['v_id'])) {
            // Fetch trip details for a specific vehicle (similar to legacy local_trip.php logic)
            $v_id = $_GET['v_id'];
            $sql = "SELECT * FROM f_ontrip WHERE v_id = ? AND already_assign = '1'";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$v_id]);
            $trip = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($trip) {
                // Fetch local tariff details if vehicle type matches
                // Legacy code fetched from 'local_tariff' where v_name = trip's v_type logic
                // For simplicity, we return the trip and let frontend/user handle specifics or fetch tariff if needed
                echo json_encode($trip);
            } else {
                 echo json_encode(null);
            }
        } elseif (isset($_GET['action']) && $_GET['action'] == 'tariffs') {
             $sql = "SELECT * FROM local_tariff";
             $stmt = $pdo->prepare($sql);
             $stmt->execute();
             echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }
        else {
             // List all OnTrip vehicles for selection
            $sql = "SELECT v_id FROM f_ontrip WHERE already_assign = '1'";
            $stmt = $pdo->prepare($sql);
            $stmt->execute();
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }
        break;

    case 'POST':
        // Handle Closing Logic
        $data = json_decode(file_get_contents("php://input"), true);
        
        $b_id = $data['b_id'];
        $v_id = $data['v_id'];
        // ... Extract other fields ...
        
        try {
            $pdo->beginTransaction();

            $sql = "INSERT INTO f_closing (b_id, v_id, opening_km, closing_km, remarks, pickup_time, p_date, drop_time, d_date, ac_type, t_type, v_type, picup_place, drop_place, rwards_point, packagename, other_charge, net_total, paid_amount, discount, dis_reason, to_whom, customer, m_no, d_mobile, pending, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $data['b_id'], $data['v_id'], $data['opening_km'], $data['closing_km'], $data['remarks'],
                $data['pickup_time'], date('Y-m-d'), date('H:i'), date('Y-m-d'), $data['ac_type'],
                $data['t_type'], $data['v_type'], $data['p_city'], $data['d_place'], $data['rwads_point'],
                $data['package_name'], $data['other_charge'], $data['net_total'], $data['paid_amount'],
                $data['discount'], $data['dis_reason'], $data['to_whom'], $data['customer'], $data['m_no'],
                $data['d_mobile'], ($data['net_total'] > $data['paid_amount'] ? 1 : 0), $data['user_id']
            ]);

            // Update Login Status
            $sqlLogin = "UPDATE f_login_status SET ontrip_status='0', status_assign='0', trip_amount=? WHERE id_emp=? AND login_status='1'";
            $stmtLogin = $pdo->prepare($sqlLogin);
            $stmtLogin->execute([$data['paid_amount'], $data['v_id']]);

            // Update OnTrip
            $sqlOnTrip = "UPDATE f_ontrip SET already_assign='0' WHERE b_id=?";
            $stmtOnTrip = $pdo->prepare($sqlOnTrip);
            $stmtOnTrip->execute([$b_id]);

             // Update Refused (Legacy logic included this)
            $sqlRefused = "UPDATE f_refused SET miss_amount=? WHERE b_id=?";
             $stmtRefused = $pdo->prepare($sqlRefused);
            $stmtRefused->execute([$data['paid_amount'], $b_id]);

            $pdo->commit();
            echo json_encode(['message' => 'Local Trip Closed Successfully']);

        } catch (Exception $e) {
            $pdo->rollBack();
             http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;
}
?>
