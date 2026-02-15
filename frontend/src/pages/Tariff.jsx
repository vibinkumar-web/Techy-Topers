import { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';

const Tariff = () => {
    const { api } = useContext(AuthContext);
    const [selectedVehicle, setSelectedVehicle] = useState('');
    const [tariffData, setTariffData] = useState({});
    const [loading, setLoading] = useState(false);

    // Vehicle Types from legacy tariff.php
    const vehicleTypes = [
        { id: 1, name: 'Indica' },
        { id: 2, name: 'Xcent' },
        { id: 3, name: 'Zest' },
        { id: 4, name: 'Etios' },
        { id: 5, name: 'Swift' },
        { id: 6, name: 'TUV 300' },
        { id: 7, name: 'Tavera' },
        { id: 8, name: 'Xylo' },
        { id: 9, name: 'Tempo' }
    ];

    useEffect(() => {
        if (selectedVehicle) {
            fetchTariff();
        } else {
            setTariffData({});
        }
    }, [selectedVehicle]);

    const fetchTariff = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/tariff.php?v_id=${selectedVehicle}`);
            setTariffData(response.data);
        } catch (error) {
            console.error("Error fetching tariff", error);
            // Initialize with empty if not found
            setTariffData({});
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTariffData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/tariff.php', {
                v_id: selectedVehicle,
                ...tariffData
            });
            alert('Tariff updated successfully.');
        } catch (error) {
            console.error("Error updating tariff", error);
            alert('Failed to update tariff.');
        }
    };

    // Helper to render input field
    const renderInput = (label, name) => (
        <div className="mb-2">
            <label className="block text-xs font-medium text-gray-700">{label}</label>
            <input
                type="text"
                name={name}
                value={tariffData[name] || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-1 text-sm"
            />
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Out-Station Tariff</h1>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Vehicle Type</label>
                <select
                    value={selectedVehicle}
                    onChange={(e) => setSelectedVehicle(e.target.value)}
                    className="block w-64 rounded-md border-gray-300 shadow-sm border p-2"
                >
                    <option value="">Select Vehicle</option>
                    {vehicleTypes.map(v => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                </select>
            </div>

            {selectedVehicle && (
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow">
                    {loading ? (
                        <div>Loading rates...</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Column 1 */}
                            <div>
                                <h3 className="font-bold mb-4 text-indigo-600">Standard Packages</h3>
                                {renderInput("02 Hours & 20 Km", "a1")}
                                {renderInput("04 Hours & 70 Km", "a2")}
                                {renderInput("05 Hours & 120 Km", "a3")}
                                {renderInput("06 Hours & 170 Km", "a4")}
                                {renderInput("07 Hours & 220 Km", "a5")}
                                {renderInput("09 Hours & 270 Km", "a6")}
                                {renderInput("11 Hours & 320 Km", "a7")}
                                {renderInput("12 Hours & 370 Km", "a8")}
                                {renderInput("14 Hours & 420 Km", "a9")}
                                {renderInput("16 Hours & 470 Km", "a10")}
                                {renderInput("17 Hours & 520 Km", "a11")}
                                {renderInput("19 Hours & 570 Km", "a12")}
                                {renderInput("21 Hours & 620 Km", "a13")}
                                {renderInput("23 Hours & 670 Km", "a14")}
                                {renderInput("24 Hours & 720 Km", "a15")}
                                {renderInput("27 Hours & 770 Km", "a16")}
                                {renderInput("29 Hours & 820 Km", "a17")}
                                {renderInput("32 Hours & 870 Km", "a18")}
                            </div>

                            {/* Column 2 */}
                            <div>
                                <h3 className="font-bold mb-4 text-indigo-600">Short/Mid Packages</h3>
                                {renderInput("Below 50 km", "a19")}
                                {renderInput("03 Hours & 30 Km", "a20")}
                                {renderInput("04 Hours & 80 Km", "a21")}
                                {renderInput("05 Hours & 130 Km", "a22")}
                                {renderInput("06 Hours & 180 Km", "a23")}
                                {renderInput("08 Hours & 230 Km", "a24")}
                                {renderInput("09 Hours & 280 Km", "a25")}
                                {renderInput("11 Hours & 330 Km", "a26")}
                                {renderInput("13 Hours & 380 Km", "a27")}
                                {renderInput("14 Hours & 430 Km", "a28")}
                                {renderInput("16 Hours & 480 Km", "a29")}
                                {renderInput("18 Hours & 530 Km", "a30")}
                                {renderInput("19 Hours & 580 Km", "a31")}
                                {renderInput("21 Hours & 630 Km", "a32")}
                                {renderInput("23 Hours & 680 Km", "a33")}
                                {renderInput("25 Hours & 730 Km", "a34")}
                                {renderInput("27 Hours & 780 Km", "a35")}
                                {renderInput("30 Hours & 830 Km", "a36")}
                                {renderInput("33 Hours & 880 Km", "a37")}
                            </div>

                            {/* Column 3 */}
                            <div>
                                <h3 className="font-bold mb-4 text-indigo-600">Long Distance / Extra</h3>
                                {renderInput("Rate 50 - 100 Km", "a38")}
                                {renderInput("04 Hours & 50 Km", "a39")} // Corrected mapping from legacy labels
                                {renderInput("04 Hours & 90 Km", "a40")}
                                {renderInput("05 Hours & 140 Km", "a41")}
                                {renderInput("07 Hours & 190 Km", "a42")}
                                {renderInput("08 Hours & 240 Km", "a43")}
                                {renderInput("10 Hours & 300 Km", "a44")}
                                {renderInput("11 Hours & 340 Km", "a45")}
                                {renderInput("13 Hours & 390 Km", "a46")}
                                {renderInput("15 Hours & 450 Km", "a47")}
                                {renderInput("16 Hours & 490 Km", "a48")}
                                {renderInput("18 Hours & 540 Km", "a49")}
                                {renderInput("20 Hours & 590 Km", "a50")}
                                {renderInput("22 Hours & 640 Km", "a51")}
                                {renderInput("23 Hours & 690 Km", "a52")}
                                {renderInput("25 Hours & 740 Km", "a53")}
                                {renderInput("28 Hours & 790 Km", "a54")}
                                {renderInput("30 Hours & 840 Km", "a55")}
                                {renderInput("33 Hours & 890 Km", "a56")}

                                <div className="mt-4 pt-4 border-t">
                                    {renderInput("Rate Above 100 Km", "a57")}
                                    {renderInput("Extra Rate Per Km", "a76")}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 flex justify-center">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-green-600 text-white px-8 py-3 rounded-md hover:bg-green-700 text-lg font-semibold shadow-lg"
                        >
                            Save Rates
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default Tariff;
