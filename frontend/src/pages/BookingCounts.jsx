import { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const BookingCounts = () => {
    const toast = useToast();
    const { api } = useContext(AuthContext);
    const [stats, setStats] = useState(null);
    const [filters, setFilters] = useState({
        from_date: '',
        to_date: ''
    });
    const [loading, setLoading] = useState(false);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.get(`/booking_counts.php?from_date=${filters.from_date}&to_date=${filters.to_date}`);
            setStats(response.data);
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
                        <h1>Itinerary Throughput Telemetry</h1>
                        <p>Evaluate macro-level booking saturation across disparate nodal states</p>
                    </div>
                </div>
            </div>

            <div className="page-body">
                <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 24, alignItems: 'flex-end', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 24, marginBottom: 32, boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' }}>
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
                        style={{ height: 48, padding: '0 32px', opacity: loading ? 0.7 : 1, cursor: loading ? 'wait' : 'pointer', fontSize: 15 }}
                    >
                        <span className="material-icons" style={{ fontSize: 20 }}>query_stats</span>
                        {loading ? 'Compiling...' : 'Execute Analysis'}
                    </button>
                </form>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '120px 40px', background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                            <span className="material-icons" style={{ fontSize: 48, color: '#cbd5e1', animation: 'spin 2s linear infinite' }}>sync</span>
                            <div style={{ color: '#475569', fontSize: 16, fontWeight: 600 }}>Aggregating global workflow matrix...</div>
                        </div>
                        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                    </div>
                ) : !stats ? (
                    <div style={{ textAlign: 'center', padding: '120px 40px', background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                            <span className="material-icons" style={{ fontSize: 48, color: '#cbd5e1' }}>date_range</span>
                            <div style={{ color: '#475569', fontSize: 16, fontWeight: 600 }}>Declare temporal boundaries to initiate heuristic search.</div>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, animation: 'fadeIn 0.4s ease-out' }}>
                        <div style={{ background: '#f8fafc', padding: 32, borderRadius: 12, border: '1px solid #e2e8f0', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 4, background: '#475569' }} />
                            <span style={{ fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                                <span className="material-icons" style={{ fontSize: 16 }}>book_online</span> Global Ingestions
                            </span>
                            <span style={{ fontSize: 48, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', display: 'block', lineHeight: 1 }}>{(stats.total || 0).toLocaleString()}</span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b', display: 'block', marginTop: 12 }}>Total recorded itineraries</span>
                        </div>

                        <div style={{ background: '#eff6ff', padding: 32, borderRadius: 12, border: '1px solid #bfdbfe', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 4, background: '#2563eb' }} />
                            <span style={{ fontSize: 12, fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '.05em', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                                <span className="material-icons" style={{ fontSize: 16 }}>navigation</span> Active Execution
                            </span>
                            <span style={{ fontSize: 48, fontWeight: 900, color: '#1e3a8a', letterSpacing: '-0.02em', display: 'block', lineHeight: 1 }}>{(stats.ontrip || 0).toLocaleString()}</span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#2563eb', display: 'block', marginTop: 12 }}>Currently en-route assets</span>
                        </div>

                        <div style={{ background: '#f0fdf4', padding: 32, borderRadius: 12, border: '1px solid #bbf7d0', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 4, background: '#16a34a' }} />
                            <span style={{ fontSize: 12, fontWeight: 800, color: '#15803d', textTransform: 'uppercase', letterSpacing: '.05em', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                                <span className="material-icons" style={{ fontSize: 16 }}>task_alt</span> Terminated (Billed)
                            </span>
                            <span style={{ fontSize: 48, fontWeight: 900, color: '#14532d', letterSpacing: '-0.02em', display: 'block', lineHeight: 1 }}>{(stats.closed || 0).toLocaleString()}</span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#16a34a', display: 'block', marginTop: 12 }}>Successfully resolved items</span>
                        </div>

                        <div style={{ background: '#fef2f2', padding: 32, borderRadius: 12, border: '1px solid #fecaca', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 4, background: '#dc2626' }} />
                            <span style={{ fontSize: 12, fontWeight: 800, color: '#b91c1c', textTransform: 'uppercase', letterSpacing: '.05em', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                                <span className="material-icons" style={{ fontSize: 16 }}>cancel</span> Suspended Tasks
                            </span>
                            <span style={{ fontSize: 48, fontWeight: 900, color: '#7f1d1d', letterSpacing: '-0.02em', display: 'block', lineHeight: 1 }}>{(stats.cancelled || 0).toLocaleString()}</span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#dc2626', display: 'block', marginTop: 12 }}>Withdrawn/abandoned</span>
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

export default BookingCounts;
