import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';

const StaffAttendanceReport = () => {
    const { api } = useContext(AuthContext);
    const [staffIds, setStaffIds] = useState([]);
    const [reportData, setReportData] = useState([]);
    const [filters, setFilters] = useState({
        emp_id: '',
        from_date: '',
        to_date: ''
    });
    const [loading, setLoading] = useState(false);

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
        try {
            const response = await api.get(`/staff_report.php?emp_id=${filters.emp_id}&from_date=${filters.from_date}&to_date=${filters.to_date}`);
            setReportData(response.data);
        } catch (error) {
            console.error("Error fetching report", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Staff Attendance Report</h1>

            <div className="bg-white shadow rounded-lg p-6 mb-8">
                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Staff ID</label>
                        <select
                            name="emp_id"
                            value={filters.emp_id}
                            onChange={handleFilterChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                        >
                            <option value="">Select Staff ID</option>
                            <option value="All">All</option>
                            {staffIds.map(id => (
                                <option key={id} value={id}>{id}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">From Date</label>
                        <input
                            type="date"
                            name="from_date"
                            value={filters.from_date}
                            onChange={handleFilterChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">To Date</label>
                        <input
                            type="date"
                            name="to_date"
                            value={filters.to_date}
                            onChange={handleFilterChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                    >
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </form>
            </div>

            <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Login Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logout Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {reportData.length === 0 ? (
                            <tr><td colSpan="4" className="text-center py-4">No records found.</td></tr>
                        ) : (
                            reportData.map((record, index) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.id_emp}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.login_time}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.logout}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.duration}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {reportData.length > 0 && (
                <div className="mt-4 text-right font-bold">
                    Total Hours: {reportData.reduce((acc, curr) => acc + (curr.duration_hours || 0), 0).toFixed(2)}
                </div>
            )}
        </div>
    );
};

export default StaffAttendanceReport;
