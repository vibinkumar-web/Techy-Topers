import { useContext, useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const BG     = '#023149';
const ACCENT  = '#689abb';
const GOLD    = '#fdf6e8';

/* ─────────────────────────────────────────────
   Desktop sub-link (inside dropdown)
───────────────────────────────────────────── */
const Sub = ({ to, children, onClick }) => (
    <Link
        to={to}
        onClick={onClick}
        style={{
            display: 'block', padding: '8px 16px', color: '#1e293b',
            textDecoration: 'none', fontSize: '14px', fontWeight: 500,
            transition: 'background 0.2s', borderRadius: '4px',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >{children}</Link>
);

/* ─────────────────────────────────────────────
   Desktop nested hover submenu
───────────────────────────────────────────── */
const NestedMenu = ({ label, children }) => {
    const [show, setShow] = useState(false);
    return (
        <div
            style={{ position: 'relative' }}
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
        >
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 16px', color: '#1e293b',
                cursor: 'default', fontSize: '14px', fontWeight: 500,
                transition: 'background 0.2s', borderRadius: '4px',
                background: show ? '#f1f5f9' : 'transparent',
            }}>
                {label}
                <span className="material-icons" style={{ fontSize: 16 }}>chevron_right</span>
            </div>
            {show && (
                <div style={{
                    position: 'absolute', top: 0, left: '100%', marginLeft: 0,
                    background: '#fff', padding: '0', borderRadius: 8,
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    minWidth: 180, border: '1px solid #e2e8f0', zIndex: 10,
                }}>
                    {children}
                </div>
            )}
        </div>
    );
};

/* ─────────────────────────────────────────────
   Desktop click dropdown
───────────────────────────────────────────── */
const DD = ({ id, label, open, toggle, children }) => {
    const active = open === id;
    return (
        <div data-nav-dd style={{ position: 'relative' }}>
            <button
                onClick={() => toggle(id)}
                style={{
                    border: 'none', cursor: 'pointer',
                    color: active ? '#fff' : 'rgba(255,255,255,.8)',
                    fontSize: '14px', fontWeight: 500,
                    padding: '8px 12px', borderRadius: '8px',
                    display: 'flex', alignItems: 'center', gap: 4,
                    letterSpacing: '.01em',
                    background: active ? '#c5111a' : 'transparent',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#fff'; if (!active) e.currentTarget.style.background = 'rgba(255,255,255,.1)'; }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.color = 'rgba(255,255,255,.8)'; e.currentTarget.style.background = 'transparent'; } }}
            >
                {label}
                <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"
                    style={{ opacity: .7, transform: active ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}>
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

/* ─────────────────────────────────────────────
   Mobile accordion section
───────────────────────────────────────────── */
const MobileSection = ({ label, icon, children }) => {
    const [open, setOpen] = useState(false);
    return (
        <div>
            <button
                onClick={() => setOpen(p => !p)}
                style={{
                    width: '100%', display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', padding: '14px 20px',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#fdf6e8', fontSize: '15px', fontWeight: 600,
                    borderBottom: '1px solid rgba(255,255,255,.07)',
                }}
            >
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="material-icons" style={{ fontSize: 20, color: ACCENT }}>{icon}</span>
                    {label}
                </span>
                <span className="material-icons" style={{
                    fontSize: 20, color: 'rgba(255,255,255,.5)',
                    transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s',
                }}>expand_more</span>
            </button>
            {open && (
                <div style={{ background: 'rgba(0,0,0,.2)', paddingLeft: 16 }}>
                    {children}
                </div>
            )}
        </div>
    );
};

/* ─────────────────────────────────────────────
   Mobile nav link
───────────────────────────────────────────── */
const MobileLink = ({ to, children, onClick }) => (
    <Link
        to={to}
        onClick={onClick}
        style={{
            display: 'block', padding: '11px 20px',
            color: 'rgba(255,255,255,.85)', fontSize: '14px', fontWeight: 500,
            textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,.05)',
            transition: 'background .15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.06)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >{children}</Link>
);

/* ─────────────────────────────────────────────
   Mobile sub-section label (no link)
───────────────────────────────────────────── */
const MobileSubLabel = ({ children }) => (
    <div style={{
        padding: '8px 20px 4px', fontSize: '11px', fontWeight: 800,
        textTransform: 'uppercase', color: ACCENT, letterSpacing: '.08em',
    }}>{children}</div>
);

/* ═══════════════════════════════════════════════════════════
   NAVBAR
═══════════════════════════════════════════════════════════ */
const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [open, setOpen]             = useState(null);   // desktop dropdown
    const [mobileOpen, setMobileOpen] = useState(false);  // mobile drawer
    const navRef = useRef(null);

    const handleLogout = () => { logout(); navigate('/login'); setMobileOpen(false); };

    /* close desktop dropdown on outside click */
    useEffect(() => {
        const close = e => { if (!e.target.closest('[data-nav-dd]')) setOpen(null); };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, []);

    /* close everything on route change */
    useEffect(() => { setMobileOpen(false); setOpen(null); }, [location.pathname]);

    /* prevent body scroll when mobile menu is open */
    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileOpen]);

    const isActive = path => location.pathname === path || location.pathname.startsWith(path + '/');
    const toggle   = id => setOpen(p => p === id ? null : id);
    const closeMob = () => setMobileOpen(false);

    /* shared desktop nav link style */
    const navLinkStyle = path => ({
        color: isActive(path) ? '#fff' : 'rgba(255,255,255,.8)',
        textDecoration: 'none', fontSize: '14px', fontWeight: 500,
        padding: '8px 12px', borderRadius: '8px', letterSpacing: '.01em',
        background: isActive(path) ? '#c5111a' : 'transparent',
        display: 'inline-block', whiteSpace: 'nowrap',
    });

    return (
        <>
            <nav
                ref={navRef}
                style={{
                    background: BG, position: 'sticky', top: 0, zIndex: 300,
                    boxShadow: '0 2px 8px rgba(0,0,0,.15)',
                    borderBottom: '1px solid rgba(255,255,255,.1)',
                }}
            >
                {/* ── Inner bar ── */}
                <div style={{
                    maxWidth: 1280, margin: '0 auto',
                    padding: '0 20px', height: 64,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    position: 'relative',
                }}>

                    {/* ── LEFT: Logo ── */}
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
                        <span className="material-icons" style={{ fontSize: 26, color: GOLD }}>local_taxi</span>
                        <span style={{ color: GOLD, fontSize: '20px', fontWeight: 900, letterSpacing: '-.3px', lineHeight: 1 }}>TaxiPro</span>
                    </Link>

                    {/* ── CENTER: Desktop Nav (hidden below 1024px via class) ── */}
                    {user && (
                        <div className="nav-desktop" style={{
                            position: 'absolute', left: '50%', top: '50%',
                            transform: 'translate(-50%, -50%)',
                            display: 'flex', alignItems: 'center', gap: 4,
                            zIndex: 1,
                        }}>
                            <Link
                                to="/dashboard"
                                style={navLinkStyle('/dashboard')}
                                onMouseEnter={e => { e.currentTarget.style.color = '#fff'; if (!isActive('/dashboard')) e.currentTarget.style.background = 'rgba(255,255,255,.1)'; }}
                                onMouseLeave={e => { if (!isActive('/dashboard')) { e.currentTarget.style.color = 'rgba(255,255,255,.8)'; e.currentTarget.style.background = 'transparent'; } }}
                            >Dashboard</Link>

                            <DD id="ops" label="Operations" open={open} toggle={toggle}>
                                <Sub to="/bookings"           onClick={() => setOpen(null)}>Bookings</Sub>
                                <Sub to="/advance-bookings"   onClick={() => setOpen(null)}>Adv. Bookings</Sub>
                                <Sub to="/edit-booking"       onClick={() => setOpen(null)}>Edit Booking</Sub>
                                <Sub to="/display-bookings"   onClick={() => setOpen(null)}>Display Bookings</Sub>
                                <div style={{ margin: '8px 0', borderTop: '1px solid #fdf6e8' }} />
                                <Sub to="/assignments"        onClick={() => setOpen(null)}>Assignments</Sub>
                                <Sub to="/assign-later"       onClick={() => setOpen(null)}>Assign Later</Sub>
                                <div style={{ margin: '8px 0', borderTop: '1px solid #fdf6e8' }} />
                                <Sub to="/trip-closing"       onClick={() => setOpen(null)}>Trip Closing</Sub>
                                <Sub to="/edit-closed-trip"   onClick={() => setOpen(null)}>Edit Closed Trip</Sub>
                                <Sub to="/trip-refusal"       onClick={() => setOpen(null)}>Trip Refusal</Sub>
                                <Sub to="/ontrip"             onClick={() => setOpen(null)}>On Trip</Sub>
                                <Sub to="/local-trip-closing" onClick={() => setOpen(null)}>Local Trip Closing</Sub>
                            </DD>

                            <DD id="fleet" label="Fleet & Staff" open={open} toggle={toggle}>
                                <Sub to="/vehicles"            onClick={() => setOpen(null)}>Vehicles</Sub>
                                <Sub to="/vehicle-attendance"  onClick={() => setOpen(null)}>Vehicle Attendance</Sub>
                                <Sub to="/vehicle-in-out"      onClick={() => setOpen(null)}>Vehicle In & Out</Sub>
                                <Sub to="/attached-vehicles"   onClick={() => setOpen(null)}>Attached Vehicles</Sub>
                                {user.role === 'admin' && (<>
                                    <div style={{ margin: '8px 0', borderTop: '1px solid #fdf6e8' }} />
                                    <Sub to="/staff"      onClick={() => setOpen(null)}>Staff Master</Sub>
                                    <Sub to="/attendance" onClick={() => setOpen(null)}>Staff Attendance</Sub>
                                </>)}
                            </DD>

                            <Link
                                to="/finance"
                                style={navLinkStyle('/finance')}
                                onMouseEnter={e => { e.currentTarget.style.color = '#fff'; if (!isActive('/finance')) e.currentTarget.style.background = 'rgba(255,255,255,.1)'; }}
                                onMouseLeave={e => { if (!isActive('/finance')) { e.currentTarget.style.color = 'rgba(255,255,255,.8)'; e.currentTarget.style.background = 'transparent'; } }}
                            >Ledger</Link>

                            <DD id="reports" label="Reports" open={open} toggle={toggle}>
                                <Sub to="/vehicle-separate-report"  onClick={() => setOpen(null)}>Vehicle Report</Sub>
                                <Sub to="/shortage-km-report"       onClick={() => setOpen(null)}>Shortage KM Report</Sub>
                                <Sub to="/customer-report"          onClick={() => setOpen(null)}>Customer Report</Sub>
                                <Sub to="/staff-attendance-report"  onClick={() => setOpen(null)}>Staff Report</Sub>
                                <NestedMenu label="Booking">
                                    <Sub to="/booking-counts"  onClick={() => setOpen(null)}>Booking Count</Sub>
                                    <Sub to="/cancel-report"   onClick={() => setOpen(null)}>Cancelled</Sub>
                                    <Sub to="/enquiry-report"  onClick={() => setOpen(null)}>Enquiry</Sub>
                                    <Sub to="#"                onClick={() => setOpen(null)}>No Cab</Sub>
                                    <Sub to="/refusal-report"  onClick={() => setOpen(null)}>Refused</Sub>
                                </NestedMenu>
                                <Sub to="/company-report"           onClick={() => setOpen(null)}>Company Wise</Sub>
                                <Sub to="/running-km-report"        onClick={() => setOpen(null)}>Running KM</Sub>
                                <Sub to="/day-wise-report"          onClick={() => setOpen(null)}>Day Wise Customer</Sub>
                                <Sub to="/vehicle-attendance"       onClick={() => setOpen(null)}>Vehicle Attendance</Sub>
                            </DD>

                            {user.role === 'admin' && (
                                <DD id="admin" label="Admin" open={open} toggle={toggle}>
                                    <Sub to="/tariff"           onClick={() => setOpen(null)}>Tariff Master</Sub>
                                    <Sub to="/tariff-upload"    onClick={() => setOpen(null)}>Bulk Tariff Upload</Sub>
                                    <Sub to="/customer-upload"  onClick={() => setOpen(null)}>Customer Upload</Sub>
                                    <Sub to="/user-rights"      onClick={() => setOpen(null)}>User Rights</Sub>
                                    <Sub to="/settings"         onClick={() => setOpen(null)}>Settings</Sub>
                                </DD>
                            )}
                        </div>
                    )}

                    {/* ── RIGHT ── */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, zIndex: 2, flexShrink: 0 }}>
                        {user ? (
                            <>
                                {/* Notification bell — hidden on very small screens */}
                                <button
                                    className="nav-icon-btn"
                                    title="Notifications"
                                    style={{
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        padding: 6, display: 'flex', color: 'rgba(255,255,255,.6)',
                                        borderRadius: 8,
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,.6)'}
                                >
                                    <span className="material-icons" style={{ fontSize: 22 }}>notifications_none</span>
                                </button>

                                {/* Username chip — text hidden on small screens */}
                                <div className="nav-desktop" style={{
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.15)',
                                    borderRadius: 24, padding: '4px 14px 4px 4px',
                                }}>
                                    <div style={{
                                        width: 26, height: 26, borderRadius: '50%',
                                        background: '#c5111a', color: '#fff',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 12, fontWeight: 800, flexShrink: 0,
                                    }}>
                                        {user.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <span style={{ color: '#fdf6e8', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                        {user.name}
                                    </span>
                                </div>

                                {/* Avatar only on mobile */}
                                <div className="nav-mobile-avatar" style={{
                                    width: 32, height: 32, borderRadius: '50%',
                                    background: '#c5111a', color: '#fff',
                                    display: 'none', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 13, fontWeight: 800,
                                }}>
                                    {user.name?.charAt(0).toUpperCase() || 'U'}
                                </div>

                                {/* Logout — desktop only */}
                                <button
                                    className="nav-desktop nav-logout-btn"
                                    onClick={handleLogout}
                                    style={{
                                        background: '#c5111a', color: '#fff', border: 'none',
                                        borderRadius: '8px', padding: '8px 14px',
                                        fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: 6,
                                        whiteSpace: 'nowrap',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#7d0907'}
                                    onMouseLeave={e => e.currentTarget.style.background = '#c5111a'}
                                >
                                    <span className="material-icons" style={{ fontSize: 16 }}>logout</span>
                                    Logout
                                </button>

                                {/* Hamburger — mobile/tablet only */}
                                <button
                                    className="nav-hamburger"
                                    onClick={() => setMobileOpen(p => !p)}
                                    aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                                    style={{
                                        background: mobileOpen ? 'rgba(255,255,255,.15)' : 'none',
                                        border: 'none', cursor: 'pointer',
                                        padding: 8, borderRadius: 8, display: 'none',
                                        alignItems: 'center', color: '#fdf6e8',
                                    }}
                                >
                                    <span className="material-icons" style={{ fontSize: 26 }}>
                                        {mobileOpen ? 'close' : 'menu'}
                                    </span>
                                </button>
                            </>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <Link to="/login" style={{
                                    color: 'rgba(255,255,255,.8)', textDecoration: 'none',
                                    fontSize: '14px', fontWeight: 500,
                                }}>Log In</Link>
                                <Link to="/register" style={{
                                    background: ACCENT, color: '#fff', borderRadius: '8px',
                                    padding: '8px 16px', fontSize: '14px', fontWeight: 700, textDecoration: 'none',
                                    whiteSpace: 'nowrap',
                                }}>Register</Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* ══════════════════════════════════════
                    MOBILE DRAWER  (below 1024px)
                ══════════════════════════════════════ */}
                {mobileOpen && user && (
                    <div style={{
                        position: 'fixed', top: 64, left: 0, right: 0, bottom: 0,
                        background: BG, zIndex: 299, overflowY: 'auto',
                        borderTop: '1px solid rgba(255,255,255,.12)',
                        display: 'flex', flexDirection: 'column',
                    }}>
                        {/* User info strip */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '16px 20px', background: 'rgba(0,0,0,.25)',
                            borderBottom: '1px solid rgba(255,255,255,.1)',
                        }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: '50%',
                                background: '#c5111a', color: '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 16, fontWeight: 800, flexShrink: 0,
                            }}>
                                {user.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                                <div style={{ color: '#fdf6e8', fontWeight: 700, fontSize: 15 }}>{user.name}</div>
                                <div style={{ color: ACCENT, fontSize: 12, textTransform: 'capitalize' }}>{user.role || 'user'}</div>
                            </div>
                        </div>

                        {/* Dashboard direct link */}
                        <MobileLink to="/dashboard" onClick={closeMob}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span className="material-icons" style={{ fontSize: 20, color: ACCENT }}>dashboard</span>
                                Dashboard
                            </span>
                        </MobileLink>

                        {/* Operations */}
                        <MobileSection label="Operations" icon="directions_car">
                            <MobileSubLabel>Bookings</MobileSubLabel>
                            <MobileLink to="/bookings"          onClick={closeMob}>Bookings</MobileLink>
                            <MobileLink to="/advance-bookings"  onClick={closeMob}>Adv. Bookings</MobileLink>
                            <MobileLink to="/edit-booking"      onClick={closeMob}>Edit Booking</MobileLink>
                            <MobileLink to="/display-bookings"  onClick={closeMob}>Display Bookings</MobileLink>
                            <MobileSubLabel>Assignments</MobileSubLabel>
                            <MobileLink to="/assignments"       onClick={closeMob}>Assignments</MobileLink>
                            <MobileLink to="/assign-later"      onClick={closeMob}>Assign Later</MobileLink>
                            <MobileSubLabel>Trips</MobileSubLabel>
                            <MobileLink to="/trip-closing"       onClick={closeMob}>Trip Closing</MobileLink>
                            <MobileLink to="/edit-closed-trip"   onClick={closeMob}>Edit Closed Trip</MobileLink>
                            <MobileLink to="/trip-refusal"       onClick={closeMob}>Trip Refusal</MobileLink>
                            <MobileLink to="/ontrip"             onClick={closeMob}>On Trip</MobileLink>
                            <MobileLink to="/local-trip-closing" onClick={closeMob}>Local Trip Closing</MobileLink>
                        </MobileSection>

                        {/* Fleet & Staff */}
                        <MobileSection label="Fleet & Staff" icon="commute">
                            <MobileLink to="/vehicles"           onClick={closeMob}>Vehicles</MobileLink>
                            <MobileLink to="/vehicle-attendance" onClick={closeMob}>Vehicle Attendance</MobileLink>
                            <MobileLink to="/vehicle-in-out"     onClick={closeMob}>Vehicle In & Out</MobileLink>
                            <MobileLink to="/attached-vehicles"  onClick={closeMob}>Attached Vehicles</MobileLink>
                            {user.role === 'admin' && (<>
                                <MobileLink to="/staff"      onClick={closeMob}>Staff Master</MobileLink>
                                <MobileLink to="/attendance" onClick={closeMob}>Staff Attendance</MobileLink>
                            </>)}
                        </MobileSection>

                        {/* Ledger */}
                        <MobileLink to="/finance" onClick={closeMob}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span className="material-icons" style={{ fontSize: 20, color: ACCENT }}>account_balance_wallet</span>
                                Ledger
                            </span>
                        </MobileLink>

                        {/* Reports */}
                        <MobileSection label="Reports" icon="bar_chart">
                            <MobileLink to="/vehicle-separate-report" onClick={closeMob}>Vehicle Report</MobileLink>
                            <MobileLink to="/shortage-km-report"      onClick={closeMob}>Shortage KM Report</MobileLink>
                            <MobileLink to="/customer-report"         onClick={closeMob}>Customer Report</MobileLink>
                            <MobileLink to="/staff-attendance-report" onClick={closeMob}>Staff Report</MobileLink>
                            <MobileSubLabel>Booking Reports</MobileSubLabel>
                            <MobileLink to="/booking-counts"  onClick={closeMob}>Booking Count</MobileLink>
                            <MobileLink to="/cancel-report"   onClick={closeMob}>Cancelled</MobileLink>
                            <MobileLink to="/enquiry-report"  onClick={closeMob}>Enquiry</MobileLink>
                            <MobileLink to="/refusal-report"  onClick={closeMob}>Refused</MobileLink>
                            <MobileLink to="/company-report"  onClick={closeMob}>Company Wise</MobileLink>
                            <MobileLink to="/running-km-report" onClick={closeMob}>Running KM</MobileLink>
                            <MobileLink to="/day-wise-report"   onClick={closeMob}>Day Wise Customer</MobileLink>
                        </MobileSection>

                        {/* Admin only */}
                        {user.role === 'admin' && (
                            <MobileSection label="Admin" icon="admin_panel_settings">
                                <MobileLink to="/tariff"          onClick={closeMob}>Tariff Master</MobileLink>
                                <MobileLink to="/tariff-upload"   onClick={closeMob}>Bulk Tariff Upload</MobileLink>
                                <MobileLink to="/customer-upload" onClick={closeMob}>Customer Upload</MobileLink>
                                <MobileLink to="/user-rights"     onClick={closeMob}>User Rights</MobileLink>
                                <MobileLink to="/settings"        onClick={closeMob}>Settings</MobileLink>
                            </MobileSection>
                        )}

                        {/* Logout */}
                        <div style={{ padding: '16px 20px', marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,.1)' }}>
                            <button
                                onClick={handleLogout}
                                style={{
                                    width: '100%', background: '#c5111a', color: '#fff',
                                    border: 'none', borderRadius: 10, padding: '13px 0',
                                    fontSize: '15px', fontWeight: 700, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = '#7d0907'}
                                onMouseLeave={e => e.currentTarget.style.background = '#c5111a'}
                            >
                                <span className="material-icons" style={{ fontSize: 18 }}>logout</span>
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </nav>
        </>
    );
};

export default Navbar;
