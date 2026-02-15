import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';

const VehicleReport = () => {
    const { api } = useContext(AuthContext);
    const [vehicles, setVehicles] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState('All');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totals, setTotals] = useState({ amount: 0, fees: 0 });

    useEffect(() => {
        fetchVehicles();
        // default date range: today
        const today = new Date().toISOString().split('T')[0];
        setFromDate(today);
        setToDate(today);
    }, []);

    const fetchVehicles = async () => {
        try {
            const response = await api.get('/reports.php?type=vehicles_list');
            setVehicles(response.data);
        } catch (error) {
            console.error("Error fetching vehicle list", error);
        }
    };

    const fetchReport = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/reports.php?type=vehicle&v_id=${selectedVehicle}&from_date=${fromDate}&to_date=${toDate}`);
            setReportData(response.data);
            calculateTotals(response.data);
        } catch (error) {
            console.error("Error fetching vehicle report", error);
        } finally {
            setLoading(false);
        }
    };

    const calculateTotals = (data) => {
        const totalAmount = data.reduce((sum, item) => sum + (parseFloat(item.net_total) || 0), 0);
        const fees = totalAmount * 0.10; // 10% Call Center Fees
        setTotals({ amount: totalAmount, fees: fees });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchReport();
    };

    return (
        <div>
            <form onSubmit={handleSearch} className="mb-6 bg-white p-4 rounded shadow grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle ID</label>
                    <select
                        value={selectedVehicle}
                        onChange={(e) => setSelectedVehicle(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm border p-2"
                    >
                        <option value="All">All Vehicles</option>
                        {vehicles.map((vid, index) => (
                            <option key={index} value={vid}>{vid}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                    <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm border p-2"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                    <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm border p-2"
                    />
                </div>
                <button
                    type="submit"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                    Search
                </button>
            </form>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg overflow-x-auto mb-6">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">B-ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total KM</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-center">Loading...</td>
                            </tr>
                        ) : reportData.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-center">No records found.</td>
                            </tr>
                        ) : (
                            reportData.map((row) => (
                                <tr key={row.b_id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.b_id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.bookin_time}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.v_type} ({row.v_id})</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.picup_place} to {row.drop_place}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {(parseFloat(row.closing_km) - parseFloat(row.opening_km)).toFixed(1)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{row.net_total}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="bg-gray-100 p-4 rounded shadow flex justify-end gap-8 text-lg">
                <div className="font-bold">Total Amount: <span className="text-green-600">₹{totals.amount.toFixed(2)}</span></div>
                <div className="font-bold">Call Center Fees (10%): <span className="text-red-600">₹{totals.fees.toFixed(2)}</span></div>
            </div>
        </div>
    );
};

export default VehicleReport;
