import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';

const UserActivityReport = () => {
    const { api } = useContext(AuthContext);
    const [staff, setStaff] = useState([]);
    const [stats, setStats] = useState(null);
    const [filters, setFilters] = useState({
        user_id: '',
        from_date: '',
        to_date: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                // Ensure we have an endpoint for staff list, or reuse staff.php
                const response = await api.get('/staff.php');
                // Assuming staff.php returns array of objects with emp_id
                setStaff(response.data);
            } catch (error) {
                console.error("Error fetching staff", error);
            }
        };
        fetchStaff();
    }, [api]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.get(`/user_activity_report.php?user_id=${filters.user_id}&from_date=${filters.from_date}&to_date=${filters.to_date}`);
            setStats(response.data);
        } catch (error) {
            console.error("Error fetching stats", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Staff Activity Report</h1>

            <div className="bg-white shadow rounded-lg p-6 mb-8">
                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Staff Member</label>
                        <select
                            name="user_id"
                            value={filters.user_id}
                            onChange={handleFilterChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                            required
                        >
                            <option value="">Select Staff</option>
                            {staff.map((s) => (
                                <option key={s.id} value={s.emp_id}>{s.name} ({s.emp_id})</option>
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

            {stats && (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Booking Count</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Assign Count</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Closing Count</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Enquiry Count</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Cancel Count</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-lg font-bold text-gray-900">{stats.booking_count}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-lg font-bold text-gray-900">{stats.assign_count}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-lg font-bold text-gray-900">{stats.closing_count}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-lg font-bold text-gray-900">{stats.enquiry_count}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-lg font-bold text-gray-900">{stats.cancel_count}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default UserActivityReport;
