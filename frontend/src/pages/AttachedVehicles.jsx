import { useState, useEffect, useContext } from 'react';
import { useToast } from '../context/ToastContext';

        

        

import AuthContext from '../context/AuthContext';
const AttachedVehicles = () => {
    const toast = useToast();
const { api } = useContext(AuthContext);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);

    const initialFormState = {
        v_cat: '', v_brand: '', v_model: '', v_no: '', joining: '',
        ie_date: '', fc_date: '', pe_date: '', puc_date: '', rt_date: '',
        v_id: '', v_own: '1', seat_a: '', att_type: '', d_mobile: '',
        o_mobile: '', adv_amt: '', y_model: '', d_name: '', o_name: '', vacant_place: ''
    };

    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            const response = await api.get('/attached_vehicles.php');
            setVehicles(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching vehicles", error);
            setLoading(false);
        }
    };

    
        
const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEdit) {
                await api.put('/attached_vehicles.php', formData);
                toast('Vehicle updated successfully');
            } else {
                await api.post('/attached_vehicles.php', formData);
                toast('Vehicle attached successfully');
            }
            setShowModal(false);
            fetchVehicles();
        } catch (error) {
            console.error("Error saving vehicle", error);
            toast('Failed to save vehicle', 'error');
        }
    };

    return (
        <div className="page-wrap">
            <div className="page-header">
                <div>
                    <div>
                        <h1>Attached Vehicles Management</h1>
                        <p>Track outsourced vendors and third-party fleet members</p>
                    </div>
                    <button
                        onClick={() => { setFormData(initialFormState); setIsEdit(false); setShowModal(true); }}
                        className="btn-primary"
                        style={{ background: '#15803d' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#166534'}
                        onMouseLeave={e => e.currentTarget.style.background = '#15803d'}
                    >
                        <span className="material-icons" style={{ fontSize: 18 }}>add_circle</span>
                        Attach External Vehicle
                    </button>
                </div>
            </div>

            <div className="page-body">
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>V-ID / Ref</th>
                                <th>Registration No</th>
                                <th>Vehicle Class</th>
                                <th>Owner Details</th>
                                <th>Assigned Driver</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '60px 40px', color: '#6b7280' }}>Loading attached vehicles network...</td>
                                </tr>
                            ) : vehicles.map((v) => (
                                <tr key={v.v_id}>
                                    <td><span style={{ fontWeight: 800, color: '#023149', fontFamily: 'monospace', padding: '4px 8px', background: '#f8fafc', borderRadius: 4, border: '1px solid #e2e8f0' }}>{v.v_id}</span></td>
                                    <td style={{ fontWeight: 700, color: '#023149', fontSize: 14 }}>{v.v_no}</td>
                                    <td>
                                        <div style={{ fontWeight: 700 }}>{v.v_brand} {v.v_model}</div>
                                        <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', marginTop: 2 }}>{v.v_cat}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 600, color: '#475569' }}>{v.o_name}</div>
                                        <div style={{ color: '#6b7280', fontSize: 12 }}>{v.o_mobile}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 600, color: '#023149' }}>{v.d_name || 'Unassigned'}</div>
                                        <div style={{ color: '#6b7280', fontSize: 12 }}>{v.d_mobile}</div>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button onClick={() => { setFormData(v); setIsEdit(true); setShowModal(true); }} className="btn-ghost" style={{ padding: '6px 16px' }}>
                                            <span className="material-icons" style={{ fontSize: 16 }}>edit</span>
                                            Manage Profile
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {!loading && vehicles.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '60px 40px', color: '#6b7280' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                                            <span className="material-icons" style={{ fontSize: 32, color: '#cbd5e1' }}>local_shipping</span>
                                            <div>No attached/outsourced vehicles found in the network.</div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal" style={{ maxWidth: 900 }}>
                            <div className="modal-header">
                                <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span className="material-icons" style={{ color: '#15803d' }}>{isEdit ? 'edit_note' : 'add_circle'}</span>
                                    {isEdit ? 'Modify Attached Vehicle Details' : 'Register New Vendor Vehicle'}
                                </h2>
                                <button onClick={() => setShowModal(false)}>
                                    <span className="material-icons">close</span>
                                </button>
                            </div>

                            <form id="vehicleForm" onSubmit={handleSubmit} style={{ overflowY: 'auto', maxHeight: '70vh' }}>
                                <div className="modal-body" style={{ padding: 32, paddingBottom: 0 }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>

                                        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: 16 }}>
                                            <h3 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', borderBottom: '1px solid #e2e8f0', paddingBottom: 8 }}>
                                                Identification
                                            </h3>
                                            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                                <div className="form-field" style={{ margin: 0 }}>
                                                    <label>Internal Reference ID <span style={{ color: '#c5111a' }}>*</span></label>
                                                    <input name="v_id" value={formData.v_id} onChange={handleInputChange} required readOnly={isEdit} style={{ background: isEdit ? '#f8fafc' : '#fff' }} />
                                                </div>
                                                <div className="form-field" style={{ margin: 0 }}>
                                                    <label>Registration Number <span style={{ color: '#c5111a' }}>*</span></label>
                                                    <input name="v_no" value={formData.v_no} onChange={handleInputChange} required placeholder="State-Code-0000" />
                                                </div>
                                                <div className="form-field" style={{ margin: 0 }}>
                                                    <label>Category <span style={{ color: '#c5111a' }}>*</span></label>
                                                    <select name="v_cat" value={formData.v_cat} onChange={handleInputChange} required>
                                                        <option value="">Select Category</option>
                                                        <option value="Mini">Mini / Hatchback</option>
                                                        <option value="Sedan">Sedan</option>
                                                        <option value="SUV">SUV - 6 Seater</option>
                                                        <option value="MUV">MUV - 7+ Seater</option>
                                                        <option value="Van">Van / Tempo</option>
                                                    </select>
                                                </div>
                                                <div className="form-field" style={{ margin: 0 }}>
                                                    <label>Joining / Partnership Date</label>
                                                    <input name="joining" type="date" value={formData.joining} onChange={handleInputChange} />
                                                </div>
                                                <div className="form-field" style={{ margin: 0 }}>
                                                    <label>Brand Make</label>
                                                    <input name="v_brand" value={formData.v_brand} onChange={handleInputChange} placeholder="e.g. Toyota" />
                                                </div>
                                                <div className="form-field" style={{ margin: 0 }}>
                                                    <label>Vehicle Model</label>
                                                    <input name="v_model" value={formData.v_model} onChange={handleInputChange} placeholder="e.g. Innova" />
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: 16 }}>
                                            <h3 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', borderBottom: '1px solid #e2e8f0', paddingBottom: 8 }}>
                                                Personnel &amp; Finance
                                            </h3>
                                            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                                <div className="form-field" style={{ margin: 0 }}>
                                                    <label>Vendor / Owner Name</label>
                                                    <input name="o_name" value={formData.o_name} onChange={handleInputChange} placeholder="Full legal name" />
                                                </div>
                                                <div className="form-field" style={{ margin: 0 }}>
                                                    <label>Owner Contact</label>
                                                    <input name="o_mobile" value={formData.o_mobile} onChange={handleInputChange} placeholder="Primary phone number" />
                                                </div>
                                                <div className="form-field" style={{ margin: 0 }}>
                                                    <label>Assigned Driver Name</label>
                                                    <input name="d_name" value={formData.d_name} onChange={handleInputChange} placeholder="Driver name" />
                                                </div>
                                                <div className="form-field" style={{ margin: 0 }}>
                                                    <label>Driver Contact</label>
                                                    <input name="d_mobile" value={formData.d_mobile} onChange={handleInputChange} placeholder="Driver phone number" />
                                                </div>
                                                <div className="form-field" style={{ margin: 0 }}>
                                                    <label>Partner Type</label>
                                                    <select name="v_own" value={formData.v_own} onChange={handleInputChange}>
                                                        <option value="1">Third-Party Outsource (Attached)</option>
                                                        <option value="0">Franchise (Admin)</option>
                                                    </select>
                                                </div>
                                                <div className="form-field" style={{ margin: 0 }}>
                                                    <label>Advance Deposit / Security (₹)</label>
                                                    <input name="adv_amt" type="number" value={formData.adv_amt} onChange={handleInputChange} placeholder="0.00" />
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </form>

                            <div className="modal-footer">
                                <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Discard</button>
                                <button type="submit" form="vehicleForm" className="btn-primary" style={{ background: '#15803d' }} onMouseEnter={e => e.currentTarget.style.background = '#166534'} onMouseLeave={e => e.currentTarget.style.background = '#15803d'}>
                                    <span className="material-icons" style={{ fontSize: 18 }}>assignment_turned_in</span>
                                    {isEdit ? 'Save Attached Vehicle Details' : 'Register Attached Vehicle'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AttachedVehicles;
