import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';

const StaffAttendance = () => {
    const { api } = useContext(AuthContext);
    const [attendanceList, setAttendanceList] = useState([]);
    const [formData, setFormData] = useState({
        id_emp: '',
        emp_name: '',
        emp_mobile: '',
        login_time: new Date().toISOString().slice(0, 16) // Format: YYYY-MM-DDTHH:mm
    });
    const [loading, setLoading] = useState(false);
    const [staffDetails, setStaffDetails] = useState(null); // For auto-filling name/mobile

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        try {
            const response = await api.get('/attendance.php');
            setAttendanceList(response.data);
        } catch (error) {
            console.error("Error fetching attendance", error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Auto-fetch staff details if ID changes (Debounce could be added)
        if (name === 'id_emp') {
            fetchStaffDetails(value);
        }
    };

    const fetchStaffDetails = async (id) => {
        if (!id) return;
        try {
            // Assuming we can re-use staff.php to get single staff details
            // Or we check `ft_staff` table. 
            // Since `staff.php` endpoint fetches all, we might filter client side or add specific endpoint.
            // For now, let's assume `staff.php?id=` logic or similar.
            // Actually, let's just use `staff.php` to get the list and find locally.
            const response = await api.get(`/staff.php?id=${id}`);
            if (response.data && response.data.emp_id) {
                setStaffDetails(response.data);
                setFormData(prev => ({
                    ...prev,
                    emp_name: response.data.name,
                    emp_mobile: response.data.mobile // Field name might differ
                }));
            }
        } catch (error) {
            // console.log("Staff not found or error");
            // validation usually happens on submit or blur
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
            alert('Staff Logged In Successfully!');
            fetchAttendance();
            setFormData({ ...formData, id_emp: '', emp_name: '', emp_mobile: '' });
        } catch (error) {
            console.error("Login Error", error);
            alert(error.response?.data?.message || 'Login Failed');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async (e) => {
        e.preventDefault();
        if (!formData.id_emp) {
            alert("Please enter Staff ID to logout");
            return;
        }
        setLoading(true);
        try {
            await api.post('/attendance.php', {
                action: 'logout',
                id_emp: formData.id_emp
            });
            alert('Staff Logged Out Successfully!');
            fetchAttendance();
            setFormData({ ...formData, id_emp: '', emp_name: '', emp_mobile: '' });
        } catch (error) {
            console.error("Logout Error", error);
            alert(error.response?.data?.message || 'Logout Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Staff Attendance</h1>

            <div className="bg-white shadow rounded-lg p-6 mb-8">
                <form className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Staff ID</label>
                        <input
                            type="text"
                            name="id_emp"
                            value={formData.id_emp}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border rounded-md shadow-sm p-2"
                            placeholder="Enter ID"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Login Time</label>
                        <input
                            type="datetime-local"
                            name="login_time"
                            value={formData.login_time}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            name="emp_name"
                            value={formData.emp_name}
                            onChange={handleInputChange}
                            className="mt-1 block w-full bg-gray-100 border rounded-md shadow-sm p-2"
                            readOnly
                        />
                    </div>

                    <div className="flex space-x-2">
                        <button
                            onClick={handleLogin}
                            disabled={loading}
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 w-full"
                        >
                            Login
                        </button>
                        <button
                            onClick={handleLogout}
                            disabled={loading}
                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 w-full"
                        >
                            Logout
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Currently Logged In</h3>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Emp ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Login Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {attendanceList.map((row) => (
                            <tr key={row.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.id_emp}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.emp_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.login_time}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.emp_mobile}</td>
                            </tr>
                        ))}
                        {attendanceList.length === 0 && (
                            <tr>
                                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">No staff currently logged in.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StaffAttendance;
