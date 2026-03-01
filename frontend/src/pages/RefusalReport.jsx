import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const RefusalReport = () => {
    const toast = useToast();
    const { api } = useContext(AuthContext);
    const [vehicleIds, setVehicleIds] = useState([]);
    const [reportData, setReportData] = useState([]);
    const [filters, setFilters] = useState({
        v_id: '',
        from_date: '',
        to_date: ''
    });
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    useEffect(() => {
        const fetchVehicleIds = async () => {
            try {
                const response = await api.get('/refusal_report.php?list=true');
                const data = response.data;
                if (Array.isArray(data)) {
                    setVehicleIds(data);
                } else if (data && typeof data === 'object' && Array.isArray(data.data)) {
                    setVehicleIds(data.data);
                } else {
                    setVehicleIds([]);
                }
            } catch (error) {
                console.error("Error fetching vehicle IDs", error);
                setVehicleIds([]);
            }
        };
        fetchVehicleIds();
    }, [api]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSearched(true);
        try {
            const response = await api.get(`/refusal_report.php?v_id=${filters.v_id}&from_date=${filters.from_date}&to_date=${filters.to_date}`);
            if (Array.isArray(response.data)) {
                setReportData(Array.isArray(response.data) ? response.data : []);
            } else {
                setReportData([]);
            }
        } catch (error) {
            console.error("Error fetching report", error);
            setReportData([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-wrap">
            <div className="page-header">
                <div>
                    <div>
                        <h1>Asset Rejection Log</h1>
                        <p>Evaluate booking refusals mapped by vehicle node</p>
                    </div>
                </div>
            </div>

            <div className="page-body">
                <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 1.5fr) 1fr 1fr auto', gap: 24, alignItems: 'flex-end', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 24, marginBottom: 32, boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' }}>
                    <div className="form-field" style={{ margin: 0 }}>
                        <label style={{ fontSize: 13, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>Target Asset Node</label>
                        <div className="input-with-icon">
                            <span className="material-icons" style={{ color: '#023149' }}>directions_car</span>
                            <select
                                name="v_id"
                                value={filters.v_id}
                                onChange={handleFilterChange}
                                style={{ height: 48, fontWeight: 700 }}
                            >
                                <option value="">Select Asset Hash</option>
                                <option value="All">Global Matrix (All)</option>
                                {Array.isArray(vehicleIds) && vehicleIds.map((id, index) => (
                                    <option key={id || index} value={id}>{id}</option>
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
                        style={{ height: 48, padding: '0 32px', background: '#c5111a', opacity: loading ? 0.7 : 1, cursor: loading ? 'wait' : 'pointer', fontSize: 15 }}
                        onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#7d0907'; }}
                        onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#c5111a'; }}
                    >
                        <span className="material-icons" style={{ fontSize: 20 }}>block</span>
                        {loading ? 'Evaluating...' : 'Query Rejections'}
                    </button>
                </form>

                <div className="table-wrap" style={{ background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)', overflow: 'hidden' }}>
                    <table style={{ margin: 0 }}>
                        <thead style={{ background: '#f8fafc' }}>
                            <tr>
                                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em' }}>Timestamp Vector</th>
                                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em' }}>Booking Ref</th>
                                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em' }}>Asset Identity</th>
                                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em', minWidth: 200 }}>Rejection Heuristic</th>
                                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em' }}>Origin Interface</th>
                                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em' }}>Target Interface</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '60px 40px', color: '#6b7280' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                                            <span className="material-icons" style={{ fontSize: 32, color: '#cbd5e1' }}>sync</span>
                                            <div>Querying asset rejection records...</div>
                                        </div>
                                    </td>
                                </tr>
                            ) : !searched ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '60px 40px', color: '#6b7280' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                                            <span className="material-icons" style={{ fontSize: 32, color: '#cbd5e1' }}>date_range</span>
                                            <div>Declare temporal boundaries to initiate heuristic query.</div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (!Array.isArray(reportData) || reportData.length === 0) ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '60px 40px', color: '#6b7280' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                                            <span className="material-icons" style={{ fontSize: 32, color: '#cbd5e1' }}>verified</span>
                                            <div>No anomalous rejections detected for designated parameters.</div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                reportData.map((record, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '12px 24px', fontWeight: 600, color: '#475569', fontSize: 13 }}>{record.date_refused}</td>
                                        <td style={{ padding: '12px 24px', fontWeight: 800, color: '#023149', fontFamily: 'monospace', fontSize: 13 }}>#{record.b_id}</td>
                                        <td style={{ padding: '12px 24px', fontWeight: 800, color: '#023149', fontSize: 14 }}>{record.v_id}</td>
                                        <td style={{ padding: '12px 24px' }}>
                                            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '6px 12px', borderRadius: 6, fontSize: 13, fontWeight: 600, display: 'inline-block' }}>
                                                {record.reason_for}
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px 24px', color: '#475569', fontSize: 13 }}>{record.pickup}</td>
                                        <td style={{ padding: '12px 24px', color: '#475569', fontSize: 13 }}>{record.drop_place}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RefusalReport;

