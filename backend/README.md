# 🚕 Backend — Taxi Management System API

PHP REST API backend for the Taxi Management System. Serves JSON responses to the React frontend.

---

## 📦 Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| **PHP** | 8.x | Server-side scripting language |
| **MySQL** | 8.x | Relational database |
| **PDO** | built-in | Secure DB access (prepared statements) |
| **PHP Built-in Server** | - | Local development HTTP server |

---

## 📁 Directory Structure

```
backend/
├── api/                    # All REST API endpoint files (54 files)
│   ├── login.php
│   ├── register.php
│   ├── bookings.php
│   ├── ...
├── config/
│   └── db.php              # Database connection + CORS headers
├── debug/                  # Debug/diagnostic files
├── run_tests.php           # Full backend test suite
├── test_api.js             # Node.js API sanity test
├── test_dashboard.php      # Dashboard endpoint tests
└── test_db.php             # Database connection test
```

---

## ⚙️ Configuration

### Database — `config/db.php`

```php
private $host     = '127.0.0.1';
private $db_name  = 'ft_welcome';
private $username = 'root';
private $password = '';       // ← Update with your MySQL password
```

### CORS Allowed Origins

```php
$allowed_origins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
];
```

> For production, add your deployed frontend URL to this array.

### Allowed HTTP Methods

```
POST, GET, OPTIONS, PUT, DELETE
```

---

## ▶️ Running Locally

Start the PHP built-in server from the **project root** (`Taxi-new-ui/`):

```bash
# Option 1: Via root NPM script
npm run start-backend

# Option 2: Directly via PowerShell
powershell -ExecutionPolicy Bypass -File start_backend.ps1

# Option 3: Manual PHP command (from root folder)
php -S 127.0.0.1:8080 -t .
```

Backend will be accessible at: **`http://localhost:8080`**

API base URL: **`http://localhost:8080/backend/api/`**

---

## 🗄️ Database

- **Name:** `ft_welcome`
- **SQL Dump:** `../ft_welcome.sql` (root of project)
- **PDO** with `PDO::ERRMODE_EXCEPTION` and UTF-8 (`set names utf8`)
- **No ORM** — raw SQL with prepared statements for security

### Import the Database

```bash
# MySQL CLI
mysql -u root -p < ft_welcome.sql

# Or create DB first, then import:
mysql -u root -p -e "CREATE DATABASE ft_welcome;"
mysql -u root -p ft_welcome < ft_welcome.sql
```

---

## 🔌 API Endpoints Reference

### 🔑 Authentication

| File | Method | Path | Description |
|---|---|---|---|
| `login.php` | POST | `/login.php` | User login — returns user object + session |
| `register.php` | POST | `/register.php` | New user registration |
| `logout.php` | POST | `/logout.php` | Destroy session / logout |
| `admin_login.php` | POST | `/admin_login.php` | Admin-specific login |
| `admin_register.php` | POST | `/admin_register.php` | Admin account creation |
| `staff_login.php` | POST | `/staff_login.php` | Staff login |
| `staff_register.php` | POST | `/staff_register.php` | Staff account creation |

---

### 📋 Bookings

| File | Method | Path | Description |
|---|---|---|---|
| `bookings.php` | GET/POST | `/bookings.php` | List all bookings / create new booking |
| `booking_edit.php` | POST | `/booking_edit.php` | Edit an existing booking |
| `booking_counts.php` | GET | `/booking_counts.php` | Booking counts by status |
| `advance_booking.php` | POST | `/advance_booking.php` | Create an advance booking |
| `advance_bookings.php` | GET | `/advance_bookings.php` | List all advance bookings |
| `cancel.php` | POST | `/cancel.php` | Cancel a booking |
| `trip_refusal.php` | POST | `/trip_refusal.php` | Record a trip refusal by driver |

---

### 🚗 Assignments & Trips

| File | Method | Path | Description |
|---|---|---|---|
| `assign.php` | POST | `/assign.php` | Assign driver & vehicle to booking |
| `assign_later.php` | POST | `/assign_later.php` | Mark booking as assign-later |
| `ontrip.php` | GET/POST | `/ontrip.php` | List/manage ongoing outstation trips |
| `localtrip.php` | GET/POST | `/localtrip.php` | Local trip management |
| `local_trip_closing.php` | POST | `/local_trip_closing.php` | Close a local trip |
| `closing.php` | POST | `/closing.php` | Close an outstation trip |
| `trip_edit.php` | POST | `/trip_edit.php` | Edit an open trip record |
| `edit_closed_trip.php` | POST | `/edit_closed_trip.php` | Edit a closed trip |

---

### 🚙 Vehicles

