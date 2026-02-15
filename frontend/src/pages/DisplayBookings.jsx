import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';

const DisplayBookings = () => {
    const { api } = useContext(AuthContext);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await api.get('/bookings.php');
            if (Array.isArray(response.data)) {
                setBookings(response.data);
            } else {
                setBookings([]);
            }
            setLoading(false);
        } catch (error) {
            console.error("Error fetching bookings", error);
            setBookings([]);
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Display Bookings</h1>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">B-ID</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date/Time</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Pickup</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Drop</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {bookings.length > 0 ? (
                            bookings.map((booking) => (
                                <tr key={booking.b_id} className="hover:bg-gray-50 transition-colors duration-150">
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{booking.b_id}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{booking.pickup}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{booking.b_name} ({booking.m_no})</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{booking.p_city}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{booking.d_place}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${booking.assign === '1' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {booking.assign === '1' ? 'Assigned' : 'Pending'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="px-4 py-3 text-center text-sm text-gray-500">No bookings found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DisplayBookings;
