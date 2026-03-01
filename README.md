# � Taxi Management System — Techy Topers

A full-stack **Taxi / Cab Operations Management System** built for managing bookings, fleet, staff, finance, attendance, and reporting for a taxi company.

---

## � Project Structure

```
Taxi-new-ui/
├── frontend/               # React 19 + Vite SPA (client-side app)
│   ├── src/
│   │   ├── pages/          # 52 page components (Dashboard, Bookings, etc.)
│   │   ├── components/     # Reusable UI components (Navbar, Layout, etc.)
│   │   ├── context/        # AuthContext, ToastContext
│   │   ├── App.jsx         # Root component with all routes
│   │   ├── main.jsx        # App entry point
│   │   └── index.css       # Global styles (Tailwind CSS)
│   ├── vercel.json         # Vercel SPA rewrite config
│   ├── vite.config.js      # Vite + Tailwind + Vitest config
│   └── package.json        # Frontend dependencies
│
├── backend/                # PHP REST API backend
│   ├── api/                # 54 PHP API endpoint files
│   ├── config/
│   │   └── db.php          # MySQL database connection (PDO)
│   └── run_tests.php       # Backend test runner
│
├── ft_welcome.sql          # MySQL database dump (import this first)
├── setup_db.ps1            # PowerShell DB setup script
├── start_backend.ps1       # PowerShell backend (PHP server) start script
└── package.json            # Root dev scripts (concurrently)
```

---

## �️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **React** | 19.x | UI framework |
| **Vite** | 7.x | Build tool & dev server |
| **React Router DOM** | 7.x | Client-side routing (SPA) |
| **Axios** | 1.x | HTTP API requests |
| **Tailwind CSS** | 4.x | Utility-first styling |
| **Vitest** | 4.x | Unit testing framework |
| **@testing-library/react** | 16.x | Component testing |
| **ESLint** | 9.x | Code linting |

### Backend
| Technology | Purpose |
|---|---|
| **PHP** | Server-side REST API |
| **MySQL** | Relational database (`ft_welcome`) |
| **PDO** | Secure database access (prepared statements) |
| **PHP Built-in Server** | Local development server |

---

## ⚙️ Prerequisites

Before running this project, make sure you have:

- **Node.js** v18+ and **npm**
- **PHP** 8.x (added to system PATH)
- **MySQL** 8.x (or XAMPP / WAMP)
- **Git**

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd Taxi-new-ui
```

### 2. Set Up the Database

Import the SQL dump into MySQL:

```bash
# Option A: Using the PowerShell setup script
npm run setup-db

# Option B: Manual import via MySQL CLI
mysql -u root -p < ft_welcome.sql

# Option C: Import via phpMyAdmin
# → Create a database named "ft_welcome"
# → Import ft_welcome.sql
```

### 3. Configure the Backend

The backend reads credentials from **environment variables** with local dev fallbacks.  
For local development, no changes are needed (defaults: `root` / empty password / `ft_welcome`).

For production, set these via `.htaccess` `SetEnv` or your hosting control panel:

```
DB_HOST=your-db-host
DB_NAME=ft_welcome
DB_USER=your-db-user
DB_PASSWORD=your-db-password
ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

> See `backend/.env.example` for all available variables.

### 4. Configure the Frontend

Create a `.env` file in the `frontend/` folder:

```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:8080/backend/api
```

> Change the port (`8080`) if your PHP server runs on a different port.

### 5. Install Dependencies

```bash
# Root (concurrently)
npm install

# Frontend
cd frontend
npm install
```

### 6. Run the Application

**Run both frontend and backend together (recommended):**

```bash
# From the root directory
npm run dev
```

**Or run separately:**

```bash
# Terminal 1 — Start PHP backend server
npm run start-backend
# Backend runs at: http://localhost:8080

# Terminal 2 — Start Vite frontend dev server
npm run start-frontend
# Frontend runs at: http://localhost:5173
```

---

## 🌐 Application Pages & Routes

