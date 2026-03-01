import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';





import AuthContext from '../context/AuthContext';
const LocalTrip = () => {
    const toast = useToast();
    const { v_id } = useParams();
    const navigate = useNavigate();
    const { api, user } = useContext(AuthContext);
    const [vehicleRates, setVehicleRates] = useState([]);
    const [loading, setLoading] = useState(true);

    // Trip and Tariff Data
    const [tripData, setTripData] = useState(null);
    const [tariff, setTariff] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        opening_km: '',
        closing_km: '',
        trip_km: 0,
        extra_km: 0,
        package_name: '',
        package_charge: 0,
        extra_km_charge: 0,
        sub_total: 0,
        other_charge: 0,
        return_charge: 0,
        waiting_hrs: 0,
        waiting_mins: 0,
        waiting_charge: 0,
        toll_gate: 0,
        permit: 0,
        driver_batta: 0,
        city_limit: 0,
        parking: 0,
        night_charge: 0,
        other_expenses: 0,
        discount: 0,
        dis_reason: '',
        total_amount: 0,
        advance: 0,
        net_total: 0,
        paid_amount: 0,
        remarks: '',
        ac_value: '0', // 0: Non AC, 1: AC
        t_type: '0', // 0: Up&Down, 1: Drop
        drop_time: '',
        drop_date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchTripDetails();
        fetchVehicleRates();
    }, [v_id]);

    const fetchVehicleRates = async () => {
        try {
            const res = await api.get('/vehicle_pricing.php');
            setVehicleRates(res.data || []);
        } catch (e) {
            console.error("Failed to load vehicle rates", e);
        }
    };

    const fetchTripDetails = async () => {
        try {
            const response = await api.get(`/localtrip.php?v_id=${v_id}`);
            const { trip, tariff } = response.data;
            setTripData(trip);
            setTariff(tariff);

            // Initialize form with trip data
            setFormData(prev => ({
                ...prev,
                opening_km: trip.open_km,
                advance: trip.advance || 0, // Assuming advance is somewhere?
                ac_value: trip.ac_type,
                t_type: trip.t_type,
                drop_time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
            }));

            setLoading(false);
        } catch (error) {
            console.error("Error fetching trip details", error);
            toast("Failed to load trip details.", 'error');
            setLoading(false);
        }
    };



    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    useEffect(() => {
        calculateTotals();
    }, [
        formData.closing_km, formData.opening_km, formData.other_charge,
        formData.return_charge, formData.waiting_hrs, formData.waiting_mins,
        formData.toll_gate, formData.permit, formData.driver_batta,
        formData.city_limit, formData.parking, formData.night_charge,
        formData.other_expenses, formData.discount, formData.advance, tariff
    ]);

    const calculateTotals = () => {
        if (!tariff) return;

        const open = parseFloat(formData.opening_km) || 0;
        const close = parseFloat(formData.closing_km) || 0;
        const tripKm = close - open;

        let pkgName = '';
        let pkgCharge = 0;
        let extraKm = 0;
        let extraCharge = 0;

        const minKm = parseFloat(tariff?.mini_km) || 0;
        const minAmt = parseFloat(tariff?.min_amt) || 0;

        let perKmRate = parseFloat(tariff?.c_p_km) || 0;
        // Override with dynamic vehicle rate if it exists
        if (tripData?.v_type) {
            const vTypeSearch = tripData.v_type.toLowerCase().trim();
            const match = vehicleRates.find(v => v.v_name.toLowerCase().includes(vTypeSearch) || vTypeSearch.includes(v.v_name.toLowerCase().split(' ')[0]));
            if (match) {
                const isAc = formData.ac_value === '1';
                const dynamicRate = isAc ? parseFloat(match.kmac) : parseFloat(match.kmnonac);
                if (dynamicRate > 0) {
                    perKmRate = dynamicRate;
                }
            }
        }

        if (tripKm <= minKm) {
            pkgName = `${minKm} KM Package`;
            pkgCharge = minAmt;
            extraKm = 0;
        } else {
            pkgName = `${minKm} KM Package + Extra`;
            pkgCharge = minAmt;
            extraKm = tripKm - minKm;
        }

        extraCharge = extraKm * perKmRate;

        const subTotal = pkgCharge + extraCharge;

        const others = (parseFloat(formData.other_charge) || 0) +
            (parseFloat(formData.return_charge) || 0) +
            (parseFloat(formData.waiting_charge) || 0) +
            (parseFloat(formData.toll_gate) || 0) +
            (parseFloat(formData.permit) || 0) +
            (parseFloat(formData.driver_batta) || 0) +
            (parseFloat(formData.city_limit) || 0) +
            (parseFloat(formData.parking) || 0) +
            (parseFloat(formData.night_charge) || 0) +
            (parseFloat(formData.other_expenses) || 0);

        const gross = subTotal + others;
        const discount = parseFloat(formData.discount) || 0;
        const advance = parseFloat(formData.advance) || 0;
        const net = gross - discount - advance;

        setFormData(prev => ({
            ...prev,
            trip_km: tripKm,
            package_name: pkgName,
            package_charge: pkgCharge,
            extra_km: extraKm,
            extra_km_charge: extraCharge,
            sub_total: subTotal,
            total_amount: gross,
            net_total: net
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/localtrip.php', {
                b_id: tripData.b_id,
                v_id: tripData.v_id,
                opening_km: formData.opening_km,
                closing_km: formData.closing_km,
                remarks: formData.remarks,
                pickup_time: tripData.bookin_time,
                p_date: tripData.bookin_time.split(' ')[0],
                drop_time: formData.drop_time,
                d_date: formData.drop_date,
                ac_type: formData.ac_value,
                t_type: formData.t_type,
                v_type: tripData.v_type,
                picup_place: tripData.p_city,
                drop_place: tripData.d_place,
                rwards_point: 0,
                packagename: formData.package_name,
                other_charge: formData.other_expenses,
                net_total: formData.net_total,
                paid_amount: formData.paid_amount,
                discount: formData.discount,
                dis_reason: formData.dis_reason,
                to_whom: tripData.to_whom,
                customer: tripData.b_name,
                m_no: tripData.m_no,
                d_mobile: tripData.d_mobile,
                pending: (parseFloat(formData.net_total) > parseFloat(formData.paid_amount)) ? '1' : '0',
                user_id: user.emp_id
            });
            toast('Local Trip Closed Successfully! View dashboard for summary.');
            navigate('/dashboard');
        } catch (error) {
            console.error("Error closing local trip", error);
            toast("Failed to close trip.", 'error');
        }
    };

    if (loading) return (
        <div className="page-wrap">
            <div className="page-body" style={{ padding: 60, textAlign: 'center', color: '#023149', fontWeight: 600 }}>
                Loading trip execution specifics...
            </div>
        </div>
    );

    return (
        <div className="page-wrap">
            <div className="page-header">
                <div>
                    <div>
                        <h1>Local Trip Completion Logging</h1>
                        <p>Complete execution parameters, resolve calculated fares, and archive local sector trips</p>
                    </div>
                </div>
            </div>

            <div className="page-body">
                <div style={{ maxWidth: 1040, margin: '0 auto' }}>
                    <form onSubmit={handleSubmit} className="section" style={{ padding: 40 }}>

                        {/* Summary Header Cards */}
                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 24, marginBottom: 40, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
                            <div style={{ display: 'flex', gap: 16 }}>
                                <div style={{ width: 44, height: 44, borderRadius: 22, background: '#f0f9ff', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span className="material-icons" style={{ fontSize: 22 }}>receipt_long</span>
                                </div>
                                <div>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: 4, letterSpacing: '.05em' }}>Booking Referencer</div>
                                    <div style={{ fontSize: 18, fontWeight: 800, color: '#023149', fontFamily: 'monospace' }}>#{tripData.b_id}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 16, borderLeft: '1px solid #e2e8f0', paddingLeft: 32 }}>
                                <div style={{ width: 44, height: 44, borderRadius: 22, background: '#f0fdf4', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span className="material-icons" style={{ fontSize: 22 }}>airport_shuttle</span>
                                </div>
                                <div>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: 4, letterSpacing: '.05em' }}>Assigned Asset</div>
                                    <div style={{ fontSize: 16, fontWeight: 800, color: '#023149' }}>
                                        {tripData.v_id}
                                    </div>
                                    <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{tripData.v_type}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 16, borderLeft: '1px solid #e2e8f0', paddingLeft: 32 }}>
                                <div style={{ width: 44, height: 44, borderRadius: 22, background: '#fef2f2', color: '#b91c1c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span className="material-icons" style={{ fontSize: 22 }}>person_pin</span>
                                </div>
                                <div>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: 4, letterSpacing: '.05em' }}>Customer Profile</div>
                                    <div style={{ fontSize: 16, fontWeight: 800, color: '#023149' }}>{tripData.b_name}</div>
                                    <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{tripData.m_no}</div>
                                </div>
                            </div>
                        </div>

                        {/* Mileage Calibration Section */}
                        <div style={{ marginBottom: 40 }}>
                            <h3 style={{ margin: '0 0 20px', fontSize: 14, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>
                                <span className="material-icons" style={{ fontSize: 18, color: '#689abb', verticalAlign: 'text-bottom', marginRight: 8 }}>route</span>
                                Mileage Registration &amp; Audit
                            </h3>
                            <div className="form-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                                <div className="form-field" style={{ margin: 0 }}>
                                    <label>Opening Odometer (KM)</label>
                                    <input type="text" name="opening_km" value={formData.opening_km} readOnly style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', color: '#64748b' }} title="Opening logged mileage" />
                                </div>
                                <div className="form-field" style={{ margin: 0 }}>
                                    <label>Closing Odometer (KM) <span style={{ color: '#c5111a' }}>*</span></label>
                                    <input type="number" name="closing_km" value={formData.closing_km} onChange={handleInputChange} required />
                                </div>
                                <div className="form-field" style={{ margin: 0 }}>
                                    <label>Total Billed Distance (KM)</label>
                                    <div style={{ position: 'relative' }}>
                                        <input type="text" value={formData.trip_km} readOnly style={{ background: '#f0f9ff', border: '1px solid #bae6fd', color: '#0369a1', fontWeight: 800, fontSize: 16, paddingRight: 48 }} />
                                        <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: '#0284c7', fontSize: 13 }}>KM</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Package & Tariff Resolution */}
                        <div style={{ marginBottom: 40, background: '#fdf6e8', padding: 24, borderRadius: 8, border: '1px solid #e8d4aa' }}>
                            <h3 style={{ margin: '0 0 20px', fontSize: 14, fontWeight: 800, color: '#023149', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span className="material-icons" style={{ fontSize: 18, color: '#c5111a' }}>calculate</span>
                                Derived Package Tariff Matrix
                            </h3>
                            <div className="form-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                                <div className="form-field" style={{ margin: 0 }}>
                                    <label style={{ color: '#7d0907' }}>Calculated Base Package</label>
                                    <input type="text" value={formData.package_name} readOnly style={{ background: '#fff', fontSize: 14, fontWeight: 600, color: '#023149', border: '1px solid #f1f5f9' }} />
                                </div>
                                <div className="form-field" style={{ margin: 0 }}>
                                    <label style={{ color: '#7d0907' }}>Base Quota Allowance Charge</label>
                                    <input type="text" value={`₹ ${formData.package_charge.toFixed(2)}`} readOnly style={{ background: '#fff', fontSize: 14, fontWeight: 600, color: '#023149', border: '1px solid #f1f5f9' }} />
                                </div>
                                <div className="form-field" style={{ margin: 0 }}>
                                    <label style={{ color: '#7d0907' }}>Threshold Exceedance (KM)</label>
                                    <input type="text" value={`${formData.extra_km} KM`} readOnly style={{ background: '#fff', fontSize: 14, fontWeight: 600, color: '#023149', border: '1px solid #f1f5f9' }} />
                                </div>
                                <div className="form-field" style={{ margin: 0 }}>
                                    <label style={{ color: '#7d0907' }}>Surplus Mileage Levy</label>
                                    <input type="text" value={`₹ ${formData.extra_km_charge.toFixed(2)}`} readOnly style={{ background: '#fff', fontSize: 14, fontWeight: 600, color: '#023149', border: '1px solid #f1f5f9' }} />
                                </div>
                            </div>
                        </div>

                        {/* Additional Cost Centers */}
                        <div style={{ marginBottom: 40 }}>
                            <h3 style={{ margin: '0 0 20px', fontSize: 14, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>
                                Ancillary Cost Centers &amp; Rebates
                            </h3>
                            <div className="form-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                                <div className="form-field" style={{ margin: 0 }}>
                                    <label>Route Toll Gate Surcharge (₹)</label>
                                    <input type="number" name="toll_gate" value={formData.toll_gate} onChange={handleInputChange} min="0" placeholder="0" />
                                </div>
                                <div className="form-field" style={{ margin: 0 }}>
                                    <label>Driver Operator Batta (₹)</label>
                                    <input type="number" name="driver_batta" value={formData.driver_batta} onChange={handleInputChange} min="0" placeholder="0" />
                                </div>
                                <div className="form-field" style={{ margin: 0 }}>
                                    <label>Facility Parking Outlay (₹)</label>
                                    <input type="number" name="parking" value={formData.parking} onChange={handleInputChange} min="0" placeholder="0" />
                                </div>
                                <div className="form-field" style={{ margin: 0 }}>
                                    <label>Applied Goodwill Discount (₹)</label>
                                    <input type="number" name="discount" value={formData.discount} onChange={handleInputChange} min="0" placeholder="0" />
                                </div>
                            </div>
                        </div>

                        {/* Summary & Settlement Gateway */}
                        <div style={{ borderTop: '2px dashed #cbd5e1', paddingTop: 40 }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 64, marginBottom: 40 }}>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '.05em' }}>Gross Evaluation</div>
                                    <div style={{ fontSize: 24, fontWeight: 800, color: '#023149' }}>₹ {Number(formData.total_amount).toFixed(2)}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '.05em' }}>Capital Secured (Advance)</div>
                                    <div style={{ fontSize: 24, fontWeight: 800, color: '#c5111a' }}>- ₹ {Number(formData.advance).toFixed(2)}</div>
                                </div>
                                <div style={{ textAlign: 'right', background: '#f0fdf4', padding: '16px 32px', borderRadius: 8, border: '1px solid #bbf7d0', transform: 'translateY(-16px)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                                    <div style={{ fontSize: 13, fontWeight: 800, color: '#166534', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '.05em', display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span className="material-icons" style={{ fontSize: 16 }}>account_balance_wallet</span>
                                        Final Net Settlement
                                    </div>
                                    <div style={{ fontSize: 36, fontWeight: 900, color: '#15803d', letterSpacing: '-.02em' }}>₹ {Number(formData.net_total).toFixed(2)}</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', gap: 24, background: '#f8fafc', padding: 24, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                                <div className="form-field" style={{ margin: 0, width: 240 }}>
                                    <label style={{ fontSize: 13, color: '#023149' }}>Total Value Tendered (₹) <span style={{ color: '#c5111a' }}>*</span></label>
                                    <div style={{ position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: '#023149', fontSize: 18 }}>₹</span>
                                        <input
                                            type="number"
                                            name="paid_amount"
                                            value={formData.paid_amount}
                                            onChange={handleInputChange}
                                            required
                                            style={{ fontSize: 18, fontWeight: 800, color: '#023149', borderColor: '#023149', paddingLeft: 40, height: 48 }}
                                            min="0"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="btn-primary" style={{ height: 48, padding: '0 40px', background: '#15803d', fontSize: 15 }} onMouseEnter={e => e.currentTarget.style.background = '#166534'} onMouseLeave={e => e.currentTarget.style.background = '#15803d'}>
                                    <span className="material-icons" style={{ fontSize: 20 }}>archive</span>
                                    Log Closure &amp; Archive Trip
                                </button>
                            </div>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default LocalTrip;
