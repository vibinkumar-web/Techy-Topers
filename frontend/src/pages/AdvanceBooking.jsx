import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const AdvanceBooking = () => {
    const toast = useToast();
    const { api } = useContext(AuthContext);
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await api.get('/advance_booking.php');
                if (Array.isArray(response.data)) {
                    setBookings(response.data);
                } else {
                    setBookings([]);
                }
                setLoading(false);
            } catch (error) {
                console.error("Error fetching advance bookings", error);
                setBookings([]);
                setLoading(false);
            }
        };

        fetchBookings();
    }, [api]);

    if (loading) return (
        <div className="page-wrap">
            <div className="page-body" style={{ padding: 40, textAlign: 'center', color: '#023149', fontWeight: 600 }}>
                Loading advance bookings...
            </div>
        </div>
    );

    return (
        <div className="page-wrap">
            <div className="page-header">
                <div>
                    <div>
                        <h1>Advance Bookings</h1>
                        <p>View upcoming scheduled trips and pending assignments</p>
                    </div>
                </div>
            </div>

            <div className="page-body">
                <div className="table-wrap">
                    <table>
                        <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                            <tr>
                                <th>Booking ID</th>
                                <th>Schedule</th>
                                <th>Route Strategy</th>
                                <th>Requirements</th>
                                <th>Customer Details</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '60px 40px', color: '#6b7280' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                                            <span className="material-icons" style={{ fontSize: 32, color: '#cbd5e1' }}>event_available</span>
                                            <div>No future advance bookings found.</div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                bookings.map((booking) => (
                                    <tr key={booking.b_id}>
                                        <td style={{ fontWeight: 800, color: '#023149', fontFamily: 'monospace', fontSize: 13 }}>#{booking.b_id}</td>
                                        <td>
                                            <div style={{ fontWeight: 700, color: '#023149' }}>{booking.b_date}</div>
                                            <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>{booking.pickup || booking.pickup_time}</div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, maxWidth: 220, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                                                <span className="material-icons" style={{ fontSize: 14, color: '#15803d' }}>my_location</span>
                                                <span title={booking.p_city || booking.pickup} style={{ fontWeight: 600, color: '#475569' }}>{booking.p_city || booking.pickup}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, maxWidth: 220, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', marginTop: 4 }}>
                                                <span className="material-icons" style={{ fontSize: 14, color: '#c5111a' }}>location_on</span>
                                                <span title={booking.d_place} style={{ fontWeight: 600, color: '#023149' }}>{booking.d_place}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="badge badge-blue">{booking.v_type || booking.v_types}</span>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 700, color: '#023149', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={booking.b_name || booking.cus_name}>{booking.b_name || booking.cus_name}</div>
                                            <div style={{ color: '#6b7280', fontSize: 12 }}>{booking.m_no || booking.cus_mobile}</div>
                                        </td>
                                        <td>
                                            <span className="badge badge-yellow">Pending Assignment</span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button
                                                className="btn-ghost"
                                                style={{ padding: '6px 16px', color: '#15803d', borderColor: '#bbf7d0', background: '#f0fdf4' }}
                                                onClick={() => navigate('/assign-later', { state: { booking } })}
                                            >
                                                <span className="material-icons" style={{ fontSize: 16 }}>assignment_ind</span>
                                                Assign Vehicle
                                            </button>
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

export default AdvanceBooking;