| Route | Page | Description |
|---|---|---|
| `/` | RoleSelect | Entry — choose login role |
| `/login` | Login | Staff/user login |
| `/register` | Register | User registration |
| `/admin/login` | AdminLogin | Admin login |
| `/admin/register` | AdminRegister | Admin registration |
| `/staff/login` | StaffLogin | Staff login |
| `/staff/register` | StaffRegister | Staff registration |
| `/dashboard` | Dashboard | Overview KPIs & stats |
| `/bookings` | Bookings | New booking creation & list |
| `/advance-booking` | AdvanceBooking | Create advance booking |
| `/advance-bookings` | AdvanceBookings | View all advance bookings |
| `/display-bookings` | DisplayBookings | View/display bookings |
| `/assignments` | Assignments | Assign driver/vehicle to booking |
| `/assign-later` | AssignLater | Defer vehicle assignment |
| `/cancel-booking` | CancelBooking | Cancel a booking |
| `/edit-booking` | EditBooking | Edit an existing booking |
| `/ontrip` | OnTrip | Manage on-trip / outstation bookings |
| `/localtrip/:v_id` | LocalTrip | Handle a local trip for a vehicle |
| `/trip-closing` | TripClosing | Close outstation/regular trips |
| `/local-trip-closing` | LocalTripClosing | Close local trips |
| `/edit-trip` | EditTrip | Edit an open trip |
| `/edit-closed-trip` | EditClosedTrip | Edit an already-closed trip |
| `/trip-refusal` | TripRefusal | Record a refused trip |
| `/print-booking/:b_id` | PrintBooking | Printable booking slip |
| `/vehicles` | Vehicles | Vehicle master management |
| `/attached-vehicles` | AttachedVehicles | Attached/partner vehicles |
| `/vehicle-attendance` | VehicleAttendance | Mark vehicle attendance |
| `/vehicle-in-out` | VehicleInOut | Track vehicle in/out time |
| `/staff` | Staff | Staff master management |
| `/attendance` | StaffAttendance | Mark staff attendance |
| `/user-rights` | UserRights | Manage role-based permissions |
| `/user-logs` | UserLogs | View user activity logs |
| `/tariff` | Tariff | Manage fare/tariff rules |
| `/tariff-upload` | TariffUpload | Bulk upload tariff data |
| `/customer-upload` | CustomerUpload | Bulk upload customer data |
| `/finance` | FinanceManagement | Finance / ledger view |
| `/booking-counts` | BookingCounts | Booking count statistics |
| `/settings` | Settings | Application settings |
| `/reports` | Reports | Reports landing page |
| `/staff-attendance-report` | StaffAttendanceReport | Staff attendance report |
| `/company-report` | CompanyReport | Company-level summary report |
| `/customer-report` | CustomerReport | Customer-wise report |
| `/running-km-report` | RunningKMReport | Vehicle running KM report |
| `/shortage-km-report` | ShortageKMReport | Shortage KM report |
| `/vehicle-separate-report` | VehicleSeparateReport | Per-vehicle report |
| `/refusal-report` | RefusalReport | Trip refusal report |
| `/cancel-report` | CancelReport | Cancellation report |
| `/enquiry-report` | EnquiryReport | Enquiry/lead report |
| `/day-wise-report` | DayWiseReport | Day-wise booking report |
| `/user-activity-report` | UserActivityReport | Per-user activity report |

---

## 🔌 Backend API Endpoints

All endpoints live under `backend/api/` and are accessed via `http://localhost:8080/backend/api/`.

### Auth
| Endpoint | Method | Description |
|---|---|---|
| `login.php` | POST | User login |
| `register.php` | POST | User registration |
| `logout.php` | POST | Logout / clear session |
| `admin_login.php` | POST | Admin login |
| `admin_register.php` | POST | Admin registration |
| `staff_login.php` | POST | Staff login |
| `staff_register.php` | POST | Staff registration |

### Bookings
| Endpoint | Method | Description |
|---|---|---|
| `bookings.php` | GET/POST | List and create bookings |
| `booking_edit.php` | POST | Edit existing booking |
| `booking_counts.php` | GET | Count bookings by status |
| `advance_booking.php` | POST | Create advance booking |
| `advance_bookings.php` | GET | List advance bookings |
| `cancel.php` | POST | Cancel a booking |
| `trip_refusal.php` | POST | Record a refusal |

### Assignments & Trips
| Endpoint | Method | Description |
|---|---|---|
| `assign.php` | POST | Assign driver/vehicle |
| `assign_later.php` | POST | Mark assignment deferred |
| `ontrip.php` | GET/POST | Manage on-trip records |
| `localtrip.php` | GET/POST | Local trip management |
| `local_trip_closing.php` | POST | Close local trip |
| `closing.php` | POST | Close outstation trip |
| `trip_edit.php` | POST | Edit an open trip |
| `edit_closed_trip.php` | POST | Edit a closed trip record |

### Vehicles
| Endpoint | Method | Description |
|---|---|---|
| `vehicles.php` | GET/POST/PUT/DELETE | Vehicle CRUD |
| `available_vehicles.php` | GET | List currently available vehicles |
| `attached_vehicles.php` | GET/POST | Attached/partner vehicles |
| `vehicle_attendance.php` | GET/POST | Vehicle attendance |
| `vehicle_in_out.php` | GET/POST | Vehicle check-in / check-out |
| `vehicle_pricing.php` | GET/POST | Vehicle-specific pricing |

### Staff
| Endpoint | Method | Description |
|---|---|---|
| `staff.php` | GET/POST/PUT/DELETE | Staff CRUD |
| `attendance.php` | GET/POST | Staff attendance |
| `staff_login_logs.php` | GET | Staff login history |
| `user_rights.php` | GET/POST | Role-based access control |
| `user_activity_report.php` | GET | User activity log |

### Tariff & Settings
| Endpoint | Method | Description |
|---|---|---|
| `tariff.php` | GET/POST/PUT/DELETE | Tariff/fare management |
| `tariff_upload.php` | POST | Bulk tariff upload |
| `customer_upload.php` | POST | Bulk customer upload |
| `settings.php` | GET/POST | App settings |
| `enquery_tariff.php` | GET | Fare enquiry / tariff lookup |
| `get_distance_suggestions.php` | GET | Distance suggestion lookup |

