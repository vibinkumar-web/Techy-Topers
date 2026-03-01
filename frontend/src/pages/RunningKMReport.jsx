import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const RunningKMReport = () => {
    const toast = useToast();
    const { api } = useContext(AuthContext);
    const [vehicles, setVehicles] = useState([]);
    const [reportData, setReportData] = useState([]);
    const [filters, setFilters] = useState({
        v_id: '',
        from_date: '',
        to_date: ''
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const response = await api.get('/running_km_report.php?list=true');
                setVehicles(response.data);
            } catch (error) {
                console.error("Error fetching vehicles", error);
            }
        };
        fetchVehicles();
        const today = new Date().toISOString().split('T')[0];
        setFilters(prev => ({ ...prev, from_date: today, to_date: today }));
    }, [api]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSearched(true);
        try {
            const response = await api.get(`/running_km_report.php?v_id=${filters.v_id}&from_date=${filters.from_date}&to_date=${filters.to_date}`);
            setReportData(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Error fetching report", error);
            setReportData([]);
        } finally {
            setLoading(false);
        }
    };

    // Filter by vehicle
    const filteredData = reportData.filter(record =>
        (record.v_id || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="page-wrap">
            <div className="page-header">
                <div>
                    <div>
                        <h1>Running KM Report</h1>
                        <p>Veh id running kms and different kms by date wise</p>
                    </div>
                </div>
            </div>

            <div className="page-body">
                <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 1.5fr) 1fr 1fr auto', gap: 24, alignItems: 'flex-end', background: '#e2e8f0', padding: 16, marginBottom: 16 }}>
                    <div className="form-field" style={{ margin: 0 }}>
                        <label style={{ fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 4 }}>Name: / Select ID</label>
                        <select
                            name="v_id"
                            value={filters.v_id}
                            onChange={handleFilterChange}
                            style={{ height: 38, fontWeight: 600 }}
                        >
                            <option value="">Select ID</option>
                            <option value="All">All Associated Vehicles</option>
                            {vehicles.map((v, i) => (
                                <option key={i} value={v}>{v}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-field" style={{ margin: 0 }}>
                        <label style={{ fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 4 }}>From:</label>
                        <input
                            type="date"
                            name="from_date"
                            value={filters.from_date}
                            onChange={handleFilterChange}
                            required
                            style={{ height: 38, fontWeight: 600 }}
                        />
                    </div>
                    <div className="form-field" style={{ margin: 0 }}>
                        <label style={{ fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 4 }}>To:</label>
                        <input
                            type="date"
                            name="to_date"
                            value={filters.to_date}
                            onChange={handleFilterChange}
                            required
                            style={{ height: 38, fontWeight: 600 }}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                        style={{ height: 38, padding: '0 24px', background: '#0ea5e9' }}
                    >
                        Search
                    </button>
                </form>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' }}>
                    <select style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 4, background: '#fff' }}>
                        <option>Export Basic</option>
                        <option>Export PDF</option>
                        <option>Export Excel</option>
                    </select>

                    <input
                        type="text"
                        placeholder="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: 4, width: 220, fontSize: 13 }}
                    />
                </div>

                <div className="table-wrap">
                    <table style={{ margin: 0, fontSize: 12 }}>
                        <thead style={{ background: '#f8fafc' }}>
                            <tr>
                                <th style={{ width: 40, textAlign: 'center' }}><input type="checkbox" /></th>
                                <th>V-ID</th>
                                <th style={{ textAlign: 'right' }}>Opening KM</th>
                                <th style={{ textAlign: 'right' }}>Closing KM</th>
                                <th style={{ textAlign: 'right' }}>Running KM</th>
                                <th style={{ textAlign: 'right' }}>Diff KM</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>Loading records...</td>
                                </tr>
                            ) : !searched ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>No matching records found</td>
                                </tr>
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>No odometer records found for this timeframe.</td>
                                </tr>
                            ) : (
                                filteredData.map((record, index) => (
                                    <tr key={index}>
                                        <td style={{ textAlign: 'center' }}><input type="checkbox" /></td>
                                        <td style={{ fontWeight: 800, color: '#023149', fontSize: 13 }}>{record.v_id}</td>
                                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{record.opening_km}</td>
                                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{record.closing_km}</td>
                                        <td style={{ textAlign: 'right', fontWeight: 800 }}>{parseFloat(record.running_km).toFixed(1)}</td>
                                        <td style={{ textAlign: 'right', fontWeight: 800, color: parseFloat(record.diff_km) > 0 ? '#b91c1c' : '#15803d' }}>
                                            {parseFloat(record.diff_km).toFixed(1)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {searched && filteredData.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '16px 0', fontSize: 13, color: '#64748b' }}>
                        No matching records found
                    </div>
                )}
            </div>
        </div>
    );
};

export default RunningKMReport;
