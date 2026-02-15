<?php
session_start();
include_once '../config/db.php';


session_unset();
session_destroy();

echo json_encode(array("message" => "Logout successful."));
?>
