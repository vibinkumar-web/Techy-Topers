import { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const DayWiseReport = () => {
    const toast = useToast();
    const { api } = useContext(AuthContext);
    const [reportData, setReportData] = useState([]);
    const [filters, setFilters] = useState({
        from_date: '',
        to_date: ''
    });
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSearched(true);
        try {
            const response = await api.get(`/day_wise_report.php?from_date=${filters.from_date}&to_date=${filters.to_date}`);
            setReportData(response.data);
        } catch (error) {
            console.error("Error fetching report", error);
        } finally {
            setLoading(false);
        }
    };

    const totalRevenue = (reportData || []).reduce((acc, curr) => acc + (parseFloat(curr.total_amt) || 0), 0);

    return (
        <div className="page-wrap">
            <div className="page-header">
                <div>
                    <div>
                        <h1>Chronological Business Digest</h1>
                        <p>Evaluate daily macro-revenue ingestion and operational payload</p>
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
                        <span className="material-icons" style={{ fontSize: 20 }}>analytics</span>
                        {loading ? 'Compiling...' : 'Execute Analysis'}
                    </button>
                </form>

                <div className="table-wrap" style={{ background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)', overflow: 'hidden' }}>
                    <table style={{ margin: 0 }}>
                        <thead style={{ background: '#f8fafc' }}>
                            <tr>
                                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em' }}>Timestamp Vector</th>
                                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em' }}>Booking Ref</th>
                                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em' }}>Asset Identity</th>
                                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em' }}>Client Corp</th>
                                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em' }}>Passenger Name</th>
                                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em', textAlign: 'right' }}>Capital Yield (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '60px 40px', color: '#6b7280' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                                            <span className="material-icons" style={{ fontSize: 32, color: '#cbd5e1' }}>sync</span>
                                            <div>Aggregating temporal sequence...</div>
                                        </div>
                                    </td>
                                </tr>
                            ) : searched && reportData.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '60px 40px', color: '#6b7280' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                                            <span className="material-icons" style={{ fontSize: 32, color: '#cbd5e1' }}>event_busy</span>
                                            <div>No telemetry recorded for this timeframe.</div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                reportData.map((record, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '12px 24px', fontWeight: 600, color: '#475569', fontSize: 13 }}>{record.date}</td>
                                        <td style={{ padding: '12px 24px', color: '#023149', fontFamily: 'monospace', fontWeight: 800, fontSize: 13 }}>#{record.trip_id}</td>
                                        <td style={{ padding: '12px 24px', fontWeight: 700, color: '#334155' }}>{record.vechile_no}</td>
                                        <td style={{ padding: '12px 24px', color: '#475569', fontSize: 13 }}>{record.company_name}</td>
                                        <td style={{ padding: '12px 24px', color: '#475569', fontSize: 13 }}>{record.guest_name}</td>
                                        <td style={{ padding: '12px 24px', textAlign: 'right', fontWeight: 800, color: '#15803d', fontSize: 15 }}>₹ {parseFloat(record.total_amt).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    </tr>
                                ))
                            )}
                            {!searched && !loading && (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '60px 40px', color: '#6b7280' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                                            <span className="material-icons" style={{ fontSize: 32, color: '#cbd5e1' }}>date_range</span>
                                            <div>Declare temporal boundaries to initiate analysis.</div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading && reportData.length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 32, animation: 'fadeIn 0.4s ease-out' }}>
                        <div style={{ background: '#f0fdf4', padding: '24px 32px', borderRadius: 12, border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: 24, position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 6, background: '#166534' }} />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <span style={{ fontSize: 13, fontWeight: 800, color: '#15803d', textTransform: 'uppercase', letterSpacing: '.05em', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span className="material-icons" style={{ fontSize: 18 }}>price_check</span>
                                    Gross Chronological Yield
                                </span>
                            </div>
                            <span style={{ fontSize: 36, fontWeight: 900, color: '#14532d', letterSpacing: '-0.02em' }}>
                                ₹ {totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default DayWiseReport;
