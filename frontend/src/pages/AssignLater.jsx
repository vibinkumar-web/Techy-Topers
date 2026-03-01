import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { useToast } from '../context/ToastContext';





const AssignLater = () => {
    const toast = useToast();
    const { api, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [drivers, setDrivers] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const driversRes = await api.get('/assign_later.php?action=drivers');
            const bookingsRes = await api.get('/assign_later.php?action=bookings');
            setDrivers(driversRes.data || []);
            setBookings(bookingsRes.data || []);
        } catch (error) {
            console.error("Error fetching data", error);
        }
    };

    const handleAssign = async () => {
        if (!selectedBooking || !selectedDriver) return;

        if (!window.confirm(`Assign Booking ${selectedBooking.b_id} to Driver ${selectedDriver.id_emp}?`)) return;

        setLoading(true);
        try {
            const payload = {
                id: selectedBooking.id, // Primary Key
                b_id: selectedBooking.b_id,
                pickup: selectedBooking.pickup,
                p_city: selectedBooking.p_city,
                d_place: selectedBooking.d_place,
                driver_id: selectedDriver.id_emp,
                v_type: selectedDriver.v_type || selectedBooking.v_type, // Use driver's type or booking's request
                v_no: selectedDriver.v_no || 'Unknown',
                d_mobile: selectedDriver.emp_mobile,
                b_name: selectedBooking.b_name,
                m_no: selectedBooking.m_no,
                t_type: selectedBooking.t_type,
                ac_type: selectedBooking.ac_type,
                to_whom: selectedBooking.to_whom,
                user_id: user?.id || 0,
                r_status: selectedBooking.r_status || ''
            };

            await api.post('/assign_later.php', payload);
            toast('Assignment Successful!');
            fetchData(); // Refresh
            setSelectedBooking(null);
            setSelectedDriver(null);
        } catch (error) {
            console.error("Assignment failed", error);
            toast('Assignment Failed: ' + (error.response?.data?.message || error.message, 'error'));
        } finally {
            setLoading(false);
        }
    };

    const filteredDrivers = drivers.filter(d =>
        d.id_emp.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.emp_mobile.includes(searchTerm)
    );

    return (
        <div className="page-wrap" style={{ paddingBottom: 100 }}>
            <div className="page-header">
                <div>
                    <div>
                        <h1>Manual Trip Assignment</h1>
                        <p>Manually match pending bookings with vacant vehicles/drivers</p>
                    </div>
                </div>
            </div>

            <div className="page-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 5fr) minmax(0, 4fr)', gap: 32 }}>

                    {/* Bookings Column */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#023149', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span className="material-icons" style={{ fontSize: 20, color: '#689abb' }}>list_alt</span>
                                Pending Scheduled Bookings
                            </h2>
                            <span className="badge badge-yellow">{bookings.length} waiting</span>
                        </div>

                        <div className="section" style={{ flex: 1, padding: 24, overflowY: 'auto', maxHeight: 'calc(100vh - 280px)', background: '#f8fafc', border: '1px solid #e2e8f0', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.02)' }}>
                            {bookings.length === 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#6b7280', gap: 12 }}>
                                    <span className="material-icons" style={{ fontSize: 40, color: '#cbd5e1' }}>check_circle_outline</span>
                                    <span>No pending bookings requiring assignment.</span>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    {bookings.map(b => {
                                        const isSelected = selectedBooking?.id === b.id;
                                        return (
                                            <div
                                                key={b.id}
                                                onClick={() => setSelectedBooking(b)}
                                                style={{
                                                    padding: 20,
                                                    borderRadius: 8,
                                                    border: isSelected ? '2px solid #023149' : '1px solid #e2e8f0',
                                                    background: isSelected ? '#f0f9ff' : '#fff',
                                                    cursor: 'pointer',
                                                    transition: 'all .15s ease-in-out',
                                                    position: 'relative',
                                                    boxShadow: isSelected ? '0 4px 6px -1px rgba(2, 49, 73, 0.1)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                                                }}
                                            >
                                                {isSelected && (
                                                    <div style={{ position: 'absolute', top: -10, right: 16, background: '#023149', color: '#fff', fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 12, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                                                        Selected Session
                                                    </div>
                                                )}
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                                    <div>
                                                        <span style={{ fontWeight: 800, color: '#023149', fontSize: 16, display: 'block' }}>#{b.b_id}</span>
                                                        <span style={{ fontSize: 13, color: '#689abb', fontWeight: 600, marginTop: 4, display: 'block' }}>{b.pickup || b.pickup_time}</span>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <span className="badge badge-blue">{b.v_type} {b.ac_type === '1' ? 'AC' : ''}</span>
                                                    </div>
                                                </div>

                                                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 16 }}>
                                                    <div>
                                                        <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: 4 }}>Requested Route</div>
                                                        <div style={{ fontSize: 14, color: '#023149', fontWeight: 700 }}>
                                                            {b.p_city || b.pickup} &rarr; {b.d_place}
                                                        </div>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: 4 }}>Customer Profile</div>
                                                        <div style={{ fontSize: 14, color: '#023149', fontWeight: 600 }}>{b.b_name}</div>
                                                        <div style={{ fontSize: 13, color: '#6b7280' }}>{b.m_no}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Drivers Column */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#023149', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span className="material-icons" style={{ fontSize: 20, color: '#15803d' }}>airport_shuttle</span>
                                Vacant / Available Vehicles
                            </h2>
                            <span className="badge badge-green">{filteredDrivers.length} available</span>
                        </div>

                        <div className="section" style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', border: '1px solid #e2e8f0' }}>
                            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
                                <div className="form-field" style={{ margin: 0 }}>
                                    <div className="input-with-icon">
                                        <span className="material-icons" style={{ color: '#cbd5e1' }}>search</span>
                                        <input
                                            type="text"
                                            placeholder="Find Driver ID, Vehicle or Mobile..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            style={{ height: 40, border: '1px solid #cbd5e1', background: '#f8fafc' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: 20, overflowY: 'auto', maxHeight: 'calc(100vh - 355px)' }}>
                                {filteredDrivers.length === 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, color: '#6b7280', gap: 12 }}>
                                        <span className="material-icons" style={{ fontSize: 40, color: '#cbd5e1' }}>search_off</span>
                                        <span>No available drivers matching criteria.</span>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {filteredDrivers.map(d => {
                                            const isSelected = selectedDriver?.id === d.id;
                                            return (
                                                <div
                                                    key={d.id}
                                                    onClick={() => setSelectedDriver(d)}
                                                    style={{
                                                        padding: 16,
                                                        borderRadius: 8,
                                                        border: isSelected ? '2px solid #15803d' : '1px solid #e2e8f0',
                                                        background: isSelected ? '#f0fdf4' : '#fff',
                                                        cursor: 'pointer',
                                                        transition: 'all .15s ease-in-out',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 16
                                                    }}
                                                >
                                                    <div style={{ width: 48, height: 48, borderRadius: 24, background: isSelected ? '#15803d' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isSelected ? '#fff' : '#64748b' }}>
                                                        <span className="material-icons" style={{ fontSize: 24 }}>local_taxi</span>
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                                            <span style={{ fontWeight: 800, color: isSelected ? '#15803d' : '#023149', fontSize: 15 }}>{d.id_emp}</span>
                                                            <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 600 }}>{d.emp_mobile}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#475569' }}>
                                                            <span className="material-icons" style={{ fontSize: 14, color: '#c5111a' }}>place</span>
                                                            Vacant exactly at
                                                            <strong style={{ color: '#023149' }}>{d.vacant_place}</strong>
                                                        </div>
                                                        <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                                                            Registered login: {d.login_time}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sticky Action Bar */}
                <div style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 280, // Accounts for desktop sidebar width roughly
                    right: 0,
                    background: '#fff',
                    borderTop: '2px solid #e2e8f0',
                    padding: '20px 40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 -10px 30px -10px rgba(0,0,0,0.05)',
                    zIndex: 50
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>Selected Booking</span>
                            {selectedBooking ? (
                                <span style={{ fontSize: 16, fontWeight: 800, color: '#023149', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    #{selectedBooking.b_id} <span style={{ fontSize: 13, color: '#15803d', fontWeight: 600 }}>({selectedBooking.v_type})</span>
                                </span>
                            ) : (
                                <span style={{ fontSize: 14, color: '#94a3b8', fontStyle: 'italic' }}>Pending selection...</span>
                            )}
                        </div>

                        <span className="material-icons" style={{ color: '#cbd5e1', fontSize: 24 }}>arrow_right_alt</span>

                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>Assigned To Driver/Vehicle</span>
                            {selectedDriver ? (
                                <span style={{ fontSize: 16, fontWeight: 800, color: '#15803d', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    {selectedDriver.id_emp} <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 600 }}>({selectedDriver.v_no})</span>
                                </span>
                            ) : (
                                <span style={{ fontSize: 14, color: '#94a3b8', fontStyle: 'italic' }}>Pending selection...</span>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={handleAssign}
                        disabled={!selectedBooking || !selectedDriver || loading}
                        className="btn-primary"
                        style={{
                            height: 48,
                            padding: '0 48px',
                            fontSize: 15,
                            background: (!selectedBooking || !selectedDriver) ? '#cbd5e1' : '#c5111a',
                            color: (!selectedBooking || !selectedDriver) ? '#64748b' : '#fff',
                            opacity: loading ? 0.7 : 1,
                            cursor: (!selectedBooking || !selectedDriver) ? 'not-allowed' : (loading ? 'wait' : 'pointer'),
                            boxShadow: (!selectedBooking || !selectedDriver) ? 'none' : '0 4px 6px -1px rgba(197, 17, 26, 0.2)'
                        }}
                    >
                        <span className="material-icons" style={{ fontSize: 20 }}>assignment_turned_in</span>
                        {loading ? 'Processing Match...' : 'Confirm Assignment Workflow'}
                    </button>
                </div>
            </div>

            {/* Simple media query injection to handle fixed bar left offset on mobile */}
            <style>{`
                @media (max-width: 1024px) {
                    .page-body > div:last-child { left: 0 !important; }
                }
            `}</style>
        </div>
    );
};

export default AssignLater;
