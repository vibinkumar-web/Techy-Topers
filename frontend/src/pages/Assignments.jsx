import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';

const Assignments = () => {
    const { api } = useContext(AuthContext);
    const [pendingBookings, setPendingBookings] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [selectedVehicleId, setSelectedVehicleId] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [bookingsRes, vehiclesRes] = await Promise.all([
                api.get('/assign.php'),
                api.get('/vehicles.php')
            ]);

            if (Array.isArray(bookingsRes.data)) {
                setPendingBookings(bookingsRes.data);
            } else {
                setPendingBookings([]);
            }

            if (Array.isArray(vehiclesRes.data)) {
                setVehicles(vehiclesRes.data);
            } else {
                setVehicles([]);
            }
        } catch (error) {
            console.error("Error fetching data", error);
        } finally {
            setLoading(false);
        }
    };

    const openAssignModal = (booking) => {
        setSelectedBooking(booking);
        setSelectedVehicleId('');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedBooking(null);
    };

    const handleAssign = async () => {
        if (!selectedVehicleId) return;

        try {
            await api.post('/assign.php', {
                b_id: selectedBooking.b_id,
                v_id: selectedVehicleId
            });

            // Refresh data
            const bookingsRes = await api.get('/assign.php');
            setPendingBookings(bookingsRes.data);
            closeModal();
        } catch (error) {
            console.error("Error assigning vehicle", error);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Pending Assignments</h1>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">B-ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date/Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Req. Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {Array.isArray(pendingBookings) && pendingBookings.map((booking) => (
                            <tr key={booking.b_id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.b_id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.pickup}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.b_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.p_city} to {booking.d_place}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.v_type} {booking.ac_type === '1' ? 'AC' : 'Non-AC'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button onClick={() => openAssignModal(booking)} className="text-indigo-600 hover:text-indigo-900 font-bold bg-indigo-100 px-3 py-1 rounded">Assign</button>
                                </td>
                            </tr>
                        ))}
                        {pendingBookings.length === 0 && (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">No pending assignments.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && selectedBooking && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
                    <div className="bg-white p-5 rounded-lg shadow-xl w-full max-w-lg">
                        <h2 className="text-xl font-bold mb-4">Assign Vehicle to Booking #{selectedBooking.b_id}</h2>

                        <div className="mb-4">
                            <p className="text-sm text-gray-600"><strong>Customer:</strong> {selectedBooking.b_name}</p>
                            <p className="text-sm text-gray-600"><strong>Route:</strong> {selectedBooking.p_city} to {selectedBooking.d_place}</p>
                            <p className="text-sm text-gray-600"><strong>Required:</strong> {selectedBooking.v_type}</p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Select Vehicle</label>
                            <select
                                value={selectedVehicleId}
                                onChange={(e) => setSelectedVehicleId(e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm border p-2"
                            >
                                <option value="">-- Choose Vehicle --</option>
                                {Array.isArray(vehicles) && vehicles.map(v => (
                                    <option key={v.v_id} value={v.v_id}>
                                        {v.v_no} - {v.v_brand} {v.v_model} ({v.d_name})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                            <button onClick={closeModal} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
                            <button
                                onClick={handleAssign}
                                disabled={!selectedVehicleId}
                                className={`px-4 py-2 rounded-md text-white ${!selectedVehicleId ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                            >
                                Confirm Assignment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Assignments;
