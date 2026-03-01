import { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

        

        

import AuthContext from '../context/AuthContext';
const CancelBooking = () => {
    const toast = useToast();
const { api, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const booking = location.state?.booking;

    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCancel = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/cancel.php', {
                b_id: booking.b_id,
                reason: reason,
                user_id: user?.emp_id || user?.id || 1
            });
            toast('Booking cancelled successfully.');
            navigate('/bookings');
        } catch (error) {
            console.error("Error cancelling booking", error);
            const msg = error.response?.data?.message || error.message || "Unknown error";
            toast('Failed to cancel booking: ' + msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!booking) {
        return (
            <div className="page-wrap">
                <div className="page-header">
                    <div>
                        <div>
                            <h1 style={{ color: '#c5111a' }}>Booking Not Available</h1>
                            <p>Could not locate the booking requested for cancellation</p>
                        </div>
                        <button className="btn-ghost" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }} onClick={() => navigate('/bookings')}>
                            <span className="material-icons">arrow_back</span>
                            Back to Bookings
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-wrap">
            <div className="page-header">
                <div>
                    <div>
                        <h1>Cancel Booking</h1>
                        <p>Withdraw and cancel scheduled trip #{booking.b_id}</p>
                    </div>
                    <button className="btn-ghost" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }} onClick={() => navigate('/bookings')}>
                        <span className="material-icons" style={{ fontSize: 16 }}>arrow_back</span>
                        Back to Bookings
                    </button>
                </div>
            </div>

            <div className="page-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 640 }}>

                    <div className="section" style={{ borderTop: '3px solid #c5111a' }}>
                        <div style={{ padding: 32 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, borderBottom: '1px solid #fef2f2', paddingBottom: 16 }}>
                                <div style={{ background: '#fef2f2', width: 40, height: 40, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span className="material-icons" style={{ fontSize: 20, color: '#c5111a' }}>warning</span>
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#c5111a' }}>Destructive Action</h3>
                                    <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>This cancellation process is permanent and irreversible</p>
                                </div>
                            </div>

                            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 20, marginBottom: 32 }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    <div>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: 4 }}>Customer Profile</div>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: '#023149' }}>{booking.b_name || booking.cus_name}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: 4 }}>Pickup Timing</div>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: '#475569' }}>{booking.bookin_time || booking.pickup_time}</div>
                                    </div>
                                    <div style={{ gridColumn: 'span 2', borderTop: '1px dashed #cbd5e1', paddingTop: 16, marginTop: 4 }}>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: 4 }}>Mapped Route</div>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: '#023149' }}>{booking.pickup} &rarr; {booking.p_city || booking.drop_place || booking.d_place}</div>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleCancel} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                <div className="form-field" style={{ margin: 0 }}>
                                    <label>Reason for Cancellation <span style={{ color: '#c5111a' }}>*</span></label>
                                    <textarea
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        rows="4"
                                        placeholder="Please provide a brief, detailed reason..."
                                        required
                                        style={{ resize: 'vertical' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16, paddingTop: 24, borderTop: '1px solid #fdf6e8' }}>
                                    <button
                                        type="button"
                                        className="btn-ghost"
                                        onClick={() => navigate('/bookings')}
                                        disabled={loading}
                                        style={{ height: 42, padding: '0 24px' }}
                                    >
                                        Abort
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn-primary"
                                        style={{ background: '#c5111a', height: 42, padding: '0 32px', color: '#fff', border: 'none', opacity: loading ? 0.7 : 1, cursor: loading ? 'wait' : 'pointer' }}
                                        onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#7d0907'; }}
                                        onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#c5111a'; }}
                                    >
                                        <span className="material-icons" style={{ fontSize: 18 }}>cancel</span>
                                        {loading ? 'Processing...' : 'Confirm Cancellation'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CancelBooking;
