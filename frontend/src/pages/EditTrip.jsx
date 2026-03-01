import { useState, useContext } from 'react';
import { useToast } from '../context/ToastContext';

        

        

import AuthContext from '../context/AuthContext';
const EditTrip = () => {
    const toast = useToast();
const { api, user } = useContext(AuthContext);
    const [bookingId, setBookingId] = useState('');
    const [tripData, setTripData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({});

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.get('/reports.php?type=booking&from_date=2000-01-01&to_date=2099-12-31');
            const foundTrip = response.data.find(t => t.b_id == bookingId);

            if (foundTrip) {
                setTripData(foundTrip);
                setFormData({
                    ...foundTrip,
                    user_id: user.emp_id
                });
            } else {
                toast("Trip not found.", 'error');
                setTripData(null);
            }
        } catch (error) {
            console.error("Error searching trip", error);
            toast("Error searching trip.", 'error');
        } finally {
            setLoading(false);
        }
    };

    
        
const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put('/trip_edit.php', { ...formData, b_id: bookingId });
            toast('Trip Updated Successfully!');
            setTripData(null);
            setBookingId('');
            setFormData({});
        } catch (error) {
            console.error("Error updating trip", error);
            toast("Failed to update trip.", 'error');
        }
    };

    return (
        <div className="page-wrap">
            <div className="page-header">
                <div>
                    <div>
                        <h1>Modify Closed Trip</h1>
                        <p>Adjust driver assignment, route data, and financial records post-closing</p>
                    </div>
                </div>
            </div>

            <div className="page-body">

                <form className="section" onSubmit={handleSearch} style={{ display: 'flex', gap: 16, alignItems: 'flex-end', padding: 24, marginBottom: 32, maxWidth: 800 }}>
                    <div className="form-field" style={{ flex: 1, margin: 0 }}>
                        <label>Booking ID Reference <span style={{ color: '#c5111a' }}>*</span></label>
                        <input
                            type="text"
                            value={bookingId}
                            onChange={(e) => setBookingId(e.target.value)}
                            placeholder="Enter Booking ID (e.g. 1025)"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                        style={{ height: 42, padding: '0 32px', opacity: loading ? 0.7 : 1, cursor: loading ? 'wait' : 'pointer', background: '#023149' }}
                    >
                        <span className="material-icons" style={{ fontSize: 18 }}>search</span>
                        {loading && !tripData ? 'Searching...' : 'Retrieve Record'}
                    </button>
                </form>

                {tripData && (
                    <div className="section" style={{ maxWidth: 1000 }}>
                        <div style={{ padding: 32 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #fdf6e8', paddingBottom: 16, marginBottom: 24 }}>
                                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#023149', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span className="material-icons" style={{ color: '#c5111a', fontSize: 20 }}>edit_note</span>
                                    Trip Record #{tripData.b_id}
                                </h3>
                                <span className="badge badge-yellow">Historical Edit</span>
                            </div>

                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

                                <div>
                                    <h4 style={{ fontSize: 13, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 16 }}>Customer &amp; Route</h4>
                                    <div className="form-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                                        <div className="form-field" style={{ margin: 0 }}>
                                            <label>Customer Name</label>
                                            <input type="text" name="customer" value={formData.customer || formData.b_name || ''} onChange={handleInputChange} />
                                        </div>
                                        <div className="form-field" style={{ margin: 0 }}>
                                            <label>Customer Contact</label>
                                            <input type="text" name="m_no" value={formData.m_no || ''} onChange={handleInputChange} />
                                        </div>
                                        <div className="form-field" style={{ margin: 0 }}>
                                            <label>Driver Contact</label>
                                            <input type="text" name="d_mobile" value={formData.d_mobile || ''} onChange={handleInputChange} />
                                        </div>

                                        <div className="form-field" style={{ margin: 0 }}>
                                            <label>Pickup Location</label>
                                            <input type="text" name="p_city" value={formData.p_city || formData.picup_place || ''} onChange={handleInputChange} />
                                        </div>
                                        <div className="form-field" style={{ margin: 0, gridColumn: 'span 2' }}>
                                            <label>Destination / Drop Place</label>
                                            <input type="text" name="d_place" value={formData.d_place || formData.drop_place || ''} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                </div>

                                <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: 24 }}>
                                    <h4 style={{ fontSize: 13, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 16 }}>Mileage &amp; Billing</h4>
                                    <div className="form-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                                        <div className="form-field" style={{ margin: 0 }}>
                                            <label>Opening KM</label>
                                            <input type="number" name="opening_km" value={formData.opening_km || ''} onChange={handleInputChange} />
                                        </div>
                                        <div className="form-field" style={{ margin: 0 }}>
                                            <label>Closing KM</label>
                                            <input type="number" name="closing_km" value={formData.closing_km || ''} onChange={handleInputChange} />
                                        </div>
                                        <div className="form-field" style={{ margin: 0 }}>
                                            <label>Total Distance</label>
                                            <div style={{ padding: '0 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, color: '#023149', fontWeight: 700, height: 42, display: 'flex', alignItems: 'center' }}>
                                                {(formData.closing_km || 0) - (formData.opening_km || 0)} <span style={{ color: '#6b7280', fontWeight: 500, marginLeft: 4 }}>km</span>
                                            </div>
                                        </div>
                                        <div className="form-field" style={{ margin: 0 }}>
                                            <label>Net Trip Cost (₹)</label>
                                            <input type="number" name="net_total" value={formData.net_total || ''} onChange={handleInputChange} style={{ fontWeight: 700, color: '#023149' }} />
                                        </div>

                                        <div className="form-field" style={{ margin: 0 }}>
                                            <label>Amount Recieved (₹)</label>
                                            <input type="number" name="paid_amount" value={formData.paid_amount || ''} onChange={handleInputChange} style={{ fontWeight: 700, color: '#15803d', borderColor: '#bbf7d0', background: '#f0fdf4' }} />
                                        </div>
                                        <div className="form-field" style={{ margin: 0 }}>
                                            <label>Remaining Due (₹)</label>
                                            <div style={{ padding: '0 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, color: '#c5111a', fontWeight: 800, height: 42, display: 'flex', alignItems: 'center' }}>
                                                {(formData.net_total || 0) - (formData.paid_amount || 0)}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 24, borderTop: '2px solid #fdf6e8' }}>
                                    <button
                                        type="submit"
                                        className="btn-primary"
                                        style={{ height: 44, padding: '0 32px', background: '#023149' }}
                                    >
                                        <span className="material-icons" style={{ fontSize: 18 }}>save_as</span>
                                        Save Modifications
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditTrip;
