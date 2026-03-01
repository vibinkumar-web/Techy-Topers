<?php
/**
 * fix_schema.php — Migration helper
 * Applies column default fixes to the f_closing table.
 * Run once when migrating the database schema.
 */
include '../config/db.php';
$d = new Database();
$db = $d->getConnection();

$queries = [
    "ALTER TABLE f_closing MODIFY COLUMN bid int(11) DEFAULT 0",
    "ALTER TABLE f_closing MODIFY COLUMN pack_charges decimal(10,2) DEFAULT 0.00",
    "ALTER TABLE f_closing MODIFY COLUMN waiting_charges decimal(10,2) DEFAULT 0.00",
    "ALTER TABLE f_closing MODIFY COLUMN ex_km decimal(10,2) DEFAULT 0.00",
    "ALTER TABLE f_closing MODIFY COLUMN ex_km_charges decimal(10,2) DEFAULT 0.00",
    "ALTER TABLE f_closing MODIFY COLUMN wait_hrs int(11) DEFAULT 0",
    "ALTER TABLE f_closing MODIFY COLUMN wait_min int(11) DEFAULT 0",
    "ALTER TABLE f_closing MODIFY COLUMN other_charge decimal(10,2) DEFAULT 0.00",
    "ALTER TABLE f_closing MODIFY COLUMN pending varchar(10) DEFAULT '0'",
    "ALTER TABLE f_closing MODIFY COLUMN user_id int(11) DEFAULT 0",
    "ALTER TABLE f_closing MODIFY COLUMN p_date date DEFAULT NULL",
    "ALTER TABLE f_closing MODIFY COLUMN d_date date DEFAULT NULL"
];

foreach ($queries as $q) {
    try {
        $db->exec($q);
        echo "Success: $q\n";
    } catch (Exception $e) {
        echo "Error: $q -> " . $e->getMessage() . "\n";
    }
}
?>
