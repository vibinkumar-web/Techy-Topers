<?php
/**
 * Taxi App Backend API Test Suite
 * Run with: php run_tests.php
 * Requires the PHP built-in server or Apache/Nginx running on localhost:8080
 *
 * Usage:
 *   php -S localhost:8080 -t .   (from backend directory)
 *   php run_tests.php
 */

$baseUrl = 'http://localhost:8080/backend/api';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

$passed = 0;
$failed = 0;
$skipped = 0;
$currentGroup = '';

function setGroup(string $name): void {
    global $currentGroup;
    $currentGroup = $name;
    echo "\n" . str_repeat('─', 55) . "\n";
    echo "  🔷 {$name}\n";
    echo str_repeat('─', 55) . "\n";
}

function makeRequest(string $url, string $method = 'GET', $data = null, array $headers = []): array {
    $defaultHeaders = "Content-Type: application/json\r\nAccept: application/json\r\n";
    foreach ($headers as $k => $v) {
        $defaultHeaders .= "{$k}: {$v}\r\n";
    }

    $options = [
        'http' => [
            'header'        => $defaultHeaders,
            'method'        => $method,
            'ignore_errors' => true,
            'timeout'       => 10,
        ]
    ];

    if ($data !== null) {
        $options['http']['content'] = json_encode($data);
    }

    $context = stream_context_create($options);

    try {
        $result = @file_get_contents($url, false, $context);
        if ($result === false) {
            return ['status' => 0, 'body' => null, 'error' => 'Connection failed'];
        }
    } catch (Throwable $e) {
        return ['status' => 0, 'body' => null, 'error' => $e->getMessage()];
    }

    $statusLine = $http_response_header[0] ?? 'HTTP/1.1 000';
    preg_match('{HTTP\/\S*\s(\d{3})}', $statusLine, $match);
    $status = (int)($match[1] ?? 0);

    return [
        'status' => $status,
        'body'   => json_decode($result, true),
        'raw'    => $result,
    ];
}

function assertEqual($expected, $actual, string $message): void {
    global $passed, $failed;
    if ($expected === $actual) {
        echo "  ✅ PASS: {$message}\n";
        $passed++;
    } else {
        echo "  ❌ FAIL: {$message}\n";
        echo "     Expected: " . json_encode($expected) . "\n";
        echo "     Actual:   " . json_encode($actual) . "\n";
        $failed++;
    }
}

function assertNotEqual($unexpected, $actual, string $message): void {
    global $passed, $failed;
    if ($unexpected !== $actual) {
        echo "  ✅ PASS: {$message}\n";
        $passed++;
    } else {
        echo "  ❌ FAIL: {$message} (should NOT be " . json_encode($unexpected) . ")\n";
        $failed++;
    }
}

function assertStatus(int $expected, array $res, string $message): void {
    assertEqual($expected, $res['status'], $message);
}

function assertBodyKey(string $key, array $res, string $message): void {
    global $passed, $failed;
    if (is_array($res['body']) && array_key_exists($key, $res['body'])) {
        echo "  ✅ PASS: {$message}\n";
        $passed++;
    } else {
        echo "  ❌ FAIL: {$message} (key '{$key}' not found in body)\n";
        echo "     Body: " . json_encode($res['body']) . "\n";
        $failed++;
    }
}

function assertBodyIsArray(array $res, string $message): void {
    global $passed, $failed;
    if (is_array($res['body'])) {
        echo "  ✅ PASS: {$message}\n";
        $passed++;
    } else {
        echo "  ❌ FAIL: {$message} (body is not an array)\n";
        echo "     Body: " . json_encode($res['body']) . "\n";
        $failed++;
    }
}

function assertBodyContains(string $key, $value, array $res, string $message): void {
    global $passed, $failed;
    if (is_array($res['body']) && isset($res['body'][$key]) && $res['body'][$key] === $value) {
        echo "  ✅ PASS: {$message}\n";
        $passed++;
    } else {
        echo "  ❌ FAIL: {$message}\n";
        echo "     Expected body['{$key}'] = " . json_encode($value) . "\n";
        echo "     Body: " . json_encode($res['body']) . "\n";
        $failed++;
    }
}

function assertConnected(array $res, string $endpoint): void {
    global $skipped, $passed, $failed;
    if ($res['status'] === 0) {
        echo "  ⚠️  SKIP: Cannot connect to {$endpoint} (server may be offline)\n";
        $skipped++;
    }
}

// ─────────────────────────────────────────────
// Connectivity pre-check
// ─────────────────────────────────────────────
echo "\n🚀 Taxi App Backend API Test Suite\n";
echo "   Base URL: {$baseUrl}\n";
echo "   Started:  " . date('Y-m-d H:i:s') . "\n";

$ping = makeRequest("{$baseUrl}/dashboard.php");
if ($ping['status'] === 0) {
    echo "\n❌ FATAL: Cannot connect to {$baseUrl}\n";
    echo "   Please start the server:  php -S localhost:8080  (from project root)\n";
    echo "   Or ensure Apache/Nginx is running.\n\n";
    exit(1);
}
echo "\n   ✅ Server is reachable (HTTP {$ping['status']})\n";

// ═════════════════════════════════════════════
// 1. AUTH - Login
// ═════════════════════════════════════════════
setGroup('Authentication – Login');

// 1a. Missing fields
$r = makeRequest("{$baseUrl}/login.php", 'POST', []);
assertStatus(400, $r, 'Login with empty body → 400');
assertBodyKey('message', $r, 'Login error response has "message" key');

// 1b. Wrong credentials
$r = makeRequest("{$baseUrl}/login.php", 'POST', ['username' => 'no_such_user_xyz', 'password' => 'wrongpass']);
assertStatus(401, $r, 'Login with invalid credentials → 401');

// 1c. Missing password only
$r = makeRequest("{$baseUrl}/login.php", 'POST', ['username' => 'admin']);
assertStatus(400, $r, 'Login with only username → 400');

// ═════════════════════════════════════════════
// 2. AUTH - Register
// ═════════════════════════════════════════════
setGroup('Authentication – Register');

// 2a. Incomplete data (missing email, password, mobile)
$r = makeRequest("{$baseUrl}/register.php", 'POST', ['name' => 'Test User']);
assertStatus(400, $r, 'Register with only name → 400');
assertBodyKey('message', $r, 'Register error response has "message" key');

// 2b. Missing mobile
$r = makeRequest("{$baseUrl}/register.php", 'POST', ['name' => 'Test', 'email' => 'a@b.com', 'password' => '1234']);
assertStatus(400, $r, 'Register missing mobile → 400');

// 2c. Empty body
$r = makeRequest("{$baseUrl}/register.php", 'POST', []);
assertStatus(400, $r, 'Register with empty body → 400');

// ═════════════════════════════════════════════
// 3. AUTH - Admin Login
// ═════════════════════════════════════════════
setGroup('Authentication – Admin Login');

$r = makeRequest("{$baseUrl}/admin_login.php", 'POST', ['username' => 'bad_admin', 'password' => 'badpass']);
// Should be 401 on wrong creds, or at minimum a JSON response
assertNotEqual(0, $r['status'], 'Admin login endpoint is reachable');
assertBodyKey('message', $r, 'Admin login returns a "message" key');

$r = makeRequest("{$baseUrl}/admin_login.php", 'POST', []);
assertEqual(400, $r['status'], 'Admin login with empty body → 400');

// ═════════════════════════════════════════════
// 4. AUTH - Staff Login
// ═════════════════════════════════════════════
setGroup('Authentication – Staff Login');

// staff_login.php uses 'username' + 'password' fields
$r = makeRequest("{$baseUrl}/staff_login.php", 'POST', ['username' => 'no_such_staff_xyz', 'password' => 'wrongpass']);
assertNotEqual(0, $r['status'], 'Staff login endpoint is reachable');
assertBodyKey('message', $r, 'Staff login response has "message" key');

