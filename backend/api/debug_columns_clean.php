<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: text/plain"); // Plain text for easier reading
include_once '../config/db.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    echo "--- ft_staff columns ---\n";
    $q = $db->prepare("DESCRIBE ft_staff");
    $q->execute();
    $cols = $q->fetchAll(PDO::FETCH_COLUMN);
    foreach($cols as $c) { echo $c . "\n"; }

    echo "\n--- ft_register columns ---\n";
    $q = $db->prepare("DESCRIBE ft_register");
    $q->execute();
    $cols = $q->fetchAll(PDO::FETCH_COLUMN);
    foreach($cols as $c) { echo $c . "\n"; }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
