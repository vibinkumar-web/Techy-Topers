import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ShortageKMReport = () => {
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
                const response = await api.get('/vehicles.php');
                if (Array.isArray(response.data)) {
                    setVehicles(response.data);
                }
            } catch (error) {
                console.error("Error fetching vehicles", error);
            }
        };
        fetchVehicles();
    }, [api]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSearched(true);
        try {
            const response = await api.get(`/shortage_km_report.php?v_id=${filters.v_id}&from_date=${filters.from_date}&to_date=${filters.to_date}`);
            setReportData(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Error fetching report", error);
            setReportData([]);
        } finally {
            setLoading(false);
        }
    };

    // Filter by Booking ID
    const filteredTrips = reportData.filter(trip =>
        (trip.b_id || '').toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="page-wrap">
            <div className="page-header">
                <div>
                    <div>
                        <h1>Shortage KM Report</h1>
                        <p>Need to calculate every trip closing and next trip opening difference. Can view by date</p>
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
                            required
                            style={{ height: 38, fontWeight: 600 }}
                        >
                            <option value="">Select ID</option>
                            {vehicles.map((v) => (
                                <option key={v.v_id} value={v.v_id}>{v.v_name} ({v.v_no})</option>
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

                {searched && (
                    <div style={{ display: 'flex', gap: 24, marginBottom: 16, alignItems: 'center' }}>
                        <input
                            type="text"
                            placeholder="Search for Booking ID.."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 4, width: 220, fontSize: 13 }}
                        />
                    </div>
                )}

                <div className="table-wrap">
                    <table style={{ margin: 0, fontSize: 13 }}>
                        <thead style={{ background: '#f8fafc' }}>
                            <tr>
                                <th>S.No</th>
                                <th>V-ID</th>
                                <th>Booking-ID</th>
                                <th style={{ textAlign: 'right' }}>Prev Closing KM</th>
                                <th style={{ textAlign: 'right' }}>Next Opening KM</th>
                                <th style={{ textAlign: 'right', color: '#b91c1c' }}>Shortage KM</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>Loading gap analysis...</td>
                                </tr>
                            ) : !searched ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>No data available in table</td>
                                </tr>
                            ) : filteredTrips.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>No discrepancies or data found in this timeframe.</td>
                                </tr>
                            ) : (
                                filteredTrips.map((gap, index) => (
                                    <tr key={index}>
                                        <td style={{ fontWeight: 600, color: '#64748b' }}>{index + 1}</td>
                                        <td style={{ fontWeight: 700, color: '#023149' }}>{gap.v_no}</td>
                                        <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>#{gap.b_id}</td>
                                        <td style={{ textAlign: 'right', fontWeight: 600, color: '#64748b' }}>{gap.prev_closing_km}</td>
                                        <td style={{ textAlign: 'right', fontWeight: 600, color: '#64748b' }}>{gap.curr_opening_km}</td>
                                        <td style={{ textAlign: 'right', fontWeight: 800, color: '#dc2626' }}>{gap.shortage_km}</td>
                                        <td style={{ whiteSpace: 'nowrap', color: '#475569' }}>{gap.date} {gap.time}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    <div style={{ padding: '12px 16px', fontSize: 12, color: '#64748b', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                        Showing {filteredTrips.length} entries of unaccounted distance
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShortageKMReport;
