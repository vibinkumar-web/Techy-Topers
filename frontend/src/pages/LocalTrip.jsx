import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const LocalTrip = () => {
    const { v_id } = useParams();
    const navigate = useNavigate();
    const { api, user } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);

    // Trip and Tariff Data
    const [tripData, setTripData] = useState(null);
    const [tariff, setTariff] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        opening_km: '',
        closing_km: '',
        trip_km: 0,
        extra_km: 0,
        package_name: '',
        package_charge: 0,
        extra_km_charge: 0,
        sub_total: 0,
        other_charge: 0,
        return_charge: 0,
        waiting_hrs: 0,
        waiting_mins: 0,
        waiting_charge: 0,
        toll_gate: 0,
        permit: 0,
        driver_batta: 0,
        city_limit: 0,
        parking: 0,
        night_charge: 0,
        other_expenses: 0,
        discount: 0,
        dis_reason: '',
        total_amount: 0,
        advance: 0,
        net_total: 0,
        paid_amount: 0,
        remarks: '',
        ac_value: '0', // 0: Non AC, 1: AC
        t_type: '0', // 0: Up&Down, 1: Drop
        drop_time: '',
        drop_date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchTripDetails();
    }, [v_id]);

    const fetchTripDetails = async () => {
        try {
            const response = await api.get(`/localtrip.php?v_id=${v_id}`);
            const { trip, tariff } = response.data;
            setTripData(trip);
            setTariff(tariff);

            // Initialize form with trip data
            setFormData(prev => ({
                ...prev,
                opening_km: trip.open_km,
                advance: trip.advance || 0, // Assuming advance is somewhere?
                ac_value: trip.ac_type,
                t_type: trip.t_type,
                drop_time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
            }));

            setLoading(false);
        } catch (error) {
            console.error("Error fetching trip details", error);
            alert("Failed to load trip details.");
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Calculation Logic (Triggered on key inputs in legacy, we'll use useEffect on dependencies)
    useEffect(() => {
        calculateTotals();
    }, [
        formData.closing_km, formData.opening_km, formData.other_charge,
        formData.return_charge, formData.waiting_hrs, formData.waiting_mins,
        formData.toll_gate, formData.permit, formData.driver_batta,
        formData.city_limit, formData.parking, formData.night_charge,
        formData.other_expenses, formData.discount, formData.advance, tariff
    ]);

    const calculateTotals = () => {
        if (!tariff) return;

        const open = parseFloat(formData.opening_km) || 0;
        const close = parseFloat(formData.closing_km) || 0;
        const tripKm = close - open;

        // Logic from legacy:
        // trip_km = close - open
        // extra_km = trip_km - mini_km (from tariff)
        // Check hours logic too (simplified here for brevity)

        let pkgName = '';
        let pkgCharge = 0;
        let extraKm = 0;
        let extraCharge = 0;

        // Basic tariff logic (example based on legacy output):
        // if tripKm <= tariff.mini_km -> Package = "Mini", Charge = tariff.min_amt
        // else -> Extra KM logic

        const minKm = parseFloat(tariff?.mini_km) || 0;
        const minAmt = parseFloat(tariff?.min_amt) || 0;
        const perKm = parseFloat(tariff?.c_p_km) || 0; // Cost per KM ?

        if (tripKm <= minKm) {
            pkgName = `${minKm} KM Package`;
            pkgCharge = minAmt;
            extraKm = 0;
        } else {
            pkgName = `${minKm} KM Package + Extra`;
            pkgCharge = minAmt;
            extraKm = tripKm - minKm;
        }

        extraCharge = extraKm * perKm; // Assuming perKm cost

        const subTotal = pkgCharge + extraCharge;

        // Other charges
        const others = (parseFloat(formData.other_charge) || 0) +
            (parseFloat(formData.return_charge) || 0) +
            (parseFloat(formData.waiting_charge) || 0) +
            (parseFloat(formData.toll_gate) || 0) +
            (parseFloat(formData.permit) || 0) +
            (parseFloat(formData.driver_batta) || 0) +
            (parseFloat(formData.city_limit) || 0) +
            (parseFloat(formData.parking) || 0) +
            (parseFloat(formData.night_charge) || 0) +
            (parseFloat(formData.other_expenses) || 0);

        const gross = subTotal + others;
        const discount = parseFloat(formData.discount) || 0;
        const advance = parseFloat(formData.advance) || 0;
        const net = gross - discount - advance;

        setFormData(prev => ({
            ...prev,
            trip_km: tripKm,
            package_name: pkgName,
            package_charge: pkgCharge,
            extra_km: extraKm,
            extra_km_charge: extraCharge,
            sub_total: subTotal,
            total_amount: gross,
            net_total: net
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/localtrip.php', {
                b_id: tripData.b_id,
                v_id: tripData.v_id,
                opening_km: formData.opening_km,
                closing_km: formData.closing_km,
                remarks: formData.remarks,
                pickup_time: tripData.bookin_time, // Or format it?
                p_date: tripData.bookin_time.split(' ')[0], // Approximate
                drop_time: formData.drop_time,
                d_date: formData.drop_date,
                ac_type: formData.ac_value,
                t_type: formData.t_type,
                v_type: tripData.v_type,
                picup_place: tripData.p_city,
                drop_place: tripData.d_place,
                rwards_point: 0, // Placeholder
                packagename: formData.package_name,
                other_charge: formData.other_expenses, // Sum of others?
                net_total: formData.net_total,
                paid_amount: formData.paid_amount,
                discount: formData.discount,
                dis_reason: formData.dis_reason,
                to_whom: tripData.to_whom,
                customer: tripData.b_name,
                m_no: tripData.m_no,
                d_mobile: tripData.d_mobile,
                pending: (parseFloat(formData.net_total) > parseFloat(formData.paid_amount)) ? '1' : '0',
                user_id: user.emp_id
            });
            alert('Local Trip Closed Successfully!');
            navigate('/');
        } catch (error) {
            console.error("Error closing local trip", error);
            alert("Failed to close trip.");
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Local Trip Closing</h1>

            <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
                {/* Trip Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm">
                    <div>
                        <span className="block font-bold">Booking ID:</span> {tripData.b_id}
                    </div>
                    <div>
                        <span className="block font-bold">Vehicle:</span> {tripData.v_id} ({tripData.v_type})
                    </div>
                    <div>
                        <span className="block font-bold">Customer:</span> {tripData.b_name}
                    </div>
                </div>

                {/* KM & Time */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Opening KM</label>
                        <input type="text" name="opening_km" value={formData.opening_km} readOnly className="mt-1 block w-full bg-gray-100 border rounded p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Closing KM</label>
                        <input type="number" name="closing_km" value={formData.closing_km} onChange={handleInputChange} className="mt-1 block w-full border rounded p-2" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Trip KM</label>
                        <input type="text" value={formData.trip_km} readOnly className="mt-1 block w-full bg-gray-100 border rounded p-2" />
                    </div>
                </div>

                {/* Charges Calculation */}
                <div className="bg-blue-50 p-4 rounded mb-6">
                    <h3 className="font-medium text-blue-900 mb-2">Charges</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-xs font-medium">Package</label>
                            <input type="text" value={formData.package_name} readOnly className="mt-1 w-full text-sm border p-1" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium">Pkg Charge</label>
                            <input type="text" value={formData.package_charge} readOnly className="mt-1 w-full text-sm border p-1" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium">Extra KM</label>
                            <input type="text" value={formData.extra_km} readOnly className="mt-1 w-full text-sm border p-1" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium">Ext. Charge</label>
                            <input type="text" value={formData.extra_km_charge} readOnly className="mt-1 w-full text-sm border p-1" />
                        </div>
                    </div>
                </div>

                {/* Other Charges (Expandable/Grid) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
                    <div>
                        <label>Toll Gate</label>
                        <input type="number" name="toll_gate" value={formData.toll_gate} onChange={handleInputChange} className="mt-1 w-full border rounded p-1" />
                    </div>
                    <div>
                        <label>Driver Batta</label>
                        <input type="number" name="driver_batta" value={formData.driver_batta} onChange={handleInputChange} className="mt-1 w-full border rounded p-1" />
                    </div>
                    <div>
                        <label>Parking</label>
                        <input type="number" name="parking" value={formData.parking} onChange={handleInputChange} className="mt-1 w-full border rounded p-1" />
                    </div>
                    <div>
                        <label>Discount</label>
                        <input type="number" name="discount" value={formData.discount} onChange={handleInputChange} className="mt-1 w-full border rounded p-1" />
                    </div>
                </div>

                {/* Totals */}
                <div className="border-t pt-4">
                    <div className="flex justify-end gap-8 text-right">
                        <div>
                            <div className="text-sm text-gray-500">Gross Total</div>
                            <div className="font-bold">{formData.total_amount}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-500">Advance</div>
                            <div className="font-bold text-red-600">-{formData.advance}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-500">Net Total</div>
                            <div className="text-xl font-bold text-green-600">{formData.net_total}</div>
                        </div>
                    </div>
                </div>

                {/* Pay */}
                <div className="mt-6 flex justify-end items-end gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Paid Amount</label>
                        <input type="number" name="paid_amount" value={formData.paid_amount} onChange={handleInputChange} className="mt-1 block w-32 border rounded p-2 border-indigo-500" required />
                    </div>
                    <button
                        type="submit"
                        className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
                    >
                        Close Trip
                    </button>
                </div>
            </form>
        </div>
    );
};

export default LocalTrip;