| File | Method | Path | Description |
|---|---|---|---|
| `vehicles.php` | GET/POST/PUT/DELETE | `/vehicles.php` | Full vehicle CRUD |
| `available_vehicles.php` | GET | `/available_vehicles.php` | List currently available vehicles |
| `attached_vehicles.php` | GET/POST | `/attached_vehicles.php` | Attached/partner vehicle management |
| `vehicle_attendance.php` | GET/POST | `/vehicle_attendance.php` | Mark vehicle attendance |
| `vehicle_in_out.php` | GET/POST | `/vehicle_in_out.php` | Vehicle in/out time logging |
| `vehicle_pricing.php` | GET/POST | `/vehicle_pricing.php` | Per-vehicle pricing rules |

---

### 👥 Staff & Users

| File | Method | Path | Description |
|---|---|---|---|
| `staff.php` | GET/POST/PUT/DELETE | `/staff.php` | Staff master CRUD |
| `attendance.php` | GET/POST | `/attendance.php` | Staff daily attendance |
| `staff_login_logs.php` | GET | `/staff_login_logs.php` | Staff login history |
| `user_rights.php` | GET/POST | `/user_rights.php` | Role-based access control rules |
| `user_activity_report.php` | GET | `/user_activity_report.php` | Per-user activity audit log |

---

### 💰 Tariff & Settings

| File | Method | Path | Description |
|---|---|---|---|
| `tariff.php` | GET/POST/PUT/DELETE | `/tariff.php` | Tariff/fare rule management |
| `tariff_upload.php` | POST | `/tariff_upload.php` | Bulk tariff data upload (CSV/Excel) |
| `customer_upload.php` | POST | `/customer_upload.php` | Bulk customer data upload |
| `settings.php` | GET/POST | `/settings.php` | Application settings |
| `enquery_tariff.php` | GET | `/enquery_tariff.php` | Fare/tariff enquiry lookup |
| `get_distance_suggestions.php` | GET | `/get_distance_suggestions.php` | Distance suggestion / autocomplete |

---

### 👤 Customers

| File | Method | Path | Description |
|---|---|---|---|
| `customers.php` | GET/POST | `/customers.php` | Customer list and add |
| `customer_search.php` | GET | `/customer_search.php` | Customer search / autocomplete |

---

### 💹 Finance

| File | Method | Path | Description |
|---|---|---|---|
| `finance.php` | GET/POST | `/finance.php` | Finance ledger — view & post entries |

---

### 📊 Dashboard

| File | Method | Path | Description |
|---|---|---|---|
| `dashboard.php` | GET | `/dashboard.php` | KPI summary (bookings, revenue, fleet status) |

---

### 📈 Reports

| File | Method | Path | Description |
|---|---|---|---|
| `reports.php` | GET | `/reports.php` | General reports data & aggregations |
| `staff_report.php` | GET | `/staff_report.php` | Staff performance report |
| `company_report.php` | GET | `/company_report.php` | Company/account-wise revenue report |
| `customer_report.php` | GET | `/customer_report.php` | Customer trips & revenue report |
| `running_km_report.php` | GET | `/running_km_report.php` | Vehicle running KM report |
| `shortage_km_report.php` | GET | `/shortage_km_report.php` | KM shortage / discrepancy report |
| `vehicle_separate_report.php` | GET | `/vehicle_separate_report.php` | Per-vehicle booking breakdown |
| `refusal_report.php` | GET | `/refusal_report.php` | Driver trip refusal report |
| `cancel_report.php` | GET | `/cancel_report.php` | Booking cancellation report |
| `enquiry_report.php` | GET | `/enquiry_report.php` | Enquiry & lead tracking report |
| `day_wise_report.php` | GET | `/day_wise_report.php` | Day-wise booking summary |

---

## 🔐 Session & CORS

- PHP **session** used for authentication (`session_start()`)
- Frontend sends cookies via `withCredentials: true` (Axios)
- CORS headers set in every API file via `config/db.php` include
- `OPTIONS` preflight requests return `200` immediately

---

## 🧪 Testing

```bash
# Test DB connection
php test_db.php

# Full API test suite
php run_tests.php

# Dashboard tests
php test_dashboard.php

# Node.js quick API test
node test_api.js
```

---

## 🔒 Security

- All SQL queries use **PDO prepared statements** (no raw string interpolation)
- CORS restricted to specific allowed origins
- Session-based authentication (no JWT)
- Input sanitized via PDO binding before DB operations

---

## 📤 Response Format

All endpoints return **JSON**:

```json
// Success
{ "success": true, "data": [...], "message": "..." }

// Error
{ "success": false, "message": "Error description" }
```
