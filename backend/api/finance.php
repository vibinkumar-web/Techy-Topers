<?php
session_start();
include_once '../config/db.php';

$database = new Database();
$pdo = $database->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

// Ensure required tables exist
$pdo->exec("CREATE TABLE IF NOT EXISTS finance_ledger (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(20) NOT NULL,
    category VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    recorded_by VARCHAR(100),
    v_id VARCHAR(55),
    b_id VARCHAR(55),
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)");

$pdo->exec("CREATE TABLE IF NOT EXISTS driver_balances (
    v_id VARCHAR(55) PRIMARY KEY,
    balance DECIMAL(10,2) DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)");

switch ($method) {
    case 'GET':
        if (isset($_GET['action'])) {
            $action = $_GET['action'];

            // Build shared date filter
            $conditions = [];
            $params = [];
            if (!empty($_GET['from'])) {
                $conditions[] = "DATE_FORMAT(transaction_date, '%Y-%m') >= ?";
                $params[] = $_GET['from'];
            }
            if (!empty($_GET['to'])) {
                $conditions[] = "DATE_FORMAT(transaction_date, '%Y-%m') <= ?";
                $params[] = $_GET['to'];
            }
            $where = count($conditions) > 0 ? 'WHERE ' . implode(' AND ', $conditions) : '';

            if ($action === 'summary') {
                $sql = "SELECT
                    COALESCE(SUM(CASE WHEN type IN ('income','commission') THEN amount ELSE 0 END), 0) as total_income,
                    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense
                    FROM finance_ledger $where";
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
                $summary = $stmt->fetch(PDO::FETCH_ASSOC);
                $summary['net_balance'] = floatval($summary['total_income']) - floatval($summary['total_expense']);
                echo json_encode(["status" => "success", "data" => $summary]);
            }
            else if ($action === 'ledger') {
                $sql = "SELECT * FROM finance_ledger $where ORDER BY transaction_date DESC, id DESC";
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
                echo json_encode(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
            }
            else if ($action === 'driver_balances') {
                $stmt = $pdo->query("
                    SELECT db.v_id, db.balance, db.last_updated, v.d_name, v.d_mobile, v.v_no
                    FROM driver_balances db
                    LEFT JOIN f_v_attach v ON db.v_id = v.v_id OR db.v_id = v.v_no
                    ORDER BY db.last_updated DESC
                ");
                echo json_encode(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
            }

            // Vehicle Commission Summary: trip totals + 10% due + paid + pending
            else if ($action === 'vehicle_commission' && !empty($_GET['v_id'])) {
                $v_id = trim($_GET['v_id']);
                // Default to current month if not provided
                $month = !empty($_GET['month']) ? $_GET['month'] : date('Y-m');

                // Check if this vehicle ID exists in f_v_attach OR has any record in f_closing
                $checkStmt = $pdo->prepare("
                    SELECT COUNT(*) as cnt FROM f_v_attach
                    WHERE v_id = ? OR v_no = ?
                ");
                $checkStmt->execute([$v_id, $v_id]);
                $existing = intval($checkStmt->fetch(PDO::FETCH_ASSOC)['cnt']);

                if ($existing === 0) {
                    // Also check f_closing as fallback (vehicle may exist there even if not in attach)
                    $checkClosing = $pdo->prepare("SELECT COUNT(*) as cnt FROM f_closing WHERE v_id = ?");
                    $checkClosing->execute([$v_id]);
                    $existing = intval($checkClosing->fetch(PDO::FETCH_ASSOC)['cnt']);
                }

                if ($existing === 0) {
                    echo json_encode([
                        "status"        => "error",
                        "vehicle_found" => false,
                        "message"       => "No vehicle found with ID: $v_id"
                    ]);
                    break;
                }

                // Sum all closed trip net_total for this vehicle in the given month
                $tripStmt = $pdo->prepare("
                    SELECT
                        COUNT(*) as trip_count,
                        COALESCE(SUM(net_total), 0) as total_earnings
                    FROM f_closing
                    WHERE v_id = ?
                      AND DATE_FORMAT(p_date, '%Y-%m') = ?
                ");
                $tripStmt->execute([$v_id, $month]);
                $tripData = $tripStmt->fetch(PDO::FETCH_ASSOC);

                $totalEarnings = floatval($tripData['total_earnings']);
                $commissionDue = round($totalEarnings * 0.10, 2);

                // Sum commissions already paid for this vehicle in the given month (from finance_ledger)
                $paidStmt = $pdo->prepare("
                    SELECT COALESCE(SUM(amount), 0) as commission_paid
                    FROM finance_ledger
                    WHERE type = 'commission'
                      AND v_id = ?
                      AND DATE_FORMAT(transaction_date, '%Y-%m') = ?
                ");
                $paidStmt->execute([$v_id, $month]);
                $paidData = $paidStmt->fetch(PDO::FETCH_ASSOC);

                $commissionPaid = floatval($paidData['commission_paid']);
                $commissionPending = max(0, round($commissionDue - $commissionPaid, 2));

                // Also fetch individual trips for this vehicle/month
                $tripsListStmt = $pdo->prepare("
                    SELECT b_id, p_date, picup_place, drop_place, net_total, paid_amount
                    FROM f_closing
                    WHERE v_id = ?
                      AND DATE_FORMAT(p_date, '%Y-%m') = ?
                    ORDER BY p_date DESC
                ");
                $tripsListStmt->execute([$v_id, $month]);
                $trips = $tripsListStmt->fetchAll(PDO::FETCH_ASSOC);

                echo json_encode([
                    "status"             => "success",
                    "vehicle_found"      => true,
                    "v_id"               => $v_id,
                    "month"              => $month,
                    "trip_count"         => intval($tripData['trip_count']),
                    "total_earnings"     => $totalEarnings,
                    "commission_due"     => $commissionDue,
                    "commission_paid"    => $commissionPaid,
                    "commission_pending" => $commissionPending,
                    "trips"              => $trips
                ]);
            }
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);

        if (isset($data['action'])) {

            // 1. Add any transaction
            if ($data['action'] === 'add_transaction' && isset($data['type'], $data['amount'], $data['category'])) {
                $stmt = $pdo->prepare("INSERT INTO finance_ledger (type, category, amount, description, recorded_by, v_id, b_id) VALUES (?, ?, ?, ?, ?, ?, ?)");
                $success = $stmt->execute([
                    $data['type'],
                    $data['category'],
                    $data['amount'],
                    $data['description'] ?? '',
                    $data['recorded_by'] ?? 'Admin',
                    $data['v_id'] ?? null,
                    $data['b_id'] ?? null
                ]);
                if ($success) echo json_encode(["status" => "success", "message" => "Transaction recorded."]);
                else { http_response_code(500); echo json_encode(["status" => "error", "message" => "Failed to record transaction."]); }
            }

            // 2. Automated Trip Commission
            else if ($data['action'] === 'process_commission' && isset($data['v_id'], $data['amount'])) {
                try {
                    $pdo->beginTransaction();
                    $desc = !empty($data['description']) ? $data['description'] : "Auto-commission for trip " . ($data['b_id'] ?? 'unknown');
                    $ledStmt = $pdo->prepare("INSERT INTO finance_ledger (type, category, amount, b_id, v_id, description) VALUES ('commission', 'Trip Commission', ?, ?, ?, ?)");
                    $ledStmt->execute([$data['amount'], $data['b_id'] ?? null, $data['v_id'], $desc]);
                    $balStmt = $pdo->prepare("INSERT INTO driver_balances (v_id, balance) VALUES (?, ?) ON DUPLICATE KEY UPDATE balance = balance + ?");
                    $balStmt->execute([$data['v_id'], $data['amount'], $data['amount']]);
                    $pdo->commit();
                    echo json_encode(["status" => "success", "message" => "Commission successfully processed."]);
                } catch (Exception $e) {
                    $pdo->rollBack();
                    http_response_code(500);
                    echo json_encode(["status" => "error", "message" => "Failed: " . $e->getMessage()]);
                }
            }

            // 3. Driver Balance Settlement
            else if ($data['action'] === 'settle_balance' && isset($data['v_id'], $data['amount'])) {
                try {
                    $pdo->beginTransaction();
                    $ledStmt = $pdo->prepare("INSERT INTO finance_ledger (type, category, amount, v_id, description) VALUES ('income', 'Driver Settlement', ?, ?, 'Cash received from driver.')");
                    $ledStmt->execute([$data['amount'], $data['v_id']]);
                    $balStmt = $pdo->prepare("UPDATE driver_balances SET balance = balance - ? WHERE v_id = ?");
                    $balStmt->execute([$data['amount'], $data['v_id']]);
                    $pdo->commit();
                    echo json_encode(["status" => "success", "message" => "Driver balance settled."]);
                } catch (Exception $e) {
                    $pdo->rollBack();
                    http_response_code(500);
                    echo json_encode(["status" => "error", "message" => "Failed: " . $e->getMessage()]);
                }
            }

            // 4. Delete transaction
            else if ($data['action'] === 'delete_transaction' && isset($data['id'])) {
                $stmt = $pdo->prepare("DELETE FROM finance_ledger WHERE id = ?");
                $success = $stmt->execute([$data['id']]);
                if ($success) echo json_encode(["status" => "success", "message" => "Transaction deleted."]);
                else { http_response_code(500); echo json_encode(["status" => "error", "message" => "Failed to delete."]); }
            }

            // 5. Update transaction
            else if ($data['action'] === 'update_transaction' && isset($data['id'], $data['amount'])) {
                $stmt = $pdo->prepare("UPDATE finance_ledger SET amount = ?, description = ?, category = ? WHERE id = ?");
                $success = $stmt->execute([
                    $data['amount'],
                    $data['description'] ?? '',
                    $data['category'] ?? '',
                    $data['id']
                ]);
                if ($success) echo json_encode(["status" => "success", "message" => "Transaction updated."]);
                else { http_response_code(500); echo json_encode(["status" => "error", "message" => "Failed to update."]); }
            }

            else {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Invalid action or missing fields."]);
            }
        }
        break;
}
?>