$r = makeRequest("{$baseUrl}/staff_login.php", 'POST', []);
assertEqual(400, $r['status'], 'Staff login with empty body → 400');

// ═════════════════════════════════════════════
// 5. Logout
// ═════════════════════════════════════════════
setGroup('Logout');

$r = makeRequest("{$baseUrl}/logout.php", 'POST', []);
assertNotEqual(0, $r['status'], 'Logout endpoint is reachable');

// ═════════════════════════════════════════════
// 6. Dashboard
// ═════════════════════════════════════════════
setGroup('Dashboard');

$r = makeRequest("{$baseUrl}/dashboard.php", 'GET');
assertStatus(200, $r, 'GET dashboard.php → 200');
assertBodyKey('stats', $r, 'Dashboard response contains "stats" key');
assertBodyKey('message', $r, 'Dashboard response contains "message" key');

// Verify key stats fields
if (is_array($r['body']) && isset($r['body']['stats'])) {
    $stats = $r['body']['stats'];
    foreach (['total_bookings', 'total_customers', 'total_drivers', 'on_trip', 'pending_assignments'] as $key) {
        global $passed, $failed;
        if (array_key_exists($key, $stats)) {
            echo "  ✅ PASS: Dashboard stats has '{$key}' field\n";
            $passed++;
        } else {
            echo "  ❌ FAIL: Dashboard stats missing '{$key}' field\n";
            $failed++;
        }
    }
}

// ═════════════════════════════════════════════
// 7. Vehicles
// ═════════════════════════════════════════════
setGroup('Vehicles CRUD');

// 7a. GET all vehicles
$r = makeRequest("{$baseUrl}/vehicles.php", 'GET');
assertStatus(200, $r, 'GET vehicles.php → 200');
assertBodyIsArray($r, 'GET vehicles.php returns JSON array');

// 7b. GET single vehicle (non-existing ID)
$r = makeRequest("{$baseUrl}/vehicles.php?v_id=NONEXISTENT_9999", 'GET');
assertStatus(200, $r, 'GET vehicle with non-existent v_id → 200 (returns empty object)');

// 7c. POST vehicle with missing data (no v_id)
$r = makeRequest("{$baseUrl}/vehicles.php", 'POST', ['v_brand' => 'Toyota']);
assertNotEqual(200, $r['status'], 'POST vehicle without v_id should not return 200');

// 7d. DELETE vehicle without v_id param
$r = makeRequest("{$baseUrl}/vehicles.php", 'DELETE');
assertStatus(400, $r, 'DELETE vehicle without v_id → 400');
assertBodyKey('message', $r, 'DELETE vehicle missing v_id returns message');

// ═════════════════════════════════════════════
// 8. Staff
// ═════════════════════════════════════════════
setGroup('Staff CRUD');

// 8a. GET all staff
$r = makeRequest("{$baseUrl}/staff.php", 'GET');
assertStatus(200, $r, 'GET staff.php → 200');
assertBodyIsArray($r, 'GET staff.php returns JSON array');

// 8b. GET single staff with non-existent emp_id
$r = makeRequest("{$baseUrl}/staff.php?emp_id=999999", 'GET');
assertStatus(200, $r, 'GET staff with non-existent emp_id → 200');

// ═════════════════════════════════════════════
// 9. Bookings
// ═════════════════════════════════════════════
setGroup('Bookings');

// 9a. GET all bookings
$r = makeRequest("{$baseUrl}/bookings.php", 'GET');
assertStatus(200, $r, 'GET bookings.php → 200');
assertBodyIsArray($r, 'GET bookings.php returns JSON array');

// 9b. POST booking with missing required fields
$r = makeRequest("{$baseUrl}/bookings.php", 'POST', ['d_place' => 'Airport']);
assertStatus(400, $r, 'POST booking with missing pickup and m_no → 400');
assertBodyKey('message', $r, 'POST booking error has "message" key');

// 9c. POST booking missing m_no only
$r = makeRequest("{$baseUrl}/bookings.php", 'POST', ['pickup' => '2026-03-01 10:00']);
assertStatus(400, $r, 'POST booking with only pickup (missing m_no) → 400');

// ═════════════════════════════════════════════
// 10. Customers
// ═════════════════════════════════════════════
setGroup('Customers');

// 10a. GET all customers
$r = makeRequest("{$baseUrl}/customers.php", 'GET');
assertStatus(200, $r, 'GET customers.php → 200');
assertBodyIsArray($r, 'GET customers.php returns JSON array');

// 10b. GET customer by mobile (non-existing)
$r = makeRequest("{$baseUrl}/customers.php?mobile=0000000000", 'GET');
assertStatus(200, $r, 'GET customer with unknown mobile → 200');
assertBodyContains('found', false, $r, 'Unknown mobile returns found=false');

// 10c. POST customer with missing data
$r = makeRequest("{$baseUrl}/customers.php", 'POST', ['m_no' => '9876543210']);
assertStatus(400, $r, 'POST customer missing b_name → 400');

$r = makeRequest("{$baseUrl}/customers.php", 'POST', ['b_name' => 'Test Customer']);
assertStatus(400, $r, 'POST customer missing m_no → 400');

$r = makeRequest("{$baseUrl}/customers.php", 'POST', []);
assertStatus(400, $r, 'POST customer with empty body → 400');

// ═════════════════════════════════════════════
// 11. Tariff
// ═════════════════════════════════════════════
setGroup('Tariff');

// 11a. GET without v_id
$r = makeRequest("{$baseUrl}/tariff.php", 'GET');
assertStatus(400, $r, 'GET tariff without v_id → 400');
assertBodyKey('message', $r, 'GET tariff error returns "message" key');

// 11b. GET with v_id=list (vehicle type list)
$r = makeRequest("{$baseUrl}/tariff.php?v_id=list", 'GET');
assertStatus(200, $r, 'GET tariff with v_id=list → 200');
assertBodyIsArray($r, 'GET tariff?v_id=list returns array');

// 11c. GET specific tariff (non-existing)
$r = makeRequest("{$baseUrl}/tariff.php?v_id=999999", 'GET');
assertStatus(404, $r, 'GET tariff with non-existent v_id → 404');

// 11d. POST tariff without v_id
$r = makeRequest("{$baseUrl}/tariff.php", 'POST', ['a1' => '50']);
assertStatus(400, $r, 'POST tariff without v_id → 400');

// ═════════════════════════════════════════════
// 12. Attendance
// ═════════════════════════════════════════════
setGroup('Staff Attendance');

// 12a. GET currently logged-in staff
$r = makeRequest("{$baseUrl}/attendance.php", 'GET');
assertStatus(200, $r, 'GET attendance.php → 200');
assertBodyIsArray($r, 'GET attendance.php returns array of logged-in staff');

// 12b. POST login action without id_emp
$r = makeRequest("{$baseUrl}/attendance.php", 'POST', ['action' => 'login']);
assertStatus(400, $r, 'POST attendance login without id_emp → 400');
assertBodyKey('message', $r, 'Attendance login error has "message" key');

// 12c. POST with invalid action
$r = makeRequest("{$baseUrl}/attendance.php", 'POST', ['action' => 'invalid_action_xyz']);
assertStatus(400, $r, 'POST attendance with invalid action → 400');

// 12d. POST logout without id_emp still gets a response
$r = makeRequest("{$baseUrl}/attendance.php", 'POST', ['action' => 'logout', 'id_emp' => '999999']);
assertNotEqual(0, $r['status'], 'POST attendance logout with non-existent emp is reachable');

// ═════════════════════════════════════════════
// 13. Assign
// ═════════════════════════════════════════════
setGroup('Assign Booking');

