import { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';

const EditBooking = () => {
    const { api } = useContext(AuthContext);
    const [bookingId, setBookingId] = useState('');
    const [bookingData, setBookingData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({});

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Workaround: Fetch all bookings via reports logic and find locally
            // OR use a specific GET endpoint. 
            // Accessing `bookings.php`? It fetches latest. 
            // Let's use `reports.php?type=booking` again as it returns all booking history/active.
            const response = await api.get('/reports.php?type=booking&from_date=2000-01-01&to_date=2099-12-31');
            const found = response.data.find(b => b.b_id == bookingId);

            if (found) {
                setBookingData(found);
                setFormData(found);
            } else {
                alert("Booking not found.");
                setBookingData(null);
            }
        } catch (error) {
            console.error("Error searching booking", error);
            alert("Error searching booking.");
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
            await api.put('/booking_edit.php', { ...formData, b_id: bookingId });
            alert('Booking Updated Successfully!');
            setBookingData(null);
            setBookingId('');
            setFormData({});
        } catch (error) {
            console.error("Error updating booking", error);
            alert("Failed to update booking.");
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Booking</h1>

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

            {bookingData && (
                <div className="bg-white shadow rounded-lg p-6">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                            <input type="text" name="cus_name" value={formData.cus_name || ''} onChange={handleInputChange} className="mt-1 w-full border rounded p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Mobile</label>
                            <input type="text" name="cus_mobile" value={formData.cus_mobile || ''} onChange={handleInputChange} className="mt-1 w-full border rounded p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Pickup Place</label>
                            <input type="text" name="pickup" value={formData.pickup || ''} onChange={handleInputChange} className="mt-1 w-full border rounded p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Pickup Time</label>
                            <input type="datetime-local" name="pickup_time" value={formData.pickup_time || ''} onChange={handleInputChange} className="mt-1 w-full border rounded p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Drop Place</label>
                            <input type="text" name="drop_place" value={formData.drop_place || ''} onChange={handleInputChange} className="mt-1 w-full border rounded p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Vehicle Type</label>
                            <input type="text" name="v_types" value={formData.v_types || ''} onChange={handleInputChange} className="mt-1 w-full border rounded p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Booking Type</label>
                            <select name="b_type" value={formData.b_type || ''} onChange={handleInputChange} className="mt-1 w-full border rounded p-2">
                                <option value="0">Current</option>
                                <option value="1">Advance</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">A/C Type</label>
                            <select name="ac_type" value={formData.ac_type || ''} onChange={handleInputChange} className="mt-1 w-full border rounded p-2">
                                <option value="AC">AC</option>
                                <option value="Non AC">Non AC</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Remarks</label>
                            <input type="text" name="remarks" value={formData.remarks || ''} onChange={handleInputChange} className="mt-1 w-full border rounded p-2" />
                        </div>

                        <div className="md:col-span-2 flex justify-end">
                            <button
                                type="submit"
                                className="bg-green-600 text-white px-8 py-3 rounded-md hover:bg-green-700"
                            >
                                Update Booking
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default EditBooking;
