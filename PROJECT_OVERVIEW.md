# 🚕 Taxi Management System — Project Overview

> **Techy Topers** · Full-Stack Taxi Operations Platform
> Built with React 19 + Vite (frontend) and PHP + MySQL (backend)

---

## 📁 Repository Structure

```
Taxi-new-ui/
├── frontend/               ← React 19 + Vite SPA
│   ├── src/
│   │   ├── pages/          ← 52 page components
│   │   ├── components/     ← Shared UI (Navbar, Layout, Reports…)
│   │   ├── context/        ← AuthContext, ToastContext
│   │   ├── App.jsx         ← Route definitions
│   │   └── index.css       ← Tailwind CSS global styles
│   ├── vercel.json         ← Vercel SPA rewrite rules
│   ├── vite.config.js      ← Vite + Tailwind + Vitest config
│   └── package.json
│
├── backend/                ← PHP REST API
│   ├── api/                ← 54 PHP endpoint files
│   └── config/db.php       ← MySQL PDO connection + CORS headers
│
├── ft_welcome.sql          ← MySQL database dump
├── setup_db.ps1            ← DB setup script
├── start_backend.ps1       ← PHP dev server start script
└── package.json            ← Root scripts (concurrently)
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Role |
|---|---|---|
| React | 19.x | UI framework |
| Vite | 7.x | Build tool & dev server |
| React Router DOM | 7.x | Client-side routing |
| Axios | 1.x | HTTP API requests |
| Tailwind CSS | 4.x | Styling |
| Vitest | 4.x | Unit testing |
| @testing-library/react | 16.x | Component tests |
| ESLint | 9.x | Code linting |

### Backend
| Technology | Role |
|---|---|
| PHP 8.x | REST API server |
| MySQL 8.x | Relational database (`ft_welcome`) |
| PDO | Secure DB queries (prepared statements) |

---

## ⚙️ Quick Start

### 1 — Import Database
```bash
mysql -u root -p < ft_welcome.sql
```

### 2 — Configure Backend
Edit `backend/config/db.php`:
```php
private $password = '';   // ← set your MySQL password
```

### 3 — Configure Frontend
```bash
cd frontend
cp .env.example .env
# Set VITE_API_URL=http://localhost:8080/backend/api
```

### 4 — Install & Run
```bash
npm install          # root
cd frontend && npm install

# From root — runs both backend + frontend:
npm run dev
```

- **Frontend:** http://localhost:5173  
- **Backend API:** http://localhost:8080/backend/api

---

## 🌐 All Application Routes

### Public (no login)
| Route | Page | Description |
|---|---|---|
| `/` | RoleSelect | Choose Admin / Staff / User |
| `/login` | Login | User login |
| `/register` | Register | User registration |
| `/admin/login` | AdminLogin | Admin login |
| `/admin/register` | AdminRegister | Admin registration |
| `/staff/login` | StaffLogin | Staff login |
| `/staff/register` | StaffRegister | Staff registration |

### Bookings
| Route | Page |
|---|---|
| `/bookings` | Bookings — create & list |
| `/advance-booking` | Create advance booking |
| `/advance-bookings` | View advance bookings |
| `/display-bookings` | Read-only booking display |
| `/booking-counts` | Booking count stats |
| `/edit-booking` | Edit pending booking |
| `/cancel-booking` | Cancel booking |
| `/print-booking/:b_id` | Printable booking receipt |

### Assignments & Trips
| Route | Page |
|---|---|
| `/assignments` | Assign driver + vehicle |
| `/assign-later` | Deferred assignment |
| `/ontrip` | Ongoing outstation trips |
| `/localtrip/:v_id` | Local trip for a vehicle |
| `/trip-closing` | Close outstation trip |
| `/local-trip-closing` | Close local trip |
| `/edit-trip` | Edit open trip |
| `/edit-closed-trip` | Edit closed trip |
| `/trip-refusal` | Record trip refusal |

### Fleet & Staff
| Route | Page |
|---|---|
| `/vehicles` | Vehicle master CRUD |
| `/attached-vehicles` | Partner vehicles |
| `/vehicle-attendance` | Mark vehicle attendance |
| `/vehicle-in-out` | Vehicle in/out log |
| `/staff` | Staff master CRUD |
| `/attendance` | Mark staff attendance |

### Finance & Admin
| Route | Page |
|---|---|
| `/finance` | Ledger / finance view |
| `/tariff` | Tariff/fare rules |
| `/tariff-upload` | Bulk tariff upload |
| `/customer-upload` | Bulk customer import |
| `/settings` | App settings |
| `/user-rights` | Role-based permissions |
| `/user-logs` | User audit log |

### Reports
| Route | Page |
|---|---|
| `/reports` | Reports hub |
| `/staff-attendance-report` | Staff attendance |
| `/company-report` | Company revenue |
| `/customer-report` | Customer trips |
| `/running-km-report` | Vehicle KM log |
| `/shortage-km-report` | KM shortage |
| `/vehicle-separate-report` | Per-vehicle report |
| `/refusal-report` | Refusals |
| `/cancel-report` | Cancellations |
| `/enquiry-report` | Enquiries |
| `/day-wise-report` | Day-wise summary |
| `/user-activity-report` | User activity |

---

## 🔌 Backend API Endpoints (54 total)

All endpoints: `http://localhost:8080/backend/api/<endpoint>`

