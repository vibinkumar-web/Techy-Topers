import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';

const RunningKMReport = () => {
    const { api } = useContext(AuthContext);
    const [vehicles, setVehicles] = useState([]);
    const [reportData, setReportData] = useState([]);
    const [filters, setFilters] = useState({
        v_id: '',
        from_date: '',
        to_date: ''
    });
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const response = await api.get('/running_km_report.php?list=true');
                setVehicles(response.data);
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
        setSearched(true);
        try {
            const response = await api.get(`/running_km_report.php?v_id=${filters.v_id}&from_date=${filters.from_date}&to_date=${filters.to_date}`);
            setReportData(response.data);
        } catch (error) {
            console.error("Error fetching report", error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate totals
    const totalRunning = reportData.reduce((acc, curr) => acc + (curr.running_km || 0), 0);
    const totalDiff = reportData.reduce((acc, curr) => acc + (curr.diff_km || 0), 0);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Running KM Report</h1>

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
                            <option value="">Select Vehicle</option>
                            <option value="All">All</option>
                            {vehicles.map((v, i) => (
                                <option key={i} value={v}>{v}</option>
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">V-ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opening KM</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Closing KM</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Running KM</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diff KM</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {searched && reportData.length === 0 ? (
                            <tr><td colSpan="6" className="text-center py-4">No records found.</td></tr>
                        ) : (
                            reportData.map((record, index) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.p_date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.v_id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.opening_km}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.closing_km}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">{record.running_km}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">{record.diff_km}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                    {reportData.length > 0 && (
                        <tfoot className="bg-gray-50">
                            <tr>
                                <th colSpan="4" className="px-6 py-3 text-right">Totals:</th>
                                <th className="px-6 py-3 text-left font-bold">{totalRunning}</th>
                                <th className="px-6 py-3 text-left font-bold">{totalDiff}</th>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        </div>
    );
};

export default RunningKMReport;
