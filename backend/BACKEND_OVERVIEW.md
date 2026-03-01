# 🖥️ Backend Overview — Taxi Management System API

> PHP REST API · MySQL `ft_welcome` database · PDO queries

---

## 📁 Structure

```
backend/
├── api/              # 54 PHP REST endpoint files
├── config/
│   └── db.php        # DB connection class + CORS headers
├── debug/            # Diagnostic helpers
├── run_tests.php     # Full test suite
├── test_dashboard.php
├── test_db.php
└── test_api.js       # Node.js API sanity check
```

---

## ⚙️ Database Config (`config/db.php`)

```php
host     = '127.0.0.1'
db_name  = 'ft_welcome'
username = 'root'
password = ''          // ← update with your password
```

Every API file includes `config/db.php` which:
- Sets CORS headers (allowed origins: `localhost:5173/74/75`)
- Handles `OPTIONS` preflight with `200`
- Instantiates `$conn` (PDO connection)

---

## 🔌 All API Endpoints

Base URL: `http://localhost:8080/backend/api/`

### 🔑 Auth (7 endpoints)

| File | Method | Description |
|---|---|---|
| `login.php` | POST | User login → returns user + starts session |
| `register.php` | POST | User registration |
| `logout.php` | POST | End session |
| `admin_login.php` | POST | Admin login |
| `admin_register.php` | POST | Admin register |
| `staff_login.php` | POST | Staff login |
| `staff_register.php` | POST | Staff register |

### 📋 Bookings (7 endpoints)

| File | Method | Description |
|---|---|---|
| `bookings.php` | GET/POST | List & create bookings |
| `booking_edit.php` | POST | Edit a booking |
| `booking_counts.php` | GET | Count bookings by status |
| `advance_booking.php` | POST | Create advance booking |
| `advance_bookings.php` | GET | List advance bookings |
| `cancel.php` | POST | Cancel a booking |
| `trip_refusal.php` | POST | Log a driver refusal |

### 🚗 Assignments & Trips (8 endpoints)

| File | Method | Description |
|---|---|---|
| `assign.php` | POST | Assign driver + vehicle |
| `assign_later.php` | POST | Defer assignment |
| `ontrip.php` | GET/POST | Outstation trip management |
| `localtrip.php` | GET/POST | Local trip management |
| `local_trip_closing.php` | POST | Close local trip |
| `closing.php` | POST | Close outstation trip |
| `trip_edit.php` | POST | Edit open trip |
| `edit_closed_trip.php` | POST | Edit a closed trip |

### 🚙 Vehicles (6 endpoints)

| File | Method | Description |
|---|---|---|
| `vehicles.php` | GET/POST/PUT/DELETE | Full vehicle CRUD |
| `available_vehicles.php` | GET | List available vehicles |
| `attached_vehicles.php` | GET/POST | Partner vehicle management |
| `vehicle_attendance.php` | GET/POST | Vehicle attendance |
| `vehicle_in_out.php` | GET/POST | Check-in / check-out |
| `vehicle_pricing.php` | GET/POST | Per-vehicle pricing |

### 👥 Staff & Users (5 endpoints)

| File | Method | Description |
|---|---|---|
| `staff.php` | GET/POST/PUT/DELETE | Staff CRUD |
| `attendance.php` | GET/POST | Daily staff attendance |
| `staff_login_logs.php` | GET | Staff login history |
| `user_rights.php` | GET/POST | Role-based permissions |
| `user_activity_report.php` | GET | User activity audit |

### 💰 Tariff & Settings (6 endpoints)

| File | Method | Description |
|---|---|---|
| `tariff.php` | GET/POST/PUT/DELETE | Tariff/fare CRUD |
| `tariff_upload.php` | POST | Bulk tariff upload |
| `customer_upload.php` | POST | Bulk customer upload |
| `settings.php` | GET/POST | App settings |
| `enquery_tariff.php` | GET | Fare enquiry lookup |
| `get_distance_suggestions.php` | GET | Distance autocomplete |

### 👤 Customers (2 endpoints)

| File | Method | Description |
|---|---|---|
| `customers.php` | GET/POST | Customer list & add |
| `customer_search.php` | GET | Customer search |

### 💹 Finance (1 endpoint)

| File | Method | Description |
|---|---|---|
| `finance.php` | GET/POST | Finance ledger entries |

### 📊 Dashboard (1 endpoint)

| File | Method | Description |
|---|---|---|
| `dashboard.php` | GET | KPI summary (bookings, vehicles, revenue) |

### 📈 Reports (11 endpoints)

| File | Method | Description |
|---|---|---|
| `reports.php` | GET | General report data |
| `staff_report.php` | GET | Staff performance report |
| `company_report.php` | GET | Company revenue report |
| `customer_report.php` | GET | Customer trips report |
| `running_km_report.php` | GET | Vehicle KM report |
| `shortage_km_report.php` | GET | KM shortage report |
| `vehicle_separate_report.php` | GET | Per-vehicle breakdown |
| `refusal_report.php` | GET | Driver refusal report |
| `cancel_report.php` | GET | Cancellation report |
| `enquiry_report.php` | GET | Enquiry/lead report |
| `day_wise_report.php` | GET | Day-wise summary |

---

## 🔒 Security

| Feature | Implementation |
|---|---|
| Auth | PHP session cookies |
| SQL injection | PDO prepared statements |
| CORS | Allowlist of origins in `db.php` |
| Preflight | `OPTIONS` → `200` and exit |

---

## 📤 JSON Response Format

```json
// Success
{ "success": true, "data": [ ... ], "message": "OK" }

// Error
{ "success": false, "message": "Error description" }
```

---

## ▶️ Running the Server

```bash
# Via root npm script
npm run start-backend

# Manual
php -S 127.0.0.1:8080 -t .
```

Accessible at: `http://localhost:8080`

---

## 🧪 Testing

```bash
php backend/test_db.php          # Test DB connection
php backend/run_tests.php        # Full API test suite
php backend/test_dashboard.php   # Dashboard tests
node backend/test_api.js         # Node.js API test
```