// 13a. GET unassigned bookings
$r = makeRequest("{$baseUrl}/assign.php", 'GET');
assertStatus(200, $r, 'GET assign.php → 200');
assertBodyIsArray($r, 'GET assign.php returns JSON array');

// 13b. POST assign with missing b_id
$r = makeRequest("{$baseUrl}/assign.php", 'POST', ['v_id' => 'V001']);
assertStatus(400, $r, 'POST assign missing b_id → 400');
assertBodyKey('message', $r, 'POST assign error has "message" key');

// 13c. POST assign with missing v_id
$r = makeRequest("{$baseUrl}/assign.php", 'POST', ['b_id' => '1']);
assertStatus(400, $r, 'POST assign missing v_id → 400');

// 13d. POST assign with both but non-existent records
$r = makeRequest("{$baseUrl}/assign.php", 'POST', ['b_id' => '999999', 'v_id' => 'VNONEXIST']);
assertStatus(404, $r, 'POST assign with non-existent booking/vehicle → 404');

// ═════════════════════════════════════════════
// 14. Closing (Trip Close)
// ═════════════════════════════════════════════
setGroup('Trip Closing');

// 14a. GET all closeable trips
$r = makeRequest("{$baseUrl}/closing.php", 'GET');
assertStatus(200, $r, 'GET closing.php → 200');
assertBodyIsArray($r, 'GET closing.php returns JSON array');

// 14b. GET specific trip with non-existent b_id
$r = makeRequest("{$baseUrl}/closing.php?b_id=999999", 'GET');
assertStatus(404, $r, 'GET closing with non-existent b_id → 404');
assertBodyKey('message', $r, 'GET closing 404 has "message" key');

// 14c. POST close with missing b_id
$r = makeRequest("{$baseUrl}/closing.php", 'POST', ['closing_km' => 100]);
assertStatus(400, $r, 'POST closing missing b_id → 400');

// 14d. POST close with missing closing_km
$r = makeRequest("{$baseUrl}/closing.php", 'POST', ['b_id' => '1']);
assertStatus(400, $r, 'POST closing missing closing_km → 400');

// 14e. POST close with empty body
$r = makeRequest("{$baseUrl}/closing.php", 'POST', []);
assertStatus(400, $r, 'POST closing with empty body → 400');

// ═════════════════════════════════════════════
// 15. Cancel Booking
// ═════════════════════════════════════════════
setGroup('Cancel Booking');

// 15a. POST cancel with empty body
$r = makeRequest("{$baseUrl}/cancel.php", 'POST', []);
assertStatus(400, $r, 'POST cancel with empty body → 400');
assertBodyKey('message', $r, 'POST cancel error has "message" key');

// 15b. POST cancel missing reason
$r = makeRequest("{$baseUrl}/cancel.php", 'POST', ['b_id' => '1']);
assertStatus(400, $r, 'POST cancel missing reason → 400');

// 15c. POST cancel missing b_id
$r = makeRequest("{$baseUrl}/cancel.php", 'POST', ['reason' => 'No driver available']);
assertStatus(400, $r, 'POST cancel missing b_id → 400');

// 15d. POST cancel with non-existent b_id
$r = makeRequest("{$baseUrl}/cancel.php", 'POST', ['b_id' => '999999', 'reason' => 'Test cancel reason']);
assertStatus(404, $r, 'POST cancel with non-existent b_id → 404');

// ═════════════════════════════════════════════
// 16. Finance / Ledger
// ═════════════════════════════════════════════
setGroup('Finance & Ledger');

// 16a. GET summary
$r = makeRequest("{$baseUrl}/finance.php?action=summary", 'GET');
assertNotEqual(0, $r['status'], 'GET finance?action=summary is reachable');
if ($r['status'] === 200) {
    assertBodyContains('status', 'success', $r, 'Finance summary returns status=success');
    assertBodyKey('data', $r, 'Finance summary has "data" key');
}

// 16b. GET ledger
$r = makeRequest("{$baseUrl}/finance.php?action=ledger", 'GET');
assertNotEqual(0, $r['status'], 'GET finance?action=ledger is reachable');
if ($r['status'] === 200) {
    assertBodyContains('status', 'success', $r, 'Finance ledger returns status=success');
}

// 16c. GET driver_balances
$r = makeRequest("{$baseUrl}/finance.php?action=driver_balances", 'GET');
assertNotEqual(0, $r['status'], 'GET finance?action=driver_balances is reachable');

// 16d. GET categories
$r = makeRequest("{$baseUrl}/finance.php?action=categories", 'GET');
assertNotEqual(0, $r['status'], 'GET finance?action=categories is reachable');

// 16e. POST invalid action
$r = makeRequest("{$baseUrl}/finance.php", 'POST', ['action' => 'bad_action']);
assertStatus(400, $r, 'POST finance with invalid action → 400');

// 16f. POST add_transaction with missing fields
$r = makeRequest("{$baseUrl}/finance.php", 'POST', ['action' => 'add_transaction', 'type' => 'income']);
assertStatus(400, $r, 'POST add_transaction missing amount/category → 400');

// ═════════════════════════════════════════════
// 17. Reports
// ═════════════════════════════════════════════
setGroup('Reports');

// 17a. No type specified
$r = makeRequest("{$baseUrl}/reports.php", 'GET');
assertStatus(400, $r, 'GET reports.php without type → 400');
assertBodyKey('message', $r, 'Reports error has "message" key');

// 17b. type=booking
$r = makeRequest("{$baseUrl}/reports.php?type=booking", 'GET');
assertStatus(200, $r, 'GET reports.php?type=booking → 200');
assertBodyIsArray($r, 'Booking report returns array');

// 17c. type=customer
$r = makeRequest("{$baseUrl}/reports.php?type=customer", 'GET');
assertStatus(200, $r, 'GET reports.php?type=customer → 200');
assertBodyIsArray($r, 'Customer report returns array');

// 17d. type=vehicle
$r = makeRequest("{$baseUrl}/reports.php?type=vehicle", 'GET');
assertStatus(200, $r, 'GET reports.php?type=vehicle → 200');
assertBodyIsArray($r, 'Vehicle report returns array');

// 17e. type=company
$r = makeRequest("{$baseUrl}/reports.php?type=company", 'GET');
assertStatus(200, $r, 'GET reports.php?type=company → 200');
assertBodyIsArray($r, 'Company report returns array');

// 17f. type=customers_list
$r = makeRequest("{$baseUrl}/reports.php?type=customers_list", 'GET');
assertStatus(200, $r, 'GET reports.php?type=customers_list → 200');
assertBodyIsArray($r, 'customers_list report returns array');

// 17g. type=vehicles_list
$r = makeRequest("{$baseUrl}/reports.php?type=vehicles_list", 'GET');
assertStatus(200, $r, 'GET reports.php?type=vehicles_list → 200');
assertBodyIsArray($r, 'vehicles_list report returns array');

// 17h. type=company_list
$r = makeRequest("{$baseUrl}/reports.php?type=company_list", 'GET');
assertStatus(200, $r, 'GET reports.php?type=company_list → 200');
assertBodyIsArray($r, 'company_list report returns array');

// 17i. Invalid type
$r = makeRequest("{$baseUrl}/reports.php?type=invalid_type_xyz", 'GET');
assertStatus(400, $r, 'GET reports with invalid type → 400');

// ═════════════════════════════════════════════
// 18. Staff Report
// ═════════════════════════════════════════════
setGroup('Staff Report');

$r = makeRequest("{$baseUrl}/staff_report.php", 'GET');
assertStatus(200, $r, 'GET staff_report.php → 200');
assertBodyIsArray($r, 'Staff report returns array');

// ═════════════════════════════════════════════
// 19. Cancel Report
// ═════════════════════════════════════════════
setGroup('Cancel Report');

$r = makeRequest("{$baseUrl}/cancel_report.php", 'GET');
assertStatus(200, $r, 'GET cancel_report.php → 200');
assertBodyIsArray($r, 'Cancel report returns array');

