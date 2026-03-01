# 🚕 Frontend — Taxi Management System

React 19 + Vite single-page application for the Taxi Management System.

---

## 📦 Tech Stack

| Package | Version | Role |
|---|---|---|
| **React** | 19.x | UI framework |
| **Vite** | 7.x | Build tool & HMR dev server |
| **React Router DOM** | 7.x | SPA client-side routing |
| **Axios** | 1.x | HTTP calls to PHP backend |
| **Tailwind CSS** | 4.x | Utility-first CSS framework |
| **@tailwindcss/vite** | 4.x | Tailwind v4 Vite plugin |
| **Vitest** | 4.x | Unit test runner |
| **@testing-library/react** | 16.x | Component testing utilities |
| **@testing-library/jest-dom** | 6.x | Custom DOM matchers |
| **@testing-library/user-event** | 14.x | User interaction simulation |
| **ESLint** | 9.x | Code linting |
| **jsdom** | 28.x | DOM environment for tests |

---

## 📁 Directory Structure

```
frontend/
├── public/                     # Static assets
├── src/
│   ├── assets/                 # Images, icons
│   ├── components/             # Shared/reusable components
│   │   ├── Layout.jsx          # App shell (Outlet wrapper)
│   │   ├── Navbar.jsx          # Navigation bar
│   │   ├── CompanyReport.jsx   # Company report table component
│   │   ├── CustomerReport.jsx  # Customer report table component
│   │   ├── VehicleReport.jsx   # Vehicle report table component
│   │   └── VehicleTariffSettings.jsx  # Tariff settings UI
│   ├── context/
│   │   ├── AuthContext.jsx     # Global auth state + Axios instance
│   │   └── ToastContext.jsx    # Global toast notifications
│   ├── pages/                  # Page-level components (one per route)
│   │   └── __tests__/          # Vitest unit tests
│   ├── App.jsx                 # Route definitions
│   ├── main.jsx                # ReactDOM.render entry point
│   ├── index.css               # Tailwind + global styles
│   └── setupTests.js           # Vitest setup file
├── index.html                  # HTML entry point
├── vite.config.js              # Vite + Vitest config
├── vercel.json                 # Vercel SPA rewrite rules
├── .env.example                # Environment variable template
└── package.json
```

---

## 🔧 Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
# URL of the PHP backend API
VITE_API_URL=http://localhost:8080/backend/api
```

> For production, replace with your deployed backend URL.

---

## ▶️ Running Locally

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🧪 Testing

```bash
# Run tests in interactive watch mode
npm test

