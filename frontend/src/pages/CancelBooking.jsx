import { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const CancelBooking = () => {
    const { api, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const booking = location.state?.booking; // Expect booking passed via navigation state

    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    if (!booking) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error!</strong>
                    <span className="block sm:inline"> No booking selected for cancellation. Please select a booking from the list.</span>
                </div>
                <button onClick={() => navigate('/bookings')} className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md">Go to Bookings</button>
            </div>
        );
    }

    const handleCancel = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/cancel.php', {
                b_id: booking.b_id,
                reason: reason,
                user_id: user.emp_id
            });
            alert('Booking cancelled successfully.');
            navigate('/bookings');
        } catch (error) {
            console.error("Error cancelling booking", error);
            alert('Failed to cancel booking.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
            <h1 className="text-2xl font-bold text-red-600 mb-6">Cancel Booking #{booking.b_id}</h1>

            <div className="mb-4 text-sm text-gray-600">
                <p><strong>Customer:</strong> {booking.b_name}</p>
                <p><strong>Pickup:</strong> {booking.pickup}</p>
                <p><strong>Route:</strong> {booking.p_city} to {booking.d_place}</p>
            </div>

            <form onSubmit={handleCancel}>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="reason">
                        Reason for Cancellation
                    </label>
                    <textarea
                        id="reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        rows="4"
                        placeholder="Enter reason..."
                        required
                    />
                </div>

                <div className="flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => navigate('/bookings')}
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Back
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Cancelling...' : 'Confirm Cancel'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CancelBooking;
