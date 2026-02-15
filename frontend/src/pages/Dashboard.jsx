import { useEffect, useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';

const Dashboard = () => {
    const { user, api } = useContext(AuthContext);
    const [stats, setStats] = useState(null);
    const [activity, setActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await api.get('/dashboard.php');
                if (response.data) {
                    setStats(response.data.stats);
                    setActivity(response.data.recent_activity);
                }
            } catch (error) {
                console.error("Error fetching dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchDashboardData();
        }
    }, [user, api]);

    if (loading) {
        return <div className="text-center mt-10">Loading dashboard...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="mt-2 text-sm text-gray-600">
                    Welcome back, <span className="font-semibold text-indigo-600">{user?.name}</span>
                </p>
            </header>

            {stats && (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <dt className="text-sm font-medium text-gray-500 truncate">Total Bookings</dt>
                            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.bookings}</dd>
                        </div>
                    </div>
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.pending}</dd>
                        </div>
                    </div>
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.completed}</dd>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h3>
                </div>
                <ul className="divide-y divide-gray-200">
                    {activity.map((item) => (
                        <li key={item.id}>
                            <div className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-indigo-600 truncate">{item.action}</p>
                                    <div className="ml-2 flex-shrink-0 flex">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {item.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                    {activity.length === 0 && (
                        <li className="px-4 py-4 sm:px-6 text-center text-gray-500">No recent activity.</li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default Dashboard;
