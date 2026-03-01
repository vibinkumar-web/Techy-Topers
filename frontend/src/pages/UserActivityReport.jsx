import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const UserActivityReport = () => {
    const toast = useToast();
    const { api } = useContext(AuthContext);
    const [staff, setStaff] = useState([]);
    const [stats, setStats] = useState(null);
    const [filters, setFilters] = useState({
        user_id: '',
        from_date: '',
        to_date: ''
    });
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const response = await api.get('/staff.php');
                if (Array.isArray(response.data)) {
                    setStaff(Array.isArray(response.data) ? response.data : []);
                }
            } catch (error) {
                console.error("Error fetching staff", error);
            }
        };
        fetchStaff();
    }, [api]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSearched(true);
        try {
            const response = await api.get(`/user_activity_report.php?user_id=${filters.user_id}&from_date=${filters.from_date}&to_date=${filters.to_date}`);
            setStats(response.data && typeof response.data === 'object' ? response.data : {});
        } catch (error) {
            console.error("Error fetching stats", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-wrap">
            <div className="page-header">
                <div>
                    <div>
                        <h1>Operator Activity Heuristics</h1>
                        <p>Analyze macro-operational throughput mapped to specific staff identities</p>
                    </div>
                </div>
            </div>

            <div className="page-body">
                <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 1.5fr) 1fr 1fr auto', gap: 24, alignItems: 'flex-end', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 24, marginBottom: 32, boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' }}>
                    <div className="form-field" style={{ margin: 0 }}>
                        <label style={{ fontSize: 13, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>Operator Identity</label>
                        <div className="input-with-icon">
                            <span className="material-icons" style={{ color: '#023149' }}>manage_accounts</span>
                            <select
                                name="user_id"
                                value={filters.user_id}
                                onChange={handleFilterChange}
                                required
                                style={{ height: 48, fontWeight: 700 }}
                            >
                                <option value="">Select Operator Key</option>
                                {staff.map((s) => (
                                    <option key={s.id || s.emp_id} value={s.emp_id}>{s.name} ({s.emp_id})</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="form-field" style={{ margin: 0 }}>
                        <label style={{ fontSize: 13, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>Origin Epoch</label>
                        <input
                            type="date"
                            name="from_date"
                            value={filters.from_date}
                            onChange={handleFilterChange}
                            required
                            style={{ height: 48, fontWeight: 600, color: '#0f172a' }}
                        />
                    </div>
                    <div className="form-field" style={{ margin: 0 }}>
                        <label style={{ fontSize: 13, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>Terminus Epoch</label>
                        <input
                            type="date"
                            name="to_date"
                            value={filters.to_date}
                            onChange={handleFilterChange}
                            required
                            style={{ height: 48, fontWeight: 600, color: '#0f172a' }}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                        style={{ height: 48, padding: '0 32px', background: '#0284c7', opacity: loading ? 0.7 : 1, cursor: loading ? 'wait' : 'pointer', fontSize: 15 }}
                        onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#0369a1'; }}
                        onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#0284c7'; }}
                    >
                        <span className="material-icons" style={{ fontSize: 20 }}>query_stats</span>
                        {loading ? 'Compiling...' : 'Execute Analysis'}
                    </button>
                </form>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '120px 40px', background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                            <span className="material-icons" style={{ fontSize: 48, color: '#cbd5e1', animation: 'spin 2s linear infinite' }}>sync</span>
                            <div style={{ color: '#475569', fontSize: 16, fontWeight: 600 }}>Assembling operator operational matrix...</div>
                        </div>
                        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                    </div>
                ) : searched && !stats ? (
                    <div style={{ textAlign: 'center', padding: '120px 40px', background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                            <span className="material-icons" style={{ fontSize: 48, color: '#cbd5e1' }}>person_off</span>
                            <div style={{ color: '#475569', fontSize: 16, fontWeight: 600 }}>No telemetry recorded for this operator within the specified epoch.</div>
                        </div>
                    </div>
                ) : stats && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 24, animation: 'fadeIn 0.4s ease-out' }}>
                        <div style={{ background: '#f8fafc', padding: 32, borderRadius: 12, border: '1px solid #e2e8f0', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 4, background: '#475569' }} />
                            <span style={{ fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                                <span className="material-icons" style={{ fontSize: 16 }}>book_online</span> Initialized Bookings
                            </span>
                            <span style={{ fontSize: 36, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', display: 'block', lineHeight: 1 }}>{(stats.booking_count || 0).toLocaleString()}</span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginTop: 12 }}>Itineraries generated</span>
                        </div>

                        <div style={{ background: '#f0f9ff', padding: 32, borderRadius: 12, border: '1px solid #bae6fd', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 4, background: '#0284c7' }} />
                            <span style={{ fontSize: 12, fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '.05em', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                                <span className="material-icons" style={{ fontSize: 16 }}>assignment_ind</span> Asset Assignments
                            </span>
                            <span style={{ fontSize: 36, fontWeight: 900, color: '#082f49', letterSpacing: '-0.02em', display: 'block', lineHeight: 1 }}>{(stats.assign_count || 0).toLocaleString()}</span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#0284c7', display: 'block', marginTop: 12 }}>Vehicles mapped to tasks</span>
                        </div>

                        <div style={{ background: '#f0fdf4', padding: 32, borderRadius: 12, border: '1px solid #bbf7d0', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 4, background: '#16a34a' }} />
                            <span style={{ fontSize: 12, fontWeight: 800, color: '#15803d', textTransform: 'uppercase', letterSpacing: '.05em', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                                <span className="material-icons" style={{ fontSize: 16 }}>fact_check</span> Billing Terminations
                            </span>
                            <span style={{ fontSize: 36, fontWeight: 900, color: '#14532d', letterSpacing: '-0.02em', display: 'block', lineHeight: 1 }}>{(stats.closing_count || 0).toLocaleString()}</span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#16a34a', display: 'block', marginTop: 12 }}>Trips successfully finalized</span>
                        </div>

                        <div style={{ background: '#fefce8', padding: 32, borderRadius: 12, border: '1px solid #fef08a', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 4, background: '#ca8a04' }} />
                            <span style={{ fontSize: 12, fontWeight: 800, color: '#a16207', textTransform: 'uppercase', letterSpacing: '.05em', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                                <span className="material-icons" style={{ fontSize: 16 }}>contact_phone</span> Lead Ingestions
                            </span>
                            <span style={{ fontSize: 36, fontWeight: 900, color: '#713f12', letterSpacing: '-0.02em', display: 'block', lineHeight: 1 }}>{(stats.enquiry_count || 0).toLocaleString()}</span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#ca8a04', display: 'block', marginTop: 12 }}>Pre-booking solicitations</span>
                        </div>

                        <div style={{ background: '#fef2f2', padding: 32, borderRadius: 12, border: '1px solid #fecaca', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 4, background: '#dc2626' }} />
                            <span style={{ fontSize: 12, fontWeight: 800, color: '#b91c1c', textTransform: 'uppercase', letterSpacing: '.05em', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                                <span className="material-icons" style={{ fontSize: 16 }}>cancel</span> Booking Suspensions
                            </span>
                            <span style={{ fontSize: 36, fontWeight: 900, color: '#7f1d1d', letterSpacing: '-0.02em', display: 'block', lineHeight: 1 }}>{(stats.cancel_count || 0).toLocaleString()}</span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#dc2626', display: 'block', marginTop: 12 }}>Itineraries withdrawn</span>
                        </div>
                    </div>
                )}

                <style>{`
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(8px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `}</style>
            </div>
        </div>
    );
};

export default UserActivityReport;


