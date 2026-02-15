<?php
session_start();
include_once '../config/db.php';

// Ideally check SESSION or Token here. 
// For this migration, we will trust the client to send the user ID or we can implement a token check later.
// Simplified for now: return some data.

    echo json_encode(array(
        "message" => "Dashboard access granted.",
        "stats" => array(
            "bookings" => 12,
            "pending" => 2,
            "completed" => 10
        ),
        "recent_activity" => array(
            array("id" => 1, "action" => "Booking 101", "status" => "Completed"),
            array("id" => 2, "action" => "Booking 102", "status" => "Pending")
        )
    ));

?>
