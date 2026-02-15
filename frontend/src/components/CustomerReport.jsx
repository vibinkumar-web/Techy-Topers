import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';

const CustomerReport = () => {
    const { api } = useContext(AuthContext);
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState('All');
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCustomers();
        fetchReport();
    }, []);

    const fetchCustomers = async () => {
        try {
            const response = await api.get('/reports.php?type=customers_list');
            setCustomers(response.data);
        } catch (error) {
            console.error("Error fetching customers list", error);
        }
    };

    const fetchReport = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/reports.php?type=customer&customer=${selectedCustomer}`);
            setReportData(response.data);
        } catch (error) {
            console.error("Error fetching customer report", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchReport();
    };

    return (
        <div>
            <form onSubmit={handleSearch} className="mb-6 bg-white p-4 rounded shadow flex items-end gap-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Customer</label>
                    <select
                        value={selectedCustomer}
                        onChange={(e) => setSelectedCustomer(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm border p-2"
                    >
                        <option value="All">All Customers</option>
                        {customers.map((name, index) => (
                            <option key={index} value={name}>{name}</option>
                        ))}
                    </select>
                </div>
                <button
                    type="submit"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                    Search
                </button>
            </form>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">B-ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pickup City</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Drop Place</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center">Loading...</td>
                            </tr>
                        ) : reportData.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center">No records found.</td>
                            </tr>
                        ) : (
                            reportData.map((row) => (
                                <tr key={row.b_id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.b_id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.b_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.m_no}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.p_city}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.d_place}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CustomerReport;
