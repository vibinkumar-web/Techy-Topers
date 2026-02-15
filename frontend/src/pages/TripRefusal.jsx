import { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const TripRefusal = () => {
    const { api, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [bookingId, setBookingId] = useState('');
    const [vehicleId, setVehicleId] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/trip_refusal.php', {
                b_id: bookingId,
                v_id: vehicleId,
                reason: reason,
                user_id: user.emp_id
            });
            alert('Trip Refused Successfully. Vehicle is now free.');
            navigate('/assignments'); // Redirect to assignments to re-assign?
        } catch (error) {
            console.error("Error refusing trip", error);
            alert("Failed to refuse trip.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
            <h1 className="text-xl font-bold text-red-600 mb-6 text-center">Trip Refusal Form</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Booking ID</label>
                    <input
                        type="text"
                        value={bookingId}
                        onChange={(e) => setBookingId(e.target.value)}
                        className="mt-1 block w-full border rounded-md shadow-sm p-2"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Vehicle ID (Refusing)</label>
                    <input
                        type="text"
                        value={vehicleId}
                        onChange={(e) => setVehicleId(e.target.value)}
                        className="mt-1 block w-full border rounded-md shadow-sm p-2"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Reason</label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="mt-1 block w-full border rounded-md shadow-sm p-2"
                        rows="3"
                        required
                    ></textarea>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                >
                    {loading ? 'Processing...' : 'Refuse Trip'}
                </button>
            </form>
        </div>
    );
};

export default TripRefusal;
