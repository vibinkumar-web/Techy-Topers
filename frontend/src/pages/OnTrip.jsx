import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const OnTrip = () => {
    const { api } = useContext(AuthContext);
    const navigate = useNavigate();
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openingKmMap, setOpeningKmMap] = useState({});

    useEffect(() => {
        fetchTrips();
    }, []);

    const fetchTrips = async () => {
        try {
            const response = await api.get('/ontrip.php');
            setTrips(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching on-trip data", error);
            setLoading(false);
        }
    };

    const handleKmChange = (v_id, value) => {
        setOpeningKmMap({ ...openingKmMap, [v_id]: value });
    };

    const handleSaveKm = async (v_id) => {
        const km = openingKmMap[v_id];
        if (!km) {
            alert("Please enter Opening KM");
            return;
        }

        try {
            await api.post('/ontrip.php', {
                action: 'save_opening_km',
                v_id: v_id,
                opening_km: km
            });
            alert("Opening KM Saved Successfully!");
            fetchTrips(); // Refresh to show updated state
        } catch (error) {
            console.error("Error saving KM", error);
            alert(error.response?.data?.message || "Failed to save Opening KM");
        }
    };

    const handleCloseTrip = (trip) => {
        if (!trip.open_km) {
            alert("Opening KM must be saved before closing ticket.");
            return;
        }

        // Check for Local Tariff vs Standard Closing
        if (trip.r_status === 'Local Tariff') {
            // Navigate to Local Trip Closing
            navigate(`/localtrip/${trip.v_id}`);
        } else {
            // Navigate to Standard Trip Closing
            navigate(`/trip-closing/${trip.v_id}`);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">On Trip Dashboard</h1>

            <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opening KM</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan="7" className="text-center py-4">Loading...</td></tr>
                        ) : trips.length === 0 ? (
                            <tr><td colSpan="7" className="text-center py-4">No vehicles currently on trip.</td></tr>
                        ) : (
                            trips.map((trip) => (
                                <tr key={trip.id} className={trip.open_km ? "bg-green-50" : ""}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{trip.b_id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{trip.bookin_time}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="font-medium text-gray-900">{trip.v_id}</div>
                                        <div>{trip.v_type}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{trip.p_city} to {trip.d_place}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div>{trip.b_name}</div>
                                        <div>{trip.m_no}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {trip.open_km ? (
                                            <span className="font-bold text-green-700">{trip.open_km}</span>
                                        ) : (
                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    className="w-24 border rounded px-2 py-1"
                                                    placeholder="KM"
                                                    onChange={(e) => handleKmChange(trip.v_id, e.target.value)}
                                                />
                                                <button
                                                    onClick={() => handleSaveKm(trip.v_id)}
                                                    className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
                                                >
                                                    Save
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => handleCloseTrip(trip)}
                                            className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
                                        >
                                            Close Trip
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OnTrip;
