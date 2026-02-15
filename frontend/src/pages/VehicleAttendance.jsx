import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';

const VehicleAttendance = () => {
    const { api } = useContext(AuthContext);
    const [vehicles, setVehicles] = useState([]);
    const [attendanceList, setAttendanceList] = useState([]);
    const [filters, setFilters] = useState({
        v_id: '',
        from_date: new Date().toISOString().split('T')[0],
        to_date: new Date().toISOString().split('T')[0]
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchVehicles();
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
        if (!filters.v_id) {
            alert("Please select a Vehicle ID");
            return;
        }
        setLoading(true);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Vehicle Attendance Report</h1>

            <div className="bg-white shadow rounded-lg p-6 mb-8">
                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Vehicle ID</label>
                        <select
                            name="v_id"
                            value={filters.v_id}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border rounded-md shadow-sm p-2"
                            required
                        >
                            <option value="">Select Vehicle</option>
                            {vehicles.map((v, index) => (
                                <option key={index} value={v.id_emp}>{v.id_emp}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">From Date</label>
                        <input
                            type="date"
                            name="from_date"
                            value={filters.from_date}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border rounded-md shadow-sm p-2"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">To Date</label>
                        <input
                            type="date"
                            name="to_date"
                            value={filters.to_date}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border rounded-md shadow-sm p-2"
                            required
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 w-full"
                        >
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Login Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logout Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {attendanceList.map((row, index) => (
                            <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.login_time}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.logout}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {row.hrsp_day ? `${row.hrsp_day} hrs ${row.minscalc || 0} mins` : '-'}
                                </td>
                            </tr>
                        ))}
                        {attendanceList.length === 0 && !loading && (
                            <tr>
                                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">No records found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default VehicleAttendance;
