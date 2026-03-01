<?php
session_start();
include_once '../config/db.php';

header('Content-Type: application/json');

try {
    if (!$conn) {
        throw new Exception("Database connection failed.");
    }

    $stats = array();

    // Helper: safely run a COUNT query, return 0 if table doesn't exist
    function safeCount($conn, $sql) {
        try {
            $q = $conn->query($sql);
            if (!$q) return 0;
            $row = $q->fetch(PDO::FETCH_ASSOC);
            return isset($row['cnt']) ? (int)$row['cnt'] : 0;
        } catch (Exception $e) {
            return 0;
        }
    }

    // Total Customers
    $cus1 = safeCount($conn, "SELECT COUNT(*) as cnt FROM ft_cus_master");
    $cus2 = safeCount($conn, "SELECT COUNT(*) as cnt FROM new_customer");
    $stats['total_customers'] = $cus1 + $cus2;

    // Total Bookings
    $stats['total_bookings'] = safeCount($conn, "SELECT COUNT(*) as cnt FROM f_ft_booking");

    // Completed Trips
    $stats['completed_bookings'] = safeCount($conn, "SELECT COUNT(*) as cnt FROM f_closing");

    // On-Trip
    $stats['on_trip'] = safeCount($conn, "SELECT COUNT(*) as cnt FROM f_ontrip WHERE already_assign = '1'");

    // Advance Bookings (future dates beyond today)
    $stats['advance_booking'] = safeCount($conn, "SELECT COUNT(*) as cnt FROM f_ft_booking WHERE b_date > DATE_ADD(CURDATE(), INTERVAL 1 DAY)");

    // Pending Assignments
    $stats['pending_assignments'] = safeCount($conn, "SELECT COUNT(*) as cnt FROM f_ft_booking WHERE assign = '0' AND (booking_status != '1' OR booking_status IS NULL)");

    // Total Drivers / Staff
    $stats['total_drivers'] = safeCount($conn, "SELECT COUNT(*) as cnt FROM ft_staff");

    // Active Staff (emp_status = 1)
    $stats['active_drivers'] = safeCount($conn, "SELECT COUNT(*) as cnt FROM ft_staff WHERE emp_status = '1'");

    // Inactive Staff
    $stats['inactive_drivers'] = max(0, $stats['total_drivers'] - $stats['active_drivers']);

    // Cancelled Bookings
    $stats['cancelled_booking'] = safeCount($conn, "SELECT COUNT(*) as cnt FROM f_calcel_booking");

    // Recent Bookings (last 5)
    $stats['recent_bookings'] = array();
    $qrb = $conn->query("SELECT b_id, b_name, m_no, p_city, d_place, b_date, booking_status FROM f_ft_booking ORDER BY b_id DESC LIMIT 5");
    if ($qrb) {
        while($r = $qrb->fetch(PDO::FETCH_ASSOC)) {
            $stats['recent_bookings'][] = $r;
        }
    }

    // Live Trips (latest 5)
    $stats['live_trips'] = array();
    $qlt = $conn->query("SELECT b_id, b_name, m_no, p_city, d_place, v_id FROM f_ontrip WHERE already_assign = '1' ORDER BY assign_time DESC LIMIT 5");
    if ($qlt) {
        while($r = $qlt->fetch(PDO::FETCH_ASSOC)) {
            $stats['live_trips'][] = $r;
        }
    }

    // Pending Assignments (soonest 5)
    $stats['upcoming_assignments'] = array();
    $qua = $conn->query("SELECT b_id, b_name, m_no, pickup, d_place, b_date FROM f_ft_booking WHERE assign = '0' AND (booking_status != '1' OR booking_status IS NULL) ORDER BY b_date ASC LIMIT 5");
    if ($qua) {
        while($r = $qua->fetch(PDO::FETCH_ASSOC)) {
            $stats['upcoming_assignments'][] = $r;
        }
    }

    echo json_encode(array(
        "message" => "Dashboard data loaded.",
        "stats"   => $stats
    ));

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array("message" => "Dashboard error: " . $e->getMessage()));
}
?>
