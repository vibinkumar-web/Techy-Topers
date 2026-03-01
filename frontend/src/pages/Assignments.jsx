import { useState, useEffect, useContext } from 'react';
import { useToast } from '../context/ToastContext';





import AuthContext from '../context/AuthContext';
const Assignments = () => {
    const toast = useToast();
    const { api } = useContext(AuthContext);
    const [pendingBookings, setPendingBookings] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [selectedVehicleId, setSelectedVehicleId] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [bookingsRes, vehiclesRes] = await Promise.all([
                api.get('/assign.php'),
                api.get('/vehicles.php')
            ]);

            if (Array.isArray(bookingsRes.data)) {
                setPendingBookings(bookingsRes.data);
            } else {
                setPendingBookings([]);
            }

            if (Array.isArray(vehiclesRes.data)) {
                setVehicles(vehiclesRes.data);
            } else {
                setVehicles([]);
            }
        } catch (error) {
            console.error("Error fetching data", error);
        } finally {
            setLoading(false);
        }
    };

    const openAssignModal = (booking) => {
        setSelectedBooking(booking);
        setSelectedVehicleId('');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedBooking(null);
    };

    const handleAssign = async () => {
        if (!selectedVehicleId) return;

        if (!vehicles.some(v => v.v_id === selectedVehicleId)) {
            toast("Please select a valid Vehicle ID from the dropdown suggestions.");
            return;
        }

        try {
            await api.post('/assign.php', {
                b_id: selectedBooking.b_id,
                v_id: selectedVehicleId
            });

            // Refresh data
            const bookingsRes = await api.get('/assign.php');
            setPendingBookings(Array.isArray(bookingsRes.data) ? bookingsRes.data : []);
            closeModal();
            toast('Vehicle Dispatched Successfully! Check the Trip Closing page when the trip is finished.');
        } catch (error) {
            console.error("Error assigning vehicle", error);
            toast('Failed to assign driver.', 'error');
        }
    };

    if (loading) return (
        <div className="page-wrap">
            <div className="page-body" style={{ padding: 40, textAlign: 'center', color: '#023149', fontWeight: 600 }}>
                Loading dispatch assignments...
            </div>
        </div>
    );

    return (
        <div className="page-wrap">
            <div className="page-header">
                <div>
                    <div>
                        <h1>Dispatch Assignments</h1>
                        <p>Assign specific fleet vehicles and active drivers to confirmed bookings</p>
                    </div>
                </div>
            </div>

            <div className="page-body">
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Booking Ref</th>
                                <th>Status</th>
                                <th>Schedule</th>
                                <th>Client Name</th>
                                <th>Origin</th>
                                <th>Destination</th>
                                <th>Service Class</th>
                                <th style={{ textAlign: 'center' }}>A/C</th>
                                <th>Spec. Req</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingBookings.map((booking) => (
                                <tr key={booking.b_id}>
                                    <td style={{ fontWeight: 800, color: '#023149', fontFamily: 'monospace', fontSize: 13 }}>#{booking.b_id}</td>
                                    <td>
                                        <span className={`badge ${booking.booking_status === '1' ? 'badge-green' : 'badge-amber'}`}>
                                            {booking.booking_status === '1' ? 'Confirmed' : 'Pending'}
                                        </span>
                                    </td>
                                    <td style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 700, color: '#023149' }} title={booking.pickup}>{booking.pickup}</td>
                                    <td>
                                        <div style={{ fontWeight: 600, color: '#023149', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={booking.b_name || booking.to_whom}>{booking.b_name || booking.to_whom}</div>
                                        <div style={{ fontSize: 12, color: '#6b7280' }}>{booking.m_no}</div>
                                    </td>
                                    <td style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={booking.p_city}>{booking.p_city}</td>
                                    <td style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={booking.d_place}>{booking.d_place}</td>
                                    <td>
                                        <span className="badge badge-blue">{booking.v_type}</span>
                                        <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>{booking.t_type}</div>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        {booking.ac_type === '1' ? (
                                            <span className="material-icons" style={{ fontSize: 18, color: '#023149' }} title="AC Required">ac_unit</span>
                                        ) : (
                                            <span className="material-icons" style={{ fontSize: 18, color: '#cbd5e1' }} title="Non-AC">remove_circle_outline</span>
                                        )}
                                    </td>
                                    <td style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#6b7280', fontStyle: 'italic' }} title={booking.remarks}>{booking.remarks || '-'}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button
                                            className="btn-ghost"
                                            onClick={() => openAssignModal(booking)}
                                            style={{ padding: '6px 16px', color: '#c5111a', borderColor: '#fecaca', background: '#fef2f2' }}
                                        >
                                            <span className="material-icons" style={{ fontSize: 16 }}>local_taxi</span>
                                            Dispatch
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {(!pendingBookings || pendingBookings.length === 0) && (
                                <tr>
                                    <td colSpan="10" style={{ textAlign: 'center', padding: '60px 40px', color: '#6b7280' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                                            <span className="material-icons" style={{ fontSize: 32, color: '#cbd5e1' }}>done_all</span>
                                            <div>All active bookings have been successfully dispatched.</div>
                                            <div style={{ fontSize: 13, marginTop: 4 }}>No pending assignments found in the queue.</div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && selectedBooking && (
                <div className="modal-overlay">
                    <div className="modal" style={{ maxWidth: 540 }}>
                        <div className="modal-header">
                            <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span className="material-icons" style={{ color: '#c5111a' }}>assignment_ind</span>
                                Dispatch Assignment — #{selectedBooking.b_id}
                            </h2>
                            <button onClick={closeModal}>
                                <span className="material-icons">close</span>
                            </button>
                        </div>

                        <div className="modal-body" style={{ padding: 32 }}>
                            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 20, marginBottom: 24 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, borderBottom: '1px dashed #cbd5e1', paddingBottom: 16 }}>
                                    <div>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: 4 }}>Customer Profile</div>
                                        <div style={{ fontSize: 15, fontWeight: 800, color: '#023149' }}>{selectedBooking.b_name || selectedBooking.to_whom}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: 4 }}>Schedule</div>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: '#023149' }}>{selectedBooking.pickup}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    <div>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: 4 }}>Required Route</div>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: '#475569' }}>{selectedBooking.p_city} &rarr; {selectedBooking.d_place}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: '#c5111a', textTransform: 'uppercase', marginBottom: 4 }}>Vehicle Class Required</div>
                                        <div style={{ fontSize: 14, fontWeight: 800, color: '#023149' }}>{selectedBooking.v_type} {selectedBooking.ac_type === '1' ? '(A/C)' : ''}</div>
                                    </div>
                                </div>
                            </div>

                            <form id="assignForm" onSubmit={e => { e.preventDefault(); handleAssign(); }}>
                                <div className="form-field" style={{ margin: 0 }}>
                                    <label>Search and Select Fleet Vehicle <span style={{ color: '#c5111a' }}>*</span></label>
                                    <input
                                        type="text"
                                        list="vehiclesList"
                                        value={selectedVehicleId}
                                        onChange={(e) => setSelectedVehicleId(e.target.value)}
                                        placeholder="Type Vehicle ID to search..."
                                        required
                                        style={{ height: 44, borderColor: selectedVehicleId ? '#023149' : '#cbd5e1' }}
                                    />
                                    <datalist id="vehiclesList">
                                        {vehicles.map(v => (
                                            <option key={v.v_id} value={v.v_id}>
                                                [ {v.v_no} ] — {v.v_brand} {v.v_model} — Driver: {v.d_name || 'Unassigned'}
                                            </option>
                                        ))}
                                    </datalist>
                                    {selectedVehicleId && !vehicles.some(v => v.v_id === selectedVehicleId) && (
                                        <div style={{ fontSize: 12, color: '#c5111a', marginTop: 4, fontWeight: 600 }}>
                                            <span className="material-icons" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 4 }}>warning</span>
                                            Please select a valid Vehicle ID from the list.
                                        </div>
                                    )}
                                </div>
                            </form>
                        </div>

                        <div className="modal-footer" style={{ padding: '16px 32px' }}>
                            <button type="button" className="btn-ghost" onClick={closeModal}>Abort</button>
                            <button
                                type="submit"
                                form="assignForm"
                                className="btn-primary"
                                disabled={!selectedVehicleId}
                                style={{
                                    background: '#c5111a',
                                    height: 42,
                                    padding: '0 32px',
                                    opacity: !selectedVehicleId ? 0.6 : 1,
                                    cursor: !selectedVehicleId ? 'not-allowed' : 'pointer'
                                }}
                                onMouseEnter={e => { if (selectedVehicleId) e.currentTarget.style.background = '#7d0907'; }}
                                onMouseLeave={e => { if (selectedVehicleId) e.currentTarget.style.background = '#c5111a'; }}
                            >
                                <span className="material-icons" style={{ fontSize: 18 }}>gavel</span>
                                Exec Dispatch
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Assignments;
