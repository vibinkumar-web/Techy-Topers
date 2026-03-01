import { useState, useEffect, useContext } from 'react';
import { useToast } from '../context/ToastContext';

        

        

import AuthContext from '../context/AuthContext';
const VehicleMaster = () => {
    const toast = useToast();
const { api } = useContext(AuthContext);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);

    const initialFormState = {
        v_cat: '',
        v_brand: '',
        v_model: '',
        v_no: '',
        joining: '',
        ie_date: '',
        fc_date: '',
        pe_date: '', // Permit Exp
        puc_date: '', // Pollution C
        rt_date: '', // Road Tax
        v_id: '',
        v_own: '1', // 1: Attach, 0: Admin
        seat_a: '',
        att_type: '',
        d_mobile: '',
        o_mobile: '',
        adv_amt: '',
        y_model: '',
        d_name: '',
        o_name: '',
        vacant_place: ''
    };

    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            const response = await api.get('/vehicles.php');
            setVehicles(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching vehicles", error);
            setLoading(false);
        }
    };

    
        
const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    
        
const handleAdd = () => {
        setFormData(initialFormState);
        setIsEdit(false);
        setShowModal(true);
    };

    
        
const handleEdit = (vehicle) => {
        setFormData(vehicle);
        setIsEdit(true);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEdit) {
                await api.put('/vehicles.php', formData);
                toast('Vehicle updated successfully');
            } else {
                await api.post('/vehicles.php', formData);
                toast('Vehicle attached successfully');
            }
            setShowModal(false);
            fetchVehicles();
        } catch (error) {
            console.error("Error saving vehicle", error);
            toast('Failed to save operation. ' + (error.response?.data?.message || '', 'error'));
        }
    };

    return (
        <div className="page-wrap">
            {/* ── Page Header ── */}
            <div className="page-header">
                <div>
                    <div>
                        <h1>Vehicle Master</h1>
                        <p>Fleet registry and compliance tracking</p>
                    </div>
                    <button
                        className="btn-primary"
                        onClick={openNewModal}
                        style={{ background: '#c5111a' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#7d0907'}
                        onMouseLeave={e => e.currentTarget.style.background = '#c5111a'}
                    >
                        <span className="material-icons" style={{ fontSize: 18 }}>add_circle</span>
                        Attach Vehicle
                    </button>
                </div>
            </div>

            {/* ── Page Body ── */}
            <div className="page-body">
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>V-ID</th>
                                <th>Category</th>
                                <th>Brand</th>
                                <th>Model</th>
                                <th>Registration</th>
                                <th>Driver</th>
                                <th>Owner</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: '#7a8fa0' }}>Loading fleet data…</td></tr>
                            ) : vehicles.length === 0 ? (
                                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: '#7a8fa0' }}>No vehicles registered.</td></tr>
                            ) : (
                                vehicles.map((v) => (
                                    <tr key={v.v_id}>
                                        <td style={{ fontWeight: 800, color: '#023149', fontFamily: 'monospace', fontSize: 13 }}>{v.v_id}</td>
                                        <td><span className="badge badge-blue">{v.v_cat}</span></td>
                                        <td style={{ fontWeight: 600, color: '#023149' }}>{v.v_brand}</td>
                                        <td style={{ fontWeight: 600 }}>{v.v_model}</td>
                                        <td style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: '#023149' }}>{v.v_no}</td>
                                        <td>
                                            <div style={{ fontWeight: 600, color: '#023149' }}>{v.d_name}</div>
                                            <div style={{ fontSize: 12, color: '#6b7280' }}>{v.d_mobile}</div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 600, color: '#475569' }}>{v.o_name}</div>
                                            <div style={{ fontSize: 12, color: '#6b7280' }}>{v.o_mobile}</div>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button
                                                className="btn-ghost"
                                                onClick={() => openEditModal(v)}
                                                style={{ padding: '6px 12px' }}
                                            >
                                                <span className="material-icons" style={{ fontSize: 16 }}>edit</span>
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal" style={{ maxWidth: 840 }}>
                        <div className="modal-header">
                            <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span className="material-icons" style={{ color: '#023149' }}>directions_car</span>
                                {isEdit ? 'Update Vehicle Record' : 'Attach New Fleet Member'}
                            </h2>
                            <button onClick={() => setShowModal(false)}>
                                <span className="material-icons">close</span>
                            </button>
                        </div>

                        <form id="vehicleForm" onSubmit={handleSubmit} style={{ overflowY: 'auto', maxHeight: '75vh' }}>
                            <div className="modal-body" style={{ padding: 32, paddingBottom: 16 }}>

                                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 40 }}>

                                    <div>
                                        <h3 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>
                                            Specifications
                                        </h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                                <div className="form-field" style={{ margin: 0 }}>
                                                    <label>Category <span style={{ color: '#c5111a' }}>*</span></label>
                                                    <select name="v_cat" value={formData.v_cat} onChange={handleInputChange} required>
                                                        <option value="">Select Category</option>
                                                        <option value="Mini">Mini</option>
                                                        <option value="Sedan">Sedan</option>
                                                        <option value="SUV">SUV</option>
                                                        <option value="Van">Van</option>
                                                        <option value="Tempo">Tempo</option>
                                                    </select>
                                                </div>
                                                <div className="form-field" style={{ margin: 0 }}>
                                                    <label>Brand <span style={{ color: '#c5111a' }}>*</span></label>
                                                    <select name="v_brand" value={formData.v_brand} onChange={handleInputChange} required>
                                                        <option value="">Select Brand</option>
                                                        <option value="Honda">Honda</option>
                                                        <option value="Toyota">Toyota</option>
                                                        <option value="Maruthi">Maruthi</option>
                                                        <option value="Hyundai">Hyundai</option>
                                                        <option value="Tata">Tata</option>
                                                        <option value="Renault">Renault</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                                <div className="form-field" style={{ margin: 0 }}>
                                                    <label>Model <span style={{ color: '#c5111a' }}>*</span></label>
                                                    <input type="text" name="v_model" value={formData.v_model} onChange={handleInputChange} placeholder="e.g. Swift" required />
                                                </div>
                                                <div className="form-field" style={{ margin: 0 }}>
                                                    <label>Registration No <span style={{ color: '#c5111a' }}>*</span></label>
                                                    <input type="text" name="v_no" value={formData.v_no} onChange={handleInputChange} placeholder="KA-00-XX-0000" required style={{ textTransform: 'uppercase' }} />
                                                </div>
                                            </div>

                                            <h3 style={{ margin: '24px 0 16px', fontSize: 13, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>
                                                Operator Details
                                            </h3>

                                            <div className="form-field" style={{ margin: 0 }}>
                                                <label>Vehicle ID</label>
                                                <input type="text" name="v_id" value={formData.v_id} onChange={handleInputChange} readOnly={isEdit} style={{ background: isEdit ? '#f8fafc' : '#fff' }} required />
                                            </div>

                                            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                                <div className="form-field" style={{ margin: 0 }}>
                                                    <label>Driver Name</label>
                                                    <input type="text" name="d_name" value={formData.d_name} onChange={handleInputChange} />
                                                </div>
                                                <div className="form-field" style={{ margin: 0 }}>
                                                    <label>Driver Mobile</label>
                                                    <input type="text" name="d_mobile" value={formData.d_mobile} onChange={handleInputChange} />
                                                </div>
                                            </div>

                                            <div className="form-field" style={{ margin: 0 }}>
                                                <label>Ownership</label>
                                                <select name="v_own" value={formData.v_own} onChange={handleInputChange}>
                                                    <option value="1">Third Party / Attached</option>
                                                    <option value="0">Company Owned</option>
                                                </select>
                                            </div>

                                        </div>
                                    </div>

                                    <div>
                                        <h3 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>
                                            Compliance &amp; Dates
                                        </h3>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', background: '#f8fafc', padding: 16, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                                                <div className="form-field" style={{ margin: 0 }}>
                                                    <label>Joining Date</label>
                                                    <input type="date" name="joining" value={formData.joining} onChange={handleInputChange} />
                                                </div>
                                                <div className="form-field" style={{ margin: 0 }}>
                                                    <label>Fitness (FC) Exp</label>
                                                    <input type="date" name="fc_date" value={formData.fc_date} onChange={handleInputChange} />
                                                </div>
                                                <div className="form-field" style={{ margin: 0 }}>
                                                    <label>Insurance Exp</label>
                                                    <input type="date" name="ie_date" value={formData.ie_date} onChange={handleInputChange} />
                                                </div>
                                                <div className="form-field" style={{ margin: 0 }}>
                                                    <label>Pollution Exp</label>
                                                    <input type="date" name="puc_date" value={formData.puc_date} onChange={handleInputChange} />
                                                </div>
                                            </div>

                                            <h3 style={{ margin: '24px 0 16px', fontSize: 13, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>
                                                Registry Info
                                            </h3>

                                            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                                <div className="form-field" style={{ margin: 0 }}>
                                                    <label>Owner Name</label>
                                                    <input type="text" name="o_name" value={formData.o_name} onChange={handleInputChange} />
                                                </div>
                                                <div className="form-field" style={{ margin: 0 }}>
                                                    <label>Owner Mobile</label>
                                                    <input type="text" name="o_mobile" value={formData.o_mobile} onChange={handleInputChange} />
                                                </div>
                                            </div>

                                            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                                <div className="form-field" style={{ margin: 0 }}>
                                                    <label>Capacity (Seats)</label>
                                                    <input type="text" name="seat_a" value={formData.seat_a} onChange={handleInputChange} />
                                                </div>
                                                <div className="form-field" style={{ margin: 0 }}>
                                                    <label>Base Location</label>
                                                    <input type="text" name="vacant_place" value={formData.vacant_place} onChange={handleInputChange} placeholder="Current location" />
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>

                        <div className="modal-footer" style={{ padding: '24px 32px' }}>
                            <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Discard</button>
                            <button type="submit" form="vehicleForm" className="btn-primary" style={{ background: '#023149', height: 44, padding: '0 32px' }} onMouseEnter={e => e.currentTarget.style.background = '#012030'} onMouseLeave={e => e.currentTarget.style.background = '#023149'}>
                                <span className="material-icons" style={{ fontSize: 18 }}>gavel</span>
                                {isEdit ? 'Save Changes' : 'Register Vehicle'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VehicleMaster;
