import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';

const RefusalReport = () => {
    const { api } = useContext(AuthContext);
    // 1. Ensure vehicleIds state is always initialized as an empty array.
    const [vehicleIds, setVehicleIds] = useState([]);
    const [reportData, setReportData] = useState([]);
    const [filters, setFilters] = useState({
        v_id: '',
        from_date: '',
        to_date: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchVehicleIds = async () => {
            try {
                const response = await api.get('/refusal_report.php?list=true');
                // 2. Correctly handle API response and extract array data.
                const data = response.data;
                if (Array.isArray(data)) {
                    setVehicleIds(data);
                } else if (data && typeof data === 'object' && Array.isArray(data.data)) {
                    // In case it's wrapped
                    setVehicleIds(data.data);
                } else {
                    console.warn("API response for vehicle list is not an array:", data);
                    setVehicleIds([]); // 7. Add fallback empty array when data is invalid.
                }
            } catch (error) {
                console.error("Error fetching vehicle IDs", error);
                setVehicleIds([]);
            }
        };
        fetchVehicleIds();
    }, [api]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.get(`/refusal_report.php?v_id=${filters.v_id}&from_date=${filters.from_date}&to_date=${filters.to_date}`);
            // Safety check for reportData as well
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Trip Refusal Report</h1>

            <div className="bg-white shadow rounded-lg p-6 mb-8">
                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Vehicle ID</label>
                        <select
                            name="v_id"
                            value={filters.v_id}
                            onChange={handleFilterChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                        >
                            <option value="">Select Vehicle ID</option>
                            <option value="All">All</option>
                            {/* 3. Add Array.isArray safety check before calling map. */}
                            {/* 4. Prevent crash if response is null or object. */}
                            {Array.isArray(vehicleIds) && vehicleIds.map((id, index) => (
                                <option key={id || index} value={id}>{id}</option>
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">B-ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">V-ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pickup</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Drop</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {!Array.isArray(reportData) || reportData.length === 0 ? (
                            <tr><td colSpan="6" className="text-center py-4">No records found.</td></tr>
                        ) : (
                            reportData.map((record, index) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.date_refused}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.b_id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.v_id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.reason_for}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.pickup}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.drop_place}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RefusalReport;
