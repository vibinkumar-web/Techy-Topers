import { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';

const EditTrip = () => {
    const { api, user } = useContext(AuthContext);
    const [bookingId, setBookingId] = useState('');
    const [tripData, setTripData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({});

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Fetch all closed bookings from reports and find the ID (Workaround for missing GET endpoint)
            const response = await api.get('/reports.php?type=booking&from_date=2000-01-01&to_date=2099-12-31');
            const foundTrip = response.data.find(t => t.b_id == bookingId);

            if (foundTrip) {
                setTripData(foundTrip);
                setFormData({
                    ...foundTrip,
                    user_id: user.emp_id
                });
            } else {
                alert("Trip not found.");
                setTripData(null);
            }
        } catch (error) {
            console.error("Error searching trip", error);
            alert("Error searching trip.");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put('/trip_edit.php', { ...formData, b_id: bookingId });
            alert('Trip Updated Successfully!');
            setTripData(null);
            setBookingId('');
            setFormData({});
        } catch (error) {
            console.error("Error updating trip", error);
            alert("Failed to update trip.");
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Closed Trip</h1>

            <div className="bg-white shadow rounded-lg p-6 mb-8">
                <form onSubmit={handleSearch} className="flex gap-4 items-end">
                    <div className="flex-grow">
                        <label className="block text-sm font-medium text-gray-700">Booking ID</label>
                        <input
                            type="text"
                            value={bookingId}
                            onChange={(e) => setBookingId(e.target.value)}
                            className="mt-1 block w-full border rounded-md shadow-sm p-2"
                            placeholder="Enter Booking ID"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
                    >
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </form>
            </div>

            {tripData && (
                <div className="bg-white shadow rounded-lg p-6">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                            <input type="text" name="customer" value={formData.customer || formData.b_name || ''} onChange={handleInputChange} className="mt-1 w-full border rounded p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Mobile</label>
                            <input type="text" name="m_no" value={formData.m_no || ''} onChange={handleInputChange} className="mt-1 w-full border rounded p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Driver Mobile</label>
                            <input type="text" name="d_mobile" value={formData.d_mobile || ''} onChange={handleInputChange} className="mt-1 w-full border rounded p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Pickup Place</label>
                            <input type="text" name="p_city" value={formData.p_city || formData.picup_place || ''} onChange={handleInputChange} className="mt-1 w-full border rounded p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Drop Place</label>
                            <input type="text" name="d_place" value={formData.d_place || formData.drop_place || ''} onChange={handleInputChange} className="mt-1 w-full border rounded p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Net Total</label>
                            <input type="number" name="net_total" value={formData.net_total || ''} onChange={handleInputChange} className="mt-1 w-full border rounded p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Paid Amount</label>
                            <input type="number" name="paid_amount" value={formData.paid_amount || ''} onChange={handleInputChange} className="mt-1 w-full border rounded p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Opening KM</label>
                            <input type="number" name="opening_km" value={formData.opening_km || ''} onChange={handleInputChange} className="mt-1 w-full border rounded p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Closing KM</label>
                            <input type="number" name="closing_km" value={formData.closing_km || ''} onChange={handleInputChange} className="mt-1 w-full border rounded p-2" />
                        </div>

                        <div className="md:col-span-3 flex justify-end">
                            <button
                                type="submit"
                                className="bg-green-600 text-white px-8 py-3 rounded-md hover:bg-green-700"
                            >
                                Update Trip
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default EditTrip;
