import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';

const CompanyReport = () => {
    const { api } = useContext(AuthContext);
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState('All');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totals, setTotals] = useState({ amount: 0 });

    useEffect(() => {
        fetchCompanies();
        const today = new Date().toISOString().split('T')[0];
        setFromDate(today);
        setToDate(today);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchCompanies = async () => {
        try {
            const response = await api.get('/reports.php?type=company_list');
            setCompanies(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Error fetching company list", error);
        }
    };

    const fetchReport = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/reports.php?type=company&company=${encodeURIComponent(selectedCompany)}&from_date=${fromDate}&to_date=${toDate}`);
            setReportData(Array.isArray(response.data) ? response.data : []);
            calculateTotals(response.data);
        } catch (error) {
            console.error("Error fetching company report", error);
        } finally {
            setLoading(false);
        }
    };

    const calculateTotals = (data) => {
        const totalAmount = data.reduce((sum, item) => sum + (parseFloat(item.net_total) || 0), 0);
        setTotals({ amount: totalAmount });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchReport();
    };

    return (
        <div style={{ padding: 32 }}>
            <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 2fr) 1fr 1fr auto', gap: 24, alignItems: 'flex-end', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 24, marginBottom: 32, boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' }}>
                <div className="form-field" style={{ margin: 0 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>Corporate Sub-Entity Filter</label>
                    <div className="input-with-icon">
                        <span className="material-icons" style={{ color: '#023149' }}>domain</span>
                        <select value={selectedCompany} onChange={(e) => setSelectedCompany(e.target.value)} style={{ height: 48, fontWeight: 700 }}>
                            <option value="All">All Associated Corporations</option>
                            {companies.map((name, index) => (
                                <option key={index} value={name}>{name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="form-field" style={{ margin: 0 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>Origin Epoch</label>
                    <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={{ height: 48, fontWeight: 600, color: '#0f172a' }} />
                </div>
                <div className="form-field" style={{ margin: 0 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>Terminus Epoch</label>
                    <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} style={{ height: 48, fontWeight: 600, color: '#0f172a' }} />
                </div>
                <button type="submit" className="btn-primary" style={{ height: 48, padding: '0 32px', background: '#0284c7', fontSize: 15 }} onMouseEnter={e => e.currentTarget.style.background = '#0369a1'} onMouseLeave={e => e.currentTarget.style.background = '#0284c7'}>
                    <span className="material-icons" style={{ fontSize: 20 }}>corporate_fare</span>
                    Digest
                </button>
            </form>

            <div className="table-wrap" style={{ background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)', overflow: 'hidden', marginBottom: 32 }}>
                <table style={{ margin: 0 }}>
                    <thead style={{ background: '#f8fafc' }}>
                        <tr>
                            <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em' }}>Booking Ref</th>
                            <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em' }}>Timestamp Log</th>
                            <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em' }}>Asset Vector</th>
                            <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em' }}>Transit Path (Origin &rarr; Node)</th>
                            <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em', textAlign: 'right' }}>Distance (KM)</th>
                            <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em', textAlign: 'right' }}>Capital Gain (₹)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '60px 40px', color: '#6b7280' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                                        <span className="material-icons" style={{ fontSize: 32, color: '#cbd5e1' }}>sync</span>
                                        <div>Querying remote dataset...</div>
                                    </div>
                                </td>
                            </tr>
                        ) : reportData.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '60px 40px', color: '#6b7280' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                                        <span className="material-icons" style={{ fontSize: 32, color: '#cbd5e1' }}>history_toggle_off</span>
                                        <div>No corporate records matched constraints.</div>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            reportData.map((row) => (
                                <tr key={row.b_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '12px 24px', fontWeight: 800, color: '#023149', fontFamily: 'monospace', fontSize: 13 }}>#{row.b_id}</td>
                                    <td style={{ padding: '12px 24px', color: '#475569', fontSize: 13, fontWeight: 600 }}>{row.bookin_time}</td>
                                    <td style={{ padding: '12px 24px' }}>
                                        <div style={{ fontWeight: 800, color: '#023149', fontSize: 14 }}>{row.v_id}</div>
                                        <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>{row.v_type}</div>
                                    </td>
                                    <td style={{ padding: '12px 24px', color: '#334155', fontSize: 13 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{ fontWeight: 600 }}>{row.picup_place}</span>
                                            <span className="material-icons" style={{ fontSize: 16, color: '#94a3b8' }}>arrow_right_alt</span>
                                            <span style={{ fontWeight: 600 }}>{row.drop_place}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px 24px', textAlign: 'right', fontWeight: 700, color: '#475569', fontSize: 14 }}>{parseFloat(row.closing_km || 0) - parseFloat(row.opening_km || 0)}</td>
                                    <td style={{ padding: '12px 24px', textAlign: 'right', fontWeight: 800, color: '#0ea5e9', fontSize: 15 }}>₹ {parseFloat(row.net_total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {!loading && reportData.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 32, borderTop: '2px dashed #cbd5e1', animation: 'fadeIn 0.4s ease-out' }}>
                    <div style={{ background: '#f0f9ff', padding: 32, borderRadius: 12, border: '1px solid #bae6fd', position: 'relative', overflow: 'hidden', minWidth: 400 }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 6, background: '#0284c7' }} />
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span className="material-icons" style={{ fontSize: 18 }}>account_balance</span>
                            Corporate Gross Yield
                        </p>
                        <h2 style={{ margin: 0, fontSize: 36, fontWeight: 900, color: '#082f49', letterSpacing: '-0.02em' }}>₹ {totals.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
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
    );
};

export default CompanyReport;
