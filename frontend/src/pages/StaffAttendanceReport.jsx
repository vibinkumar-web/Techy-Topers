import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const StaffAttendanceReport = () => {
    const toast = useToast();
    const { api } = useContext(AuthContext);
    const [staffIds, setStaffIds] = useState([]);
    const [reportData, setReportData] = useState([]);
    const [filters, setFilters] = useState({
        emp_id: '',
        from_date: '',
        to_date: ''
    });
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    useEffect(() => {
        const fetchStaffIds = async () => {
            try {
                const response = await api.get('/staff_report.php?list=true');
                setStaffIds(response.data);
            } catch (error) {
                console.error("Error fetching staff IDs", error);
            }
        };
        fetchStaffIds();
    }, [api]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSearched(true);
        try {
            const response = await api.get(`/staff_report.php?emp_id=${filters.emp_id}&from_date=${filters.from_date}&to_date=${filters.to_date}`);
            setReportData(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Error fetching report", error);
            setReportData([]);
        } finally {
            setLoading(false);
        }
    };

    const totalHoursDecimal = (reportData || []).reduce((acc, curr) => acc + (parseFloat(curr.duration_hours) || 0), 0);
    const totalHours = Math.floor(totalHoursDecimal);
    const totalMins = Math.round((totalHoursDecimal - totalHours) * 60);

    return (
        <div className="page-wrap">
            <div className="page-header">
                <div>
                    <div>
                        <h1>Staff List</h1>
                        <p>Staff report from and to dates login time calculation</p>
                    </div>
                </div>
            </div>

            <div className="page-body">
                <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 24, alignItems: 'flex-end', background: '#e2e8f0', padding: 16, marginBottom: 16 }}>
                    <div className="form-field" style={{ margin: 0 }}>
                        <label style={{ fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 4 }}>ID:</label>
                        <select
                            name="emp_id"
                            value={filters.emp_id}
                            onChange={handleFilterChange}
                            style={{ height: 38, fontWeight: 600 }}
                        >
                            <option value="">Select Staff ID</option>
                            <option value="All">All</option>
                            {staffIds.map(id => (
                                <option key={id} value={id}>{id}</option>
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

                <div className="table-wrap" style={{ marginTop: 24 }}>
                    <table style={{ margin: 0, fontSize: 13, borderBottom: 'none' }}>
                        <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                            <tr>
                                <th style={{ padding: '16px', fontWeight: 700, color: '#334155' }}>S.No</th>
                                <th style={{ padding: '16px', fontWeight: 700, color: '#334155' }}>Login Date</th>
                                <th style={{ padding: '16px', fontWeight: 700, color: '#334155' }}>Logout Date</th>
                                <th style={{ padding: '16px', fontWeight: 700, color: '#334155' }}>Working Hrs</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>Loading records...</td>
                                </tr>
                            ) : !searched ? (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>Select an ID to view records</td>
                                </tr>
                            ) : reportData.length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>No matching records found.</td>
                                </tr>
                            ) : (
                                reportData.map((record, index) => {
                                    const loginDate = new Date(record.login_time);
                                    const logoutDate = record.logout && record.logout !== '0000-00-00 00:00:00' ? new Date(record.logout) : null;
                                    let workingHrs = 'Active';

                                    if (logoutDate) {
                                        const diffMs = logoutDate - loginDate;
                                        const hrs = Math.floor(diffMs / 3600000);
                                        const mins = Math.floor((diffMs % 3600000) / 60000);
                                        workingHrs = `${hrs}:${mins}`;
                                    }

                                    return (
                                        <tr key={index}>
                                            <td style={{ padding: '12px 16px', fontWeight: 600, color: '#64748b' }}>{index + 1}</td>
                                            <td style={{ padding: '12px 16px' }}>
                                                {loginDate.toLocaleDateString()} {loginDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                {logoutDate ? `${logoutDate.toLocaleDateString()} ${logoutDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : '-'}
                                            </td>
                                            <td style={{ padding: '12px 16px', fontWeight: 600 }}>{workingHrs}</td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>

                    {searched && reportData.length > 0 && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', padding: '16px', fontSize: 13, background: '#fff', borderTop: '2px solid #e2e8f0' }}>
                            <div></div>
                            <div></div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                                    <span>Total Hrs:</span>
                                    <span>{`${totalHours}:${totalMins}`}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                                    <span>Total Amount:</span>
                                    <span>0</span>
                                </div>
                            </div>
                            <div style={{ paddingLeft: 40, paddingTop: 12 }}>
                                <button className="btn-primary" style={{ background: '#22c55e', padding: '8px 24px', fontSize: 13, height: 'auto' }}>Export</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StaffAttendanceReport;