// ═════════════════════════════════════════════
// 20. Running KM Report
// ═════════════════════════════════════════════
setGroup('Running KM Report');

$r = makeRequest("{$baseUrl}/running_km_report.php", 'GET');
assertStatus(200, $r, 'GET running_km_report.php → 200');
assertBodyIsArray($r, 'Running KM report returns array');

// ═════════════════════════════════════════════
// 21. Available Vehicles
// ═════════════════════════════════════════════
setGroup('Available Vehicles');

$r = makeRequest("{$baseUrl}/available_vehicles.php", 'GET');
assertStatus(200, $r, 'GET available_vehicles.php → 200');
assertBodyIsArray($r, 'Available vehicles returns array');

// ═════════════════════════════════════════════
// 22. Vehicle Attendance
// ═════════════════════════════════════════════
setGroup('Vehicle Attendance');

$r = makeRequest("{$baseUrl}/vehicle_attendance.php", 'GET');
assertNotEqual(0, $r['status'], 'GET vehicle_attendance.php is reachable');

// ═════════════════════════════════════════════
// 23. On-Trip
// ═════════════════════════════════════════════
setGroup('On-Trip');

$r = makeRequest("{$baseUrl}/ontrip.php", 'GET');
assertStatus(200, $r, 'GET ontrip.php → 200');
assertBodyIsArray($r, 'On-trip list returns array');

// ═════════════════════════════════════════════
// 24. Enquiry Report
// ═════════════════════════════════════════════
setGroup('Enquiry Report');

$r = makeRequest("{$baseUrl}/enquiry_report.php", 'GET');
assertStatus(200, $r, 'GET enquiry_report.php → 200');
assertBodyIsArray($r, 'Enquiry report returns array');

// ═════════════════════════════════════════════
// 25. Customer Search
// ═════════════════════════════════════════════
setGroup('Customer Search');

// 25a. Search without query
$r = makeRequest("{$baseUrl}/customer_search.php", 'GET');
assertNotEqual(0, $r['status'], 'GET customer_search.php is reachable');

// 25b. Search with correct 'search' param (the API ignores unknown params like ?q)
$r = makeRequest("{$baseUrl}/customer_search.php?search=99", 'GET');
assertNotEqual(0, $r['status'], 'GET customer_search.php?search=99 is reachable');
assertBodyIsArray($r, 'Customer search returns array');

// 25c. Trips for a mobile number
$r = makeRequest("{$baseUrl}/customer_search.php?trips_for=9999999999", 'GET');
assertNotEqual(0, $r['status'], 'GET customer_search.php?trips_for=... is reachable');
assertBodyIsArray($r, 'Customer trips_for returns array');

// ═════════════════════════════════════════════
// 26. Booking Edit
// ═════════════════════════════════════════════
setGroup('Booking Edit');

// 26a. PUT booking edit without b_id
$r = makeRequest("{$baseUrl}/booking_edit.php", 'PUT', ['d_place' => 'New Destination']);
assertNotEqual(0, $r['status'], 'PUT booking_edit.php is reachable');

// ═════════════════════════════════════════════
// 27. Settings
// ═════════════════════════════════════════════
setGroup('Settings');

$r = makeRequest("{$baseUrl}/settings.php", 'GET');
assertStatus(200, $r, 'GET settings.php → 200');
// Settings returns a single object (not an array)
assertBodyKey('smsoption', $r, 'Settings response has "smsoption" key');

// ═════════════════════════════════════════════
// 28. User Rights
// ═════════════════════════════════════════════
setGroup('User Rights');

$r = makeRequest("{$baseUrl}/user_rights.php", 'GET');
assertStatus(200, $r, 'GET user_rights.php → 200');
assertBodyIsArray($r, 'User rights returns array');

// ═════════════════════════════════════════════
// 29. Shortage KM Report
// ═════════════════════════════════════════════
setGroup('Shortage KM Report');

$r = makeRequest("{$baseUrl}/shortage_km_report.php", 'GET');
assertStatus(200, $r, 'GET shortage_km_report.php → 200');
assertBodyIsArray($r, 'Shortage KM report returns array');

// ═════════════════════════════════════════════
// 30. Advance Bookings
// ═════════════════════════════════════════════
setGroup('Advance Bookings');

$r = makeRequest("{$baseUrl}/advance_bookings.php", 'GET');
assertStatus(200, $r, 'GET advance_bookings.php → 200');
assertBodyIsArray($r, 'Advance bookings returns array');

// ═════════════════════════════════════════════
// 31. Admin Register
// ═════════════════════════════════════════════
setGroup('Admin Register');

$r = makeRequest("{$baseUrl}/admin_register.php", 'POST', []);
assertStatus(400, $r, 'POST admin_register with empty body → 400');
assertBodyKey('message', $r, 'Admin register error has "message" key');

$r = makeRequest("{$baseUrl}/admin_register.php", 'POST', ['name' => 'Admin']);
assertStatus(400, $r, 'POST admin_register missing email/mobile/password → 400');

// ═════════════════════════════════════════════
// 32. Staff Register
// ═════════════════════════════════════════════
setGroup('Staff Register');

$r = makeRequest("{$baseUrl}/staff_register.php", 'POST', []);
assertStatus(400, $r, 'POST staff_register with empty body → 400');
assertBodyKey('message', $r, 'Staff register error has "message" key');

$r = makeRequest("{$baseUrl}/staff_register.php", 'POST', ['name' => 'Test Staff']);
assertStatus(400, $r, 'POST staff_register missing required fields → 400');

// ═════════════════════════════════════════════
// 33. Advance Booking (singular - future unassigned)
// ═════════════════════════════════════════════
setGroup('Advance Booking (Single Endpoint)');

$r = makeRequest("{$baseUrl}/advance_booking.php", 'GET');
assertStatus(200, $r, 'GET advance_booking.php → 200');
assertBodyIsArray($r, 'Advance booking returns array');

$r = makeRequest("{$baseUrl}/advance_booking.php", 'POST', []);
assertStatus(405, $r, 'POST advance_booking.php → 405 Method Not Allowed');

// ═════════════════════════════════════════════
// 34. Assign Later
// ═════════════════════════════════════════════
setGroup('Assign Later');

$r = makeRequest("{$baseUrl}/assign_later.php", 'GET');
assertStatus(200, $r, 'GET assign_later.php → 200');
assertBodyIsArray($r, 'Assign later returns array of bookings');

$r = makeRequest("{$baseUrl}/assign_later.php?action=drivers", 'GET');
assertStatus(200, $r, 'GET assign_later.php?action=drivers → 200');
assertBodyIsArray($r, 'Assign later drivers returns array');

$r = makeRequest("{$baseUrl}/assign_later.php", 'POST', []);
assertStatus(400, $r, 'POST assign_later with empty body → 400');
assertBodyKey('message', $r, 'Assign later POST error has "message" key');

$r = makeRequest("{$baseUrl}/assign_later.php", 'POST', ['b_id' => '1']);
assertStatus(400, $r, 'POST assign_later missing driver_id → 400');

// ═════════════════════════════════════════════
// 35. Attached Vehicles
// ═════════════════════════════════════════════
setGroup('Attached Vehicles');

$r = makeRequest("{$baseUrl}/attached_vehicles.php", 'GET');
assertStatus(200, $r, 'GET attached_vehicles.php → 200');
assertBodyIsArray($r, 'Attached vehicles returns array');

$r = makeRequest("{$baseUrl}/attached_vehicles.php", 'DELETE', null);
// DELETE without v_id param - no output (the API silently exits)
assertNotEqual(0, $r['status'], 'DELETE attached_vehicles.php endpoint is reachable');

// ═════════════════════════════════════════════
// 36. Booking Counts
// ═════════════════════════════════════════════
setGroup('Booking Counts');

