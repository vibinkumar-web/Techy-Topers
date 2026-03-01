import { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const EnquiryReport = () => {
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
            const response = await api.get(`/enquiry_report.php?from_date=${filters.from_date}&to_date=${filters.to_date}`);
            if (Array.isArray(response.data)) {
                setReportData(response.data);
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
                        <h1>Inbound Lead Telemetry</h1>
                        <p>Evaluate pre-booking solicitations and prospect ingress</p>
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
                        <span className="material-icons" style={{ fontSize: 20 }}>contact_phone</span>
                        {loading ? 'Evaluating...' : 'Query Lead Volume'}
                    </button>
                </form>

                <div className="table-wrap" style={{ background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)', overflow: 'hidden' }}>
                    <table style={{ margin: 0 }}>
                        <thead style={{ background: '#f8fafc' }}>
                            <tr>
                                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em' }}>Timestamp Vector</th>
                                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em' }}>Prospect Hash</th>
                                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em' }}>Telecom Protocol</th>
                                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em' }}>Initial Vector</th>
                                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em' }}>Target Terminus</th>
                                <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em' }}>Ingesting Auth</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '60px 40px', color: '#6b7280' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                                            <span className="material-icons" style={{ fontSize: 32, color: '#cbd5e1' }}>sync</span>
                                            <div>Querying prospect database...</div>
                                        </div>
                                    </td>
                                </tr>
                            ) : !searched ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '60px 40px', color: '#6b7280' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                                            <span className="material-icons" style={{ fontSize: 32, color: '#cbd5e1' }}>date_range</span>
                                            <div>Declare temporal boundaries to initiate heuristic search.</div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (!Array.isArray(reportData) || reportData.length === 0) ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '60px 40px', color: '#6b7280' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                                            <span className="material-icons" style={{ fontSize: 32, color: '#cbd5e1' }}>search_off</span>
                                            <div>No leads mapped in the specified epoch.</div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                reportData.map((record, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '12px 24px', fontWeight: 600, color: '#475569', fontSize: 13 }}>{record.b_date}</td>
                                        <td style={{ padding: '12px 24px', color: '#023149', fontWeight: 800 }}>{record.b_name}</td>
                                        <td style={{ padding: '12px 24px', fontWeight: 600, color: '#475569', fontSize: 13 }}>{record.m_no}</td>
                                        <td style={{ padding: '12px 24px', color: '#334155', fontSize: 13 }}>{record.p_city}</td>
                                        <td style={{ padding: '12px 24px', color: '#334155', fontSize: 13 }}>{record.d_place}</td>
                                        <td style={{ padding: '12px 24px', fontStyle: 'italic', color: '#64748b', fontSize: 13 }}>{record.entry_by || record.user_id}</td>
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

export default EnquiryReport;
