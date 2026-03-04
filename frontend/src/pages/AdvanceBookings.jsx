import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const AdvanceBookings = () => {
    const toast = useToast();
    const { api } = useContext(AuthContext);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAdvanceBookings = async () => {
            try {
                const response = await api.get('/advance_bookings.php');
                let data = response.data;

                if (data && Array.isArray(data)) {
                    setBookings(data);
                } else if (data && typeof data === 'object' && Array.isArray(data.bookings)) {
                    setBookings(data.bookings);
                } else {
                    console.warn("API response is not an array:", data);
                    setBookings([]);
                }
            } catch (error) {
                console.error("Error fetching advance bookings", error);
                setBookings([]);
            } finally {
                setLoading(false);
            }
        };
        fetchAdvanceBookings();
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
                        <h1>Advanced booking</h1>
                        <p>Need to fetch the trip data , display the bookings after 24 hrs scheduled time from the current booking taken time, when the booking meet below 24 hrs it will automatically fetch it assigning page</p>
                    </div>
                </div>
            </div>

            <div className="page-body" style={{ maxWidth: '100%', padding: '24px 24px 40px' }}>
                <div className="section">
                    {/* Table banner header — dark navy, matches every other page */}
                    <div className="table-header">
                        <span>Advance Bookings</span>
                    </div>

                    <div className="table-wrap" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
                        <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', fontSize: 12 }}>
                            <thead>
                                <tr>
                                    {['B-ID', 'Status', 'Call-Time', 'Pick-up Date Time', 'Pickup Place', 'Drop Place', 'Trip Type', 'V-Type', 'V-ID', 'Driver No', 'Booking Name', 'Contact No', 'By', 'Remarks'].map((h) => (
                                        <th key={h} style={{
                                            padding: '10px 10px',
                                            textAlign: 'left',
                                            fontSize: 11,
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            color: '#6b7280',
                                            background: '#fdf6e8',
                                            borderBottom: '1px solid #e8d4aa',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {Array.isArray(bookings) && bookings.length > 0 ? (
                                    bookings.map((b, idx) => (
                                        <tr key={b.b_id || idx}
                                            style={{ background: idx % 2 === 0 ? '#fff' : '#fdf6e8' }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#faefd2'}
                                            onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? '#fff' : '#fdf6e8'}
                                        >
                                            {[
                                                b.b_id,
                                                'Pending',
                                                b.b_date,
                                                b.pickup,
                                                b.p_city || b.pickup_place || '-',
                                                b.d_place || b.drop_place || '-',
                                                b.t_type || 'General',
                                                b.v_types || '-',
                                                b.q || '-',
                                                b.d_mobile || '-',
                                                b.cus_name || '-',
                                                b.cus_mobile || '-',
                                                b.r_status || 'Staff',
                                                b.remarks || '-',
                                            ].map((val, ci) => (
                                                <td key={ci} title={String(val ?? '')} style={{
                                                    padding: '10px 10px',
                                                    color: '#1f2933',
                                                    fontWeight: 500,
                                                    borderBottom: '1px solid #f5ede0',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    maxWidth: 0,
                                                }}>{val}</td>
                                            ))}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="14" style={{
                                            textAlign: 'center',
                                            padding: '50px 20px',
                                            color: '#6b7280',
                                            fontWeight: 500,
                                        }}>
                                            No unassigned advance bookings over 24 hours out found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdvanceBookings;
