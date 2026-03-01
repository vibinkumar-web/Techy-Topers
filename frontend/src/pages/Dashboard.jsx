import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

/* ── Palette ── */
const NAVY = '#023149';
const RED = '#c5111a';
const CREAM = '#fdf6e8';
const BLUE = '#689abb';

/* ── Shared style helpers ── */
const S = {
    card: (bg, extra = {}) => ({
        background: bg,
        borderRadius: 16,
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(2, 49, 73, .08)',
        ...extra,
    }),
    lbl: (c = 'rgba(255,255,255,.6)') => ({
        margin: 0, fontSize: 12, fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '.1em', color: c,
    }),
    num: (c = '#fff') => ({
        margin: '8px 0 0', fontSize: 32, fontWeight: 900, color: c, lineHeight: 1,
    }),
    iconCircle: (bg, size = 40) => ({
        width: size, height: size, borderRadius: '50%', background: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }),
    iconSq: (bg = 'rgba(255,255,255,.15)') => ({
        width: 40, height: 40, borderRadius: 8, background: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
    }),
};

/* ══════════════════════════════════════════
   ADMIN DASHBOARD
══════════════════════════════════════════ */
const AdminDashboard = ({ user, stats, navigate }) => {
    const toast = useToast();
    const D = stats || {};
    const tc = D.total_customers ?? 0;
    const tb = D.total_bookings ?? 0;
    const cb = D.completed_bookings ?? 0;
    const ot = D.on_trip ?? 0;
    const up = D.advance_booking ?? 0;
    const tv = D.total_drivers ?? 0;
    const av = D.active_drivers ?? 0;
    const iv = D.inactive_drivers ?? 0;
    const can = D.cancelled_booking ?? 0;
    const pa = D.pending_assignments ?? 0;

    const actions = [
        { label: 'New Booking', icon: 'add_circle', to: '/bookings', bg: RED, fg: '#fff' },
        { label: 'Assignments', icon: 'assignment', to: '/assignments', bg: NAVY, fg: '#fff' },
        { label: 'Trip Closing', icon: 'check_circle', to: '/trip-closing', bg: BLUE, fg: '#fff' },
        { label: 'Vehicles', icon: 'directions_car', to: '/vehicles', bg: NAVY, fg: '#fff' },
        { label: 'Staff', icon: 'groups', to: '/staff', bg: BLUE, fg: '#fff' },
        { label: 'Reports', icon: 'bar_chart', to: '/reports', bg: NAVY, fg: '#fff' },
        { label: 'Tariff', icon: 'table_view', to: '/tariff', bg: CREAM, fg: NAVY, border: `1px solid #e8d4aa` },
        { label: 'Settings', icon: 'settings', to: '/settings', bg: CREAM, fg: NAVY, border: `1px solid #e8d4aa` },
    ];

    return (
        <div style={{ background: CREAM, minHeight: '100vh', fontFamily: "'Outfit', sans-serif", overflowX: 'hidden' }}>

            {/* ── Dark Navy Page Header Band ── */}
            <div className="page-header">
                <div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                background: 'rgba(197,17,26,.25)', border: '1px solid rgba(197,17,26,.45)',
                                color: '#fca5a5', borderRadius: 20, padding: '4px 12px',
                                fontSize: 10, fontWeight: 700, letterSpacing: '.05em',
                            }}>
                                <span className="material-icons" style={{ fontSize: 12 }}>shield</span>
                                ADMIN
                            </span>
                        </div>
                        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>Admin Dashboard</h1>
                        <p style={{ margin: '4px 0 0', fontSize: 14, color: 'rgba(255,255,255,.6)' }}>
                            Welcome back, <strong style={{ color: '#fff' }}>{user?.name}</strong>
                        </p>
                    </div>
                    <button onClick={() => window.location.reload()}
                        style={{ background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.18)', borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.1)'}>
                        <span className="material-icons" style={{ fontSize: 16 }}>refresh</span>
                        Refresh
                    </button>
                </div>
            </div>

            {/* ── Page Body ── */}
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 32px 40px', boxSizing: 'border-box', width: '100%' }}>

                {/* ROW 1: stat cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 16 }}>
                    <div style={S.card('#023149', { minHeight: 120, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' })}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <p style={S.lbl()}>Total Customers</p>
                            <div style={S.iconSq('rgba(255,255,255,.15)')}><span className="material-icons" style={{ fontSize: 20, color: 'rgba(255,255,255,.6)' }}>groups</span></div>
                        </div>
                        <p style={S.num()}>{Number(tc).toLocaleString()}</p>
                    </div>

                    <div style={S.card('#689abb', { minHeight: 120, display: 'flex', alignItems: 'center' })}>
                        <div style={{ flex: 1, padding: '0 8px' }}>
                            <p style={S.lbl()}>Total Booking</p>
                            <p style={{ ...S.num(), fontSize: 32 }}>{Number(tb).toLocaleString()}</p>
                        </div>
                        <div style={{ width: 1, background: 'rgba(255,255,255,.3)', alignSelf: 'stretch', margin: '0 16px' }} />
                        <div style={{ flex: 1, padding: '0 8px' }}>
                            <p style={S.lbl()}>Completed</p>
                            <p style={{ ...S.num(), fontSize: 32 }}>{Number(cb).toLocaleString()}</p>
                        </div>
                    </div>

                    <div style={S.card('#3a6b8c', { minHeight: 120, display: 'flex', alignItems: 'center' })}>
                        <div style={{ flex: 1, padding: '0 8px' }}>
                            <p style={S.lbl()}>On-Trip</p>
                            <p style={{ ...S.num(), fontSize: 32 }}>{Number(ot).toLocaleString()}</p>
                        </div>
                        <div style={{ width: 1, background: 'rgba(255,255,255,.3)', alignSelf: 'stretch', margin: '0 16px' }} />
                        <div style={{ flex: 1, padding: '0 8px' }}>
                            <p style={S.lbl()}>Upcoming</p>
                            <p style={{ ...S.num(), fontSize: 32 }}>{up}</p>
                        </div>
                    </div>

                    <div style={S.card('#c5111a', { minHeight: 120, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' })}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <div style={{ ...S.iconSq('rgba(255,255,255,.2)'), borderRadius: 8 }}><span className="material-icons" style={{ fontSize: 20, color: '#fff' }}>calendar_today</span></div>
                        </div>
                        <div>
                            <p style={S.num()}>{pa}</p>
                            <p style={{ ...S.lbl('rgba(255,255,255,.8)'), marginTop: 8 }}>Pending Assignments</p>
                        </div>
                    </div>
                </div>

                {/* ROW 2: vehicle stat cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
                    <div style={S.card(BLUE, { minHeight: 100 })}>
                        <p style={S.lbl()}>Total Vehicles</p>
                        <p style={S.num()}>{tv}</p>
                        <div style={{ position: 'absolute', right: 16, bottom: 8, opacity: .2 }}><span className="material-icons" style={{ fontSize: 40, color: '#fff' }}>directions_car</span></div>
                    </div>
                    <div style={S.card(NAVY, { minHeight: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'center' })}>
                        <div>
                            <p style={S.lbl()}>Active Vehicles</p>
                            <p style={S.num()}>{av}</p>
                        </div>
                        <div style={{ ...S.iconCircle('#22c55e'), boxShadow: '0 0 0 4px rgba(34,197,94,.2)' }}><span className="material-icons" style={{ fontSize: 20, color: '#fff' }}>check</span></div>
                    </div>
                    <div style={S.card(CREAM, { minHeight: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e8d4aa', boxShadow: 'none' })}>
                        <div>
                            <p style={S.lbl('#6b7280')}>Inactive Vehicles</p>
                            <p style={S.num(NAVY)}>{iv}</p>
                        </div>
                        <div style={{ ...S.iconCircle(NAVY), boxShadow: '0 4px 12px rgba(2,49,73,.15)' }}><span className="material-icons" style={{ fontSize: 20, color: '#fff' }}>pause</span></div>
                    </div>
                    <div style={S.card(RED, { minHeight: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'center' })}>
                        <div>
                            <p style={S.lbl()}>Cancelled</p>
                            <p style={S.num()}>{Number(can).toLocaleString()}</p>
                        </div>
                        <div style={S.iconCircle('rgba(255,255,255,.2)')}><span className="material-icons" style={{ fontSize: 24, color: '#fff' }}>cancel</span></div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <span className="material-icons" style={{ fontSize: 16, color: BLUE }}>bolt</span>
                    <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.1em', color: NAVY }}>Quick Actions</span>
                    <div style={{ flex: 1, height: 1, background: '#e8d4aa' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginBottom: 32 }}>
                    {actions.map((a, i) => (
                        <button key={i} onClick={() => navigate(a.to)} style={{
                            background: a.bg, color: a.fg, border: a.border || 'none', borderRadius: 12,
                            padding: '16px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center',
                            justifyContent: 'center', gap: 8, cursor: 'pointer', minHeight: 100,
                            boxShadow: '0 2px 8px rgba(2,49,73,.08)', transition: 'transform .15s, box-shadow .15s',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 16px rgba(2,49,73,.12)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(2,49,73,.08)'; }}>
                            <span className="material-icons" style={{ fontSize: 24 }}>{a.icon}</span>
                            <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em', textAlign: 'center', lineHeight: 1.2 }}>{a.label}</span>
                        </button>
                    ))}
                </div>

                {/* Bottom 3 panels */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
                    {/* Fleet Overview */}
                    <div style={{ background: '#fff', borderRadius: 16, padding: '24px', border: '1px solid #e8d4aa', boxShadow: '0 2px 8px rgba(2,49,73,.04)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 16, marginBottom: 16, borderBottom: '1px solid #fdf6e8' }}>
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="material-icons" style={{ fontSize: 16, color: '#fff' }}>directions_car</span></div>
                            <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em', color: NAVY }}>Fleet Overview</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <span style={{ fontSize: 14, color: '#6b7280' }}>Total Vehicles</span>
                            <span style={{ fontSize: 20, fontWeight: 800, color: NAVY }}>{tv}</span>
                        </div>
                        <div style={{ height: 8, background: '#fdf6e8', borderRadius: 99, overflow: 'hidden', marginBottom: 16 }}>
                            <div style={{ height: '100%', width: `${(av / Math.max(tv, 1)) * 100}%`, background: NAVY, borderRadius: 99 }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: BLUE, display: 'inline-block' }} />Active: {av}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#e8d4aa', border: '1px solid #c8a46a', display: 'inline-block' }} />Inactive: {iv}</span>
                        </div>
                    </div>

                    {/* Booking Summary */}
                    <div style={{ background: '#fff', borderRadius: 16, padding: '24px', border: '1px solid #e8d4aa', boxShadow: '0 2px 8px rgba(2,49,73,.04)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 16, marginBottom: 16, borderBottom: '1px solid #fdf6e8' }}>
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="material-icons" style={{ fontSize: 16, color: '#fff' }}>insert_chart</span></div>
                            <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em', color: NAVY }}>Booking Summary</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <span style={{ fontSize: 14, color: '#6b7280' }}>Total Bookings</span>
                            <span style={{ fontSize: 20, fontWeight: 800, color: NAVY }}>{Number(tb).toLocaleString()}</span>
                        </div>
                        <div style={{ height: 8, background: NAVY, borderRadius: 99, marginBottom: 16 }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: NAVY, display: 'inline-block' }} />Completed: {Number(cb).toLocaleString()}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: RED, display: 'inline-block' }} />Cancelled: {Number(can).toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Admin Management Panel */}
                    <div style={{ background: NAVY, borderRadius: 16, padding: '24px', boxShadow: '0 4px 12px rgba(2,49,73,.15)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                            <span className="material-icons" style={{ fontSize: 20, color: BLUE }}>admin_panel_settings</span>
                            <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em', color: '#fff' }}>Admin Controls</span>
                        </div>
                        {[
                            { label: 'User Rights', icon: 'manage_accounts', to: '/user-rights' },
                            { label: 'User Logs', icon: 'history', to: '/user-logs' },
                            { label: 'Settings', icon: 'settings', to: '/settings' },
                        ].map((item, i) => (
                            <button key={i} onClick={() => navigate(item.to)} style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.15)',
                                borderRadius: 8, padding: '12px 16px', width: '100%', marginBottom: 12,
                                color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600,
                                transition: 'background .15s',
                            }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.2)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.1)'}>
                                <span className="material-icons" style={{ fontSize: 20, color: BLUE }}>{item.icon}</span>
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ROW 4: Live Data Feeds */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginTop: 24 }}>
                    {/* Live Trips Feed */}
                    <div style={{ background: '#fff', borderRadius: 16, padding: '24px', border: '1px solid #e8d4aa', boxShadow: '0 2px 8px rgba(2,49,73,.04)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, marginBottom: 16, borderBottom: '1px solid #fdf6e8' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite' }} />
                                <span style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em', color: NAVY }}>Active Live Trips</span>
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', cursor: 'pointer' }} onClick={() => navigate('/ontrip')}>View All</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {D.live_trips?.length > 0 ? D.live_trips.map((t, i) => (
                                <div key={i} style={{ padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <span style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>#{t.b_id} - {t.b_name}</span>
                                        <span style={{ fontSize: 11, fontWeight: 800, color: NAVY, background: CREAM, padding: '2px 6px', borderRadius: 4 }}>{t.v_id}</span>
                                    </div>
                                    <div style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <span className="material-icons" style={{ fontSize: 12 }}>route</span>
                                        {t.p_city} &rarr; {t.d_place}
                                    </div>
                                </div>
                            )) : <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>No active trips currently.</p>}
                        </div>
                    </div>

                    {/* Pending Assignments Feed */}
                    <div style={{ background: '#fff', borderRadius: 16, padding: '24px', border: '1px solid #e8d4aa', boxShadow: '0 2px 8px rgba(2,49,73,.04)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, marginBottom: 16, borderBottom: '1px solid #fdf6e8' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: RED }} />
                                <span style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em', color: NAVY }}>Awaiting Dispatch</span>
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', cursor: 'pointer' }} onClick={() => navigate('/assignments')}>View All</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {D.upcoming_assignments?.length > 0 ? D.upcoming_assignments.map((t, i) => (
                                <div key={i} style={{ padding: 12, background: '#fef2f2', borderRadius: 8, border: '1px solid #fecaca' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <span style={{ fontSize: 13, fontWeight: 700, color: RED }}>#{t.b_id} - {t.b_name}</span>
                                        <button onClick={() => navigate('/assignments')} style={{ fontSize: 10, fontWeight: 800, color: '#fff', background: RED, border: 'none', padding: '2px 8px', borderRadius: 4, cursor: 'pointer' }}>ASSIGN</button>
                                    </div>
                                    <div style={{ fontSize: 12, color: '#991b1b', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <span className="material-icons" style={{ fontSize: 12 }}>schedule</span>
                                        {t.b_date || t.pickup}
                                    </div>
                                </div>
                            )) : <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>No pending assignments.</p>}
                        </div>
                    </div>

                    {/* Recent Bookings Feed */}
                    <div style={{ background: '#fff', borderRadius: 16, padding: '24px', border: '1px solid #e8d4aa', boxShadow: '0 2px 8px rgba(2,49,73,.04)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, marginBottom: 16, borderBottom: '1px solid #fdf6e8' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: BLUE }} />
                                <span style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em', color: NAVY }}>Recent Bookings</span>
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', cursor: 'pointer' }} onClick={() => navigate('/bookings')}>View All</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {D.recent_bookings?.length > 0 ? D.recent_bookings.map((t, i) => (
                                <div key={i} style={{ padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <span style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>#{t.b_id} - {t.b_name}</span>
                                        <span style={{ fontSize: 10, fontWeight: 800, color: t.booking_status == '1' ? '#166534' : '#6b7280', background: t.booking_status == '1' ? '#dcfce7' : '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>
                                            {t.booking_status == '1' ? 'COMPLETED' : 'PENDING'}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        {t.p_city} &rarr; {t.d_place}
                                    </div>
                                </div>
                            )) : <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>No recent bookings.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ══════════════════════════════════════════
   STAFF DASHBOARD
══════════════════════════════════════════ */
const StaffDashboard = ({ user, stats, navigate }) => {
    const D = stats || {};
    const tb = D.total_bookings ?? 0;
    const ot = D.on_trip ?? 0;
    const up = D.advance_booking ?? 0;
    const can = D.cancelled_booking ?? 0;

    const staffActions = [
        { label: 'New Booking', icon: 'add_circle', to: '/bookings', bg: BLUE, fg: '#fff' },
        { label: 'Assignments', icon: 'assignment', to: '/assignments', bg: NAVY, fg: '#fff' },
        { label: 'Trip Closing', icon: 'check_circle', to: '/trip-closing', bg: BLUE, fg: '#fff' },
        { label: 'On Trip', icon: 'departure_board', to: '/ontrip', bg: NAVY, fg: '#fff' },
        { label: 'Attendance', icon: 'event_available', to: '/attendance', bg: BLUE, fg: '#fff' },
        { label: 'Advance', icon: 'event', to: '/advance-bookings', bg: CREAM, fg: NAVY, border: `1px solid #e8d4aa` },
    ];

    return (
        <div style={{ background: CREAM, minHeight: '100vh', fontFamily: "'Outfit', sans-serif", overflowX: 'hidden' }}>
            <div className="page-header">
                <div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>Staff Dashboard</h1>
                        <p style={{ margin: '4px 0 0', fontSize: 14, color: 'rgba(255,255,255,.7)' }}>
                            Welcome back, <strong style={{ color: '#fff' }}>{user?.name}</strong>
                            {user?.department && <span> · {user.department}</span>}
                        </p>
                    </div>
                    <button onClick={() => window.location.reload()}
                        style={{ background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.1)'}>
                        <span className="material-icons" style={{ fontSize: 16 }}>refresh</span>
                        Refresh
                    </button>
                </div>
            </div>

            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 32px 40px', boxSizing: 'border-box', width: '100%' }}>
                {/* Staff Overview Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
                    <div style={S.card(BLUE, { minHeight: 120 })}>
                        <p style={S.lbl()}>Total Bookings</p>
                        <p style={S.num()}>{Number(tb).toLocaleString()}</p>
                        <div style={{ position: 'absolute', right: 16, bottom: 8, opacity: .2 }}><span className="material-icons" style={{ fontSize: 40, color: '#fff' }}>book_online</span></div>
                    </div>
                    <div style={S.card(NAVY, { minHeight: 120, display: 'flex', justifyContent: 'space-between', alignItems: 'center' })}>
                        <div>
                            <p style={S.lbl()}>On Trip</p>
                            <p style={S.num()}>{Number(ot).toLocaleString()}</p>
                        </div>
                        <div style={{ ...S.iconCircle('rgba(255,255,255,.15)') }}><span className="material-icons" style={{ fontSize: 24, color: '#fff' }}>departure_board</span></div>
                    </div>
                    <div style={S.card(CREAM, { minHeight: 120, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e8d4aa', boxShadow: 'none' })}>
                        <div>
                            <p style={S.lbl('#6b7280')}>Advance Bookings</p>
                            <p style={S.num(NAVY)}>{up}</p>
                        </div>
                        <div style={{ ...S.iconCircle(NAVY) }}><span className="material-icons" style={{ fontSize: 20, color: '#fff' }}>event</span></div>
                    </div>
                    <div style={S.card(RED, { minHeight: 120, display: 'flex', justifyContent: 'space-between', alignItems: 'center' })}>
                        <div>
                            <p style={S.lbl()}>Cancelled</p>
                            <p style={S.num()}>{Number(can).toLocaleString()}</p>
                        </div>
                        <div style={S.iconCircle('rgba(255,255,255,.2)')}><span className="material-icons" style={{ fontSize: 24, color: '#fff' }}>cancel</span></div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <span className="material-icons" style={{ fontSize: 16, color: BLUE }}>bolt</span>
                    <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em', color: NAVY }}>Quick Actions</span>
                    <div style={{ flex: 1, height: 1, background: '#e8d4aa' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginBottom: 32 }}>
                    {staffActions.map((a, i) => (
                        <button key={i} onClick={() => navigate(a.to)} style={{
                            background: a.bg, color: a.fg, border: a.border || 'none', borderRadius: 12,
                            padding: '16px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center',
                            justifyContent: 'center', gap: 8, cursor: 'pointer', minHeight: 100,
                            boxShadow: '0 2px 8px rgba(2,49,73,.08)', transition: 'transform .15s, box-shadow .15s',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 16px rgba(2,49,73,.12)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(2,49,73,.08)'; }}>
                            <span className="material-icons" style={{ fontSize: 24 }}>{a.icon}</span>
                            <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em', textAlign: 'center', lineHeight: 1.2 }}>{a.label}</span>
                        </button>
                    ))}
                </div>

                {/* Bottom 2 panels */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
                    {/* Today's Tasks */}
                    <div style={{ background: '#fff', borderRadius: 16, padding: '24px', border: '1px solid #e8d4aa', boxShadow: '0 2px 8px rgba(2,49,73,.04)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 16, marginBottom: 16, borderBottom: '1px solid #fdf6e8' }}>
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="material-icons" style={{ fontSize: 16, color: '#fff' }}>today</span></div>
                            <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em', color: NAVY }}>Today's Overview</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #fdf6e8' }}>
                            <span style={{ fontSize: 14, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 8 }}><span className="material-icons" style={{ fontSize: 20, color: BLUE }}>book_online</span>Total Bookings</span>
                            <span style={{ fontSize: 16, fontWeight: 800, color: NAVY }}>{Number(tb).toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #fdf6e8' }}>
                            <span style={{ fontSize: 14, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 8 }}><span className="material-icons" style={{ fontSize: 20, color: '#3b82f6' }}>departure_board</span>On Trip Now</span>
                            <span style={{ fontSize: 16, fontWeight: 800, color: NAVY }}>{Number(ot).toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
                            <span style={{ fontSize: 14, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 8 }}><span className="material-icons" style={{ fontSize: 20, color: RED }}>cancel</span>Cancelled</span>
                            <span style={{ fontSize: 16, fontWeight: 800, color: NAVY }}>{Number(can).toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Staff Info Card */}
                    <div style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${BLUE} 100%)`, borderRadius: 16, padding: '24px', boxShadow: '0 4px 12px rgba(2,49,73,.15)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
                            <span className="material-icons" style={{ fontSize: 20, color: 'rgba(255,255,255,.8)' }}>account_circle</span>
                            <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em', color: '#fff' }}>My Profile</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                            <div style={{
                                width: 64, height: 64, borderRadius: '50%',
                                background: 'rgba(255,255,255,.2)',
                                border: '2px solid rgba(255,255,255,.4)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 24, fontWeight: 800, color: '#fff', flexShrink: 0
                            }}>
                                {user?.name?.charAt(0).toUpperCase() || 'S'}
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#fff' }}>{user?.name || 'Staff Member'}</p>
                                <p style={{ margin: '4px 0 0', fontSize: 14, color: 'rgba(255,255,255,.8)' }}>{user?.email || ''}</p>
                                {user?.department && <p style={{ margin: '4px 0 0', fontSize: 12, color: 'rgba(255,255,255,.7)' }}>{user.department}</p>}
                            </div>
                        </div>
                        <div style={{ borderTop: '1px solid rgba(255,255,255,.2)', paddingTop: 16 }}>
                            <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'rgba(255,255,255,.7)' }}>Contact</p>
                            <p style={{ margin: 0, fontSize: 14, color: '#fff' }}>{user?.mobile || 'Not provided'}</p>
                        </div>
                    </div>
                </div>

                {/* ROW 4: Live Data Feeds for Staff */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginTop: 24 }}>
                    {/* Live Trips Feed */}
                    <div style={{ background: '#fff', borderRadius: 16, padding: '24px', border: '1px solid #e8d4aa', boxShadow: '0 2px 8px rgba(2,49,73,.04)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, marginBottom: 16, borderBottom: '1px solid #fdf6e8' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite' }} />
                                <span style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em', color: NAVY }}>Active Live Trips</span>
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', cursor: 'pointer' }} onClick={() => navigate('/ontrip')}>View All</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {D.live_trips?.length > 0 ? D.live_trips.map((t, i) => (
                                <div key={i} style={{ padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <span style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>#{t.b_id} - {t.b_name}</span>
                                        <span style={{ fontSize: 11, fontWeight: 800, color: NAVY, background: CREAM, padding: '2px 6px', borderRadius: 4 }}>{t.v_id}</span>
                                    </div>
                                    <div style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <span className="material-icons" style={{ fontSize: 12 }}>route</span>
                                        {t.p_city} &rarr; {t.d_place}
                                    </div>
                                </div>
                            )) : <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>No active trips currently.</p>}
                        </div>
                    </div>

                    {/* Pending Assignments Feed */}
                    <div style={{ background: '#fff', borderRadius: 16, padding: '24px', border: '1px solid #e8d4aa', boxShadow: '0 2px 8px rgba(2,49,73,.04)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, marginBottom: 16, borderBottom: '1px solid #fdf6e8' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: RED }} />
                                <span style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em', color: NAVY }}>Awaiting Dispatch</span>
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', cursor: 'pointer' }} onClick={() => navigate('/assignments')}>View All</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {D.upcoming_assignments?.length > 0 ? D.upcoming_assignments.map((t, i) => (
                                <div key={i} style={{ padding: 12, background: '#fef2f2', borderRadius: 8, border: '1px solid #fecaca' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <span style={{ fontSize: 13, fontWeight: 700, color: RED }}>#{t.b_id} - {t.b_name}</span>
                                        <button onClick={() => navigate('/assignments')} style={{ fontSize: 10, fontWeight: 800, color: '#fff', background: RED, border: 'none', padding: '2px 8px', borderRadius: 4, cursor: 'pointer' }}>ASSIGN</button>
                                    </div>
                                    <div style={{ fontSize: 12, color: '#991b1b', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <span className="material-icons" style={{ fontSize: 12 }}>schedule</span>
                                        {t.b_date || t.pickup}
                                    </div>
                                </div>
                            )) : <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>No pending assignments.</p>}
                        </div>
                    </div>

                    {/* Recent Bookings Feed */}
                    <div style={{ background: '#fff', borderRadius: 16, padding: '24px', border: '1px solid #e8d4aa', boxShadow: '0 2px 8px rgba(2,49,73,.04)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, marginBottom: 16, borderBottom: '1px solid #fdf6e8' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: BLUE }} />
                                <span style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em', color: NAVY }}>Recent Bookings</span>
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', cursor: 'pointer' }} onClick={() => navigate('/bookings')}>View All</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {D.recent_bookings?.length > 0 ? D.recent_bookings.map((t, i) => (
                                <div key={i} style={{ padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <span style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>#{t.b_id} - {t.b_name}</span>
                                        <span style={{ fontSize: 10, fontWeight: 800, color: t.booking_status == '1' ? '#166534' : '#6b7280', background: t.booking_status == '1' ? '#dcfce7' : '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>
                                            {t.booking_status == '1' ? 'COMPLETED' : 'PENDING'}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        {t.p_city} &rarr; {t.d_place}
                                    </div>
                                </div>
                            )) : <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>No recent bookings.</p>}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

/* ══════════════════════════════════════════
   MAIN DASHBOARD (router)
══════════════════════════════════════════ */
const Dashboard = () => {
    const { user, api } = useContext(AuthContext);
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        api.get('/dashboard.php')
            .then(r => setStats(r.data.stats))
            .catch(console.error)
            .finally(() => setLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    if (loading) return (
        <div style={{ padding: 40, color: NAVY, fontWeight: 600 }}>Loading dashboard…</div>
    );

    // Route to correct dashboard based on role
    if (user?.role === 'staff') {
        return <StaffDashboard user={user} stats={stats} navigate={navigate} />;
    }

    // Default: admin dashboard
    return <AdminDashboard user={user} stats={stats} navigate={navigate} />;
};

export default Dashboard;
