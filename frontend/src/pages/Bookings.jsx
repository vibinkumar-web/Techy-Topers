import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Bookings = () => {
    const { api, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        pickup: '',
        d_place: '',
        to_whom: '',
        a_no: '',
        cus_count: '1',
        p_city: '',
        r_status: 'Local Tariff',
        m_no: '',
        v_type: '',
        st: '',
        t_type: '0',
        b_name: '',
        ac_type: '',
        b_type: '',
        remarks: ''
    });

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
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMobileBlur = async () => {
        if (formData.m_no.length === 10) {
            try {
                const response = await api.get(`/customers.php?mobile=${formData.m_no}`);
                if (response.data) {
                    setFormData(prev => ({ ...prev, b_name: response.data.b_name }));
                }
            } catch (error) {
                // Customer not found, let user enter name
                console.log("Customer not found");
            }
        }
    };

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData({
            pickup: '', d_place: '', to_whom: '', a_no: '', cus_count: '1',
            p_city: '', r_status: 'Local Tariff', m_no: '', v_type: '',
            st: '', t_type: '0', b_name: '', ac_type: '', b_type: '', remarks: ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // First ensure customer exists/update
            await api.post('/customers.php', { m_no: formData.m_no, b_name: formData.b_name });

            // Create booking
            await api.post('/bookings.php', { ...formData, user_id: user.emp_id });

            fetchBookings();
            closeModal();
        } catch (error) {
            console.error("Error creating booking", error);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
                <button
                    onClick={openModal}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                    New Booking
                </button>
            </div>

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
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {Array.isArray(bookings) && bookings.map((booking) => (
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
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                    {booking.assign === '1' && (
                                        <button
                                            onClick={() => navigate('/trip-closing', { state: { booking } })}
                                            className="text-green-600 hover:text-green-900 mr-4 font-medium"
                                        >
                                            Close Trip
                                        </button>
                                    )}
                                    <button
                                        onClick={() => navigate('/cancel-booking', { state: { booking } })}
                                        className="text-red-600 hover:text-red-900 font-medium"
                                    >
                                        Cancel
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
                    <div className="bg-white p-5 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">New Booking</h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Customer Info */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile No</label>
                                <input type="text" name="m_no" value={formData.m_no} onChange={handleInputChange} onBlur={handleMobileBlur} maxLength="10"
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                                <input type="text" name="b_name" value={formData.b_name} onChange={handleInputChange}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Alternate No</label>
                                <input type="text" name="a_no" value={formData.a_no} onChange={handleInputChange}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                            </div>

                            {/* Trip Details */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Date & Time</label>
                                <input type="datetime-local" name="pickup" value={formData.pickup} onChange={handleInputChange}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Pickup City</label>
                                <input type="text" name="p_city" value={formData.p_city} onChange={handleInputChange}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Drop Place</label>
                                <input type="text" name="d_place" value={formData.d_place} onChange={handleInputChange}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Landmark</label>
                                <input type="text" name="st" value={formData.st} onChange={handleInputChange}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                            </div>

                            {/* Requirements */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                                <select name="v_type" value={formData.v_type} onChange={handleInputChange}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" required>
                                    <option value="">Select Type</option>
                                    <option value="Mini">Mini</option>
                                    <option value="Sedan">Sedan</option>
                                    <option value="SUV">SUV</option>
                                    <option value="Innova">Innova</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">AC Type</label>
                                <select name="ac_type" value={formData.ac_type} onChange={handleInputChange}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
                                    <option value="">Select AC</option>
                                    <option value="1">AC</option>
                                    <option value="0">Non-AC</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Trip Type</label>
                                <select name="t_type" value={formData.t_type} onChange={handleInputChange}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
                                    <option value="0">Drop</option>
                                    <option value="1">Round Trip</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Passenger Count</label>
                                <select name="cus_count" value={formData.cus_count} onChange={handleInputChange}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
                                    {[...Array(10)].map((_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rental Status</label>
                                <select name="r_status" value={formData.r_status} onChange={handleInputChange}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
                                    <option value="Local Tariff">Local Tariff</option>
                                    <option value="Out Station Tariff">Out Station Tariff</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Company / To Whom</label>
                                <input type="text" name="to_whom" value={formData.to_whom} onChange={handleInputChange}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                            </div>

                            {/* Remarks */}
                            <div className="col-span-1 md:col-span-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                                <textarea name="remarks" value={formData.remarks} onChange={handleInputChange}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" rows="3"></textarea>
                            </div>

                            <div className="col-span-1 md:col-span-3 flex justify-end space-x-3 mt-4">
                                <button type="button" onClick={closeModal} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
                                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Save Booking</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Bookings;
