<?php
session_start();
include_once '../config/db.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Search customers by partial mobile number
    if (isset($_GET['search'])) {
        $search = $_GET['search'];
        $query = "SELECT DISTINCT m_no, b_name FROM ft_cus_master WHERE m_no LIKE :search ORDER BY m_no LIMIT 10";
        $stmt = $db->prepare($query);
        $searchParam = $search . '%';
        $stmt->bindParam(":search", $searchParam);
        $stmt->execute();

        $customers = array();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            array_push($customers, $row);
        }

        // Also search in bookings table for customers not in master
        $query2 = "SELECT DISTINCT m_no, b_name FROM f_ft_booking WHERE m_no LIKE :search AND m_no NOT IN (SELECT m_no FROM ft_cus_master WHERE m_no LIKE :search2) ORDER BY m_no LIMIT 10";
        $stmt2 = $db->prepare($query2);
        $stmt2->bindParam(":search", $searchParam);
        $stmt2->bindParam(":search2", $searchParam);
        $stmt2->execute();

        while ($row = $stmt2->fetch(PDO::FETCH_ASSOC)) {
            array_push($customers, $row);
        }

        echo json_encode($customers);
    }

    // Fetch previous trips for a mobile number
    if (isset($_GET['trips_for'])) {
        $mobile = $_GET['trips_for'];
        $query = "SELECT b_id, pickup, b_date, p_city, d_place, v_type, r_status, 
                         CASE WHEN assign = '1' THEN 'Assigned' ELSE 'Pending' END as status,
                         b_name, remarks
                  FROM f_ft_booking 
                  WHERE m_no = :mobile 
                  ORDER BY b_id DESC 
                  LIMIT 20";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":mobile", $mobile);
        $stmt->execute();

        $trips = array();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            array_push($trips, $row);
        }

        echo json_encode($trips);
    }
}
?>
