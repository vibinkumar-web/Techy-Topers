import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';

const LocalTripClosing = () => {
    const { api, user } = useContext(AuthContext);
    const [vehicles, setVehicles] = useState([]);
    const [selectedVid, setSelectedVid] = useState('');
    const [tripData, setTripData] = useState(null);
    const [tariffs, setTariffs] = useState([]);
    const [formData, setFormData] = useState({
        closing_km: '',
        paid_amount: '',
        remarks: '',
        discount: '0',
        dis_reason: '',
        other_charge: '0',
        package_name: '',
        ac_type: '0', // 0: Non AC, 1: AC
        net_total: 0
    });

    useEffect(() => {
        fetchVehicles();
        fetchTariffs();
    }, []);

    const fetchVehicles = async () => {
        try {
            const response = await api.get('/local_trip_closing.php');
            setVehicles(response.data);
        } catch (error) {
            console.error("Error fetching vehicles", error);
        }
    };

    const fetchTariffs = async () => {
        try {
            const response = await api.get('/local_trip_closing.php?action=tariffs');
            setTariffs(response.data);
        } catch (error) {
            console.error("Error fetching tariffs", error);
        }
    };

    const handleVehicleSelect = async (e) => {
        const v_id = e.target.value;
        setSelectedVid(v_id);
        if (v_id) {
            try {
                const response = await api.get(`/local_trip_closing.php?v_id=${v_id}`);
                setTripData(response.data);
                // Pre-fill some data if needed
                setFormData(prev => ({ ...prev, ac_type: response.data.ac_type }));
            } catch (error) {
                console.error("Error fetching trip data", error);
            }
        } else {
            setTripData(null);
        }
    };

    const calculateTotal = () => {
        // Basic calculation logic - assumes user enters final amounts or simple math
        // Enhancements can be made to auto-calculate based on tariff packages
        // For now, allow manual override and simple addition
        return parseFloat(formData.net_total || 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!tripData) return;

        const payload = {
            ...tripData,
            ...formData,
            user_id: user?.emp_id || 'admin',
            pickup_time: tripData.bookin_time, // Mapping legacy field
            p_city: tripData.p_city,
            d_place: tripData.d_place,
            rwads_point: '0', // Default
            customer: tripData.b_name
        };

        try {
            await api.post('/local_trip_closing.php', payload);
            alert('Local Trip Closed Successfully');
            setTripData(null);
            setSelectedVid('');
            fetchVehicles();
        } catch (error) {
            console.error("Error closing trip", error);
            alert('Failed to close trip');
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Local Trip Closing</h1>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700">Select Vehicle (On Trip)</label>
                <select value={selectedVid} onChange={handleVehicleSelect} className="mt-1 block w-full border p-2 rounded">
                    <option value="">-- Select Vehicle --</option>
                    {vehicles.map(v => (
                        <option key={v.v_id} value={v.v_id}>{v.v_id}</option>
                    ))}
                </select>
            </div>

            {tripData && (
                <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Booking ID</p>
                            <p className="font-medium">{tripData.b_id}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Customer</p>
                            <p className="font-medium">{tripData.b_name} ({tripData.m_no})</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Opening KM</p>
                            <p className="font-medium">{tripData.open_km}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Pickup Time</p>
                            <p className="font-medium">{tripData.bookin_time}</p>
                        </div>
                    </div>

                    <div className="border-t pt-4 grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Closing KM</label>
                            <input type="number" value={formData.closing_km} onChange={e => setFormData({ ...formData, closing_km: e.target.value })} className="mt-1 w-full border p-2 rounded" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">AC Type</label>
                            <select value={formData.ac_type} onChange={e => setFormData({ ...formData, ac_type: e.target.value })} className="mt-1 w-full border p-2 rounded">
                                <option value="0">Non AC</option>
                                <option value="1">AC</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Package Name</label>
                            <input type="text" value={formData.package_name} onChange={e => setFormData({ ...formData, package_name: e.target.value })} className="mt-1 w-full border p-2 rounded" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Other Charges</label>
                            <input type="number" value={formData.other_charge} onChange={e => setFormData({ ...formData, other_charge: e.target.value })} className="mt-1 w-full border p-2 rounded" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Net Total</label>
                            <input type="number" value={formData.net_total} onChange={e => setFormData({ ...formData, net_total: e.target.value })} className="mt-1 w-full border p-2 rounded" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Paid Amount</label>
                            <input type="number" value={formData.paid_amount} onChange={e => setFormData({ ...formData, paid_amount: e.target.value })} className="mt-1 w-full border p-2 rounded" required />
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">Close Trip</button>
                </form>
            )}
        </div>
    );
};

export default LocalTripClosing;
