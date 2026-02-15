import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';

const AdvanceBooking = () => {
    const { api } = useContext(AuthContext);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await api.get('/advance_booking.php');
                setBookings(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching advance bookings", error);
                setLoading(false);
            }
        };

        fetchBookings();
    }, [api]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Advance Bookings (Future Trips)</h1>

            <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">B-ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pickup</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Drop</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan="9" className="text-center py-4">Loading...</td></tr>
                        ) : bookings.length === 0 ? (
                            <tr><td colSpan="9" className="text-center py-4">No future advance bookings found.</td></tr>
                        ) : (
                            bookings.map((booking) => (
                                <tr key={booking.b_id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.b_id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.b_date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.pickup}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.p_city}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.d_place}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.v_type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.b_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.m_no}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button className="text-indigo-600 hover:text-indigo-900">Assign Later</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdvanceBooking;
