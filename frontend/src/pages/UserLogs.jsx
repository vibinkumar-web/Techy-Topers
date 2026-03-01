import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const UserLogs = () => {
    const toast = useToast();
    const { api } = useContext(AuthContext);
    const [logs, setLogs] = useState([]);
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        staff_id: '',
        from_date: '',
        to_date: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [staffRes, logsRes] = await Promise.all([
                    api.get('/staff.php'),
                    api.get('/staff_login_logs.php')
                ]);
                setStaff(staffRes.data || []);
                setLogs(logsRes.data.logs || []);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching data", error);
                setLoading(false);
            }
        };
        fetchData();
    }, [api]);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const params = new URLSearchParams(filters);
            const res = await api.get(`/staff_login_logs.php?${params.toString()}`);
            setLogs(res.data.logs || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-wrap">
            <div className="page-header">
                <div>
                    <div>
                        <h1>Identity Access Matrix Log</h1>
                        <p>Track system ingress protocols and session footprint nodes</p>
                    </div>
                </div>
            </div>

            <div className="page-body">
                <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 24, alignItems: 'flex-end', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 24, marginBottom: 32, boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' }}>
                    <div className="form-field" style={{ margin: 0 }}>
                        <label style={{ fontSize: 13, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>Target Identity Key</label>
                        <div className="input-with-icon">
                            <span className="material-icons" style={{ color: '#023149' }}>manage_accounts</span>
                            <select
                                name="staff_id"
                                value={filters.staff_id}
                                onChange={(e) => setFilters({ ...filters, staff_id: e.target.value })}
                                style={{ height: 48, fontWeight: 700 }}
                            >
                                <option value="">Global Filter Matrix</option>
                                {Array.isArray(staff) && staff.map(s => <option key={s.emp_id} value={s.emp_id}>{s.name} ({s.emp_id})</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="form-field" style={{ margin: 0 }}>
                        <label style={{ fontSize: 13, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>Origin Epoch</label>
                        <input type="date" name="from_date" value={filters.from_date} onChange={(e) => setFilters({ ...filters, from_date: e.target.value })} style={{ height: 48, fontWeight: 600, color: '#0f172a' }} />
                    </div>
                    <div className="form-field" style={{ margin: 0 }}>
                        <label style={{ fontSize: 13, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>Terminus Epoch</label>
                        <input type="date" name="to_date" value={filters.to_date} onChange={(e) => setFilters({ ...filters, to_date: e.target.value })} style={{ height: 48, fontWeight: 600, color: '#0f172a' }} />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                        style={{ height: 48, padding: '0 32px', opacity: loading ? 0.7 : 1, cursor: loading ? 'wait' : 'pointer', fontSize: 15 }}
                    >
                        <span className="material-icons" style={{ fontSize: 20 }}>filter_alt</span>
                        {loading ? 'Compiling...' : 'Apply Filters'}
                    </button>
                </form>

                <div className="table-wrap" style={{ background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)', overflow: 'hidden' }}>
                    <table style={{ margin: 0 }}>
                        <thead style={{ background: '#f8fafc' }}>
                            <tr>
                                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em', width: '20%' }}>IP Topology Hash</th>
                                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em', width: '25%' }}>Identity Node</th>
                                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em', width: '25%' }}>Timestamp Vector</th>
                                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em', width: '30%' }}>Client Application Fingerprint</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '60px 40px', color: '#6b7280' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                                            <span className="material-icons" style={{ fontSize: 32, color: '#cbd5e1', animation: 'spin 2s linear infinite' }}>sync</span>
                                            <div>Synchronizing topology logs...</div>
                                        </div>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '60px 40px', color: '#6b7280' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                                            <span className="material-icons" style={{ fontSize: 32, color: '#cbd5e1' }}>security</span>
                                            <div>No secure handshakes isolated for the mapped heuristic.</div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '16px 24px', fontWeight: 800, color: '#0f172a', fontFamily: 'monospace', fontSize: 14 }}>{log.ip_address}</td>
                                        <td style={{ padding: '16px 24px', fontWeight: 800, color: '#023149', fontSize: 14 }}>{log.staff_name}</td>
                                        <td style={{ padding: '16px 24px', color: '#475569', fontSize: 13, fontWeight: 600 }}>{log.login_at}</td>
                                        <td style={{ padding: '16px 24px', fontSize: 12, color: '#64748b', fontFamily: 'monospace', maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={log.user_agent}>{log.user_agent}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
            </div>
        </div>
    );
};

export default UserLogs;
