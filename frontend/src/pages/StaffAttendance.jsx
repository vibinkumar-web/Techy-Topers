import { useState, useEffect, useContext } from 'react';
import { useToast } from '../context/ToastContext';

        

        

import AuthContext from '../context/AuthContext';
const StaffAttendance = () => {
    const toast = useToast();
const { api } = useContext(AuthContext);
    const [attendanceList, setAttendanceList] = useState([]);
    const [formData, setFormData] = useState({
        id_emp: '',
        emp_name: '',
        emp_mobile: '',
        login_time: new Date().toISOString().slice(0, 16) // Format: YYYY-MM-DDTHH:mm
    });
    const [loading, setLoading] = useState(false);
    const [staffDetails, setStaffDetails] = useState(null);
    const [salaryData, setSalaryData] = useState(null);

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        try {
            const response = await api.get('/attendance.php');
            setAttendanceList(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Error fetching attendance", error);
        }
    };

    
        
const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === 'id_emp') {
            fetchStaffDetails(value);
        }
    };

    const fetchStaffDetails = async (id) => {
        if (!id) {
            setSalaryData(null);
            setStaffDetails(null);
            return;
        }
        try {
            const [staffRes, salaryRes] = await Promise.all([
                api.get(`/staff.php?id=${id}`),
                api.get(`/staff_report.php?action=salary_summary&emp_id=${id}`)
            ]);

            if (staffRes.data && staffRes.data.emp_id) {
                setStaffDetails(staffRes.data);
                setFormData(prev => ({
                    ...prev,
                    emp_name: staffRes.data.name,
                    emp_mobile: staffRes.data.mobile
                }));
            }
            if (salaryRes.data && salaryRes.data.total_duration) {
                setSalaryData(salaryRes.data);
            }
        } catch (error) {
            console.error("Error fetching staff details or salary info", error);
            setSalaryData(null);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/attendance.php', {
                action: 'login',
                ...formData
            });
            toast('Staff Logged In Successfully!');
            fetchAttendance();
            setFormData({ ...formData, id_emp: '', emp_name: '', emp_mobile: '' });
        } catch (error) {
            console.error("Login Error", error);
            toast(error.response?.data?.message || 'Login Failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async (e) => {
        e.preventDefault();
        if (!formData.id_emp) {
            toast("Please enter Staff ID to logout", 'warning');
            return;
        }
        setLoading(true);
        try {
            const response = await api.post('/attendance.php', {
                action: 'logout',
                id_emp: formData.id_emp
            });
            const successMsg = response.data.duration_message
                ? `${response.data.message}\n\n${response.data.duration_message}`
                : response.data.message || 'Staff Logged Out Successfully!';
            toast(successMsg);
            fetchAttendance();
            fetchStaffDetails(formData.id_emp); // refresh salary metrics instantly
            setFormData({ ...formData, id_emp: '', emp_name: '', emp_mobile: '' });
        } catch (error) {
            console.error("Logout Error", error);
            toast(error.response?.data?.message || 'Logout Failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-wrap">
            <div className="page-header">
                <div>
                    <div>
                        <h1>Staff Attendance</h1>
                        <p>Track employee login and logout times</p>
                    </div>
                </div>
            </div>

            <div className="page-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

                    <div className="section" style={{ padding: 24, maxWidth: 1000 }}>
                        <h3 style={{ margin: '0 0 24px', fontSize: 16, fontWeight: 800, color: '#023149', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #fdf6e8', paddingBottom: 12 }}>
                            <span className="material-icons" style={{ color: '#c5111a', fontSize: 20 }}>fingerprint</span>
                            Record Attendance
                        </h3>
                        <form style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, alignItems: 'flex-end' }}>
                            <div className="form-field" style={{ margin: 0 }}>
                                <label>Staff ID <span style={{ color: '#c5111a' }}>*</span></label>
                                <input
                                    type="text"
                                    name="id_emp"
                                    value={formData.id_emp}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter Staff ID..."
                                />
                            </div>
                            <div className="form-field" style={{ margin: 0, gridColumn: 'span 2' }}>
                                <label>Staff Name (Auto-fill)</label>
                                <input
                                    type="text"
                                    name="emp_name"
                                    value={formData.emp_name}
                                    readOnly
                                    style={{ background: '#f8fafc', color: '#6b7280', border: '1px solid #e2e8f0' }}
                                    placeholder="Will appear automatically..."
                                />
                            </div>
                            <div className="form-field" style={{ margin: 0 }}>
                                <label>Login Details</label>
                                <input
                                    type="datetime-local"
                                    name="login_time"
                                    value={formData.login_time}
                                    onChange={handleChange}
                                    style={{ fontSize: 13 }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: 12, height: 48 }}>
                                <button
                                    type="button"
                                    onClick={handleLogin}
                                    disabled={loading}
                                    className="btn-primary"
                                    style={{ flex: 1, padding: 0, background: '#c5111a', border: 'none', borderRadius: 8, opacity: loading ? 0.7 : 1, cursor: loading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#7d0907'}
                                    onMouseLeave={e => e.currentTarget.style.background = '#c5111a'}
                                    title="Clock In"
                                >
                                    <span className="material-icons" style={{ fontSize: 24, fontWeight: 'bold' }}>login</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    disabled={loading}
                                    className="btn-primary"
                                    style={{ flex: 1, padding: 0, background: '#c5111a', border: 'none', borderRadius: 8, opacity: loading ? 0.7 : 1, cursor: loading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#7d0907'}
                                    onMouseLeave={e => e.currentTarget.style.background = '#c5111a'}
                                    title="Clock Out"
                                >
                                    <span className="material-icons" style={{ fontSize: 24, fontWeight: 'bold' }}>logout</span>
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Salary / Monthly Hours Widget */}
                    {salaryData && (
                        <div className="section" style={{ background: '#f0f9ff', padding: 24, border: '1px solid #bae6fd', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 8 }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: 13, fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>
                                    Current Month Salary Hours
                                </h3>
                                <p style={{ margin: 0, fontSize: 14, color: '#0c4a6e', fontWeight: 600 }}>
                                    Staff ID: <span style={{ fontFamily: 'monospace' }}>{formData.id_emp}</span> ({formData.emp_name})
                                </p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 32, fontWeight: 900, color: '#0284c7', lineHeight: 1 }}>
                                    {salaryData.total_duration}
                                </div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: '#0ea5e9', marginTop: 4 }}>
                                    {salaryData.total_decimal} Decimal Hours
                                </div>
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: salaryData ? '1fr 1fr' : '1fr', gap: 32 }}>
                        {/* Active Logins Table */}
                        <div className="table-wrap" style={{ margin: 0 }}>
                            <div style={{ background: '#fdf6e8', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e8d4aa' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span className="material-icons" style={{ color: '#023149', fontSize: 18 }}>how_to_reg</span>
                                    <h2 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#023149', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                                        Active Logins
                                    </h2>
                                </div>
                            </div>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Emp ID</th>
                                        <th>Employee Name</th>
                                        <th>Login Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendanceList.map((row) => (
                                        <tr key={row.id}>
                                            <td style={{ fontWeight: 700, color: '#023149', fontFamily: 'monospace' }}>{row.id_emp}</td>
                                            <td style={{ fontWeight: 600 }}>{row.emp_name}</td>
                                            <td>{row.login_time}</td>
                                        </tr>
                                    ))}
                                    {attendanceList.length === 0 && (
                                        <tr>
                                            <td colSpan="3" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                                                No staff members are currently clocked in.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Recent History Table (Visible when querying a user) */}
                        {salaryData && (
                            <div className="table-wrap" style={{ margin: 0 }}>
                                <div style={{ background: '#f8fafc', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span className="material-icons" style={{ color: '#475569', fontSize: 18 }}>history</span>
                                        <h2 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                                            Recent Shifts (This Month)
                                        </h2>
                                    </div>
                                </div>
                                <table style={{ tableLayout: 'fixed' }}>
                                    <thead>
                                        <tr>
                                            <th>Login Time</th>
                                            <th>Logout Time</th>
                                            <th style={{ textAlign: 'right' }}>Duration</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {salaryData.shifts.map((shift, i) => (
                                            <tr key={i}>
                                                <td style={{ fontSize: 13 }}>{shift.login_time}</td>
                                                <td style={{ fontSize: 13, color: '#64748b' }}>{shift.logout === '0000-00-00 00:00:00' ? 'Active' : shift.logout}</td>
                                                <td style={{ textAlign: 'right', fontWeight: 700, color: '#0284c7', fontSize: 13 }}>{shift.duration_formatted}</td>
                                            </tr>
                                        ))}
                                        {salaryData.shifts.length === 0 && (
                                            <tr>
                                                <td colSpan="3" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                                                    No shifts recorded this month.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default StaffAttendance;