# Run tests once with coverage report
npm run coverage
```

Tests are in `src/pages/__tests__/`.

---

## 🌐 All Pages & Routes

### Public (no login required)

| Route | Component | Description |
|---|---|---|
| `/` | `RoleSelect` | Landing — choose Admin / Staff / User |
| `/login` | `Login` | Regular user login |
| `/register` | `Register` | User self-registration |
| `/admin/login` | `AdminLogin` | Admin authentication |
| `/admin/register` | `AdminRegister` | Admin account creation |
| `/staff/login` | `StaffLogin` | Staff login |
| `/staff/register` | `StaffRegister` | Staff account creation |

### Protected (login required)

#### Core Operations
| Route | Component | Description |
|---|---|---|
| `/dashboard` | `Dashboard` | KPI cards, booking stats, live counts |
| `/bookings` | `Bookings` | Create, view, search bookings |
| `/advance-booking` | `AdvanceBooking` | Create a future/advance booking |
| `/advance-bookings` | `AdvanceBookings` | List all advance bookings |
| `/display-bookings` | `DisplayBookings` | Read-only bookings display |
| `/booking-counts` | `BookingCounts` | Booking statistics overview |
| `/edit-booking` | `EditBooking` | Edit a pending booking |
| `/cancel-booking` | `CancelBooking` | Cancel a booking |
| `/print-booking/:b_id` | `PrintBooking` | Printable booking receipt |

#### Assignment & Trip Management
| Route | Component | Description |
|---|---|---|
| `/assignments` | `Assignments` | Assign driver + vehicle to booking |
| `/assign-later` | `AssignLater` | Defer assignment for later |
| `/ontrip` | `OnTrip` | Manage ongoing outstation trips |
| `/localtrip/:v_id` | `LocalTrip` | Manage local trip for a vehicle |
| `/trip-closing` | `TripClosing` | Close an outstation trip |
| `/local-trip-closing` | `LocalTripClosing` | Close a local trip |
| `/edit-trip` | `EditTrip` | Edit an open trip entry |
| `/edit-closed-trip` | `EditClosedTrip` | Modify an already-closed trip |
| `/trip-refusal` | `TripRefusal` | Record a refused trip |

#### Fleet & Staff
| Route | Component | Description |
|---|---|---|
| `/vehicles` | `Vehicles` | Vehicle master — add/edit/delete |
| `/attached-vehicles` | `AttachedVehicles` | Partner/attached vehicle management |
| `/vehicle-attendance` | `VehicleAttendance` | Mark vehicle present/absent |
| `/vehicle-in-out` | `VehicleInOut` | Log vehicle departure/arrival times |
| `/staff` | `Staff` | Staff master — add/edit/delete |
| `/attendance` | `StaffAttendance` | Mark daily staff attendance |

#### Finance & Settings
| Route | Component | Description |
|---|---|---|
| `/finance` | `FinanceManagement` | Ledger / finance overview |
| `/tariff` | `Tariff` | Manage tariff/fare rules |
| `/tariff-upload` | `TariffUpload` | Bulk CSV tariff upload |
| `/customer-upload` | `CustomerUpload` | Bulk CSV customer import |
| `/settings` | `Settings` | App-level settings |
| `/user-rights` | `UserRights` | Role-based access control |
| `/user-logs` | `UserLogs` | Staff login & activity audit log |

#### Reports
| Route | Component | Description |
|---|---|---|
| `/reports` | `Reports` | Reports hub / navigation page |
| `/staff-attendance-report` | `StaffAttendanceReport` | Daily/monthly staff attendance table |
| `/company-report` | `CompanyReport` | Revenue report by company/account |
| `/customer-report` | `CustomerReport` | Trips/revenue per customer |
| `/running-km-report` | `RunningKMReport` | Vehicle KM driven report |
| `/shortage-km-report` | `ShortageKMReport` | KM shortage / discrepancy report |
| `/vehicle-separate-report` | `VehicleSeparateReport` | Per-vehicle booking report |
| `/refusal-report` | `RefusalReport` | Driver refusals report |
| `/cancel-report` | `CancelReport` | Cancellation report |
| `/enquiry-report` | `EnquiryReport` | Enquiry / lead tracking report |
| `/day-wise-report` | `DayWiseReport` | Day-by-day booking summary |
| `/user-activity-report` | `UserActivityReport` | Per-user action history |

---

## 🔐 Auth System

### `AuthContext` (`src/context/AuthContext.jsx`)

Provides global auth state and a pre-configured Axios instance via React Context.

**Exposed values:**

| Value | Type | Description |
|---|---|---|
| `user` | object \| null | Logged-in user data |
| `loading` | boolean | Auth initialization state |
| `api` | AxiosInstance | Pre-configured HTTP client |
| `login(username, password)` | function | POST `/login.php` |
| `register(name, email, mobile, password)` | function | POST `/register.php` |
| `logout()` | function | POST `/logout.php` + clear state |
| `setUser(user)` | function | Manually update user state |

**Axios configuration:**

```js
axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/backend/api',
  withCredentials: true,   // ← Sends PHP session cookies
  headers: { 'Content-Type': 'application/json' },
})
```

### Route Guards

- **`ProtectedRoute`** — Redirects to `/` if no user session
- **`PublicOnlyRoute`** — Redirects to `/dashboard` if already logged in

---

## 📡 API Integration

All API calls use the `api` instance from `AuthContext` or create a local Axios instance.

**Base URL:** `http://localhost:8080/backend/api` (configurable via `VITE_API_URL`)

**CORS:** The PHP backend allows `localhost:5173`, `5174`, `5175` by default.

**Common pattern in pages:**

```jsx
const { api } = useContext(AuthContext);

useEffect(() => {
  api.get('/bookings.php').then(res => setBookings(res.data));
}, [api]);
```

---

## 🎨 Styling

- **Tailwind CSS v4** via Vite plugin (`@tailwindcss/vite`)
- Global styles in `src/index.css`
- No separate `tailwind.config.js` needed with v4's Vite plugin

---

## 🚢 Deploying to Vercel

1. Connect the repository to [Vercel](https://vercel.com)
2. Set **Root Directory**: `frontend`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. Add env variable: `VITE_API_URL=https://your-backend.com/backend/api`

`vercel.json` handles SPA fallback routing:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## 🧹 Code Quality

```bash
# Lint all files
npm run lint
```

ESLint config: `eslint.config.js` (ESLint 9 flat config with React Hooks + React Refresh plugins).
