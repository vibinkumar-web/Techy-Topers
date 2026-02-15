import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AssignLater = () => {
    const { api, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [drivers, setDrivers] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const driversRes = await api.get('/assign_later.php?action=drivers');
            const bookingsRes = await api.get('/assign_later.php?action=bookings');
            setDrivers(driversRes.data);
            setBookings(bookingsRes.data);
        } catch (error) {
            console.error("Error fetching data", error);
        }
    };

    const handleAssign = async () => {
        if (!selectedBooking || !selectedDriver) return;

        if (!window.confirm(`Assign Booking ${selectedBooking.b_id} to Driver ${selectedDriver.id_emp}?`)) return;

        setLoading(true);
        try {
            const payload = {
                id: selectedBooking.id, // Primary Key
                b_id: selectedBooking.b_id,
                pickup: selectedBooking.pickup,
                p_city: selectedBooking.p_city,
                d_place: selectedBooking.d_place,
                driver_id: selectedDriver.id_emp,
                v_type: selectedDriver.v_type || selectedBooking.v_type, // Use driver's type or booking's request
                v_no: selectedDriver.v_no || 'Unknown',
                d_mobile: selectedDriver.emp_mobile,
                b_name: selectedBooking.b_name,
                m_no: selectedBooking.m_no,
                t_type: selectedBooking.t_type,
                ac_type: selectedBooking.ac_type,
                to_whom: selectedBooking.to_whom,
                user_id: user?.id || 0,
                r_status: selectedBooking.r_status || ''
            };

            await api.post('/assign_later.php', payload);
            alert('Assignment Successful!');
            fetchData(); // Refresh
            setSelectedBooking(null);
            setSelectedDriver(null);
        } catch (error) {
            console.error("Assignment failed", error);
            alert('Assignment Failed: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const filteredDrivers = drivers.filter(d =>
        d.id_emp.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.emp_mobile.includes(searchTerm)
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Assign Pending Bookings</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Bookings List */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-medium mb-4">Pending Bookings</h2>
                    <div className="overflow-y-auto max-h-96">
                        {bookings.length === 0 ? (
                            <p className="text-gray-500">No pending bookings.</p>
                        ) : (
                            <ul className="divide-y divide-gray-200">
                                {bookings.map(b => (
                                    <li
                                        key={b.id}
                                        className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedBooking?.id === b.id ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''}`}
                                        onClick={() => setSelectedBooking(b)}
                                    >
                                        <div className="flex justify-between">
                                            <span className="font-bold text-gray-700">{b.b_id}</span>
                                            <span className="text-sm text-gray-500">{b.pickup}</span>
                                        </div>
                                        <div className="mt-1 text-sm text-gray-600">
                                            To: {b.p_city} &rarr; {b.d_place}
                                        </div>
                                        <div className="mt-1 text-xs text-gray-500">
                                            Customer: {b.b_name} ({b.m_no})
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Drivers List */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-medium mb-4">Available Drivers</h2>
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Search Driver ID or Mobile..."
                            className="w-full border rounded p-2"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="overflow-y-auto max-h-96">
                        {filteredDrivers.length === 0 ? (
                            <p className="text-gray-500">No available drivers found.</p>
                        ) : (
                            <ul className="divide-y divide-gray-200">
                                {filteredDrivers.map(d => (
                                    <li
                                        key={d.id}
                                        className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedDriver?.id === d.id ? 'bg-green-50 border-l-4 border-green-500' : ''}`}
                                        onClick={() => setSelectedDriver(d)}
                                    >
                                        <div className="flex justify-between">
                                            <span className="font-bold text-gray-700">{d.id_emp}</span>
                                            <span className="text-sm text-gray-500">{d.emp_mobile}</span>
                                        </div>
                                        <div className="mt-1 text-sm text-gray-600">
                                            Vacant: {d.vacant_place} | Time: {d.login_time}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4 border-t border-gray-200">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="text-gray-700">
                        Selected: <span className="font-bold">{selectedBooking ? selectedBooking.b_id : 'None'}</span> + <span className="font-bold">{selectedDriver ? selectedDriver.id_emp : 'None'}</span>
                    </div>
                    <button
                        onClick={handleAssign}
                        disabled={!selectedBooking || !selectedDriver || loading}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
                    >
                        {loading ? 'Assigning...' : 'Assign Now'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssignLater;
