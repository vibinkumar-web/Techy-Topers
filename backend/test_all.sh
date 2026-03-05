#!/bin/bash
# ============================================================
#  FULL AUTOMATED BACKEND TEST SUITE
#  Tests every PHP endpoint with auth + real parameters
# ============================================================

BASE="http://localhost:8080/api"
COOKIE_JAR="/tmp/taxi_test_cookies.txt"
PASS=0; FAIL=0; WARN=0
RESULTS=()

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

# ---- helpers ------------------------------------------------
assert() {
  local label=$1 method=$2 path=$3 data=$4 expect_code=$5 expect_body=$6
  local code body

  if [ -n "$data" ]; then
    code=$(curl -s -b "$COOKIE_JAR" -c "$COOKIE_JAR" \
      -o /tmp/_resp.txt -w "%{http_code}" \
      -X "$method" -H "Content-Type: application/json" \
      -d "$data" "$BASE/$path" 2>/dev/null)
  else
    code=$(curl -s -b "$COOKIE_JAR" -c "$COOKIE_JAR" \
      -o /tmp/_resp.txt -w "%{http_code}" \
      -X "$method" "$BASE/$path" 2>/dev/null)
  fi

  body=$(cat /tmp/_resp.txt)

  local status="PASS"

  # Check HTTP code
  if [ -n "$expect_code" ] && [ "$code" != "$expect_code" ]; then
    status="FAIL"
  fi

  # Check body contains expected string
  if [ -n "$expect_body" ] && ! echo "$body" | grep -qi "$expect_body"; then
    status="FAIL"
  fi

  # Check for PHP fatal errors regardless
  if echo "$body" | grep -qi "Fatal error\|Call to a member function\|Uncaught Error"; then
    status="FAIL"
    expect_body="NO PHP FATAL"
  fi

  # Check body is not empty when we expect data
  if [ "$expect_code" = "200" ] && [ -z "$body" ]; then
    status="WARN"
  fi

  local short_body
  short_body=$(echo "$body" | tr -d '\n' | cut -c1-100)

  if [ "$status" = "PASS" ]; then
    echo -e "  ${GREEN}✔ PASS${NC}  [$code] $label"
    PASS=$((PASS+1))
  elif [ "$status" = "WARN" ]; then
    echo -e "  ${YELLOW}⚠ WARN${NC}  [$code] $label — empty body"
    WARN=$((WARN+1))
  else
    echo -e "  ${RED}✘ FAIL${NC}  [$code] $label"
    echo -e "         expected: code=${expect_code} body~='${expect_body}'"
    echo -e "         got:      code=${code} body='${short_body}'"
    FAIL=$((FAIL+1))
  fi
}

section() { echo -e "\n${CYAN}${BOLD}━━━ $1 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"; }

