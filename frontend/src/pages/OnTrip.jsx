import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const OnTrip = () => {
    const toast = useToast();
    const { api } = useContext(AuthContext);
    const navigate = useNavigate();

    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    const [vehicleId, setVehicleId] = useState('');
    const [openingKm, setOpeningKm] = useState('');
    const [pickupTime, setPickupTime] = useState('');
    const [savingKm, setSavingKm] = useState(false);
    const [closingTrip, setClosingTrip] = useState(false);
    const [msg, setMsg] = useState({ text: '', type: '' });

    // Per-row KM inputs (keyed by b_id)
    const [rowKmInputs, setRowKmInputs] = useState({});
    const [rowSaving, setRowSaving] = useState({});

    useEffect(() => {
        if (vehicleId) {
            const matched = trips.find(t => String(t.v_id) === String(vehicleId));
            setPickupTime(matched?.bookin_time ?? '');
        } else {
            setPickupTime('');
        }
    }, [vehicleId, trips]);

    useEffect(() => {
        fetchTrips();
    }, []);

    const fetchTrips = async () => {
        setLoading(true);
        try {
            const res = await api.get('/ontrip.php');
            setTrips(res.data ?? []);
        } catch (e) {
            console.error('Error fetching on-trip data', e);
        } finally {
            setLoading(false);
        }
    };

    const showMsg = (text, type = 'success') => {
        setMsg({ text, type });
        setTimeout(() => setMsg({ text: '', type: '' }), 3500);
    };

    const handleSaveKm = async () => {
        if (!vehicleId) { showMsg('Please enter a Vehicle ID.', 'error'); return; }
        if (!openingKm) { showMsg('Please enter Opening KM.', 'error'); return; }
        setSavingKm(true);
        try {
            await api.post('/ontrip.php', {
                action: 'save_opening_km',
                v_id: vehicleId,
                opening_km: openingKm,
            });
            showMsg('Opening KM saved successfully!', 'success');
            setOpeningKm('');
            fetchTrips();
        } catch (e) {
            showMsg(e.response?.data?.message || 'Failed to save Opening KM.', 'error');
        } finally {
            setSavingKm(false);
        }
    };

    const handleCloseTrip = () => {
        if (!vehicleId) { showMsg('Please select or specify a Vehicle ID.', 'error'); return; }
        const trip = trips.find(t => String(t.v_id) === String(vehicleId));
        if (!trip) { showMsg('No active trip found for this Vehicle ID.', 'error'); return; }
        if (!trip.open_km) { showMsg('Opening KM must be recorded before proceeding to close.', 'error'); return; }

        setClosingTrip(true);
        if (trip.r_status === 'Local Tariff') {
            navigate(`/localtrip/${trip.v_id}`);
        } else {
            navigate(`/trip-closing`, { state: { booking: trip } });
        }
    };

    const handleRowSaveKm = async (trip) => {
        const km = rowKmInputs[trip.b_id];
        if (!km) { showMsg('Please enter Opening KM for this trip.', 'error'); return; }
        setRowSaving(prev => ({ ...prev, [trip.b_id]: true }));
        try {
            await api.post('/ontrip.php', {
                action: 'save_opening_km',
                v_id: trip.v_id,
                opening_km: km,
            });
            showMsg(`Opening KM saved for vehicle ${trip.v_id}!`, 'success');
            setRowKmInputs(prev => ({ ...prev, [trip.b_id]: '' }));
            fetchTrips();
        } catch (e) {
            showMsg(e.response?.data?.message || 'Failed to save Opening KM.', 'error');
        } finally {
            setRowSaving(prev => ({ ...prev, [trip.b_id]: false }));
        }
    };

    const fmt = (val) => val ?? '—';

    return (
        <div className="page-wrap">
            <div className="page-header">
                <div>
                    <div>
                        <h1>Live Operations (On-Trip)</h1>
                        <p>Monitor dispatched vehicles, register opening readouts and initiate closures</p>
                    </div>
                </div>
            </div>

            <div className="page-body">

                {/* Operations Control Panel */}
                <div style={{ background: '#fff', padding: 32, borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: 40, overflow: 'hidden', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 6, background: '#15803d' }} />

                    <h2 style={{ fontSize: 16, fontWeight: 800, color: '#023149', margin: '0 0 24px', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="material-icons" style={{ color: '#15803d' }}>contactless</span>
                        Active Control Center
                    </h2>

                    <div style={{ display: 'grid', gridTemplateColumns: 'auto auto auto auto auto', alignItems: 'flex-end', gap: 32 }}>

                        <div className="form-field" style={{ margin: 0, width: 220 }}>
                            <label style={{ fontSize: 13, marginBottom: 8, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: 700 }}>
                                Target Vehicle (Asset ID)
                            </label>
                            <div className="input-with-icon" style={{ background: '#f8fafc' }}>
                                <span className="material-icons" style={{ color: '#64748b' }}>directions_car</span>
                                <input
                                    type="text"
                                    value={vehicleId}
                                    onChange={e => setVehicleId(e.target.value)}
                                    placeholder="e.g. TN01XX1234"
                                    list="vehicle-ids"
                                    style={{ height: 44, fontWeight: 700, background: 'transparent' }}
                                />
                            </div>
                            <datalist id="vehicle-ids">
                                {trips.map(t => (
                                    <option key={t.b_id} value={t.v_id} />
                                ))}
                            </datalist>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label style={{ fontSize: 13, marginBottom: 8, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: 700 }}>
                                Scheduled Pickup Timestamp
                            </label>
                            <div style={{ background: '#fdf6e8', border: '1px solid #e8d4aa', borderRadius: 8, height: 44, padding: '0 20px', display: 'flex', alignItems: 'center', fontSize: 14, color: pickupTime ? '#023149' : '#a1a1aa', fontWeight: pickupTime ? 700 : 400, minWidth: 240 }}>
                                {pickupTime || 'Waiting for asset selection...'}
                            </div>
                        </div>

                        <div className="form-field" style={{ margin: 0, width: 180 }}>
                            <label style={{ fontSize: 13, marginBottom: 8, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: 700 }}>
                                Origin Odometer Readout
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="number"
                                    value={openingKm}
                                    onChange={e => setOpeningKm(e.target.value)}
                                    placeholder="0"
                                    style={{ height: 44, paddingRight: 40, fontWeight: 700, fontSize: 16 }}
                                    min="0"
                                />
                                <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: '#64748b', fontSize: 12 }}>KM</span>
                            </div>
                        </div>

                        <button
                            onClick={handleSaveKm}
                            disabled={savingKm || !vehicleId || !openingKm}
                            className="btn-primary"
                            style={{
                                height: 44,
                                padding: '0 32px',
                                background: (!vehicleId || !openingKm) ? '#e2e8f0' : '#023149',
                                color: (!vehicleId || !openingKm) ? '#94a3b8' : '#fff',
                                opacity: savingKm ? 0.6 : 1,
                                cursor: (!vehicleId || !openingKm) ? 'not-allowed' : (savingKm ? 'wait' : 'pointer'),
                                boxShadow: (!vehicleId || !openingKm) ? 'none' : '0 4px 6px -1px rgba(2, 49, 73, 0.2)'
                            }}
                            onMouseEnter={e => { if (vehicleId && openingKm && !savingKm) e.currentTarget.style.background = '#012030'; }}
                            onMouseLeave={e => { if (vehicleId && openingKm && !savingKm) e.currentTarget.style.background = '#023149'; }}
                        >
                            <span className="material-icons" style={{ fontSize: 18 }}>add_task</span>
                            {savingKm ? 'Registering...' : 'Lock Initial KM'}
                        </button>

                        <div style={{ marginLeft: 'auto' }}>
                            <label style={{ fontSize: 13, marginBottom: 8, color: 'transparent', display: 'block' }}>Action</label>
                            <button
                                onClick={handleCloseTrip}
                                disabled={closingTrip || !vehicleId}
                                className="btn-primary"
                                style={{
                                    height: 44,
                                    background: !vehicleId ? '#fecaca' : '#c5111a',
                                    color: !vehicleId ? '#ef4444' : '#fff',
                                    padding: '0 32px',
                                    opacity: closingTrip ? 0.6 : 1,
                                    cursor: !vehicleId ? 'not-allowed' : (closingTrip ? 'wait' : 'pointer'),
                                    boxShadow: !vehicleId ? 'none' : '0 4px 6px -1px rgba(197, 17, 26, 0.2)'
                                }}
                                onMouseEnter={e => { if (vehicleId && !closingTrip) e.currentTarget.style.background = '#7d0907'; }}
                                onMouseLeave={e => { if (vehicleId && !closingTrip) e.currentTarget.style.background = '#c5111a'; }}
                            >
                                <span className="material-icons" style={{ fontSize: 18 }}>assignment_turned_in</span>
                                Initiate Settlement
                            </button>
                        </div>
                    </div>

                    {msg.text && (
                        <div style={{
                            marginTop: 24,
                            padding: '16px 20px',
                            borderRadius: 8,
                            fontSize: 14,
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            background: msg.type === 'error' ? '#fef2f2' : '#f0fdf4',
                            color: msg.type === 'error' ? '#991b1b' : '#166534',
                            border: `1px solid ${msg.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
                            animation: 'slideIn 0.3s ease-out'
                        }}>
                            <span className="material-icons" style={{ fontSize: 20 }}>
                                {msg.type === 'error' ? 'error_outline' : 'check_circle'}
                            </span>
                            {msg.text}
                        </div>
                    )}
                </div>

                <div className="table-wrap">
                    <div style={{ background: '#f8fafc', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #e2e8f0' }}>
                        <h2 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#023149', letterSpacing: '.05em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span className="material-icons" style={{ fontSize: 18, color: '#689abb' }}>gps_fixed</span>
                            Dispatched Fleet Telemetry
                        </h2>
                        <button
                            onClick={fetchTrips}
                            className="btn-ghost"
                            style={{ padding: '6px 16px', background: 'transparent', color: '#023149' }}
                        >
                            <span className="material-icons" style={{ fontSize: 16 }}>sync</span>
                            Synchronize
                        </button>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Booking Ref</th>
                                <th>Dispatch Node</th>
                                <th>Schedule Base</th>
                                <th>Origin Sector</th>
                                <th>Target Sector</th>
                                <th>Asset Class</th>
                                <th>Identifier (Asset ID)</th>
                                <th>Client Name</th>
                                <th style={{ textAlign: 'center' }}>Origin KM</th>
                                <th style={{ textAlign: 'center' }}>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={11} style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                                            <span className="material-icons" style={{ fontSize: 32, color: '#cbd5e1' }}>sync</span>
                                            <div>Synchronizing active dispatches...</div>
                                        </div>
                                    </td>
                                </tr>
                            ) : trips.length === 0 ? (
                                <tr>
                                    <td colSpan={11} style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                                            <span className="material-icons" style={{ fontSize: 32, color: '#cbd5e1' }}>not_listed_location</span>
                                            <div>All vehicles are currently vacant or assigned. No active trips in transit.</div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                trips.map((trip) => {
                                    const isSelected = String(trip.v_id) === String(vehicleId);
                                    return (
                                        <tr key={trip.b_id} style={{
                                            background: isSelected ? '#f0f9ff' : (trip.open_km ? '#f8fafc' : '#fff'),
                                            borderLeft: isSelected ? '4px solid #0284c7' : (trip.open_km ? '4px solid #10b981' : '4px solid transparent'),
                                            transition: 'all 0.15s ease-in-out'
                                        }}>
                                            <td style={{ fontWeight: 800, color: '#023149', fontFamily: 'monospace', fontSize: 13 }}>#{fmt(trip.b_id)}</td>
                                            <td style={{ fontSize: 12, color: '#6b7280' }}>{fmt(trip.assign_time)}</td>
                                            <td style={{ fontWeight: 600, color: '#023149' }}>{fmt(trip.bookin_time)}</td>
                                            <td style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={trip.p_city}>{fmt(trip.p_city)}</td>
                                            <td style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={trip.d_place}>{fmt(trip.d_place)}</td>
                                            <td>
                                                <span className="badge badge-gray">{fmt(trip.v_type)}</span>
                                            </td>
                                            <td style={{ fontWeight: 800, color: '#023149', fontSize: 15 }}>{fmt(trip.v_id)}</td>
                                            <td>
                                                <div style={{ fontWeight: 600, color: '#023149', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fmt(trip.b_name)}</div>
                                                <div style={{ fontSize: 12, color: '#6b7280' }}>Tel: {fmt(trip.m_no)}</div>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                {trip.open_km ? (
                                                    <div style={{ display: 'inline-block', background: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: 4, fontWeight: 800, fontSize: 13, border: '1px solid #bbf7d0' }}>
                                                        {trip.open_km} <span style={{ fontSize: 10, opacity: 0.8 }}>KM</span>
                                                    </div>
                                                ) : (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                                                        <div style={{ position: 'relative' }}>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                placeholder="Enter KM"
                                                                value={rowKmInputs[trip.b_id] || ''}
                                                                onChange={e => setRowKmInputs(prev => ({ ...prev, [trip.b_id]: e.target.value }))}
                                                                style={{ width: 100, height: 32, padding: '0 8px', fontSize: 13, fontWeight: 700, border: '1.5px solid #e8d4aa', borderRadius: 6, outline: 'none', background: '#fffdf5' }}
                                                            />
                                                        </div>
                                                        <button
                                                            onClick={() => handleRowSaveKm(trip)}
                                                            disabled={rowSaving[trip.b_id] || !rowKmInputs[trip.b_id]}
                                                            style={{
                                                                height: 32, padding: '0 10px', background: rowKmInputs[trip.b_id] ? '#023149' : '#e2e8f0',
                                                                color: rowKmInputs[trip.b_id] ? '#fff' : '#94a3b8',
                                                                border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 12, cursor: rowKmInputs[trip.b_id] ? 'pointer' : 'not-allowed',
                                                                display: 'flex', alignItems: 'center', gap: 4, transition: 'background 0.15s'
                                                            }}
                                                        >
                                                            <span className="material-icons" style={{ fontSize: 14 }}>save</span>
                                                            {rowSaving[trip.b_id] ? '...' : 'Save'}
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                {trip.open_km ? (
                                                    <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                        <span className="material-icons" style={{ fontSize: 12 }}>route</span> Transit
                                                    </span>
                                                ) : (
                                                    <span className="badge badge-yellow" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                        <span className="material-icons" style={{ fontSize: 12 }}>power_settings_new</span> Base
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <button
                                                    onClick={() => {
                                                        setVehicleId(String(trip.v_id));
                                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                                    }}
                                                    className={isSelected ? "btn-primary" : "btn-ghost"}
                                                    style={{
                                                        padding: '6px 16px',
                                                        background: isSelected ? '#0284c7' : '#f1f5f9',
                                                        color: isSelected ? '#fff' : '#475569',
                                                        borderColor: isSelected ? '#0284c7' : '#e2e8f0'
                                                    }}
                                                >
                                                    {isSelected ? 'Focused' : 'Set Focus'}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24, fontSize: 13, color: '#6b7280' }}>
                    <span className="material-icons" style={{ fontSize: 16, color: '#94a3b8' }}>info</span>
                    <span>To manage a trip, click <strong>Set Focus</strong> to pipe asset parameters directly into the operational control console.</span>
                </div>
            </div>

            <style>{`
                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default OnTrip;
