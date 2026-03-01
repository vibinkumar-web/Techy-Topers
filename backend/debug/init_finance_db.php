<?php
/**
 * init_finance_db.php — Finance Database Initialiser
 * Creates the finance_ledger, driver_balances, and finance_categories tables
 * if they do not already exist. Run once during initial setup.
 */
include '../config/db.php';
$d = new Database();
$db = $d->getConnection();

try {
    // 1. Transactions/Ledger Table
    // Tracks every single flow of money (Income from trips, Commission deductions, Office Expenses)
    $q1 = "
    CREATE TABLE IF NOT EXISTS `finance_ledger` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `transaction_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
      `type` enum('income', 'expense', 'commission') NOT NULL,
      `category` varchar(100) NOT NULL,
      `amount` decimal(10,2) NOT NULL,
      `b_id` int(11) DEFAULT NULL COMMENT 'Reference to booking ID if applicable',
      `v_id` varchar(50) DEFAULT NULL COMMENT 'Reference to driver/vehicle ID if applicable',
      `description` text,
      `recorded_by` varchar(100) DEFAULT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
    ";

    // 2. Driver Balances Table
    // Tracks the running balance/wallet for each driver
    $q2 = "
    CREATE TABLE IF NOT EXISTS `driver_balances` (
      `v_id` varchar(50) NOT NULL,
      `balance` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT 'Positive means driver owes office, Negative means office owes driver',
      `last_updated` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (`v_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
    ";

    // 3. Finance Categories (Optional metadata)
    $q3 = "
    CREATE TABLE IF NOT EXISTS `finance_categories` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `type` enum('income', 'expense') NOT NULL,
      `name` varchar(100) NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
    ";

    $db->exec($q1);
    $db->exec($q2);
    $db->exec($q3);

    // Insert default categories if empty
    $checkQ = $db->query("SELECT count(*) FROM finance_categories");
    if ($checkQ->fetchColumn() == 0) {
        $db->exec("INSERT INTO finance_categories (type, name) VALUES
            ('income', 'Trip Fare'),
            ('income', 'Other Income'),
            ('expense', 'Fuel'),
            ('expense', 'Office Rent'),
            ('expense', 'Maintenance'),
            ('expense', 'Salary'),
            ('expense', 'Other Expense')");
    }

    echo json_encode(["status" => "success", "message" => "Finance tables created successfully"]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
