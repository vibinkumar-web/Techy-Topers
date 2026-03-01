import { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

        

        

const TripRefusal = () => {
    const toast = useToast();
const { api, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [bookingId, setBookingId] = useState('');
    const [vehicleId, setVehicleId] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/trip_refusal.php', {
                b_id: bookingId,
                v_id: vehicleId,
                reason: reason,
                user_id: user.emp_id
            });
            toast('Trip Refused Successfully. Vehicle is now free.');
            navigate('/assignments'); // Redirect to assignments to re-assign
        } catch (error) {
            console.error("Error refusing trip", error);
            toast("Failed to refuse trip.", 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-wrap">
            <div className="page-header">
                <div>
                    <div>
                        <h1>Action: Trip Refusal</h1>
                        <p>Document driver refusals and instantly release assigned vehicles</p>
                    </div>
                </div>
            </div>

            <div className="page-body">
                <div style={{ maxWidth: 640 }}>
                    <div className="section" style={{ borderTop: '3px solid #c5111a' }}>
                        <div style={{ padding: 32 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, borderBottom: '1px solid #fef2f2', paddingBottom: 16 }}>
                                <div style={{ background: '#fef2f2', width: 40, height: 40, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span className="material-icons" style={{ fontSize: 20, color: '#c5111a' }}>block</span>
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#c5111a' }}>Refusal Documentation</h3>
                                    <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>This action is audited and permanently recorded</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                <div className="form-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                                    <div className="form-field" style={{ margin: 0 }}>
                                        <label>Associated Booking ID <span style={{ color: '#c5111a' }}>*</span></label>
                                        <input
                                            type="text"
                                            value={bookingId}
                                            onChange={(e) => setBookingId(e.target.value)}
                                            placeholder="E.g. 10245"
                                            required
                                        />
                                    </div>
                                    <div className="form-field" style={{ margin: 0 }}>
                                        <label>Vehicle / Driver ID <span style={{ color: '#c5111a' }}>*</span></label>
                                        <input
                                            type="text"
                                            value={vehicleId}
                                            onChange={(e) => setVehicleId(e.target.value)}
                                            placeholder="E.g. V-102"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-field" style={{ margin: 0 }}>
                                    <label>Detailed Refusal Reason <span style={{ color: '#c5111a' }}>*</span></label>
                                    <textarea
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        rows="4"
                                        placeholder="Explain the context of the refusal (Driver no-show, vehicle breakdown, etc)..."
                                        style={{ resize: 'vertical' }}
                                        required
                                    ></textarea>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 24, borderTop: '1px solid #fdf6e8', gap: 12 }}>
                                    <button
                                        type="button"
                                        className="btn-ghost"
                                        onClick={() => navigate(-1)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn-primary"
                                        style={{ height: 42, padding: '0 32px', background: '#c5111a', opacity: loading ? 0.7 : 1, cursor: loading ? 'wait' : 'pointer' }}
                                        onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#7d0907'; }}
                                        onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#c5111a'; }}
                                    >
                                        <span className="material-icons" style={{ fontSize: 18 }}>gavel</span>
                                        {loading ? 'Processing...' : 'Confirm Refusal'}
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

export default TripRefusal;
