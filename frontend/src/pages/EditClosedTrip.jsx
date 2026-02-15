import { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';

const EditClosedTrip = () => {
    const { api } = useContext(AuthContext);
    const [bId, setBId] = useState('');
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            const response = await api.get(`/edit_closed_trip.php?b_id=${bId}`);
            setTrip(response.data);
        } catch (error) {
            console.error("Error fetching trip", error);
            setTrip(null);
            setMessage('Trip not found or error fetching.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setTrip({ ...trip, [e.target.name]: e.target.value });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/edit_closed_trip.php', trip);
            setMessage('Trip updated successfully!');
        } catch (error) {
            console.error("Update failed", error);
            setMessage('Update failed: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Closed Trip</h1>

            <div className="bg-white shadow rounded-lg p-6 mb-8">
                <form onSubmit={handleSearch} className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">Booking ID</label>
                        <input
                            type="text"
                            value={bId}
                            onChange={(e) => setBId(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                            placeholder="Enter Booking ID"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 rounded-md hover:bg-blue-700 mt-6"
                    >
                        {loading ? 'Searching...' : 'Find'}
                    </button>
                </form>
                {message && <p className={`mt-4 ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
            </div>

            {trip && (
                <div className="bg-white shadow rounded-lg p-6">
                    <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Opening KM</label>
                            <input type="number" name="opening_km" value={trip.opening_km} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Closing KM</label>
                            <input type="number" name="closing_km" value={trip.closing_km} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Net Total</label>
                            <input type="number" name="net_total" value={trip.net_total} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Paid Amount</label>
                            <input type="number" name="paid_amount" value={trip.paid_amount} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Discount</label>
                            <input type="number" name="discount" value={trip.discount} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Discount Reason</label>
                            <input type="text" name="dis_reason" value={trip.dis_reason} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Remarks</label>
                            <textarea name="remarks" value={trip.remarks} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" rows="3"></textarea>
                        </div>

                        <div className="md:col-span-2 flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
                            >
                                {loading ? 'Updating...' : 'Update Details'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default EditClosedTrip;
