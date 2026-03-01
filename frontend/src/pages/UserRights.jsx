import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const UserRights = () => {
    const toast = useToast();
    const { api } = useContext(AuthContext);
    const [staff, setStaff] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [permissions, setPermissions] = useState({
        booking: false,
        assigning: false,
        closing: false,
        reports: false
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const response = await api.get('/user_rights.php');
                if (Array.isArray(response.data)) {
                    setStaff(response.data);
                }
            } catch (error) {
                console.error("Error fetching staff", error);
            }
        };
        fetchStaff();
    }, [api]);

    const handleUserChange = (e) => {
        setSelectedUser(e.target.value);
        setPermissions({
            booking: false,
            assigning: false,
            closing: false,
            reports: false
        });
        setMessage('');
    };

    const handleCheckboxChange = (e) => {
        setPermissions({ ...permissions, [e.target.name]: e.target.checked });
        setMessage('');
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!selectedUser) {
            setMessage('Please select a staff member first.');
            return;
        }
        setLoading(true);
        try {
            await api.post('/user_rights.php', {
                emp_id: selectedUser,
                permissions: permissions
            });
            setMessage('Permissions saved successfully!');
        } catch (error) {
            console.error("Save failed", error);
            setMessage('Error saving permissions.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-wrap">
            <div className="page-header">
                <div>
                    <div>
                        <h1>Access Privilege Matrix</h1>
                        <p>Configure interface capabilities per identity node</p>
                    </div>
                </div>
            </div>

            <div className="page-body">
                <div style={{ maxWidth: 800 }}>
                    <div className="section" style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
                        <div style={{ padding: 32 }}>
                            <h3 className="section-title" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: 16, marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12, fontSize: 18, color: '#0f172a' }}>
                                <div style={{ background: '#f0f9ff', color: '#0284c7', width: 40, height: 40, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span className="material-icons" style={{ fontSize: 24 }}>admin_panel_settings</span>
                                </div>
                                System Privilege Configuration State
                            </h3>

                            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                                <div className="form-field">
                                    <label style={{ fontSize: 13, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>Target Operator State</label>
                                    <select
                                        value={selectedUser}
                                        onChange={handleUserChange}
                                        required
                                        style={{ height: 48, fontWeight: 700, background: '#f8fafc', border: '1px solid #cbd5e1' }}
                                    >
                                        <option value="">-- Isolate Identity Hash --</option>
                                        {staff.map((s) => (
                                            <option key={s.id || s.emp_id} value={s.emp_id}>{s.name} ({s.emp_id})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-field" style={{ opacity: selectedUser ? 1 : 0.5, pointerEvents: selectedUser ? 'auto' : 'none', transition: 'opacity 0.2s ease-in-out' }}>
                                    <label style={{ fontSize: 13, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 12 }}>Feature Access Toggles</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, background: '#f8fafc', padding: 24, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', background: '#fff', padding: '16px 20px', borderRadius: 8, border: `1px solid ${permissions.booking ? '#0ea5e9' : '#e2e8f0'}`, boxShadow: permissions.booking ? '0 0 0 1px #0ea5e9' : 'none', transition: 'all 0.2s ease' }}>
                                            <input
                                                type="checkbox"
                                                name="booking"
                                                checked={permissions.booking}
                                                onChange={handleCheckboxChange}
                                                style={{ width: 18, height: 18, accentColor: '#0ea5e9' }}
                                            />
                                            <div>
                                                <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Topology Generation</div>
                                                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Allow ingress of itinerary vectors</div>
                                            </div>
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', background: '#fff', padding: '16px 20px', borderRadius: 8, border: `1px solid ${permissions.assigning ? '#0ea5e9' : '#e2e8f0'}`, boxShadow: permissions.assigning ? '0 0 0 1px #0ea5e9' : 'none', transition: 'all 0.2s ease' }}>
                                            <input
                                                type="checkbox"
                                                name="assigning"
                                                checked={permissions.assigning}
                                                onChange={handleCheckboxChange}
                                                style={{ width: 18, height: 18, accentColor: '#0ea5e9' }}
                                            />
                                            <div>
                                                <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Asset Mapping</div>
                                                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Bind vehicles to topologies</div>
                                            </div>
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', background: '#fff', padding: '16px 20px', borderRadius: 8, border: `1px solid ${permissions.closing ? '#0ea5e9' : '#e2e8f0'}`, boxShadow: permissions.closing ? '0 0 0 1px #0ea5e9' : 'none', transition: 'all 0.2s ease' }}>
                                            <input
                                                type="checkbox"
                                                name="closing"
                                                checked={permissions.closing}
                                                onChange={handleCheckboxChange}
                                                style={{ width: 18, height: 18, accentColor: '#0ea5e9' }}
                                            />
                                            <div>
                                                <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Lifecycle Finalization</div>
                                                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Terminate ledgers (Billing)</div>
                                            </div>
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', background: '#fff', padding: '16px 20px', borderRadius: 8, border: `1px solid ${permissions.reports ? '#0ea5e9' : '#e2e8f0'}`, boxShadow: permissions.reports ? '0 0 0 1px #0ea5e9' : 'none', transition: 'all 0.2s ease' }}>
                                            <input
                                                type="checkbox"
                                                name="reports"
                                                checked={permissions.reports}
                                                onChange={handleCheckboxChange}
                                                style={{ width: 18, height: 18, accentColor: '#0ea5e9' }}
                                            />
                                            <div>
                                                <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Heuristic Observation</div>
                                                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Acknowledge macro data</div>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 24, borderTop: '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: message ? 1 : 0, transition: 'opacity 0.2s', color: message.includes('successfully') ? '#16a34a' : '#ef4444' }}>
                                        {message && <span className="material-icons" style={{ fontSize: 20 }}>{message.includes('successfully') ? 'task_alt' : 'error'}</span>}
                                        <span style={{ fontSize: 14, fontWeight: 700 }}>
                                            {message}
                                        </span>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading || !selectedUser}
                                        className="btn-primary"
                                        style={{ height: 48, padding: '0 32px', opacity: (loading || !selectedUser) ? 0.7 : 1, cursor: (loading || !selectedUser) ? 'not-allowed' : 'pointer', fontSize: 15, background: '#023149' }}
                                        onMouseEnter={e => { if (!(loading || !selectedUser)) e.currentTarget.style.background = '#012030'; }}
                                        onMouseLeave={e => { if (!(loading || !selectedUser)) e.currentTarget.style.background = '#023149'; }}
                                    >
                                        <span className="material-icons" style={{ fontSize: 20 }}>security_update_good</span>
                                        {loading ? 'Commiting...' : 'Commit Protocol State'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserRights;
