import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const CompanyReport = () => {
    const toast = useToast();
    const { api } = useContext(AuthContext);
    const [companies, setCompanies] = useState([]);
    const [reportData, setReportData] = useState([]);
    const [filters, setFilters] = useState({
        company: '',
        from_date: '',
        to_date: ''
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const response = await api.get('/company_report.php?list=true');
                setCompanies(response.data);
            } catch (error) {
                console.error("Error fetching companies", error);
            }
        };
        fetchCompanies();
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
            const response = await api.get(`/company_report.php?company=${filters.company}&from_date=${filters.from_date}&to_date=${filters.to_date}`);
            setReportData(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Error fetching report", error);
            setReportData([]);
        } finally {
            setLoading(false);
        }
    };

    // Filter logic
    const filteredData = reportData.filter(record =>
        (record.guest_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.trip_id || '').toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalAmount = filteredData.reduce((acc, curr) => acc + (parseFloat(curr.total_amt) || 0), 0);

    return (
        <div className="page-wrap">
            <div className="page-header">
                <div>
                    <div>
                        <h1>Company Wise Report</h1>
                        <p>Company wise report by date and export the file (pdf)</p>
                    </div>
                </div>
            </div>

            <div className="page-body">
                <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 1.5fr) 1fr 1fr auto', gap: 24, alignItems: 'flex-end', background: '#e2e8f0', padding: 16, marginBottom: 16 }}>
                    <div className="form-field" style={{ margin: 0 }}>
                        <label style={{ fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 4 }}>Name: / Select Company Name</label>
                        <select
                            name="company"
                            value={filters.company}
                            onChange={handleFilterChange}
                            style={{ height: 38, fontWeight: 600 }}
                        >
                            <option value="">Select Company Name</option>
                            <option value="All">All</option>
                            {companies.map((c, i) => (
                                <option key={i} value={c}>{c}</option>
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
                    <table style={{ margin: 0, fontSize: 12, borderBottom: 'none' }}>
                        <thead style={{ background: '#f8fafc' }}>
                            <tr>
                                <th style={{ width: 40, textAlign: 'center' }}><input type="checkbox" /></th>
                                <th>B-ID</th>
                                <th>B-Name</th>
                                <th>Pickup Date</th>
                                <th>Drop Date</th>
                                <th>Pickup City</th>
                                <th>Drop City</th>
                                <th>V-Type</th>
                                <th>V-ID</th>
                                <th style={{ textAlign: 'right' }}>Total KMs</th>
                                <th style={{ textAlign: 'right' }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="11" style={{ textAlign: 'center', padding: '40px' }}>Loading records...</td>
                                </tr>
                            ) : !searched ? (
                                <tr>
                                    <td colSpan="11" style={{ textAlign: 'center', padding: '40px' }}>No records found. Setup a search and click the Search button to begin!</td>
                                </tr>
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan="11" style={{ textAlign: 'center', padding: '40px' }}>No company records found for this timeframe.</td>
                                </tr>
                            ) : (
                                filteredData.map((record, index) => (
                                    <tr key={index}>
                                        <td style={{ textAlign: 'center' }}><input type="checkbox" /></td>
                                        <td style={{ fontWeight: 800, color: '#023149' }}>{record.trip_id}</td>
                                        <td style={{ fontWeight: 600 }}>{record.guest_name}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{record.date}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{record.date}</td>
                                        <td>{record.pickup_city || 'City'}</td>
                                        <td>{record.drop_city || 'City'}</td>
                                        <td>{record.v_type || 'Vehicle'}</td>
                                        <td style={{ fontWeight: 700 }}>{record.vechile_no}</td>
                                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{record.total_km}</td>
                                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>{record.total_amt}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                        <tfoot style={{ background: '#f8fafc', fontWeight: 700 }}>
                            <tr>
                                <td><input type="checkbox" /></td>
                                <td colSpan="8"></td>
                                <td style={{ textAlign: 'right', color: '#64748b' }}>Total Amount:</td>
                                <td style={{ textAlign: 'right', color: '#023149', fontSize: 13 }}>{totalAmount.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {searched && filteredData.length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 24 }}>
                        <button className="btn-primary" style={{ background: '#22c55e', padding: '8px 32px', fontSize: 13, height: 'auto' }}>Export</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompanyReport;
