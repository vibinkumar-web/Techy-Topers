import { useState, useEffect, useContext } from 'react';
import { useToast } from '../context/ToastContext';
import AuthContext from '../context/AuthContext';

const LocalTripClosing = () => {
    const toast = useToast();
    const { api, user } = useContext(AuthContext);
    const [vehicles, setVehicles] = useState([]);
    const [selectedVid, setSelectedVid] = useState('');
    const [tripData, setTripData] = useState(null);
    const [calcBreakdown, setCalcBreakdown] = useState(null);
    const [formData, setFormData] = useState({
        closing_km: '',
        paid_amount: '',
        remarks: '',
        discount: '0',
        dis_reason: '',
        other_charge: '0',
        package_name: '',
        ac_type: '0', // 0: Non AC, 1: AC
        net_total: 0
    });

    const [baseFareConfig, setBaseFareConfig] = useState(190);

    useEffect(() => {
        fetchVehicles();
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

    const fetchVehicles = async () => {
        try {
            const response = await api.get('/local_trip_closing.php');
            setVehicles(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Error fetching vehicles", error);
        }
    };

    const handleVehicleSelect = async (e) => {
        const v_id = e.target.value;
        setSelectedVid(v_id);
        if (v_id) {
            try {
                const response = await api.get(`/local_trip_closing.php?v_id=${v_id}`);
                setTripData(response.data);
                // Pre-fill some data if needed
                setFormData(prev => ({ ...prev, ac_type: response.data.ac_type }));
            } catch (error) {
                console.error("Error fetching trip data", error);
            }
        } else {
            setTripData(null);
        }
    };



    const calculateNetTotal = () => {
        if (!tripData) return;

        const BASE_FARE = baseFareConfig;
        const openKm = parseFloat(tripData.open_km) || 0;
        const closeKm = parseFloat(formData.closing_km) || 0;

        if (closeKm <= 0) return;

        if (closeKm < openKm) {
            toast(`Closing KM (${closeKm}) must be greater than Opening KM (${openKm}).`, 'error');
            setCalcBreakdown(null);
            return;
        }

        const totalKm = closeKm - openKm;

        // Use rate directly from backend (joined from enquery_tariff)
        const isAc = String(formData.ac_type) === '1';
        const ratePerKm = isAc ? parseFloat(tripData.kmac) || 0 : parseFloat(tripData.kmnonac) || 0;

        const kmCharge = totalKm * ratePerKm;
        const net = BASE_FARE + kmCharge + parseFloat(formData.other_charge || 0) - parseFloat(formData.discount || 0);

        setCalcBreakdown({ totalKm, ratePerKm, kmCharge, baseFare: BASE_FARE, net });
        setFormData(prev => ({ ...prev, net_total: net, paid_amount: net }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!tripData) return;

        const payload = {
            ...tripData,
            ...formData,
            user_id: user?.emp_id || 'admin',
            pickup_time: tripData.bookin_time,
            p_city: tripData.p_city,
            d_place: tripData.d_place,
            rwads_point: '0',
            customer: tripData.b_name
        };

        try {
            await api.post('/local_trip_closing.php', payload);
            toast('Local Trip Closed Successfully');
            setTripData(null);
            setSelectedVid('');
            fetchVehicles();
        } catch (error) {
            console.error("Error closing trip", error);
            toast('Failed to close trip', 'error');
        }
    };

    return (
        <div className="page-wrap">
            <div className="page-header">
                <div>
                    <div>
                        <h1>Manual Trip Settlement</h1>
                        <p>Terminate operational trips prematurely or resolve orphaned trip records</p>
                    </div>
                </div>
            </div>

            <div className="page-body">
                <div style={{ maxWidth: 840, margin: '0 auto' }}>
                    <div className="section" style={{ padding: 40 }}>

                        {/* UI State: Trip Selection Grid */}
                        {!selectedVid && (
                            <div style={{ marginBottom: 40 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 8, background: '#fdf6e8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <span className="material-icons" style={{ color: '#023149', fontSize: 20 }}>policy</span>
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#023149' }}>Active Local Vehicles</h3>
                                        <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>Select an ongoing local assignment to manually settle the trip</p>
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
                                            <div key={v.v_id || v.b_id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20, boxShadow: '0 2px 4px rgba(2,49,73,0.04)', display: 'flex', flexDirection: 'column', gap: 16, transition: 'transform 0.15s' }}
                                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                                onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
                                                <div style={{ display: 'flex', justifyItems: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                                                    <div style={{ flex: 1 }}>
                                                        <span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em' }}>Vehicle ID</span>
                                                        <div style={{ fontSize: 18, fontWeight: 800, color: '#023149' }}>{v.v_id}</div>
                                                    </div>
                                                    <div style={{ background: '#f0fdf4', color: '#166534', padding: '4px 8px', borderRadius: 6, fontSize: 10, fontWeight: 800, border: '1px solid #bbf7d0', letterSpacing: '.05em' }}>LOCAL TRIP</div>
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: '#f8fafc', padding: 12, borderRadius: 8 }}>
                                                    <div>
                                                        <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>Booking</div>
                                                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>#{v.b_id || 'N/A'}</div>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>Customer</div>
                                                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{v.b_name || 'N/A'}</div>
                                                    </div>
                                                    <div style={{ gridColumn: 'span 2' }}>
                                                        <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>Route</div>
                                                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{v.p_city || 'HQ'} &rarr; {v.d_place || 'Destination'}</div>
                                                    </div>
                                                </div>
                                                <button onClick={() => handleVehicleSelect({ target: { value: v.v_id } })} style={{ width: '100%', background: '#023149', color: '#fff', border: 'none', padding: '10px', borderRadius: 6, fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, transition: 'background 0.15s' }}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = '#034a6f'}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = '#023149'}>
                                                    <span className="material-icons" style={{ fontSize: 18 }}>assignment_turned_in</span>
                                                    Manual Close
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* UI State: Closing Form */}
                        {selectedVid && (
                            <div style={{ marginBottom: 24 }}>
                                <button className="btn-ghost" onClick={() => { setSelectedVid(''); setTripData(null); }} style={{ padding: '6px 12px', background: '#fdf6e8', border: '1px solid #e8d4aa', color: '#023149' }}>
                                    <span className="material-icons" style={{ fontSize: 16 }}>arrow_back</span>
                                    Back to Active Trips
                                </button>
                            </div>
                        )}

                        {tripData && (
                            <form onSubmit={handleSubmit} style={{ animation: 'fadeIn 0.3s ease-out' }}>

                                {/* Warning: no tariff found for this vehicle type */}
                                {(parseFloat(tripData.kmnonac) === 0 && parseFloat(tripData.kmac) === 0) && (
                                    <div style={{ background: '#fffbeb', border: '1px solid #fbbf24', borderRadius: 8, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <span className="material-icons" style={{ color: '#d97706', fontSize: 20 }}>warning</span>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: '#92400e' }}>
                                            No per-km tariff found for vehicle <strong>"{tripData.matched_vehicle || tripData.v_type}"</strong>.
                                            Please add it in <strong>Settings → Vehicle Tariff</strong> to get correct fare.
                                        </span>
                                    </div>
                                )}

                                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 24, marginBottom: 40, position: 'relative', overflow: 'hidden' }}>
                                    <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 4, background: '#023149' }} />

                                    <h3 style={{ margin: '0 0 20px', fontSize: 14, fontWeight: 800, color: '#023149', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>
                                        <span className="material-icons" style={{ color: '#c5111a', fontSize: 18 }}>manage_search</span>
                                        Extracted Telemetry Data
                                    </h3>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
                                        <div>
                                            <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '.05em' }}>Reference Hash</div>
                                            <div style={{ fontSize: 16, fontWeight: 800, color: '#023149', fontFamily: 'monospace' }}>#{tripData.b_id}</div>
                                        </div>
                                        <div style={{ gridColumn: 'span 2' }}>
                                            <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '.05em' }}>Customer Profile Identifier</div>
                                            <div style={{ fontSize: 15, fontWeight: 700, color: '#023149' }}>{tripData.b_name} <span style={{ color: '#6b7280', fontWeight: 600, fontSize: 14 }}>| {tripData.m_no}</span></div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '.05em' }}>Initial Timestamp</div>
                                            <div style={{ fontSize: 14, fontWeight: 600, color: '#023149' }}>{tripData.bookin_time}</div>
                                        </div>
                                        <div style={{ gridColumn: 'span 4', background: '#fff', border: '1px dashed #cbd5e1', padding: 12, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em' }}>Recorded Origin Odometer</div>
                                            <div style={{ fontSize: 18, fontWeight: 900, color: '#023149' }}>{tripData.open_km} <span style={{ fontSize: 13, color: '#64748b', fontWeight: 700 }}>KM</span></div>
                                        </div>
                                    </div>
                                </div>

                                <h3 style={{ margin: '0 0 20px', fontSize: 14, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>
                                    Manual Override Parameters
                                </h3>

                                <div className="form-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
                                    <div className="form-field" style={{ margin: 0 }}>
                                        <label>Final Closing Odometer <span style={{ color: '#c5111a' }}>*</span></label>
                                        <input type="number" value={formData.closing_km} onChange={e => setFormData({ ...formData, closing_km: e.target.value })} required style={{ fontWeight: 600 }} />
                                    </div>
                                    <div className="form-field" style={{ margin: 0 }}>
                                        <label>Comfort Mode Used</label>
                                        <select value={formData.ac_type} onChange={e => setFormData({ ...formData, ac_type: e.target.value })}>
                                            <option value="0">Basic / Standard (Non-AC)</option>
                                            <option value="1">Premium Comfort (AC)</option>
                                        </select>
                                    </div>
                                    <div className="form-field" style={{ margin: 0 }}>
                                        <label>Applicable Package Set</label>
                                        <input type="text" value={formData.package_name} onChange={e => setFormData({ ...formData, package_name: e.target.value })} placeholder="Reference if any..." />
                                    </div>
                                    <div className="form-field" style={{ margin: 0 }}>
                                        <label>Aggregate Incidentals (₹)</label>
                                        <input type="number" value={formData.other_charge} onChange={e => setFormData({ ...formData, other_charge: e.target.value })} min="0" />
                                    </div>
                                    <div className="form-field" style={{ margin: 0 }}>
                                        <label>Discount (₹)</label>
                                        <input type="number" value={formData.discount} onChange={e => setFormData({ ...formData, discount: e.target.value })} min="0" />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                                        <button type="button" onClick={calculateNetTotal}
                                            style={{ height: 42, padding: '0 20px', background: '#023149', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, width: '100%', justifyContent: 'center' }}
                                        >
                                            <span className="material-icons" style={{ fontSize: 18 }}>calculate</span>
                                            Calculate Fare
                                        </button>
                                    </div>
                                </div>

                                {calcBreakdown && (
                                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '12px 20px', marginBottom: 24, display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Base Fare</div>
                                            <div style={{ fontSize: 16, fontWeight: 800, color: '#023149' }}>₹{calcBreakdown.baseFare}</div>
                                        </div>
                                        <div style={{ color: '#94a3b8', fontWeight: 700 }}>+</div>
                                        <div>
                                            <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Distance Charge</div>
                                            <div style={{ fontSize: 16, fontWeight: 800, color: '#023149' }}>{calcBreakdown.totalKm} km × ₹{calcBreakdown.ratePerKm} = ₹{calcBreakdown.kmCharge.toFixed(0)}</div>
                                        </div>
                                        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                                            <div style={{ fontSize: 11, fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>Calculated Total</div>
                                            <div style={{ fontSize: 22, fontWeight: 900, color: '#15803d' }}>₹{calcBreakdown.net.toFixed(0)}</div>
                                        </div>
                                    </div>
                                )}

                                <div style={{ borderTop: '2px solid #fdf6e8', paddingTop: 32, display: 'flex', justifyContent: 'flex-end', gap: 32, alignItems: 'flex-end' }}>
                                    <div className="form-field" style={{ margin: 0, width: 220 }}>
                                        <label style={{ fontSize: 13, fontWeight: 700 }}>Computed Net Amount (₹) <span style={{ color: '#c5111a' }}>*</span></label>
                                        <input type="number" value={formData.net_total} onChange={e => setFormData({ ...formData, net_total: e.target.value })} required min="0" style={{ fontWeight: 800, color: '#023149', fontSize: 16 }} />
                                    </div>
                                    <div className="form-field" style={{ margin: 0, width: 220 }}>
                                        <label style={{ fontSize: 13, fontWeight: 700 }}>Actual Cash Rendered (₹) <span style={{ color: '#c5111a' }}>*</span></label>
                                        <input type="number" value={formData.paid_amount} onChange={e => setFormData({ ...formData, paid_amount: e.target.value })} required min="0" style={{ fontWeight: 800, color: '#023149', borderColor: '#023149', fontSize: 16 }} />
                                    </div>
                                    <button type="submit" className="btn-primary" style={{ height: 44, padding: '0 40px', background: '#c5111a', fontSize: 15 }} onMouseEnter={e => e.currentTarget.style.background = '#7d0907'} onMouseLeave={e => e.currentTarget.style.background = '#c5111a'}>
                                        <span className="material-icons" style={{ fontSize: 20 }}>eject</span>
                                        Force Completion
                                    </button>
                                </div>
                            </form>
                        )}

                        {!tripData && selectedVid === '' && (
                            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
                                <span className="material-icons" style={{ fontSize: 48, color: '#cbd5e1', marginBottom: 16, display: 'block' }}>gps_not_fixed</span>
                                <div style={{ fontSize: 16, fontWeight: 600, color: '#023149' }}>No target assigned</div>
                                <div style={{ fontSize: 14, marginTop: 4 }}>Select an active vehicle to pull telemetry and initiate manual settling array.</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default LocalTripClosing;


