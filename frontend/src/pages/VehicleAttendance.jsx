import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const VehicleAttendance = () => {
    const toast = useToast();
    const { api } = useContext(AuthContext);
    const [vehicles, setVehicles] = useState([]);
    const [attendanceList, setAttendanceList] = useState([]);
    const [filters, setFilters] = useState({
        v_id: '',
        from_date: new Date().toISOString().split('T')[0],
        to_date: new Date().toISOString().split('T')[0]
    });
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    useEffect(() => {
        fetchVehicles();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchVehicles = async () => {
        try {
            const response = await api.get('/vehicle_attendance.php?v_id=list');
            setVehicles(response.data || []);
        } catch (error) {
            console.error("Error fetching vehicles", error);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSearched(true);
        try {
            const response = await api.get(`/vehicle_attendance.php?v_id=${filters.v_id}&from_date=${filters.from_date}&to_date=${filters.to_date}`);
            setAttendanceList(response.data || []);
        } catch (error) {
            console.error("Error fetching attendance", error);
            setAttendanceList([]);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFilters({ ...filters, [name]: value });
    };

    return (
        <div className="page-wrap">
            <div className="page-header">
                <div>
                    <div>
                        <h1>Vehicle Attendance Log</h1>
                        <p>Veh id login & logout time & total login hrs</p>
                    </div>
                </div>
            </div>

            <div className="page-body">
                <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 1.5fr) 1fr 1fr auto', gap: 24, alignItems: 'flex-end', background: '#e2e8f0', padding: 16, marginBottom: 16 }}>
                    <div className="form-field" style={{ margin: 0 }}>
                        <label style={{ fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 4 }}>ID:</label>
                        <select
                            name="v_id"
                            value={filters.v_id}
                            onChange={handleInputChange}
                            required
                            style={{ height: 38, fontWeight: 600 }}
                        >
                            <option value="">Select ID</option>
                            <option value="All">All</option>
                            {vehicles.map((v, index) => (
                                <option key={index} value={v.id_emp}>{v.id_emp}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-field" style={{ margin: 0 }}>
                        <label style={{ fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 4 }}>From:</label>
                        <input
                            type="date"
                            name="from_date"
                            value={filters.from_date}
                            onChange={handleInputChange}
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
                            onChange={handleInputChange}
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
                    <div style={{ padding: '0 16px', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 16 }}>
                        Total Amount:
                    </div>
                )}

                <div className="table-wrap">
                    <table style={{ margin: 0, fontSize: 13, borderBottom: 'none' }}>
                        <thead style={{ background: '#f8fafc' }}>
                            <tr>
                                <th>S.No</th>
                                <th>Veh ID</th>
                                <th>Name</th>
                                <th>Mobile</th>
                                <th>Login Date</th>
                                <th>Logout Date</th>
                                <th>Login Hrs</th>
                                <th style={{ textAlign: 'right' }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>Loading records...</td>
                                </tr>
                            ) : !searched ? (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>No matching records found</td>
                                </tr>
                            ) : attendanceList.length === 0 ? (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>No attendance records found.</td>
                                </tr>
                            ) : (
                                attendanceList.map((row, index) => {
                                    const loginDate = new Date(row.login_time);
                                    const logoutDate = row.logout && row.logout !== '0000-00-00 00:00:00' ? new Date(row.logout) : null;
                                    let activeDuration = 'Active';

                                    if (logoutDate) {
                                        const diffMs = logoutDate - loginDate;
                                        const hrs = Math.floor(diffMs / 3600000);
                                        const mins = Math.floor((diffMs % 3600000) / 60000);
                                        activeDuration = `${hrs}:${mins}`;
                                    }

                                    return (
                                        <tr key={index}>
                                            <td style={{ fontWeight: 600, color: '#64748b' }}>{index + 1}</td>
                                            <td style={{ fontWeight: 800, color: '#023149' }}>{row.v_id || row.id_emp}</td>
                                            <td style={{ fontWeight: 700 }}>{row.name || 'Agent'}</td>
                                            <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{row.m_no || 'Mobile'}</td>
                                            <td style={{ whiteSpace: 'nowrap' }}>
                                                {loginDate.toLocaleDateString()} {loginDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td style={{ whiteSpace: 'nowrap' }}>
                                                {logoutDate ? `${logoutDate.toLocaleDateString()} ${logoutDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : '-'}
                                            </td>
                                            <td style={{ fontWeight: 600, color: '#0f172a' }}>{activeDuration}</td>
                                            <td style={{ textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>0</td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                {searched && attendanceList.length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 24 }}>
                        <button className="btn-primary" style={{ background: '#22c55e', padding: '8px 32px', fontSize: 13, height: 'auto' }}>Export</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VehicleAttendance;
