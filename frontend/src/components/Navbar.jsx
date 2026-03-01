import { useContext, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const BG = '#023149';   /* dark blue nav background      */
const ACCENT = '#689abb'; /* soft blue accent */
const GOLD = '#fdf6e8';   /* Varden — brand accent (replaced Gold to stick to palette) */

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [open, setOpen] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => { logout(); navigate('/login'); };

    /* close dropdown on outside click */
    useEffect(() => {
        const close = e => { if (!e.target.closest('[data-nav-dd]')) setOpen(null); };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, []);

    /* close mobile menu on route change */
    useEffect(() => { setMobileOpen(false); setOpen(null); }, [location.pathname]);

    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

    // Reusable small sub-link
    const Sub = ({ to, children }) => (
        <Link
            to={to}
            onClick={() => setOpen(null)}
            style={{
                display: 'block', padding: '8px 16px', color: '#1e293b',
                textDecoration: 'none', fontSize: '14px', fontWeight: 500,
                transition: 'background 0.2s', borderRadius: '4px'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >{children}</Link>
    );

    // Reusable nested submenu
    const NestedMenu = ({ label, children }) => {
        const [show, setShow] = useState(false);
        return (
            <div
                style={{ position: 'relative' }}
                onMouseEnter={() => setShow(true)}
                onMouseLeave={() => setShow(false)}
            >
                <div
                    style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '8px 16px', color: '#1e293b',
                        cursor: 'default', fontSize: '14px', fontWeight: 500,
                        transition: 'background 0.2s', borderRadius: '4px',
                        background: show ? '#f1f5f9' : 'transparent'
                    }}
                >
                    {label}
                    <span className="material-icons" style={{ fontSize: 16 }}>chevron_right</span>
                </div>
                {show && (
                    <div style={{
                        position: 'absolute', top: 0, left: '100%', marginLeft: 4,
                        background: '#fff', padding: 8, borderRadius: 8,
                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
                        minWidth: 180, border: '1px solid #e2e8f0', zIndex: 10
                    }}>
                        {children}
                    </div>
                )}
            </div>
        );
    };

    // Main dropdown item
    const DD = ({ id, label, children }) => {
        const active = open === id;
        return (
            <div data-nav-dd style={{ position: 'relative' }}>
                <button
                    onClick={() => setOpen(p => p === id ? null : id)}
                    style={{
                        border: 'none', cursor: 'pointer',
                        color: active ? '#fff' : 'rgba(255,255,255,.8)',
                        fontSize: '14px', fontWeight: 500,
                        padding: '8px 12px', borderRadius: '8px',
                        display: 'flex', alignItems: 'center', gap: 4,
                        letterSpacing: '.01em',
                        background: active ? '#c5111a' : 'transparent',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = active ? '#c5111a' : 'rgba(255,255,255,.1)'; }}
                    onMouseLeave={e => { if (!active) { e.currentTarget.style.color = 'rgba(255,255,255,.8)'; e.currentTarget.style.background = 'transparent'; } }}
                >
                    {label}
                    <svg
                        width="12" height="12" viewBox="0 0 20 20" fill="currentColor"
                        style={{ opacity: .7, transform: active ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}
                    >
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                </button>

                {active && (
                    <div style={{
                        position: 'absolute', top: 'calc(100% + 8px)', left: 0,
                        background: '#fff', borderRadius: '8px',
                        boxShadow: '0 8px 32px rgba(0,0,0,.14)',
                        border: '1px solid #e8d4aa',
                        zIndex: 400, padding: '8px 0', minWidth: '200px',
                    }}>
                        {children}
                    </div>
                )}
            </div>
        );
    };

    return (
        <nav style={{
            background: BG,
            position: 'sticky', top: 0, zIndex: 300,
            boxShadow: '0 2px 8px rgba(0,0,0,.15)',
            borderBottom: '1px solid rgba(255,255,255,.1)',
        }}>
            {/* ── Inner wrapper: 1280px centered ── */}
            <div style={{
                maxWidth: 1280,
                margin: '0 auto',
                padding: '0 32px',
                height: 64,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                position: 'relative',
            }}>

                {/* ── LEFT: Logo ── */}
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
                    <span className="material-icons" style={{ fontSize: 24, color: GOLD }}>local_taxi</span>
                    <span style={{ color: GOLD, fontSize: '20px', fontWeight: 900, letterSpacing: '-.3px', lineHeight: 1 }}>TaxiPro</span>
                </Link>

                {/* ── CENTER: Nav links (absolutely centered) ── */}
                {user && (
                    <div style={{
                        position: 'absolute', left: '50%', top: '50%',
                        transform: 'translate(-50%, -50%)',
                        display: 'flex', alignItems: 'center', gap: 8,
                        zIndex: 1,
                    }}>
                        <Link
                            to="/dashboard"
                            style={{
                                color: isActive('/dashboard') ? '#fff' : 'rgba(255,255,255,.8)',
                                textDecoration: 'none',
                                fontSize: '14px', fontWeight: 500,
                                padding: '8px 12px', borderRadius: '8px', letterSpacing: '.01em',
                                background: isActive('/dashboard') ? '#c5111a' : 'transparent',
                                display: 'inline-block',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = isActive('/dashboard') ? '#c5111a' : 'rgba(255,255,255,.1)'; }}
                            onMouseLeave={e => { if (!isActive('/dashboard')) { e.currentTarget.style.color = 'rgba(255,255,255,.8)'; e.currentTarget.style.background = 'transparent'; } }}
                        >Dashboard</Link>



                        <DD id="ops" label="Operations">
                            <Sub to="/bookings">Bookings</Sub>
                            <Sub to="/advance-bookings">Adv. Bookings</Sub>
                            <Sub to="/edit-booking">Edit Booking</Sub>
                            <Sub to="/display-bookings">Display Bookings</Sub>
                            <div style={{ margin: '8px 0', borderTop: '1px solid #fdf6e8' }} />
                            <Sub to="/assignments">Assignments</Sub>
                            <Sub to="/assign-later">Assign Later</Sub>
                            <div style={{ margin: '8px 0', borderTop: '1px solid #fdf6e8' }} />
                            <Sub to="/trip-closing">Trip Closing</Sub>
                            <Sub to="/edit-closed-trip">Edit Closed Trip</Sub>
                            <Sub to="/trip-refusal">Trip Refusal</Sub>
                            <Sub to="/ontrip">On Trip</Sub>
                            <Sub to="/local-trip-closing">Local Trip Closing</Sub>
                        </DD>

                        <DD id="fleet" label="Fleet & Staff">
                            <Sub to="/vehicles">Vehicles</Sub>
                            <Sub to="/vehicle-attendance">Vehicle Attendance</Sub>
                            <Sub to="/vehicle-in-out">Vehicle In & Out</Sub>
                            <Sub to="/attached-vehicles">Attached Vehicles</Sub>
                            {user.role === 'admin' && (<>
                                <div style={{ margin: '8px 0', borderTop: '1px solid #fdf6e8' }} />
                                <Sub to="/staff">Staff Master</Sub>
                                <Sub to="/attendance">Staff Attendance</Sub>
                            </>)}
                        </DD>

                        <Link
                            to="/finance"
                            style={{
                                color: isActive('/finance') ? '#fff' : 'rgba(255,255,255,.8)',
                                textDecoration: 'none',
                                fontSize: '14px', fontWeight: 500,
                                padding: '8px 12px', borderRadius: '8px', letterSpacing: '.01em',
                                background: isActive('/finance') ? '#c5111a' : 'transparent',
                                display: 'inline-block',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = isActive('/finance') ? '#c5111a' : 'rgba(255,255,255,.1)'; }}
                            onMouseLeave={e => { if (!isActive('/finance')) { e.currentTarget.style.color = 'rgba(255,255,255,.8)'; e.currentTarget.style.background = 'transparent'; } }}
                        >Ledger</Link>

                        <DD id="reports" label="Reports">
                            <Sub to="/vehicle-separate-report">Vechile Report</Sub>
                            <Sub to="/shortage-km-report">Shortage KM Report</Sub>
                            <Sub to="/customer-report">Customer Report</Sub>
                            <Sub to="/staff-attendance-report">Staff Report</Sub>

                            <NestedMenu label="Booking">
                                <Sub to="/booking-counts">Booking Count</Sub>
                                <Sub to="/cancel-report">Cancelled</Sub>
                                <Sub to="/enquiry-report">Enquiry</Sub>
                                <Sub to="#">No Cab</Sub>
                                <Sub to="/refusal-report">Refused</Sub>
                            </NestedMenu>

                            <Sub to="/company-report">Company Wise</Sub>
                            <Sub to="/running-km-report">Running KM</Sub>
                            <Sub to="/day-wise-report">Day Wise Customer</Sub>
                            <Sub to="/vehicle-attendance">Vechile Attendance</Sub>
                        </DD>

                        {user.role === 'admin' && (
                            <DD id="admin" label="Admin">
                                <Sub to="/tariff">Tariff Master</Sub>
                                <Sub to="/tariff-upload">Bulk Tariff Upload</Sub>
                                <Sub to="/customer-upload">Customer Upload</Sub>
                                <Sub to="/user-rights">User Rights</Sub>
                                <Sub to="/settings">Settings</Sub>
                            </DD>
                        )}
                    </div>
                )}

                {/* ── RIGHT: user info + logout ── */}
                {user ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, zIndex: 2 }}>
                        {/* Notification bell */}
                        <button
                            title="Notifications"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', color: 'rgba(255,255,255,.6)' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,.6)'}
                        >
                            <span className="material-icons" style={{ fontSize: 24 }}>notifications_none</span>
                        </button>

                        {/* Username chip */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.15)',
                            borderRadius: 24, padding: '4px 16px 4px 4px',
                        }}>
                            <div style={{
                                width: 24, height: 24, borderRadius: '50%',
                                background: '#c5111a', color: '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 12, fontWeight: 800, flexShrink: 0,
                            }}>
                                {user.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <span style={{ color: '#fdf6e8', fontSize: '14px', fontWeight: 600 }}>
                                {user.name}
                            </span>
                        </div>

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            style={{
                                background: '#c5111a', color: '#fff', border: 'none',
                                borderRadius: '8px', padding: '8px 16px',
                                fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: 8,
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#7d0907'}
                            onMouseLeave={e => e.currentTarget.style.background = '#c5111a'}
                        >
                            <span className="material-icons" style={{ fontSize: 16 }}>logout</span>
                            Logout
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, zIndex: 2 }}>
                        <Link to="/login" style={{
                            color: 'rgba(255,255,255,.75)', textDecoration: 'none',
                            fontSize: '14px', fontWeight: 500,
                        }}>Log In</Link>
                        <Link to="/register" style={{
                            background: ACCENT, color: '#fff', borderRadius: '8px',
                            padding: '8px 16px', fontSize: '14px', fontWeight: 700, textDecoration: 'none',
                        }}>Register</Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
