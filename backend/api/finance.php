<?php
session_start();
include_once '../config/db.php';

$database = new Database();
$pdo = $database->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['action'])) {
            $action = $_GET['action'];
            
            if ($action === 'summary') {
                // Get totals for dashboard cards
                $summaryStmt = $pdo->query("SELECT 
                    SUM(CASE WHEN type='income' THEN amount ELSE 0 END) as total_income,
                    SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as total_expense,
                    SUM(CASE WHEN type='commission' THEN amount ELSE 0 END) as total_commission
                    FROM finance_ledger");
                
                $summary = $summaryStmt->fetch(PDO::FETCH_ASSOC);
                $summary['net_profit'] = ($summary['total_income'] + $summary['total_commission']) - $summary['total_expense'];
                echo json_encode(["status" => "success", "data" => $summary]);
            } 
            else if ($action === 'ledger') {
                // Get all ledger transactions
                $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
                $stmt = $pdo->query("SELECT * FROM finance_ledger ORDER BY id DESC LIMIT $limit");
                echo json_encode(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
            }
            else if ($action === 'driver_balances') {
                // Get running driver balances with driver details
                $stmt = $pdo->query("
                    SELECT db.v_id, db.balance, db.last_updated, v.d_name, v.d_mobile, v.v_no 
                    FROM driver_balances db 
                    LEFT JOIN f_v_attach v ON db.v_id = v.v_id OR db.v_id = v.v_no
                    ORDER BY db.last_updated DESC
                ");
                echo json_encode(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
            }
            else if ($action === 'categories') {
                $stmt = $pdo->query("SELECT * FROM finance_categories ORDER BY type, name");
                echo json_encode(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
            }
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (isset($data['action'])) {
            
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
                else echo json_encode(["status" => "error", "message" => "Failed to record transaction."]);
            }
            
            // 2. Automated Trip Commission Deduction
            // Takes money out of driver balance, puts it into Ledger as Office Commission Income
            else if ($data['action'] === 'process_commission' && isset($data['v_id'], $data['amount'])) {
                try {
                    $pdo->beginTransaction();
                    
                    // a) Insert into Ledger
                    $desc = !empty($data['description']) ? $data['description'] : "Auto-commission for trip " . ($data['b_id'] ?? 'unknown');
                    $ledStmt = $pdo->prepare("INSERT INTO finance_ledger (type, category, amount, b_id, v_id, description) VALUES ('commission', 'Trip Commission', ?, ?, ?, ?)");
                    $ledStmt->execute([$data['amount'], $data['b_id'] ?? null, $data['v_id'], $desc]);
                    
                    // b) Update Driver Balance (If balancing system works where positive means driver owes office)
                    // If the office earned commission, the driver's balance drops (or increases if treating as debt). 
                    // Let's treat balance as "Amount driver owes Office". So commission INCREASES what driver owes.
                    $balStmt = $pdo->prepare("INSERT INTO driver_balances (v_id, balance) VALUES (?, ?) ON DUPLICATE KEY UPDATE balance = balance + ?");
                    $balStmt->execute([$data['v_id'], $data['amount'], $data['amount']]);
                    
                    $pdo->commit();
                    echo json_encode(["status" => "success", "message" => "Commission successfully processed."]);
                } catch (Exception $e) {
                    $pdo->rollBack();
                    http_response_code(500);
                    echo json_encode(["status" => "error", "message" => "Failed to process commission: " . $e->getMessage()]);
                }
            }
            
            // 3. Driver Payment Settlement
            // When a driver physically hands cash to the office to settle their owes.
            else if ($data['action'] === 'settle_balance' && isset($data['v_id'], $data['amount'])) {
                 try {
                    $pdo->beginTransaction();
                    
                    // a) Insert into Ledger as Income
                    $ledStmt = $pdo->prepare("INSERT INTO finance_ledger (type, category, amount, v_id, description) VALUES ('income', 'Driver Settlement', ?, ?, 'Cash received from driver to settle balance.')");
                    $ledStmt->execute([$data['amount'], $data['v_id']]);
                    
                    // b) Decrease driver balance debt
                    $balStmt = $pdo->prepare("UPDATE driver_balances SET balance = balance - ? WHERE v_id = ?");
                    $balStmt->execute([$data['amount'], $data['v_id']]);
                    
                    $pdo->commit();
                    echo json_encode(["status" => "success", "message" => "Driver balance settled."]);
                } catch (Exception $e) {
                    $pdo->rollBack();
                    http_response_code(500);
                    echo json_encode(["status" => "error", "message" => "Failed to settle: " . $e->getMessage()]);
                }
            }
            else {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Invalid POST action or missing fields."]);
            }
        }
        break;
}
?>