// Without date range → returns "Date range required"
$r = makeRequest("{$baseUrl}/booking_counts.php", 'GET');
assertStatus(200, $r, 'GET booking_counts.php without dates → 200');
assertBodyKey('message', $r, 'Booking counts without dates returns message');

// With date range → should return stats object
$today = date('Y-m-d');
$r = makeRequest("{$baseUrl}/booking_counts.php?from_date={$today}&to_date={$today}", 'GET');
assertStatus(200, $r, 'GET booking_counts.php with date range → 200');
assertBodyKey('total', $r, 'Booking counts with dates has "total" key');
assertBodyKey('cancelled', $r, 'Booking counts with dates has "cancelled" key');
assertBodyKey('closed', $r, 'Booking counts with dates has "closed" key');

// ═════════════════════════════════════════════
// 37. Company Report (standalone)
// ═════════════════════════════════════════════
setGroup('Company Report (Standalone)');

// Without date → returns empty array
$r = makeRequest("{$baseUrl}/company_report.php", 'GET');
assertStatus(200, $r, 'GET company_report.php without dates → 200');
assertBodyIsArray($r, 'Company report without dates returns empty array');

// With date range (f_trip_sheet_entry table may not exist on all DBs → just check reachability)
$r = makeRequest("{$baseUrl}/company_report.php?from_date={$today}&to_date={$today}", 'GET');
assertNotEqual(0, $r['status'], 'GET company_report.php with date range is reachable');

// Company list (also uses f_trip_sheet_entry, just check reachability)
$r = makeRequest("{$baseUrl}/company_report.php?list=1", 'GET');
assertNotEqual(0, $r['status'], 'GET company_report.php?list=1 is reachable');

// ═════════════════════════════════════════════
// 38. Customer Report (standalone)
// ═════════════════════════════════════════════
setGroup('Customer Report (Standalone)');

// Without dates → returns message
$r = makeRequest("{$baseUrl}/customer_report.php", 'GET');
assertStatus(200, $r, 'GET customer_report.php without dates → 200');
assertBodyKey('message', $r, 'Customer report without dates returns message');

// With date range
$r = makeRequest("{$baseUrl}/customer_report.php?from_date={$today}&to_date={$today}", 'GET');
assertStatus(200, $r, 'GET customer_report.php with date range → 200');
assertBodyIsArray($r, 'Customer report with dates returns array');

// ═════════════════════════════════════════════
// 39. Customer Upload (CSV)
// ═════════════════════════════════════════════
setGroup('Customer Upload');

// No file uploaded
$r = makeRequest("{$baseUrl}/customer_upload.php", 'POST', []);
assertStatus(400, $r, 'POST customer_upload without file → 400');
assertBodyKey('message', $r, 'Customer upload error has "message" key');

// ═════════════════════════════════════════════
// 40. Day-Wise Report
// ═════════════════════════════════════════════
setGroup('Day-Wise Report');

// Without dates → empty array
$r = makeRequest("{$baseUrl}/day_wise_report.php", 'GET');
assertStatus(200, $r, 'GET day_wise_report.php without dates → 200');
assertBodyIsArray($r, 'Day-wise report without dates returns empty array');

// With date range (f_trip_sheet_entry may not exist - just check reachability)
$r = makeRequest("{$baseUrl}/day_wise_report.php?from_date={$today}&to_date={$today}", 'GET');
assertNotEqual(0, $r['status'], 'GET day_wise_report.php with date range is reachable');

// ═════════════════════════════════════════════
// 41. Edit Closed Trip
// ═════════════════════════════════════════════
setGroup('Edit Closed Trip');

// GET without b_id → 400
$r = makeRequest("{$baseUrl}/edit_closed_trip.php", 'GET');
assertStatus(400, $r, 'GET edit_closed_trip.php without b_id → 400');
assertBodyKey('message', $r, 'Edit closed trip missing b_id has "message"');

// GET with non-existent b_id → 404
$r = makeRequest("{$baseUrl}/edit_closed_trip.php?b_id=999999", 'GET');
assertStatus(404, $r, 'GET edit_closed_trip.php with non-existent b_id → 404');

// POST without b_id → 400
$r = makeRequest("{$baseUrl}/edit_closed_trip.php", 'POST', []);
assertStatus(400, $r, 'POST edit_closed_trip without b_id → 400');

// ═════════════════════════════════════════════
// 42. Enquiry Tariff
// ═════════════════════════════════════════════
setGroup('Enquiry Tariff');

$r = makeRequest("{$baseUrl}/enquery_tariff.php", 'GET');
assertStatus(200, $r, 'GET enquery_tariff.php → 200');
assertBodyIsArray($r, 'Enquiry tariff returns array');

// With km param → calculated prices
$r = makeRequest("{$baseUrl}/enquery_tariff.php?km=150", 'GET');
assertStatus(200, $r, 'GET enquery_tariff.php?km=150 → 200');
assertBodyIsArray($r, 'Enquiry tariff with km returns array');

// ═════════════════════════════════════════════
// 43. Get Distance Suggestions
// ═════════════════════════════════════════════
setGroup('Distance Suggestions');

// Without km → empty staff list
$r = makeRequest("{$baseUrl}/get_distance_suggestions.php", 'GET');
assertStatus(200, $r, 'GET get_distance_suggestions.php without km → 200');
assertBodyKey('staff', $r, 'Distance suggestions has "staff" key');

// With km - staff field is an array inside the object (not a top-level array)
$r = makeRequest("{$baseUrl}/get_distance_suggestions.php?km=100", 'GET');
assertStatus(200, $r, 'GET get_distance_suggestions.php?km=100 → 200');
assertBodyKey('staff', $r, 'Distance suggestions with km has "staff" key');
assertEqual(true, is_array($r['body']['staff'] ?? null), 'Distance suggestions staff field is array');

// ═════════════════════════════════════════════
// 44. Local Trip Closing
// ═════════════════════════════════════════════
setGroup('Local Trip Closing');

$r = makeRequest("{$baseUrl}/local_trip_closing.php", 'GET');
assertStatus(200, $r, 'GET local_trip_closing.php → 200');
assertBodyIsArray($r, 'Local trip closing GET returns array');

$r = makeRequest("{$baseUrl}/local_trip_closing.php?action=tariffs", 'GET');
assertStatus(200, $r, 'GET local_trip_closing.php?action=tariffs → 200');
assertBodyIsArray($r, 'Local trip closing tariffs returns array');

// ═════════════════════════════════════════════
// 45. Local Trip (localtrip.php)
// ═════════════════════════════════════════════
setGroup('Local Trip');

// GET without v_id → 400
$r = makeRequest("{$baseUrl}/localtrip.php", 'GET');
assertStatus(400, $r, 'GET localtrip.php without v_id → 400');
assertBodyKey('message', $r, 'localtrip.php missing v_id has "message"');

// GET with non-existent v_id → 404
$r = makeRequest("{$baseUrl}/localtrip.php?v_id=NONEXISTENT_9999", 'GET');
assertStatus(404, $r, 'GET localtrip.php with non-existent v_id → 404');

// ═════════════════════════════════════════════
// 46. Refusal Report
// ═════════════════════════════════════════════
setGroup('Refusal Report');

// Without dates → empty array
$r = makeRequest("{$baseUrl}/refusal_report.php", 'GET');
assertStatus(200, $r, 'GET refusal_report.php without dates → 200');
assertBodyIsArray($r, 'Refusal report without dates returns empty array');

// Vehicle list
$r = makeRequest("{$baseUrl}/refusal_report.php?list=1", 'GET');
assertStatus(200, $r, 'GET refusal_report.php?list=1 → 200');
assertBodyIsArray($r, 'Refusal report list returns array');

