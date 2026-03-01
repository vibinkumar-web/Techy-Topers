import { useState, useEffect, useContext, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';





import AuthContext from '../context/AuthContext';
const Bookings = () => {
    const toast = useToast();
    const { api, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Autocomplete & trip history state
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [previousTrips, setPreviousTrips] = useState([]);
    const [loadingTrips, setLoadingTrips] = useState(false);
    const [searchTimeout, setSearchTimeout] = useState(null);
    const suggestionsRef = useRef(null);

    // Tariff price list
    const [tariffData, setTariffData] = useState([]);
    const [showTariff, setShowTariff] = useState(false);
    const [kmSearchTimeoutId, setKmSearchTimeoutId] = useState(null);

    // Available vehicles
    const [availableVehicles, setAvailableVehicles] = useState([]);
    const [loadingVehicles, setLoadingVehicles] = useState(false);

    // Vehicle Models name specific selection
    const [vehicleModels, setVehicleModels] = useState([]);
    const [loadingModels, setLoadingModels] = useState(false);

    // Distance Suggestions
    const [distanceSuggestions, setDistanceSuggestions] = useState([]);
    const [loadingDistanceSuggestions, setLoadingDistanceSuggestions] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        pickup: '', d_place: '', to_whom: '', a_no: '', cus_count: '1',
        p_city: '', r_status: 'Local Tariff', m_no: '', v_type: '', v_name: '',
        st: '', t_type: '0', b_name: '', ac_type: '', b_type: 'Current Booking',
        remarks: '', e_id: '', km: '', address: '', advance: ''
    });

    useEffect(() => {
        fetchBookings();
    }, []);

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
            setLoading(false);
        }
    };


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Search customers as mobile is typed

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
                } catch (error) {
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

    // Select a suggestion

    const handleSelectSuggestion = (customer) => {
        setFormData(prev => ({
            ...prev,
            m_no: customer.m_no,
            b_name: customer.b_name || ''
        }));
        setShowSuggestions(false);
        setSuggestions([]);
        fetchPreviousTrips(customer.m_no);
    };

    // Fetch previous trips for a mobile number
    const fetchPreviousTrips = async (mobile) => {
        setLoadingTrips(true);
        try {
            const response = await api.get(`/customer_search.php?trips_for=${mobile}`);
            if (Array.isArray(response.data)) {
                setPreviousTrips(response.data);
            } else {
                setPreviousTrips([]);
            }
        } catch (error) {
            setPreviousTrips([]);
        } finally {
            setLoadingTrips(false);
        }
    };

    // Also fetch trips on blur if 10 digits
    const handleMobileBlur = async () => {
        if (formData.m_no.length === 10) {
            try {
                const response = await api.get(`/customers.php?mobile=${formData.m_no}`);
                if (response.data && response.data.b_name) {
                    setFormData(prev => ({ ...prev, b_name: response.data.b_name }));
                }
            } catch (error) {
                console.log("Customer not found");
            }
            fetchPreviousTrips(formData.m_no);
        }
    };

    // Fetch tariff when KM changes (Debounced)

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
                } catch (error) {
                    console.error("Error fetching tariff", error);
                    setTariffData([]);
                    setShowTariff(false);
                }

                // Fetch Distance Suggestions
                setLoadingDistanceSuggestions(true);
                try {
                    const response = await api.get(`/get_distance_suggestions.php?km=${km}`);
                    if (response.data && Array.isArray(response.data.staff)) {
                        setDistanceSuggestions(response.data.staff);
                    } else {
                        setDistanceSuggestions([]);
                    }
                } catch (error) {
                    console.error("Error fetching distance suggestions", error);
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

    // Fetch available vehicles and specific models when vehicle type changes
    const handleVehicleTypeChange = async (e) => {
        const v_type = e.target.value;
        setFormData(prev => ({ ...prev, v_type, v_name: '' }));

        if (v_type) {
            setLoadingVehicles(true);
            setLoadingModels(true);
            try {
                const response = await api.get(`/available_vehicles.php?v_cat=${v_type}`);
                if (Array.isArray(response.data)) {
                    setAvailableVehicles(response.data);
                } else {
                    setAvailableVehicles([]);
                }

                // Fetch models for dropdown
                const modelsRes = await api.get(`/available_vehicles.php?action=get_models&v_cat=${v_type}`);
                if (Array.isArray(modelsRes.data)) {
                    setVehicleModels(modelsRes.data);
                } else {
                    setVehicleModels([]);
                }
            } catch (error) {
                console.error('Error fetching vehicles or models', error);
                setAvailableVehicles([]);
                setVehicleModels([]);
            } finally {
                setLoadingVehicles(false);
                setLoadingModels(false);
            }
        } else {
            setAvailableVehicles([]);
            setVehicleModels([]);
        }
    };

    const [modelSearchTimeout, setModelSearchTimeout] = useState(null);

    const handleVehicleModelChange = async (e) => {
        const v_name = e.target.value;
        setFormData(prev => ({ ...prev, v_name }));

        if (modelSearchTimeout) clearTimeout(modelSearchTimeout);

        if (formData.v_type) {
            setModelSearchTimeout(setTimeout(async () => {
                setLoadingVehicles(true);
                try {
                    const query = v_name ? `?v_cat=${formData.v_type}&v_model=${v_name}` : `?v_cat=${formData.v_type}`;
                    const response = await api.get(`/available_vehicles.php${query}`);
                    if (Array.isArray(response.data)) {
                        setAvailableVehicles(response.data);
                    } else {
                        setAvailableVehicles([]);
                    }
                } catch (error) {
                    console.error('Error fetching filtered vehicles', error);
                    setAvailableVehicles([]);
                } finally {
                    setLoadingVehicles(false);
                }
            }, 400));
        }
    };

    const openModal = () => setIsModalOpen(true);

    const closeModal = () => {
        setIsModalOpen(false);
        setSuggestions([]);
        setShowSuggestions(false);
        setPreviousTrips([]);
        setTariffData([]);
        setShowTariff(false);
        setAvailableVehicles([]);
        setVehicleModels([]);
        setDistanceSuggestions([]);
        setFormData({
            pickup: '', d_place: '', to_whom: '', a_no: '', cus_count: '1',
            p_city: '', r_status: 'Local Tariff', m_no: '', v_type: '', v_name: '',
            st: '', t_type: '0', b_name: '', ac_type: '', b_type: 'Current Booking',
            remarks: '', e_id: '', km: '', address: '', advance: ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/customers.php', { m_no: formData.m_no, b_name: formData.b_name });
            const userId = user?.emp_id || user?.id || 1;
            await api.post('/bookings.php', { ...formData, user_id: userId });
            fetchBookings();
            closeModal();
            toast('Booking Registered Successfully! Redirecting to Assign page to dispatch driver.');
            navigate('/assignments');
        } catch (error) {
            console.error("Error creating booking", error);
            const errorMsg = error.response?.data?.message || error.message || "Unknown Error";
            toast('Failed to register booking: ' + errorMsg, 'error');
        }
    };

    const memoizedTableBody = useMemo(() => (
        <tbody>
            {Array.isArray(bookings) && bookings.map((b) => (
                <tr key={b.b_id}>
                    <td style={{ fontWeight: 800, color: '#023149', fontFamily: 'monospace', fontSize: 13 }}>#{b.b_id}</td>
                    <td>
                        <span className={`badge ${b.assign === '1' ? 'badge-blue' : 'badge-yellow'}`}>
                            {b.assign === '1' ? 'Driver Assigned' : 'Awaiting Assignment'}
                        </span>
                    </td>
                    <td style={{ fontWeight: 700, color: '#023149' }}>{b.pickup}</td>
                    <td>
                        <div style={{ fontWeight: 600, color: '#023149' }}>{b.b_name}</div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>{b.m_no}</div>
                    </td>
                    <td>
                        <div style={{ fontWeight: 600, color: '#023149' }}>{b.v_type}</div>
                        <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', marginTop: 2 }}>{b.ac_type === '1' ? 'AC Required' : 'Non-AC'}</div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                            {b.assign === '1' && (
                                <button
                                    className="btn-ghost"
                                    style={{ color: '#023149', borderColor: '#cbd5e1', padding: '6px 16px' }}
                                    onClick={() => navigate('/trip-closing', { state: { booking: b } })}
                                >
                                    <span className="material-icons" style={{ fontSize: 16 }}>task_alt</span>
                                    Close Trip
                                </button>
                            )}
                            <button
                                className="btn-ghost"
                                style={{ color: '#c5111a', borderColor: '#fecaca', background: '#fef2f2', padding: '6px 16px' }}
                                onClick={() => navigate('/cancel-booking', { state: { booking: b } })}
                            >
                                <span className="material-icons" style={{ fontSize: 16 }}>cancel</span>
                                Abort
                            </button>
                        </div>
                    </td>
                </tr>
            ))}
            {(!bookings || bookings.length === 0) && (
                <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '60px 40px', color: '#6b7280' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                            <span className="material-icons" style={{ fontSize: 32, color: '#cbd5e1' }}>inbox</span>
                            <div>No active bookings currently registered in the database.</div>
                        </div>
                    </td>
                </tr>
            )}
        </tbody>
    ), [bookings, navigate]);

    if (loading) return (
        <div className="page-wrap">
            <div className="page-body" style={{ padding: 40, textAlign: 'center', color: '#023149', fontWeight: 600 }}>
                Loading booking records...
            </div>
        </div>
    );

    return (
        <div className="page-wrap">
            <div className="page-header">
                <div>
                    <div>
                        <h1>Central Bookings Management</h1>
                        <p>Track all current and upcoming trips scheduled</p>
                    </div>
                    <button className="btn-primary" onClick={openModal} style={{ background: '#15803d' }} onMouseEnter={e => e.currentTarget.style.background = '#166534'} onMouseLeave={e => e.currentTarget.style.background = '#15803d'}>
                        <span className="material-icons" style={{ fontSize: 18 }}>add_circle</span>
                        Register New Booking
                    </button>
                </div>
            </div>

            <div className="page-body">
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Booking Ref</th>
                                <th>Assignment Status</th>
                                <th>Schedule</th>
                                <th>Client Profile</th>
                                <th>Service Needed</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        {memoizedTableBody}
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal" style={{ maxWidth: 1000 }}>
                        <div className="modal-header">
                            <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span className="material-icons" style={{ color: '#15803d' }}>add_circle</span>
                                Register New Booking
                            </h2>
                            <button onClick={closeModal}>
                                <span className="material-icons">close</span>
                            </button>
                        </div>

                        <form id="bookingForm" onSubmit={handleSubmit} style={{ overflowY: 'auto', maxHeight: '75vh', paddingBottom: 24 }}>
                            <div className="modal-body" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 32 }}>

                                <div>
                                    <h3 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', borderBottom: '1px solid #e2e8f0', paddingBottom: 8 }}>
                                        Customer Identity Profile
                                    </h3>
                                    <div className="form-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                                        <div className="form-field" ref={suggestionsRef} style={{ position: 'relative', margin: 0 }}>
                                            <label>Mobile Contact <span style={{ color: '#c5111a' }}>*</span></label>
                                            <input type="text" name="m_no" value={formData.m_no} onChange={handleMobileChange} onBlur={handleMobileBlur} maxLength="10" required />
                                            {showSuggestions && suggestions.length > 0 && (
                                                <div style={{ position: 'absolute', top: '100%', left: 0, width: '100%', zIndex: 50, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, marginTop: 4, boxShadow: '0 4px 12px rgba(2,49,73,.1)', overflowHidden: 'hidden' }}>
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
                                            <label>Passenger Count </label>
                                            <select name="cus_count" value={formData.cus_count} onChange={handleInputChange}>
                                                {[...Array(20)].map((_, i) => <option key={i + 1} value={i + 1}>{i + 1} Pax</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>

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
                                {previousTrips && previousTrips.length > 0 && (
                                    <div style={{ marginTop: 8 }}>
                                        <h3 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', borderBottom: '1px solid #e2e8f0', paddingBottom: 8 }}>
                                            Customer Trip History
                                        </h3>
                                        <div className="table-wrap" style={{ maxHeight: 220, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                                            <table style={{ margin: 0 }}>
                                                <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: '#f8fafc', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
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

                                {/* Computed Tariff Rates & Available Vehicles Side-by-Side */}
                                {((showTariff && tariffData && tariffData.length > 0) || (availableVehicles && availableVehicles.length > 0) || loadingVehicles) && (
                                    <div style={{ display: 'flex', gap: 24, marginTop: 24 }}>

                                        {/* Computed Tariff Rates */}
                                        {showTariff && tariffData && tariffData.length > 0 && (
                                            <div style={{ flex: 1, minWidth: 0 }}>
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

                                        {/* Vehicle Availability */}
                                        {(availableVehicles.length > 0 || loadingVehicles) && (
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <h3 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', borderBottom: '1px solid #e2e8f0', paddingBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                                                    <span>Available Vehicles — {formData.v_type || 'All'}</span>
                                                    {loadingVehicles && <span style={{ color: '#2563eb', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}><span className="material-icons" style={{ fontSize: 14 }}>sync</span> Loading</span>}
                                                </h3>
                                                <div className="table-wrap" style={{ maxHeight: 220, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                                                    <table style={{ margin: 0, width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                                        <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                                                            <tr>
                                                                <th style={{ padding: '10px 16px', fontSize: 11, background: '#2563eb', color: '#fff', borderRight: '1px solid rgba(255,255,255,0.1)' }}>V-ID</th>
                                                                <th style={{ padding: '10px 16px', fontSize: 11, background: '#2563eb', color: '#fff', borderRight: '1px solid rgba(255,255,255,0.1)' }}>Mobile No</th>
                                                                <th style={{ padding: '10px 16px', fontSize: 11, background: '#2563eb', color: '#fff', borderRight: '1px solid rgba(255,255,255,0.1)' }}>Vehicle Type</th>
                                                                <th style={{ padding: '10px 16px', fontSize: 11, background: '#2563eb', color: '#fff', borderRight: '1px solid rgba(255,255,255,0.1)' }}>Vacant Place</th>
                                                                <th style={{ padding: '10px 16px', fontSize: 11, background: '#2563eb', color: '#fff', borderRight: '1px solid rgba(255,255,255,0.1)' }}>V.Time</th>
                                                                <th style={{ padding: '10px 16px', fontSize: 11, background: '#2563eb', color: '#fff' }}>Amount</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {!loadingVehicles && availableVehicles.map((v, i) => (
                                                                <tr key={v.id} style={{ borderBottom: i === availableVehicles.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                                                                    <td style={{ padding: '8px 16px', fontSize: 12, fontWeight: 800, color: '#023149' }}>{v.id}</td>
                                                                    <td style={{ padding: '8px 16px', fontSize: 12, color: '#475569' }}>{v.d_mobile || 'N/A'}</td>
                                                                    <td style={{ padding: '8px 16px', fontSize: 12, color: '#475569', fontWeight: 600 }}>{v.v_brand} {v.v_model}</td>
                                                                    <td style={{ padding: '8px 16px', fontSize: 12, color: '#047857', fontWeight: 600 }}>{v.vacant_place || 'Garage'}</td>
                                                                    <td style={{ padding: '8px 16px', fontSize: 12, color: '#94a3b8' }}>-</td>
                                                                    <td style={{ padding: '8px 16px', fontSize: 12, color: '#94a3b8' }}>-</td>
                                                                </tr>
                                                            ))}
                                                            {!loadingVehicles && availableVehicles.length === 0 && (
                                                                <tr>
                                                                    <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: 12 }}>No vehicles currently available in this category.</td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}

                                    </div>
                                )}

                            </div>
                        </form>

                        <div className="modal-footer" style={{ padding: '24px 32px' }}>
                            <button type="button" className="btn-ghost" onClick={closeModal}>Discard</button>
                            <button type="submit" form="bookingForm" className="btn-primary" style={{ background: '#15803d', height: 44, padding: '0 32px' }} onMouseEnter={e => e.currentTarget.style.background = '#166534'} onMouseLeave={e => e.currentTarget.style.background = '#15803d'}>
                                <span className="material-icons" style={{ fontSize: 18 }}>check_circle</span>
                                Confirm &amp; Finalize Booking
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Bookings;
