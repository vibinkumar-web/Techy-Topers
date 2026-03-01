<?php
/**
 * db_inspector.php — Consolidated Database Inspector
 *
 * A developer utility for inspecting the database schema and sample data.
 * This replaces all the individual check_*.php / test_describe.php scripts.
 *
 * Usage (run via PHP CLI or accessed through the dev server):
 *   ?action=tables                        — List all tables
 *   ?action=describe&table=f_closing      — Describe a table's columns
 *   ?action=sample&table=f_closing        — Show 5 sample rows
 *   ?action=required&table=f_closing      — Show NOT NULL columns with no default
 *   ?action=tariffs                       — Dump tariff tables (local & outstation)
 *   ?action=finance                       — Dump finance_ledger sample rows
 *   ?action=ontrip                        — Dump active on-trip records
 *   ?action=closing                       — Dump recent f_closing records
 *
 * IMPORTANT: This file is for development/debugging only.
 * Do NOT expose this endpoint in production.
 */

header("Content-Type: application/json; charset=UTF-8");

include '../config/db.php';
$d = new Database();
$db = $d->getConnection();

$action = $_GET['action'] ?? 'tables';
$table  = $_GET['table']  ?? '';

// Whitelist allowed table names to prevent SQL injection
function sanitize_table(string $name, PDO $db): string {
    $stmt = $db->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    if (!in_array($name, $tables, true)) {
        http_response_code(400);
        echo json_encode(["error" => "Unknown table: $name"]);
        exit;
    }
    return $name;
}

try {
    switch ($action) {

        case 'tables':
            $q = $db->query("SHOW TABLES");
            echo json_encode($q->fetchAll(PDO::FETCH_COLUMN), JSON_PRETTY_PRINT);
            break;

        case 'describe':
            $t = sanitize_table($table, $db);
            $q = $db->query("DESCRIBE `$t`");
            echo json_encode($q->fetchAll(PDO::FETCH_ASSOC), JSON_PRETTY_PRINT);
            break;

        case 'sample':
            $t = sanitize_table($table, $db);
            $q = $db->query("SELECT * FROM `$t` ORDER BY 1 DESC LIMIT 5");
            echo json_encode($q->fetchAll(PDO::FETCH_ASSOC), JSON_PRETTY_PRINT);
            break;

        case 'required':
            $t = sanitize_table($table, $db);
            $q = $db->query("DESCRIBE `$t`");
            $cols = $q->fetchAll(PDO::FETCH_ASSOC);
            $required = array_filter($cols, fn($c) =>
                $c['Null'] === 'NO' && $c['Default'] === null && $c['Extra'] !== 'auto_increment'
            );
            echo json_encode(array_values($required), JSON_PRETTY_PRINT);
            break;

        case 'tariffs':
            $out = [];
            foreach (['f_local_tariff', 'local_tariff'] as $t) {
                try {
                    $q = $db->query("SELECT * FROM `$t` LIMIT 10");
                    $out[$t] = $q->fetchAll(PDO::FETCH_ASSOC);
                } catch (Exception $e) {
                    $out[$t] = ["error" => $e->getMessage()];
                }
            }
            foreach (['f_out_tariff', 'out_tariff'] as $t) {
                try {
                    $q = $db->query("SELECT id, v_id, a1, a76 FROM `$t` LIMIT 10");
                    $out[$t] = $q->fetchAll(PDO::FETCH_ASSOC);
                } catch (Exception $e) {
                    $out[$t] = ["error" => $e->getMessage()];
                }
            }
            echo json_encode($out, JSON_PRETTY_PRINT);
            break;

        case 'finance':
            $q = $db->query("SELECT id, type, category, amount, description FROM finance_ledger ORDER BY id DESC LIMIT 10");
            echo json_encode($q->fetchAll(PDO::FETCH_ASSOC), JSON_PRETTY_PRINT);
            break;

        case 'ontrip':
            $q = $db->query("SELECT b_id, v_id, already_assign, booking_status FROM f_ontrip WHERE already_assign='1'");
            echo json_encode($q->fetchAll(PDO::FETCH_ASSOC), JSON_PRETTY_PRINT);
            break;

        case 'closing':
            $cnt = $db->query("SELECT COUNT(*) as count FROM f_closing")->fetch(PDO::FETCH_ASSOC);
            $rows = $db->query("SELECT id, b_id, v_id, opening_km, closing_km, net_total FROM f_closing ORDER BY id DESC LIMIT 5")->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(["total_count" => $cnt['count'], "recent" => $rows], JSON_PRETTY_PRINT);
            break;

        default:
            http_response_code(400);
            echo json_encode(["error" => "Unknown action. Use: tables, describe, sample, required, tariffs, finance, ontrip, closing"]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