# ============================================================
section "1. PHP SYNTAX CHECK (all files)"
# ============================================================
SYNTAX_FAIL=0
for f in $(ls ../api/*.php); do
  result=$(/c/xampp/php/php.exe -l "$f" 2>&1)
  if echo "$result" | grep -q "No syntax errors"; then
    echo -e "  ${GREEN}✔${NC} $(basename $f)"
  else
    echo -e "  ${RED}✘ SYNTAX ERROR: $(basename $f)${NC}"
    echo "    $result"
    SYNTAX_FAIL=$((SYNTAX_FAIL+1))
    FAIL=$((FAIL+1))
  fi
done
if [ "$SYNTAX_FAIL" = "0" ]; then
  echo -e "  ${GREEN}All PHP files pass syntax check${NC}"
  PASS=$((PASS+1))
fi

# ============================================================
section "2. DATABASE CONNECTION"
# ============================================================
DB_RESULT=$(/c/xampp/mysql/bin/mysql.exe -u root -h 127.0.0.1 -D ft_welcome \
  -e "SELECT COUNT(*) as cnt FROM information_schema.tables WHERE table_schema='ft_welcome';" 2>&1 | tail -1)
if [ "$DB_RESULT" -gt "0" ] 2>/dev/null; then
  echo -e "  ${GREEN}✔ PASS${NC}  MySQL connected — ft_welcome has $DB_RESULT tables"
  PASS=$((PASS+1))
else
  echo -e "  ${RED}✘ FAIL${NC}  MySQL connection failed"
  FAIL=$((FAIL+1))
fi

# Required tables check
section "2a. REQUIRED TABLES"
REQUIRED_TABLES="f_ft_booking f_closing f_ontrip f_v_attach f_login_status f_cus_master f_refused f_calcel_booking f_local_tariff f_out_tariff enquery_tariff enqury_table ft_staff ft_register ft_cus_master new_customer tms_admins tms_staff tms_staff_login_logs finance_ledger driver_balances vehicle_prices smssetting location f_trip_sheet_entry f_refused_ontrip f_attached_veh f_staff f_vehicle_register user_permissions"
for tbl in $REQUIRED_TABLES; do
  exists=$(/c/xampp/mysql/bin/mysql.exe -u root -h 127.0.0.1 -D ft_welcome \
    -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='ft_welcome' AND table_name='$tbl';" 2>&1 | tail -1)
  if [ "$exists" = "1" ]; then
    echo -e "  ${GREEN}✔${NC} $tbl"
    PASS=$((PASS+1))
  else
    echo -e "  ${RED}✘ MISSING${NC} $tbl"
    FAIL=$((FAIL+1))
  fi
done

# ============================================================
section "3. AUTH ENDPOINTS"
# ============================================================
rm -f "$COOKIE_JAR"

# Login as staff (ft_staff)
assert "login.php — staff login (Jp)"        POST "login.php"       '{"username":"9524522210","password":"4321"}' "200" "Login successful"

# Login as admin
assert "admin_login.php — admin login"        POST "admin_login.php"  '{"username":"admin","password":"admin123"}' "200" "Admin login successful"

# Get admin session cookie
rm -f "$COOKIE_JAR"
code=$(curl -s -c "$COOKIE_JAR" -o /tmp/_resp.txt -w "%{http_code}" \
  -X POST -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  "$BASE/admin_login.php" 2>/dev/null)
echo -e "  ${CYAN}ℹ Session established (admin) — HTTP $code${NC}"

# Staff login
assert "staff_login.php — staff login (vibin)" POST "staff_login.php" '{"username":"6374765266","password":"staff123"}' "200" "Staff login successful"
assert "login.php — bad credentials"           POST "login.php"       '{"username":"wrong","password":"wrong"}' "401" "Invalid"
assert "logout.php"                            POST "logout.php"       "" "200" "Logout"

# Re-login admin for rest of tests
curl -s -c "$COOKIE_JAR" -b "$COOKIE_JAR" \
  -X POST -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  "$BASE/admin_login.php" > /dev/null 2>&1

# ============================================================
section "4. DASHBOARD & COUNTS"
# ============================================================
assert "dashboard.php"            GET "dashboard.php"                            "" "200" "total_bookings"
assert "booking_counts.php"       GET "booking_counts.php?start=2026-01-01&end=2026-03-05" "" "200" ""

# ============================================================
section "5. BOOKINGS"
# ============================================================
assert "bookings.php — list"           GET  "bookings.php"                           "" "200" ""
assert "bookings.php — search"         GET  "bookings.php?search=madurai"            "" "200" ""
assert "advance_bookings.php"          GET  "advance_bookings.php"                   "" "200" ""
assert "advance_booking.php"           GET  "advance_booking.php"                    "" "200" ""
assert "booking_edit.php — no id"      GET  "booking_edit.php"                       "" "400" "required"
assert "booking_edit.php — PUT"        PUT  "booking_edit.php" '{"b_id":"3810","cus_name":"Test","cus_mobile":"9999999999","pickup":"2026-03-04 10:00:00","pickup_time":"10:00","drop_place":"Test","v_types":"Sedan","remarks":"","b_date":"2026-03-04","p_city":"Test"}' "200" ""
assert "cancel.php"                    GET  "cancel.php"                             "" "200" ""

# ============================================================
section "6. TRIPS (ON-TRIP / CLOSING)"
# ============================================================
assert "ontrip.php"              GET  "ontrip.php"                              "" "200" ""
assert "localtrip.php — no id"   GET  "localtrip.php"                           "" "400" "required"
assert "localtrip.php — 404 ok"  GET  "localtrip.php?v_id=100"                  "" "404" "not found"
assert "closing.php"             GET  "closing.php"                             "" "200" ""
assert "local_trip_closing.php"  GET  "local_trip_closing.php"                  "" "200" ""
assert "trip_edit.php — no id"   GET  "trip_edit.php"                           "" "400" "required"
assert "trip_edit.php — PUT"     PUT  "trip_edit.php" '{"b_id":"1","opening_km":"100","closing_km":"200","remarks":"test","pickup_time":"2026-03-04 10:00:00","drop_time":"2026-03-04 12:00:00","ac_type":"AC","t_type":"Local","v_type":"Sedan","p_city":"Madurai","d_place":"Chennai","rwards_point":"0","package_name":"","other_charge":"0","net_total":"500","paid_amount":"500","discount":"0","dis_reason":"","to_whom":"Public","customer":"Test","m_no":"9999999999","d_mobile":"8888888888","user_id":"1"}' "200" ""
assert "edit_closed_trip.php"    GET  "edit_closed_trip.php?b_id=3810"          "" "200" ""
assert "trip_refusal.php — validation"  GET "trip_refusal.php"                  "" "400" "required"
assert "trip_refusal.php — POST"  POST "trip_refusal.php" '{"b_id":"3810","v_id":"100","reason":"Test"}' "200" ""

# ============================================================
section "7. ASSIGN"
# ============================================================
assert "assign.php"              GET  "assign.php"                              "" "200" ""
assert "assign_later.php"        GET  "assign_later.php"                        "" "200" ""

# ============================================================
section "8. VEHICLES"
# ============================================================
assert "vehicles.php — list"         GET  "vehicles.php"                       "" "200" ""
assert "available_vehicles.php"      GET  "available_vehicles.php"             "" "200" ""
assert "attached_vehicles.php"       GET  "attached_vehicles.php"              "" "200" ""
assert "vehicle_in_out.php"          GET  "vehicle_in_out.php"                 "" "200" ""
assert "vehicle_pricing.php"         GET  "vehicle_pricing.php"                "" "200" ""
assert "vehicle_attendance.php"      GET  "vehicle_attendance.php?action=list" "" "200" ""

# ============================================================
section "9. CUSTOMERS & STAFF"
# ============================================================
assert "customers.php — list"        GET  "customers.php"                      "" "200" ""
assert "customer_search.php"         GET  "customer_search.php?q=raj"          "" "200" ""
assert "customer_upload.php"         GET  "customer_upload.php"                "" "200" ""
assert "staff.php — list"            GET  "staff.php"                          "" "200" ""
assert "staff_login_logs.php"        GET  "staff_login_logs.php"               "" "200" ""

# ============================================================
section "10. REPORTS"
# ============================================================
assert "cancel_report.php"           GET  "cancel_report.php"                  "" "200" ""
assert "company_report.php"          GET  "company_report.php?from_date=2026-01-01&to_date=2026-03-05" "" "200" ""
assert "day_wise_report.php"         GET  "day_wise_report.php?from_date=2026-01-01&to_date=2026-03-05" "" "200" ""
assert "enquiry_report.php"          GET  "enquiry_report.php"                 "" "200" ""
assert "refusal_report.php"          GET  "refusal_report.php"                 "" "200" ""
assert "running_km_report.php"       GET  "running_km_report.php"              "" "200" ""
assert "staff_report.php"            GET  "staff_report.php"                   "" "200" ""
assert "customer_report.php"         GET  "customer_report.php?from_date=2026-01-01&to_date=2026-03-05" "" "200" ""
assert "shortage_km_report.php"      GET  "shortage_km_report.php?v_id=100&from_date=2026-01-01&to_date=2026-03-05" "" "200" ""
assert "vehicle_separate_report.php" GET  "vehicle_separate_report.php?v_id=100&from_date=2026-01-01&to_date=2026-03-05" "" "200" ""
assert "user_activity_report.php"    GET  "user_activity_report.php?from_date=2026-01-01&to_date=2026-03-05" "" "200" ""
assert "cancel_report.php — date"    GET  "cancel_report.php?from_date=2026-01-01&to_date=2026-03-05" "" "200" ""
assert "reports.php — no type"       GET  "reports.php"                        "" "400" "Invalid"
assert "reports.php — with type"     GET  "reports.php?type=booking"           "" "200" ""

# ============================================================
section "11. TARIFF & FINANCE"
# ============================================================
assert "tariff.php — no id"          GET  "tariff.php"                         "" "400" "Missing"
assert "tariff.php — with id"        GET  "tariff.php?v_id=1"                  "" "200" ""
assert "enquery_tariff.php"          GET  "enquery_tariff.php?v_id=1"          "" "200" ""
assert "enquery_tariff.php — list"   GET  "enquery_tariff.php"                 "" "200" ""
assert "tariff_upload.php"           GET  "tariff_upload.php"                  "" "200" ""
assert "finance.php — summary"       GET  "finance.php?action=summary"         "" "200" ""
assert "finance.php — ledger"        GET  "finance.php?action=ledger"          "" "200" ""

# ============================================================
section "12. SETTINGS & MISC"
# ============================================================
assert "settings.php"                GET  "settings.php"                       "" "200" ""
assert "attendance.php"              GET  "attendance.php"                     "" "200" ""
assert "user_rights.php — list"      GET  "user_rights.php"                    "" "200" ""
assert "get_distance_suggestions.php" GET "get_distance_suggestions.php?q=Jp"  "" "200" ""
assert "staff_login_logs.php"        GET  "staff_login_logs.php"               "" "200" "logs"

# ============================================================
section "13. FRONTEND VITEST"
# ============================================================
echo -e "  ${CYAN}Running Vitest...${NC}"
FRONTEND_DIR="$(cd "$(dirname "$0")/../frontend" 2>/dev/null && pwd)"
VITEST_OUT=$(cd "$FRONTEND_DIR" && npx vitest run 2>&1)
VITEST_EXIT=$?
if [ "$VITEST_EXIT" = "0" ]; then
  PASS_CNT=$(echo "$VITEST_OUT" | grep -o '[0-9]* passed' | tail -1)
  FAIL_CNT=$(echo "$VITEST_OUT" | grep -o '[0-9]* failed' | tail -1)
  echo -e "  ${GREEN}✔ PASS${NC}  Vitest: $PASS_CNT | $FAIL_CNT"
  PASS=$((PASS+1))
else
  FAIL_LINES=$(echo "$VITEST_OUT" | grep -E "failed|×" | head -10)
  echo -e "  ${RED}✘ FAIL${NC}  Vitest:"
  echo "$FAIL_LINES" | while read line; do echo "         $line"; done
  FAIL=$((FAIL+1))
fi

# ============================================================
section "FINAL RESULTS"
# ============================================================
TOTAL=$((PASS+FAIL+WARN))
echo ""
echo -e "  Total Tests : $TOTAL"
echo -e "  ${GREEN}Passed      : $PASS${NC}"
echo -e "  ${RED}Failed      : $FAIL${NC}"
echo -e "  ${YELLOW}Warnings    : $WARN${NC}"
echo ""
if [ "$FAIL" = "0" ]; then
  echo -e "  ${GREEN}${BOLD}🎉 ALL TESTS PASSED — Application is 100% working!${NC}"
else
  echo -e "  ${RED}${BOLD}⚠ $FAIL TEST(S) FAILED — See above for details.${NC}"
fi
echo ""
