import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const DisplayBookings = () => {
    const { api } = useContext(AuthContext);
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/bookings.php?all=1')
            .then(res => setBookings(Array.isArray(res.data) ? res.data : []))
            .catch(() => setBookings([]))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="page-wrap">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 }}>
                <span className="material-icons" style={{ fontSize: 48, color: '#023149', animation: 'spin 2s linear infinite' }}>sync</span>
                <div style={{ color: '#023149', fontSize: 16, fontWeight: 700 }}>Loading bookings...</div>
            </div>
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );

    return (
        <div className="page-wrap">
            <div className="page-header">
                <div>
                    <h1>All Bookings</h1>
                    <p>Complete history of all registered bookings</p>
                </div>
                <div style={{ marginLeft: 'auto', color: '#6b7280', fontSize: 13, alignSelf: 'center' }}>
                    {bookings.length} {bookings.length === 1 ? 'record' : 'records'}
                </div>
            </div>

            <div className="page-body">
                <div style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff' }}>
                    <table style={{ width: '100%', minWidth: 1000, borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                <th style={thStyle}>Ref #</th>
                                <th style={thStyle}>Status</th>
                                <th style={thStyle}>Schedule</th>
                                <th style={thStyle}>Client</th>
                                <th style={thStyle}>Mobile</th>
                                <th style={thStyle}>Pickup</th>
                                <th style={thStyle}>Destination</th>
                                <th style={thStyle}>Vehicle</th>
                                <th style={thStyle}>A/C</th>
                                <th style={{ ...thStyle, textAlign: 'right', minWidth: 180 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.length > 0 ? bookings.map((b, i) => (
                                <tr key={b.b_id} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                                    <td style={{ ...tdStyle, fontWeight: 800, color: '#023149', fontFamily: 'monospace' }}>#{b.b_id}</td>
                                    <td style={tdStyle}>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '3px 10px',
                                            borderRadius: 20,
                                            fontSize: 11,
                                            fontWeight: 700,
                                            whiteSpace: 'nowrap',
                                            background: b.assign === '1' ? '#dbeafe' : '#fef9c3',
                                            color: b.assign === '1' ? '#1d4ed8' : '#92400e',
                                        }}>
                                            {b.assign === '1' ? 'Driver Assigned' : 'Awaiting'}
                                        </span>
                                    </td>
                                    <td style={{ ...tdStyle, color: '#374151', whiteSpace: 'nowrap' }}>{b.b_date} {b.b_time}</td>
                                    <td style={{ ...tdStyle, fontWeight: 600, color: '#023149' }}>{b.b_name}</td>
                                    <td style={{ ...tdStyle, color: '#6b7280', whiteSpace: 'nowrap' }}>{b.m_no}</td>
                                    <td style={{ ...tdStyle, color: '#475569' }}>{b.p_city}</td>
                                    <td style={{ ...tdStyle, color: '#475569' }}>{b.d_place}</td>
                                    <td style={{ ...tdStyle, fontWeight: 600, color: '#023149' }}>{b.v_type}</td>
                                    <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '2px 8px',
                                            borderRadius: 4,
                                            fontSize: 11,
                                            fontWeight: 600,
                                            background: b.ac_type === '1' ? '#d1fae5' : '#f1f5f9',
                                            color: b.ac_type === '1' ? '#065f46' : '#64748b',
                                        }}>
                                            {b.ac_type === '1' ? 'AC' : 'Non-AC'}
                                        </span>
                                    </td>
                                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'nowrap' }}>
                                            {b.assign === '1' && (
                                                <button
                                                    onClick={() => navigate('/trip-closing', { state: { booking: b } })}
                                                    style={closeBtnStyle}
                                                >
                                                    <span className="material-icons" style={{ fontSize: 14 }}>task_alt</span>
                                                    Close
                                                </button>
                                            )}
                                            <button
                                                onClick={() => navigate('/cancel-booking', { state: { booking: b } })}
                                                style={abortBtnStyle}
                                            >
                                                <span className="material-icons" style={{ fontSize: 14 }}>cancel</span>
                                                Abort
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="10" style={{ textAlign: 'center', padding: '60px 40px', color: '#6b7280' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                                            <span className="material-icons" style={{ fontSize: 36, color: '#cbd5e1' }}>inbox</span>
                                            <div style={{ fontWeight: 600 }}>No bookings found</div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const thStyle = {
    padding: '12px 14px',
    textAlign: 'left',
    fontWeight: 700,
    fontSize: 11,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    whiteSpace: 'nowrap',
};

const tdStyle = {
    padding: '13px 14px',
    verticalAlign: 'middle',
};

const closeBtnStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '5px 12px',
    fontSize: 12,
    fontWeight: 600,
    borderRadius: 6,
    border: '1px solid #cbd5e1',
    background: '#fff',
    color: '#023149',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
};

const abortBtnStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '5px 12px',
    fontSize: 12,
    fontWeight: 600,
    borderRadius: 6,
    border: '1px solid #fecaca',
    background: '#fef2f2',
    color: '#c5111a',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
};

export default DisplayBookings;
