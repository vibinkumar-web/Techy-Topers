import { useState, useEffect, useContext } from 'react';
import { useToast } from '../context/ToastContext';

        

        

import AuthContext from '../context/AuthContext';
const Staff = () => {
    const toast = useToast();
const { api } = useContext(AuthContext);
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);

    const initialFormState = {
        emp_id: '',
        name: '',
        u_type: 'Call Center Executive',
        mobile: '',
        pwd: '',
        address: '',
        dob: '',
        email: '',
        j_date: '',
        salary: '',
        per_month: '',
        hrsp_day: '',
        hrs_day: '',
        hrs_night: '',
        emp_status: '0', // 0: Working, 1: Resigned
        r_date: ''
    };

    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            const response = await api.get('/staff.php');
            setStaffList(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching staff", error);
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

    
        
const handleEdit = (staff) => {
        setFormData(staff);
        setIsEdit(true);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEdit) {
                await api.put('/staff.php', formData);
                toast('Staff updated successfully');
            } else {
                await api.post('/staff.php', formData);
                toast('Staff created successfully');
            }
            setShowModal(false);
            fetchStaff();
        } catch (error) {
            console.error("Error saving staff", error);
            toast('Failed to save operation', 'error');
        }
    };

    return (
        <div className="page-wrap">
            <div className="page-header">
                <div>
                    <div>
                        <h1>Personnel Directory</h1>
                        <p>Manage employee records, security scopes, and organizational statuses</p>
                    </div>
                    <button className="btn-primary" onClick={openNewModal} style={{ background: '#023149' }} onMouseEnter={e => e.currentTarget.style.background = '#012030'} onMouseLeave={e => e.currentTarget.style.background = '#023149'}>
                        <span className="material-icons" style={{ fontSize: 18 }}>person_add</span>
                        Provision New Agent
                    </button>
                </div>
            </div>

            <div className="page-body">
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Personnel ID</th>
                                <th>Name / Legal Identity</th>
                                <th>Security Designation</th>
                                <th>Primary Contact</th>
                                <th>Operational Status</th>
                                <th style={{ textAlign: 'right' }}>Management</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '60px 40px', color: '#6b7280' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                                            <span className="material-icons" style={{ fontSize: 32, color: '#cbd5e1' }}>sync</span>
                                            <div>Loading active organizational directory...</div>
                                        </div>
                                    </td>
                                </tr>
                            ) : staffList.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '60px 40px', color: '#6b7280' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                                            <span className="material-icons" style={{ fontSize: 32, color: '#cbd5e1' }}>groups</span>
                                            <div>No authenticated personnel entries found within scope.</div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                staffList.map((staff) => (
                                    <tr key={staff.emp_id}>
                                        <td style={{ fontFamily: 'monospace', fontWeight: 800, color: '#023149', fontSize: 13 }}>{staff.emp_id}</td>
                                        <td style={{ fontWeight: 800, color: '#023149' }}>{staff.name}</td>
                                        <td>
                                            <span className="badge badge-gray" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569' }}>
                                                {staff.u_type}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: 600, color: '#475569' }}>{staff.mobile}</td>
                                        <td>
                                            <span className={`badge ${staff.emp_status === '0' ? 'badge-green' : 'badge-red'}`}>
                                                {staff.emp_status === '0' ? 'Active Scope' : 'Access Revoked'}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button
                                                className="btn-ghost"
                                                onClick={() => openEditModal(staff)}
                                                style={{ padding: '6px 16px', color: '#0284c7', borderColor: '#bae6fd', background: '#f0f9ff' }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#e0f2fe'}
                                                onMouseLeave={e => e.currentTarget.style.background = '#f0f9ff'}
                                            >
                                                <span className="material-icons" style={{ fontSize: 16 }}>manage_accounts</span>
                                                Modify Config
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Config Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal" style={{ maxWidth: 840 }}>
                        <div className="modal-header">
                            <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span className="material-icons" style={{ color: '#023149' }}>{isEdit ? 'admin_panel_settings' : 'badge'}</span>
                                {isEdit ? `Modifying Entity Protocol: ${formData.emp_id}` : 'Provisioning New Internal Entity'}
                            </h2>
                            <button onClick={() => setShowModal(false)}>
                                <span className="material-icons">close</span>
                            </button>
                        </div>

                        <form id="staffForm" onSubmit={handleSubmit} style={{ overflowY: 'auto', maxHeight: '75vh' }}>
                            <div className="modal-body" style={{ padding: 32, paddingBottom: 16 }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 40 }}>

                                    {/* KYC & Identity Schema */}
                                    <div>
                                        <h3 style={{ margin: '0 0 20px', fontSize: 13, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>
                                            <span className="material-icons" style={{ fontSize: 18, color: '#023149' }}>assignment_ind</span>
                                            KYC &amp; Core Identity Schema
                                        </h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                            <div className="form-field" style={{ margin: 0 }}>
                                                <label htmlFor="name">Legal Name Registry <span style={{ color: '#c5111a' }}>*</span></label>
                                                <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                                            </div>
                                            <div className="form-field" style={{ margin: 0 }}>
                                                <label htmlFor="mobile">Primary Telephonic Node <span style={{ color: '#c5111a' }}>*</span></label>
                                                <input type="text" id="mobile" name="mobile" value={formData.mobile} onChange={handleInputChange} required />
                                            </div>
                                            <div className="form-field" style={{ margin: 0 }}>
                                                <label htmlFor="email">Authorized Electronic Mail</label>
                                                <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} />
                                            </div>
                                            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                                <div className="form-field" style={{ margin: 0 }}>
                                                    <label>Date of Birth</label>
                                                    <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} />
                                                </div>
                                                <div className="form-field" style={{ margin: 0 }}>
                                                    <label>Commissioning Date</label>
                                                    <input type="date" name="j_date" value={formData.j_date} onChange={handleInputChange} />
                                                </div>
                                            </div>
                                            <div className="form-field" style={{ margin: 0 }}>
                                                <label>Verified Postal Matrix</label>
                                                <textarea name="address" value={formData.address} onChange={handleInputChange} rows="3" style={{ resize: 'vertical', minHeight: 88 }}></textarea>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sec & Compensation Logic */}
                                    <div>
                                        <h3 style={{ margin: '0 0 20px', fontSize: 13, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>
                                            <span className="material-icons" style={{ fontSize: 18, color: '#c5111a' }}>security</span>
                                            Security Scope &amp; Logic
                                        </h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                                            <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: 8, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 16 }}>
                                                <div className="form-field" style={{ margin: 0 }}>
                                                    <label>ACL Designation <span style={{ color: '#c5111a' }}>*</span></label>
                                                    <select name="u_type" value={formData.u_type} onChange={handleInputChange} style={{ fontWeight: 600 }}>
                                                        <option value="Admin">Tier 1: Architect / Admin</option>
                                                        <option value="Manager">Tier 2: Regional Manager</option>
                                                        <option value="Call Center Executive">Tier 3: Executive Agent</option>
                                                    </select>
                                                </div>
                                                <div className="form-field" style={{ margin: 0 }}>
                                                    <label htmlFor="pwd">Cryptographic Secret (PWD) <span style={{ color: '#c5111a' }}>*</span></label>
                                                    <input type="text" id="pwd" name="pwd" value={formData.pwd} onChange={handleInputChange} required style={{ fontFamily: 'monospace', letterSpacing: '.1em' }} />
                                                </div>
                                            </div>

                                            <div style={{ background: '#fdf6e8', padding: '16px 20px', borderRadius: 8, border: '1px solid #e8d4aa', display: 'flex', flexDirection: 'column', gap: 16 }}>
                                                <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                                    <div className="form-field" style={{ margin: 0 }}>
                                                        <label>Base Apportionment</label>
                                                        <input type="number" name="salary" value={formData.salary} onChange={handleInputChange} placeholder="0.00" />
                                                    </div>
                                                    <div className="form-field" style={{ margin: 0 }}>
                                                        <label>Required Timecycle</label>
                                                        <input type="number" name="hrsp_day" value={formData.hrsp_day} onChange={handleInputChange} placeholder="8 Hrs" />
                                                    </div>
                                                </div>
                                                <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                                    <div className="form-field" style={{ margin: 0 }}>
                                                        <label>Flux Overtime (Alpha)</label>
                                                        <input type="number" name="hrs_day" value={formData.hrs_day} onChange={handleInputChange} placeholder="0.00" />
                                                    </div>
                                                    <div className="form-field" style={{ margin: 0 }}>
                                                        <label>Flux Overtime (Omega)</label>
                                                        <input type="number" name="hrs_night" value={formData.hrs_night} onChange={handleInputChange} placeholder="0.00" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="form-field" style={{ margin: 0, padding: '12px 16px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: 8 }}>
                                                <label style={{ marginBottom: 12 }}>Organizational Status Overrides</label>
                                                <div style={{ display: 'flex', gap: 32 }}>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: '#15803d', fontWeight: 700 }}>
                                                        <input type="radio" name="emp_status" value="0" checked={formData.emp_status === '0'} onChange={handleInputChange} />
                                                        Active &amp; Bound
                                                    </label>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: '#b91c1c', fontWeight: 700 }}>
                                                        <input type="radio" name="emp_status" value="1" checked={formData.emp_status === '1'} onChange={handleInputChange} />
                                                        Revoked (Resigned)
                                                    </label>
                                                </div>
                                            </div>

                                            {formData.emp_status === '1' && (
                                                <div className="form-field" style={{ margin: 0, animation: 'fadeIn 0.2s ease-out' }}>
                                                    <label>Revocation Terminus Date</label>
                                                    <input type="date" name="r_date" value={formData.r_date} onChange={handleInputChange} style={{ borderColor: '#fca5a5', background: '#fef2f2' }} />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                </div>
                            </div>
                            <div className="modal-footer" style={{ padding: '24px 32px' }}>
                                <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Terminate Process</button>
                                <button type="submit" className="btn-primary" style={{ background: '#023149', height: 44, padding: '0 32px' }} onMouseEnter={e => e.currentTarget.style.background = '#012030'} onMouseLeave={e => e.currentTarget.style.background = '#023149'}>
                                    <span className="material-icons" style={{ fontSize: 18 }}>gavel</span>
                                    {isEdit ? 'Enforce Registry Changes' : 'Initialize Agent Record'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div >
    );
};

export default Staff;
