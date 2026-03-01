import { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const CustomerReport = () => {
    const toast = useToast();
    const { api } = useContext(AuthContext);
    const [reportData, setReportData] = useState([]);
    const [filters, setFilters] = useState({
        from_date: new Date().toISOString().split('T')[0],
        to_date: new Date().toISOString().split('T')[0]
    });
    const [searchTerm, setSearchTerm] = useState('');
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
            const response = await api.get(`/customer_report.php?from_date=${filters.from_date}&to_date=${filters.to_date}`);
            setReportData(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Error fetching report", error);
            setReportData([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredData = reportData.filter(record =>
        (record.bid || '').toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="page-wrap">
            <div className="page-header">
                <div>
                    <div>
                        <h1>Customer Report</h1>
                        <p>Customer date by specific dates</p>
                    </div>
                </div>
            </div>

            <div className="page-body">
                <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 1fr) 1fr auto', gap: 24, alignItems: 'flex-end', background: '#e2e8f0', padding: 16, marginBottom: 16 }}>
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
                    <div style={{ marginBottom: 16 }}>
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
                    <table style={{ margin: 0, fontSize: 12 }}>
                        <thead style={{ background: '#f8fafc' }}>
                            <tr>
                                <th>S.No</th>
                                <th>Date</th>
                                <th>B-ID</th>
                                <th>Customer</th>
                                <th>Mobile</th>
                                <th>Pickup City</th>
                                <th>Drop City</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>Loading records...</td>
                                </tr>
                            ) : !searched ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>No records found. Setup a search and click the Search button to begin!</td>
                                </tr>
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>No customer records found for this timeframe.</td>
                                </tr>
                            ) : (
                                filteredData.map((record, index) => (
                                    <tr key={index}>
                                        <td style={{ fontWeight: 600, color: '#64748b' }}>{index + 1}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{record.p_date}</td>
                                        <td style={{ fontWeight: 800, color: '#023149' }}>{record.bid}</td>
                                        <td style={{ fontWeight: 700 }}>{record.customer}</td>
                                        <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{record.m_no}</td>
                                        <td>{record.picup_place || 'City'}</td>
                                        <td>{record.drop_place || 'City'}</td>
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

export default CustomerReport;
