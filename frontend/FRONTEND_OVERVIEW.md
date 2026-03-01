# ⚛️ Frontend Overview — Taxi Management System

> React 19 + Vite single-page application

---

## 📦 Dependencies

### Runtime
| Package | Version | Purpose |
|---|---|---|
| `react` | 19.x | UI framework |
| `react-dom` | 19.x | DOM renderer |
| `react-router-dom` | 7.x | Client-side routing |
| `axios` | 1.x | HTTP requests to PHP backend |
| `tailwindcss` | 4.x | Utility-first CSS |
| `@tailwindcss/vite` | 4.x | Tailwind v4 Vite plugin |

### Dev / Testing
| Package | Version | Purpose |
|---|---|---|
| `vite` | 7.x | Build tool & HMR dev server |
| `@vitejs/plugin-react` | 5.x | React fast-refresh |
| `vitest` | 4.x | Test runner |
| `@testing-library/react` | 16.x | Component testing |
| `@testing-library/jest-dom` | 6.x | Custom DOM matchers |
| `@testing-library/user-event` | 14.x | User interaction simulation |
| `jsdom` | 28.x | DOM environment for tests |
| `eslint` | 9.x | Linting |
| `eslint-plugin-react-hooks` | 7.x | Hooks lint rules |
| `eslint-plugin-react-refresh` | 0.4.x | Refresh lint rules |

---

## 📁 Folder Structure

```
frontend/src/
├── App.jsx                         # Root — all route definitions
├── main.jsx                        # Entry point (ReactDOM.createRoot)
├── index.css                       # Tailwind + global styles
├── setupTests.js                   # Vitest setup
│
├── context/
│   ├── AuthContext.jsx             # Auth state + Axios API instance
│   └── ToastContext.jsx            # Global toast notifications
│
├── components/
│   ├── Layout.jsx                  # <Outlet> shell with Navbar
│   ├── Navbar.jsx                  # Navigation bar (role-aware links)
│   ├── CompanyReport.jsx           # Company report table
│   ├── CustomerReport.jsx          # Customer report table
│   ├── VehicleReport.jsx           # Vehicle report table
│   └── VehicleTariffSettings.jsx  # Tariff settings form UI
│
├── pages/                          # 52 page-level components
│   └── __tests__/                  # Vitest unit tests (19 test files)
│
└── assets/                         # Images / icons
```

---

## 🔐 AuthContext API

File: `src/context/AuthContext.jsx`

Provides via `useContext(AuthContext)`:

| Value | Type | Description |
|---|---|---|
| `user` | `object \| null` | Current logged-in user |
| `loading` | `boolean` | Auth initialization state |
| `api` | `AxiosInstance` | Pre-configured HTTP client |
| `login(username, password)` | `async fn` | POST `/login.php` |
| `register(name, email, mobile, password)` | `async fn` | POST `/register.php` |
| `logout()` | `async fn` | POST `/logout.php` + clear state |
| `setUser(user)` | `fn` | Manually update user state |

**Axios config:**
```js
baseURL:          VITE_API_URL || 'http://localhost:8080/backend/api'
withCredentials:  true   // sends PHP session cookie
Content-Type:     application/json
```

---

## 🌐 Routes

### Public
| Path | Component |
|---|---|
| `/` | `RoleSelect` |
| `/login` | `Login` |
| `/register` | `Register` |
| `/admin/login` | `AdminLogin` |
| `/admin/register` | `AdminRegister` |
| `/staff/login` | `StaffLogin` |
| `/staff/register` | `StaffRegister` |

### Protected — Bookings
| Path | Component |
|---|---|
| `/bookings` | `Bookings` |
| `/advance-booking` | `AdvanceBooking` |
| `/advance-bookings` | `AdvanceBookings` |
| `/display-bookings` | `DisplayBookings` |
| `/booking-counts` | `BookingCounts` |
| `/edit-booking` | `EditBooking` |
| `/cancel-booking` | `CancelBooking` |
| `/print-booking/:b_id` | `PrintBooking` |

### Protected — Assignments & Trips
| Path | Component |
|---|---|
| `/assignments` | `Assignments` |
| `/assign-later` | `AssignLater` |
| `/ontrip` | `OnTrip` |
| `/localtrip/:v_id` | `LocalTrip` |
| `/trip-closing` | `TripClosing` |
| `/local-trip-closing` | `LocalTripClosing` |
| `/edit-trip` | `EditTrip` |
| `/edit-closed-trip` | `EditClosedTrip` |
| `/trip-refusal` | `TripRefusal` |

### Protected — Fleet & Staff
| Path | Component |
|---|---|
| `/vehicles` | `Vehicles` |
| `/attached-vehicles` | `AttachedVehicles` |
| `/vehicle-attendance` | `VehicleAttendance` |
| `/vehicle-in-out` | `VehicleInOut` |
| `/staff` | `Staff` |
| `/attendance` | `StaffAttendance` |

### Protected — Finance & Admin
| Path | Component |
|---|---|
| `/dashboard` | `Dashboard` |
| `/finance` | `FinanceManagement` |
| `/tariff` | `Tariff` |
| `/tariff-upload` | `TariffUpload` |
| `/customer-upload` | `CustomerUpload` |
| `/settings` | `Settings` |
| `/user-rights` | `UserRights` |
| `/user-logs` | `UserLogs` |

### Protected — Reports
| Path | Component |
|---|---|
| `/reports` | `Reports` |
| `/staff-attendance-report` | `StaffAttendanceReport` |
| `/company-report` | `CompanyReport` |
| `/customer-report` | `CustomerReport` |
| `/running-km-report` | `RunningKMReport` |
| `/shortage-km-report` | `ShortageKMReport` |
| `/vehicle-separate-report` | `VehicleSeparateReport` |
| `/refusal-report` | `RefusalReport` |
| `/cancel-report` | `CancelReport` |
| `/enquiry-report` | `EnquiryReport` |
| `/day-wise-report` | `DayWiseReport` |
| `/user-activity-report` | `UserActivityReport` |

---

## 🧪 Testing

```bash
npm test           # Vitest watch mode
npm run coverage   # Coverage report
```

Tests location: `src/pages/__tests__/` (19 test files)

---

## 🚢 Vercel Deployment

```json
// vercel.json — SPA fallback routing
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

Set env var on Vercel:
```
VITE_API_URL = https://your-backend.com/backend/api
```
