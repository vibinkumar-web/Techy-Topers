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

            <div className="page-body" style={{ padding: '0 !important' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ margin: 0, fontSize: 11, borderSpacing: 0, width: '100%', minWidth: 1500 }}>
                        <thead style={{ background: '#0062ff', color: '#fff' }}>
                            <tr>
                                <th style={{ whiteSpace: 'nowrap', padding: '12px 16px', fontWeight: 600 }}>B-ID</th>
                                <th style={{ whiteSpace: 'nowrap', padding: '12px 16px', fontWeight: 600 }}>Status</th>
                                <th style={{ whiteSpace: 'nowrap', padding: '12px 16px', fontWeight: 600 }}>Call-Time</th>
                                <th style={{ whiteSpace: 'nowrap', padding: '12px 16px', fontWeight: 600 }}>Pick-up Date Time</th>
                                <th style={{ whiteSpace: 'nowrap', padding: '12px 16px', fontWeight: 600 }}>Pickup Place</th>
                                <th style={{ whiteSpace: 'nowrap', padding: '12px 16px', fontWeight: 600 }}>Drop Place</th>
                                <th style={{ whiteSpace: 'nowrap', padding: '12px 16px', fontWeight: 600 }}>Trip Type</th>
                                <th style={{ whiteSpace: 'nowrap', padding: '12px 16px', fontWeight: 600 }}>V-Type</th>
                                <th style={{ whiteSpace: 'nowrap', padding: '12px 16px', fontWeight: 600 }}>V-ID</th>
                                <th style={{ whiteSpace: 'nowrap', padding: '12px 16px', fontWeight: 600 }}>Driver No</th>
                                <th style={{ whiteSpace: 'nowrap', padding: '12px 16px', fontWeight: 600 }}>Booking Name</th>
                                <th style={{ whiteSpace: 'nowrap', padding: '12px 16px', fontWeight: 600 }}>Contact No</th>
                                <th style={{ whiteSpace: 'nowrap', padding: '12px 16px', fontWeight: 600 }}>By</th>
                                <th style={{ whiteSpace: 'nowrap', padding: '12px 16px', fontWeight: 600 }}>Remarks</th>
                            </tr>
                        </thead>
                        <tbody style={{ background: '#e2e8f0', color: '#334155', fontWeight: 600 }}>
                            {Array.isArray(bookings) && bookings.length > 0 ? (
                                bookings.map((b) => {
                                    return (
                                        <tr key={b.b_id || Math.random()}>
                                            <td style={{ padding: '12px 16px' }}>{b.b_id}</td>
                                            <td style={{ padding: '12px 16px' }}>Pending</td>
                                            <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>{b.b_date}</td>
                                            <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>{b.pickup}</td>
                                            <td style={{ padding: '12px 16px' }}>{b.p_city || b.pickup_place}</td>
                                            <td style={{ padding: '12px 16px' }}>{b.d_place || b.drop_place}</td>
                                            <td style={{ padding: '12px 16px' }}>{b.t_type || 'General'}</td>
                                            <td style={{ padding: '12px 16px' }}>{b.v_types}</td>
                                            <td style={{ padding: '12px 16px' }}>{b.q || '-'}</td>
                                            <td style={{ padding: '12px 16px' }}>{b.d_mobile || '-'}</td>
                                            <td style={{ padding: '12px 16px' }}>{b.cus_name}</td>
                                            <td style={{ padding: '12px 16px' }}>{b.cus_mobile}</td>
                                            <td style={{ padding: '12px 16px' }}>{b.r_status || 'Staff'}</td>
                                            <td style={{ padding: '12px 16px' }}>{b.remarks || '-'}</td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="14" style={{ textAlign: 'center', padding: '40px', color: '#6b7280', background: '#fff' }}>
                                        No unassigned advance bookings over 24 hours out found.
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

export default AdvanceBookings;
