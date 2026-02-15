import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';

const AdvanceBookings = () => {
    const { api } = useContext(AuthContext);
    // 1. Ensure bookings state is always initialized as an empty array.
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAdvanceBookings = async () => {
            try {
                const response = await api.get('/advance_bookings.php');
                // 2. When fetching data from API, correctly extract the array from response.
                // 3. If API returns an object, convert or assign the correct array field.
                let data = response.data;

                // 9. Add fallback empty array if response is invalid.
                if (data && Array.isArray(data)) {
                    setBookings(data);
                } else if (data && typeof data === 'object' && Array.isArray(data.bookings)) {
                    // Handle case where API might return { bookings: [...] }
                    setBookings(data.bookings);
                } else {
                    console.warn("API response is not an array:", data);
                    setBookings([]);
                }
            } catch (error) {
                console.error("Error fetching advance bookings", error);
                setBookings([]);
            } finally {
                setLoading(false);
            }
        };
        fetchAdvanceBookings();
    }, [api]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Advance Bookings (Future & Unassigned)</h1>
            <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">B-ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pickup</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Drop</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan="7" className="text-center py-4">Loading...</td></tr>
                        ) : (
                            // 4. Add safety check using Array.isArray before calling map.
                            // 5. Prevent UI crash if data is null or undefined.
                            Array.isArray(bookings) && bookings.length > 0 ? (
                                bookings.map((booking) => (
                                    <tr key={booking.b_id || Math.random()}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.b_id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.b_date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.pickup_time}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.cus_name} ({booking.cus_mobile})</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.pickup}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.drop_place}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.v_types}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="7" className="text-center py-4">No advance bookings found.</td></tr>
                            )
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdvanceBookings;
