import { useState, useEffect, useContext } from 'react';
import { useToast } from '../context/ToastContext';

        

        

import AuthContext from '../context/AuthContext';
const Vehicles = () => {
    const toast = useToast();
const { api } = useContext(AuthContext);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentVehicle, setCurrentVehicle] = useState(null);
    const [formData, setFormData] = useState({
        v_cat: '', v_brand: '', v_model: '', v_no: '', joining: '',
        ie_date: '', fc_date: '', pe_date: '', puc_date: '', rt_date: '',
        v_id: '', v_own: '1', seat_a: '', att_type: '', d_mobile: '',
        o_mobile: '', adv_amt: '', y_model: '', d_name: '', o_name: '', vacant_place: ''
    });

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            const response = await api.get('/vehicles.php');
            setVehicles(Array.isArray(response.data) ? response.data : []);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching vehicles", error);
            setLoading(false);
        }
    };

    
        
const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    
        
const openModal = (vehicle = null) => {
        if (vehicle) {
            setCurrentVehicle(vehicle);
            setFormData(vehicle);
        } else {
            setCurrentVehicle(null);
            setFormData({
                v_cat: '', v_brand: '', v_model: '', v_no: '', joining: '',
                ie_date: '', fc_date: '', pe_date: '', puc_date: '', rt_date: '',
                v_id: '', v_own: '1', seat_a: '', att_type: '', d_mobile: '',
                o_mobile: '', adv_amt: '', y_model: '', d_name: '', o_name: '', vacant_place: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentVehicle) {
                await api.put('/vehicles.php', formData);
            } else {
                await api.post('/vehicles.php', formData);
            }
            fetchVehicles();
            setIsModalOpen(false);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (vehicle) => {
        if (window.confirm(`Are you sure you want to completely abort/remove vehicle ${vehicle.v_id} (${vehicle.v_no}) from the database?`)) {
            try {
                await api.delete(`/vehicles.php?v_id=${vehicle.v_id}`);
                fetchVehicles();
            } catch (error) {
                console.error("Error deleting vehicle", error);
                toast("Failed to delete the vehicle. It may be linked to active trips.", 'error');
            }
        }
    };

    return (
        <div className="page-wrap">
            <div className="page-header">
                <div>
                    <div>
                        <h1>Fleet Management</h1>
                        <p>Manage vehicles, registrations, and driver assignments</p>
                    </div>
                    <button className="btn-primary" onClick={() => openModal()} style={{ background: '#c5111a' }}>
                        <span className="material-icons" style={{ fontSize: 18 }}>add_circle</span>
                        Register Vehicle
                    </button>
                </div>
            </div>

            <div className="page-body">
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>V-ID</th>
                                <th>Category</th>
                                <th>Brand / Model</th>
                                <th>Reg No</th>
                                <th>Driver Details</th>
                                <th>Owner Details</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Loading fleet data...</td>
                                </tr>
                            ) : vehicles.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>No vehicles found in the system.</td>
                                </tr>
                            ) : (
                                vehicles.map((v) => (
                                    <tr key={v.v_id}>
                                        <td style={{ fontWeight: 700, color: '#023149' }}>{v.v_id}</td>
                                        <td><span className="badge badge-blue">{v.v_cat}</span></td>
                                        <td style={{ fontWeight: 600 }}>{v.v_brand} <span style={{ color: '#6b7280', fontWeight: 400 }}>{v.v_model}</span></td>
                                        <td style={{ fontFamily: 'monospace', fontWeight: 600, color: '#023149' }}>{v.v_no}</td>
                                        <td>
                                            <div style={{ fontWeight: 600, color: '#023149' }}>{v.d_name}</div>
                                            <div style={{ fontSize: 12, color: '#6b7280' }}>{v.d_mobile}</div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 600, color: '#475569' }}>{v.o_name}</div>
                                            <div style={{ fontSize: 12, color: '#6b7280' }}>{v.o_mobile}</div>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                                <button className="btn-ghost" onClick={() => openModal(v)} style={{ padding: '6px 12px' }}>
                                                    <span className="material-icons" style={{ fontSize: 16 }}>edit</span>
                                                    Edit
                                                </button>
                                                <button className="btn-ghost" onClick={() => handleDelete(v)} style={{ padding: '6px 12px', color: '#c5111a', borderColor: '#fecaca', background: '#fef2f2' }}>
                                                    <span className="material-icons" style={{ fontSize: 16 }}>cancel</span>
                                                    Abort
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal" style={{ maxWidth: 900 }}>
                        <div className="modal-header">
                            <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span className="material-icons">{currentVehicle ? 'edit_document' : 'directions_car'}</span>
                                {currentVehicle ? 'Edit Vehicle Details' : 'Register New Vehicle'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)}>
                                <span className="material-icons">close</span>
                            </button>
                        </div>

                        <form id="vehicleForm" onSubmit={handleSubmit} style={{ overflowY: 'auto', maxHeight: '70vh' }}>
                            <div className="modal-body" style={{ padding: 32, paddingBottom: 0 }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>

                                    {/* Specifications */}
                                    <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: 16 }}>
                                        <h3 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', borderBottom: '1px solid #e2e8f0', paddingBottom: 8 }}>
                                            Specifications &amp; Identity
                                        </h3>
                                        <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                            <div className="form-field" style={{ margin: 0 }}>
                                                <label>Vehicle ID <span style={{ color: '#c5111a' }}>*</span></label>
                                                <input type="text" name="v_id" value={formData.v_id} onChange={handleChange} required readOnly={!!currentVehicle} style={{ background: currentVehicle ? '#f8fafc' : '#fff' }} />
                                            </div>
                                            <div className="form-field" style={{ margin: 0 }}>
                                                <label>Registration Number <span style={{ color: '#c5111a' }}>*</span></label>
                                                <input type="text" name="v_no" value={formData.v_no} onChange={handleChange} required placeholder="KA-00-XX-0000" />
                                            </div>
                                            <div className="form-field" style={{ margin: 0 }}>
                                                <label>Category <span style={{ color: '#c5111a' }}>*</span></label>
                                                <select name="v_cat" value={formData.v_cat} onChange={handleChange} required>
                                                    <option value="">Select Category</option>
                                                    <option value="Mini">Mini</option>
                                                    <option value="Sedan">Sedan</option>
                                                    <option value="SUV">SUV</option>
                                                    <option value="Van">Van</option>
                                                    <option value="Tempo">Tempo</option>
                                                </select>
                                            </div>
                                            <div className="form-field" style={{ margin: 0 }}>
                                                <label>Passenger Capacity</label>
                                                <input type="text" name="seat_a" value={formData.seat_a} onChange={handleChange} placeholder="E.g. 4+1" />
                                            </div>
                                            <div className="form-field" style={{ margin: 0 }}>
                                                <label>Brand</label>
                                                <select name="v_brand" value={formData.v_brand} onChange={handleChange}>
                                                    <option value="">Select Brand</option>
                                                    <option value="Honda">Honda</option>
                                                    <option value="Toyota">Toyota</option>
                                                    <option value="Maruti Suzuki">Maruti Suzuki</option>
                                                    <option value="Hyundai">Hyundai</option>
                                                    <option value="Tata">Tata</option>
                                                    <option value="Renault">Renault</option>
                                                </select>
                                            </div>
                                            <div className="form-field" style={{ margin: 0 }}>
                                                <label>Model</label>
                                                <input type="text" name="v_model" value={formData.v_model} onChange={handleChange} placeholder="E.g. Innova Crysta" />
                                            </div>
                                            <div className="form-field" style={{ margin: 0 }}>
                                                <label>Year of Manufacture</label>
                                                <input type="text" name="y_model" value={formData.y_model} onChange={handleChange} placeholder="YYYY" />
                                            </div>
                                            <div className="form-field" style={{ margin: 0 }}>
                                                <label>Base Location (Vacant Place)</label>
                                                <input type="text" name="vacant_place" value={formData.vacant_place} onChange={handleChange} placeholder="E.g. City Center" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Compliance Dates */}
                                    <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: 16 }}>
                                        <h3 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', borderBottom: '1px solid #e2e8f0', paddingBottom: 8 }}>
                                            Compliance &amp; Validity Tracking
                                        </h3>
                                        <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', background: '#fdf6e8', padding: 16, borderRadius: 8, border: '1px solid #e8d4aa' }}>
                                            <div className="form-field" style={{ margin: 0 }}>
                                                <label>Joining / Attach Date</label>
                                                <input type="date" name="joining" value={formData.joining} onChange={handleChange} />
                                            </div>
                                            <div className="form-field" style={{ margin: 0 }}>
                                                <label>Insurance Expiry</label>
                                                <input type="date" name="ie_date" value={formData.ie_date} onChange={handleChange} />
                                            </div>
                                            <div className="form-field" style={{ margin: 0 }}>
                                                <label>Fitness (FC) Expiry</label>
                                                <input type="date" name="fc_date" value={formData.fc_date} onChange={handleChange} />
                                            </div>
                                            <div className="form-field" style={{ margin: 0 }}>
                                                <label>Permit Expiry</label>
                                                <input type="date" name="pe_date" value={formData.pe_date} onChange={handleChange} />
                                            </div>
                                            <div className="form-field" style={{ margin: 0 }}>
                                                <label>Pollution (PUC) Expiry</label>
                                                <input type="date" name="puc_date" value={formData.puc_date} onChange={handleChange} />
                                            </div>
                                            <div className="form-field" style={{ margin: 0 }}>
                                                <label>Road Tax Expiry</label>
                                                <input type="date" name="rt_date" value={formData.rt_date} onChange={handleChange} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Driver & Owner Context */}
                                    <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16, borderTop: '2px solid #f8fafc', paddingTop: 24 }}>
                                        <h3 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', borderBottom: '1px solid #e2e8f0', paddingBottom: 8 }}>
                                            Ownership &amp; Assignment
                                        </h3>
                                        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                                            <div className="form-field" style={{ margin: 0 }}>
                                                <label>Ownership Type</label>
                                                <select name="v_own" value={formData.v_own} onChange={handleChange}>
                                                    <option value="1">Attached (Vendor/Partner)</option>
                                                    <option value="0">Company Owned</option>
                                                </select>
                                            </div>
                                            <div className="form-field" style={{ margin: 0 }}>
                                                <label>Primary Driver Name</label>
                                                <input type="text" name="d_name" value={formData.d_name} onChange={handleChange} />
                                            </div>
                                            <div className="form-field" style={{ margin: 0 }}>
                                                <label>Driver Contact</label>
                                                <input type="text" name="d_mobile" value={formData.d_mobile} onChange={handleChange} />
                                            </div>
                                            <div className="form-field" style={{ margin: 0 }}>
                                                <label>Owner Name</label>
                                                <input type="text" name="o_name" value={formData.o_name} onChange={handleChange} />
                                            </div>
                                            <div className="form-field" style={{ margin: 0 }}>
                                                <label>Owner Contact</label>
                                                <input type="text" name="o_mobile" value={formData.o_mobile} onChange={handleChange} />
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </form>

                        <div className="modal-footer">
                            <button type="button" className="btn-ghost" onClick={() => setIsModalOpen(false)}>Discard</button>
                            <button type="submit" form="vehicleForm" className="btn-primary" style={{ background: '#023149' }}>
                                <span className="material-icons" style={{ fontSize: 16 }}>verified</span>
                                {currentVehicle ? 'Save Modifications' : 'Register Vehicle'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Vehicles;