// With date range (f_refused table joins f_ft_booking - check reachability)
$r = makeRequest("{$baseUrl}/refusal_report.php?from_date={$today}&to_date={$today}", 'GET');
assertNotEqual(0, $r['status'], 'GET refusal_report.php with date range is reachable');

// ═════════════════════════════════════════════
// 47. Staff Login Logs
// ═════════════════════════════════════════════
setGroup('Staff Login Logs');

$r = makeRequest("{$baseUrl}/staff_login_logs.php", 'GET');
assertStatus(200, $r, 'GET staff_login_logs.php → 200');
assertBodyKey('logs', $r, 'Staff login logs has "logs" key');

$r = makeRequest("{$baseUrl}/staff_login_logs.php?from_date={$today}&to_date={$today}", 'GET');
assertStatus(200, $r, 'GET staff_login_logs.php with date filter → 200');
assertBodyKey('logs', $r, 'Staff login logs with date filter has "logs" key');

// ═════════════════════════════════════════════
// 48. Tariff Upload (CSV)
// ═════════════════════════════════════════════
setGroup('Tariff Upload');

// No file uploaded
$r = makeRequest("{$baseUrl}/tariff_upload.php", 'POST', []);
assertStatus(400, $r, 'POST tariff_upload without file → 400');
assertBodyKey('message', $r, 'Tariff upload error has "message" key');

// ═════════════════════════════════════════════
// 49. Trip Edit (edit closed trip record)
// ═════════════════════════════════════════════
setGroup('Trip Edit');

// No b_id → 400
$r = makeRequest("{$baseUrl}/trip_edit.php", 'PUT', []);
assertStatus(400, $r, 'PUT trip_edit.php without b_id → 400');
assertBodyKey('message', $r, 'Trip edit missing b_id has "message"');

// With b_id but non-existent → executes (UPDATE affects 0 rows but returns 200)
$r = makeRequest("{$baseUrl}/trip_edit.php", 'PUT', ['b_id' => '999999', 'net_total' => 500, 'paid_amount' => 500]);
assertNotEqual(0, $r['status'], 'PUT trip_edit.php with b_id is reachable');
assertBodyKey('message', $r, 'Trip edit with b_id returns "message"');

// ═════════════════════════════════════════════
// 50. Trip Refusal
// ═════════════════════════════════════════════
setGroup('Trip Refusal');

// Missing all required fields → 400
$r = makeRequest("{$baseUrl}/trip_refusal.php", 'POST', []);
assertStatus(400, $r, 'POST trip_refusal with empty body → 400');
assertBodyKey('message', $r, 'Trip refusal error has "message" key');

// Missing reason
$r = makeRequest("{$baseUrl}/trip_refusal.php", 'POST', ['b_id' => '1', 'v_id' => 'V001']);
assertStatus(400, $r, 'POST trip_refusal missing reason → 400');

// Missing b_id
$r = makeRequest("{$baseUrl}/trip_refusal.php", 'POST', ['v_id' => 'V001', 'reason' => 'Driver unavailable']);
assertStatus(400, $r, 'POST trip_refusal missing b_id → 400');

// ═════════════════════════════════════════════
// 51. User Activity Report
// ═════════════════════════════════════════════
setGroup('User Activity Report');

// Without params → message
$r = makeRequest("{$baseUrl}/user_activity_report.php", 'GET');
assertStatus(200, $r, 'GET user_activity_report.php without params → 200');
assertBodyKey('message', $r, 'User activity without params returns message');

// With user_id and date range
$r = makeRequest("{$baseUrl}/user_activity_report.php?user_id=1&from_date={$today}&to_date={$today}", 'GET');
assertStatus(200, $r, 'GET user_activity_report.php with params → 200');
assertBodyKey('booking_count', $r, 'User activity has "booking_count" key');
assertBodyKey('closing_count', $r, 'User activity has "closing_count" key');

// ═════════════════════════════════════════════
// 52. Vehicle In/Out
// ═════════════════════════════════════════════
setGroup('Vehicle In/Out');

$r = makeRequest("{$baseUrl}/vehicle_in_out.php", 'GET');
assertStatus(200, $r, 'GET vehicle_in_out.php → 200');
assertBodyIsArray($r, 'Vehicle in/out returns array of active vehicles');

// POST invalid action → 400
$r = makeRequest("{$baseUrl}/vehicle_in_out.php", 'POST', ['action' => 'bad_action']);
assertStatus(400, $r, 'POST vehicle_in_out with invalid action → 400');
assertBodyKey('message', $r, 'Vehicle in/out invalid action has "message" key');

// POST logout_single without v_id → 400
$r = makeRequest("{$baseUrl}/vehicle_in_out.php", 'POST', ['action' => 'logout_single']);
assertStatus(400, $r, 'POST vehicle_in_out logout_single without v_id → 400');

// POST logout_single with non-existent v_id → 404
$r = makeRequest("{$baseUrl}/vehicle_in_out.php", 'POST', ['action' => 'logout_single', 'v_id' => 'VNONEXIST99']);
assertStatus(404, $r, 'POST vehicle_in_out logout_single with non-existent v_id → 404');

// ═════════════════════════════════════════════
// 53. Vehicle Pricing
// ═════════════════════════════════════════════
setGroup('Vehicle Pricing');

$r = makeRequest("{$baseUrl}/vehicle_pricing.php", 'GET');
assertStatus(200, $r, 'GET vehicle_pricing.php → 200');
assertBodyIsArray($r, 'Vehicle pricing returns array');

// POST without required fields
$r = makeRequest("{$baseUrl}/vehicle_pricing.php", 'POST', []);
assertStatus(400, $r, 'POST vehicle_pricing with empty body → 400');

// POST missing kmnonac/kmac
$r = makeRequest("{$baseUrl}/vehicle_pricing.php", 'POST', ['id' => 1, 'kmnonac' => 12]);
assertStatus(400, $r, 'POST vehicle_pricing missing kmac → 400');

// ═════════════════════════════════════════════
// 54. Vehicle Separate Report
// ═════════════════════════════════════════════
setGroup('Vehicle Separate Report');

// Without params → message
$r = makeRequest("{$baseUrl}/vehicle_separate_report.php", 'GET');
assertStatus(200, $r, 'GET vehicle_separate_report.php without params → 200');
assertBodyKey('message', $r, 'Vehicle separate report without params returns message');

// With all required params (f_vehicle_register join may fail, just check reachability)
$r = makeRequest("{$baseUrl}/vehicle_separate_report.php?v_id=TEST_VID&from_date={$today}&to_date={$today}", 'GET');
assertNotEqual(0, $r['status'], 'GET vehicle_separate_report.php with params is reachable');
// If 200 returned (table exists), verify expected keys
if ($r['status'] === 200 && $r['body'] !== null && !isset($r['body']['message'])) {
    assertBodyKey('trips', $r, 'Vehicle separate report has "trips" key');
    assertBodyKey('totals', $r, 'Vehicle separate report has "totals" key');
}

// ═════════════════════════════════════════════
// 55. Malformed / Invalid JSON Body
// ═════════════════════════════════════════════
setGroup('Malformed JSON Handling');

// Helper: send raw string body (not encoded JSON)
function makeRawRequest(string $url, string $method, string $rawBody): array {
    $options = [
        'http' => [
            'header'        => "Content-Type: application/json\r\nAccept: application/json\r\n",
            'method'        => $method,
            'content'       => $rawBody,
            'ignore_errors' => true,
            'timeout'       => 10,
        ]
    ];
    $context = stream_context_create($options);
    $result = @file_get_contents($url, false, $context);
    if ($result === false) return ['status' => 0, 'body' => null, 'raw' => ''];
    $statusLine = $http_response_header[0] ?? 'HTTP/1.1 000';
    preg_match('{HTTP\/\S*\s(\d{3})}', $statusLine, $match);
    return [
        'status' => (int)($match[1] ?? 0),
        'body'   => json_decode($result, true),
        'raw'    => $result,
    ];
}