### Finance
| Endpoint | Method | Description |
|---|---|---|
| `finance.php` | GET/POST | Finance ledger entries |

### Customers
| Endpoint | Method | Description |
|---|---|---|
| `customers.php` | GET/POST | Custom list & add |
| `customer_search.php` | GET | Search customers |

### Reports
| Endpoint | Method | Description |
|---|---|---|
| `reports.php` | GET | General reports data |
| `staff_report.php` | GET | Staff report |
| `company_report.php` | GET | Company report |
| `customer_report.php` | GET | Customer report |
| `running_km_report.php` | GET | Running KM report |
| `shortage_km_report.php` | GET | Shortage KM report |
| `vehicle_separate_report.php` | GET | Per-vehicle report |
| `refusal_report.php` | GET | Refusal report |
| `cancel_report.php` | GET | Cancel report |
| `enquiry_report.php` | GET | Enquiry report |
| `day_wise_report.php` | GET | Day-wise report |

### Dashboard
| Endpoint | Method | Description |
|---|---|---|
| `dashboard.php` | GET | Dashboard summary KPIs |

---

## 🗄️ Database

- **Database Name:** `ft_welcome`
- **Engine:** MySQL 8
- **ORM / Access:** PDO with prepared statements
- **SQL Dump:** `ft_welcome.sql` (import to bootstrap the DB)
- **Tables include:** bookings, vehicles, staff, customers, tariffs, attendance, finance/ledger, trips, user rights, etc.

---

## 🔐 Authentication & Authorization

- **Session-based auth** — PHP session cookies (`withCredentials: true` on Axios)
- **Three role types:** Admin, Staff, User
- **AuthContext** (`frontend/src/context/AuthContext.jsx`) — global auth state in React
- **ProtectedRoute** component — redirects unauthenticated users to `/`
- **PublicOnlyRoute** component — redirects already-logged-in users to `/dashboard`
- **User rights** managed via `user_rights.php` API (role-based feature gating)

---

## 🧪 Testing

### Frontend Unit Tests (Vitest)

```bash
cd frontend
npm test            # Run all tests in watch mode
npm run coverage    # Run tests with coverage report
```

Tests live in `frontend/src/pages/__tests__/`.

### Backend Tests (PHP)

```bash
# From the backend folder or via browser
php backend/run_tests.php
php backend/test_db.php
```

---

## 🚢 Deployment

### Frontend — Deploy to Vercel

1. Push the `frontend/` folder (or root) to GitHub
2. Connect to [Vercel](https://vercel.com)
3. Set **Root Directory** to `frontend`
4. Set **Build Command:** `npm run build`
5. Set **Output Directory:** `dist`
6. Add environment variable: `VITE_API_URL=https://your-backend-url/backend/api`

The `frontend/vercel.json` handles SPA routing rewrites automatically.

### Backend — Deploy PHP

Host the `backend/` folder on any PHP 8+ server (e.g., cPanel, Hostinger, DigitalOcean).

Set these environment variables on your host (via `.htaccess` `SetEnv` or hosting control panel):

```apache
# .htaccess in backend/ or root
SetEnv DB_HOST       your-db-host
SetEnv DB_NAME       ft_welcome
SetEnv DB_USER       your-db-user
SetEnv DB_PASSWORD   your-db-password
SetEnv ALLOWED_ORIGINS https://your-frontend.vercel.app
```

Import the database:
```bash
mysql -u your-db-user -p ft_welcome < ft_welcome.sql
```

---

## � Key Frontend Components

| Component | Location | Purpose |
|---|---|---|
| `Layout` | `components/Layout.jsx` | App shell wrapper |
| `Navbar` | `components/Navbar.jsx` | Navigation bar with role-based links |
| `AuthContext` | `context/AuthContext.jsx` | Auth state + Axios API instance |
| `ToastContext` | `context/ToastContext.jsx` | Global toast notifications |
| `VehicleTariffSettings` | `components/VehicleTariffSettings.jsx` | Complex tariff config UI |
| `CompanyReport` (component) | `components/CompanyReport.jsx` | Company report table component |
| `CustomerReport` (component) | `components/CustomerReport.jsx` | Customer report table component |

---

## � Available NPM Scripts

### Root
| Script | Command | Description |
|---|---|---|
| `npm run dev` | Starts backend + frontend together via `concurrently` |
| `npm run start-backend` | Starts PHP backend server |
| `npm run start-frontend` | Starts Vite dev server |
| `npm run setup-db` | Runs DB setup PowerShell script |

### Frontend (`cd frontend`)
| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production (`dist/`) |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run Vitest unit tests |
| `npm run coverage` | Run tests with coverage |

---

## 👨‍💻 Development Team

**Techy Topers** — Taxi Management System

---

## 📄 License

This project is proprietary. All rights reserved.