import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';

const VehicleSeparateReport = () => {
    const { api } = useContext(AuthContext);
    const [vehicles, setVehicles] = useState([]);
    const [reportData, setReportData] = useState(null);
    const [filters, setFilters] = useState({
        v_id: '',
        from_date: '',
        to_date: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const response = await api.get('/vehicles.php');
                if (Array.isArray(response.data)) {
                    setVehicles(response.data);
                }
            } catch (error) {
                console.error("Error fetching vehicles", error);
            }
        };
        fetchVehicles();
    }, [api]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.get(`/vehicle_separate_report.php?v_id=${filters.v_id}&from_date=${filters.from_date}&to_date=${filters.to_date}`);
            setReportData(response.data);
        } catch (error) {
            console.error("Error fetching report", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Vehicle Separate Report</h1>

            <div className="bg-white shadow rounded-lg p-6 mb-8">
                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Vehicle</label>
                        <select
                            name="v_id"
                            value={filters.v_id}
                            onChange={handleFilterChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                            required
                        >
                            <option value="">Select Vehicle</option>
                            {vehicles.map((v) => (
                                <option key={v.v_id} value={v.v_id}>{v.v_name} ({v.v_no})</option>
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
                        {loading ? 'Generating...' : 'Generate Report'}
                    </button>
                </form>
            </div>

            {reportData && (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Summary Totals
                        </h3>
                        <div className="mt-2 grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div className="bg-white p-3 rounded shadow-sm">
                                <span className="text-xs text-gray-500 block">Total KM</span>
                                <span className="font-bold text-lg">{reportData.totals.running_km}</span>
                            </div>
                            <div className="bg-white p-3 rounded shadow-sm">
                                <span className="text-xs text-gray-500 block">Net Total</span>
                                <span className="font-bold text-lg">₹{reportData.totals.net_total}</span>
                            </div>
                            <div className="bg-white p-3 rounded shadow-sm">
                                <span className="text-xs text-gray-500 block">Paid</span>
                                <span className="font-bold text-lg text-green-600">₹{reportData.totals.paid_amount}</span>
                            </div>
                            <div className="bg-white p-3 rounded shadow-sm">
                                <span className="text-xs text-gray-500 block">Pending</span>
                                <span className="font-bold text-lg text-red-600">₹{reportData.totals.pending_amount}</span>
                            </div>
                            <div className="bg-white p-3 rounded shadow-sm">
                                <span className="text-xs text-gray-500 block">Discount</span>
                                <span className="font-bold text-lg">₹{reportData.totals.discount}</span>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">B-ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opening</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Closing</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">KM</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {reportData.trips.map((trip, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trip.p_date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trip.b_id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{trip.opening_km}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{trip.closing_km}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 small-caps font-semibold">{trip.closing_km - trip.opening_km}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trip.net_total}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{trip.paid_amount}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                                            {trip.net_total > trip.paid_amount ? (trip.net_total - trip.paid_amount) : 0}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VehicleSeparateReport;
