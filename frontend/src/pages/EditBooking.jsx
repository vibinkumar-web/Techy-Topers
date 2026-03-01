import { useState, useContext } from 'react';
import { useToast } from '../context/ToastContext';

        

        

import AuthContext from '../context/AuthContext';
const EditBooking = () => {
    const toast = useToast();
const { api } = useContext(AuthContext);
    const [bookingId, setBookingId] = useState('');
    const [bookingData, setBookingData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({});

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.get('/reports.php?type=booking&from_date=2000-01-01&to_date=2099-12-31');
            const found = response.data.find(b => b.b_id == bookingId);

            if (found) {
                setBookingData(found);
                setFormData(found);
            } else {
                toast("Booking not found.", 'error');
                setBookingData(null);
            }
        } catch (error) {
            console.error("Error searching booking", error);
            toast("Error searching booking.", 'error');
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
            await api.put('/booking_edit.php', { ...formData, b_id: bookingId });
            toast('Booking Updated Successfully!');
            setBookingData(null);
            setBookingId('');
            setFormData({});
        } catch (error) {
            console.error("Error updating booking", error);
            toast("Failed to update booking.", 'error');
        }
    };

    return (
        <div className="page-wrap">
            <div className="page-header">
                <div>
                    <div>
                        <h1>Edit Active Booking</h1>
                        <p>Modify customer information, trip requirements, or schedules</p>
                    </div>
                </div>
            </div>

            <div className="page-body">

                <form className="section" onSubmit={handleSearch} style={{ display: 'flex', gap: 16, alignItems: 'flex-end', padding: 24, marginBottom: 32, maxWidth: 800 }}>
                    <div className="form-field" style={{ flex: 1, margin: 0 }}>
                        <label>Booking Reference ID <span style={{ color: '#c5111a' }}>*</span></label>
                        <input
                            type="text"
                            value={bookingId}
                            onChange={(e) => setBookingId(e.target.value)}
                            placeholder="e.g. 1025"
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
                        {loading && !bookingData ? 'Searching...' : 'Find Booking'}
                    </button>
                </form>

                {bookingData && (
                    <div className="section" style={{ maxWidth: 1000 }}>
                        <div style={{ padding: 32 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #fdf6e8', paddingBottom: 16, marginBottom: 24 }}>
                                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#023149', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span className="material-icons" style={{ color: '#c5111a', fontSize: 20 }}>edit_document</span>
                                    Booking Details — #{bookingData.b_id}
                                </h3>
                                <span className="badge badge-yellow">Modify Mode</span>
                            </div>

                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>

                                    {/* Column 1: Customer Details */}
                                    <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: 16 }}>
                                        <h4 style={{ fontSize: 13, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', borderBottom: '1px solid #e2e8f0', paddingBottom: 8, margin: 0 }}>Customer Info</h4>
                                        <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
                                            <div className="form-field" style={{ margin: 0 }}>
                                                <label>Customer Name <span style={{ color: '#c5111a' }}>*</span></label>
                                                <input type="text" name="cus_name" value={formData.cus_name || ''} onChange={handleChange} required />
                                            </div>
                                            <div className="form-field" style={{ margin: 0 }}>
                                                <label>Mobile Number <span style={{ color: '#c5111a' }}>*</span></label>
                                                <input type="text" name="cus_mobile" value={formData.cus_mobile || ''} onChange={handleChange} required />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Column 2: Route & Timing */}
                                    <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: 16 }}>
                                        <h4 style={{ fontSize: 13, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', borderBottom: '1px solid #e2e8f0', paddingBottom: 8, margin: 0 }}>Route &amp; Timing</h4>
                                        <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                            <div className="form-field" style={{ margin: 0 }}>
                                                <label>Pickup Time <span style={{ color: '#c5111a' }}>*</span></label>
                                                <input type="datetime-local" name="pickup_time" value={formData.pickup_time || ''} onChange={handleChange} required />
                                            </div>
                                            <div className="form-field" style={{ margin: 0 }}>
                                                <label>Booking Classification</label>
                                                <select name="b_type" value={formData.b_type || ''} onChange={handleChange}>
                                                    <option value="0">Current Request</option>
                                                    <option value="1">Advance Booking</option>
                                                </select>
                                            </div>
                                            <div className="form-field" style={{ margin: 0 }}>
                                                <label>Pickup Point <span style={{ color: '#c5111a' }}>*</span></label>
                                                <input type="text" name="pickup" value={formData.pickup || ''} onChange={handleChange} required />
                                            </div>
                                            <div className="form-field" style={{ margin: 0 }}>
                                                <label>Destination Drop <span style={{ color: '#c5111a' }}>*</span></label>
                                                <input type="text" name="drop_place" value={formData.drop_place || ''} onChange={handleChange} required />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Column 3: Vehicle Preferences */}
                                    <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
                                        <h4 style={{ fontSize: 13, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', borderBottom: '1px solid #e2e8f0', paddingBottom: 8, margin: 0 }}>Vehicle Preferences</h4>
                                        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                                            <div className="form-field" style={{ margin: 0 }}>
                                                <label>Requested Vehicle / Class</label>
                                                <input type="text" name="v_types" value={formData.v_types || ''} onChange={handleChange} placeholder="e.g. Sedan, Innova" />
                                            </div>
                                            <div className="form-field" style={{ margin: 0 }}>
                                                <label>A/C Preference</label>
                                                <select name="ac_type" value={formData.ac_type || ''} onChange={handleChange}>
                                                    <option value="AC">Air Conditioned (A/C)</option>
                                                    <option value="Non AC">Non A/C</option>
                                                </select>
                                            </div>
                                            <div className="form-field" style={{ margin: 0, gridColumn: 'span 2' }}>
                                                <label>Special Remarks / Internal Notes</label>
                                                <input type="text" name="remarks" value={formData.remarks || ''} onChange={handleChange} placeholder="Any specific requirements..." />
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

export default EditBooking;
