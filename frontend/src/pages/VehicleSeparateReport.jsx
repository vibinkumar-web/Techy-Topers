import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const VehicleSeparateReport = () => {
    const toast = useToast();
    const { api } = useContext(AuthContext);
    const [vehicles, setVehicles] = useState([]);
    const [reportData, setReportData] = useState(null);
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
                    setVehicles(Array.isArray(response.data) ? response.data : []);
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
            const response = await api.get(`/vehicle_separate_report.php?v_id=${filters.v_id}&from_date=${filters.from_date}&to_date=${filters.to_date}`);
            setReportData(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Error fetching report", error);
        } finally {
            setLoading(false);
        }
    };

    // Filter by Booking ID
    const filteredTrips = reportData?.trips ? reportData.trips.filter(trip =>
        (trip.b_id || trip.bid || '').toString().toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    return (
        <div className="page-wrap">
            <div className="page-header">
                <div>
                    <div>
                        <h1>Vehicle Report</h1>
                        <p>Vehicle report for select by ID and date & time: total no of trips, amount, customer, and trip city details</p>
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

                {searched && reportData && (
                    <div style={{ display: 'flex', gap: 24, marginBottom: 16, alignItems: 'center' }}>
                        <input
                            type="text"
                            placeholder="Search for Booking ID.."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 4, width: 220, fontSize: 13 }}
                        />
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>Total Amount: <span style={{ color: '#0f172a' }}>{reportData.totals?.net_total || 0}</span></div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>Call Center Fees: <span style={{ color: '#0f172a' }}>{0}</span></div>
                    </div>
                )}

                <div className="table-wrap">
                    <table style={{ margin: 0, fontSize: 12 }}>
                        <thead style={{ background: '#f8fafc' }}>
                            <tr>
                                <th>S.No</th>
                                <th>B-ID</th>
                                <th>V-Type</th>
                                <th>V-ID</th>
                                <th>Customer</th>
                                <th>Mobile</th>
                                <th>Pickup City</th>
                                <th>Drop City</th>
                                <th>Pickup Time</th>
                                <th>Closing Time</th>
                                <th style={{ textAlign: 'right' }}>Opening KM</th>
                                <th style={{ textAlign: 'right' }}>Closing KM</th>
                                <th style={{ textAlign: 'right' }}>Total KMs</th>
                                <th style={{ textAlign: 'right' }}>Amount</th>
                                <th style={{ textAlign: 'right' }}>PAmount By</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="15" style={{ textAlign: 'center', padding: '40px' }}>Loading report data...</td>
                                </tr>
                            ) : !searched ? (
                                <tr>
                                    <td colSpan="15" style={{ textAlign: 'center', padding: '40px' }}>No data available in table</td>
                                </tr>
                            ) : filteredTrips.length === 0 ? (
                                <tr>
                                    <td colSpan="15" style={{ textAlign: 'center', padding: '40px' }}>No data available in table</td>
                                </tr>
                            ) : (
                                filteredTrips.map((trip, index) => {
                                    const totalKms = (trip.closing_km || 0) - (trip.opening_km || 0);
                                    return (
                                        <tr key={index}>
                                            <td style={{ fontWeight: 600, color: '#64748b' }}>{index + 1}</td>
                                            <td style={{ fontWeight: 700, color: '#023149' }}>{trip.b_id || trip.bid}</td>
                                            <td>{trip.v_type}</td>
                                            <td style={{ fontWeight: 600 }}>{trip.v_id}</td>
                                            <td style={{ fontWeight: 600 }}>{trip.customer}</td>
                                            <td>{trip.m_no}</td>
                                            <td>{trip.picup_place}</td>
                                            <td>{trip.drop_place}</td>
                                            <td style={{ whiteSpace: 'nowrap' }}>{trip.pickup_time || trip.p_date}</td>
                                            <td style={{ whiteSpace: 'nowrap' }}>{trip.drop_time || trip.d_date}</td>
                                            <td style={{ textAlign: 'right', fontWeight: 600 }}>{trip.opening_km}</td>
                                            <td style={{ textAlign: 'right', fontWeight: 600 }}>{trip.closing_km}</td>
                                            <td style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>{totalKms}</td>
                                            <td style={{ textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>{trip.net_total}</td>
                                            <td style={{ textAlign: 'right' }}>{trip.paid_amount}</td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                    <div style={{ padding: '12px 16px', fontSize: 12, color: '#64748b', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                        Showing {filteredTrips.length} entries
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VehicleSeparateReport;


