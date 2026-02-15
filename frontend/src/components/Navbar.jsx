import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Helper for Dropdown Link
    const NavLink = ({ to, children }) => (
        <Link
            to={to}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
            onClick={() => setIsOpen(false)}
        >
            {children}
        </Link>
    );

    // Helper for Mobile Link
    const MobileLink = ({ to, children }) => (
        <Link
            to={to}
            className="block text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-base font-medium"
            onClick={() => setIsOpen(false)}
        >
            {children}
        </Link>
    );

    const Dropdown = ({ title, children }) => (
        <div className="relative group">
            <button className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium inline-flex items-center">
                <span>{title}</span>
                <svg className="ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
            <div className="absolute left-0 mt-0 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-50">
                <div className="py-1">
                    {children}
                </div>
            </div>
        </div>
    );

    return (
        <nav className="bg-white shadow-md relative z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/" className="text-2xl font-bold text-indigo-600">
                            Taxi
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex space-x-1 items-center">
                        {user ? (
                            <>
                                <Link to="/dashboard" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                                    Dashboard
                                </Link>

                                <Dropdown title="Operations">
                                    <NavLink to="/bookings">Bookings</NavLink>
                                    <NavLink to="/advance-bookings">Adv. Bookings</NavLink>
                                    <NavLink to="/edit-booking">Edit Booking</NavLink>
                                    <NavLink to="/display-bookings">Display Bookings</NavLink>
                                    <NavLink to="/assignments">Assignments</NavLink>
                                    <NavLink to="/assign-later">Assign Later</NavLink>
                                    <NavLink to="/trip-closing">Trip Closing</NavLink>
                                    <NavLink to="/edit-closed-trip">Edit Closed Trip</NavLink>
                                    <NavLink to="/trip-refusal">Trip Refusal</NavLink>
                                    <NavLink to="/ontrip">On Trip</NavLink>
                                    <NavLink to="/local-trip-closing">Local Trip Closing</NavLink>
                                </Dropdown>

                                <Dropdown title="Fleet & Staff">
                                    <NavLink to="/vehicles">Vehicles</NavLink>
                                    <NavLink to="/vehicle-attendance">Vehicle Attendance</NavLink>
                                    <NavLink to="/attached-vehicles">Attached Vehicles</NavLink>
                                    <NavLink to="/staff">Staff</NavLink>
                                    <NavLink to="/attendance">Staff Attendance</NavLink>
                                </Dropdown>

                                <Dropdown title="Reports">
                                    <NavLink to="/reports">Reports Dashboard</NavLink>
                                    <NavLink to="/staff-attendance-report">Staff Attendance Rpt</NavLink>
                                    <NavLink to="/refusal-report">Refusal Report</NavLink>
                                    <NavLink to="/cancel-report">Cancelled Bookings</NavLink>
                                    <NavLink to="/company-report">Company Report</NavLink>
                                    <NavLink to="/day-wise-report">Day Wise Report</NavLink>
                                    <NavLink to="/enquiry-report">Enquiry Report</NavLink>
                                    <NavLink to="/running-km-report">Running KM</NavLink>
                                    <NavLink to="/user-activity-report">User Activity</NavLink>
                                    <NavLink to="/vehicle-separate-report">Vehicle Report</NavLink>
                                    <NavLink to="/booking-counts">Booking Counts</NavLink>
                                </Dropdown>

                                <Dropdown title="Admin">
                                    <NavLink to="/tariff">Tariff Master</NavLink>
                                    <NavLink to="/tariff-upload">Bulk Tariff Upload</NavLink>
                                    <NavLink to="/customer-upload">Customer Upload</NavLink>
                                    <NavLink to="/user-rights">User Rights</NavLink>
                                    <NavLink to="/settings">Settings</NavLink>
                                </Dropdown>

                                <span className="text-gray-500 text-sm ml-4">
                                    {user.name}
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="ml-4 bg-white text-gray-700 hover:text-red-600 border border-gray-300 px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                                    Login
                                </Link>
                                <Link to="/register" className="ml-4 bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium">
                                    Register
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-indigo-600 focus:outline-none"
                        >
                            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg">
                        {user ? (
                            <>
                                <MobileLink to="/dashboard">Dashboard</MobileLink>
                                <div className="border-t border-gray-200 pt-2">
                                    <p className="px-3 text-xs font-semibold text-gray-400 uppercase">Operations</p>
                                    <MobileLink to="/bookings">Bookings</MobileLink>
                                    <MobileLink to="/assignments">Assignments</MobileLink>
                                    <MobileLink to="/trip-closing">Trip Closing</MobileLink>
                                </div>
                                <div className="border-t border-gray-200 pt-2">
                                    <p className="px-3 text-xs font-semibold text-gray-400 uppercase">Reports</p>
                                    <MobileLink to="/reports">All Reports</MobileLink>
                                </div>
                                <div className="border-t border-gray-200 pt-2">
                                    <span className="block px-3 py-2 text-sm text-gray-500">Welcome, {user.name}</span>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left block text-red-600 px-3 py-2 rounded-md text-base font-medium"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <MobileLink to="/login">Login</MobileLink>
                                <MobileLink to="/register">Register</MobileLink>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