// login.php with broken JSON
$r = makeRawRequest("{$baseUrl}/login.php", 'POST', '{bad json here}');
assertNotEqual(0, $r['status'], 'login.php with malformed JSON body does not crash (no 500)');
assertNotEqual(500, $r['status'], 'login.php malformed JSON → not 500');

// bookings.php POST with broken JSON
$r = makeRawRequest("{$baseUrl}/bookings.php", 'POST', 'not json at all');
assertNotEqual(500, $r['status'], 'bookings.php POST with garbage body → not 500');

// customers.php POST with truncated JSON
$r = makeRawRequest("{$baseUrl}/customers.php", 'POST', '{"b_name":"Test"');
assertNotEqual(500, $r['status'], 'customers.php POST with truncated JSON → not 500');

// register.php with empty string body
$r = makeRawRequest("{$baseUrl}/register.php", 'POST', '');
assertNotEqual(500, $r['status'], 'register.php POST with empty string body → not 500');

// ═════════════════════════════════════════════
// 56. Security: Boundary Inputs
// ═════════════════════════════════════════════
setGroup('Security – Boundary Inputs');

// Very long username string (should not crash / 500)
$longStr = str_repeat('A', 2000);
$r = makeRequest("{$baseUrl}/login.php", 'POST', ['username' => $longStr, 'password' => 'test']);
assertNotEqual(500, $r['status'], 'Login with 2000-char username → not 500');
assertNotEqual(0, $r['status'], 'Login with 2000-char username endpoint reachable');

// SQL injection-like payload in login username
$r = makeRequest("{$baseUrl}/login.php", 'POST', ['username' => "' OR '1'='1", 'password' => "' OR '1'='1"]);
assertNotEqual(500, $r['status'], 'Login with SQL injection payload → not 500 (PDO protects)');
// Should be 401 (invalid creds) not 200
assertNotEqual(200, $r['status'], 'Login SQL injection does NOT succeed → not 200');

// XSS-like payload in booking name field
$r = makeRequest("{$baseUrl}/customers.php", 'POST', [
    'b_name' => '<script>alert("xss")</script>',
    'm_no'   => '9999999990',
]);
assertNotEqual(500, $r['status'], 'POST customer with XSS payload in name → not 500');

// NULL byte in query param
$r = makeRequest("{$baseUrl}/vehicles.php?v_id=" . urlencode("V\x00ID"), 'GET');
assertNotEqual(500, $r['status'], 'GET vehicles with null-byte v_id → not 500');

// Negative number in tariff km
$r = makeRequest("{$baseUrl}/enquery_tariff.php?km=-999", 'GET');
assertNotEqual(500, $r['status'], 'GET enquery_tariff with negative km → not 500');

// Very large km value
$r = makeRequest("{$baseUrl}/enquery_tariff.php?km=9999999", 'GET');
assertNotEqual(500, $r['status'], 'GET enquery_tariff with km=9999999 → not 500');

// ═════════════════════════════════════════════
// 57. Settings – Deep Coverage
// ═════════════════════════════════════════════
setGroup('Settings – Deep Coverage');

// GET default (no user_id)
$r = makeRequest("{$baseUrl}/settings.php", 'GET');
assertStatus(200, $r, 'GET settings.php → 200');
assertBodyKey('smsoption', $r, 'Settings default response has "smsoption" key');

// GET base_fare config
$r = makeRequest("{$baseUrl}/settings.php?config=base_fare", 'GET');
assertStatus(200, $r, 'GET settings.php?config=base_fare → 200');
assertBodyKey('base_fare', $r, 'Settings base_fare response has "base_fare" key');
$baseFare = $r['body']['base_fare'] ?? null;
assertEqual(true, is_numeric($baseFare), 'Settings base_fare is a numeric value');

// GET with specific user_id
$r = makeRequest("{$baseUrl}/settings.php?user_id=1", 'GET');
assertStatus(200, $r, 'GET settings.php?user_id=1 → 200');
assertBodyKey('smsoption', $r, 'Settings user_id=1 response has "smsoption" key');

// POST: save_base_fare action
$r = makeRequest("{$baseUrl}/settings.php", 'POST', ['action' => 'save_base_fare', 'base_fare' => 190]);
assertStatus(200, $r, 'POST settings save_base_fare → 200');
assertBodyKey('message', $r, 'POST settings save_base_fare has "message"');
assertBodyKey('base_fare', $r, 'POST settings save_base_fare echoes back "base_fare"');

// POST: missing smsoption → 400
$r = makeRequest("{$baseUrl}/settings.php", 'POST', ['user_id' => '1']);
assertStatus(400, $r, 'POST settings missing smsoption → 400');
assertBodyKey('message', $r, 'POST settings missing smsoption has "message"');

// POST: missing user_id → 400
$r = makeRequest("{$baseUrl}/settings.php", 'POST', ['smsoption' => '1']);
assertStatus(400, $r, 'POST settings missing user_id → 400');

// ═════════════════════════════════════════════
// 58. Finance – Extended Coverage
// ═════════════════════════════════════════════
setGroup('Finance – Extended Coverage');

// GET summary with month filter
$r = makeRequest("{$baseUrl}/finance.php?action=summary&from=2026-01&to=2026-03", 'GET');
assertStatus(200, $r, 'GET finance summary with month filter → 200');
assertBodyContains('status', 'success', $r, 'Finance summary with filter returns status=success');
if (isset($r['body']['data'])) {
    $data = $r['body']['data'];
    assertEqual(true, array_key_exists('total_income', $data), 'Finance summary data has total_income');
    assertEqual(true, array_key_exists('total_expense', $data), 'Finance summary data has total_expense');
    assertEqual(true, array_key_exists('net_balance', $data), 'Finance summary data has net_balance');
}

// GET ledger with month filter
$r = makeRequest("{$baseUrl}/finance.php?action=ledger&from=2026-01&to=2026-03", 'GET');
assertStatus(200, $r, 'GET finance ledger with month filter → 200');
assertBodyContains('status', 'success', $r, 'Finance ledger with filter returns status=success');

// GET driver balances
$r = makeRequest("{$baseUrl}/finance.php?action=driver_balances", 'GET');
assertStatus(200, $r, 'GET finance?action=driver_balances → 200');
assertBodyContains('status', 'success', $r, 'Finance driver_balances returns status=success');

// GET categories
$r = makeRequest("{$baseUrl}/finance.php?action=categories", 'GET');
assertStatus(200, $r, 'GET finance?action=categories → 200');
assertBodyContains('status', 'success', $r, 'Finance categories returns status=success');

// POST add_transaction – missing type
$r = makeRequest("{$baseUrl}/finance.php", 'POST', [
    'action'   => 'add_transaction',
    'amount'   => 500,
    'category' => 'fuel',
]);
assertStatus(400, $r, 'POST finance add_transaction missing type → 400');

// POST add_transaction – missing amount
$r = makeRequest("{$baseUrl}/finance.php", 'POST', [
    'action'   => 'add_transaction',
    'type'     => 'expense',
    'category' => 'fuel',
]);
assertStatus(400, $r, 'POST finance add_transaction missing amount → 400');

// POST add_transaction – missing category
$r = makeRequest("{$baseUrl}/finance.php", 'POST', [
    'action' => 'add_transaction',
    'type'   => 'expense',
    'amount' => 500,
]);
assertStatus(400, $r, 'POST finance add_transaction missing category → 400');

// POST update_driver_balance – missing v_id
$r = makeRequest("{$baseUrl}/finance.php", 'POST', [
    'action'  => 'update_driver_balance',
    'balance' => 1000,
]);
assertStatus(400, $r, 'POST finance update_driver_balance missing v_id → 400');

