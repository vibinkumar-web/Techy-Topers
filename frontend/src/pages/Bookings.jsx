import { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import AuthContext from '../context/AuthContext';

const initialForm = {
    pickup: '', d_place: '', to_whom: '', a_no: '', cus_count: '1',
    p_city: '', r_status: 'Local Tariff', m_no: '', v_type: '', v_name: '',
    st: '', t_type: '0', b_name: '', ac_type: '', b_type: 'Current Booking',
    remarks: '', e_id: '', km: '', address: '', advance: ''
};

const Bookings = () => {
    const toast = useToast();
    const { api, user } = useContext(AuthContext);
    const navigate = useNavigate();

    // Autocomplete & trip history state
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [previousTrips, setPreviousTrips] = useState([]);
    const [searchTimeout, setSearchTimeout] = useState(null);
    const suggestionsRef = useRef(null);

    // Tariff price list
    const [tariffData, setTariffData] = useState([]);
    const [showTariff, setShowTariff] = useState(false);
    const [kmSearchTimeoutId, setKmSearchTimeoutId] = useState(null);

    // Vehicle Models name specific selection
    const [vehicleModels, setVehicleModels] = useState([]);
    const [loadingModels, setLoadingModels] = useState(false);

    // Distance Suggestions
    const [distanceSuggestions, setDistanceSuggestions] = useState([]);
    const [loadingDistanceSuggestions, setLoadingDistanceSuggestions] = useState(false);

    // Form State
    const [formData, setFormData] = useState(initialForm);

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMobileChange = (e) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, m_no: value }));
        if (searchTimeout) clearTimeout(searchTimeout);
        if (value.length >= 3) {
            setSearchTimeout(setTimeout(async () => {
                try {
                    const response = await api.get(`/customer_search.php?search=${value}`);
                    if (Array.isArray(response.data) && response.data.length > 0) {
                        setSuggestions(response.data);
                        setShowSuggestions(true);
                    } else {
                        setSuggestions([]);
                        setShowSuggestions(false);
                    }
                } catch {
                    setSuggestions([]);
                    setShowSuggestions(false);
                }
            }, 500));
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
            setPreviousTrips([]);
        }
    };

    const handleSelectSuggestion = (customer) => {
        setFormData(prev => ({ ...prev, m_no: customer.m_no, b_name: customer.b_name || '' }));
        setShowSuggestions(false);
        setSuggestions([]);
        fetchPreviousTrips(customer.m_no);
    };

    const fetchPreviousTrips = async (mobile) => {
        try {
            const response = await api.get(`/customer_search.php?trips_for=${mobile}`);
            setPreviousTrips(Array.isArray(response.data) ? response.data : []);
        } catch {
            setPreviousTrips([]);
        }
    };

    const handleMobileBlur = async () => {
        if (formData.m_no.length === 10) {
            try {
                const response = await api.get(`/customers.php?mobile=${formData.m_no}`);
                if (response.data && response.data.b_name) {
                    setFormData(prev => ({ ...prev, b_name: response.data.b_name }));
                }
            } catch { /* customer not found */ }
            fetchPreviousTrips(formData.m_no);
        }
    };

    const handleKmChange = (e) => {
        const km = e.target.value;
        setFormData(prev => ({ ...prev, km }));
        if (kmSearchTimeoutId) clearTimeout(kmSearchTimeoutId);
        if (km && parseInt(km) > 0) {
            setKmSearchTimeoutId(setTimeout(async () => {
                try {
                    const response = await api.get(`/enquery_tariff.php?km=${km}`);
                    if (Array.isArray(response.data) && response.data.length > 0) {
                        setTariffData(response.data);
                        setShowTariff(true);
                    } else {
                        setTariffData([]);
                        setShowTariff(false);
                    }
                } catch {
                    setTariffData([]);
                    setShowTariff(false);
                }
                setLoadingDistanceSuggestions(true);
                try {
                    const response = await api.get(`/get_distance_suggestions.php?km=${km}`);
                    setDistanceSuggestions(response.data?.staff && Array.isArray(response.data.staff) ? response.data.staff : []);
                } catch {
                    setDistanceSuggestions([]);
                } finally {
                    setLoadingDistanceSuggestions(false);
                }
            }, 500));
        } else {
            setTariffData([]);
            setShowTariff(false);
            setDistanceSuggestions([]);
        }
    };

    const handleVehicleTypeChange = async (e) => {
        const v_type = e.target.value;
        setFormData(prev => ({ ...prev, v_type, v_name: '' }));
        if (v_type) {
            setLoadingModels(true);
            try {
                const modelsRes = await api.get(`/available_vehicles.php?action=get_models&v_cat=${v_type}`);
                setVehicleModels(Array.isArray(modelsRes.data) ? modelsRes.data : []);
            } catch {
                setVehicleModels([]);
            } finally {
                setLoadingModels(false);
            }
        } else {
            setVehicleModels([]);
        }
    };

    const handleVehicleModelChange = (e) => {
        setFormData(prev => ({ ...prev, v_name: e.target.value }));
    };

    const resetForm = () => {
        setSuggestions([]);
        setShowSuggestions(false);
        setPreviousTrips([]);
        setTariffData([]);
        setShowTariff(false);
        setVehicleModels([]);
        setDistanceSuggestions([]);
        setFormData(initialForm);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/customers.php', { m_no: formData.m_no, b_name: formData.b_name });
            const userId = user?.emp_id || user?.id || 1;
            await api.post('/bookings.php', { ...formData, user_id: userId });
            resetForm();
            toast('Booking Registered Successfully! Redirecting to Assign page to dispatch driver.');
            navigate('/assignments');
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || "Unknown Error";
            toast('Failed to register booking: ' + errorMsg, 'error');
        }
    };

    return (
        <div className="page-wrap">
            <div className="page-header">
                <div>
                    <div>
                        <h1>Register New Booking</h1>
                        <p>Fill in the details below to register a new trip booking</p>
                    </div>
                </div>
            </div>

            <div className="page-body">
                <form id="bookingForm" onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

                        {/* Customer Identity Profile */}
                        <div>
                            <h3 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', borderBottom: '1px solid #e2e8f0', paddingBottom: 8 }}>
                                Customer Identity Profile
                            </h3>
                            <div className="form-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                                <div className="form-field" ref={suggestionsRef} style={{ position: 'relative', margin: 0 }}>
                                    <label>Mobile Contact <span style={{ color: '#c5111a' }}>*</span></label>
                                    <input type="text" name="m_no" value={formData.m_no} onChange={handleMobileChange} onBlur={handleMobileBlur} maxLength="10" required />
                                    {showSuggestions && suggestions.length > 0 && (
                                        <div style={{ position: 'absolute', top: '100%', left: 0, width: '100%', zIndex: 50, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, marginTop: 4, boxShadow: '0 4px 12px rgba(2,49,73,.1)' }}>
                                            {suggestions.map((c, i) => (
                                                <div key={i} onClick={() => handleSelectSuggestion(c)} style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: i === suggestions.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                                                    <div style={{ fontWeight: 800, color: '#023149', fontSize: 14 }}>{c.m_no}</div>
                                                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{c.b_name || 'Unknown Reference'}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="form-field" style={{ margin: 0 }}>
                                    <label>Client Name <span style={{ color: '#c5111a' }}>*</span></label>
                                    <input type="text" name="b_name" value={formData.b_name} onChange={handleInputChange} required />
                                </div>
                                <div className="form-field" style={{ margin: 0 }}>
                                    <label>Secondary Contact</label>
                                    <input type="text" name="a_no" value={formData.a_no} onChange={handleInputChange} />
                                </div>
                                <div className="form-field" style={{ margin: 0 }}>
                                    <label>Email Address</label>
                                    <input type="email" name="e_id" value={formData.e_id} onChange={handleInputChange} />
                                </div>
                            </div>
                        </div>

                        {/* Route & Operational Dynamics */}
                        <div>
                            <h3 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', borderBottom: '1px solid #e2e8f0', paddingBottom: 8 }}>
                                Route &amp; Operational Dynamics
                            </h3>
                            <div className="form-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                                <div className="form-field" style={{ margin: 0 }}>
                                    <label>Service Timing Category</label>
                                    <select name="b_type" value={formData.b_type} onChange={handleInputChange}>
                                        <option value="Current Booking">Instant (Current)</option>
                                        <option value="Advance Booking">Scheduled (Advance)</option>
                                    </select>
                                </div>
                                <div className="form-field" style={{ margin: 0 }}>
                                    <label>Scheduled Pickup Time <span style={{ color: '#c5111a' }}>*</span></label>
                                    <input type="datetime-local" name="pickup" value={formData.pickup} onChange={handleInputChange} required />
                                </div>
                                <div className="form-field" style={{ margin: 0 }}>
                                    <label>Tariff Classification</label>
                                    <select name="r_status" value={formData.r_status} onChange={handleInputChange}>
                                        <option value="Local Tariff">Local Domain Tariff</option>
                                        <option value="Out Station Tariff">Out-Station / Inter-City Tariff</option>
                                    </select>
                                </div>
                                <div className="form-field" style={{ margin: 0 }}>
                                    <label>Trip Execution Mode</label>
                                    <select name="t_type" value={formData.t_type} onChange={handleInputChange}>
                                        <option value="0">Point-to-Point Drop</option>
                                        <option value="1">Round-Trip Continuous</option>
                                    </select>
                                </div>
                                <div className="form-field" style={{ margin: 0 }}>
                                    <label>Pickup Location Origin <span style={{ color: '#c5111a' }}>*</span></label>
                                    <input type="text" name="p_city" value={formData.p_city} onChange={handleInputChange} required />
                                </div>
                                <div className="form-field" style={{ margin: 0 }}>
                                    <label>Destination Target <span style={{ color: '#c5111a' }}>*</span></label>
                                    <input type="text" name="d_place" value={formData.d_place} onChange={handleInputChange} required />
                                </div>
                                <div className="form-field" style={{ margin: 0, position: 'relative' }}>
                                    <label>Est. Travel Distance (KM)</label>
                                    <input type="number" name="km" value={formData.km} onChange={handleKmChange} min="0" placeholder="0" />
                                    {loadingDistanceSuggestions && (
                                        <div style={{ position: 'absolute', top: '100%', left: 0, width: '200%', zIndex: 50, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, marginTop: 4, padding: 12, fontSize: 13, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 12px rgba(2,49,73,.1)' }}>
                                            <span className="material-icons" style={{ fontSize: 16 }}>hourglass_empty</span> Loading driver records...
                                        </div>
                                    )}
                                    {!loadingDistanceSuggestions && distanceSuggestions.length > 0 && formData.km > 0 && (
                                        <div style={{ position: 'absolute', top: '100%', left: 0, width: '250%', zIndex: 50, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, marginTop: 4, boxShadow: '0 4px 12px rgba(2,49,73,.1)', maxHeight: '300px', overflowY: 'auto' }}>
                                            <div style={{ padding: '8px 12px', background: '#fdf6e8', borderBottom: '1px solid #e8d4aa', fontSize: 12, fontWeight: 700, color: '#023149', textTransform: 'uppercase' }}>
                                                Drivers with similar trip frequency ({formData.km} KM)
                                            </div>
                                            {distanceSuggestions.map((driver, i) => (
                                                <div key={i} style={{ padding: '10px 12px', borderBottom: i === distanceSuggestions.length - 1 ? 'none' : '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#023149', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800 }}>
                                                        {driver.name ? driver.name.charAt(0).toUpperCase() : 'U'}
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontWeight: 700, color: '#023149', fontSize: 14 }}>{driver.name || 'Unknown Driver'}</div>
                                                        <div style={{ fontSize: 11, color: '#6b7280' }}>ID: {driver.v_id} &bull; Ph: {driver.mobile || 'N/A'}</div>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{ fontWeight: 600, color: '#15803d', fontSize: 13 }}>{driver.trip_count} Trips</div>
                                                        <div style={{ fontSize: 11, color: '#689abb', fontWeight: 600 }}>{driver.vehicle}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="form-field" style={{ margin: 0 }}>
                                    <label>Passenger Count</label>
                                    <select name="cus_count" value={formData.cus_count} onChange={handleInputChange}>
                                        {[...Array(20)].map((_, i) => <option key={i + 1} value={i + 1}>{i + 1} Pax</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Fleet Requisites */}
                        <div>
                            <h3 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', borderBottom: '1px solid #e2e8f0', paddingBottom: 8 }}>
                                Fleet Requisites
                            </h3>
                            <div className="form-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                                <div className="form-field" style={{ margin: 0 }}>
                                    <label>Vehicle Class <span style={{ color: '#c5111a' }}>*</span></label>
                                    <select name="v_type" value={formData.v_type} onChange={handleVehicleTypeChange} required>
                                        <option value="">Select Class</option>
                                        <option value="Mini">Mini / Compact</option>
                                        <option value="Sedan">Standard Sedan</option>
                                        <option value="SUV">Premium SUV</option>
                                        <option value="Innova">MPV (Innova/Similar)</option>
                                    </select>
                                </div>
                                <div className="form-field" style={{ margin: 0 }}>
                                    <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Specific Model</span>
                                        {loadingModels && <span style={{ color: '#2563eb', fontSize: 10 }}>Loading...</span>}
                                    </label>
                                    <input
                                        type="text"
                                        name="v_name"
                                        value={formData.v_name}
                                        onChange={handleVehicleModelChange}
                                        disabled={!formData.v_type || loadingModels}
                                        list="model_suggestions"
                                        placeholder={`Any ${formData.v_type ? `${formData.v_type} ` : ''}Model`}
                                    />
                                    <datalist id="model_suggestions">
                                        {vehicleModels.map((model, idx) => (
                                            <option key={idx} value={model} />
                                        ))}
                                    </datalist>
                                </div>
                                <div className="form-field" style={{ margin: 0 }}>
                                    <label>A/C Preference</label>
                                    <select name="ac_type" value={formData.ac_type} onChange={handleInputChange}>
                                        <option value="1">A/C Required</option>
                                        <option value="0">Basic / Non-A/C</option>
                                    </select>
                                </div>
                                <div className="form-field" style={{ margin: 0 }}>
                                    <label>Company / B2B Sponsor</label>
                                    <input type="text" name="to_whom" value={formData.to_whom} onChange={handleInputChange} placeholder="If applicable" />
                                </div>
                                <div className="form-field" style={{ gridColumn: 'span 2', margin: 0 }}>
                                    <label>Routing Landmark</label>
                                    <input type="text" name="st" value={formData.st} onChange={handleInputChange} />
                                </div>
                                <div className="form-field" style={{ gridColumn: 'span 2', margin: 0 }}>
                                    <label>Precise Pickup Address</label>
                                    <input type="text" name="address" value={formData.address} onChange={handleInputChange} />
                                </div>
                                <div className="form-field" style={{ gridColumn: 'span 2', margin: 0 }}>
                                    <label>Internal Logistics Remarks</label>
                                    <input type="text" name="remarks" value={formData.remarks} onChange={handleInputChange} />
                                </div>
                                <div className="form-field" style={{ gridColumn: 'span 2', margin: 0 }}>
                                    <label>Fare / Advance Amount (₹)</label>
                                    <input type="number" name="advance" value={formData.advance} onChange={handleInputChange} placeholder="0.00" style={{ fontWeight: 800, color: '#023149' }} />
                                </div>
                            </div>
                        </div>

                        {/* Previous Trips History */}
                        {previousTrips.length > 0 && (
                            <div>
                                <h3 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', borderBottom: '1px solid #e2e8f0', paddingBottom: 8 }}>
                                    Customer Trip History
                                </h3>
                                <div className="table-wrap" style={{ maxHeight: 220, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                                    <table style={{ margin: 0 }}>
                                        <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                                            <tr>
                                                <th style={{ padding: '10px 16px', fontSize: 11, background: '#f8fafc' }}>Booking Ref</th>
                                                <th style={{ padding: '10px 16px', fontSize: 11, background: '#f8fafc' }}>Date / Time</th>
                                                <th style={{ padding: '10px 16px', fontSize: 11, background: '#f8fafc' }}>Pickup Location</th>
                                                <th style={{ padding: '10px 16px', fontSize: 11, background: '#f8fafc' }}>Drop Target</th>
                                                <th style={{ padding: '10px 16px', fontSize: 11, background: '#f8fafc' }}>Vehicle Class</th>
                                                <th style={{ padding: '10px 16px', fontSize: 11, background: '#f8fafc' }}>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {previousTrips.map((trip) => (
                                                <tr key={trip.b_id}>
                                                    <td style={{ padding: '10px 16px', fontSize: 12, fontWeight: 700, color: '#023149' }}>#{trip.b_id}</td>
                                                    <td style={{ padding: '10px 16px', fontSize: 12, color: '#475569' }}>{trip.pickup}</td>
                                                    <td style={{ padding: '10px 16px', fontSize: 12, color: '#475569' }}>{trip.p_city}</td>
                                                    <td style={{ padding: '10px 16px', fontSize: 12, color: '#475569' }}>{trip.d_place}</td>
                                                    <td style={{ padding: '10px 16px', fontSize: 12, color: '#475569', fontWeight: 600 }}>{trip.v_type}</td>
                                                    <td style={{ padding: '10px 16px', fontSize: 12 }}>
                                                        <span className={`badge ${trip.status === 'Assigned' ? 'badge-blue' : 'badge-yellow'}`} style={{ padding: '2px 8px', fontSize: 10 }}>
                                                            {trip.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Computed Tariff Rates */}
                        {showTariff && tariffData.length > 0 && (
                            <div>
                                <h3 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', borderBottom: '1px solid #e2e8f0', paddingBottom: 8 }}>
                                    Calculated Tariff Rates — {formData.km} KM Projection
                                </h3>
                                <div className="table-wrap" style={{ maxHeight: 220, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                                    <table style={{ margin: 0, width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                        <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                                            <tr>
                                                <th style={{ padding: '10px 16px', fontSize: 11, background: '#2563eb', color: '#fff', borderRight: '1px solid rgba(255,255,255,0.1)' }}>V-Type</th>
                                                <th style={{ padding: '10px 16px', fontSize: 11, background: '#2563eb', color: '#fff', borderRight: '1px solid rgba(255,255,255,0.1)' }}>Hrs</th>
                                                <th style={{ padding: '10px 16px', fontSize: 11, background: '#2563eb', color: '#fff', borderRight: '1px solid rgba(255,255,255,0.1)' }}>KM</th>
                                                <th style={{ padding: '10px 16px', fontSize: 11, background: '#2563eb', color: '#fff', borderRight: '1px solid rgba(255,255,255,0.1)' }}>Non A/C</th>
                                                <th style={{ padding: '10px 16px', fontSize: 11, background: '#2563eb', color: '#fff', borderRight: '1px solid rgba(255,255,255,0.1)' }}>A/C</th>
                                                <th style={{ padding: '10px 16px', fontSize: 11, background: '#2563eb', color: '#fff' }}>Below 100</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tariffData.map((t, i) => (
                                                <tr key={t.id} style={{ borderBottom: i === tariffData.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                                                    <td style={{ padding: '8px 16px', fontSize: 12, fontWeight: 800, color: '#023149' }}>{t.name}</td>
                                                    <td style={{ padding: '8px 16px', fontSize: 12, color: '#2563eb', fontWeight: 600 }}>{t.hrs}</td>
                                                    <td style={{ padding: '8px 16px', fontSize: 12, color: '#6b7280' }}>{t.kmeter}</td>
                                                    <td style={{ padding: '8px 16px', fontSize: 12, fontWeight: 700, color: '#475569' }}>{t.price_nonac || t.nonac}</td>
                                                    <td style={{ padding: '8px 16px', fontSize: 12, fontWeight: 700, color: '#475569' }}>{t.price_ac || t.withac}</td>
                                                    <td style={{ padding: '8px 16px', fontSize: 12, color: '#2563eb', fontWeight: 600 }}>{t.belowhun}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid #e2e8f0' }}>
                            <button type="button" className="btn-ghost" onClick={resetForm}>Discard</button>
                            <button type="submit" className="btn-primary" style={{ background: '#15803d', height: 44, padding: '0 32px' }} onMouseEnter={e => e.currentTarget.style.background = '#166534'} onMouseLeave={e => e.currentTarget.style.background = '#15803d'}>
                                <span className="material-icons" style={{ fontSize: 18 }}>check_circle</span>
                                Confirm &amp; Finalize Booking
                            </button>
                        </div>

                    </div>
                </form>
            </div>
        </div>
    );
};

export default Bookings;
