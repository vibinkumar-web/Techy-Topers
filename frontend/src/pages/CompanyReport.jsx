import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';

const CompanyReport = () => {
    const { api } = useContext(AuthContext);
    const [companies, setCompanies] = useState([]);
    const [reportData, setReportData] = useState([]);
    const [filters, setFilters] = useState({
        company: '',
        from_date: '',
        to_date: ''
    });
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const response = await api.get('/company_report.php?list=true');
                setCompanies(response.data);
            } catch (error) {
                console.error("Error fetching companies", error);
            }
        };
        fetchCompanies();
    }, [api]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSearched(true);
        try {
            const response = await api.get(`/company_report.php?company=${filters.company}&from_date=${filters.from_date}&to_date=${filters.to_date}`);
            setReportData(response.data);
        } catch (error) {
            console.error("Error fetching report", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Company Wise Report</h1>

            <div className="bg-white shadow rounded-lg p-6 mb-8">
                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Company Name</label>
                        <select
                            name="company"
                            value={filters.company}
                            onChange={handleFilterChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                        >
                            <option value="">Select Company</option>
                            <option value="All">All</option>
                            {companies.map((c, i) => (
                                <option key={i} value={c}>{c}</option>
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trip ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle No</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total KM</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amt</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {searched && reportData.length === 0 ? (
                            <tr><td colSpan="6" className="text-center py-4">No records found.</td></tr>
                        ) : (
                            reportData.map((record, index) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.trip_id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.vechile_no}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.guest_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.total_km}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">{record.total_amt}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {reportData.length > 0 && (
                <div className="mt-4 text-right font-bold text-xl">
                    Grand Total: {reportData.reduce((acc, curr) => acc + (parseFloat(curr.total_amt) || 0), 0).toFixed(2)}
                </div>
            )}
        </div>
    );
};

export default CompanyReport;