### Auth
| Endpoint | Method | Description |
|---|---|---|
| `login.php` | POST | User login |
| `register.php` | POST | User registration |
| `logout.php` | POST | Session logout |
| `admin_login.php` | POST | Admin login |
| `admin_register.php` | POST | Admin registration |
| `staff_login.php` | POST | Staff login |
| `staff_register.php` | POST | Staff registration |

### Bookings
| Endpoint | Method | Description |
|---|---|---|
| `bookings.php` | GET/POST | List & create bookings |
| `booking_edit.php` | POST | Edit booking |
| `booking_counts.php` | GET | Booking counts by status |
| `advance_booking.php` | POST | Create advance booking |
| `advance_bookings.php` | GET | List advance bookings |
| `cancel.php` | POST | Cancel booking |
| `trip_refusal.php` | POST | Record refusal |

### Assignments & Trips
| Endpoint | Method | Description |
|---|---|---|
| `assign.php` | POST | Assign driver + vehicle |
| `assign_later.php` | POST | Defer assignment |
| `ontrip.php` | GET/POST | Outstation trip management |
| `localtrip.php` | GET/POST | Local trip management |
| `local_trip_closing.php` | POST | Close local trip |
| `closing.php` | POST | Close outstation trip |
| `trip_edit.php` | POST | Edit open trip |
| `edit_closed_trip.php` | POST | Edit closed trip |

### Vehicles
| Endpoint | Method | Description |
|---|---|---|
| `vehicles.php` | GET/POST/PUT/DELETE | Vehicle CRUD |
| `available_vehicles.php` | GET | Available vehicles list |
| `attached_vehicles.php` | GET/POST | Partner vehicles |
| `vehicle_attendance.php` | GET/POST | Vehicle attendance |
| `vehicle_in_out.php` | GET/POST | Vehicle in/out log |
| `vehicle_pricing.php` | GET/POST | Per-vehicle pricing |

### Staff & Users
| Endpoint | Method | Description |
|---|---|---|
| `staff.php` | GET/POST/PUT/DELETE | Staff CRUD |
| `attendance.php` | GET/POST | Staff attendance |
| `staff_login_logs.php` | GET | Staff login history |
| `user_rights.php` | GET/POST | Role permissions |
| `user_activity_report.php` | GET | User activity audit |

### Tariff & Settings
| Endpoint | Method | Description |
|---|---|---|
| `tariff.php` | GET/POST/PUT/DELETE | Tariff management |
| `tariff_upload.php` | POST | Bulk tariff upload |
| `customer_upload.php` | POST | Bulk customer upload |
| `settings.php` | GET/POST | App settings |
| `enquery_tariff.php` | GET | Fare enquiry lookup |
| `get_distance_suggestions.php` | GET | Distance autocomplete |

### Customers
| Endpoint | Method | Description |
|---|---|---|
| `customers.php` | GET/POST | Customer list & add |
| `customer_search.php` | GET | Customer search |

### Finance & Dashboard
| Endpoint | Method | Description |
|---|---|---|
| `finance.php` | GET/POST | Ledger entries |
| `dashboard.php` | GET | KPI summary data |

### Reports
| Endpoint | Method | Description |
|---|---|---|
| `reports.php` | GET | General reports |
| `staff_report.php` | GET | Staff report |
| `company_report.php` | GET | Company revenue |
| `customer_report.php` | GET | Customer report |
| `running_km_report.php` | GET | Running KM |
| `shortage_km_report.php` | GET | Shortage KM |
| `vehicle_separate_report.php` | GET | Per-vehicle report |
| `refusal_report.php` | GET | Refusals |
| `cancel_report.php` | GET | Cancellations |
| `enquiry_report.php` | GET | Enquiries |
| `day_wise_report.php` | GET | Day-wise report |

---

## 🔐 Auth & Security

- **Session-based auth** (PHP sessions + `withCredentials: true` on Axios)
- **3 roles:** Admin, Staff, User
- **AuthContext** — global React context with pre-configured Axios instance
- **ProtectedRoute** — redirects unauthenticated users to `/`
- **PublicOnlyRoute** — redirects logged-in users to `/dashboard`
- **PDO prepared statements** — all SQL queries parameterized

---

## 🗄️ Database

| Property | Value |
|---|---|
| Name | `ft_welcome` |
| Engine | MySQL 8 |
| Access | PDO (PHP) |
| Dump | `ft_welcome.sql` |

---

## 🧪 Testing

```bash
# Frontend (Vitest)
cd frontend
npm test              # watch mode
npm run coverage      # with coverage

# Backend (PHP)
php backend/run_tests.php
php backend/test_db.php
```

---

## 🚢 Deployment

### Frontend → Vercel
- Root: `frontend/`
- Build: `npm run build` → `dist/`
- Env: `VITE_API_URL=https://your-backend.com/backend/api`
- `vercel.json` handles SPA routing automatically

### Backend → PHP Host
- Upload `backend/` to any PHP 8 host
- Update CORS origins in `backend/config/db.php`
- Import `ft_welcome.sql` to MySQL

---

## 📝 NPM Scripts

| Command | From | Description |
|---|---|---|
| `npm run dev` | root | Run backend + frontend together |
| `npm run start-backend` | root | Start PHP server |
| `npm run start-frontend` | root | Start Vite dev server |
| `npm run setup-db` | root | Run DB setup script |
| `npm run dev` | `frontend/` | Vite dev server |
| `npm run build` | `frontend/` | Production build |
| `npm test` | `frontend/` | Run unit tests |
| `npm run lint` | `frontend/` | Run ESLint |
