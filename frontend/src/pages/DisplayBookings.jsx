import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const DisplayBookings = () => {
    const toast = useToast();
    const { api } = useContext(AuthContext);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await api.get('/bookings.php');
            if (Array.isArray(response.data)) {
                setBookings(response.data);
            } else {
                setBookings([]);
            }
            setLoading(false);
        } catch (error) {
            console.error("Error fetching bookings", error);
            setBookings([]);
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="page-wrap">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 }}>
                <span className="material-icons" style={{ fontSize: 48, color: '#023149', animation: 'spin 2s linear infinite' }}>sync</span>
                <div style={{ color: '#023149', fontSize: 16, fontWeight: 700 }}>Synchronizing Global Ledger...</div>
            </div>
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );

    return (
        <div className="page-wrap">
            <div className="page-header">
                <div>
                    <div>
                        <h1>Global Itinerary Ledger</h1>
                        <p>View unmitigated historical map of all recorded topologies</p>
                    </div>
                </div>
            </div>

            <div className="page-body">
                <div className="table-wrap" style={{ background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)', overflow: 'hidden' }}>
                    <table style={{ margin: 0 }}>
                        <thead style={{ background: '#f8fafc' }}>
                            <tr>
                                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em' }}>Ref Hash</th>
                                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em' }}>State Node</th>
                                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em' }}>Origin Epoch</th>
                                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em' }}>Client Sector</th>
                                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em' }}>Origin Coord</th>
                                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em' }}>Terminal Coord</th>
                                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em' }}>Topology</th>
                                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em' }}>Payload Req.</th>
                                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em' }}>Env. Control</th>
                                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em' }}>Asset Class</th>
                                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em' }}>Asset Identity</th>
                                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em' }}>Op. Comm Hash</th>
                                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em' }}>Host Identity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.length > 0 ? (
                                bookings.map((booking) => (
                                    <tr key={booking.b_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '12px 24px', fontWeight: 800, color: '#023149', fontFamily: 'monospace', fontSize: 13 }}>#{booking.b_id}</td>
                                        <td style={{ padding: '12px 24px' }}>
                                            <div style={{
                                                background: booking.assign === '1' ? '#f0fdf4' : '#fffbeb',
                                                border: `1px solid ${booking.assign === '1' ? '#bbf7d0' : '#fde68a'}`,
                                                color: booking.assign === '1' ? '#166534' : '#92400e',
                                                padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em', display: 'inline-flex', alignItems: 'center', gap: 4
                                            }}>
                                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: booking.assign === '1' ? '#22c55e' : '#f59e0b' }} />
                                                {booking.assign === '1' ? 'MAPPED' : 'ORPHANED'}
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px 24px', color: '#475569', fontSize: 13, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={booking.pickup}>{booking.pickup}</td>
                                        <td style={{ padding: '12px 24px', fontWeight: 700, color: '#334155', fontSize: 13, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={booking.to_whom}>{booking.to_whom}</td>
                                        <td style={{ padding: '12px 24px', color: '#475569', fontSize: 13, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={booking.p_city}>{booking.p_city}</td>
                                        <td style={{ padding: '12px 24px', color: '#475569', fontSize: 13, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={booking.d_place}>{booking.d_place}</td>
                                        <td style={{ padding: '12px 24px', color: '#475569', fontSize: 13, fontWeight: 600 }}>{booking.t_type}</td>
                                        <td style={{ padding: '12px 24px', color: '#64748b', fontSize: 13, fontStyle: booking.remarks ? 'normal' : 'italic', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={booking.remarks}>{booking.remarks || 'NULL'}</td>
                                        <td style={{ padding: '12px 24px' }}>
                                            <span style={{
                                                fontWeight: booking.ac_type === '1' ? 800 : 600,
                                                color: booking.ac_type === '1' ? '#0369a1' : '#94a3b8',
                                                fontSize: 12,
                                                background: booking.ac_type === '1' ? '#f0f9ff' : 'transparent',
                                                padding: booking.ac_type === '1' ? '4px 8px' : 0,
                                                borderRadius: 4
                                            }}>
                                                {booking.ac_type === '1' ? 'ACTIVE' : 'IDLE'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px 24px', color: '#475569', fontSize: 13, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={booking.v_type}>{booking.v_type}</td>
                                        <td style={{ padding: '12px 24px', color: '#0f172a', fontWeight: 800, fontSize: 13, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={booking.v_no}>
                                            {booking.v_no || <span style={{ color: '#cbd5e1', fontWeight: 400 }}>UNASSIGNED</span>}
                                        </td>
                                        <td style={{ padding: '12px 24px', color: '#64748b', fontSize: 13, fontFamily: 'monospace', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={booking.d_mobile}>{booking.d_mobile || '-'}</td>
                                        <td style={{ padding: '12px 24px', fontWeight: 700, color: '#334155', fontSize: 13, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={booking.b_name}>{booking.b_name}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="13" style={{ textAlign: 'center', padding: '60px 40px', color: '#6b7280' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                                            <span className="material-icons" style={{ fontSize: 32, color: '#cbd5e1' }}>history_edu</span>
                                            <div>Global ledger is entirely empty.</div>
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

export default DisplayBookings;
