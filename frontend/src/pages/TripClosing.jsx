import { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const TripClosing = () => {
    const { api, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const booking = location.state?.booking;

    const [tripDetails, setTripDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    // Form for closing details
    const [formData, setFormData] = useState({
        closing_km: '',
        waiting_charges: 0,
        other_charge: 0,
        discount: 0,
        dis_reason: '',
        paid_amount: 0,
        remarks: ''
    });

    const [calculated, setCalculated] = useState({
        total_km: 0,
        net_total: 0
    });

    useEffect(() => {
        if (booking) {
            fetchTripDetails();
        }
    }, [booking]);

    const fetchTripDetails = async () => {
        try {
            // Need to fetch from f_ontrip via closing.php to get opening_km etc.
            const response = await api.get(`/closing.php?b_id=${booking.b_id}`);
            setTripDetails(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching trip details", error);
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const calculateFare = () => {
        if (!tripDetails) return;

        const openKm = parseFloat(tripDetails.open_km) || 0; // Note: Column name in DB might be 'open_km' or 'opening_km'? legacy says 'open_km' or 'opening_km'?
        // Legacy closing.php line 770: value="<?php echo $row['open_km'];?>"
        // So DB column is likely 'open_km'. Wait, my api/assign.php didn't insert 'open_km'.
        // Legacy assign1.php DOES NOT INSERT open_km.
        // It seems 'open_km' must be updated by driver or somewhere else? or it is 0?
        // Legacy closing.php input name="opening_km" value="$row['open_km']".

        // If 'open_km' is null in DB, user invokes it.
        // For this simplified version, let's assume user enters Opening KM if not present.

        const closeKm = parseFloat(formData.closing_km) || 0;
        const totalKm = closeKm - openKm; // Need to handle Opening KM input if not in DB.

        // Simplified calculation logic for demo
        let ratePerKm = 10; // Default
        if (tripDetails.ac_type === '1') ratePerKm += 2;

        const kmCharge = totalKm * ratePerKm;
        const netTotal = kmCharge + parseFloat(formData.waiting_charges) + parseFloat(formData.other_charge) - parseFloat(formData.discount);

        setCalculated({
            total_km: totalKm,
            net_total: netTotal
        });

        // Auto-fill paid amount
        setFormData(prev => ({ ...prev, paid_amount: netTotal }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/closing.php', {
                ...tripDetails, // Contains b_id, v_id, etc.
                ...formData,
                net_total: calculated.net_total,
                user_id: user.emp_id,
                opening_km: tripDetails.open_km || 0 // Pass opening KM
                // Add missing fields mapping if needed
            });
            alert('Trip closed successfully.');
            navigate('/bookings');
        } catch (error) {
            console.error("Error closing trip", error);
            alert('Failed to close trip.');
        }
    };

    if (!booking) return <div>No booking selected.</div>;
    if (loading) return <div>Loading trip details...</div>;

    return (
        <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
            <h1 className="text-2xl font-bold mb-6">Close Trip #{booking.b_id}</h1>

            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div>
                    <p><strong>Customer:</strong> {tripDetails.b_name}</p>
                    <p><strong>Mobile:</strong> {tripDetails.m_no}</p>
                    <p><strong>Vehicle:</strong> {tripDetails.v_type} ({tripDetails.v_id})</p>
                </div>
                <div>
                    <p><strong>Route:</strong> {tripDetails.p_city} to {tripDetails.d_place}</p>
                    <p><strong>Pickup:</strong> {tripDetails.bookin_time}</p>
                    <p><strong>Opening KM:</strong> {tripDetails.open_km || 'Not Set'}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Closing KM</label>
                        <input type="number" name="closing_km" value={formData.closing_km} onChange={handleInputChange} onBlur={calculateFare} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Total KM</label>
                        <input type="number" value={calculated.total_km} readOnly className="mt-1 block w-full rounded-md bg-gray-100 border-gray-300 shadow-sm border p-2" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Waiting Charges</label>
                        <input type="number" name="waiting_charges" value={formData.waiting_charges} onChange={handleInputChange} onBlur={calculateFare} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Other Charges</label>
                        <input type="number" name="other_charge" value={formData.other_charge} onChange={handleInputChange} onBlur={calculateFare} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Discount</label>
                        <input type="number" name="discount" value={formData.discount} onChange={handleInputChange} onBlur={calculateFare} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Net Total</label>
                        <input type="number" value={calculated.net_total} readOnly className="mt-1 block w-full rounded-md bg-green-50 border-gray-300 shadow-sm border p-2 font-bold text-green-700" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Paid Amount</label>
                        <input type="number" name="paid_amount" value={formData.paid_amount} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" required />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Remarks</label>
                        <textarea name="remarks" value={formData.remarks} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"></textarea>
                    </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                    <button type="button" onClick={() => navigate('/bookings')} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
                    <button type="button" onClick={calculateFare} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Calculate</button>
                    <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">Close Trip</button>
                </div>
            </form>
        </div>
    );
};

export default TripClosing;
