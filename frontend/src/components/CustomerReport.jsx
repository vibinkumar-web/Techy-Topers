import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';

const CustomerReport = () => {
    const { api } = useContext(AuthContext);
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState('All');
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCustomers();
        fetchReport();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchCustomers = async () => {
        try {
            const response = await api.get('/reports.php?type=customers_list');
            setCustomers(response.data);
        } catch (error) {
            console.error("Error fetching customers list", error);
        }
    };

    const fetchReport = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/reports.php?type=customer&customer=${encodeURIComponent(selectedCustomer)}`);
            setReportData(response.data);
        } catch (error) {
            console.error("Error fetching customer report", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchReport();
    };

    return (
        <div style={{ padding: 32 }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: 24, alignItems: 'flex-end', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 24, marginBottom: 32, boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' }}>
                <div className="form-field" style={{ flex: 1, margin: 0 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>Target Customer Profile</label>
                    <div className="input-with-icon">
                        <span className="material-icons" style={{ color: '#023149' }}>person</span>
                        <select
                            value={selectedCustomer}
                            onChange={(e) => setSelectedCustomer(e.target.value)}
                            style={{ height: 48, fontWeight: 700 }}
                        >
                            <option value="All">All Registered Customers Array</option>
                            {customers.map((name, index) => (
                                <option key={index} value={name}>{name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <button type="submit" className="btn-primary" style={{ height: 48, padding: '0 32px', background: '#c5111a', fontSize: 15 }} onMouseEnter={e => e.currentTarget.style.background = '#7d0907'} onMouseLeave={e => e.currentTarget.style.background = '#c5111a'}>
                    <span className="material-icons" style={{ fontSize: 20 }}>manage_search</span>
                    Execute Query
                </button>
            </form>

            <div className="table-wrap" style={{ background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)', overflow: 'hidden' }}>
                <table style={{ margin: 0 }}>
                    <thead style={{ background: '#f8fafc' }}>
                        <tr>
                            <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em' }}>Booking Ref</th>
                            <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em' }}>Customer Profile</th>
                            <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em' }}>Telecom Hash</th>
                            <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em' }}>Origin Sector</th>
                            <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em' }}>Destination Sector</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '60px 40px', color: '#6b7280' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                                        <span className="material-icons" style={{ fontSize: 32, color: '#cbd5e1' }}>sync</span>
                                        <div>Querying remote dataset...</div>
                                    </div>
                                </td>
                            </tr>
                        ) : reportData.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '60px 40px', color: '#6b7280' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                                        <span className="material-icons" style={{ fontSize: 32, color: '#cbd5e1' }}>find_in_page</span>
                                        <div>No records matched the current query heuristic.</div>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            reportData.map((row) => (
                                <tr key={row.b_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '16px 24px', fontWeight: 800, color: '#023149', fontFamily: 'monospace', fontSize: 13 }}>#{row.b_id}</td>
                                    <td style={{ padding: '16px 24px', fontWeight: 700, color: '#334155' }}>{row.b_name}</td>
                                    <td style={{ padding: '16px 24px', fontWeight: 600, color: '#475569', fontSize: 13 }}>{row.m_no}</td>
                                    <td style={{ padding: '16px 24px', color: '#475569', fontSize: 13 }}>{row.p_city}</td>
                                    <td style={{ padding: '16px 24px', color: '#475569', fontSize: 13 }}>{row.d_place}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CustomerReport;
