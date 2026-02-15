import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthContext, { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Bookings from './pages/Bookings';
import Assignments from './pages/Assignments';
import CancelBooking from './pages/CancelBooking';
import TripClosing from './pages/TripClosing';
import Reports from './pages/Reports';
import Tariff from './pages/Tariff';
import Settings from './pages/Settings';
import Staff from './pages/Staff';
import VehicleMaster from './pages/VehicleMaster';
import OnTrip from './pages/OnTrip';
import LocalTrip from './pages/LocalTrip';
import StaffAttendance from './pages/StaffAttendance';
import VehicleAttendance from './pages/VehicleAttendance';
import EditTrip from './pages/EditTrip';
import TripRefusal from './pages/TripRefusal';
import EditBooking from './pages/EditBooking';
import PrintBooking from './pages/PrintBooking';
import AdvanceBookings from './pages/AdvanceBookings';
import StaffAttendanceReport from './pages/StaffAttendanceReport';
import RefusalReport from './pages/RefusalReport';
import CancelReport from './pages/CancelReport';
import CompanyReport from './pages/CompanyReport';
import DayWiseReport from './pages/DayWiseReport';
import EnquiryReport from './pages/EnquiryReport';
import RunningKMReport from './pages/RunningKMReport';
import CustomerUpload from './pages/CustomerUpload';
import AssignLater from './pages/AssignLater';
import BookingCounts from './pages/BookingCounts';
import EditClosedTrip from './pages/EditClosedTrip';
import UserActivityReport from './pages/UserActivityReport';
import VehicleSeparateReport from './pages/VehicleSeparateReport';
import UserRights from './pages/UserRights';
import TariffUpload from './pages/TariffUpload';
import AdvanceBooking from './pages/AdvanceBooking';
import AttachedVehicles from './pages/AttachedVehicles';
import LocalTripClosing from './pages/LocalTripClosing';
import DisplayBookings from './pages/DisplayBookings';
import { useContext } from 'react';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route Component (redirects to dashboard if logged in)
const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-100">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
            <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />

            {/* Print Route (No Layout) */}
            <Route
              path="/print-booking/:b_id"
              element={
                <ProtectedRoute>
                  <PrintBooking />
                </ProtectedRoute>
              }
            />

            {/* Protected Routes with Layout */}
            <Route element={<Layout />}>
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vehicles"
                element={
                  <ProtectedRoute>
                    <Vehicles />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bookings"
                element={
                  <ProtectedRoute>
                    <Bookings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/assignments"
                element={
                  <ProtectedRoute>
                    <Assignments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cancel-booking"
                element={
                  <ProtectedRoute>
                    <CancelBooking />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trip-closing"
                element={
                  <ProtectedRoute>
                    <TripClosing />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <Reports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tariff"
                element={
                  <ProtectedRoute>
                    <Tariff />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/staff"
                element={
                  <ProtectedRoute>
                    <Staff />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vehicles"
                element={
                  <ProtectedRoute>
                    <VehicleMaster />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ontrip"
                element={
                  <ProtectedRoute>
                    <OnTrip />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/localtrip/:v_id"
                element={
                  <ProtectedRoute>
                    <LocalTrip />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/attendance"
                element={
                  <ProtectedRoute>
                    <StaffAttendance />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vehicle-attendance"
                element={
                  <ProtectedRoute>
                    <VehicleAttendance />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit-trip"
                element={
                  <ProtectedRoute>
                    <EditTrip />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trip-refusal"
                element={
                  <ProtectedRoute>
                    <TripRefusal />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit-booking"
                element={
                  <ProtectedRoute>
                    <EditBooking />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/advance-bookings"
                element={
                  <ProtectedRoute>
                    <AdvanceBookings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/staff-attendance-report"
                element={
                  <ProtectedRoute>
                    <StaffAttendanceReport />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/refusal-report"
                element={
                  <ProtectedRoute>
                    <RefusalReport />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cancel-report"
                element={
                  <ProtectedRoute>
                    <CancelReport />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/company-report"
                element={
                  <ProtectedRoute>
                    <CompanyReport />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/day-wise-report"
                element={
                  <ProtectedRoute>
                    <DayWiseReport />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/enquiry-report"
                element={
                  <ProtectedRoute>
                    <EnquiryReport />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/running-km-report"
                element={
                  <ProtectedRoute>
                    <RunningKMReport />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer-upload"
                element={
                  <ProtectedRoute>
                    <CustomerUpload />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/assign-later"
                element={
                  <ProtectedRoute>
                    <AssignLater />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/booking-counts"
                element={
                  <ProtectedRoute>
                    <BookingCounts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit-closed-trip"
                element={
                  <ProtectedRoute>
                    <EditClosedTrip />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/user-activity-report"
                element={
                  <ProtectedRoute>
                    <UserActivityReport />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vehicle-separate-report"
                element={
                  <ProtectedRoute>
                    <VehicleSeparateReport />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/user-rights"
                element={
                  <ProtectedRoute>
                    <UserRights />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tariff-upload"
                element={
                  <ProtectedRoute>
                    <TariffUpload />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/advance-booking"
                element={
                  <ProtectedRoute>
                    <AdvanceBooking />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/attached-vehicles"
                element={
                  <ProtectedRoute>
                    <AttachedVehicles />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/local-trip-closing"
                element={
                  <ProtectedRoute>
                    <LocalTripClosing />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/display-bookings"
                element={
                  <ProtectedRoute>
                    <DisplayBookings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/"
                element={
                  <PublicOnlyRoute>
                    <Home />
                  </PublicOnlyRoute>
                }
              />
            </Route>
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
