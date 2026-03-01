import { useState, useEffect, useContext } from 'react';
import { useToast } from '../context/ToastContext';

        

        

import AuthContext from '../context/AuthContext';
const VehicleInOut = () => {
    const toast = useToast();
const { api } = useContext(AuthContext);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [singleVid, setSingleVid] = useState('');
    const [loggingOut, setLoggingOut] = useState(false);

    useEffect(() => {
        fetchActiveVehicles();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchActiveVehicles = async () => {
        setLoading(true);
        try {
            const response = await api.get('/vehicle_in_out.php');
            setVehicles(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Error fetching active vehicles", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogoutAll = async () => {
        if (!window.confirm("Are you sure you want to instantly log out all currently active vehicles? This will calculate their final attendance duration.")) {
            return;
        }

        setLoggingOut(true);
        try {
            const response = await api.post('/vehicle_in_out.php', { action: 'logout_all' });
            if (response.data.status === 'success') {
                toast(response.data.message, 'error');
                fetchActiveVehicles(); // Refresh table
            } else {
                toast("Failed to log out all vehicles.", 'error');
            }
        } catch (error) {
            console.error("Error logging out all vehicles", error);
            toast("An error occurred during mass logout.", 'error');
        } finally {
            setLoggingOut(false);
        }
    };

    const handleLogoutSingle = async (e) => {
        e.preventDefault();
        if (!singleVid.trim()) {
            toast("Please enter a Vehicle ID to logout.", 'warning');
            return;
        }

        setLoggingOut(true);
        try {
            const response = await api.post('/vehicle_in_out.php', {
                action: 'logout_single',
                v_id: singleVid.trim()
            });

            if (response.data.status === 'success') {
                toast(`Vehicle ${singleVid} logged out successfully.`);
                setSingleVid('');
                fetchActiveVehicles();
            } else {
                toast(response.data.message || `Failed to log out vehicle ${singleVid}.`, 'error');
            }
        } catch (error) {
            console.error("Error logging out single vehicle", error);
            toast(error.response?.data?.message || "Active vehicle not found or already logged out.", 'error');
        } finally {
            setLoggingOut(false);
        }
    };

    return (
        <div className="page-wrap">
            <div className="page-header">
                <div>
                    <div>
                        <h1>Vehicle In & Out Matrix</h1>
                        <p>Monitor real-time active vehicles and process mass logouts</p>
                    </div>
                </div>
            </div>

            <div className="page-body">
                {/* Top Control Bar */}
                <div className="section" style={{ display: 'flex', gap: 24, alignItems: 'center', justifyContent: 'space-between', padding: '24px 32px', marginBottom: 24, background: '#f8fafc', border: '1px solid #e2e8f0' }}>

                    {/* View all active & Logout ALL */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ padding: '8px 16px', background: '#e0f2fe', color: '#0369a1', borderRadius: 8, fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span className="material-icons" style={{ fontSize: 18 }}>radar</span>
                            {loading ? '...' : vehicles.length} Vehicles Currently Active
                        </div>

                        <button
                            onClick={handleLogoutAll}
                            disabled={loggingOut || vehicles.length === 0}
                            style={{
                                padding: '10px 24px',
                                background: '#dc2626',
                                color: '#white',
                                borderRadius: 8,
                                fontWeight: 700,
                                fontSize: 14,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                border: 'none',
                                cursor: (loggingOut || vehicles.length === 0) ? 'not-allowed' : 'pointer',
                                opacity: (loggingOut || vehicles.length === 0) ? 0.6 : 1,
                                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.2)'
                            }}
                            onMouseEnter={e => { if (!loggingOut && vehicles.length > 0) e.currentTarget.style.background = '#b91c1c' }}
                            onMouseLeave={e => { if (!loggingOut && vehicles.length > 0) e.currentTarget.style.background = '#dc2626' }}
                        >
                            <span className="material-icons" style={{ fontSize: 18 }}>power_settings_new</span>
                            {loggingOut ? 'Processing...' : 'All Vehicle Logout'}
                        </button>
                    </div>

                    {/* Single Vehicle Logout Form */}
                    <form onSubmit={handleLogoutSingle} style={{ display: 'flex', alignItems: 'stretch', gap: 0, overflow: 'hidden', borderRadius: 8, border: '1px solid #cbd5e1', boxShadow: '0 2px 4px rgba(0,0,0,.05)' }}>
                        <div style={{ padding: '10px 16px', background: '#f1f5f9', color: '#475569', fontWeight: 600, fontSize: 14, borderRight: '1px solid #cbd5e1', display: 'flex', alignItems: 'center' }}>
                            Vehicle ID
                        </div>
                        <input
                            type="text"
                            placeholder="e.g. 640"
                            value={singleVid}
                            onChange={(e) => setSingleVid(e.target.value)}
                            style={{ padding: '10px 16px', border: 'none', outline: 'none', width: 140, fontSize: 14, fontWeight: 600, color: '#023149' }}
                            require
                        />
                        <button
                            type="submit"
                            disabled={loggingOut || !singleVid.trim()}
                            style={{
                                padding: '10px 20px',
                                background: '#023149',
                                color: '#fff',
                                border: 'none',
                                fontWeight: 700,
                                fontSize: 14,
                                cursor: (loggingOut || !singleVid.trim()) ? 'not-allowed' : 'pointer',
                                opacity: (loggingOut || !singleVid.trim()) ? 0.7 : 1
                            }}
                        >
                            Log Out
                        </button>
                    </form>

                </div>

                {/* Active Vehicles Table */}
                <div className="table-wrap">
                    <div style={{ padding: '16px 24px', background: '#fdf6e8', borderBottom: '1px solid #e8d4aa', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="material-icons" style={{ fontSize: 18, color: '#15803d' }}>sensors</span>
                        <h3 style={{ margin: 0, fontSize: 13, fontWeight: 800, color: '#023149', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                            Currently Active Vehicles
                        </h3>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Vehicle-ID</th>
                                <th>Driver Name</th>
                                <th>Vehicle No</th>
                                <th>Vacant Location</th>
                                <th style={{ textAlign: 'right' }}>Login Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '60px 40px', color: '#6b7280' }}>
                                        Loading active vehicles network...
                                    </td>
                                </tr>
                            ) : vehicles.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '60px 40px', color: '#6b7280' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                                            <span className="material-icons" style={{ fontSize: 32, color: '#cbd5e1' }}>power_off</span>
                                            <div>All vehicles are currently logged out or off-duty.</div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                vehicles.map((v, i) => (
                                    <tr key={i}>
                                        <td>
                                            <span style={{ fontWeight: 800, color: '#023149', fontFamily: 'monospace', padding: '4px 8px', background: '#f8fafc', borderRadius: 4, border: '1px solid #e2e8f0' }}>
                                                {v.v_id}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: 600, color: '#334155' }}>
                                            {v.d_name || '—'}
                                        </td>
                                        <td style={{ fontWeight: 700, color: '#023149', fontSize: 13 }}>
                                            {v.v_no || '—'}
                                        </td>
                                        <td>
                                            <span className="badge badge-yellow">
                                                {v.vacant_place || 'UNSPECIFIED'}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right', fontWeight: 600, color: '#15803d', fontSize: 13 }}>
                                            {v.login_time}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default VehicleInOut;
