import { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../context/ToastContext';





import AuthContext from '../context/AuthContext';
const TripClosing = () => {
    const toast = useToast();
    const { api, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const booking = location.state?.booking;

    const [vehicles, setVehicles] = useState([]);
    const [selectedBid, setSelectedBid] = useState('');

    const [tripDetails, setTripDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    const [openingKmInput, setOpeningKmInput] = useState('');
    const [savingOpeningKm, setSavingOpeningKm] = useState(false);

    const [formData, setFormData] = useState({
        closing_km: '',
        waiting_charges: 0,
        other_charge: 0,
        discount: 0,
        dis_reason: '',
        paid_amount: 0,
        remarks: ''
    });

    const [calculated, setCalculated] = useState({
        total_km: 0,
        km_charge: 0,
        base_fare: 0,
        rate_per_km: 0,
        net_total: 0
    });

    const [baseFareConfig, setBaseFareConfig] = useState(190);

    useEffect(() => {
        const fetchBaseFareConfig = async () => {
            try {
                const res = await api.get('/settings.php?config=base_fare');
                setBaseFareConfig(res.data.base_fare ?? 190);
            } catch (e) {
                console.error('Failed to load base fare config', e);
            }
        };
        fetchBaseFareConfig();
    }, []);

    useEffect(() => {
        if (booking) {
            setSelectedBid(booking.b_id);
            fetchTripDetails(booking.b_id);
        } else {
            fetchVehicles();
        }
    }, [booking]);

    const fetchVehicles = async () => {
        try {
            const response = await api.get('/closing.php');
            setVehicles(Array.isArray(response.data) ? response.data : []);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching vehicles", error);
            setLoading(false);
        }
    };

    const fetchTripDetails = async (b_id) => {
        try {
            const response = await api.get(`/closing.php?b_id=${b_id}`);
            setTripDetails(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching trip details", error);
            setLoading(false);
        }
    };



    const handleVehicleSelect = (e) => {
        const b_id = e.target.value;
        setSelectedBid(b_id);
        if (b_id) {
            setLoading(true);
            fetchTripDetails(b_id);
        } else {
            setTripDetails(null);
        }
    };



    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };



    const calculateFare = () => {
        if (!tripDetails) return;

        const BASE_FARE = baseFareConfig;
        const openKm = parseFloat(tripDetails.open_km) || 0;
        const closeKm = parseFloat(formData.closing_km) || 0;

        if (closeKm <= 0) return;

        if (closeKm < openKm) {
            toast(`Closing KM (${closeKm}) must be greater than Opening KM (${openKm}).`, 'error');
            setCalculated({ total_km: 0, km_charge: 0, base_fare: BASE_FARE, rate_per_km: 0, net_total: 0 });
            return;
        }

        const totalKm = closeKm - openKm;

        // Use rate directly from backend (joined from enquery_tariff)
        const isAc = tripDetails.ac_type === '1' || tripDetails.ac_type === 'ac';
        const ratePerKm = isAc ? parseFloat(tripDetails.kmac) || 0 : parseFloat(tripDetails.kmnonac) || 0;

        const kmCharge = totalKm * ratePerKm;
        const netTotal = BASE_FARE + kmCharge + parseFloat(formData.waiting_charges || 0) + parseFloat(formData.other_charge || 0) - parseFloat(formData.discount || 0);

        setCalculated({
            total_km: totalKm,
            km_charge: kmCharge,
            base_fare: BASE_FARE,
            rate_per_km: ratePerKm,
            net_total: netTotal
        });

        setFormData(prev => ({ ...prev, paid_amount: netTotal }));
    };

    const handleSaveOpeningKm = async () => {
        if (!openingKmInput) { toast('Please enter Opening KM.', 'error'); return; }
        if (!tripDetails?.v_id) { toast('No vehicle found for this trip.', 'error'); return; }
        setSavingOpeningKm(true);
        try {
            await api.post('/ontrip.php', {
                action: 'save_opening_km',
                v_id: tripDetails.v_id,
                opening_km: openingKmInput,
            });
            toast('Opening KM saved successfully!');
            // Refresh trip details so the saved KM shows
            fetchTripDetails(tripDetails.b_id);
            setOpeningKmInput('');
        } catch (err) {
            toast(err.response?.data?.message || 'Failed to save Opening KM.', 'error');
        } finally {
            setSavingOpeningKm(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // 1. Close the trip normally
            await api.post('/closing.php', {
                ...tripDetails,
                ...formData,
                net_total: calculated.net_total,
                user_id: user.emp_id,
                opening_km: tripDetails.open_km || 0
            });

            // 2. Automatically record standard 10% Office Commission to the new Finance Ledger
            const commissionCut = (calculated.net_total * 0.10).toFixed(2);
            if (commissionCut > 0 && tripDetails.v_id) {
                await api.post('/finance.php', {
                    action: 'process_commission',
                    b_id: tripDetails.b_id,
                    v_id: tripDetails.v_id,
                    amount: commissionCut
                });
            }

            toast('Trip closed successfully & Commission registered! Check dashboard for summary.');
            navigate('/dashboard');
        } catch (error) {
            console.error("Error closing trip or ledgering commission", error);
            toast('Failed to properly close trip and ledger finance data.', 'error');
        }
    };

    return (
        <div className="page-wrap">
            <div className="page-header">
                <div>
                    <div>
                        <h1>Outstation Trip Closing</h1>
                        <p>Complete trip details, calculate fares, and process payment.</p>
                    </div>
                </div>
            </div>

            <div className="page-body">
                <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                    <div className="section" style={{ padding: 32 }}>

                        {/* UI State: Trip Selection Grid */}
                        {!selectedBid && !loading && (
                            <div style={{ marginBottom: 40 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 8, background: '#fdf6e8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <span className="material-icons" style={{ color: '#023149', fontSize: 20 }}>local_taxi</span>
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#023149' }}>Active Dispatched Vehicles</h3>
                                        <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>Select an ongoing outstation trip to complete and calculate charges</p>
                                    </div>
                                </div>
                                {vehicles.length === 0 ? (
                                    <div style={{ padding: 40, textAlign: 'center', background: '#f8fafc', borderRadius: 8, border: '1px dashed #cbd5e1' }}>
                                        <span className="material-icons" style={{ fontSize: 40, color: '#94a3b8', marginBottom: 16 }}>no_crash</span>
                                        <h3 style={{ margin: '0 0 8px', color: '#475569' }}>No Active Trips</h3>
                                        <p style={{ margin: 0, color: '#6b7280', fontSize: 14 }}>There are currently no dispatched vehicles waiting to be closed.</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                                        {vehicles.map(v => (
                                            <div key={v.b_id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20, boxShadow: '0 2px 4px rgba(2,49,73,0.04)', display: 'flex', flexDirection: 'column', gap: 16, transition: 'transform 0.15s' }}
                                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                                onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
                                                <div style={{ display: 'flex', justifyItems: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                                                    <div style={{ flex: 1 }}>
                                                        <span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em' }}>Booking ID</span>
                                                        <div style={{ fontSize: 18, fontWeight: 800, color: '#023149' }}>#{v.b_id}</div>
                                                    </div>
                                                    <div style={{ background: '#f0fdf4', color: '#166534', padding: '4px 8px', borderRadius: 6, fontSize: 10, fontWeight: 800, border: '1px solid #bbf7d0', letterSpacing: '.05em' }}>ON TRIP</div>
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: '#f8fafc', padding: 12, borderRadius: 8 }}>
                                                    <div>
                                                        <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>Customer</div>
                                                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{v.b_name || v.customer_name || 'N/A'}</div>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>Vehicle</div>
                                                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{v.v_id || 'N/A'}</div>
                                                    </div>
                                                    <div style={{ gridColumn: 'span 2' }}>
                                                        <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>Route</div>
                                                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{v.p_city || 'HQ'} &rarr; {v.d_place || 'Destination'}</div>
                                                    </div>
                                                </div>
                                                <button onClick={() => handleVehicleSelect({ target: { value: v.b_id } })} style={{ width: '100%', background: '#023149', color: '#fff', border: 'none', padding: '10px', borderRadius: 6, fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, transition: 'background 0.15s' }}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = '#034a6f'}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = '#023149'}>
                                                    <span className="material-icons" style={{ fontSize: 18 }}>assignment_turned_in</span>
                                                    Close Trip
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* UI State: Closing Form */}
                        {selectedBid && (
                            <div style={{ marginBottom: 24 }}>
                                <button className="btn-ghost" onClick={() => { setSelectedBid(''); setTripDetails(null); }} style={{ padding: '6px 12px', background: '#fdf6e8', border: '1px solid #e8d4aa', color: '#023149' }}>
                                    <span className="material-icons" style={{ fontSize: 16 }}>arrow_back</span>
                                    Back to Active Trips
                                </button>
                            </div>
                        )}

                        {loading && selectedBid && (
                            <div style={{ padding: 40, textAlign: 'center', color: '#023149', fontWeight: 600 }}>
                                Loading trip details...
                            </div>
                        )}

                        {tripDetails && !loading && (
                            <form onSubmit={handleSubmit} style={{ animation: 'fadeIn 0.3s ease-out' }}>

                                {/* Warning: no tariff found for this vehicle type */}
                                {(parseFloat(tripDetails.kmnonac) === 0 && parseFloat(tripDetails.kmac) === 0) && (
                                    <div style={{ background: '#fffbeb', border: '1px solid #fbbf24', borderRadius: 8, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <span className="material-icons" style={{ color: '#d97706', fontSize: 20 }}>warning</span>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: '#92400e' }}>
                                            No per-km tariff found for vehicle <strong>"{tripDetails.matched_vehicle || tripDetails.v_type}"</strong>.
                                            Please add it in <strong>Settings → Vehicle Tariff</strong> to get correct fare.
                                        </span>
                                    </div>
                                )}

                                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '20px 24px', marginBottom: 32, display: 'flex', flexWrap: 'wrap', gap: 40 }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        <div><span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginRight: 8 }}>Booking ID:</span> <span style={{ fontSize: 14, fontWeight: 800, color: '#023149' }}>#{tripDetails.b_id}</span></div>
                                        <div><span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginRight: 8 }}>Customer:</span> <span style={{ fontSize: 14, fontWeight: 600, color: '#023149' }}>{tripDetails.b_name}</span></div>
                                        <div><span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginRight: 8 }}>Contact:</span> <span style={{ fontSize: 14, fontWeight: 600, color: '#475569' }}>{tripDetails.m_no}</span></div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        <div><span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginRight: 8 }}>Route:</span> <span style={{ fontSize: 14, fontWeight: 600, color: '#023149' }}>{tripDetails.p_city} &rarr; {tripDetails.d_place}</span></div>
                                        <div><span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginRight: 8 }}>Vehicle:</span> <span style={{ fontSize: 14, fontWeight: 600, color: '#023149' }}>{tripDetails.v_type} <span style={{ color: '#6b7280', fontWeight: 400 }}>({tripDetails.v_id})</span></span></div>
                                        <div><span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginRight: 8 }}>Pickup:</span> <span style={{ fontSize: 14, fontWeight: 600, color: '#475569' }}>{tripDetails.bookin_time}</span></div>
                                    </div>
                                </div>

                                <div style={{ marginBottom: 32 }}>
                                    <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 800, color: '#023149', borderBottom: '1px solid #fdf6e8', paddingBottom: 12 }}>
                                        Mileage Details
                                    </h3>
                                    <div className="form-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>

                                        {/* Opening KM — editable with Save */}
                                        <div className="form-field" style={{ gridColumn: tripDetails.open_km ? 'span 1' : 'span 2' }}>
                                            <label>Opening KM</label>
                                            {tripDetails.open_km ? (
                                                <div style={{ height: 42, background: '#f0fdf4', border: '1.5px solid #86efac', color: '#166534', fontWeight: 800, borderRadius: 8, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <span className="material-icons" style={{ fontSize: 16, color: '#22c55e' }}>check_circle</span>
                                                    {tripDetails.open_km} km
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', gap: 8 }}>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        placeholder="Enter opening KM"
                                                        value={openingKmInput}
                                                        onChange={e => setOpeningKmInput(e.target.value)}
                                                        style={{ fontWeight: 700, borderColor: '#e8d4aa', background: '#fffdf5' }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={handleSaveOpeningKm}
                                                        disabled={savingOpeningKm || !openingKmInput}
                                                        style={{
                                                            flexShrink: 0, height: 42, padding: '0 16px',
                                                            background: openingKmInput ? '#023149' : '#e2e8f0',
                                                            color: openingKmInput ? '#fff' : '#94a3b8',
                                                            border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13,
                                                            cursor: openingKmInput ? 'pointer' : 'not-allowed',
                                                            display: 'flex', alignItems: 'center', gap: 6,
                                                            whiteSpace: 'nowrap'
                                                        }}
                                                    >
                                                        <span className="material-icons" style={{ fontSize: 16 }}>save</span>
                                                        {savingOpeningKm ? 'Saving...' : 'Save KM'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="form-field">
                                            <label>Closing KM <span style={{ color: '#c5111a' }}>*</span></label>
                                            <input type="number" name="closing_km" value={formData.closing_km} onChange={handleInputChange} onBlur={calculateFare} required />
                                        </div>
                                        <div className="form-field">
                                            <label>Trip Distance</label>
                                            <div style={{ height: 42, background: '#f0f9ff', border: '1px solid #bae6fd', color: '#0369a1', fontWeight: 800, borderRadius: 8, padding: '0 16px', display: 'flex', alignItems: 'center' }}>
                                                {calculated.total_km} km
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginBottom: 32 }}>
                                    <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 800, color: '#023149', borderBottom: '1px solid #fdf6e8', paddingBottom: 12 }}>
                                        Additional Charges &amp; Considerations
                                    </h3>
                                    <div className="form-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                                        <div className="form-field">
                                            <label>Waiting Charges (₹)</label>
                                            <input type="number" name="waiting_charges" value={formData.waiting_charges} onChange={handleInputChange} onBlur={calculateFare} min="0" />
                                        </div>
                                        <div className="form-field">
                                            <label>Other Charges (₹)</label>
                                            <input type="number" name="other_charge" value={formData.other_charge} onChange={handleInputChange} onBlur={calculateFare} min="0" />
                                        </div>
                                        <div className="form-field">
                                            <label>Discount Applied (₹)</label>
                                            <input type="number" name="discount" value={formData.discount} onChange={handleInputChange} onBlur={calculateFare} min="0" />
                                        </div>
                                        <div className="form-field">
                                            <label>Discount Reason</label>
                                            <input type="text" name="dis_reason" value={formData.dis_reason} onChange={handleInputChange} placeholder="E.g., loyal customer" />
                                        </div>
                                    </div>
                                </div>

                                <div className="form-field" style={{ marginBottom: 32 }}>
                                    <label>Internal Ledger / Remarks</label>
                                    <textarea name="remarks" value={formData.remarks} onChange={handleInputChange} rows="2" style={{ resize: 'none' }} placeholder="Admin notes..."></textarea>
                                </div>

                                <div style={{ borderTop: '2px solid #fdf6e8', paddingTop: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                    <div style={{ display: 'flex', gap: 16 }}>
                                        <button type="button" className="btn-ghost" onClick={() => navigate('/bookings')} style={{ height: 42 }}>
                                            Abandon
                                        </button>
                                        <button type="button" onClick={calculateFare} className="btn-secondary" style={{ height: 42 }}>
                                            <span className="material-icons" style={{ fontSize: 18 }}>autorenew</span>
                                            Recalculate Totals
                                        </button>
                                    </div>

                                    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-end' }}>
                                        <div style={{ textAlign: 'right', background: '#f0fdf4', padding: '12px 24px', borderRadius: 8, border: '1px solid #bbf7d0', minWidth: 220, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                                            <div style={{ fontSize: 12, fontWeight: 700, color: '#166534', textTransform: 'uppercase', marginBottom: 2 }}>Total System Fare</div>
                                            {calculated.total_km > 0 && (
                                                <>
                                                    <div style={{ fontSize: 11, color: '#6b7280' }}>Base fare: <strong style={{ color: '#023149' }}>₹{calculated.base_fare}</strong></div>
                                                    <div style={{ fontSize: 11, color: '#6b7280' }}>{calculated.total_km} km × ₹{calculated.rate_per_km} = <strong style={{ color: '#023149' }}>₹{calculated.km_charge?.toFixed(0)}</strong></div>
                                                </>
                                            )}
                                            <div style={{ fontSize: 24, fontWeight: 900, color: '#15803d' }}>₹ {calculated.net_total}</div>
                                        </div>
                                        <div className="form-field" style={{ margin: 0, width: 220 }}>
                                            <label style={{ fontSize: 13 }}>Final Captured Amount (₹) <span style={{ color: '#c5111a' }}>*</span></label>
                                            <input
                                                type="number"
                                                name="paid_amount"
                                                value={formData.paid_amount}
                                                onChange={handleInputChange}
                                                required
                                                style={{ fontSize: 16, fontWeight: 700, color: '#023149', borderColor: '#023149' }}
                                            />
                                        </div>
                                        <button type="submit" className="btn-primary" style={{ height: 44, padding: '0 32px', background: '#023149' }}>
                                            <span className="material-icons" style={{ fontSize: 20 }}>done_all</span>
                                            Close Out Trip
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TripClosing;