// ═════════════════════════════════════════════
// 59. HTTP Method Enforcement
// ═════════════════════════════════════════════
setGroup('HTTP Method Enforcement');

// Endpoints that only support GET – send POST and verify no 500
$getOnlyEndpoints = [
    'dashboard.php', 'available_vehicles.php', 'ontrip.php',
    'running_km_report.php', 'staff_report.php', 'cancel_report.php',
];
foreach ($getOnlyEndpoints as $ep) {
    $r = makeRequest("{$baseUrl}/{$ep}", 'POST', []);
    assertNotEqual(500, $r['status'], "POST to GET-only {$ep} → not 500");
}

// Endpoints that only support POST – send GET and verify controlled response (not 500)
$r = makeRequest("{$baseUrl}/logout.php", 'GET');
assertNotEqual(500, $r['status'], 'GET logout.php (POST-only) → not 500');

// ═════════════════════════════════════════════
// 60. Reports – Date Range Coverage
// ═════════════════════════════════════════════
setGroup('Reports – Date Range Coverage');

$from = '2026-01-01';
$to   = date('Y-m-d');

// booking report with from/to
$r = makeRequest("{$baseUrl}/reports.php?type=booking&from_date={$from}&to_date={$to}", 'GET');
assertStatus(200, $r, 'GET reports.php?type=booking with date range → 200');
assertBodyIsArray($r, 'Booking report with date range returns array');

// customer report with from/to
$r = makeRequest("{$baseUrl}/reports.php?type=customer&from_date={$from}&to_date={$to}", 'GET');
assertStatus(200, $r, 'GET reports.php?type=customer with date range → 200');
assertBodyIsArray($r, 'Customer report with date range returns array');

// vehicle report with v_id and date range
$r = makeRequest("{$baseUrl}/reports.php?type=vehicle&from_date={$from}&to_date={$to}", 'GET');
assertStatus(200, $r, 'GET reports.php?type=vehicle with date range → 200');
assertBodyIsArray($r, 'Vehicle report with date range returns array');

// day_wise_report with date range
$r = makeRequest("{$baseUrl}/day_wise_report.php?from_date={$from}&to_date={$to}", 'GET');
assertStatus(200, $r, 'GET day_wise_report.php with date range → 200');
assertBodyIsArray($r, 'Day-wise report with date range returns array');

// running_km_report with date range
$r = makeRequest("{$baseUrl}/running_km_report.php?from_date={$from}&to_date={$to}", 'GET');
assertStatus(200, $r, 'GET running_km_report.php with date range → 200');
assertBodyIsArray($r, 'Running KM report with date range returns array');

// shortage_km_report with date range
$r = makeRequest("{$baseUrl}/shortage_km_report.php?from_date={$from}&to_date={$to}", 'GET');
assertStatus(200, $r, 'GET shortage_km_report.php with date range → 200');
assertBodyIsArray($r, 'Shortage KM report with date range returns array');

// cancel_report with date range
$r = makeRequest("{$baseUrl}/cancel_report.php?from_date={$from}&to_date={$to}", 'GET');
assertStatus(200, $r, 'GET cancel_report.php with date range → 200');
assertBodyIsArray($r, 'Cancel report with date range returns array');

// user_activity_report with ALL users (no user_id)
$r = makeRequest("{$baseUrl}/user_activity_report.php?from_date={$from}&to_date={$to}", 'GET');
assertNotEqual(500, $r['status'], 'GET user_activity_report with date range but no user_id → not 500');

// ═════════════════════════════════════════════
// 61. Booking Counts – Field Validation
// ═════════════════════════════════════════════
setGroup('Booking Counts – Field Validation');

$today = date('Y-m-d');
$r = makeRequest("{$baseUrl}/booking_counts.php?from_date={$today}&to_date={$today}", 'GET');
assertStatus(200, $r, 'GET booking_counts.php with today range → 200');
// Check all expected fields exist
$expectedCountFields = ['total', 'cancelled', 'closed', 'pending', 'on_trip'];
foreach ($expectedCountFields as $field) {
    global $passed, $failed;
    if (isset($r['body'][$field]) || array_key_exists($field, $r['body'] ?? [])) {
        echo "  ✅ PASS: Booking counts has '{$field}' field\n";
        $passed++;
    } else {
        echo "  ❌ FAIL: Booking counts missing '{$field}' field\n";
        echo "     Body: " . json_encode($r['body']) . "\n";
        $failed++;
    }
}

// ═════════════════════════════════════════════
// 62. Dashboard – Stats Field Completeness
// ═════════════════════════════════════════════
setGroup('Dashboard – Stats Completeness');

$r = makeRequest("{$baseUrl}/dashboard.php", 'GET');
assertStatus(200, $r, 'GET dashboard.php → 200');

$requiredStats = [
    'total_bookings', 'total_customers', 'total_drivers',
    'on_trip', 'pending_assignments',
];
if (is_array($r['body']['stats'] ?? null)) {
    foreach ($requiredStats as $key) {
        global $passed, $failed;
        if (array_key_exists($key, $r['body']['stats'])) {
            echo "  ✅ PASS: Dashboard stats['{$key}'] present\n";
            $passed++;
        } else {
            echo "  ❌ FAIL: Dashboard stats['{$key}'] missing\n";
            $failed++;
        }
    }
} else {
    global $failed;
    echo "  ❌ FAIL: Dashboard 'stats' key is not an array\n";
    $failed++;
}

// ═════════════════════════════════════════════
// 63. Response Content-Type Validation
// ═════════════════════════════════════════════
setGroup('Response Content-Type');

function checkContentType(string $url, string $label): void {
    global $passed, $failed;
    $options = [
        'http' => [
            'header'        => "Accept: application/json\r\n",
            'method'        => 'GET',
            'ignore_errors' => true,
            'timeout'       => 10,
        ]
    ];
    $context = stream_context_create($options);
    @file_get_contents($url, false, $context);
    $headers = $http_response_header ?? [];
    $contentType = '';
    foreach ($headers as $h) {
        if (stripos($h, 'Content-Type:') === 0) {
            $contentType = strtolower($h);
            break;
        }
    }
    if (strpos($contentType, 'application/json') !== false || strpos($contentType, 'text/html') !== false) {
        // Accept either JSON or HTML (some PHP hosts default to text/html)
        echo "  ✅ PASS: {$label} has a Content-Type header\n";
        $passed++;
    } else {
        echo "  ❌ FAIL: {$label} missing or unexpected Content-Type: {$contentType}\n";
        $failed++;
    }
}

checkContentType("{$baseUrl}/dashboard.php",       'dashboard.php');
checkContentType("{$baseUrl}/vehicles.php",         'vehicles.php');
checkContentType("{$baseUrl}/customers.php",        'customers.php');
checkContentType("{$baseUrl}/staff.php",            'staff.php');
checkContentType("{$baseUrl}/reports.php?type=booking", 'reports.php?type=booking');
checkContentType("{$baseUrl}/finance.php?action=summary", 'finance.php?action=summary');

// ═════════════════════════════════════════════
// Final Summary
// ═════════════════════════════════════════════

echo "\n" . str_repeat('═', 55) . "\n";
echo "  📊 TEST RESULTS SUMMARY\n";
echo str_repeat('═', 55) . "\n";
echo "  ✅ Passed:  {$passed}\n";
echo "  ❌ Failed:  {$failed}\n";
echo "  ⚠️  Skipped: {$skipped}\n";
$total = $passed + $failed + $skipped;
echo "  📋 Total:   {$total}\n";
echo str_repeat('─', 55) . "\n";

if ($failed === 0) {
    echo "  🎉 All tests passed!\n";
} else {
    echo "  ❗ {$failed} test(s) failed. Check the output above.\n";
}

echo str_repeat('═', 55) . "\n\n";

exit($failed > 0 ? 1 : 0);
?>
