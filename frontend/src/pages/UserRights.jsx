import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';

const UserRights = () => {
    const { api } = useContext(AuthContext);
    const [staff, setStaff] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [permissions, setPermissions] = useState({
        booking: false,
        assigning: false,
        closing: false,
        reports: false
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const response = await api.get('/user_rights.php');
                if (Array.isArray(response.data)) {
                    setStaff(response.data);
                }
            } catch (error) {
                console.error("Error fetching staff", error);
            }
        };
        fetchStaff();
    }, [api]);

    const handleUserChange = (e) => {
        setSelectedUser(e.target.value);
        // In a real app, we would fetch existing permissions here
        // For now, reset to default or fetch if API supported it
        setPermissions({
            booking: false,
            assigning: false,
            closing: false,
            reports: false
        });
    };

    const handleCheckboxChange = (e) => {
        setPermissions({ ...permissions, [e.target.name]: e.target.checked });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/user_rights.php', {
                emp_id: selectedUser,
                permissions: permissions
            });
            setMessage('Permissions saved successfully!');
        } catch (error) {
            console.error("Save failed", error);
            setMessage('Error saving permissions.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">User Rights Management</h1>

            <div className="bg-white shadow rounded-lg p-6 max-w-2xl">
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700">Select User</label>
                    <select
                        value={selectedUser}
                        onChange={handleUserChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                    >
                        <option value="">-- Select Staff Member --</option>
                        {staff.map((s) => (
                            <option key={s.id} value={s.emp_id}>{s.name} ({s.emp_id})</option>
                        ))}
                    </select>
                </div>

                {selectedUser && (
                    <form onSubmit={handleSave}>
                        <div className="space-y-4 mb-6">
                            <h3 className="text-lg font-medium text-gray-900">Permissions</h3>

                            <div className="flex items-center">
                                <input
                                    id="booking"
                                    name="booking"
                                    type="checkbox"
                                    checked={permissions.booking}
                                    onChange={handleCheckboxChange}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label htmlFor="booking" className="ml-3 block text-sm font-medium text-gray-700">
                                    Booking Access
                                </label>
                            </div>

                            <div className="flex items-center">
                                <input
                                    id="assigning"
                                    name="assigning"
                                    type="checkbox"
                                    checked={permissions.assigning}
                                    onChange={handleCheckboxChange}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label htmlFor="assigning" className="ml-3 block text-sm font-medium text-gray-700">
                                    Assigning Access
                                </label>
                            </div>

                            <div className="flex items-center">
                                <input
                                    id="ontrip"
                                    name="closing"
                                    type="checkbox"
                                    checked={permissions.closing}
                                    onChange={handleCheckboxChange}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label htmlFor="ontrip" className="ml-3 block text-sm font-medium text-gray-700">
                                    Closing Access
                                </label>
                            </div>

                            <div className="flex items-center">
                                <input
                                    id="reports"
                                    name="reports"
                                    type="checkbox"
                                    checked={permissions.reports}
                                    onChange={handleCheckboxChange}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label htmlFor="reports" className="ml-3 block text-sm font-medium text-gray-700">
                                    View Reports
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            {loading ? 'Saving...' : 'Save Permissions'}
                        </button>
                    </form>
                )}

                {message && <p className={`mt-4 text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
            </div>
        </div>
    );
};

export default UserRights;
